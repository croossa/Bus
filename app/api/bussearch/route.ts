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
let cityCache: City[] | null = null;

// --- HELPER: FETCH CITY LIST ---
async function fetchCityList(userId: string, pwd: string, apiUrl: string): Promise<City[]> {
  if (cityCache) return cityCache;

  console.log("🌍 [API CALL] Fetching City List from External API...");

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

    if (!response.ok) throw new Error(`Failed to fetch cities: ${response.statusText}`);

    const data: CityApiResponse = await response.json();

    if (data.CityDetails && Array.isArray(data.CityDetails)) {
      cityCache = data.CityDetails;
      console.log(`✅ [SUCCESS] Cached ${data.CityDetails.length} cities.`);
      return data.CityDetails;
    }
    return [];
  } catch (error) {
    console.error("❌ [EXCEPTION] City List Fetch Error:", error);
    return [];
  }
}

// --- HELPER: SMART CITY MATCHING ---
// This fixes the error by handling "Rajkot (Gujarat)" vs "Rajkot"
function findCityMatch(inputName: string, cityList: City[]): City | undefined {
  const target = inputName.trim().toLowerCase();

  return cityList.find((c) => {
    const dbName = c.CityName.toLowerCase();
    
    // 1. Check Exact Match (e.g., "Surat" === "Surat")
    if (dbName === target) return true;

    // 2. Check "Name (State)" Match (e.g., "Rajkot (Gujarat)" matches "Rajkot")
    const simpleName = dbName.split('(')[0].trim();
    if (simpleName === target) return true;

    return false;
  });
}

// --- GET ROUTE ---
export async function GET(req: NextRequest) {
  return NextResponse.json({ msg: "Server is running" }, { status: 200 });
}

// --- POST ROUTE ---
export async function POST(req: NextRequest) {
  try {
    const url = process.env.API_URL as string;
    const userId = process.env.BUS_API_USER_ID as string;
    const pwd = process.env.BUS_API_PASSWORD as string;

    // 1. Parse Input
    const body = await req.json();
    const { from, to, date } = body;

    console.log("📩 [INPUT]", { from, to, date });

    if (!from || !to || !date) {
      return NextResponse.json({ msg: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Cities
    const allCities = await fetchCityList(userId, pwd, url);

    if (!allCities || allCities.length === 0) {
      return NextResponse.json({ msg: "Internal Error: Could not load city data." }, { status: 500 });
    }

    // 3. Find IDs using the new Smart Matching function
    const fromCity = findCityMatch(from, allCities);
    const toCity = findCityMatch(to, allCities);

    // --- DEBUG LOGGING ---
    if (!fromCity) console.error(`❌ Failed to find FROM city: "${from}"`);
    if (!toCity) console.error(`❌ Failed to find TO city: "${to}"`);
    
    if (fromCity) console.log(`✅ Matched FROM: "${from}" -> ID: ${fromCity.CityID} (${fromCity.CityName})`);
    if (toCity) console.log(`✅ Matched TO: "${to}" -> ID: ${toCity.CityID} (${toCity.CityName})`);
    // ---------------------

    if (!fromCity || !toCity) {
      return NextResponse.json(
        { msg: `Invalid City. Could not find ID for ${!fromCity ? from : to}` },
        { status: 400 }
      );
    }

    // 4. Format Date
    const [year, month, day] = date.split("-");
    const formattedDate = `${month}/${day}/${year}`;

    // 5. Call External API
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
        From_City: "102",//fromCity.CityID.toString()
        To_City: "3",//toCity.CityID.toString()
        TravelDate: formattedDate,
      }),
    });

    const data = await apiResponse.json();
    return NextResponse.json({ msg: "Success", data }, { status: apiResponse.status });

  } catch (error) {
    console.error("🔥 [CRITICAL ERROR]", error);
    return NextResponse.json(
      { msg: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}