"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; 
import { ArrowLeft, Ticket, CheckCircle, AlertCircle, Loader2, IndianRupee, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CancelTicketPage() {
  const router = useRouter();

  // --- STATE ---
  const [orderKey, setOrderKey] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "details" | "review" | "success">("input");
  
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [refundInfo, setRefundInfo] = useState<any>(null);

  // --- ALERT STATE ---
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    type: "error" as "error" | "success",
    onConfirm: () => {}, 
  });

  const triggerAlert = (title: string, description: string, type: "error" | "success" = "error", onConfirm = () => {}) => {
    setAlertConfig({ title, description, type, onConfirm: () => { setIsAlertOpen(false); onConfirm(); } });
    setIsAlertOpen(true);
  };

  // --- LOGIC: FETCH BOOKING ---
  const handleGetDetails = async () => {
    if (!orderKey.trim()) {
      triggerAlert("Missing Info", "Please enter your Ticket Number (Order Key).");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Order_Key: orderKey }) 
      });

      const result = await response.json();

      if (!response.ok || !result.data) throw new Error(result.msg || "Booking not found.");
      
      const booking = result.data.GetBookingDetails || result.data;
      if (!booking) throw new Error("Invalid booking data received.");

      setBookingDetails(booking);
      setStep("details");

    } catch (error: any) {
      triggerAlert("Not Found", error.message || "Could not find booking details.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CALCULATE REFUND ---
  const handleCheckRefund = async () => {
    setLoading(true);
    try {
      const seatsToCancel = bookingDetails.CancelTicket_Details || []; 
      const response = await fetch("/api/cancellation-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Booking_RefNo: orderKey, CancelTicket_Details: seatsToCancel }) 
      });

      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || "Failed to calculate refund.");

      setRefundInfo(result.data);
      setStep("review");

    } catch (error: any) {
      triggerAlert("Error", "Could not calculate refund. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CONFIRM CANCEL ---
  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const seatsToCancel = bookingDetails.CancelTicket_Details || []; 
      const response = await fetch("/api/cancel-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           Booking_RefNo: orderKey,
           BusTicketstoCancel: seatsToCancel,
           CancellationCharge_Key: refundInfo.CancellationCharge_Key || ""
        })
      });

      const result = await response.json();
      if (!response.ok || result.msg !== "Success") throw new Error(result.error || "Cancellation failed.");

      setStep("success");

    } catch (error: any) {
      triggerAlert("Cancellation Failed", error.message || "Unable to cancel ticket.", "error");
    } finally {
      setLoading(false);
    }
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
            CANCEL <span style={{ color: "#ceb45f" }}>TICKET</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center font-light tracking-wide">
            Change of plans? We've got you covered. Manage your booking cancellations seamlessly.
        </p>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="relative z-10">
        <div className="h-[45vh] w-full bg-transparent"></div>

        <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center pb-20 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
          <div className="w-full max-w-2xl px-6 py-16">
            
            {/* BACK BUTTON */}
            <button 
                onClick={() => router.push("/")} 
                className="mb-10 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
            >
                <ArrowLeft size={18} /> Back to Home
            </button>

            {/* MAIN CARD */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all">
                
                {/* --- STEP 1: INPUT --- */}
                {step === "input" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-8">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <Ticket size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Find Booking</h2>
                            <p className="text-gray-500 mt-1">Enter your Ticket Number (Order Key) to proceed</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input 
                                type="text" 
                                placeholder="Order Key (e.g. 176495...)" 
                                value={orderKey}
                                onChange={(e) => setOrderKey(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-lg text-lg focus:outline-none focus:border-black transition-colors bg-gray-50"
                            />
                            <button 
                                onClick={handleGetDetails}
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Find Ticket"}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: DETAILS --- */}
                {step === "details" && bookingDetails && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Ticket Found</h2>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Route</span>
                                <span className="font-bold text-slate-900 text-right">{bookingDetails.Source} <span className="text-[#ceb45f]">→</span> {bookingDetails.Destination}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Travel Date</span>
                                <span className="font-bold text-slate-900">{bookingDetails.TravelDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Seats</span>
                                <span className="font-bold text-slate-900">
                                    {bookingDetails.CancelTicket_Details?.map((s:any) => s.Seat_Number).join(", ")}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={handleCheckRefund}
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Calculate Refund"}
                        </button>
                    </div>
                )}

                {/* --- STEP 3: REVIEW --- */}
                {step === "review" && refundInfo && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Review Refund</h2>
                            <p className="text-gray-500 text-sm mt-1">This action cannot be undone</p>
                        </div>
                        <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Total Paid</span>
                                <span className="font-bold text-slate-900 flex items-center"><IndianRupee size={12}/> {refundInfo.TotalFare}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-red-600">
                                <span>Cancellation Charges</span>
                                <span className="font-bold flex items-center">- <IndianRupee size={12}/> {refundInfo.CancellationCharge}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2"></div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-bold text-slate-900">Refund Amount</span>
                                <span className="font-black text-green-600 flex items-center text-2xl"><IndianRupee size={20}/> {refundInfo.RefundAmount}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep("input")} className="flex-1 py-4 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase text-sm">Cancel</button>
                            <button onClick={handleConfirmCancel} disabled={loading} className="flex-[2] bg-red-600 text-white py-4 rounded-lg font-bold uppercase hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md">
                                {loading ? <Loader2 className="animate-spin" /> : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 4: SUCCESS --- */}
                {step === "success" && (
                    <div className="text-center animate-in zoom-in duration-300 py-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Cancelled!</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Your ticket <strong>{orderKey}</strong> has been cancelled successfully. 
                            <br/>The refund will be credited to your account within 5-7 working days.
                        </p>
                        <button onClick={() => router.push("/")} className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                            Back to Home
                        </button>
                    </div>
                )}

            </div>
            
            {/* Info Note */}
            {step === "input" && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-start gap-3">
                    <Info size={16} className="mt-0.5 shrink-0"/>
                    <p>Cancellation charges depend on the operator's policy and the time remaining before departure.</p>
                </div>
            )}

          </div>
        </div>
      </div>

      {/* ALERT DIALOG */}
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
                <AlertDialogAction onClick={alertConfig.onConfirm} className="bg-black hover:bg-gray-800 text-white px-6">
                    Okay
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}