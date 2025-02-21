import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            
            <section className="mb-8">
              <h2>Introduction</h2>
              <p>
                This Privacy Policy describes how we collect, use, share, protect or otherwise process your information/personal data through our platform. Please note that you may be able to browse certain sections of the Platform without registering with us.
              </p>
            </section>

            <section className="mb-8">
              <h2>Collection</h2>
              <p>
                We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship. Some of the information that we may collect includes but is not limited to personal data/information provided to us during sign-up/registering or using our Platform such as:
              </p>
              <ul>
                <li>Name</li>
                <li>Date of birth</li>
                <li>Address</li>
                <li>Telephone/mobile number</li>
                <li>Email ID</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Usage</h2>
              <p>
                We use personal data to provide the services you request. To the extent we use your personal data to market to you, we will provide you the ability to opt-out of such uses. We use your personal data to:
              </p>
              <ul>
                <li>Assist instructors in handling and fulfilling courses</li>
                <li>Enhance customer experience</li>
                <li>Resolve disputes</li>
                <li>Troubleshoot problems</li>
                <li>Inform you about online and offline offers, products, services, and updates</li>
                <li>Customize your experience</li>
                <li>Detect and protect us against error, fraud and other criminal activity</li>
                <li>Enforce our terms and conditions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Security Precautions</h2>
              <p>
                To protect your personal data from unauthorized access or disclosure, loss or misuse we adopt reasonable security practices and procedures. We adhere to our security guidelines to protect it against unauthorized access and offer the use of a secure server.
              </p>
            </section>

            <section className="mb-8">
              <h2>Data Deletion and Retention</h2>
              <p>
                You have an option to delete your account by visiting your profile and settings on our Platform. This action would result in you losing all information related to your account. We retain your personal data information for a period no longer than is required for the purpose for which it was collected or as required under any applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2>Changes to Privacy Policy</h2>
              <p>
                Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices. We may alert/notify you about the significant changes to the Privacy Policy, in the manner as may be required under applicable laws.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
