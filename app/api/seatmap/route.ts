import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Get Secrets from Environment
    const url = process.env.API_URL;
    const userId = process.env.BUS_API_USER_ID;
    const pwd = process.env.BUS_API_PASSWORD;

    if (!url || !userId || !pwd) {
      console.error("❌ Missing Environment Variables");
      return NextResponse.json(
        { msg: "Server Misconfiguration: Credentials missing." },
        { status: 500 }
      );
    }

    // 2. Get dynamic parameters sent from the Frontend
    const body = await req.json();
    const { Bus_Key, Search_Key, Boarding_Id, Dropping_Id } = body;

    if (!Bus_Key || !Search_Key) {
      return NextResponse.json(
        { msg: "Missing required fields (Bus_Key, Search_Key)" },
        { status: 400 }
      );
    }

    console.log("Fetching SeatMap for BusKey:", Bus_Key.substring(0, 10) + "...");

    const apiResponse = await fetch(`${url}/Bus_SeatMap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Auth_Header: {
          UserId: userId,
          Password: pwd,
          Request_Id: "Crossa_SeatMap",
          IP_Address: "127.0.0.1",
          IMEI_Number: "123456789",
        },
        Boarding_Id: Boarding_Id,
        Dropping_Id: Dropping_Id,
        Bus_Key: Bus_Key,
        Search_Key: Search_Key,
      }),
    });

    const data = await apiResponse.json();

    // 4. Return Data to Frontend
    return NextResponse.json(
      { msg: "Success", data },
      { status: apiResponse.status }
    );
  } catch (error) {
    console.error("SeatMap API Error:", error);
    return NextResponse.json(
      { msg: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}