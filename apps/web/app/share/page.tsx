"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ShareFormat = "countdown" | "longevity" | "milestone";
type MediaType = "png" | "mp4";

export default function ShareCenterScreen() {
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>("countdown");
  const [selectedMedia, setSelectedMedia] = useState<MediaType>("png");
  const [isGenerating, setIsGenerating] = useState(false);

  const shareFormats = [
    {
      id: "countdown" as ShareFormat,
      title: "Live Countdown",
      description: "Your real-time death countdown timer",
      preview: "⏰ 28,847 days, 14:23:45 remaining"
    },
    {
      id: "longevity" as ShareFormat,
      title: "Longevity Progress",
      description: "Show your +X days from healthy habits",
      preview: "🌱 +147 days gained through wellness"
    },
    {
      id: "milestone" as ShareFormat,
      title: "Milestone Achievement",
      description: "Celebrate life extension milestones",
      preview: "🎉 Hit 30-day streak of exercise!"
    }
  ];

  const generateShareAsset = async () => {
    setIsGenerating(true);
    try {
      // TODO: 实际的图片/视频生成逻辑
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟生成时间
      
      // 模拟生成结果
      const assetUrl = `https://share.moreminutes.life/${selectedFormat}-${Date.now()}.${selectedMedia}`;
      
      if (navigator.share) {
        await navigator.share({
          title: "My Life Journey - More Minutes",
          text: "Check out my life countdown and longevity progress!",
          url: assetUrl,
        });
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(assetUrl);
        alert("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share generation failed:", error);
      alert("Failed to generate share asset. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display mb-2">Share Your Journey</h1>
        <p className="text-accent">Create beautiful visuals to share your life progress</p>
      </div>

      {/* Format Selection */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose Format</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shareFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-4 border-2 rounded-lg text-left transition ${
                selectedFormat === format.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <h3 className="font-semibold mb-2">{format.title}</h3>
              <p className="text-sm text-accent mb-2">{format.description}</p>
              <div className="text-xs bg-dark/50 p-2 rounded font-mono">
                {format.preview}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Media Type Selection */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Media Type</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedMedia("png")}
            className={`px-6 py-3 rounded-lg transition ${
              selectedMedia === "png"
                ? "bg-primary text-white"
                : "bg-gray-800 text-accent hover:bg-gray-700"
            }`}
          >
            📸 Static Image (PNG)
          </button>
          <button
            onClick={() => setSelectedMedia("mp4")}
            className={`px-6 py-3 rounded-lg transition ${
              selectedMedia === "mp4"
                ? "bg-primary text-white"
                : "bg-gray-800 text-accent hover:bg-gray-700"
            }`}
          >
            🎬 Animated Video (MP4)
          </button>
        </div>
      </section>

      {/* Preview & Generate */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Preview & Generate</h2>
        <div className="bg-gray-900 rounded-lg p-8 text-center mb-6">
          <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/20 to-success/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-accent">Preview will appear here</p>
              <p className="text-sm text-gray-500 mt-2">
                {selectedFormat} • {selectedMedia.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={generateShareAsset}
            disabled={isGenerating}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : `Generate & Share ${selectedMedia.toUpperCase()}`}
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-gray-600 text-accent rounded-lg hover:bg-gray-800 transition"
          >
            Back to Home
          </button>
        </div>
      </section>

      {/* Tips */}
      <section className="text-sm text-gray-500">
        <h3 className="font-semibold mb-2">Sharing Tips:</h3>
        <ul className="space-y-1">
          <li>• PNG images work great for Instagram Stories and Twitter</li>
          <li>• MP4 videos are perfect for TikTok and LinkedIn posts</li>
          <li>• All generated content includes your custom quote and branding</li>
          <li>• Pro subscribers get access to premium templates and no watermark</li>
        </ul>
      </section>
    </main>
  );
} 