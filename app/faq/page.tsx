"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; 
import { ArrowLeft, Plus, Minus, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

// --- FAQ DATA ---
const faqData = [
  {
    category: "Booking & Tickets",
    questions: [
      {
        q: "How do I book a bus ticket on Crossa?",
        a: "Booking is easy! Simply enter your origin, destination, and travel date on our homepage. Select your preferred bus, choose your seats, and proceed to payment. Once confirmed, you will receive your ticket via email and SMS."
      },
      {
        q: "Do I need to print my ticket?",
        a: "No, a printout is not mandatory for most operators. Showing the mTicket (SMS/Email) along with a valid government-issued ID proof (Aadhar, Pan Card, etc.) to the bus staff is sufficient."
      },
      {
        q: "I didn't receive my ticket after payment. What should I do?",
        a: "Don't worry. Sometimes SMS/Email delivery can be delayed due to network issues. You can check your booking status using the 'Check Status' feature on our site or contact our 24/7 support."
      }
    ]
  },
  {
    category: "Cancellations & Refunds",
    questions: [
      {
        q: "How can I cancel my ticket?",
        a: "Go to the 'Cancel Ticket' page (link in the menu). Enter your Ticket Number/PNR to see the refund amount. If you agree, click confirm, and your ticket will be cancelled immediately."
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed automatically upon cancellation. The amount will reflect in your original payment source (Bank/Card/Wallet) within 5-7 working days."
      },
      {
        q: "Is the convenience fee refundable?",
        a: "No, the convenience fee charged by Crossa at the time of booking is non-refundable in case of ticket cancellation."
      }
    ]
  },
  {
    category: "Travel & Safety",
    questions: [
      {
        q: "What is the luggage policy?",
        a: "Generally, up to 15kg of personal luggage (one bag) per passenger is allowed. Extra luggage may be charged by the bus operator depending on space availability."
      },
      {
        q: "Can I change my boarding point after booking?",
        a: "Boarding point changes depend on the bus operator. Please contact our support team at least 4 hours before departure, and we will try our best to assist you."
      }
    ]
  }
];

export default function FAQPage() {
  const router = useRouter();
  
  // State to track which question is open (by unique index string)
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            FREQUENTLY <span style={{ color: "#ceb45f" }}>ASKED</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            Got questions? We have got answers. Everything you need to know about traveling with Crossa.
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
                className="mb-10 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
            >
                <ArrowLeft size={18} /> Back
            </button>

            {/* FAQ SECTIONS */}
            <div className="space-y-12">
                {faqData.map((section, sIdx) => (
                    <div key={sIdx} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                             <div className="p-2 bg-black text-[#ceb45f] rounded-lg">
                                <HelpCircle size={20} />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                                {section.category}
                             </h3>
                        </div>

                        <div className="space-y-4">
                            {section.questions.map((item, qIdx) => {
                                const uniqueId = `${sIdx}-${qIdx}`;
                                const isOpen = openIndex === uniqueId;

                                return (
                                    <div 
                                        key={uniqueId} 
                                        className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <button 
                                            onClick={() => toggleAccordion(uniqueId)}
                                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                        >
                                            <span className={`font-bold text-lg ${isOpen ? 'text-black' : 'text-gray-700'}`}>
                                                {item.q}
                                            </span>
                                            <span className={`p-1 rounded-full ${isOpen ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                            </span>
                                        </button>
                                        
                                        <div 
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <p className="px-5 pb-5 text-gray-600 leading-relaxed">
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* CONTACT TEASER */}
            <div className="mt-16 bg-black text-white p-8 md:p-12 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-gray-400">Cannot find the answer you are looking for? Chat with our friendly team.</p>
                </div>
                <Link 
                    href="/contact"
                    className="flex items-center gap-2 bg-[#ceb45f] text-black px-8 py-4 rounded-full font-bold hover:bg-white transition-colors"
                >
                    <MessageCircle size={20} /> Get in Touch
                </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}