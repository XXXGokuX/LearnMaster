import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function TermsAndConditions() {
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
            <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
            
            <section className="mb-8">
              <h2>1. Course Access and Usage</h2>
              <ul>
                <li>Users must register an account to access courses</li>
                <li>Course content is for personal, non-commercial use only</li>
                <li>Sharing account credentials is strictly prohibited</li>
                <li>Users must maintain the confidentiality of their account information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>2. Payment and Refunds</h2>
              <ul>
                <li>All payments are processed securely through our platform</li>
                <li>Course fees are non-refundable after 15 days of purchase</li>
                <li>Refund requests must be submitted through proper channels</li>
                <li>We reserve the right to modify course pricing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>3. User Conduct</h2>
              <ul>
                <li>Users must not engage in disruptive behavior</li>
                <li>Respect intellectual property rights</li>
                <li>Do not share copyrighted material without permission</li>
                <li>Maintain professional conduct in all interactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>4. Content Usage</h2>
              <ul>
                <li>Course materials are protected by copyright</li>
                <li>Downloaded content is for personal use only</li>
                <li>Redistribution of content is prohibited</li>
                <li>We reserve the right to modify or remove content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>5. Platform Availability</h2>
              <ul>
                <li>We strive to maintain 24/7 platform availability</li>
                <li>Maintenance windows may affect accessibility</li>
                <li>No guarantee of uninterrupted service</li>
                <li>Users will be notified of planned maintenance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>6. Account Termination</h2>
              <ul>
                <li>We reserve the right to suspend or terminate accounts</li>
                <li>Users may delete their account at any time</li>
                <li>Violation of terms may result in immediate termination</li>
                <li>Course access ends upon account termination</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the platform constitutes acceptance of modified terms.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
