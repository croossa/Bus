"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, X } from "lucide-react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";

// 1. IMPORT YOUR TS DATA
import { cityList } from "@/public/assets/cityList"; 

// 2. EXTRACT CITIES
const ALL_CITIES = cityList?.CityDetails?.map((city: any) => city.CityName) || [];

export default function Hero() {
  return (
    <div className="relative w-full">
      <div
        className="h-[102vh] min-h-[600px] w-full bg-cover bg-no-repeat relative flex flex-col justify-center md:block"
        style={{
          backgroundImage: "url('/assets/Hero.jpg')",
          backgroundPosition: "center 30%",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="absolute top-[30vh] sm:top-[30vh] md:top-[22vh] left-1/2 md:left-[10%] lg:left-[20%] transform md:transform-none -translate-x-1/2 md:translate-x-0 text-center md:text-left w-[90%] sm:w-[80%] md:w-auto max-w-xl z-10">
          <h1
            className="font-extrabold leading-[0.9] text-6xl sm:text-7xl md:text-7xl lg:text-7xl"
            style={{ color: "#ceb45f" }}
          >
            INDIAN
          </h1>

          <h1 className="text-white font-extrabold leading-[0.9] mt-2 text-6xl sm:text-7xl md:text-7xl lg:text-7xl">
            INTERCITY <br /> ROUTES
          </h1>

          <p className="mt-5 text-white font-bold opacity-90 text-xl sm:text-lg md:hidden text-2xl max-w-[95%] md:max-w-none lg:text-3xl">
            BOOK TICKETS ONLINE AND <br />
            TRAVEL WITH EASE <br />
            AROUND ALL INDIA
          </p>
        </div>

        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 bottom-10 w-[90%] max-w-6xl z-20">
          <SearchBox />
        </div>
      </div>

      <div className="block md:hidden bg-white w-full py-8 px-4 shadow-lg relative z-20">
        <SearchBox />
      </div>
    </div>
  );
}

function SearchBox() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    // FIX: Calculate "Today" using Local Timezone (not UTC)
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  const handleSearch = () => {
    if (!from || !to || !date) {
      alert("Please fill in all fields");
      return;
    }

    // FIX: Validate that date is not in the past
    // String comparison works for YYYY-MM-DD format (e.g. "2023-12-01" < "2023-12-02")
    if (date < minDate) {
      alert("Date cannot be in the past. Please select today or a future date.");
      return;
    }

    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
    if (!secretKey) {
      console.error("❌ CRTICAL ERROR: NEXT_PUBLIC_SECRET_KEY is missing in .env.local");
      alert("System Error: Encryption key is missing.");
      return;
    }

    try {
      const payload = { from, to, date };
      const jsonString = JSON.stringify(payload);
      
      const encrypted = CryptoJS.AES.encrypt(
        jsonString,
        secretKey
      ).toString();
      
      const encoded = encodeURIComponent(encrypted);
      router.push(`/buses/${encoded}`);
    } catch (error) {
      console.error("Encryption failed:", error);
      alert("An error occurred while processing your request.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center  p-6 gap-4 lg:gap-6 relative">
      
      {/* FROM INPUT */}
      <div className="flex flex-col w-full relative z-30">
        <CityAutocomplete 
          label="From" 
          value={from} 
          setValue={setFrom} 
          placeholder="Select location"
        />
      </div>

      {/* TO INPUT */}
      <div className="flex flex-col w-full relative z-20">
        <CityAutocomplete 
          label="To" 
          value={to} 
          setValue={setTo} 
          placeholder="Select destination"
        />
      </div>

      {/* DATE INPUT */}
      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <Calendar size={16} style={{ color: "#ceb45f" }} />
          Date:
        </label>
        <input
          type="date"
          value={date}
          min={minDate} // Restricts the calendar UI to today/future
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base focus:outline-none focus:border-[#ceb45f]"
        />
      </div>

      <div className="w-full md:w-auto mt-2 md:mt-6">
        <Button
          onClick={handleSearch}
          className="w-full md:w-auto px-8 lg:px-10 py-6 text-base lg:text-lg whitespace-nowrap cursor-pointer hover:bg-[#b59e50] transition-colors"
          style={{ backgroundColor: "#ceb45f" }}
        >
          SEARCH
        </Button>
      </div>
    </div>
  );
}

// --- REUSABLE AUTOCOMPLETE COMPONENT ---
interface CityAutocompleteProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  placeholder: string;
}

function CityAutocomplete({ label, value, setValue, placeholder }: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter cities based on input
  useEffect(() => {
    if (value.length > 1 && showSuggestions) { 
      const lowerValue = value.toLowerCase();
      // Filter the ALL_CITIES array we extracted at the top
      const filtered = ALL_CITIES.filter((city: string) =>
        city.toLowerCase().startsWith(lowerValue)
      ).slice(0, 10); // Limit to 10 results for performance
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, showSuggestions]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelectCity = (city: string) => {
    setValue(city);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearInput = () => {
    setValue("");
    setSuggestions([]);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
        <MapPin size={16} style={{ color: "#ceb45f" }} />
        {label}:
      </label>
      
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base focus:outline-none focus:border-[#ceb45f]"
        />
        
        {value && (
          <button 
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city, index) => (
            <li
              key={index}
              onClick={() => handleSelectCity(city)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 transition-colors"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
      
      {/* No results found state */}
      {showSuggestions && value.length > 1 && suggestions.length === 0 && (
         <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
            No cities found
         </div>
      )}
    </div>
  );
}