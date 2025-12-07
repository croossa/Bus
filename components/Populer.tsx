"use client";

import Image from "next/image";

// Sample Data for Popular Destinations
const destinations = [
  {
    id: 1,
    name: "Agra",
    location: "Uttar Pradesh",
    // Make sure the file name in /public/assets matches exactly (case-sensitive)
    image: "/assets/Agra.avif", 
    description: "Home to the iconic Taj Mahal, a symbol of eternal love.",
  },
  {
    id: 2,
    name: "Jaipur",
    location: "Rajasthan",
    image: "/assets/Jaipur.avif",
    description: "The Pink City, famous for its palaces and forts.",
  },
  {
    id: 3,
    name: "Goa",
    location: "Goa",
    image: "/assets/Goa.avif",
    description: "Beautiful beaches, vibrant nightlife, and Portuguese heritage.",
  },
  {
    id: 4,
    name: "Kerala",
    location: "South India",
    image: "/assets/Kerala.avif",
    description: "God's Own Country, known for its backwaters and greenery.",
  },
  {
    id: 5,
    name: "Varanasi",
    location: "Uttar Pradesh",
    image: "/assets/Varanasi.avif",
    description: "The spiritual capital of India, situated on the banks of the Ganges.",
  },
  {
    id: 6,
    name: "Manali",
    location: "Himachal Pradesh",
    image: "/assets/Manali.avif",
    description: "A high-altitude resort town known for its cool climate and mountains.",
  },
];

export default function PopularDestinations() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            Popular <span style={{ color: "#ceb45f" }}>Destinations</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Explore the most visited and loved cities across India. From historical monuments to serene beaches.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div 
              key={destination.id} 
              className="group relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg cursor-default"
            >
              {/* Background Image */}
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-[#ceb45f] text-xs font-bold uppercase tracking-widest mb-2">
                  {destination.location}
                </p>
                <h3 className="text-white text-3xl font-bold mb-2">
                  {destination.name}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {destination.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}