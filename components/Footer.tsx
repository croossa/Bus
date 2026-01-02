"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  const socialIcons = [
    { icon: <FaFacebookF />, link: "#" },
    { icon: <FaTwitter />, link: "#" },
    { icon: <FaYoutube />, link: "#" },
    { icon: <FaInstagram />, link: "#" },
  ];

  return (
    <footer className="relative bg-black backdrop-blur-md shadow-md text-white py-20 px-6 md:px-16 lg:px-28">
      {/* Changed to GRID layout for better positioning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

        {/* 1. LEFT COLUMN: LOGO & DESCRIPTION (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 max-w-xl">
          <h2 className="text-2xl font-bold">
            <span className="text-[#ceb45f]">CROOSSA</span>{" "}
            <span className="text-white">BUS TRANSFERS</span>
          </h2>

          <h1 className="mt-8 text-3xl md:text-4xl font-extrabold leading-tight">
            CARING ABOUT YOUR SAFETY WITH PROFESSIONAL DRIVERS AND MODERN BUSES
          </h1>

          <div className="flex gap-5 mt-10">
            {socialIcons.map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="w-12 h-12 flex items-center justify-center text-xl rounded-full border border-[#ceb45f] text-[#ceb45f] transition-all duration-300 hover:border-white hover:text-white"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* 2. CENTER/RIGHT COLUMN: ABOUT US LINKS */}
        {/* 'lg:justify-self-center' moves this block to the visual center relative to the grid */}
        <div className="lg:justify-self-center">
            <h3 className="text-xl font-bold mb-6 text-[#ceb45f] uppercase tracking-wider">About Us</h3>
            <ul className="space-y-4 text-white/80 font-medium">
              <li>
                <Link href="/payment-term" className="hover:text-[#ceb45f] transition-colors flex items-center gap-2">
                  <span>→</span> Payments
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#ceb45f] transition-colors flex items-center gap-2">
                  <span>→</span> Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/working-hours" className="hover:text-[#ceb45f] transition-colors flex items-center gap-2">
                  <span>→</span> Working Hours
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#ceb45f] transition-colors flex items-center gap-2">
                  <span>→</span> FAQ
                </Link>
              </li>
            </ul>
        </div>

      </div>

      {/* COPYRIGHT BAR */}
      <div className="mt-20 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
        <p>© All Rights Reserved - 2025 - <span className="text-[#ceb45f] font-bold">Croossa</span></p>
      </div>
    </footer>
  );
}
