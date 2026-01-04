import { NextRequest, NextResponse } from "next/server";

// --- TYPES ---
interface City {
  CityID: number;
  CityName: string;
}

interface CityApiResponse {
  CityDetails: City[];
  Response_Header: {
    Error_Code: string;
    Error_Desc: string;
  };
}

// --- IN-MEMORY CACHE ---
// Stores city list so we don't fetch it on every single search request
let cityCache: City[] | null = null;

// --- HELPER FUNCTION ---
async function fetchCityList(userId: string, pwd: string, apiUrl: string): Promise<City[]> {
  // 1. Return cached data if available to save time
  if (cityCache) return cityCache;

  console.log("Fetching City List from External API...");
  
  try {
    const response = await fetch(`${apiUrl}/Bus_CityList`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Auth_Header: {
          UserId: userId,
          Password: pwd,
          Request_Id: "Crossa_CityList",
          IP_Address: "127.0.0.1",
          IMEI_Number: "123456789",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }

    const data: CityApiResponse = await response.json();
    
    if (data.CityDetails && Array.isArray(data.CityDetails)) {
      cityCache = data.CityDetails; // Save to cache
      return data.CityDetails;
    }
    
    return [];
  } catch (error) {
    console.error("City List Fetch Error:", error);
    return [];
  }
}

// --- GET ROUTE (Health Check) ---
export async function GET(req: NextRequest) {
    return NextResponse.json({ msg: "Server is running" }, { status: 200 });
}

// --- POST ROUTE (Search Logic) ---
export async function POST(req: NextRequest) {
  try {
    const url = process.env.API_URL as string; 
    const userId = process.env.BUS_API_USER_ID as string;
    const pwd = process.env.BUS_API_PASSWORD as string;

    // 1. Parse Frontend Request
    const body = await req.json();
    const { from, to, date } = body;

    if (!from || !to || !date) {
      return NextResponse.json({ msg: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch City List (From Cache or API)
    const allCities = await fetchCityList(userId, pwd, url);

    // 3. Lookup IDs (Case-Insensitive)
    const fromCity = allCities.find(
      (c) => c.CityName.toLowerCase() === from.toLowerCase()
    );
    const toCity = allCities.find(
      (c) => c.CityName.toLowerCase() === to.toLowerCase()
    );

    if (!fromCity || !toCity) {
      return NextResponse.json(
        { msg: `Invalid City. Could not find ID for ${!fromCity ? from : to}` },
        { status: 400 }
      );
    }

    // 4. Format Date (YYYY-MM-DD -> MM/DD/YYYY)
    const [year, month, day] = date.split("-");
    const formattedDate = `${month}/${day}/${year}`;

    console.log(
      `Searching Buses: ${fromCity.CityName} (${fromCity.CityID}) -> ${toCity.CityName} (${toCity.CityID}) on ${formattedDate}`
    );

    // 5. Call External Search API
    const apiResponse = await fetch(`${url}/Bus_Search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Auth_Header: {
          UserId: userId,
          Password: pwd,
          Request_Id: "Crossa_Search",
          IP_Address: "127.0.0.1",
          IMEI_Number: "123456789",
        },
        From_City: `${fromCity.CityID.toString()}` ,  // 102 
        To_City: `${toCity.CityID.toString()}`,  // 3 
        TravelDate: formattedDate,
      }),
    });

    const data = await apiResponse.json();

    return NextResponse.json({ msg: "Success", data }, { status: apiResponse.status });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { msg: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}
