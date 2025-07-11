import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

// 전역 설정들
import "./styles/globalStyles.css";
import "./utils/globalConfig.ts";

// 성능 모니터링 (선택사항)
if (import.meta.env.PROD) {
  // 프로덕션 환경에서만 성능 모니터링 활성화
  console.log("🚀 프로덕션 모드에서 실행 중");
}

// 앱 초기화
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

// 에러 바운더리로 앱 래핑
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 개발 환경에서 추가 정보
if (import.meta.env.DEV) {
  console.log("🔧 개발 모드에서 실행 중");
  console.log("📦 Vite 버전:", import.meta.env.VITE_VERSION);
}
