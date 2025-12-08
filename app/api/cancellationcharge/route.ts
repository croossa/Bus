import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.API_URL;
    const userId = process.env.BUS_API_USER_ID;
    const pwd = process.env.BUS_API_PASSWORD;

    if (!url || !userId || !pwd) {
        return NextResponse.json({ msg: "Server config missing" }, { status: 500 });
    }

    // 1. Get Data from Frontend
    const body = await req.json();
    const { Booking_RefNo, CancelTicket_Details } = body; 

    // 2. Validate Input
    if (!Booking_RefNo || !CancelTicket_Details || !Array.isArray(CancelTicket_Details)) {
        return NextResponse.json({ msg: "Booking Ref No and Ticket Details are required" }, { status: 400 });
    }

    console.log(`Calculating Cancellation Charges for: ${Booking_RefNo}`);

    // 3. Call External API (Bus_CancellationCharge)
    const apiResponse = await fetch(`${url}/Bus_CancellationCharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Auth_Header: {
                UserId: userId,
                Password: pwd,
                Request_Id: `CancelCheck_${Date.now()}`,
                IP_Address: "127.0.0.1", 
                IMEI_Number: "123456789"
            },
            Booking_RefNo: Booking_RefNo,
            CancelTicket_Details: CancelTicket_Details
        }),
    });

    // 4. Handle Response
    const responseText = await apiResponse.text();
    let data;

    try {
        data = JSON.parse(responseText);
        console.log(data)
    } catch (e) {
        console.error("❌ API Returned Invalid JSON:", responseText);
        return NextResponse.json({ msg: "API Error (Invalid JSON)", debug: responseText }, { status: 500 });
    }

    // Check API Error Code
    if (data.Response_Header?.Error_Code !== "0000") {
        return NextResponse.json({ 
            msg: "Failed to fetch charges", 
            error: data.Response_Header?.Error_Desc 
        }, { status: 400 });
    }

    // 5. Send Data to Frontend
    // The frontend will receive 'CancellationPenaltyValues', 'ServiceCharge', and 'CancellationCharge_Key'
    return NextResponse.json({ msg: "Success", data }, { status: 200 });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}