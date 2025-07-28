import originalHandler from "../../paypal/webhook";

// 运行时配置保持一致
export const config = { runtime: "nodejs" };

// 直接复用原 handler
export default originalHandler; 