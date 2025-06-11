// ========================================
// 🔥 Firebase 설정 및 초기화 (개선 버전)
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, enableNetwork, disableNetwork } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// ========================================
// 🔧 환경 설정
// ========================================

// 환경별 Firebase 설정
const getFirebaseConfig = () => {
  // 개발 환경 확인
  const isDevelopment = location.hostname === 'localhost' || 
                       location.hostname === '127.0.0.1' || 
                       location.port === '5000' ||
                       location.port === '8000';

  // 기본 설정 (프로덕션)
  const productionConfig = {
    apiKey: "AIzaSyC2ddIAkLg8nGAajSlma-GYu_zWeoOVS-0",
    authDomain: "condo-reservation-2025.firebaseapp.com",
    projectId: "condo-reservation-2025",
    storageBucket: "condo-reservation-2025.firebasestorage.app",
    messagingSenderId: "259218005950",
    appId: "1:259218005950:web:35ffb751c686e0c27fe3ef",
    measurementId: "G-XXXXXXXXXX" // Google Analytics (선택사항)
  };

  // 개발 환경에서는 환경변수 또는 로컬 설정 사용 가능
  if (isDevelopment) {
    console.log('🔧 개발 환경에서 실행 중');
    
    // 환경변수가 있으면 사용 (Vite, Webpack 등)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || productionConfig.apiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || productionConfig.authDomain,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || productionConfig.projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || productionConfig.storageBucket,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || productionConfig.messagingSenderId,
        appId: import.meta.env.VITE_FIREBASE_APP_ID || productionConfig.appId,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || productionConfig.measurementId
      };
    }
  }

  return productionConfig;
};

// ========================================
// 🚀 Firebase 초기화
// ========================================

let app, db, auth, analytics;
let initializationPromise = null;

// Firebase 초기화 함수
const initializeFirebase = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🔥 Firebase 초기화 시작...');
      
      // Firebase 설정 가져오기
      const firebaseConfig = getFirebaseConfig();
      console.log('📋 Firebase 설정 로드 완료');

      // Firebase 앱 초기화
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase 앱 초기화 완료');

      // Firestore 초기화
      db = getFirestore(app);
      console.log('🗄️ Firestore 초기화 완료');

      // Authentication 초기화
      auth = getAuth(app);
      console.log('🔐 Firebase Auth 초기화 완료');

      // 개발 환경에서 에뮬레이터 연결
      const isDevelopment = location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1';
      
      if (isDevelopment && location.port === '5000') {
        try {
          connectAuthEmulator(auth, 'http://localhost:9099');
          console.log('🔧 Auth 에뮬레이터 연결됨');
        } catch (error) {
          console.log('⚠️ Auth 에뮬레이터 연결 실패 (이미 연결됨)');
        }
      }

      // Analytics 초기화 (프로덕션에서만)
      if (!isDevelopment && firebaseConfig.measurementId) {
        try {
          analytics = getAnalytics(app);
          console.log('📊 Firebase Analytics 초기화 완료');
        } catch (error) {
          console.warn('⚠️ Firebase Analytics 초기화 실패:', error);
        }
      }

      // 네트워크 상태 모니터링
      setupNetworkMonitoring();

      // Firebase 연결 성공 이벤트 발생
      window.dispatchEvent(new CustomEvent('firebaseReady', {
        detail: { app, db, auth, analytics }
      }));

      console.log('🎉 Firebase 초기화 완료!');
      
      return { app, db, auth, analytics };

    } catch (error) {
      console.error('❌ Firebase 초기화 실패:', error);
      
      // Firebase 연결 실패 이벤트 발생
      window.dispatchEvent(new CustomEvent('firebaseError', { 
        detail: error 
      }));
      
      throw error;
    }
  })();

  return initializationPromise;
};

// ========================================
// 🌐 네트워크 모니터링
// ========================================

const setupNetworkMonitoring = () => {
  // 온라인/오프라인 상태 모니터링
  window.addEventListener('online', async () => {
    console.log('🌐 네트워크 연결됨');
    try {
      await enableNetwork(db);
      showNetworkStatus('online');
    } catch (error) {
      console.error('네트워크 재연결 실패:', error);
    }
  });

  window.addEventListener('offline', async () => {
    console.log('📡 네트워크 연결 끊어짐');
    try {
      await disableNetwork(db);
      showNetworkStatus('offline');
    } catch (error) {
      console.error('오프라인 모드 전환 실패:', error);
    }
  });

  // 초기 네트워크 상태 확인
  if (navigator.onLine) {
    showNetworkStatus('online');
  } else {
    showNetworkStatus('offline');
  }
};

