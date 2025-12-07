import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = process.env.API_URL;
    const userId = process.env.BUS_API_USER_ID;
    const pwd = process.env.BUS_API_PASSWORD;

    const body = await req.json();
    const { TicketNo, SeatNos } = body;

    if (!TicketNo) {
        return NextResponse.json({ msg: "Ticket Number is required" }, { status: 400 });
    }

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
            TicketNo: TicketNo,
            SeatNos: SeatNos || "" 
        }),
    });

    const responseText = await apiResponse.text();
    let data;

    try {
        data = JSON.parse(responseText);
    } catch (e) {
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
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}