"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link"; // Import Link for navigation

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          isScrolled || !isHomePage 
            ? "bg-black/90 backdrop-blur-md shadow-md" 
            : "bg-transparent"
        }`}
      >
        {/* LOGO - Clicks to Home */}
        <Link href="/">
          <h1 className="text-white text-2xl font-bold cursor-pointer tracking-wider">CROOSSA</h1>
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center space-x-8 text-white font-medium text-sm tracking-wide">
          <li className="hover:text-[#ceb45f] transition-colors cursor-pointer">
            <Link href="/about">About</Link>
          </li>
          <li className="hover:text-[#ceb45f] transition-colors cursor-pointer">
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <Link 
              href="/cancel-bus"
              className="border border-white/30 px-5 py-2 rounded-full hover:bg-white hover:text-black transition-all"
            >
              Bus Ticket
            </Link>
          </li>
        </ul>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden text-white focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:hidden bg-black transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h1 className="text-white text-2xl font-bold tracking-wider">CROOSSA</h1>
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(false)}
          >
            <X size={28} />
          </button>
        </div>

        <ul className="flex flex-col items-center justify-center space-y-8 text-white text-xl font-medium h-[80%]">
          <li onClick={() => setIsOpen(false)}>
            <Link href="/about">About</Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link href="/contact">Contact</Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link href="/cancel-bus" className="text-[#ceb45f]">Bus Ticket</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
