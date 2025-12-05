import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!rzpKey || !rzpSecret) {
        return NextResponse.json({ msg: "Razorpay keys missing" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: rzpKey,
      key_secret: rzpSecret,
    });

    const url = process.env.API_URL;
    const userId = process.env.BUS_API_USER_ID;
    const pwd = process.env.BUS_API_PASSWORD;

    if (!url || !userId || !pwd) {
        return NextResponse.json({ msg: "API Credentials missing" }, { status: 500 });
    }

    const body = await req.json();
    const { busPayload, amount } = body;

    // Generate shorter Unique ID
    const uniqueRequestId = `REQ_${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 1000)}`;
    console.log("Initiating Temp Booking with Request ID:", uniqueRequestId);

    const busApiUrl = `${url}/Bus_TempBooking`; 

    const busApiResponse = await fetch(busApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...busPayload,
            "Auth_Header": {
                "UserId": userId,
                "Password": pwd,
                "Request_Id": uniqueRequestId,
                "IP_Address": "127.0.0.1", 
                "IMEI_Number": "123456789"
            }
        }),
    });

    const responseText = await busApiResponse.text(); 
    let busData;

    try {
        busData = JSON.parse(responseText);
    } catch (e) {
        console.error("❌ API Returned Non-JSON:", responseText);
        return NextResponse.json({ msg: "External API Error", debug: responseText }, { status: 500 });
    }

    // --- DEBUG: LOG FULL RESPONSE ---
    console.log("✅ Bus API Response:", JSON.stringify(busData, null, 2));

    if (busData.Response_Header?.Error_Code !== "0000") {
        console.error("Bus Booking Failed:", busData);
        return NextResponse.json(
            { msg: "Seat Booking Failed", error: busData.Response_Header?.Error_Desc }, 
            { status: 400 }
        );
    }

    // --- FIX: Added 'Booking_RefNo' to the check list ---
    const busOrderKey = busData.Booking_RefNo || busData.Order_Key || busData.Block_Key || busData.Bus_Booking_Key;

    if (!busOrderKey) {
         console.error("❌ Order Key Missing in:", busData);
         // Return the actual data so you can see what fields ARE there
         return NextResponse.json({ 
             msg: "Booking successful but no Order Key returned", 
             fullResponse: busData 
         }, { status: 500 });
    }

    console.log("Temp Booking Success. Order Key:", busOrderKey);

    const paymentOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), 
        currency: "INR",
        receipt: busOrderKey.toString().substring(0, 40),
        notes: { bus_order_key: busOrderKey }
    });

    return NextResponse.json({ 
        msg: "Success", 
        data: {
            busOrderKey: busOrderKey,
            razorpayOrderId: paymentOrder.id,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency
        }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ msg: "Internal Server Error", error: error.message }, { status: 500 });
  }
}