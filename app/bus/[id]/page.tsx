"use client";

import { useParams, useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, User, Disc, MapPin, CheckCircle, AlertCircle, Info } from "lucide-react";

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
  FareMaster: FareMaster;
}

interface PrimaryPaxDetail {
  Age: string;
  Title: string;
  Name: string;
  Gender: number; 
}

export default function SeatSelectionPage() {
  const { id } = useParams();
  const router = useRouter();
  
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

  // --- INITIALIZATION & API CALL ---
  useEffect(() => {
    if (!id) return;

    const fetchSeatMap = async () => {
      try {
        const decoded = decodeURIComponent(id as string);
        const bytes = CryptoJS.AES.decrypt(decoded, process.env.NEXT_PUBLIC_SECRET_KEY as string);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) throw new Error("Failed to decrypt booking details.");

        const parsedParams = JSON.parse(decryptedString);
        setParamsData(parsedParams);

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
        setError(e.message || "Unable to load seat layout.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [id]);

  // --- UPDATED LOGIC: SINGLE DECK CALCULATION ---
  const { maxRowIndex, maxColIndex } = useMemo(() => {
    if (!seatData || !seatData.SeatMap) return { maxRowIndex: 0, maxColIndex: 0 };

    let maxR = 0; 
    let maxC = 0; 

    seatData.SeatMap.forEach((seat: Seat) => {
      const r = parseInt(seat.Row);
      const c = parseInt(seat.Column);
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    });

    return { maxRowIndex: maxR, maxColIndex: maxC };
  }, [seatData]);

  // --- HANDLERS ---
  const toggleSeat = (seat: Seat) => {
    if (!seat.Bookable) return;
    const isSelected = selectedSeats.find((s) => s.Seat_Number === seat.Seat_Number);

    if (isSelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.Seat_Number !== seat.Seat_Number));
    } else {
      if (selectedSeats.length >= 6) return alert("You can only select up to 6 seats.");
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  const handlePrimaryPaxChange = (field: keyof PrimaryPaxDetail, value: any) => {
    setPrimaryPax((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((acc, seat) => {
        const amount = Number(seat.FareMaster?.Total_Amount || 0);
        return acc + amount;
    }, 0);
  };

  const handleBookTicket = async () => {
    if (selectedSeats.length === 0) return alert("Please select at least one seat.");
    if (!contactInfo.email || !contactInfo.mobile) return alert("Please fill contact details.");
    if (!primaryPax.Name || !primaryPax.Age) return alert("Please fill passenger details.");

    const bookingPayload = {
        "Auth_Header": {
            "UserId": "xxxxxxxxxx", "Password": "xxxxxxxxxx", "Request_Id": "NextJS", "IP_Address": "127.0.0.1", "IMEI_Number": "123"
        },
        "Boarding_Id": boardingId,
        "Dropping_Id": droppingId,
        "Bus_Key": paramsData?.Bus_Key, 
        "Search_Key": paramsData?.Search_Key, 
        "SeatMap_Key": seatData?.SeatMap_Key,
        "Customer_Mobile": contactInfo.mobile,
        "Passenger_Mobile": contactInfo.mobile,
        "Passenger_Email": contactInfo.email,
        "SendEmail": true, "SendSMS": true, "GST": false, "CorporatePaymentMode": 0, "CorporateStatus": "0",
        "CostCenterId": 0, "Deal_Key": "", "GSTIN": "", "GSTINHolderAddress": "", "GSTINHolderName": "", "ProjectId": 1, "Remarks": "Online Booking",
        
        "PAX_Details": selectedSeats.map((seat, index) => {
            return {
                "PAX_Id": index + 1,
                "PAX_Name": primaryPax.Name, 
                "Age": parseInt(primaryPax.Age), 
                "Gender": parseInt(primaryPax.Gender as any),
                "Title": primaryPax.Title, 
                "Seat_Number": seat.Seat_Number, 
                "Ladies_Seat": seat.Ladies_Seat,
                "Primary": index === 0, 
                "Status": "", "Ticket_Number": "", "Penalty_Charge": "", "Id_Number": "0", "Id_Type": 0, "DOB": ""
            };
        })
    };

    console.log("FINAL BOOKING PAYLOAD:", JSON.stringify(bookingPayload, null, 2));
    alert("Booking payload created! See console. (Next step: Send to /api/book-ticket)");
  };

  // --- RENDER SINGLE GRID ---
  const renderGrid = () => {
    if (!seatData?.SeatMap) return null;

    const visualColumns = maxRowIndex + 1; 
    const visualRows = maxColIndex + 1;

    return (
      <div className="mb-8">
        <div 
            className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-inner inline-block"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${visualColumns}, 50px)`,
                gridTemplateRows: `repeat(${visualRows}, 50px)`,
                gap: '10px'
            }}
        >
          <div className="absolute -right-8 top-0 text-gray-300"><Disc size={24} /></div>
          {seatData.SeatMap.map((seat: Seat) => {
            const isSelected = selectedSeats.some(s => s.Seat_Number === seat.Seat_Number);
            const gridColStart = parseInt(seat.Row) + 1;
            const gridRowStart = parseInt(seat.Column) + 1;
            
            return (
              <button
                key={seat.Seat_Key}
                onClick={() => toggleSeat(seat)}
                disabled={!seat.Bookable}
                className={`
                  relative flex items-center justify-center text-xs font-bold transition-all duration-200
                  ${!seat.Bookable ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200" : ""}
                  ${seat.Bookable && !isSelected ? "bg-white border-2 hover:border-slate-900 text-slate-700 shadow-sm" : ""}
                  ${isSelected ? "bg-slate-900 text-white border-slate-900" : ""}
                  ${seat.Ladies_Seat && !isSelected ? "border-pink-400 text-pink-600" : "border-gray-200"}
                  rounded-md
                `}
                style={{ gridColumn: `${gridColStart} / span ${seat.Width}`, gridRow: `${gridRowStart} / span ${seat.Length}` }}
              >
                {seat.Seat_Number}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Seatmap...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4"><AlertCircle size={48}/><p>{error}</p><button onClick={() => router.back()} className="underline">Go Back</button></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <div className="bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-md">
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
                
                {/* 1. ADDED DISCLAIMER NOTE */}
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-yellow-800">
                    <Info className="shrink-0 mt-0.5" size={18} />
                    <p className="text-sm">
                        <strong>Note:</strong> This seatmap is not original, it just shows available seats.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-gray-200 bg-white rounded shadow-sm"></div> Available</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-slate-900 rounded shadow-sm"></div> Selected</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-300 rounded"></div> Booked</div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-pink-400 rounded"></div> Ladies</div>
                </div>

                {/* 2. SINGLE GRID RENDERING */}
                <h3 className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider w-full text-left">Bus Layout</h3>
                {renderGrid()}
            </div>

            {/* RIGHT COLUMN: BOOKING FORM */}
            <div className="lg:col-span-5 xl:col-span-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                    <div className="p-6 bg-slate-50 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-slate-900">Your Journey</h2>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Boarding/Dropping Selects */}
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

                        {/* SINGLE PASSENGER FORM */}
                        {selectedSeats.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <User size={18} /> Primary Passenger
                                </h3>
                                
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    {/* Seat Summary */}
                                    <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Selected Seats: <span className="text-slate-900">{selectedSeats.map(s => s.Seat_Number).join(", ")}</span>
                                    </div>

                                    {/* Individual Seat Price */}
                                    {selectedSeats.length > 0 && (
                                        <div className="mb-4 text-sm font-bold text-slate-700">
                                            Rate per seat: ₹{selectedSeats[0].FareMaster.Total_Amount}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-12 gap-2">
                                        <div className="col-span-3">
                                            <select 
                                                className="w-full p-2 text-sm border rounded"
                                                value={primaryPax.Title}
                                                onChange={(e) => handlePrimaryPaxChange("Title", e.target.value)}
                                            >
                                                <option value="Mr">Mr</option>
                                                <option value="Mrs">Mrs</option>
                                                <option value="Ms">Ms</option>
                                            </select>
                                        </div>
                                        <div className="col-span-9">
                                            <input 
                                                type="text" 
                                                placeholder="Full Name" 
                                                className="w-full p-2 text-sm border rounded focus:border-slate-900 outline-none"
                                                value={primaryPax.Name}
                                                onChange={(e) => handlePrimaryPaxChange("Name", e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <input 
                                                type="number" 
                                                placeholder="Age" 
                                                className="w-full p-2 text-sm border rounded focus:border-slate-900 outline-none"
                                                value={primaryPax.Age}
                                                onChange={(e) => handlePrimaryPaxChange("Age", e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-8 flex gap-2 items-center bg-white border rounded px-2">
                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="primary_gender" 
                                                    checked={primaryPax.Gender === 0}
                                                    onChange={() => handlePrimaryPaxChange("Gender", 0)}
                                                /> Male
                                            </label>
                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="primary_gender" 
                                                    checked={primaryPax.Gender === 1}
                                                    onChange={() => handlePrimaryPaxChange("Gender", 1)}
                                                /> Female
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                                <AlertCircle className="mx-auto mb-2 opacity-50" />
                                <p>Select a seat to proceed</p>
                             </div>
                        )}

                        {selectedSeats.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-slate-900 text-sm">Contact Information</h3>
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                    value={contactInfo.email}
                                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                                />
                                <input 
                                    type="tel" 
                                    placeholder="Mobile Number" 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                    value={contactInfo.mobile}
                                    onChange={(e) => setContactInfo({...contactInfo, mobile: e.target.value})}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-gray-200">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-gray-500 text-sm">Total Amount</span>
                            <span className="text-3xl font-black text-slate-900">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleBookTicket}
                            disabled={selectedSeats.length === 0}
                            className={`w-full py-4 font-bold text-sm tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${selectedSeats.length > 0 ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        >
                            Confirm Booking <CheckCircle size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  ); 
}