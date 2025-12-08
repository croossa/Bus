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
    const { 
        Booking_RefNo, 
        BusTicketstoCancel, 
        CancellationCharge_Key 
    } = body;

    // 2. Validate Required Fields
    if (!Booking_RefNo || !BusTicketstoCancel || !CancellationCharge_Key) {
        return NextResponse.json({ msg: "Missing cancellation details (RefNo, Seats, or Key)" }, { status: 400 });
    }

    console.log(`Cancelling Ticket: ${Booking_RefNo}`);

    // 3. Call External API (Bus_Cancellation)
    const apiResponse = await fetch(`${url}/Bus_Cancellation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Auth_Header: {
                UserId: userId,
                Password: pwd,
                Request_Id: `Cancel_${Date.now()}`,
                IP_Address: "127.0.0.1", 
                IMEI_Number: "123456789"
            },
            Booking_RefNo: Booking_RefNo,
            BusTicketstoCancel: BusTicketstoCancel, // Array of { Seat_Number, Ticket_Number, Transport_PNR }
            CancellationCharge_Key: CancellationCharge_Key
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

    if (data.Response_Header?.Error_Code !== "0000") {
         return NextResponse.json({ 
            msg: "Cancellation Failed", 
            error: data.Response_Header?.Error_Desc 
         }, { status: 400 });
    }

    return NextResponse.json({ msg: "Success", data }, { status: 200 });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}