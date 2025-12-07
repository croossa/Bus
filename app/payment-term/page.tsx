"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; // Ensure path is correct
import { ArrowLeft, CreditCard, ShieldCheck, RefreshCcw, Lock } from "lucide-react";

export default function PaymentTermsPage() {
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
            PAYMENT <span style={{ color: "#ceb45f" }}>TERMS</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            Transparent, secure, and hassle-free transactions.
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
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 space-y-10">
                
                {/* Section 1 */}
                <div className="flex gap-6">
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 bg-black text-[#ceb45f] rounded-full flex items-center justify-center">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Accepted Payment Modes</h3>
                        <p className="text-gray-600 leading-relaxed">
                            We accept payments via Credit Cards (Visa, MasterCard, Amex), Debit Cards, Net Banking, and UPI (Google Pay, PhonePe, Paytm). All payments are processed in Indian Rupees (INR).
                        </p>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 2 */}
                <div className="flex gap-6">
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 bg-black text-[#ceb45f] rounded-full flex items-center justify-center">
                            <Lock size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Transactions</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Your security is our priority. Crossa uses industry-standard encryption (SSL) to protect your payment details. We do not store your card numbers or CVV on our servers. All transactions are handled by our secure payment partner, Razorpay.
                        </p>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 3 */}
                <div className="flex gap-6">
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 bg-black text-[#ceb45f] rounded-full flex items-center justify-center">
                            <RefreshCcw size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Refund Policy</h3>
                        <p className="text-gray-600 leading-relaxed">
                            In case of a cancellation, the refund amount (calculated based on the operator's policy) will be credited back to the original source of payment within 5-7 working days. If a transaction fails but money is deducted, it will be automatically refunded within 48 hours.
                        </p>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 4 */}
                <div className="flex gap-6">
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 bg-black text-[#ceb45f] rounded-full flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Transaction Fees</h3>
                        <p className="text-gray-600 leading-relaxed">
                            The total price displayed at checkout is final, inclusive of applicable taxes. However, your bank may charge a nominal convenience fee for certain payment methods (e.g., Credit Cards). Crossa does not charge any hidden booking fees.
                        </p>
                    </div>
                </div>

            </div>

            {/* FOOTER NOTE */}
            <p className="text-center text-gray-400 text-sm mt-8">
                Last updated: January 2025. For further queries, contact <span className="text-black font-medium">support@crossa.in</span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}