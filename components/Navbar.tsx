"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
          isScrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
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
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-full md:hidden bg-black/80 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h1 className="text-white text-2xl font-bold cursor-pointer">TOURIX</h1>
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(false)}
          >
            <X size={28} />
          </button>
        </div>

        <ul className="flex flex-col items-center justify-center space-y-8 text-white text-xl font-medium h-[80%]">
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
