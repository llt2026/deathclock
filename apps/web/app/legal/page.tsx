"use client";
import { useRouter } from "next/navigation";

export default function LegalPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-white transition mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-display text-primary mb-2">Legal & Privacy</h1>
        <p className="text-accent">Terms of service, privacy policy, and legal disclaimers</p>
      </div>

      <div className="space-y-8">
        {/* Terms of Service */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Terms of Service</h2>
          <div className="space-y-4 text-gray-300">
            <h3 className="text-lg font-medium text-white">1. Acceptance of Terms</h3>
            <p>
              By accessing and using More Minutes (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            
            <h3 className="text-lg font-medium text-white">2. Description of Service</h3>
            <p>
              More Minutes is a life expectancy calculator and digital legacy platform that provides entertainment-only predictions based on statistical data.
            </p>
            
            <h3 className="text-lg font-medium text-white">3. Medical Disclaimer</h3>
            <div className="bg-red-900/20 border border-red-800 rounded p-4">
              <p className="text-red-200 font-medium">
                ⚠️ IMPORTANT: More Minutes is for entertainment purposes only and does not provide medical advice, diagnosis, or treatment recommendations.
              </p>
              <ul className="mt-2 text-red-300 text-sm space-y-1">
                <li>• Results are statistical estimates, not medical predictions</li>
                <li>• Do not use for medical decisions or insurance purposes</li>
                <li>• Consult healthcare professionals for medical advice</li>
                <li>• We are not liable for any medical decisions based on our service</li>
              </ul>
            </div>
            
            <h3 className="text-lg font-medium text-white">4. Privacy & Data Protection</h3>
            <p>
              Your privacy is important to us. We use minimal data collection and strong encryption for your digital legacy items.
            </p>
            
            <h3 className="text-lg font-medium text-white">5. Subscription Terms</h3>
            <p>
              Premium subscriptions are processed through PayPal. You may cancel at any time through your PayPal account or by contacting support.
            </p>
            
            <h3 className="text-lg font-medium text-white">6. Limitation of Liability</h3>
            <p>
              More Minutes and its creators are not liable for any damages arising from use of this service, including but not limited to emotional distress or life decisions.
            </p>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Privacy Policy</h2>
          <div className="space-y-4 text-gray-300">
            <h3 className="text-lg font-medium text-white">Data We Collect</h3>
            <ul className="space-y-2">
              <li>• Birth date and gender (for calculations only)</li>
              <li>• Email address (for account authentication)</li>
              <li>• Encrypted digital legacy files (stored securely)</li>
              <li>• Anonymous usage analytics</li>
            </ul>
            
            <h3 className="text-lg font-medium text-white">Data Protection</h3>
            <ul className="space-y-2">
              <li>• All calculations performed locally on your device</li>
              <li>• Legacy Vault files encrypted with AES-256 before upload</li>
              <li>• Encryption keys never leave your device</li>
              <li>• We cannot access your encrypted content</li>
            </ul>
            
            <h3 className="text-lg font-medium text-white">Third-Party Services</h3>
            <p>
              We use PayPal for payments, Vercel for hosting, and anonymous analytics. These services have their own privacy policies.
            </p>
            
            <h3 className="text-lg font-medium text-white">Data Deletion</h3>
            <p>
              You can request account deletion at any time by contacting support@moreminutes.life. All associated data will be permanently removed.
            </p>
          </div>
        </section>

        {/* DMCA */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">DMCA Notice</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              If you believe content on More Minutes infringes your copyright, please contact us at legal@moreminutes.life with:
            </p>
            <ul className="space-y-1">
              <li>• Your contact information</li>
              <li>• Description of copyrighted work</li>
              <li>• Location of infringing material</li>
              <li>• Good faith statement</li>
              <li>• Electronic signature</li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Contact Us</h2>
          <div className="space-y-2 text-gray-300">
            <p>For questions about these terms or our service:</p>
            <p>Email: <a href="mailto:support@moreminutes.life" className="text-primary hover:underline">support@moreminutes.life</a></p>
            <p>Website: <a href="https://moreminutes.life" className="text-primary hover:underline">moreminutes.life</a></p>
          </div>
        </section>

        <div className="text-center text-gray-500 text-sm pt-8">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-2">More Minutes v1.0 - Count less, live more.</p>
        </div>
      </div>
    </main>
  );
} 