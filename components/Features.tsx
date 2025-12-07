"use client";

import { ShieldCheck, Clock, Award, Headphones } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck size={40} />,
    title: "Safety First",
    description: "Every bus is GPS-tracked and sanitized. We partner with top-rated operators."
  },
  {
    icon: <Clock size={40} />,
    title: "On-Time Service",
    description: "Live tracking and rigorous scheduling ensure you spend less time waiting."
  },
  {
    icon: <Award size={40} />,
    title: "Best Prices",
    description: "Zero hidden fees. We offer competitive rates and exclusive member discounts."
  },
  {
    icon: <Headphones size={40} />,
    title: "24/7 Support",
    description: "Our customer support team is available round the clock to assist you."
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            Why Choose <span style={{ color: "#ceb45f" }}>Crossa?</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            We don&apos;t just sell tickets; we sell a seamless travel experience.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-center"
            >
              <div className="w-16 h-16 mx-auto bg-black text-[#ceb45f] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}