import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  bookingRefNo: string;    // The temporary order key
  transportPNR: string;    // The final ticket number
  razorpayPaymentId: string; // Crucial for refunds
  amount: number;
  status: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    bookingRefNo: { type: String, required: true, unique: true },
    transportPNR: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "CONFIRMED" },
  },
  { timestamps: true }
);

// Prevent model overwrite in Next.js hot reloading
const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;