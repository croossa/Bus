import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Get Secrets
    const busUrl = process.env.API_URL;
    const busUser = process.env.BUS_API_USER_ID;
    const busPwd = process.env.BUS_API_PASSWORD;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!busUrl || !busUser || !razorpaySecret) {
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

    if (!busOrderKey || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json({ msg: "Missing payment details" }, { status: 400 });
    }

    // ---------------------------------------------------------
    // STEP A: VERIFY RAZORPAY SIGNATURE
    // ---------------------------------------------------------
    const bodyData = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(bodyData.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
       console.error("Signature Mismatch!");
       return NextResponse.json({ msg: "Invalid Payment Signature" }, { status: 400 });
    }

    console.log("✅ Payment Signature Verified. Proceeding to Bus API...");

    // ---------------------------------------------------------
    // STEP B: CALL ADD PAYMENT (Bus_AddPayment)
    // ---------------------------------------------------------
    // FIX: Changed from '/AddPayment' to '/Bus_AddPayment' to match API pattern
    const addPaymentUrl = `${busUrl}/AddPayment`; 

    const paymentPayload = {
        Auth_Header: {
            UserId: busUser,
            Password: busPwd,
            Request_Id: `Pay_${Date.now()}_${Math.floor(Math.random() * 100)}`,
            IP_Address: "127.0.0.1", 
            IMEI_Number: "123456789"
        },
        Order_Key: busOrderKey,
        Payment_Type: "1", 
        Reference_Number: razorpayPaymentId,
        Total_Amount: String(amount),
        Currency: "INR"
    };

    const paymentRes = await fetch(addPaymentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload)
    });

    const paymentResText = await paymentRes.text();
    let paymentData;

    try {
        paymentData = JSON.parse(paymentResText);
    } catch (e) {
        console.error("❌ Bus_AddPayment returned HTML/XML:", paymentResText);
        return NextResponse.json({ 
            msg: "Bus API Error (AddPayment failed)", 
            debug: paymentResText.substring(0, 200) 
        }, { status: 500 });
    }

    if (paymentData.Response_Header?.Error_Code !== "0000") {
         console.error("AddPayment Failed:", paymentData);
         return NextResponse.json({ 
             msg: "Payment Recording Failed on Bus Network", 
             error: paymentData.Response_Header?.Error_Desc 
         }, { status: 400 });
    }

    console.log("✅ Payment Recorded. Finalizing Ticket...");

    // ---------------------------------------------------------
    // STEP C: CALL FINAL TICKETING (Bus_Ticketing)
    // ---------------------------------------------------------
    // FIX: Changed from '/BusTicketing' to '/Bus_Ticketing' to match API pattern
    // (If this fails with 404 next time, change it back, but this is the likely correct name)
    const ticketUrl = `${busUrl}/Bus_Ticketing`; 

    const ticketPayload = {
        Auth_Header: {
            UserId: busUser,
            Password: busPwd,
            Request_Id: `Ticket_${Date.now()}_${Math.floor(Math.random() * 100)}`,
            IP_Address: "127.0.0.1",
            IMEI_Number: "123456789"
        },
        Order_Key: busOrderKey
    };

    const ticketRes = await fetch(ticketUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketPayload)
    });

    const ticketResText = await ticketRes.text();
    let ticketData;

    try {
        ticketData = JSON.parse(ticketResText);
    } catch (e) {
        console.error("❌ Bus_Ticketing returned HTML/XML:", ticketResText);
        return NextResponse.json({ 
            msg: "Bus API Error (Ticketing failed)", 
            debug: ticketResText.substring(0, 200) 
        }, { status: 500 });
    }

    if (ticketData.Response_Header?.Error_Code !== "0000") {
         console.error("Final Ticketing Failed:", ticketData);
         return NextResponse.json({ 
             msg: "Booking Failed (Money deducted but ticket not booked)", 
             error: ticketData.Response_Header?.Error_Desc 
         }, { status: 400 });
    }

    console.log("🎉 Booking Confirmed! PNR:", ticketData.TicketNo || ticketData.PNR);

    return NextResponse.json({ 
        msg: "Success", 
        data: ticketData 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Confirm Booking Error:", error);
    return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
  }
}



// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Get Secrets
//     const busUrl = process.env.API_URL;
//     const busUser = process.env.BUS_API_USER_ID;
//     const busPwd = process.env.BUS_API_PASSWORD;
//     const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

//     if (!busUrl || !busUser || !razorpaySecret) {
//       return NextResponse.json({ msg: "Server configuration missing" }, { status: 500 });
//     }

//     // 2. Get Data from Frontend
//     const body = await req.json();
//     const { 
//         busOrderKey, 
//         razorpayPaymentId, 
//         razorpayOrderId, 
//         razorpaySignature
//     } = body;

//     if (!busOrderKey || !razorpayPaymentId || !razorpaySignature) {
//         return NextResponse.json({ msg: "Missing payment details" }, { status: 400 });
//     }

//     // ---------------------------------------------------------
//     // STEP A: VERIFY RAZORPAY SIGNATURE (Security Check)
//     // ---------------------------------------------------------
//     const bodyData = razorpayOrderId + "|" + razorpayPaymentId;
//     const expectedSignature = crypto
//       .createHmac("sha256", razorpaySecret)
//       .update(bodyData.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpaySignature) {
//        console.error("Signature Mismatch!");
//        return NextResponse.json({ msg: "Invalid Payment Signature" }, { status: 400 });
//     }

//     console.log("✅ Payment Verified. Proceeding to Final Ticketing...");

//     // ---------------------------------------------------------
//     // STEP B: CALL BUS TICKETING (Directly)
//     // ---------------------------------------------------------
//     // Endpoint from your list: /Bus_Ticketing
//     const ticketUrl = `${busUrl}/Bus_Ticketing`; 

//     const ticketPayload = {
//         Auth_Header: {
//             UserId: busUser,
//             Password: busPwd,
//             Request_Id: `Ticket_${Date.now()}`,
//             IP_Address: "127.0.0.1",
//             IMEI_Number: "123456789"
//         },
//         Order_Key: busOrderKey,
//         // Some APIs require the payment ID as a reference here, check if "RefNo" is needed.
//         // If not, just Order_Key is usually enough for this provider.
//         RefNo: razorpayPaymentId 
//     };

//     const ticketRes = await fetch(ticketUrl, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(ticketPayload)
//     });

//     const ticketResText = await ticketRes.text();
//     let ticketData;

//     try {
//         ticketData = JSON.parse(ticketResText);
//     } catch (e) {
//         console.error("❌ Bus_Ticketing returned HTML/XML:", ticketResText);
//         return NextResponse.json({ 
//             msg: "Bus API Error (Ticketing failed)", 
//             debug: ticketResText.substring(0, 200) 
//         }, { status: 500 });
//     }

//     // Check for Success
//     if (ticketData.Response_Header?.Error_Code !== "0000") {
//          console.error("Final Ticketing Failed:", ticketData);
//          return NextResponse.json({ 
//              msg: "Booking Failed (Money deducted but ticket not generated)", 
//              error: ticketData.Response_Header?.Error_Desc 
//          }, { status: 400 });
//     }

//     console.log("🎉 Booking Confirmed! PNR:", ticketData.TicketNo || ticketData.PNR);

//     return NextResponse.json({ 
//         msg: "Success", 
//         data: ticketData 
//     }, { status: 200 });

//   } catch (error: any) {
//     console.error("Confirm Booking Error:", error);
//     return NextResponse.json({ msg: "Server Error", error: error.message }, { status: 500 });
//   }
// }