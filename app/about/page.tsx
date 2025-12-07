"use client";

import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; // Ensure this path matches your asset
import { Bus, ShieldCheck, Clock, MapPin, Users, Award } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
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
            ABOUT <span style={{ color: "#ceb45f" }}>CROSSA</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            Redefining intercity travel with comfort, safety, and seamless technology.
        </p>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="relative z-10">
        <div className="h-[50vh] w-full bg-transparent"></div>

        <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center pb-20 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
          <div className="w-full max-w-6xl px-6 py-16">
            
            {/* --- OUR STORY SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div className="space-y-6">
                    <h2 className="text-sm font-bold text-[#ceb45f] tracking-widest uppercase">Our Story</h2>
                    <h3 className="text-4xl font-black text-slate-900 leading-tight">
                        Connecting Cities, <br/> Connecting People.
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Founded in 2024, <strong>CROSSA</strong> was built on a simple idea: bus travel should be easy, reliable, and comfortable. We noticed that booking intercity tickets was often a hassle, filled with confusing agents and hidden charges.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Today, we connect over 500+ cities across India with a premium fleet of buses. Whether you are traveling for business, leisure, or visiting family, Crossa ensures you arrive safely and on time.
                    </p>
                    <div className="pt-4">
                        <Link href="/" className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                            Book Your Journey
                        </Link>
                    </div>
                </div>
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
                     {/* Replace this with an actual about-us image if you have one */}
                     <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                        <Bus size={64} opacity={0.2} />
                        <span className="ml-4 font-bold text-2xl opacity-20">CROSSA FLEET</span>
                     </div>
                </div>
            </div>

            {/* --- STATS BAR --- */}
            <div className="bg-black text-white rounded-2xl p-10 md:p-16 mb-20 shadow-2xl flex flex-col md:flex-row justify-between gap-8 md:gap-0 text-center md:text-left">
                <div>
                    <h4 className="text-5xl font-black text-[#ceb45f] mb-2">500+</h4>
                    <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">Cities Connected</p>
                </div>
                <div>
                    <h4 className="text-5xl font-black text-[#ceb45f] mb-2">1M+</h4>
                    <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">Happy Passengers</p>
                </div>
                <div>
                    <h4 className="text-5xl font-black text-[#ceb45f] mb-2">24/7</h4>
                    <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">Customer Support</p>
                </div>
                <div>
                    <h4 className="text-5xl font-black text-[#ceb45f] mb-2">10k+</h4>
                    <p className="text-gray-400 font-medium tracking-wide text-sm uppercase">Daily Trips</p>
                </div>
            </div>

            {/* --- FEATURES GRID --- */}
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Why Choose Crossa?</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">We don't just sell tickets; we sell an experience. Here is why millions of travelers trust us for their journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Safety First</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Every bus in our network is GPS-tracked and sanitized. We partner only with top-rated operators who adhere to strict safety protocols.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">On-Time Service</h3>
                    <p className="text-gray-600 leading-relaxed">
                        We value your time. Our rigorous scheduling and live tracking features ensure you spend less time waiting and more time traveling.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Award size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Best Prices</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Zero hidden fees. We offer the most competitive rates in the market with exclusive discounts for our loyal members.
                    </p>
                </div>
            </div>

            {/* --- TEAM / CONTACT TEASER --- */}
            <div className="mt-20 border-t border-gray-200 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Have questions?</h3>
                    <p className="text-gray-500">Our support team is just a click away.</p>
                </div>
                <Link href="/contact" className="px-8 py-3 border-2 border-black text-black font-bold rounded-full hover:bg-black hover:text-white transition-colors">
                    Contact Us
                </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}