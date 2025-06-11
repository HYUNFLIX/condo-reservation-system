// Firebase 설정 및 초기화
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyC2ddIAkLg8nGAajSlma-GYu_zWeoOVS-0",
  authDomain: "condo-reservation-2025.firebaseapp.com",
  projectId: "condo-reservation-2025",
  storageBucket: "condo-reservation-2025.firebasestorage.app",
  messagingSenderId: "259218005950",
  appId: "1:259218005950:web:35ffb751c686e0c27fe3ef"
};

// Firebase 초기화
let app, db, auth;

try {
  // Firebase 앱 초기화
  app = initializeApp(firebaseConfig);
  
  // Firestore 데이터베이스 초기화
  db = getFirestore(app);
  
  // Authentication 초기화
  auth = getAuth(app);
  
  console.log("🔥 Firebase 초기화 완료!");
  
  // Firebase 연결 성공 이벤트 발생
  window.dispatchEvent(new Event('firebaseReady'));
  
} catch (error) {
  console.error("❌ Firebase 초기화 실패:", error);
  
  // Firebase 연결 실패 이벤트 발생
  window.dispatchEvent(new CustomEvent('firebaseError', { detail: error }));
}

// 다른 파일에서 사용할 수 있도록 전역 객체로 내보내기
window.Firebase = {
  app,
  db,
  auth,
  // Firebase 연결 상태 확인 함수
  isReady: () => {
    return app && db && auth;
  },
  // 에러 처리 함수
  handleError: (error, userMessage = "오류가 발생했습니다.") => {
    console.error("Firebase Error:", error);
    
    // 사용자에게 친화적인 에러 메시지 표시
    const errorElement = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorElement && errorText) {
      errorText.textContent = userMessage;
      errorElement.classList.remove('hidden');
      
      // 5초 후 자동으로 숨기기
      setTimeout(() => {
        errorElement.classList.add('hidden');
      }, 5000);
    }
  },
  // 성공 메시지 표시 함수
  showSuccess: (message = "성공적으로 처리되었습니다.") => {
    const successElement = document.getElementById('success-message');
    const successText = successElement.querySelector('span');
    
    if (successElement && successText) {
      successText.textContent = message;
      successElement.classList.remove('hidden');
      
      // 5초 후 자동으로 숨기기
      setTimeout(() => {
        successElement.classList.add('hidden');
      }, 5000);
    }
  }
};

// 디버깅용 전역 접근
window.db = db;
window.auth = auth;