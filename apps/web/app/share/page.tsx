"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackClickShare, trackShareSuccess } from "../../lib/analytics";

export default function SharePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // 从本地存储获取预测数据
    const stored = localStorage.getItem('lastPredictionResult');
    if (stored) {
      setPrediction(JSON.parse(stored));
    } else {
      // 如果没有预测数据，跳转到计算页面
      router.push("/calc");
    }
  }, [router]);

  const generateShareImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !prediction) return '';

    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#0E0E0E');
    gradient.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 设置字体
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Inter';
    ctx.fillText('More Minutes', 540, 150);

    // 副标题
    ctx.fillStyle = '#9E9E9E';
    ctx.font = '24px Inter';
    ctx.fillText('Count less, live more.', 540, 200);

    // 主要倒计时显示
    ctx.fillStyle = '#E50914';
    ctx.font = 'bold 72px Anton';
    ctx.fillText(`${prediction.remainingYears} Years`, 540, 400);

    // 详细信息
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px Inter';
    ctx.fillText('Remaining', 540, 450);

    // 预计日期
    ctx.fillStyle = '#9E9E9E';
    ctx.font = '28px Inter';
    const deathDate = new Date(prediction.deathDate);
    ctx.fillText(`Until ${deathDate.toLocaleDateString()}`, 540, 520);

    // 当前年龄
    if (prediction.currentAge) {
      ctx.fillStyle = '#9E9E9E';
      ctx.font = '24px Inter';
      ctx.fillText(`Current Age: ${prediction.currentAge}`, 540, 600);
    }

    // 免责声明
    ctx.fillStyle = '#9E9E9E';
    ctx.font = '16px Inter';
    ctx.fillText('Based on SSA 2022 Period Life Table', 540, 850);
    ctx.fillText('For entertainment only, not medical advice', 540, 880);

    // 网站
    ctx.fillStyle = '#E50914';
    ctx.font = '20px Inter';
    ctx.fillText('moreminutes.life', 540, 950);

    return canvas.toDataURL('image/png');
  };

  const handleDownload = () => {
    trackClickShare("countdown_image", "png");
    setIsGenerating(true);

    try {
      const imageUrl = generateShareImage();
      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        
        // 下载图片
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `my-life-countdown-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        trackShareSuccess('download', 'countdown_image', 'png');
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    trackClickShare("system_share", "png");
    
    try {
      const imageUrl = generateShareImage();
      if (!imageUrl) return;

      if (navigator.share) {
        // 转换为 Blob 用于分享
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'my-life-countdown.png', { type: 'image/png' });

        await navigator.share({
          title: 'My Life Countdown',
          text: `I have ${prediction?.remainingYears} years left to live. Check yours!`,
          files: [file],
          url: 'https://moreminutes.life'
        });

        trackShareSuccess('system', 'countdown_image', 'png');
      } else {
        // 回退到下载
        handleDownload();
      }
    } catch (error) {
      console.error("Share failed:", error);
      // 回退到下载
      handleDownload();
    }
  };

  if (!prediction) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading prediction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-accent hover:text-white transition mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-display text-primary mb-4">
            Share Your Countdown
          </h1>
          <p className="text-accent">
            Create beautiful visuals to share your life progress
          </p>
        </div>

        {/* 预览区域 */}
        <div className="bg-gray-900 rounded-lg p-8 text-center mb-6">
          {generatedImageUrl ? (
            <img 
              src={generatedImageUrl} 
              alt="Generated share image" 
              className="max-w-sm mx-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/20 to-success/20 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-accent">Preview will appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Countdown Image • PNG
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 分享选项 */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? "Generating..." : "📸 Generate & Download Image"}
          </button>

          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full py-3 bg-success text-black font-semibold rounded-lg hover:bg-green-400 disabled:opacity-50 transition-colors"
          >
            📤 Share via System
          </button>

          <button
            onClick={() => router.push("/result")}
            className="w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Results
          </button>
        </div>

        {/* 提示信息 */}
        <div className="text-sm text-gray-500 text-center">
          <h3 className="font-semibold mb-2">Sharing Tips:</h3>
          <ul className="space-y-1">
            <li>• Generated images work great for Instagram Stories and Twitter</li>
            <li>• Images include algorithm transparency and disclaimers</li>
            <li>• Share to inspire friends to check their countdown too!</li>
          </ul>
        </div>

        {/* 隐藏的 Canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
} 