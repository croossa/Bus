"use client";

import { useParams, useRouter } from "next/navigation"; // 1. Added useRouter
import CryptoJS from "crypto-js";
import { useEffect, useState } from "react";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg";
import { MapPin, Calendar, ArrowRight, Bus as BusIcon, Wifi, Coffee, ChevronDown } from "lucide-react";

// IMPORT RAW DATA
import { backendResponse } from "@/public/assets/busData";

// 2. UPDATED TYPES TO INCLUDE IDS FOR PAYLOAD
interface RawBusData {
  Bus_Key: string;
  Operator_Name: string;
  Bus_Type: string;
  Departure_Time: string;
  Arrival_Time: string;
  Available_Seats: number;
  FareMasters: {
    Total_Amount: number;
  }[];
  // Added these for the payload
  BoardingDetails: { Boarding_Id: string }[];
  DroppingDetails: { Dropping_Id: string }[];
}

const calculateDuration = (start: string, end: string) => {
  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return hours * 60 + minutes;
  };
  let startMin = parseTime(start);
  let endMin = parseTime(end);
  if (endMin < startMin) endMin += 24 * 60;
  const diff = endMin - startMin;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
};

export default function Page() {
  const primaryColor = "#ceb45f"; 
  const { id } = useParams();
  const router = useRouter(); // Initialize Router
  
  const [headerData, setHeaderData] = useState<any>(null);
  const [buses, setBuses] = useState<RawBusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!id) return;
    try {
      const decoded = decodeURIComponent(id as string);
      const bytes = CryptoJS.AES.decrypt(decoded, process.env.NEXT_PUBLIC_SECRET_KEY as string);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedString) {
        setHeaderData(JSON.parse(decryptedString));
      }
    } catch (e) {
      console.error("Header parse error", e);
    }

    setTimeout(() => {
        setBuses(backendResponse.Buses as unknown as RawBusData[]);
        setLoading(false);
    }, 500); 
  }, [id]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // 3. NEW FUNCTION TO HANDLE BOOKING
  const handleBuyTicket = (bus: RawBusData) => {
    // 1. Get Boarding/Dropping IDs (Defaulting to the first one in the list)
    const boardingId = bus.BoardingDetails?.[0]?.Boarding_Id || "";
    const droppingId = bus.DroppingDetails?.[0]?.Dropping_Id || "";

    // 2. Create Payload
    const payload = {
      Boarding_Id: boardingId,
      Dropping_Id: droppingId,
      Bus_Key: bus.Bus_Key,
      Search_Key: (backendResponse as any).Search_Key // Accessing from root JSON
    };

    // 3. Encrypt
    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonString, process.env.NEXT_PUBLIC_SECRET_KEY as string).toString();
    const encoded = encodeURIComponent(encrypted);

    // 4. Navigate
    router.push(`/bus/${encoded}`);
  };

  if (!headerData) return <div className="p-10 text-center">Loading details...</div>;

  return (
    <div className="relative min-h-screen font-sans bg-slate-50">
      
      <div className="fixed inset-0 z-0">
        <Image src={bgImage} alt="Background" fill quality={100} style={{ objectFit: "cover" }} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="fixed top-0 left-0 w-full h-[50vh] flex flex-col items-center justify-center z-0 text-white pointer-events-none">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">CROSSA</h1>
      </div>

      <div className="relative z-10">
        <div className="h-[50vh] w-full bg-transparent"></div>

        <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center">
          
          <div className="-mt-16 w-full max-w-6xl px-4 mb-12 relative z-20">
             <div className="w-full bg-white shadow-xl flex flex-col lg:flex-row min-h-[100px] rounded-lg overflow-hidden border border-gray-100">
              <div className="flex-[3] flex relative items-stretch border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="flex-1 p-6 flex flex-col justify-center border-r border-gray-100">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">From</span>
                  <input type="text" value={headerData.from} readOnly className="text-2xl text-slate-900 font-bold outline-none w-full bg-transparent cursor-default" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-100 p-2 rounded-full border-4 border-white">
                    <ArrowRight size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center pl-10">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">To</span>
                  <input type="text" value={headerData.to} readOnly className="text-2xl text-slate-900 font-bold outline-none w-full bg-transparent cursor-default" />
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} color={primaryColor} />
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Date</span>
                </div>
                <div className="text-xl text-slate-900 font-bold">{headerData.date}</div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-6xl px-4 pb-20 space-y-4">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    Available Results 
                    <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{buses.length}</span>
                </h2>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Finding best routes...</div>
            ) : (
                <>
                    {buses.slice(0, visibleCount).map((bus, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden group">
                            <div className="flex flex-col md:flex-row items-center p-6 md:h-32">
                                <div className="flex-1 w-full flex items-center justify-between md:justify-start gap-8">
                                    <div className="text-left min-w-[100px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin size={16} className="text-yellow-600" />
                                            <span className="text-sm font-bold text-slate-900 uppercase">{headerData.from}</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">{bus.Departure_Time}</div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center px-4 max-w-[200px]">
                                        <div className="text-xs text-gray-400 mb-1">
                                            {calculateDuration(bus.Departure_Time, bus.Arrival_Time)}
                                        </div>
                                        <div className="w-full flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full border-2 border-gray-300 bg-white"></div>
                                            <div className="h-[2px] flex-1 bg-gray-300 border-t border-dashed border-gray-400"></div>
                                            <div className="h-2 w-2 rounded-full border-2 border-gray-300 bg-white"></div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1 uppercase">Direct</div>
                                    </div>

                                    <div className="text-left min-w-[100px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-900 uppercase">{headerData.to}</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">{bus.Arrival_Time}</div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center mt-6 md:mt-0 md:px-12 md:border-l md:border-r border-gray-100 gap-1">
                                    <div className="text-3xl font-black text-slate-900">
                                        ₹{bus.FareMasters && bus.FareMasters.length > 0 ? bus.FareMasters[0].Total_Amount : "0"}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">per adult</div>
                                    <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded mt-1">
                                        {bus.Available_Seats} seats left
                                    </div>
                                </div>

                                <div className="w-full md:w-auto mt-6 md:mt-0 md:pl-8">
                                    {/* 4. ATTACH CLICK HANDLER & CURSOR POINTER */}
                                    <button 
                                        onClick={() => handleBuyTicket(bus)}
                                        className="cursor-pointer w-full flex items-center justify-center gap-2 px-8 py-4 font-bold text-sm tracking-wider uppercase transition-all hover:bg-slate-50 border-2 border-slate-900 text-slate-900 hover:text-white hover:bg-slate-900"
                                    >
                                        Buy Tickets
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <BusIcon size={14} className="text-gray-400" />
                                        <span className="text-xs font-bold text-slate-700 uppercase">{bus.Operator_Name}</span>
                                    </div>
                                    <span className="hidden md:inline text-gray-300">|</span>
                                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{bus.Bus_Type}</span>
                                </div>
                                <div className="flex gap-3 text-gray-400">
                                    <Wifi size={14} />
                                    <Coffee size={14} />
                                </div>
                            </div>

                        </div>
                    ))}

                    {visibleCount < buses.length && (
                        <div className="flex justify-center pt-10 pb-10">
                            <button 
                                onClick={handleLoadMore}
                                className="group flex items-center gap-2 px-10 py-4 bg-slate-900 text-white font-bold tracking-widest uppercase hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                Load More Tours
                                <ChevronDown className="group-hover:translate-y-1 transition-transform" size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}