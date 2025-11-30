"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <h1 className="text-white text-2xl font-bold cursor-pointer">TOURIX</h1>

        <ul className="hidden md:flex space-x-8 text-white font-medium">
          <li className="cursor-pointer">Home</li>
          <li className="cursor-pointer">About</li>
          <li className="cursor-pointer">Store</li>
          <li className="cursor-pointer">Articles</li>
          <li className="cursor-pointer">Contacts</li>
        </ul>

        <button
          className="md:hidden text-white focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 py-4" : "max-h-0"
        } ${isScrolled ? "bg-black/80" : "bg-transparent"}`}
      >
        <ul className="flex flex-col space-y-4 text-white font-medium px-6">
          <li className="cursor-pointer" onClick={() => setIsOpen(false)}>Home</li>
          <li className="cursor-pointer" onClick={() => setIsOpen(false)}>About</li>
          <li className="cursor-pointer" onClick={() => setIsOpen(false)}>Store</li>
          <li className="cursor-pointer" onClick={() => setIsOpen(false)}>Articles</li>
          <li className="cursor-pointer" onClick={() => setIsOpen(false)}>Contacts</li>
        </ul>
      </div>
    </nav>
  );
}
