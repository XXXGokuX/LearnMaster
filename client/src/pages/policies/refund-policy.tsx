import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <motion.div 
          className="container mx-auto py-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="prose prose-lg max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Refund and Cancellation Policy</h1>
            
            <section className="mb-8">
              <h2>Refund Process</h2>
              <div className="space-y-4">
                <p>
                  We will notify you once we've received your Cancellation, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days.
                </p>
                <p>
                  Please remember it can take some time for your bank or credit card company to process and post the refund too.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2>Refund Timeline</h2>
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <h3 className="text-xl font-semibold mb-4">Important Information</h3>
                <ul className="space-y-2">
                  <li>Refund processing time: Up to 10 business days</li>
                  <li>Additional time may be required for bank processing</li>
                  <li>Refunds are issued to the original payment method</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2>Contact Information</h2>
              <p>
                If more than 15 business days have passed since we've approved your Cancellation, please contact our support team at:
              </p>
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 mt-4">
                <p className="font-semibold">Email: support@learningplatform.com</p>
                <p className="font-semibold">Phone: +1 (XXX) XXX-XXXX</p>
              </div>
            </section>

            <section className="mb-8">
              <h2>Eligibility for Refund</h2>
              <ul>
                <li>Course access less than 15 days</li>
                <li>Less than 25% of course content accessed</li>
                <li>Valid reason for cancellation provided</li>
                <li>Original purchase proof available</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
