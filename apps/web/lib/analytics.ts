// TikTok Events API 集成
declare global {
  interface Window {
    ttq: any;
  }
}

interface TikTokEvent {
  event: string;
  properties?: Record<string, any>;
}

class TikTokAnalytics {
  private pixelId: string;
  private isInitialized = false;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 加载 TikTok Pixel
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    
    script.onload = () => {
      window.ttq = window.ttq || [];
      window.ttq.load(this.pixelId);
      window.ttq.page();
      this.isInitialized = true;
    };

    document.head.appendChild(script);
  }

  track(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined' || !window.ttq) return;

    try {
      window.ttq.track(event, properties);
    } catch (error) {
      console.error('TikTok tracking error:', error);
    }
  }

  // 预定义事件
  trackViewResult(birthYear: number, baseDaysLeft: number) {
    this.track('ViewContent', {
      content_type: 'life_prediction',
      birth_year: birthYear,
      base_days_left: baseDaysLeft,
    });
  }

  trackShare(shareType: string, assetFormat: string) {
    this.track('Share', {
      content_type: 'life_countdown',
      share_type: shareType,
      asset_format: assetFormat,
    });
  }

  trackSubscriptionStart(planId: string) {
    this.track('InitiateCheckout', {
      content_type: 'subscription',
      plan_id: planId,
      currency: 'USD',
      value: 3.99,
    });
  }

  trackSubscriptionComplete(planId: string, amount: number) {
    this.track('CompletePayment', {
      content_type: 'subscription',
      plan_id: planId,
      currency: 'USD',
      value: amount,
    });
  }

  trackLongevityNudge(deltaDays: number) {
    this.track('AchieveLevel', {
      content_type: 'longevity_improvement',
      delta_days: deltaDays,
      level: Math.floor(deltaDays / 30), // 以30天为一个等级
    });
  }
}

// 单例实例
export const tiktokAnalytics = new TikTokAnalytics(
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'TEST_PIXEL_ID'
);

// 通用事件跟踪函数
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Vercel Analytics 事件跟踪
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', eventName, properties);
  }

  // TikTok 事件跟踪
  tiktokAnalytics.track(eventName, properties);
}

// ============= 6个关键埋点事件 =============

// 1. view_result - /result 页面加载完成
export function trackViewResult(birthYear: number, baseDaysLeft: number) {
  trackEvent('view_result', {
    birth_year: birthYear,
    base_days_left: baseDaysLeft,
    timestamp: new Date().toISOString()
  });
  
  // TikTok 专用事件
  tiktokAnalytics.trackViewResult(birthYear, baseDaysLeft);
}

// 2. click_share - Share 按钮点击
export function trackClickShare(shareType: string, assetFormat: string) {
  trackEvent('click_share', {
    share_type: shareType,
    asset_format: assetFormat,
    timestamp: new Date().toISOString()
  });
}

// 3. share_success - 系统分享完成回调
export function trackShareSuccess(platform: string, shareType: string, assetFormat: string) {
  trackEvent('share_success', {
    platform: platform,
    share_type: shareType,
    asset_format: assetFormat,
    timestamp: new Date().toISOString()
  });
  
  // TikTok 专用事件
  tiktokAnalytics.trackShare(shareType, assetFormat);
}

// 4. subscription_start - PayPal 弹框打开
export function trackSubscriptionStart(planId: string) {
  trackEvent('subscription_start', {
    plan_id: planId,
    timestamp: new Date().toISOString()
  });
  
  // TikTok 专用事件
  tiktokAnalytics.trackSubscriptionStart(planId);
}

// 5. subscription_complete - Webhook 状态 Active
export function trackSubscriptionComplete(planId: string, amount: number) {
  trackEvent('subscription_complete', {
    plan_id: planId,
    amount: amount,
    timestamp: new Date().toISOString()
  });
  
  // TikTok 专用事件
  tiktokAnalytics.trackSubscriptionComplete(planId, amount);
}

// 6. nudge_complete - 延寿一次 +X 天
export function trackNudgeComplete(deltaDays: number) {
  trackEvent('nudge_complete', {
    delta_days: deltaDays,
    improvement_category: deltaDays > 100 ? 'major' : deltaDays > 30 ? 'moderate' : 'minor',
    timestamp: new Date().toISOString()
  });
  
  // TikTok 专用事件
  tiktokAnalytics.trackLongevityNudge(deltaDays);
}

// 页面浏览跟踪
export function trackPageView(pageName: string) {
  trackEvent('page_view', { 
    page: pageName,
    timestamp: new Date().toISOString()
  });
} 

// 初始化 TikTok Analytics
export function initAnalytics() {
  tiktokAnalytics.init();
} 