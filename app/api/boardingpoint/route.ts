import { NextRequest, NextResponse as res } from "next/server";

export async function GET(req: NextRequest) {
    return res.json({ msg: "Server is running" }, { status: 200 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { resultIndex, Search_Token, userIp } = body;

    if (!resultIndex || !Search_Token || !userIp ) {
        return res.json({ msg: "Add All Necessary Data" }, { status: 400 });
    }

    const buses = await fetch("https://staging.travelxmlapi.com/V3/busservice/busrest/boarding_point", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resultIndex,
            Search_Token,
            userIp,
        }),
    });

    const data = await buses.json();

    return res.json({ msg: "Success", data }, { status: 200 });
}
