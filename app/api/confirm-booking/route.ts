import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Get Secrets
    // Expecting API_URL like: http://uat.etrav.in/BusHost/BusAPIService.svc/JSONService
    const busApiUrl = process.env.API_URL; 
    const busUser = process.env.BUS_API_USER_ID;
    const busPwd = process.env.BUS_API_PASSWORD;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!busApiUrl || !busUser || !razorpaySecret) {
      return NextResponse.json({ msg: "Server configuration missing" }, { status: 500 });
    }

    // 2. Construct Trade API URL (Swap 'BusHost/BusAPIService' with 'tradehost/TradeAPIService')
    // This handles the different endpoint structure you provided.
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
        amount 
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
            IMEI_Number: "123456789"
        },
        ClientRefNo: razorpayPaymentId, // Using Razorpay ID as Client Ref
        RefNo: busOrderKey,             // The Temp Booking Key
        TransactionType: 0,             // 0 for Booking
        ProductId: "2"                  // 2 for Bus
    };

    console.log("Calling Trade API:", addPaymentEndpoint);
    
    const paymentRes = await fetch(addPaymentEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload)
    });

    const paymentResText = await paymentRes.text();
    let paymentData;

    try {
        paymentData = JSON.parse(paymentResText);
    } catch (e) {
        console.error("❌ AddPayment Returned XML/HTML:", paymentResText);
        return NextResponse.json({ 
            msg: "Trade API Error (AddPayment failed)", 
            debug: paymentResText.substring(0, 200) 
        }, { status: 500 });
    }

    // Check if AddPayment was successful
    if (paymentData.Response_Header?.Error_Code !== "0000") {
         console.error("AddPayment Failed:", paymentData);
         return NextResponse.json({ 
             msg: "Payment Recording Failed (Trade API)", 
             error: paymentData.Response_Header?.Error_Desc 
         }, { status: 400 });
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
            IMEI_Number: "123456789"
        },
        Booking_RefNo: busOrderKey // Using the same key
    };

    const ticketRes = await fetch(ticketEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketPayload)
    });

    const ticketResText = await ticketRes.text();
    let ticketData;

    try {
        ticketData = JSON.parse(ticketResText);
        console.log(ticketData)
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
             msg: "Booking Failed (Money deducted but ticket not generated)", 
             error: ticketData.Response_Header?.Error_Desc 
         }, { status: 400 });
    }

    console.log("🎉 Booking Confirmed! PNR:", ticketData.TicketNo || ticketData.Transport_PNR);

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
//     const busUrl = process.env.API_URL;
//     const busUser = process.env.BUS_API_USER_ID;
//     const busPwd = process.env.BUS_API_PASSWORD;
//     const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

//     if (!busUrl || !busUser || !razorpaySecret) {
//       return NextResponse.json({ msg: "Server configuration missing" }, { status: 500 });
//     }

//     const body = await req.json();
//     const { 
//         busOrderKey, // This contains the Temp Booking ID
//         razorpayPaymentId, 
//         razorpayOrderId, 
//         razorpaySignature
//     } = body;

//     if (!busOrderKey || !razorpayPaymentId || !razorpaySignature) {
//         return NextResponse.json({ msg: "Missing payment details" }, { status: 400 });
//     }

//     // 1. Verify Signature
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

//     // 2. Call Bus Ticketing
//     const ticketUrl = `${busUrl}/Bus_Ticketing`; 

//     const ticketPayload = {
//         Auth_Header: {
//             UserId: busUser,
//             Password: busPwd,
//             Request_Id: `Ticket_${Date.now()}`,
//             IP_Address: "127.0.0.1",
//             IMEI_Number: "123456789"
//         },
//         Booking_RefNo: busOrderKey 
//     };
    
//     console.log("Sending Ticketing Payload:", JSON.stringify(ticketPayload, null, 2));

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