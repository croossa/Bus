"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/public/assets/searchHeader.jpg"; 
import { ArrowLeft, Ticket, CheckCircle, AlertCircle, Loader2, IndianRupee, Info, Bus, Calendar, Clock, MapPin, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [bookingRefNo, setBookingRefNo] = useState(""); 
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

  // --- HELPER: GET SEATS FOR CANCELLATION ---
  const getSeatsList = () => {
    if (!bookingDetails) return [];
    
    const rootPNR = bookingDetails.Transport_PNR || "";
    
    if (bookingDetails.CancelTicket_Details) {
        return bookingDetails.CancelTicket_Details;
    } 
    else if (bookingDetails.PAX_Details && Array.isArray(bookingDetails.PAX_Details)) {
        return bookingDetails.PAX_Details.map((pax: any) => ({
            Seat_Number: pax.Seat_Number,
            Ticket_Number: pax.Ticket_Number,
            Transport_PNR: pax.Transport_PNR || rootPNR 
        }));
    } 
    else if (bookingDetails.PaxList && Array.isArray(bookingDetails.PaxList)) {
        return bookingDetails.PaxList.map((pax: any) => ({
            Seat_Number: pax.SeatNo || pax.Seat_Number,
            Ticket_Number: pax.TicketNo || pax.Ticket_Number,
            Transport_PNR: pax.PNR || pax.Transport_PNR || rootPNR
        }));
    }
    return [];
  };

  // --- NEW: GENERATE & DOWNLOAD PDF TICKET (FIXED ROTATION) ---
  const handleDownloadTicket = () => {
    if (!bookingDetails) return;

    const doc = new jsPDF();
    const isCancelled = bookingDetails.Ticket_Status_Desc?.toLowerCase().includes("cancel");

    // --- 1. HEADER (BLUE) ---
    doc.setFillColor(40, 70, 120); 
    doc.rect(0, 0, 210, 24, "F"); // Top bar background

    // Logo Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CROSSA", 14, 16);
    
    // Ticket Label
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const titleText = isCancelled ? "E-TICKET (CANCELLED)" : "E-TICKET";
    doc.text(titleText, 170, 16);

    // --- 2. BOOKING REFERENCES ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    
    // Booking Ref
    doc.text(`Booking Ref: ${bookingRefNo}`, 14, 40);
    // PNR
    doc.text(`PNR: ${bookingDetails.Transport_PNR || "N/A"}`, 140, 40);

    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 45, 196, 45);

    // --- 3. BUS DETAILS ---
    let yPos = 55;
    const leftColX = 14;
    const leftValX = 40;
    const rightColX = 110;
    const rightValX = 130;
    const lineSpacing = 8;

    doc.setFontSize(10);

    // Row 1: Operator
    doc.setFont("helvetica", "bold");
    doc.text("Operator:", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(bookingDetails.Bus_Detail?.Operator_Name || "N/A", leftValX, yPos);
    
    yPos += lineSpacing;

    // Row 2: Bus Type
    doc.setFont("helvetica", "bold");
    doc.text("Bus Type:", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(bookingDetails.Bus_Detail?.Bus_Type || "N/A", leftValX, yPos);

    yPos += lineSpacing + 4; // Extra space

    // Row 3: From / To
    doc.setFont("helvetica", "bold");
    doc.text("From:", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(bookingDetails.Bus_Detail?.From_City || bookingDetails.Source, leftValX, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("To:", rightColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(bookingDetails.Bus_Detail?.To_City || bookingDetails.Destination, rightValX, yPos);

    yPos += lineSpacing;

    // Row 4: Date / Time
    doc.setFont("helvetica", "bold");
    doc.text("Date:", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(bookingDetails.Bus_Detail?.TravelDate || "N/A", leftValX, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Time:", rightColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(bookingDetails.Bus_Detail?.Departure_Time || "N/A", rightValX, yPos);

    // --- 4. PASSENGER TABLE ---
    const passengers = bookingDetails.PAX_Details || bookingDetails.PaxList || [];
    const tableData = passengers.map((p: any) => [
      p.PAX_Name || p.PassengerName || "Guest",
      p.Seat_Number || p.SeatNo,
      p.Gender === 0 || p.Gender === "M" ? "Male" : "Female",
      p.Age
    ]);

    autoTable(doc, {
      startY: yPos + 10,
      head: [['Passenger Name', 'Seat No', 'Gender', 'Age']],
      body: tableData,
      theme: 'grid', 
      headStyles: { 
          fillColor: [230, 235, 245], 
          textColor: [0, 0, 0], 
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
      },
      styles: { 
          fontSize: 10, 
          cellPadding: 3,
          textColor: [50, 50, 50],
          lineWidth: 0.1,
          lineColor: [220, 220, 220]
      },
      alternateRowStyles: { fillColor: [255, 255, 255] }
    });

    // --- 5. CANCELLED STAMP (FIXED: GEOMETRIC APPROACH) ---
    if (isCancelled) {
        const pageWidth = doc.internal.pageSize.width;
        
        // Settings
        const text = "CANCELLED";
        const fontSize = 40;
        const angle = 15;
        const stampColor = [220, 53, 69]; // Red
        
        doc.saveGraphicsState();
        doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
        doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
        doc.setLineWidth(1.5); 
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "bold");
        
        // Position Center
        const centerX = pageWidth / 2 + 10;
        const centerY = 45; 
        
        // 1. Draw Rotated Text
        // @ts-ignore (Angle option is valid in modern jspdf, ignoring TS warning if types are old)
        doc.text(text, centerX, centerY, { align: 'center', angle: angle });

        // 2. Draw Rotated Box (Manually calculated to avoid Matrix errors)
        const textWidth = doc.getTextWidth(text);
        const textHeight = fontSize / 2.5; 
        const padding = 5;
        
        const w = textWidth + (padding * 2);
        const h = textHeight + (padding * 3);
        
        // Convert Angle to Radians
        const rad = angle * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Helper to rotate a point around center (0,0) then translate to (centerX, centerY)
        // Adjust centerY slightly up because text draws from baseline
        const boxCenterY = centerY - (textHeight/2);

        const getRotatedPoint = (dx: number, dy: number) => ({
            x: centerX + (dx * cos - dy * sin),
            y: boxCenterY + (dx * sin + dy * cos)
        });

        const halfW = w / 2;
        const halfH = h / 2;

        const p1 = getRotatedPoint(-halfW, -halfH); // Top-Left
        const p2 = getRotatedPoint(halfW, -halfH);  // Top-Right
        const p3 = getRotatedPoint(halfW, halfH);   // Bottom-Right
        const p4 = getRotatedPoint(-halfW, halfH);  // Bottom-Left

        // Draw Lines
        doc.line(p1.x, p1.y, p2.x, p2.y);
        doc.line(p2.x, p2.y, p3.x, p3.y);
        doc.line(p3.x, p3.y, p4.x, p4.y);
        doc.line(p4.x, p4.y, p1.x, p1.y);

        doc.restoreGraphicsState();
    }

    // --- 6. FOOTER ---
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Important: Please carry a valid ID proof while travelling.", 14, finalY);
    doc.text("This is a computer generated ticket and does not require a signature.", 14, finalY + 5);

    // --- 7. SAVE ---
    doc.save(`${isCancelled ? 'Cancelled_' : ''}Ticket_${bookingRefNo}.pdf`);
  };

  // --- STEP 1: FETCH BOOKING DETAILS ---
  const handleGetDetails = async () => {
    if (!bookingRefNo.trim()) {
      triggerAlert("Missing Info", "Please enter your Booking Reference Number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Booking_RefNo: bookingRefNo }) 
      });

      const result = await response.json();

      if (!response.ok || !result.data) {
        throw new Error(result.msg || "Booking not found.");
      }

      const booking = result.data.GetBookingDetails || result.data; 
      
      if (!booking) throw new Error("Invalid booking data received.");

      setBookingDetails(booking);
      setStep("details");

    } catch (error: any) {
      console.error(error);
      triggerAlert("Not Found", error.message || "Could not find booking details.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: CALCULATE REFUND ---
  const handleCheckRefund = async () => {
    setLoading(true);

    try {
      const seatsToCancel = getSeatsList();
      
      if (seatsToCancel.length === 0) {
         throw new Error("Could not find seat details to cancel.");
      }

      const payload = {
        Booking_RefNo: bookingRefNo,
        CancelTicket_Details: seatsToCancel
      };

      const response = await fetch("/api/cancellationcharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to calculate refund.");
      }

      const chargeData = result.data;

      let totalFare = 0;
      if (bookingDetails.BookingPaymentDetails && bookingDetails.BookingPaymentDetails.length > 0) {
          totalFare = Number(bookingDetails.BookingPaymentDetails[0].Payment_Amount);
      } else {
          totalFare = 0; 
      }

      let cancelCharges = 0;
      if (chargeData.CancellationPenaltyValues && Array.isArray(chargeData.CancellationPenaltyValues)) {
          cancelCharges = chargeData.CancellationPenaltyValues.reduce((sum: number, item: any) => sum + Number(item.Cancellation_Penalty), 0);
      }
      cancelCharges += Number(chargeData.ServiceCharge || 0);

      const refundAmount = totalFare - cancelCharges;

      setRefundInfo({
        TotalFare: totalFare,
        CancellationCharge: cancelCharges,
        RefundAmount: refundAmount,
        CancellationCharge_Key: chargeData.CancellationCharge_Key
      });

      setStep("review");

    } catch (error: any) {
      console.error(error);
      triggerAlert("Error", "Could not calculate refund. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: CONFIRM CANCEL ---
  const handleConfirmCancel = async () => {
    setLoading(true);

    try {
      const seatsToCancel = getSeatsList();

      const payload = {
        Booking_RefNo: bookingRefNo,
        BusTicketstoCancel: seatsToCancel,
        CancellationCharge_Key: refundInfo.CancellationCharge_Key || ""
      };

      const response = await fetch("/api/cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.msg !== "Success") {
        throw new Error(result.error || result.msg || "Cancellation failed.");
      }

      setStep("success");

    } catch (error: any) {
      console.error(error);
      triggerAlert("Cancellation Failed", error.message || "Unable to cancel ticket.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("confirm")) return "text-green-600 bg-green-50 border-green-200";
    if (s.includes("cancel")) return "text-red-600 bg-red-50 border-red-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  return (
    <div className="relative min-h-screen font-sans bg-slate-50">
      
      {/* 1. HERO BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Image src={bgImage} alt="Background" fill quality={100} style={{ objectFit: "cover" }} className="opacity-90" />
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
            
            <button onClick={() => router.push("/")} className="mb-10 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Home
            </button>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all">
                
                {/* --- STEP 1: INPUT --- */}
                {step === "input" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-8">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <Ticket size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Find Booking</h2>
                            <p className="text-gray-500 mt-1">Enter your Booking Reference Number to proceed</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input 
                                type="text" 
                                placeholder="Booking Ref No (e.g. BBB7CI9X)" 
                                value={bookingRefNo}
                                onChange={(e) => setBookingRefNo(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-lg text-lg focus:outline-none focus:border-black transition-colors bg-gray-50"
                            />
                            <button onClick={handleGetDetails} disabled={loading} className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                                {loading ? <Loader2 className="animate-spin" /> : "Find Ticket"}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: DETAILS --- */}
                {step === "details" && bookingDetails && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                             <h2 className="text-xl font-bold text-slate-900">Ticket Details</h2>
                             <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(bookingDetails.Ticket_Status_Desc)}`}>
                                 {bookingDetails.Ticket_Status_Desc || "Status Unknown"}
                             </span>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 space-y-4">
                            
                            {/* Route */}
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">From</p>
                                    <p className="font-bold text-slate-900 text-lg">{bookingDetails.Bus_Detail?.From_City || bookingDetails.Source || "Origin"}</p>
                                </div>
                                <ArrowLeft className="text-gray-400 rotate-180" size={20} />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-bold uppercase">To</p>
                                    <p className="font-bold text-slate-900 text-lg">{bookingDetails.Bus_Detail?.To_City || bookingDetails.Destination || "Destination"}</p>
                                </div>
                            </div>

                            {/* Operator & Bus Type */}
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Operator</p>
                                <p className="font-bold text-slate-900">{bookingDetails.Bus_Detail?.Operator_Name || "Operator Name"}</p>
                                <p className="text-xs text-gray-600 mt-1">{bookingDetails.Bus_Detail?.Bus_Type || "Bus Type"}</p>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-[#ceb45f]" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                                        <p className="font-bold text-slate-900 text-sm">{bookingDetails.Bus_Detail?.TravelDate || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-[#ceb45f]" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Time</p>
                                        <p className="font-bold text-slate-900 text-sm">{bookingDetails.Bus_Detail?.Departure_Time || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* PNR & Ref */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Transport PNR</p>
                                    <p className="font-mono text-slate-900 font-bold">{bookingDetails.Transport_PNR || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Booking Ref</p>
                                    <p className="font-mono text-slate-900 font-bold">{bookingDetails.Booking_RefNo}</p>
                                </div>
                            </div>

                            {/* Seats */}
                            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
                                <MapPin size={16} className="text-gray-400" />
                                <span className="text-sm font-bold text-slate-700">Seat(s):</span>
                                <span className="text-sm font-black text-slate-900">
                                    {bookingDetails.PAX_Details?.map((p:any) => p.Seat_Number).join(", ") || 
                                     bookingDetails.PaxList?.map((p:any) => p.SeatNo).join(", ") || "N/A"}
                                </span>
                            </div>

                        </div>

                        {/* --- BUTTONS SECTION --- */}
                        <div className="space-y-3">
                            <button 
                                onClick={handleDownloadTicket}
                                className="w-full bg-white border-2 border-slate-900 text-slate-900 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Download Ticket
                            </button>

                            {bookingDetails.Ticket_Status_Desc?.toLowerCase().includes("confirm") ? (
                                <button 
                                    onClick={handleCheckRefund}
                                    disabled={loading}
                                    className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Calculate Refund & Cancel"}
                                </button>
                            ) : (
                                <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-500 text-sm">
                                    This ticket cannot be cancelled (Status: {bookingDetails.Ticket_Status_Desc})
                                </div>
                            )}
                        </div>
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
                            <button onClick={() => setStep("details")} className="flex-1 py-4 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase text-sm">Back</button>
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
                            Your ticket <strong>{bookingRefNo}</strong> has been cancelled successfully. 
                            <br/>The refund will be credited to your account within 5-7 working days.
                        </p>
                        <button onClick={() => router.push("/")} className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                            Back to Home
                        </button>
                    </div>
                )}

            </div>
            
            {step === "input" && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-start gap-3">
                    <Info size={16} className="mt-0.5 shrink-0"/>
                    <p>Cancellation charges depend on the operator's policy and the time remaining before departure.</p>
                </div>
            )}

          </div>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white rounded-xl shadow-2xl border-0">
            <AlertDialogHeader>
                <AlertDialogTitle className={`flex items-center gap-2 text-xl ${alertConfig.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {alertConfig.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    {alertConfig.title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 text-base mt-2">{alertConfig.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogAction onClick={alertConfig.onConfirm} className="bg-black hover:bg-gray-800 text-white px-6">Okay</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}