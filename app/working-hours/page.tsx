"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; 
import { ArrowLeft, Clock, Calendar, Globe, Phone, Mail, MapPin } from "lucide-react";

export default function WorkingHoursPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen font-sans bg-slate-50">
      
      {/* 1. HERO BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Image 
            src={bgImage} 
            alt="Background" 
            fill 
            quality={100} 
            style={{ objectFit: "cover" }} 
            className="opacity-90"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* 2. HERO CONTENT */}
      <div className="fixed top-0 left-0 w-full h-[50vh] flex flex-col items-center justify-center z-0 text-white pointer-events-none px-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-center">
            WORKING <span style={{ color: "#ceb45f" }}>HOURS</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            We are available around the clock to ensure your journey never stops.
        </p>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="relative z-10">
        <div className="h-[45vh] w-full bg-transparent"></div>

        <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center pb-20 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
          <div className="w-full max-w-4xl px-6 py-16">
            
            {/* BACK BUTTON */}
            <button 
                onClick={() => router.back()} 
                className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
            >
                <ArrowLeft size={18} /> Back
            </button>

            {/* CONTENT CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* CARD 1: ONLINE SERVICES */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:border-[#ceb45f] transition-all group">
                    <div className="w-16 h-16 bg-black text-[#ceb45f] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Globe size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Online Booking</h3>
                    <p className="text-gray-500 mb-6">Website & Mobile App</p>
                    <div className="w-full bg-green-50 text-green-700 py-3 rounded-lg font-bold">
                        24 / 7 &nbsp; • &nbsp; Always Open
                    </div>
                </div>

                {/* CARD 2: CUSTOMER SUPPORT */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:border-[#ceb45f] transition-all group">
                    <div className="w-16 h-16 bg-black text-[#ceb45f] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Phone size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Support</h3>
                    <p className="text-gray-500 mb-6">Helpline & Live Chat</p>
                    <div className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg font-bold">
                        24 / 7 &nbsp; • &nbsp; All Days
                    </div>
                </div>

                {/* CARD 3: CORPORATE OFFICE */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 md:col-span-2">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-16 h-16 bg-black text-[#ceb45f] rounded-full flex items-center justify-center shrink-0">
                            <MapPin size={32} />
                        </div>
                        <div className="text-center md:text-left w-full">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Head Office Visiting Hours</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-gray-600 font-medium flex items-center gap-2">
                                        <Calendar size={16} /> Monday - Friday
                                    </span>
                                    <span className="font-bold text-slate-900">09:00 AM - 06:00 PM</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-gray-600 font-medium flex items-center gap-2">
                                        <Calendar size={16} /> Saturday
                                    </span>
                                    <span className="font-bold text-slate-900">10:00 AM - 02:00 PM</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center justify-center md:justify-start gap-2">
                                <Clock size={16} />
                                <span>Closed on Sundays and Public Holidays</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 4: EMAIL SUPPORT */}
                <div className="bg-black text-white p-8 rounded-2xl shadow-lg border border-gray-800 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-full text-[#ceb45f]">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Email Support</h3>
                            <p className="text-gray-400 text-sm">Typical response time: 2-4 hours</p>
                        </div>
                    </div>
                    <div className="text-xl font-bold tracking-wide">
                        support@crossa.in
                    </div>
                </div>

            </div>

            {/* FOOTER NOTE */}
            <p className="text-center text-gray-400 text-sm mt-12">
                Note: Operational hours may vary during major festivals. Please check our announcements for updates.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}