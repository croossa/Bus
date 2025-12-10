"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, X, AlertCircle, Loader2 } from "lucide-react";
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

export default function Hero() {
  return (
    <div className="relative w-full">
      {/* ... (Keep your existing Hero Layout and Styles exactly as they are) ... */}
      
      <div
        className="h-[102vh] min-h-[600px] w-full bg-cover bg-no-repeat relative flex flex-col justify-center md:block"
        style={{
          backgroundImage: "url('/assets/Hero.jpg')",
          backgroundPosition: "center 30%",
        }}
      >
         <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="absolute top-[30vh] sm:top-[30vh] md:top-[22vh] left-1/2 md:left-[10%] lg:left-[20%] transform md:transform-none -translate-x-1/2 md:translate-x-0 text-center md:text-left w-[90%] sm:w-[80%] md:w-auto max-w-xl z-10">
          <h1 className="font-extrabold leading-[0.9] text-7xl sm:text-7xl md:text-7xl lg:text-8xl" style={{ color: "#ceb45f" }}>
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
  
  // --- NEW STATE FOR CITIES ---
  const [allCities, setAllCities] = useState<string[]>([]);
  const [isCitiesLoaded, setIsCitiesLoaded] = useState(false);

  // --- DYNAMIC ALERT STATE ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    // 1. Calculate Date
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    setMinDate(`${year}-${month}-${day}`);

    // 2. FETCH CITIES FROM JSON FILE (Client Side Only)
    const loadCities = async () => {
        try {
            // Fetch from the public folder
            const res = await fetch("/assets/cityList.json"); 
            if (!res.ok) throw new Error("Failed to load cities");
            const data = await res.json();
            
            // Map the data to a simple string array
            const cities = data.CityDetails.map((city: any) => city.CityName);
            setAllCities(cities);
            setIsCitiesLoaded(true);
        } catch (error) {
            console.error("Error loading city list:", error);
        }
    };

    loadCities();
  }, []);

  const triggerAlert = (title: string, description: string) => {
    setAlertConfig({ title, description });
    setIsAlertOpen(true);
  };

  const handleSearch = () => {
    if (!isCitiesLoaded) {
         triggerAlert("Please Wait", "City list is still loading. Please try again in a moment.");
         return;
    }

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

    const isValidCity = (cityInput: string) => {
      return allCities.some(
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

    if (from.toLowerCase().trim() === to.toLowerCase().trim()) {
      triggerAlert(
        "Invalid Route", 
        "Source and Destination cities cannot be the same."
      );
      return;
    }

    if (date < minDate) {
      triggerAlert(
        "Incorrect Date", 
        "The selected travel date is in the past."
      );
      return;
    }

    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
    if (!secretKey) {
      triggerAlert("System Error", "Encryption configuration is missing.");
      return;
    }

    try {
      const exactFrom = allCities.find((c: string) => c.toLowerCase() === from.toLowerCase().trim()) || from;
      const exactTo = allCities.find((c: string) => c.toLowerCase() === to.toLowerCase().trim()) || to;

      const payload = { from: exactFrom, to: exactTo, date };
      const jsonString = JSON.stringify(payload);
      
      const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
      const encoded = encodeURIComponent(encrypted);
      
      router.push(`/buses?search=${encoded}`);
    } catch (error) {
      console.error("Encryption failed:", error);
      triggerAlert("Processing Error", "An error occurred.");
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
            cityList={allCities} // Pass data down
            loading={!isCitiesLoaded}
          />
        </div>

        {/* TO */}
        <div className="flex flex-col w-full relative z-20">
          <CityAutocomplete
            label="To"
            value={to}
            setValue={setTo}
            placeholder="Select destination"
            cityList={allCities} // Pass data down
            loading={!isCitiesLoaded}
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

      {/* ALERT DIALOG */}
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
  cityList: string[]; // Receive list as prop
  loading: boolean;
}

function CityAutocomplete({
  label,
  value,
  setValue,
  placeholder,
  cityList,
  loading
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 1 && showSuggestions && cityList.length > 0) {
      const lowerValue = value.toLowerCase();
      // Only filter if we have data
      const filtered = cityList.filter((city: string) =>
        city.toLowerCase().startsWith(lowerValue.trim())
      ).slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, showSuggestions, cityList]);

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
          placeholder={loading ? "Loading cities..." : placeholder}
          value={value}
          disabled={loading}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base focus:outline-none focus:border-[#ceb45f] disabled:bg-gray-50 disabled:text-gray-400"
        />

        {/* Show Loader if loading */}
        {loading && (
             <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
             </div>
        )}

        {!loading && value && (
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

      {showSuggestions && value.length > 1 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
          No cities found
        </div>
      )}
    </div>
  );
}