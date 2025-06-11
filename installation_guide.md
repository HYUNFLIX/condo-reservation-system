# 🛠️ 설치 및 설정 가이드

## 📋 목차

1. [사전 요구사항](#-사전-요구사항)
2. [프로젝트 설정](#-프로젝트-설정)
3. [Firebase 설정](#-firebase-설정)
4. [GitHub 업로드](#-github-업로드)
5. [배포하기](#-배포하기)
6. [문제 해결](#-문제-해결)

## 🔧 사전 요구사항

### 필수 도구 설치

```bash
# Node.js 설치 확인 (14.0.0 이상)
node --version

# Git 설치 확인
git --version

# Firebase CLI 설치
npm install -g firebase-tools

# 설치 확인
firebase --version
```

### 계정 준비

- **GitHub 계정** - 코드 저장소용
- **Google 계정** - Firebase 서비스용
- **Gmail 계정** - 관리자 계정용

## 📂 프로젝트 설정

### 1. 로컬 프로젝트 생성

```bash
# 프로젝트 디렉토리 생성
mkdir condo-reservation-system
cd condo-reservation-system

# Git 초기화
git init

# README 파일 생성
echo "# 콘도 예약 시스템" > README.md
```

### 2. 프로젝트 파일 구조

```
condo-reservation-system/
├── 📄 index.html              # 메인 예약 페이지
├── 📄 my-application.html     # 신청 조회 페이지
├── 📄 admin.html              # 관리자 대시보드
├── 🔧 firebase-config.js      # Firebase 설정
├── 📜 script.js               # 메인 JavaScript
├── 🎨 styles.css              # 커스텀 스타일
├── 📚 README.md               # 프로젝트 문서
├── 🚫 .gitignore              # Git 제외 파일
├── 📦 package.json            # 프로젝트 메타데이터
├── 🔧 firebase.json           # Firebase 호스팅 설정
├── 🔒 firestore.rules         # Firestore 보안 규칙
├── 📊 firestore.indexes.json  # Firestore 인덱스
└── 🚀 deploy.sh               # 배포 스크립트
```

### 3. 파일 복사

제공된 파일들을 각각 해당 위치에 복사하세요:

- **index.html** - 메인 예약 페이지
- **my-application.html** - 신청 조회 페이지  
- **admin.html** - 관리자 대시보드
- **firebase-config.js** - Firebase 설정
- **script.js** - 메인 JavaScript 로직
- **styles.css** - 커스텀 스타일
- **firebase.json** - Firebase 호스팅 설정
- **firestore.rules** - Firestore 보안 규칙
- **firestore.indexes.json** - Firestore 인덱스
- **package.json** - 프로젝트 설정
- **.gitignore** - Git 제외 파일
- **deploy.sh** - 배포 스크립트

## 🔥 Firebase 설정

### 1. Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com) 접속
2. **"프로젝트 추가"** 클릭
3. 프로젝트 이름: `condo-reservation-2025` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Firebase 서비스 활성화

#### Authentication 설정
```
1. Firebase 콘솔 → Authentication
2. "시작하기" 클릭
3. Sign-in method → "이메일/비밀번호" 활성화
4. "사용자" 탭에서 관리자 계정 준비
```

#### Firestore Database 설정
```
1. Firebase 콘솔 → Firestore Database
2. "데이터베이스 만들기" 클릭
3. 보안 규칙: "테스트 모드에서 시작" 선택
4. 위치: asia-northeast3 (서울) 선택
5. 완료
```

#### Firebase Hosting 설정
```
1. Firebase 콘솔 → Hosting
2. "시작하기" 클릭
3. 설정 완료
```

### 3. Firebase 설정 키 복사

1. **프로젝트 설정** (⚙️) → **일반** 탭
2. **"내 앱"** 섹션에서 **웹 앱 추가**
3. 앱 이름: `콘도예약시스템`
4. **Firebase SDK 구성** 복사

### 4. firebase-config.js 업데이트

복사한 설정으로 `firebase-config.js` 파일의 설정 부분을 수정:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Firebase CLI 설정

```bash
# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init

# 선택 옵션:
# ✅ Firestore
# ✅ Hosting
# ❌ Functions (사용하지 않음)
# ❌ Storage (사용하지 않음)

# 프로젝트 선택: 위에서 생성한 프로젝트 선택
# Firestore rules: firestore.rules (기본값)
# Firestore indexes: firestore.indexes.json (기본값)
# Public directory: . (현재 디렉토리)
# Single-page app: No
# GitHub 배포: No
```

## 📤 GitHub 업로드

### 1. GitHub 저장소 생성

1. [GitHub.com](https://github.com) 로그인
2. **"New repository"** 클릭
3. Repository name: `condo-reservation-system`
4. Description: `2025년 하계성수기 법인콘도 예약 시스템`
5. **Public** 또는 **Private** 선택
6. **"Create repository"** 클릭

### 2. 로컬에서 GitHub 연결

```bash
# 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/condo-reservation-system.git

# 파일 스테이징
git add .

# 첫 번째 커밋
git commit -m "🎉 Initial commit: 콘도 예약 시스템 구축"

# 메인 브랜치로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 3. GitHub Pages 설정 (선택사항)

1. GitHub 저장소 → **Settings** 탭
2. **Pages** 섹션 찾기
3. **Source**: Deploy from a branch
4. **Branch**: main
5. **Folder**: / (root)
6. **Save** 클릭

## 🚀 배포하기

### 방법 1: Firebase Hosting (권장)

```bash
# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh

# 또는 직접 명령어 실행
firebase deploy
```

### 방법 2: 수동 배포

```bash
# Firestore 규칙 배포
firebase deploy --only firestore:rules

# Firestore 인덱스 배포  
firebase deploy --only firestore:indexes

# 호스팅 배포
firebase deploy --only hosting
```

### 3. 배포 확인

```bash
# 배포된 사이트 열기
firebase open hosting:site

# 프로젝트 대시보드 열기
firebase open
```

## 🔐 보안 설정

### 1. Firestore 보안 규칙 적용

Firebase 콘솔 → Firestore Database → 규칙에서 `firestore.rules` 내용 적용

### 2. 관리자 계정 생성

#### 방법 1: 웹에서 생성
1. `admin.html` 페이지 접속
2. **"관리자 계정 생성"** 버튼 클릭
3. 이메일과 비밀번호 입력하여 생성

#### 방법 2: 콘솔에서 생성
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
firebase.auth().createUserWithEmailAndPassword('admin@company.com', 'secure-password')
  .then((userCredential) => {
    return db.collection('admins').doc(userCredential.user.uid).set({
      email: 'admin@company.com',
      role: 'admin',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  })
  .then(() => console.log('관리자 계정 생성 완료'));
```

### 3. 도메인 인증 설정

Firebase 콘솔 → Authentication → Settings → 승인된 도메인에 본인 도메인 추가

## 🧪 테스트

### 1. 로컬 테스트

```bash
# 로컬 서버 실행
python -m http.server 8000
# 또는
npx http-server

# 브라우저에서 확인
# http://localhost:8000
```

### 2. Firebase 에뮬레이터 테스트

```bash
# 에뮬레이터 시작
firebase emulators:start

# 브라우저에서 확인
# http://localhost:5000 (호스팅)
# http://localhost:4000 (에뮬레이터 UI)
```

### 3. 기능 테스트 체크리스트

- [ ] 메인 페이지 로드
- [ ] 달력에서 날짜 선택
- [ ] 콘도 선택 및 신청
- [ ] 신청 조회 기능
- [ ] 관리자 로그인
- [ ] 관리자 대시보드 기능
- [ ] 자동 추첨 기능

## 🐛 문제 해결

### 자주 발생하는 문제들

#### 1. Firebase 연결 오류
```javascript
// 브라우저 콘솔에서 확인
console.log('Firebase apps:', firebase.apps.length);
console.log('Firebase config:', firebaseConfig);
```

**해결방법:**
- Firebase 설정 키 확인
- 네트워크 연결 확인
- 브라우저 캐시 삭제

#### 2. 권한 오류 (permission-denied)
**원인:** Firestore 보안 규칙 문제

**해결방법:**
1. Firebase 콘솔 → Firestore → 규칙 확인
2. `firestore.rules` 파일 내용 적용
3. 관리자 계정 권한 확인

#### 3. 관리자 로그인 실패
**해결방법:**
1. Firebase 콘솔 → Authentication → 사용자 확인
2. `admins` 컬렉션에 사용자 문서 확인
3. 이메일/비밀번호 정확성 확인

#### 4. 배포 실패
```bash
# Firebase 로그인 상태 확인
firebase login --list

# 프로젝트 설정 확인
firebase use --current

# 상세 오류 로그 확인
firebase deploy --debug
```

#### 5. GitHub 푸시 실패
```bash
# 원격 저장소 확인
git remote -v

# 인증 문제 해결
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# SSH 키 설정 (선택사항)
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"
```

## 📞 지원 및 도움

### 공식 문서
- [Firebase 문서](https://firebase.google.com/docs)
- [GitHub 가이드](https://guides.github.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

### 커뮤니티
- [Firebase Discord](https://discord.gg/BN2cgc3)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [GitHub Issues](https://github.com/YOUR_USERNAME/condo-reservation-system/issues)

### 추가 도움이 필요한 경우
1. GitHub Issues에 문제 상황 상세히 기록
2. 브라우저 콘솔 오류 메시지 첨부  
3. Firebase 프로젝트 설정 스크린샷 첨부
4. 운영체제 및 브라우저 정보 포함

---

🎉 **축하합니다!** 콘도 예약 시스템이 성공적으로 설정되었습니다!