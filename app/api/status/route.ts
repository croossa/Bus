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
    const { Order_Key, RefNo } = body; 

    // According to docs, Order_Key is mandatory to check status
    if (!Order_Key) {
        return NextResponse.json({ msg: "Order Key is required" }, { status: 400 });
    }

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
            Order_Key: Order_Key,
            RefNo: RefNo || "" // Optional Payment Reference
        }),
    });

    // Handle XML/HTML errors gracefully
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