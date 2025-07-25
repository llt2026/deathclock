"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export default function LandingPage() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "This app completely changed how I think about time. I started exercising daily after seeing my countdown.",
      author: "Sarah M., 28",
      impact: "+2.3 years"
    },
    {
      quote: "The Legacy Vault feature gave me peace of mind. My family will have everything they need.",
      author: "Robert K., 45", 
      impact: "5 recordings saved"
    },
    {
      quote: "Simple, powerful, and surprisingly motivating. I check it every morning now.",
      author: "Maya P., 34",
      impact: "+1.8 years"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleStartNow = () => {
    trackEvent("cta_click", { location: "hero", type: "start_now" });
    router.push("/calc");
  };

  const handleLearnMore = () => {
    trackEvent("cta_click", { location: "hero", type: "learn_more" });
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-dark text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-display text-white mb-6 leading-tight">
            Count Less,<br />
            <span className="text-primary">Live More</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-accent mb-4 max-w-2xl mx-auto">
            10-second life expectancy predictor with real-time countdown
          </p>
          
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Transform death anxiety into motivation. See how your choices add time to your life, 
            and build a digital legacy that lasts forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleStartNow}
              className="px-8 py-4 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Calculate My Time
            </button>
            <button
              onClick={handleLearnMore}
              className="px-8 py-4 bg-transparent border-2 border-gray-600 hover:border-white text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Learn More
            </button>
          </div>

          {/* Social Proof */}
          <div className="text-center text-gray-400 text-sm">
            <p>Join 10,000+ people living more intentionally</p>
            <div className="flex justify-center items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-br from-primary/30 to-success/30 rounded-full border-2 border-dark"></div>
                ))}
              </div>
              <span className="text-yellow-400">★★★★★</span>
              <span>4.8/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display mb-4">Everything You Need to Live Fully</h2>
            <p className="text-xl text-accent max-w-2xl mx-auto">
              More than just a countdown. It's your companion for meaningful living.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-accent">
                Get your life prediction in 10 seconds. No lengthy questionnaires or complex forms.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Countdown</h3>
              <p className="text-accent">
                Watch your time tick by in real-time. Every second becomes visible and meaningful.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3">Longevity Nudges</h3>
              <p className="text-accent">
                See how healthy choices immediately add time to your countdown, building positive habits.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">🗃️</div>
              <h3 className="text-xl font-semibold mb-3">Legacy Vault</h3>
              <p className="text-accent">
                Secure, encrypted digital legacy storage. Your final messages, delivered when you're gone.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-accent">
                All calculations happen in your browser. Your health data never leaves your device.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">PWA Ready</h3>
              <p className="text-accent">
                Install on your phone like a native app. Works offline when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display mb-4">Lives Changed</h2>
            <p className="text-xl text-accent">Real stories from our community</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 text-center min-h-[200px] flex flex-col justify-center">
            <div className="text-2xl text-primary mb-4">"</div>
            <blockquote className="text-lg mb-4 text-accent">
              {testimonials[currentTestimonial].quote}
            </blockquote>
            <div className="text-white font-semibold">
              {testimonials[currentTestimonial].author}
            </div>
            <div className="text-success text-sm mt-1">
              Impact: {testimonials[currentTestimonial].impact}
            </div>
          </div>

          <div className="flex justify-center mt-4 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? "bg-primary" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-success/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display mb-4">Your Time Starts Now</h2>
          <p className="text-xl text-accent mb-8 max-w-2xl mx-auto">
            Don't wait for tomorrow. Start living more intentionally today. 
            Your future self will thank you.
          </p>
          
          <button
            onClick={handleStartNow}
            className="px-8 py-4 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-lg inline-flex items-center gap-2"
          >
            Calculate My Time
            <span>→</span>
          </button>
          
          <p className="text-sm text-gray-400 mt-4">Free forever • No signup required • Privacy first</p>
        </div>
      </section>
    </main>
  );
} 