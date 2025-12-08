"use client";

import { useParams, useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg";
import { MapPin, Calendar, ArrowRight, Bus as BusIcon, Wifi, Coffee, ChevronDown, AlertCircle, Filter, X, ArrowUpDown } from "lucide-react";

// --- TYPES ---
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
  BoardingDetails: { Boarding_Id: string }[];
  DroppingDetails: { Dropping_Id: string }[];
}

interface SearchHeaderData {
  from: string;
  to: string;
  date: string;
}

// --- HELPERS ---
const parseTimeToMinutes = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return hours * 60 + minutes;
};

const calculateDuration = (start: string, end: string) => {
  let startMin = parseTimeToMinutes(start);
  let endMin = parseTimeToMinutes(end);
  if (endMin < startMin) endMin += 24 * 60;
  const diff = endMin - startMin;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
};

// --- INNER COMPONENT (CONTAINS LOGIC) ---
function BusListingContent() {
  const primaryColor = "#ceb45f"; 
  const { id } = useParams();
  const router = useRouter();
  
  const [headerData, setHeaderData] = useState<SearchHeaderData | null>(null);
  const [allBuses, setAllBuses] = useState<RawBusData[]>([]);
  const [searchKey, setSearchKey] = useState<string>(""); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  // --- FILTER & SORT STATE ---
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");
  
  const [filters, setFilters] = useState({
    ac: false,
    nonAc: false,
    sleeper: false,
    seater: false,
    morning: false,
    afternoon: false,
    evening: false,
  });

  // 1. Decrypt Params
  useEffect(() => {
    if (!id) return;
    try {
      const decoded = decodeURIComponent(id as string);
      const bytes = CryptoJS.AES.decrypt(decoded, process.env.NEXT_PUBLIC_SECRET_KEY as string);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedString) {
        setHeaderData(JSON.parse(decryptedString));
      } else {
        setError("Invalid search parameters.");
        setLoading(false);
      }
    } catch (e) {
      console.error("Header parse error", e);
      setError("Failed to parse search details.");
      setLoading(false);
    }
  }, [id]);

  // 2. Fetch Buses
  useEffect(() => {
    const fetchBuses = async () => {
      if (!headerData) return;
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/bussearch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: headerData.from,
            to: headerData.to,
            date: headerData.date
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.msg || "Failed to fetch buses");

        const busList = result.data?.Buses || [];
        const apiSearchKey = result.data?.Search_Key || "";
        
        if (Array.isArray(busList)) {
          setAllBuses(busList);
          setSearchKey(apiSearchKey);
        } else {
          setAllBuses([]); 
        }
      } catch (err: any) {
        console.error("Bus fetch error:", err);
        setError(err.message || "Something went wrong fetching buses.");
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [headerData]);

  // 3. FILTER & SORT LOGIC
  const processedBuses = useMemo(() => {
    // A. Filter
    let result = allBuses.filter((bus) => {
        const type = bus.Bus_Type.toLowerCase();
        
        // Type Filters
        if (filters.ac && !type.includes("ac")) return false;
        if (filters.nonAc && type.includes("ac")) return false; 
        if (filters.sleeper && !type.includes("sleeper")) return false;
        if (filters.seater && !type.includes("seater")) return false;

        // Time Filters
        if (filters.morning || filters.afternoon || filters.evening) {
            const minutes = parseTimeToMinutes(bus.Departure_Time);
            const isMorning = minutes >= 360 && minutes < 720;
            const isAfternoon = minutes >= 720 && minutes < 1080;
            const isEvening = minutes >= 1080 || minutes < 360;

            if (filters.morning && !isMorning) return false;
            if (filters.afternoon && !isAfternoon) return false;
            if (filters.evening && !isEvening) return false;
        }
        return true;
    });

    // B. Sort
    if (sortBy === "price_asc") {
        result = result.sort((a, b) => (a.FareMasters[0]?.Total_Amount || 0) - (b.FareMasters[0]?.Total_Amount || 0));
    } else if (sortBy === "price_desc") {
        result = result.sort((a, b) => (b.FareMasters[0]?.Total_Amount || 0) - (a.FareMasters[0]?.Total_Amount || 0));
    }

    return result;
  }, [allBuses, filters, sortBy]);

  const handleBuyTicket = (bus: RawBusData) => {
    const boardingId = bus.BoardingDetails?.[0]?.Boarding_Id || "";
    const droppingId = bus.DroppingDetails?.[0]?.Dropping_Id || "";

    if (!searchKey) {
        alert("Session expired. Please search again.");
        return;
    }

    const payload = {
      Boarding_Id: boardingId,
      Dropping_Id: droppingId,
      Bus_Key: bus.Bus_Key,
      Search_Key: searchKey
    };

    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonString, process.env.NEXT_PUBLIC_SECRET_KEY as string).toString();
    const encoded = encodeURIComponent(encrypted);
    router.push(`/bus/${encoded}`);
  };

  const handleFilterChange = (key: keyof typeof filters) => {
      setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  if (!headerData && loading) return <div className="p-10 text-center font-bold">Processing Search...</div>;

  return (
    <div className="relative min-h-screen font-sans bg-slate-50">
      
      {/* HEADER IMAGE */}
      <div className="fixed inset-0 z-0">
        <Image src={bgImage} alt="Background" fill quality={100} style={{ objectFit: "cover" }} />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* HEADER TITLE */}
      <div className="fixed top-0 left-0 w-full h-[40vh] flex flex-col items-center justify-center z-0 text-white pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">CROSSA</h1>
        <div className="flex items-center gap-3 text-lg md:text-xl font-medium bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <span>{headerData?.from}</span> <ArrowRight size={18} /> <span>{headerData?.to}</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="h-[40vh] w-full bg-transparent"></div>

        <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center">
          
          {/* SEARCH SUMMARY CARD */}
          <div className="-mt-16 w-full max-w-7xl px-4 mb-8 relative z-20">
             <div className="w-full bg-white shadow-xl flex flex-col lg:flex-row min-h-[100px] rounded-lg overflow-hidden border border-gray-100">
              <div className="flex-[3] flex relative items-stretch border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="flex-1 p-6 flex flex-col justify-center border-r border-gray-100">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">From</span>
                  <input type="text" value={headerData?.from} readOnly className="text-2xl text-slate-900 font-bold outline-none w-full bg-transparent cursor-default" />
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-100 p-2 rounded-full border-4 border-white">
                    <ArrowRight size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center pl-10">
                  <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">To</span>
                  <input type="text" value={headerData?.to} readOnly className="text-2xl text-slate-900 font-bold outline-none w-full bg-transparent cursor-default" />
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} color={primaryColor} />
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Date</span>
                </div>
                <div className="text-xl text-slate-900 font-bold">{headerData?.date}</div>
              </div>
            </div>
          </div>

          {/* MAIN GRID: FILTERS + LIST */}
          <div className="w-full max-w-7xl px-4 pb-20 flex flex-col lg:flex-row gap-6">
            
            {/* --- LEFT: FILTERS SIDEBAR --- */}
            <div className={`lg:w-1/4 w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-24 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Filter size={20} /> Filters
                    </h3>
                    <button 
                        onClick={() => {
                            setFilters({ ac: false, nonAc: false, sleeper: false, seater: false, morning: false, afternoon: false, evening: false });
                            setSortBy("default");
                        }}
                        className="text-xs text-red-500 hover:underline font-bold"
                    >
                        CLEAR ALL
                    </button>
                </div>

                <div className="space-y-8">
                    
                    {/* 1. SORT BY PRICE */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <ArrowUpDown size={14} /> Sort By Price
                        </h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="sortPrice"
                                    checked={sortBy === "price_asc"}
                                    onChange={() => setSortBy("price_asc")}
                                    className="w-4 h-4 text-black focus:ring-black accent-black"
                                />
                                <span className="text-gray-700 group-hover:text-black text-sm">Low to High</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="sortPrice"
                                    checked={sortBy === "price_desc"}
                                    onChange={() => setSortBy("price_desc")}
                                    className="w-4 h-4 text-black focus:ring-black accent-black"
                                />
                                <span className="text-gray-700 group-hover:text-black text-sm">High to Low</span>
                            </label>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* 2. Bus Type */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bus Type</h4>
                        <div className="space-y-2">
                            {['AC', 'Non-AC', 'Sleeper', 'Seater'].map((type) => {
                                const key = type === 'Non-AC' ? 'nonAc' : type.toLowerCase();
                                return (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            // @ts-ignore
                                            checked={filters[key]}
                                            // @ts-ignore
                                            onChange={() => handleFilterChange(key)}
                                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                                        />
                                        <span className="text-gray-700 group-hover:text-black transition-colors text-sm">{type}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* 3. Departure Time */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Departure Time</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={filters.morning} onChange={() => handleFilterChange("morning")} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"/>
                                <span className="text-gray-700 group-hover:text-black text-sm">Morning (6 AM - 12 PM)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={filters.afternoon} onChange={() => handleFilterChange("afternoon")} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"/>
                                <span className="text-gray-700 group-hover:text-black text-sm">Afternoon (12 PM - 6 PM)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={filters.evening} onChange={() => handleFilterChange("evening")} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"/>
                                <span className="text-gray-700 group-hover:text-black text-sm">Evening / Night</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT: BUS LIST --- */}
            <div className="flex-1">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-4 sticky top-20 z-30">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full py-3 bg-black text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg"
                    >
                        {showFilters ? <X size={18} /> : <Filter size={18} />} 
                        {showFilters ? "Close Filters" : "Filter Buses"}
                    </button>
                </div>

                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Available Buses
                        <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{processedBuses.length}</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-gray-200">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
                        Finding best routes...
                    </div>
                ) : (
                    <>
                        {processedBuses.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                                <BusIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-lg font-medium text-gray-600">No buses match your filters.</p>
                                <button onClick={() => {
                                    setFilters({ ac: false, nonAc: false, sleeper: false, seater: false, morning: false, afternoon: false, evening: false });
                                    setSortBy("default");
                                }} className="mt-2 text-sm text-[#ceb45f] underline">Reset Filters</button>
                            </div>
                        ) : (
                             processedBuses.slice(0, visibleCount).map((bus, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden group mb-4">
                                    <div className="flex flex-col md:flex-row items-center p-6 md:h-32">
                                        <div className="flex-1 w-full flex items-center justify-between md:justify-start gap-8">
                                            <div className="text-left min-w-[100px]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin size={16} className="text-yellow-600" />
                                                    <span className="text-sm font-bold text-slate-900 uppercase">{headerData?.from}</span>
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
                                                    <span className="text-sm font-bold text-slate-900 uppercase">{headerData?.to}</span>
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
                             ))
                        )}

                        {visibleCount < processedBuses.length && (
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
    </div>
  );
}

// --- 4. EXPORT DEFAULT WITH SUSPENSE WRAPPER ---
export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Search...</div>}>
      <BusListingContent />
    </Suspense>
  );
}