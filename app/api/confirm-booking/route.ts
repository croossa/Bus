import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb"; // 1. Import DB Connection
import Booking from "@/models/Booking"; // 2. Import Booking Model

export async function POST(req: NextRequest) {
  try {
    // 0. Connect to Database
    await connectDB();

    // 1. Get Secrets
    const busApiUrl = process.env.API_URL;
    const busUser = process.env.BUS_API_USER_ID;
    const busPwd = process.env.BUS_API_PASSWORD;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!busApiUrl || !busUser || !razorpaySecret) {
      return NextResponse.json({ msg: "Server configuration missing" }, { status: 500 });
    }

    // 2. Construct Trade API URL
    const tradeApiUrl = busApiUrl.replace(
      "BusHost/BusAPIService.svc",
      "tradehost/TradeAPIService.svc"
    );

    // 3. Get Data from Frontend
    const body = await req.json();
    const {
      busOrderKey,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      amount,
      // Add extra fields if you need them for the DB (like user email, phone, etc.)
      userEmail, 
      userPhone
    } = body;

    // 4. Verify Razorpay Signature
    const bodyData = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(bodyData.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error("Signature Mismatch!");
      return NextResponse.json({ msg: "Invalid Payment Signature" }, { status: 400 });
    }

    console.log("✅ Payment Verified. Step 1: Adding Payment to Trade API...");

    // ---------------------------------------------------------
    // STEP 1: CALL ADD PAYMENT (Trade API)
    // ---------------------------------------------------------
    const addPaymentEndpoint = `${tradeApiUrl}/AddPayment`;

    const paymentPayload = {
      Auth_Header: {
        UserId: busUser,
        Password: busPwd,
        Request_Id: `Pay_${Date.now()}`,
        IP_Address: "127.0.0.1",
        IMEI_Number: "123456789",
      },
      ClientRefNo: razorpayPaymentId,
      RefNo: busOrderKey,
      TransactionType: 0,
      ProductId: "2",
    };

    const paymentRes = await fetch(addPaymentEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentPayload),
    });

    const paymentResText = await paymentRes.text();
    let paymentData;

    try {
      paymentData = JSON.parse(paymentResText);
    } catch (e) {
      return NextResponse.json(
        { msg: "Trade API Error", debug: paymentResText.substring(0, 200) },
        { status: 500 }
      );
    }

    if (paymentData.Response_Header?.Error_Code !== "0000") {
      return NextResponse.json(
        { msg: "Payment Recording Failed", error: paymentData.Response_Header?.Error_Desc },
        { status: 400 }
      );
    }

    console.log("✅ Payment Recorded. Step 2: Finalizing Ticket...");

    // ---------------------------------------------------------
    // STEP 2: CALL BUS TICKETING (Bus API)
    // ---------------------------------------------------------
    const ticketEndpoint = `${busApiUrl}/Bus_Ticketing`;
    const ticketPayload = {
      Auth_Header: {
        UserId: busUser,
        Password: busPwd,
        Request_Id: `Ticket_${Date.now()}`,
        IP_Address: "127.0.0.1",
        IMEI_Number: "123456789",
      },
      Booking_RefNo: busOrderKey,
    };

    const ticketRes = await fetch(ticketEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketPayload),
    });

    const ticketResText = await ticketRes.text();
    let ticketData;

    try {
      ticketData = JSON.parse(ticketResText);
      console.log(ticketData);
    } catch (e) {
      return NextResponse.json(
        { msg: "Bus API Error", debug: ticketResText.substring(0, 200) },
        { status: 500 }
      );
    }

    if (ticketData.Response_Header?.Error_Code !== "0000") {
      return NextResponse.json(
        { msg: "Booking Failed", error: ticketData.Response_Header?.Error_Desc },
        { status: 400 }
      );
    }

    const pnr = ticketData.Bus_Booking_Details?.TicketNo || ticketData.Transport_PNR || "N/A";

    // ---------------------------------------------------------
    // STEP 3: SAVE TO MONGODB (The Missing Part)
    // ---------------------------------------------------------
    try {
      // Create a new booking record
      const newBooking = new Booking({
        bookingRefNo: busOrderKey,          // The main ID used for cancellation later
        pnr: pnr,                           // Ticket Number
        status: "Confirmed",                // Initial status
        paymentId: razorpayPaymentId,       // Reference to payment
        amount: amount,                     // Amount paid
        orderId: razorpayOrderId,           // Razorpay Order ID
        bookingDate: new Date(),
        // Add any other fields your Schema requires (e.g. source, destination, travelDate)
        // These might need to be passed from the frontend in `body`
      });

      await newBooking.save();
      console.log(`✅ MongoDB: Booking Saved! Ref: ${busOrderKey}, PNR: ${pnr}`);
      
    } catch (dbError) {
      console.error("⚠️ Failed to save booking to MongoDB:", dbError);
      // We do NOT fail the request here because the ticket is already real.
      // Ideally, you would log this to an error tracking system.
    }

    console.log("🎉 Booking Confirmed! PNR:", pnr);

    return NextResponse.json(
      { msg: "Success", data: ticketData },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Confirm Booking Error:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}