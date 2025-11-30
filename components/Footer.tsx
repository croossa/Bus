"use client";

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
    <footer className="relative bg-black/80 backdrop-blur-md shadow-md text-white py-20 px-6 md:px-16 lg:px-28">
      <div className="flex flex-col lg:flex-row justify-between gap-16">

        <div className="max-w-xl">

          <h2 className="text-2xl font-bold">
            <span className="text-[#ceb45f]">CROSSA</span>{" "}
            <span className="text-white">BUS TRANSFERS</span>
          </h2>

          <h1 className="mt-10 text-3xl md:text-4xl font-extrabold leading-tight">
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

        <div className="hidden sm:grid grid-cols-2 gap-16">

          <div>
            <h3 className="text-xl font-bold mb-5 text-[#ceb45f]">ABOUT US</h3>
            <ul className="space-y-3 text-white/80">
              <li>→ Payments</li>
              <li>→ Delivery</li>
              <li>→ Terms and Conditions</li>
              <li>→ Working Hours</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-5 text-[#ceb45f]">INFORMATION</h3>
            <ul className="space-y-3 text-white/80">
              <li>→ Articles</li>
              <li>→ Products</li>
              <li>→ FAQ</li>
              <li>→ Gallery</li>
            </ul>
          </div>

        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-white/10 text-center text-sm">
        <p>© All Rights Reserved - 2025 - <span className="text-[#ceb45f]">Crossa</span></p>
      </div>
    </footer>
  );
}
