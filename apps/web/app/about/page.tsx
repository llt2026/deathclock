"use client";
import { useRouter } from "next/navigation";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-white mb-4 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-display mb-2">About More Minutes</h1>
        <p className="text-accent">"Count less, live more."</p>
      </div>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-display mb-4">Making Every Moment Count</h2>
        <p className="text-lg text-accent max-w-2xl mx-auto">
          More Minutes helps you visualize the finite nature of life, not to create anxiety, 
          but to inspire you to live more intentionally and meaningfully.
        </p>
      </section>

      {/* Founder Story */}
      <section className="bg-gray-900 rounded-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Founder's Story</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-success/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👨‍💻</span>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Evan Liang</h3>
              <p className="text-sm text-accent">Founder & Developer</p>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4 text-accent">
            <p>
              Born in Hangzhou, China, Evan studied Computer Science and Psychology. 
              The sudden loss of a close friend in high school first introduced him to the concept of life's countdown.
            </p>
            <p>
              During his entrepreneurial journey in California, Evan discovered Stoicism's 
              <em> Memento Mori</em> philosophy and Eastern Five Elements wellness theory. 
              He realized that death anxiety could be transformed into a force for cherishing the present and self-improvement.
            </p>
            <p>
              In 2025, he decided to use minimalist technology to turn "finite life" into a visible countdown timer, 
              adding digital legacy features to help everyone face the finish line with more peace and positivity.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic">
              "Technology should remind us of our humanity, not distract us from it. 
              More Minutes is my attempt to use code to help people live more fully."
              <footer className="text-sm mt-2">— Evan Liang</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-gray-900 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Our Mission & Values</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Our Mission
            </h3>
            <p className="text-accent">
              To help people live more intentionally by visualizing life's finite nature, 
              transforming death anxiety into motivation for meaningful living and legacy building.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              Privacy First
            </h3>
            <p className="text-accent">
              All life calculations happen in your browser. Your health data never leaves your device. 
              We believe privacy is a fundamental right, not a premium feature.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">🌱</span>
              Positive Impact
            </h3>
            <p className="text-accent">
              We focus on hope and growth, not fear. Our tools are designed to motivate 
              healthy choices and meaningful connections, not create existential dread.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">🔬</span>
              Scientific Approach
            </h3>
            <p className="text-accent">
              Our algorithms are based on peer-reviewed data from the U.S. Social Security Administration. 
              We're transparent about our methods and limitations.
            </p>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="bg-gray-900 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">What Makes Us Different</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-semibold">10-Second Predictions</h3>
              <p className="text-accent">Unlike competitors with 25+ question forms, we get you results in seconds.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-2xl">🔄</span>
            <div>
              <h3 className="font-semibold">Real-Time Countdown</h3>
              <p className="text-accent">Watch your time tick by in real-time, making every second visible and meaningful.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-2xl">📈</span>
            <div>
              <h3 className="font-semibold">Longevity Nudges</h3>
              <p className="text-accent">See how healthy choices immediately add time to your countdown, building positive habits.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-2xl">🗃️</span>
            <div>
              <h3 className="font-semibold">Legacy Vault</h3>
              <p className="text-accent">Secure, encrypted digital legacy storage that activates when you're gone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="bg-gray-900 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Technical Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-3">Version Information</h3>
            <ul className="space-y-2 text-accent">
              <li><strong>App Version:</strong> 1.0.0</li>
              <li><strong>Data Version:</strong> SSA 2022</li>
              <li><strong>Last Updated:</strong> January 2025</li>
              <li><strong>Platform:</strong> Progressive Web App</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Open Source</h3>
            <ul className="space-y-2 text-accent">
              <li><strong>License:</strong> MIT License</li>
              <li><strong>Repository:</strong> GitHub.com/llt2026/deathclock</li>
              <li><strong>Framework:</strong> Next.js 14</li>
              <li><strong>Hosting:</strong> Vercel</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Get In Touch</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <span className="text-3xl mb-2 block">💬</span>
            <h3 className="font-semibold mb-2">Feedback</h3>
            <p className="text-accent text-sm">Share your thoughts and suggestions</p>
            <p className="text-sm mt-2">feedback@moreminutes.life</p>
          </div>
          
          <div className="text-center">
            <span className="text-3xl mb-2 block">🐛</span>
            <h3 className="font-semibold mb-2">Bug Reports</h3>
            <p className="text-accent text-sm">Help us improve the app</p>
            <p className="text-sm mt-2">bugs@moreminutes.life</p>
          </div>
          
          <div className="text-center">
            <span className="text-3xl mb-2 block">❓</span>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-accent text-sm">Need help using the app?</p>
            <p className="text-sm mt-2">support@moreminutes.life</p>
          </div>
        </div>
      </section>
    </main>
  );
} 