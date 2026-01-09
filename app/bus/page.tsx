"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CryptoJS from "crypto-js";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { ArrowLeft, User, Disc, MapPin, CheckCircle, AlertCircle, Info, Armchair, Loader2, Receipt } from "lucide-react";
import Script from "next/script";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- CONFIGURATION ---
const PLATFORM_FEE_PER_SEAT = 0; // Your friend's profit per seat

// --- TYPES ---
interface FareDetail {
  Amount: number;
  Fare_Desc: string;
  Refundable: boolean;
}

interface FareMaster {
  Total_Amount: number;
  Basic_Amount: number;
  GST: number;
  FareDetails: FareDetail[];
}

interface Seat {
  Bookable: boolean;
  Column: string; 
  Row: string;
  Length: string;
  Width: string;
  ZIndex: string;
  Seat_Number: string;
  Seat_Key: string;
  Ladies_Seat: boolean;
  FareMaster?: FareMaster;
}

interface PrimaryPaxDetail {
  Age: string;
  Title: string;
  Name: string;
  Gender: number; 
}

// --- INNER COMPONENT (LOGIC) ---
function SeatSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encryptedSearch = searchParams.get("search"); 
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paramsData, setParamsData] = useState<any>(null);
  const [seatData, setSeatData] = useState<any>(null);
  
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [boardingId, setBoardingId] = useState<string>("");
  const [droppingId, setDroppingId] = useState<string>("");
  
  const [primaryPax, setPrimaryPax] = useState<PrimaryPaxDetail>({
    Title: "Mr",
    Name: "",
    Age: "",
    Gender: 0 
  });

  const [contactInfo, setContactInfo] = useState({ email: "", mobile: "" });

  // --- ALERT STATE ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    type: "error" as "error" | "success" | "loading",
    onConfirm: () => {}, 
  });

  const triggerAlert = (title: string, description: string, type: "error" | "success" | "loading" = "error", onConfirm = () => {}) => {
    setAlertConfig({ 
        title, 
        description, 
        type,
        onConfirm: () => {
            if (type !== 'loading') { 
                setIsAlertOpen(false);
                onConfirm();
            }
        } 
    });
    setIsAlertOpen(true);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. CLEANUP: Wipe old data immediately to fix "Ghost Data" bug
    setLoading(true);
    setSeatData(null);
    setSelectedSeats([]);
    setParamsData(null);
    setError("");

    if (!encryptedSearch) {
        setLoading(false);
        return;
    }

    const fetchSeatMap = async () => {
      try {
        const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
        if (!secretKey) throw new Error("Secret Key missing");

        let parsedParams;
        try {
            const safeString = encryptedSearch.replace(/ /g, '+');
            const bytes = CryptoJS.AES.decrypt(safeString, secretKey);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) throw new Error("Decryption failed");
            parsedParams = JSON.parse(decryptedString);
            setParamsData(parsedParams);
        } catch (decryptErr) {
            throw new Error("Invalid booking link.");
        }

        const response = await fetch("/api/seatmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Bus_Key: parsedParams.Bus_Key,
            Search_Key: parsedParams.Search_Key,
            Boarding_Id: parsedParams.Boarding_Id,
            Dropping_Id: parsedParams.Dropping_Id
          })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.msg || "Failed to fetch seat map");

        if (result.data) {
            setSeatData(result.data);
            
            const defaultBoarding = result.data.BoardingDetails?.find((b: any) => b.Boarding_Id === parsedParams.Boarding_Id) 
                                    || result.data.BoardingDetails?.[0];
            
            const defaultDropping = result.data.DroppingDetails?.find((d: any) => d.Dropping_Id === parsedParams.Dropping_Id) 
                                    || result.data.DroppingDetails?.[0];

            if (defaultBoarding) setBoardingId(defaultBoarding.Boarding_Id);
            if (defaultDropping) setDroppingId(defaultDropping.Dropping_Id);
        }

      } catch (e: any) {
        console.error("Seatmap Error:", e);
        setError(e.message || "Unable to load seat layout. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [encryptedSearch]);

  // --- LOGIC: DECKS & DIMENSIONS ---
  const { lowerDeck, upperDeck, hasUpperDeck } = useMemo(() => {
    if (!seatData || !seatData.SeatMap) return { lowerDeck: [], upperDeck: [], hasUpperDeck: false };

    const lower: Seat[] = [];
    const upper: Seat[] = [];

    seatData.SeatMap.forEach((seat: Seat) => {
      if (seat.ZIndex === "1") {
        upper.push(seat);
      } else {
        lower.push(seat);
      }
    });

    return { 
      lowerDeck: lower, 
      upperDeck: upper, 
      hasUpperDeck: upper.length > 0 
    };
  }, [seatData]);

  const getGridDimensions = (seats: Seat[]) => {
    let maxCols = 0; 
    let maxRows = 0; 
    const occupiedCoords = new Set<string>();

    seats.forEach((seat) => {
        const colIndex = Number(seat.Row);
        const rowIndex = Number(seat.Column);
        const width = Number(seat.Width || 1);
        const length = Number(seat.Length || 1);

        if (colIndex + width > maxCols) maxCols = colIndex + width;
        if (rowIndex + length > maxRows) maxRows = rowIndex + length;

        for(let i=0; i<width; i++) {
            for(let j=0; j<length; j++) {
                occupiedCoords.add(`${colIndex + i}-${rowIndex + j}`);
            }
        }
    });

    return { maxCols, maxRows, occupiedCoords };
  };

  // --- HANDLERS ---
  const toggleSeat = (seat: Seat) => {
    if (!seat.Bookable) return;
    const isSelected = selectedSeats.find((s) => s.Seat_Number === seat.Seat_Number);

    if (isSelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.Seat_Number !== seat.Seat_Number));
    } else {
      if (selectedSeats.length >= 6) {
        triggerAlert("Limit Reached", "You can only select up to 6 seats per booking.", "error");
        return;
      }
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  const handlePrimaryPaxChange = (field: keyof PrimaryPaxDetail, value: any) => {
    setPrimaryPax((prev) => ({ ...prev, [field]: value }));
  };

  // --- NEW CALCULATION LOGIC (WITH PROFIT) ---
  const calculateBaseFare = () => {
    return selectedSeats.reduce((acc, seat) => acc + Number(seat.FareMaster?.Total_Amount || 0), 0);
  };

  const calculatePlatformFees = () => {
    return selectedSeats.length * PLATFORM_FEE_PER_SEAT;
  };

  const calculateGrandTotal = () => {
    return calculateBaseFare() + calculatePlatformFees();
  };

  const handleBookTicket = async () => {
    const missingFields: string[] = [];

    if (selectedSeats.length === 0) missingFields.push("Seat Selection");
    if (!contactInfo.email?.trim()) missingFields.push("Email Address");
    if (!contactInfo.mobile?.trim()) missingFields.push("Mobile Number");
    if (!primaryPax.Name?.trim()) missingFields.push("Passenger Name");
    if (!primaryPax.Age?.trim()) missingFields.push("Passenger Age");

    if (missingFields.length > 0) {
        triggerAlert("Missing Details", `Please fill in: ${missingFields.join(", ")}.`, "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(contactInfo.email)) return triggerAlert("Invalid Input", "Invalid email.", "error");
    if (!mobileRegex.test(contactInfo.mobile)) return triggerAlert("Invalid Input", "Invalid mobile.", "error");
    if (primaryPax.Name.trim().length < 2) return triggerAlert("Invalid Input", "Name too short.", "error");
    if (parseInt(primaryPax.Age) <= 0) return triggerAlert("Invalid Input", "Invalid age.", "error");

    // USE THE GRAND TOTAL (Base + Fee)
    const totalPayableAmount = calculateGrandTotal();
    
    const busPayload = {
        Boarding_Id: boardingId,
        Dropping_Id: droppingId,
        Bus_Key: paramsData?.Bus_Key, 
        Search_Key: paramsData?.Search_Key, 
        SeatMap_Key: seatData?.SeatMap_Key, 
        Customer_Mobile: contactInfo.mobile,
        Passenger_Mobile: contactInfo.mobile,
        Passenger_Email: contactInfo.email,
        SendEmail: true, SendSMS: true, GST: false, CorporatePaymentMode: 0, CorporateStatus: "0",
        CostCenterId: 0, Deal_Key: "", GSTIN: "", GSTINHolderAddress: "", GSTINHolderName: "", ProjectId: 1, Remarks: "Online Booking",
        PAX_Details: selectedSeats.map((seat, index) => ({
            PAX_Id: index + 1,
            PAX_Name: primaryPax.Name, 
            Age: parseInt(primaryPax.Age), 
            Gender: parseInt(primaryPax.Gender as any),
            Title: primaryPax.Title, 
            Seat_Number: seat.Seat_Number, 
            Ladies_Seat: seat.Ladies_Seat,
            Primary: index === 0, 
            Status: "", Ticket_Number: "", Penalty_Charge: "", Id_Number: "0", Id_Type: 0, DOB: ""
        }))
    };

    try {
        setLoading(true);
        const initRes = await fetch("/api/tempbooking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                busPayload, 
                amount: totalPayableAmount // SEND THE FULL AMOUNT
            })
        });
        const initData = await initRes.json();
        if (!initRes.ok) {
             triggerAlert("Booking Failed", initData.error || initData.msg, "error");
             setLoading(false);
             return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
            amount: initData.data.amount, 
            currency: initData.data.currency,
            name: "Crossa Bus",
            description: "Bus Ticket Booking",
            order_id: initData.data.razorpayOrderId, 
            handler: async function (response: any) {
                triggerAlert("Please Wait...", "Payment verified. Finalizing booking...", "loading");

                try {
                    const confirmRes = await fetch("/api/confirm-booking", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            busOrderKey: initData.data.busOrderKey,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            amount: totalPayableAmount
                        })
                    });
                    const confirmData = await confirmRes.json();
                    if (confirmRes.ok) {
                        const bookingRef = confirmData.data?.Booking_RefNo || confirmData.data?.Order_Key || "Confirmed";
                        triggerAlert(
                            "Booking Successful!", 
                            `Your Ticket is Booked!\n\nBooking Ref No: ${bookingRef}\n\nPlease save this number for cancellations.`,
                            "success",
                            () => router.push("/") 
                        );
                    } else {
                        triggerAlert("Booking Failed", confirmData.error, "error");
                    }
                } catch (err) {
                    triggerAlert("System Error", "Error confirming ticket.", "error");
                }
            },
            prefill: { name: primaryPax.Name, email: contactInfo.email, contact: contactInfo.mobile },
            theme: { color: "#000000" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => triggerAlert("Payment Failed", response.error.description, "error"));
        rzp.open();
        
    } catch (error) {
        triggerAlert("Network Error", "Connection failed.", "error");
    } finally {
        setLoading(false);
    }
  };

  const renderDeckGrid = (seats: Seat[], title: string) => {
    if (!seats || seats.length === 0) return null;

    const { maxCols, maxRows, occupiedCoords } = getGridDimensions(seats);
    const seatMap = new Map<string, Seat>();
    seats.forEach((seat) => {
        const r = Number(seat.Row);
        const c = Number(seat.Column);
        seatMap.set(`${r}-${c}`, seat);
    });

    const gridItems = [];
    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < maxCols; col++) {
            const coordKey = `${col}-${row}`;
            if (seatMap.has(coordKey)) {
                gridItems.push({ type: 'seat', data: seatMap.get(coordKey)!, col, row });
            } else if (!occupiedCoords.has(coordKey)) {
                const isAisle = !seats.some(s => Number(s.Row) === col);
                if (!isAisle) {
                     gridItems.push({ type: 'ghost', col, row });
                }
            }
        }
    }

    return (
      <div className="mb-8 w-full">
        <h3 className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider w-full text-left">{title}</h3>
        <div className="overflow-x-auto pb-4">
            <div 
                className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-inner inline-grid place-items-center mx-auto"
                style={{
                    gridTemplateColumns: `repeat(${maxCols}, 45px)`,
                    gridTemplateRows: `repeat(${maxRows}, 45px)`,
                    gap: '10px',
                }}
            >
            <div className="absolute right-4 top-4 text-gray-300"><Disc size={24} /></div>

            {gridItems.map((item, index) => {
                const gridCol = item.col + 1;
                const gridRow = item.row + 1;

                if (item.type === 'seat') {
                    const seat = item.data as Seat;
                    const isSelected = selectedSeats.some(s => s.Seat_Number === seat.Seat_Number);
                    const rowSpan = Number(seat.Length || 1);
                    const colSpan = Number(seat.Width || 1);

                    return (
                        <button
                            key={`seat-${index}`}
                            onClick={() => toggleSeat(seat)}
                            disabled={!seat.Bookable}
                            className={`
                            relative flex items-center justify-center text-[10px] font-bold transition-all duration-200 rounded-md border
                            ${!seat.Bookable 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200" 
                                : isSelected 
                                ? "bg-black text-white border-black" 
                                : seat.Ladies_Seat 
                                    ? "bg-pink-50 border-pink-300 text-pink-600 hover:border-pink-500" 
                                    : "bg-white border-gray-300 text-slate-700 hover:border-black shadow-sm"
                            }
                            `}
                            style={{ 
                                gridColumn: `${gridCol} / span ${colSpan}`, 
                                gridRow: `${gridRow} / span ${rowSpan}`,
                                width: '100%',
                                height: '100%'
                            }}
                            title={`Seat: ${seat.Seat_Number} | ₹${seat.FareMaster?.Total_Amount}`}
                        >
                            {seat.Seat_Number}
                            {(rowSpan > 1 || colSpan > 1) && (
                                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-current opacity-20"></div>
                            )}
                        </button>
                    );
                } else {
                    return (
                        <div
                            key={`ghost-${index}`}
                            className="bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center cursor-not-allowed opacity-50"
                            style={{ 
                                gridColumn: `${gridCol} / span 1`, 
                                gridRow: `${gridRow} / span 1`,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                             <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        </div>
                    );
                }
            })}
            </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Seatmap...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4"><AlertCircle size={48}/><p>{error}</p><button onClick={() => router.back()} className="underline">Go Back</button></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <div className="bg-black text-white p-6 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-xl font-bold">Select Seats</h1>
                    <p className="text-sm text-gray-400">{paramsData?.from} to {paramsData?.to}</p>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: SEAT MAP */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center lg:items-start">
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-yellow-800">
                    <Info className="shrink-0 mt-0.5" size={18} />
                    <p className="text-sm"><strong>Note:</strong> This seatmap is not original, it just shows available seats.</p>
                </div>
                <div className="flex flex-wrap gap-6 mb-8 text-xs font-medium text-gray-600 bg-white p-4 rounded-lg border border-gray-100 w-full">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 border border-gray-300 bg-white rounded"></div> Available</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-black rounded"></div> Selected</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div> Booked</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 border border-pink-300 bg-pink-50 rounded"></div> Ladies</div>
                </div>

                {hasUpperDeck ? (
                    <>
                        {renderDeckGrid(lowerDeck, "Lower Deck")}
                        {renderDeckGrid(upperDeck, "Upper Deck")}
                    </>
                ) : (
                    renderDeckGrid(lowerDeck, "Bus Layout")
                )}
            </div>
            
            {/* RIGHT COLUMN: SUMMARY */}
            <div className="lg:col-span-5 xl:col-span-4">
                 <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                    <div className="p-6 bg-slate-50 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-900">Your Journey</h2>
                    </div>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Boarding Point</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <select value={boardingId} onChange={(e) => setBoardingId(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                                        {seatData?.BoardingDetails?.map((bp: any) => <option key={bp.Boarding_Id} value={bp.Boarding_Id}>{bp.Boarding_Time} - {bp.Boarding_Name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dropping Point</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-red-400" size={16} />
                                    <select value={droppingId} onChange={(e) => setDroppingId(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                                        {seatData?.DroppingDetails?.map((dp: any) => <option key={dp.Dropping_Id} value={dp.Dropping_Id}>{dp.Dropping_Time} - {dp.Dropping_Name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {selectedSeats.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <User size={18} /> Primary Passenger
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Selected Seats: <span className="text-slate-900">{selectedSeats.map(s => s.Seat_Number).join(", ")}</span>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-3">
                                            <select className="w-full p-2 text-sm border rounded" value={primaryPax.Title} onChange={(e) => handlePrimaryPaxChange("Title", e.target.value)}>
                                                <option value="Mr">Mr</option>
                                                <option value="Mrs">Mrs</option>
                                                <option value="Ms">Ms</option>
                                            </select>
                                        </div>
                                        <div className="col-span-9">
                                            <input type="text" placeholder="Full Name" className="w-full p-2 text-sm border rounded focus:border-slate-900 outline-none" value={primaryPax.Name} onChange={(e) => handlePrimaryPaxChange("Name", e.target.value)} />
                                        </div>
                                        <div className="col-span-4">
                                            <input type="number" placeholder="Age" className="w-full p-2 text-sm border rounded focus:border-slate-900 outline-none" value={primaryPax.Age} onChange={(e) => handlePrimaryPaxChange("Age", e.target.value)} />
                                        </div>
                                        <div className="col-span-8 flex gap-2 items-center bg-white border rounded px-2">
                                            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="g" checked={primaryPax.Gender === 0} onChange={() => handlePrimaryPaxChange("Gender", 0)} /> Male</label>
                                            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" name="g" checked={primaryPax.Gender === 1} onChange={() => handlePrimaryPaxChange("Gender", 1)} /> Female</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                                <Armchair className="mx-auto mb-2 opacity-50" />
                                <p>Select a seat to proceed</p>
                             </div>
                        )}
                        {selectedSeats.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-slate-900 text-sm">Contact Information</h3>
                                <input type="email" placeholder="Email Address" className="w-full p-3 border border-gray-200 rounded-lg text-sm" value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} />
                                <input type="tel" placeholder="Mobile Number" className="w-full p-3 border border-gray-200 rounded-lg text-sm" value={contactInfo.mobile} onChange={(e) => setContactInfo({...contactInfo, mobile: e.target.value})} />
                            </div>
                        )}
                    </div>
                    
                    {/* --- PRICE BREAKDOWN SECTION --- */}
                    <div className="p-6 bg-slate-50 border-t border-gray-200">
                        {selectedSeats.length > 0 && (
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Base Fare ({selectedSeats.length} seats)</span>
                                    <span>₹{calculateBaseFare().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-800 font-medium">
                                    <span className="flex items-center gap-1"><Receipt size={14}/> Platform Fees</span>
                                    <span>₹{calculatePlatformFees().toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-end mb-4 pt-3 border-t border-gray-200">
                            <span className="text-gray-900 font-bold">Total Payable</span>
                            <span className="text-3xl font-black text-slate-900">
                                ₹{calculateGrandTotal().toFixed(2)}
                            </span>
                        </div>
                        <button onClick={handleBookTicket} disabled={selectedSeats.length === 0} className={`w-full py-4 font-bold text-sm tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${selectedSeats.length > 0 ? "bg-black text-white hover:bg-gray-800 shadow-lg cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                            Proceed to Pay <CheckCircle size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent className="bg-white rounded-xl shadow-2xl border-0">
                <AlertDialogHeader>
                    <AlertDialogTitle className={`flex items-center gap-2 text-xl ${
                        alertConfig.type === 'success' ? 'text-green-600' : 
                        alertConfig.type === 'loading' ? 'text-black' : 'text-red-600'
                    }`}>
                        {alertConfig.type === 'success' ? <CheckCircle size={24} /> : 
                         alertConfig.type === 'loading' ? <Loader2 size={24} className="animate-spin" /> : 
                         <AlertCircle size={24} />}
                        {alertConfig.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 text-base mt-2 whitespace-pre-wrap">{alertConfig.description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    {alertConfig.type !== 'loading' && (
                        <AlertDialogAction onClick={alertConfig.onConfirm} className="bg-black hover:bg-gray-800 text-white px-6">Okay</AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

// --- SUSPENSE WRAPPER ---
export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading Seatmap...</div>}>
      <SeatSelectionContent />
    </Suspense>
  );
}
