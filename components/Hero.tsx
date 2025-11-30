import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative w-full">
      {/* HERO IMAGE SECTION */}
      <div
        className="h-[102vh] min-h-[600px] w-full bg-cover bg-no-repeat relative flex flex-col justify-center md:block"
        style={{
          backgroundImage: "url('/assets/Hero.jpg')",
          backgroundPosition: "center 30%",
        }}
      >
          <div className="absolute inset-0 bg-black opacity-30"></div> 
        {/* TEXT BLOCK */}
        <div
          className="
            absolute 
            top-[30vh] sm:top-[30vh] md:top-[22vh] 
            left-1/2 md:left-[10%] lg:left-[20%] 
            transform md:transform-none 
            -translate-x-1/2 md:translate-x-0 
            text-center md:text-left 
            w-[90%] sm:w-[80%] md:w-auto 
            max-w-xl 
            z-10
          "
        >
          <h1 className="text-yellow-400 font-extrabold leading-[0.9] 
                         text-6xl sm:text-7xl md:text-7xl lg:text-8xl">
            INDIAN
          </h1>

          <h1 className="text-white font-extrabold leading-[0.9] mt-2
                         text-6xl sm:text-7xl md:text-7xl lg:text-8xl">
            INTERCITY <br /> ROUTES
          </h1>

          <p className="mt-5 text-white font-bold opacity-90 text-xl
                         sm:text-lg md:text-2xl 
                        max-w-[95%] md:max-w-none lg:text-3xl">
            BOOK TICKETS ONLINE AND <br />
            TRAVEL WITH EASE <br />
            AROUND ALL INDIA
          </p>
        </div>

        {/* DESKTOP SEARCH BOX */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 bottom-10 w-[90%] max-w-6xl z-20">
          <SearchBox />
        </div>
      </div>

      {/* MOBILE SEARCH BOX */}
      <div className="block md:hidden bg-white w-full py-8 px-4 shadow-lg relative z-20">
        <SearchBox />
      </div>
    </div>
  );
}

function SearchBox() {
  return (
    <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center p-6 gap-4 lg:gap-6">
      
      {/* FROM */}
      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <MapPin size={16} className="text-yellow-600" />
          From:
        </label>
        <input
          type="text"
          placeholder="Select location"
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base"
        />
      </div>

      {/* TO */}
      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <MapPin size={16} className="text-blue-600" />
          To:
        </label>
        <input
          type="text"
          placeholder="Select destination"
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base"
        />
      </div>

      {/* DATE */}
      <div className="flex flex-col w-full">
        <label className="text-gray-500 text-sm flex items-center gap-2 mb-1 whitespace-nowrap">
          <Calendar size={16} className="text-green-600" />
          Date:
        </label>
        <input
          type="date"
          className="border rounded-md px-3 py-3 w-full text-sm lg:text-base"
        />
      </div>

      {/* BUTTON */}
      <div className="w-full md:w-auto mt-2 md:mt-6">
        <Button className="bg-yellow-600 hover:bg-yellow-700 w-full md:w-auto px-8 lg:px-10 py-6 text-base lg:text-lg whitespace-nowrap">
          SEARCH
        </Button>
      </div>
    </div>
  );
}
