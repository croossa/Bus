import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.API_URL;
    const userId = process.env.BUS_API_USER_ID;
    const pwd = process.env.BUS_API_PASSWORD;

    const body = await req.json();
    const { FromDate, ToDate } = body; 
    // Important: API expects format "MM/dd/yyyy" (e.g., "12/28/2025")

    if (!FromDate || !ToDate) {
        return NextResponse.json({ msg: "FromDate and ToDate are required" }, { status: 400 });
    }

    const apiResponse = await fetch(`${url}/Bus_History`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Auth_Header: {
                UserId: userId,
                Password: pwd,
                Request_Id: `History_${Date.now()}`,
                IP_Address: "127.0.0.1", 
                IMEI_Number: "123456789"
            },
            FromDate: FromDate,
            ToDate: ToDate
        }),
    });

    const responseText = await apiResponse.text();
    let data;

    try {
        data = JSON.parse(responseText);
    } catch (e) {
        return NextResponse.json({ msg: "API Error (Invalid JSON)", debug: responseText }, { status: 500 });
    }

    return NextResponse.json({ msg: "Success", data }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}