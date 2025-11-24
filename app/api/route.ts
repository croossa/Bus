import { NextRequest, NextResponse as res } from "next/server";

export async function GET(req: NextRequest) {
    return res.json({msg: "Server is running"}, {status: 200})
}