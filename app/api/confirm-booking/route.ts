import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Get ALL Secrets (Now including TRADE_API_URL)
    const busApiUrl = process.env.API_URL;       // For Bus_Ticketing
    const tradeApiUrl = process.env.TRADE_API_URL; // For AddPayment
    const busUser = process.env.BUS_API_USER_ID;
    const busPwd = process.env.BUS_API_PASSWORD;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Validate config
    if (!busApiUrl || !tradeApiUrl || !busUser || !razorpaySecret) {
      console.error("❌ Config Missing. Check API_URL and TRADE_API_URL in .env");
      return NextResponse.json({ msg: "Server configuration missing" }, { status: 500 });
    }

    // 2. Get Data from Frontend
    const body = await req.json();
    const {
      busOrderKey,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      amount
    } = body;

    // 3. Verify Razorpay Signature
    const bodyData = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(bodyData.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ msg: "Invalid Payment Signature" }, { status: 400 });
    }

    console.log("✅ Payment Verified. Step 1: Adding Payment to Trade API...");

    // ---------------------------------------------------------
    // STEP 1: CALL ADD PAYMENT (Using the NEW tradeApiUrl)
    // ---------------------------------------------------------
    // We remove the .replace() logic and use the variable directly.
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

    console.log(`📡 Calling Trade API: ${addPaymentEndpoint}`);

    const paymentRes = await fetch(addPaymentEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentPayload),
    });

    // Debugging Response
    const paymentResText = await paymentRes.text();
    if (!paymentRes.ok) {
        console.error(`❌ Trade API Failed (${paymentRes.status}): ${paymentResText}`);
        return NextResponse.json({ 
            msg: `Trade API Error (${paymentRes.status})`, 
            debug: paymentResText 
        }, { status: paymentRes.status });
    }

    let paymentData;
    try {
      paymentData = JSON.parse(paymentResText);
    } catch (e) {
      return NextResponse.json(
        { msg: "Trade API returned invalid JSON", debug: paymentResText },
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
    // STEP 2: CALL BUS TICKETING (Using busApiUrl)
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
    } catch (e) {
      return NextResponse.json(
        { msg: "Bus API Error (Invalid JSON)", debug: ticketResText },
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
    // STEP 3: SAVE TO MONGODB
    // ---------------------------------------------------------
    try {
      const newBooking = new Booking({
        bookingRefNo: busOrderKey,
        pnr: pnr,
        status: "Confirmed",
        paymentId: razorpayPaymentId,
        amount: amount,
        orderId: razorpayOrderId,
        bookingDate: new Date(),
      });

      await newBooking.save();
      console.log(`✅ MongoDB: Saved! Ref: ${busOrderKey}`);
    } catch (dbError) {
      console.error("⚠️ Failed to save to MongoDB:", dbError);
    }

    return NextResponse.json({ msg: "Success", data: ticketData }, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Critical Error:", error);
    return NextResponse.json({ msg: "Internal Server Error", error: error.message }, { status: 500 });
  }
}