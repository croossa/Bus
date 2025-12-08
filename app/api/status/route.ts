import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.API_URL;
    const userId = process.env.BUS_API_USER_ID;
    const pwd = process.env.BUS_API_PASSWORD;

    if (!url || !userId || !pwd) {
      return NextResponse.json({ msg: "Server config missing" }, { status: 500 });
    }

    const body = await req.json();
    
    // FIX: Changed input to match the API documentation directly
    const { Booking_RefNo } = body; 

    if (!Booking_RefNo) {
        return NextResponse.json({ msg: "Booking_RefNo is required" }, { status: 400 });
    }

    // DEBUG LOG: Request Start
    console.log(`🔍 Checking Status for Booking Ref: ${Booking_RefNo}...`);

    const apiResponse = await fetch(`${url}/Bus_Requery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Auth_Header: {
                UserId: userId,
                Password: pwd,
                Request_Id: `Requery_${Date.now()}`,
                IP_Address: "127.0.0.1", 
                IMEI_Number: "123456789"
            },
            Booking_RefNo: Booking_RefNo
        }),
    });

    // Handle XML/HTML errors gracefully
    const responseText = await apiResponse.text();
    let data;

    try {
        data = JSON.parse(responseText);
        // DEBUG LOG: Response Success
        console.log("✅ Bus_Requery Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Bus_Requery Failed (Invalid JSON):", responseText);
        return NextResponse.json({ msg: "API Error (Invalid JSON)", debug: responseText }, { status: 500 });
    }

    return NextResponse.json({ msg: "Success", data }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Check Status Server Error:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}