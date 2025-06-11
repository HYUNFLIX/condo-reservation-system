#!/bin/bash

# ========================================
# 🚀 콘도 예약 시스템 배포 스크립트
# ========================================

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 헤더 출력
echo "========================================="
echo "🏨 콘도 예약 시스템 배포 스크립트"
echo "========================================="
echo ""

# 환경 확인
log_info "환경 확인 중..."

# Node.js 확인
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되지 않았습니다."
    log_info "https://nodejs.org 에서 Node.js를 설치하세요."
    exit 1
fi

# Firebase CLI 확인
if ! command -v firebase &> /dev/null; then
    log_warning "Firebase CLI가 설치되지 않았습니다."
    log_info "Firebase CLI를 설치합니다..."
    npm install -g firebase-tools
    log_success "Firebase CLI 설치 완료"
fi

# Git 상태 확인
if [[ -n $(git status --porcelain) ]]; then
    log_warning "커밋되지 않은 변경사항이 있습니다."
    echo "계속하시겠습니까? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "배포가 취소되었습니다."
        exit 0
    fi
fi

# 배포 옵션 선택
echo ""
log_info "배포 옵션을 선택하세요:"
echo "1) 전체 배포 (Hosting + Firestore Rules + Indexes)"
echo "2) Hosting만 배포"
echo "3) Firestore Rules만 배포"
echo "4) Firestore Indexes만 배포"
echo "5) 테스트 배포 (미리보기)"
echo ""
read -p "선택 (1-5): " choice

case $choice in
    1)
        DEPLOY_TARGET="all"
        log_info "전체 배포를 진행합니다."
        ;;
    2)
        DEPLOY_TARGET="hosting"
        log_info "Hosting만 배포합니다."
        ;;
    3)
        DEPLOY_TARGET="rules"
        log_info "Firestore Rules만 배포합니다."
        ;;
    4)
        DEPLOY_TARGET="indexes"
        log_info "Firestore Indexes만 배포합니다."
        ;;
    5)
        DEPLOY_TARGET="preview"
        log_info "테스트 배포를 진행합니다."
        ;;
    *)
        log_error "잘못된 선택입니다."
        exit 1
        ;;
esac

# Firebase 프로젝트 확인
log_info "Firebase 프로젝트 확인 중..."
CURRENT_PROJECT=$(firebase use --current 2>/dev/null || echo "none")

if [[ "$CURRENT_PROJECT" == "none" ]]; then
    log_warning "Firebase 프로젝트가 설정되지 않았습니다."
    log_info "Firebase 프로젝트를 선택하세요:"
    firebase use --add
fi

log_success "Firebase 프로젝트: $CURRENT_PROJECT"

# Firebase 로그인 확인
log_info "Firebase 인증 확인 중..."
if ! firebase projects:list &> /dev/null; then
    log_warning "Firebase에 로그인이 필요합니다."
    firebase login
fi

# 배포 전 유효성 검사
log_info "배포 전 유효성 검사 중..."

# 필수 파일 확인
required_files=("index.html" "admin.html" "my-application.html" "firebase-config.js" "firebase.json")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        log_error "필수 파일이 없습니다: $file"
        exit 1
    fi
done

log_success "필수 파일 확인 완료"

# Firebase 설정 파일 유효성 검사
if [[ -f "firebase.json" ]]; then
    if ! firebase deploy --dry-run &> /dev/null; then
        log_error "firebase.json 설정에 오류가 있습니다."
        exit 1
    fi
    log_success "Firebase 설정 유효성 확인 완료"
fi

# 배포 실행
echo ""
log_info "배포를 시작합니다..."

case $DEPLOY_TARGET in
    "all")
        # 전체 배포
        log_info "Firestore Rules 배포 중..."
        firebase deploy --only firestore:rules
        
        log_info "Firestore Indexes 배포 중..."
        firebase deploy --only firestore:indexes
        
        log_info "Hosting 배포 중..."
        firebase deploy --only hosting
        ;;
    "hosting")
        firebase deploy --only hosting
        ;;
    "rules")
        firebase deploy --only firestore:rules
        ;;
    "indexes")
        firebase deploy --only firestore:indexes
        ;;
    "preview")
        log_info "미리보기 채널을 생성합니다..."
        firebase hosting:channel:deploy preview-$(date +%Y%m%d-%H%M%S) --expires 7d
        ;;
esac

# 배포 결과 확인
if [[ $? -eq 0 ]]; then
    log_success "배포가 성공적으로 완료되었습니다! 🎉"
    
    # 배포된 URL 정보 출력
    if [[ "$DEPLOY_TARGET" == "all" || "$DEPLOY_TARGET" == "hosting" ]]; then
        echo ""
        log_info "배포된 사이트 URL:"
        firebase hosting:sites:list
        
        # 자동으로 브라우저에서 열기
        read -p "브라우저에서 사이트를 여시겠습니까? (y/N): " open_browser
        if [[ "$open_browser" =~ ^[Yy]$ ]]; then
            firebase open hosting:site
        fi
    fi
    
    # 배포 후 작업
    echo ""
    log_info "배포 후 권장 작업:"
    echo "1. Firebase 콘솔에서 배포 상태 확인"
    echo "2. 웹사이트 기능 테스트"
    echo "3. 관리자 계정 생성 및 테스트"
    echo "4. Firestore 보안 규칙 확인"
    
else
    log_error "배포 중 오류가 발생했습니다."
    exit 1
fi

# 배포 로그 저장
DEPLOY_LOG="deploy-$(date +%Y%m%d-%H%M%S).log"
firebase deploy --debug > "$DEPLOY_LOG" 2>&1 || true
log_info "배포 로그가 $DEPLOY_LOG 에 저장되었습니다."

echo ""
log_success "배포 스크립트가 완료되었습니다!"
echo "========================================"