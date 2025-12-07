"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; 
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
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
            TERMS & <span style={{ color: "#ceb45f" }}>CONDITIONS</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            Please read these terms carefully before using our services.
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
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 space-y-12">
                
                {/* Introduction */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-black/5 rounded-lg text-black">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-2 border-l-2 border-gray-200">
                        Welcome to Crossa. By accessing our website and using our services to book bus tickets, you agree to be bound by the following terms and conditions. If you do not agree with any part of these terms, you must not use our services.
                    </p>
                </div>

                {/* Booking Policy */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-black/5 rounded-lg text-black">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">2. Booking Policy</h2>
                    </div>
                    <ul className="space-y-3 text-gray-600 list-disc pl-5">
                        <li>Crossa acts as an aggregator/agent for bus operators. We do not own or operate the buses ourselves.</li>
                        <li>The amenities, routes, and schedules are managed by the respective bus operators.</li>
                        <li>Tickets are valid only for the date and time specified.</li>
                        <li>Passengers must carry a valid ID proof along with the ticket (mTicket or printout) during the journey.</li>
                    </ul>
                </div>

                {/* User Responsibilities */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-black/5 rounded-lg text-black">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">3. User Responsibilities</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        You agree to provide accurate, current, and complete information during the booking process. You are responsible for maintaining the confidentiality of your account and booking details. Crossa is not liable for any loss or damage arising from your failure to protect your information.
                    </p>
                </div>

                {/* Cancellation & Refund */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-black/5 rounded-lg text-black">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">4. Cancellations & Refunds</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        Cancellation charges are determined by the bus operator's policy. Refunds will be processed to the original payment method within 5-7 working days. Crossa service fees (if any) are non-refundable.
                    </p>
                </div>

                {/* Limitation of Liability */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-black/5 rounded-lg text-black">
                            <Scale size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">5. Limitation of Liability</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        Crossa is not responsible for delays, cancellations, accidents, or loss of baggage caused by the bus operator. Our liability is limited to the amount paid for the ticket.
                    </p>
                </div>

            </div>

            {/* FOOTER NOTE */}
            <p className="text-center text-gray-400 text-sm mt-8">
                Last updated: January 15, 2025.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}