// 네트워크 상태 UI 업데이트
const showNetworkStatus = (status) => {
  const indicator = document.getElementById('network-status');
  if (!indicator) return;

  if (status === 'online') {
    indicator.className = 'text-green-600';
    indicator.innerHTML = '🌐 온라인';
  } else {
    indicator.className = 'text-red-600';
    indicator.innerHTML = '📡 오프라인';
  }
};

// ========================================
// 🛠️ 유틸리티 함수들
// ========================================

const FirebaseUtils = {
  // Firebase 연결 상태 확인
  isReady: () => {
    return app && db && auth;
  },

  // 재연결 시도
  reconnect: async () => {
    try {
      await enableNetwork(db);
      console.log('🔄 Firebase 재연결 성공');
      return true;
    } catch (error) {
      console.error('🔄 Firebase 재연결 실패:', error);
      return false;
    }
  },

  // 에러 처리 함수 (사용자 친화적 메시지)
  handleError: (error, userMessage = "오류가 발생했습니다.") => {
    console.error("Firebase Error:", error);
    
    // 네트워크 오류 처리
    if (error.code === 'unavailable' || error.message?.includes('network')) {
      userMessage = "네트워크 연결을 확인해주세요.";
    } else if (error.code === 'permission-denied') {
      userMessage = "권한이 없습니다.";
    } else if (error.code === 'not-found') {
      userMessage = "요청한 데이터를 찾을 수 없습니다.";
    }
    
    // 사용자에게 에러 메시지 표시
    const errorElement = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorElement && errorText) {
      errorText.textContent = userMessage;
      errorElement.classList.remove('hidden');
      
      // 자동으로 숨기기
      setTimeout(() => {
        errorElement.classList.add('hidden');
      }, 5000);
    }

    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('firebaseError', {
      detail: { error, userMessage }
    }));
  },

  // 성공 메시지 표시 함수
  showSuccess: (message = "성공적으로 처리되었습니다.") => {
    const successElement = document.getElementById('success-message');
    const successText = successElement?.querySelector('span');
    
    if (successElement && successText) {
      successText.textContent = message;
      successElement.classList.remove('hidden');
      
      // 자동으로 숨기기
      setTimeout(() => {
        successElement.classList.add('hidden');
      }, 5000);
    }

    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('firebaseSuccess', {
      detail: { message }
    }));
  },

  // 로딩 상태 관리
  setLoading: (isLoading, message = '처리 중...') => {
    const loadingElement = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingElement) {
      if (isLoading) {
        loadingElement.classList.remove('hidden');
        if (loadingText) loadingText.textContent = message;
      } else {
        loadingElement.classList.add('hidden');
      }
    }
  },

  // 디버그 정보 출력
  getDebugInfo: () => {
    return {
      appInitialized: !!app,
      dbInitialized: !!db,
      authInitialized: !!auth,
      analyticsInitialized: !!analytics,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      environment: location.hostname === 'localhost' ? 'development' : 'production',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  },

  // 성능 모니터링
  measurePerformance: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
};

// ========================================
// 🌍 전역 객체로 내보내기
// ========================================

// 다른 파일에서 사용할 수 있도록 전역 객체로 설정
window.Firebase = FirebaseUtils;

// 개별 객체들도 전역에서 접근 가능하도록 설정
window.initializeFirebase = initializeFirebase;

// ========================================
// 🚀 자동 초기화
// ========================================

// DOM 로드 완료 시 자동으로 Firebase 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  // 이미 로드된 경우 즉시 초기화
  initializeFirebase();
}

// ========================================
// 📊 성능 모니터링 (개발 환경)
// ========================================

if (location.hostname === 'localhost') {
  // 성능 모니터링
  window.addEventListener('load', () => {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    console.log(`📊 페이지 로드 시간: ${loadTime}ms`);
  });

  // Firebase 초기화 시간 측정
  const firebaseInitStart = performance.now();
  window.addEventListener('firebaseReady', () => {
    const firebaseInitEnd = performance.now();
    console.log(`🔥 Firebase 초기화 시간: ${(firebaseInitEnd - firebaseInitStart).toFixed(2)}ms`);
  });
}

// ========================================
// 📱 PWA 지원 (향후 확장용)
// ========================================

// Service Worker 등록 (향후 PWA 지원용)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('🔧 Service Worker 등록 성공:', registration);
      })
      .catch(error => {
        console.log('⚠️ Service Worker 등록 실패:', error);
      });
  });
}

// ========================================
// 🔄 내보내기 (ES6 Module)
// ========================================

export { 
  initializeFirebase, 
  FirebaseUtils as Firebase 
};