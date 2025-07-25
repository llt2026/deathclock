"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "../../lib/analytics";

type ShareFormat = "countdown" | "longevity" | "milestone";
type MediaType = "png" | "mp4";

interface ShareData {
  timeLeft: string;
  deathDate: string;
  remainingYears: string;
  currentAge: number;
}

export default function ShareCenterScreen() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>("countdown");
  const [selectedMedia, setSelectedMedia] = useState<MediaType>("png");
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [generatedAssetUrl, setGeneratedAssetUrl] = useState<string | null>(null);

  useEffect(() => {
    // 从 localStorage 读取预测数据
    const inputData = localStorage.getItem("deathClockInput");
    const resultData = localStorage.getItem("lastPredictionResult");
    
    if (inputData && resultData) {
      const parsedResult = JSON.parse(resultData);
      setShareData(parsedResult);
    }
  }, []);

  const shareFormats = [
    {
      id: "countdown" as ShareFormat,
      title: "Live Countdown",
      description: "Your real-time death countdown timer",
      preview: shareData ? `⏰ ${shareData.remainingYears} years remaining` : "⏰ 28,847 days remaining"
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

  const generateCanvas = (width: number = 1080, height: number = 1080): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0E0E0E');
    gradient.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Brand colors
    const primaryColor = '#E50914';
    const successColor = '#00C48C';
    const textColor = '#FFFFFF';
    const accentColor = '#9E9E9E';

    // Title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('More Minutes', width / 2, 120);

    // Subtitle
    ctx.fillStyle = accentColor;
    ctx.font = '24px Inter';
    ctx.fillText('Count less, live more.', width / 2, 160);

    if (selectedFormat === 'countdown' && shareData) {
      // Main countdown display
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 72px Anton';
      ctx.fillText(shareData.remainingYears, width / 2, 300);
      
      ctx.fillStyle = textColor;
      ctx.font = '32px Inter';
      ctx.fillText('Years Remaining', width / 2, 350);

      // Death date
      ctx.fillStyle = accentColor;
      ctx.font = '28px Inter';
      ctx.fillText(`Until ${new Date(shareData.deathDate).toLocaleDateString()}`, width / 2, 400);

      // Current age
      ctx.fillStyle = textColor;
      ctx.font = '24px Inter';
      ctx.fillText(`Current Age: ${shareData.currentAge}`, width / 2, 500);

    } else if (selectedFormat === 'longevity') {
      // Longevity progress
      ctx.fillStyle = successColor;
      ctx.font = 'bold 64px Anton';
      ctx.fillText('+147 Days', width / 2, 300);
      
      ctx.fillStyle = textColor;
      ctx.font = '32px Inter';
      ctx.fillText('Life Extended', width / 2, 350);

      ctx.fillStyle = accentColor;
      ctx.font = '24px Inter';
      ctx.fillText('Through Healthy Lifestyle Choices', width / 2, 400);

    } else if (selectedFormat === 'milestone') {
      // Milestone achievement
      ctx.fillStyle = successColor;
      ctx.font = 'bold 96px Inter';
      ctx.fillText('🎉', width / 2, 280);
      
      ctx.fillStyle = textColor;
      ctx.font = 'bold 36px Inter';
      ctx.fillText('30-Day Streak!', width / 2, 350);

      ctx.fillStyle = accentColor;
      ctx.font = '24px Inter';
      ctx.fillText('Consistency builds longevity', width / 2, 400);
    }

    // Algorithm transparency
    ctx.fillStyle = accentColor;
    ctx.font = '16px Inter';
    ctx.fillText('Based on SSA 2022 Period Life Table', width / 2, height - 100);
    ctx.fillText('For entertainment only, not medical advice', width / 2, height - 70);

    // Website
    ctx.fillStyle = primaryColor;
    ctx.font = '20px Inter';
    ctx.fillText('moreminutes.life', width / 2, height - 30);

    return canvas.toDataURL('image/png');
  };

  const generateShareAsset = async () => {
    if (!shareData && selectedFormat === 'countdown') {
      alert('No prediction data found. Please calculate your countdown first.');
      router.push('/calc');
      return;
    }

    setIsGenerating(true);
    try {
      let assetUrl: string;

      if (selectedMedia === 'png') {
        // Generate static image
        assetUrl = generateCanvas();
        setGeneratedAssetUrl(assetUrl);
        
        // Track event
        trackEvent('ShareSuccess', {
          shareType: selectedFormat,
          assetFormat: 'png',
          platform: 'generated'
        });

      } else {
        // For MP4, we'd need a more complex video generation library
        // For now, use the static image as fallback
        assetUrl = generateCanvas();
        setGeneratedAssetUrl(assetUrl);
        
        trackEvent('ShareSuccess', {
          shareType: selectedFormat,
          assetFormat: 'mp4_fallback',
          platform: 'generated'
        });
      }

      // Try native sharing
      if (navigator.share && selectedMedia === 'png') {
        // Convert data URL to blob for sharing
        const response = await fetch(assetUrl);
        const blob = await response.blob();
        const file = new File([blob], `moreminutes-${selectedFormat}.png`, { type: 'image/png' });

        await navigator.share({
          title: "My Life Journey - More Minutes",
          text: "Check out my life countdown and longevity progress! 🕐",
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.download = `moreminutes-${selectedFormat}-${Date.now()}.png`;
        link.href = assetUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error("Share generation failed:", error);
      alert("Failed to generate share asset. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyShareableLink = async () => {
    const shareableData = shareData ? {
      years: shareData.remainingYears,
      age: shareData.currentAge,
      format: selectedFormat
    } : {};
    
    const shareUrl = `https://moreminutes.life/share?data=${encodeURIComponent(JSON.stringify(shareableData))}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Shareable link copied to clipboard!');
      
      trackEvent('ClickShare', {
        shareType: selectedFormat,
        shareMethod: 'link'
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-white transition mb-4"
        >
          ← Back
        </button>
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
            disabled={true}
          >
            🎬 Video (Coming Soon)
          </button>
        </div>
      </section>

      {/* Preview & Generate */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Preview & Generate</h2>
        <div className="bg-gray-900 rounded-lg p-8 text-center mb-6">
          {generatedAssetUrl ? (
            <img 
              src={generatedAssetUrl} 
              alt="Generated share image" 
              className="max-w-sm mx-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/20 to-success/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-accent">Preview will appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedFormat} • {selectedMedia.toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={generateShareAsset}
            disabled={isGenerating}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : `Generate & Share ${selectedMedia.toUpperCase()}`}
          </button>
          
          <button
            onClick={copyShareableLink}
            className="px-6 py-3 border border-gray-600 text-accent rounded-lg hover:bg-gray-800 transition"
          >
            📋 Copy Link
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-gray-600 text-accent rounded-lg hover:bg-gray-800 transition"
          >
            Back to Home
          </button>
        </div>
      </section>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Tips */}
      <section className="text-sm text-gray-500">
        <h3 className="font-semibold mb-2">Sharing Tips:</h3>
        <ul className="space-y-1">
          <li>• PNG images work great for Instagram Stories and Twitter</li>
          <li>• Generated images include algorithm transparency</li>
          <li>• All content includes proper disclaimers</li>
          <li>• Share links preserve your calculation for friends to see</li>
        </ul>
      </section>
    </main>
  );
} 