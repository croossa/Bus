import { NextRequest, NextResponse as res } from "next/server";

export async function GET(req: NextRequest) {
    return res.json({ msg: "Server is running" }, { status: 200 });
}

export async function POST(req: NextRequest) {

    const url = process.env.API_URL as string;
    const userId = process.env.USERID
    const pwd =process.env.PWD
    // const body = await req.json();

    // const { originId, date, userIp, destinationId } = body;

    // if (!originId || !date || !userIp || !destinationId) {
    //     return res.json({ msg: "Add All Necessary Data" }, { status: 400 });
    // }

    const buses = await fetch(`${url}/Bus_Search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "Auth_Header": {
                "UserId": userId,
                "Password": pwd,
                "Request_Id": "Crossa",
                "IP_Address": "192.168.1.100",
                "IMEI_Number": "123456789"
            },
            "From_City": "102",
            "To_City": "3",
            "TravelDate": "11/26/2025"
        }),
    });

    const data = await buses.json();

    return res.json({ msg: "Success", data }, { status: 200 });
}
