"use client";

import { useState } from "react";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; // Ensure path is correct
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContactPage() {
  
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  // --- ALERT STATE ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    type: "success" as "success" | "error",
  });

  const triggerAlert = (title: string, description: string, type: "success" | "error") => {
    setAlertConfig({ title, description, type });
    setIsAlertOpen(true);
  };

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if(!formData.name || !formData.email || !formData.message) {
        triggerAlert("Missing Fields", "Please fill in all required fields.", "error");
        return;
    }

    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
        setLoading(false);
        triggerAlert(
            "Message Sent!", 
            "Thank you for contacting Crossa. Our support team will get back to you within 24 hours.", 
            "success"
        );
        setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
    }, 1500);
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
            CONTACT <span style={{ color: "#ceb45f" }}>US</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            We are here to help. Reach out to us for any booking inquiries or support.
        </p>
      </div>

      {/* 3. SCROLLABLE CARD */}
      <div className="relative z-10">
        <div className="h-[45vh] w-full bg-transparent"></div>

        <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center pb-20 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
          <div className="w-full max-w-6xl px-6 py-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                
                {/* --- LEFT: CONTACT INFO --- */}
                <div className="space-y-10">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 mb-6">Get in touch</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Have a question about your booking? Want to partner with us? 
                            Fill out the form or drop us a line directly.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Address */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black text-[#ceb45f] rounded-full flex items-center justify-center shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">Head Office</h4>
                                <p className="text-gray-500">
                                    123 Crossa Tower, High Street, <br/>
                                    Bangalore, Karnataka - 560001
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black text-[#ceb45f] rounded-full flex items-center justify-center shrink-0">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">Phone</h4>
                                <p className="text-gray-500">+91 98765 43210</p>
                                <p className="text-gray-400 text-sm">Mon-Sun, 9am - 6pm</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black text-[#ceb45f] rounded-full flex items-center justify-center shrink-0">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">Email</h4>
                                <p className="text-gray-500">support@crossa.in</p>
                                <p className="text-gray-500">partners@crossa.in</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: FORM --- */}
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Name"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="test@example.com"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                            <input 
                                type="text" 
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Booking Issue / Refund / General"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                placeholder="How can we help you?"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:bg-white transition-all resize-none"
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? "Sending..." : (
                                <>
                                    Send Message <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- ALERT DIALOG --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white rounded-xl shadow-2xl border-0">
            <AlertDialogHeader>
                <AlertDialogTitle className={`flex items-center gap-2 text-xl ${alertConfig.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {alertConfig.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    {alertConfig.title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 text-base mt-2">
                    {alertConfig.description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogAction 
                    onClick={() => setIsAlertOpen(false)}
                    className="bg-black hover:bg-gray-800 text-white px-6"
                >
                    Okay
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}