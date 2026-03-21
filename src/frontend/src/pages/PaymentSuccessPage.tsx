import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "../router";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        data-ocid="payment_success.card"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={44} className="text-green-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-500 mb-6">
            Your booking has been confirmed. Your driver will contact you
            shortly.
          </p>

          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-green-700">✓ Confirmed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment via</span>
              <span className="font-semibold text-gray-800">DriveEase Pay</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/my-bookings")}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
              data-ocid="payment_success.primary_button"
            >
              <Receipt size={16} className="mr-2" />
              View My Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full rounded-xl border-gray-200"
              data-ocid="payment_success.secondary_button"
            >
              <Home size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
