import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest) {
  try {
    // 0. Connect to Database
    await connectDB();

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
            BusTicketstoCancel: BusTicketstoCancel, 
            CancellationCharge_Key: CancellationCharge_Key
        }),
    });

    // 4. Handle Response
    const responseText = await apiResponse.text();
    let data;

    try {
        data = JSON.parse(responseText);
        console.log("Bus API Response:", data);
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

    // ---------------------------------------------------------
    // STEP 5: UPDATE STATUS IN MONGODB (New Addition)
    // ---------------------------------------------------------
    try {
        // Find the booking by RefNo and update status
        const updatedBooking = await Booking.findOneAndUpdate(
            { bookingRefNo: Booking_RefNo },
            { 
                $set: { status: "Cancel - Payment Left" } 
            },
            { new: true } // Return the updated document (optional)
        );

        if (!updatedBooking) {
            console.warn(`⚠️ Warning: Booking ${Booking_RefNo} cancelled in Bus API but not found in MongoDB.`);
        } else {
            console.log(`✅ MongoDB Status Updated: Cancel - Payment Left for ${Booking_RefNo}`);
        }
    } catch (dbError) {
        console.error("⚠️ Failed to update MongoDB status:", dbError);
        // We do NOT stop the response here, because the ticket IS cancelled physically.
        // We just log the error so you can fix it later.
    }

    return NextResponse.json({ msg: "Success", data }, { status: 200 });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}