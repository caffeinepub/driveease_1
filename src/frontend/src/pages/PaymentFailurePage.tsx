import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, Home } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "../router";

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        data-ocid="payment_failure.card"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
        >
          <AlertCircle size={44} className="text-red-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-500 mb-6">
            Something went wrong with your payment. Please try again or use UPI
            for instant payment.
          </p>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
            <p className="text-sm text-amber-700 font-medium mb-2">
              💡 Tip: Use UPI for faster payments
            </p>
            <p className="text-xs text-amber-600">
              Scan our PhonePe QR code or transfer to Axis Bank A/c
              922010062230782 (IFSC: UTIB0004620)
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/payment")}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
              data-ocid="payment_failure.primary_button"
            >
              <CreditCard size={16} className="mr-2" />
              Try Again / Pay via UPI
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full rounded-xl border-gray-200"
              data-ocid="payment_failure.secondary_button"
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
