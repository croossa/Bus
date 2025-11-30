"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

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
            className="font-extrabold leading-[0.9] text-6xl sm:text-7xl md:text-7xl lg:text-8xl"
            style={{ color: "#ceb45f" }}
          >
            INDIAN
          </h1>

          <h1 className="text-white font-extrabold leading-[0.9] mt-2 text-6xl sm:text-7xl md:text-7xl lg:text-8xl">
            INTERCITY <br /> ROUTES
          </h1>

          <p className="mt-5 text-white font-bold opacity-90 text-xl sm:text-lg md:text-2xl max-w-[95%] md:max-w-none lg:text-3xl">
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
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    console.log({ from, to, date });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center p-6 gap-4 lg:gap-6">
      
      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <MapPin size={16} style={{ color: "#ceb45f" }} />
          From:
        </label>
        <input
          type="text"
          placeholder="Select location"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base"
        />
      </div>

      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <MapPin size={16} style={{ color: "#ceb45f" }} />
          To:
        </label>
        <input
          type="text"
          placeholder="Select destination"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base"
        />
      </div>

      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <Calendar size={16} style={{ color: "#ceb45f" }} />
          Date:
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base"
        />
      </div>

      <div className="w-full md:w-auto mt-2 md:mt-6">
        <Button
          onClick={handleSearch}
          className="w-full md:w-auto px-8 lg:px-10 py-6 text-base lg:text-lg whitespace-nowrap cursor-pointer"
          style={{ backgroundColor: "#ceb45f" }}
        >
          SEARCH
        </Button>
      </div>
    </div>
  );
}
