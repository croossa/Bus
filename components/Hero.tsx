"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, X, AlertCircle } from "lucide-react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
            className="font-extrabold leading-[0.9] text-7xl sm:text-7xl md:text-7xl lg:text-8xl"
            style={{ color: "#ceb45f" }}
          >
            INDIAN
          </h1>

          <h1 className="text-white font-extrabold leading-[0.9] mt-2 text-7xl sm:text-7xl md:text-7xl lg:text-8xl">
            INTERCITY <br /> ROUTES
          </h1>

          <p className="mt-5 text-white font-bold opacity-90 text-3xl sm:text-lg md:text-2xl max-w-[95%] md:max-w-none lg:text-3xl">
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

  // --- DYNAMIC ALERT STATE ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    // Calculate Today's Date in Local Timezone
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  const triggerAlert = (title: string, description: string) => {
    setAlertConfig({ title, description });
    setIsAlertOpen(true);
  };

  const handleSearch = () => {
    // 1. CHECK MISSING FIELDS SPECIFICALLY
    const missingFields = [];
    if (!from) missingFields.push("Origin City");
    if (!to) missingFields.push("Destination City");
    if (!date) missingFields.push("Travel Date");

    if (missingFields.length > 0) {
      triggerAlert(
        "Missing Details", 
        `Please provide the following to proceed: ${missingFields.join(", ")}.`
      );
      return;
    }

    // 2. CHECK IF CITIES EXIST IN DATABASE (Case Insensitive)
    const isValidCity = (cityInput: string) => {
      return ALL_CITIES.some(
        (c: string) => c.toLowerCase() === cityInput.toLowerCase().trim()
      );
    };

    if (!isValidCity(from)) {
      triggerAlert(
        "Invalid Origin City", 
        `"${from}" is not a valid city in our network. Please select a city from the suggestions list.`
      );
      return;
    }

    if (!isValidCity(to)) {
      triggerAlert(
        "Invalid Destination City", 
        `"${to}" is not a valid city in our network. Please select a city from the suggestions list.`
      );
      return;
    }

    // 3. CHECK SAME CITY ERROR
    if (from.toLowerCase().trim() === to.toLowerCase().trim()) {
      triggerAlert(
        "Invalid Route", 
        "Source and Destination cities cannot be the same. Please choose a different destination."
      );
      return;
    }

    // 4. CHECK DATE VALIDITY (Past Date)
    if (date < minDate) {
      triggerAlert(
        "Incorrect Date", 
        "The selected travel date is in the past. Please select today or a future date."
      );
      return;
    }

    // 5. CHECK SECRET KEY (System Error)
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
    if (!secretKey) {
      console.error("❌ CRITICAL ERROR: NEXT_PUBLIC_SECRET_KEY is missing in .env.local");
      triggerAlert("System Error", "Encryption configuration is missing. Please contact support.");
      return;
    }

    // 6. PROCEED
    try {
      // Find the exact casing from the list to ensure consistency
      const exactFrom = ALL_CITIES.find((c: string) => c.toLowerCase() === from.toLowerCase().trim()) || from;
      const exactTo = ALL_CITIES.find((c: string) => c.toLowerCase() === to.toLowerCase().trim()) || to;

      const payload = { from: exactFrom, to: exactTo, date };
      const jsonString = JSON.stringify(payload);
      const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
      const encoded = encodeURIComponent(encrypted);
      
      router.push(`/buses/${encoded}`);
    } catch (error) {
      console.error("Encryption failed:", error);
      triggerAlert("Processing Error", "An unexpected error occurred while processing your request.");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center p-6 gap-4 lg:gap-6 relative">
        
        {/* FROM */}
        <div className="flex flex-col w-full relative z-30">
          <CityAutocomplete
            label="From"
            value={from}
            setValue={setFrom}
            placeholder="Select origin"
          />
        </div>

        {/* TO */}
        <div className="flex flex-col w-full relative z-20">
          <CityAutocomplete
            label="To"
            value={to}
            setValue={setTo}
            placeholder="Select destination"
          />
        </div>

        {/* DATE */}
        <div className="flex flex-col w-full">
          <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
            <Calendar size={16} style={{ color: "#ceb45f" }} />
            Date:
          </label>
          <input
            type="date"
            value={date}
            min={minDate}
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

      {/* DYNAMIC ALERT DIALOG */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white rounded-xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2 text-xl">
               <AlertCircle size={24} /> 
               {alertConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base mt-2">
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            {/* CHANGED TO BLACK */}
            <AlertDialogAction 
              onClick={() => setIsAlertOpen(false)}
              className="bg-black hover:bg-gray-800 text-white px-6"
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --- REUSABLE AUTOCOMPLETE COMPONENT ---
interface CityAutocompleteProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  placeholder: string;
}

function CityAutocomplete({
  label,
  value,
  setValue,
  placeholder,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 1 && showSuggestions) {
      const lowerValue = value.toLowerCase();
      // Added trimming to ensure "Bangalore " matches "Bangalore"
      const filtered = ALL_CITIES.filter((city: string) =>
        city.toLowerCase().startsWith(lowerValue.trim())
      ).slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, showSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
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

      {showSuggestions && value.length > 1 && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
          No cities found
        </div>
      )}
    </div>
  );
}