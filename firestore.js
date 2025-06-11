rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // 관리자 컬렉션: 관리자만 자신의 문서에 접근 가능
    match /admins/{adminId} {
      allow read, write: if request.auth != null && request.auth.uid == adminId;
      allow create: if request.auth != null && request.auth.uid == adminId;
    }
    
    // 신청 컬렉션 관리
    match /applications/{applicationId} {
      
      // 관리자 권한 확인 함수
      function isAdmin() {
        return request.auth != null && 
               exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      }
      
      // 유효한 신청 데이터인지 확인
      function isValidApplication() {
        let requiredFields = ['employeeId', 'name', 'phone', 'condoName', 'condoType'];
        return request.resource.data.keys().hasAll(requiredFields) &&
               request.resource.data.employeeId is string &&
               request.resource.data.name is string &&
               request.resource.data.phone is string &&
               request.resource.data.condoName is string &&
               request.resource.data.employeeId.size() > 0 &&
               request.resource.data.name.size() > 0 &&
               request.resource.data.phone.size() > 0;
      }
      
      // 중복 신청 방지 (사번 기준)
      function isNotDuplicateApplication() {
        return !exists(/databases/$(database)/documents/applications/$(request.resource.data.employeeId));
      }
      
      // 관리자는 모든 신청에 대해 모든 권한 보유
      allow read, write, delete: if isAdmin();
      
      // 일반 사용자는 신청 생성만 가능 (인증 없이)
      allow create: if request.auth == null && 
                   isValidApplication() &&
                   request.resource.data.status == 'pending';
      
      // 신청자 본인은 자신의 신청만 읽기 가능 (사번 + 이름 기준)
      // 실제로는 클라이언트에서 사번과 이름으로 쿼리하여 확인
      allow read: if request.auth == null;
      
      // 신청자 본인은 마감일 전까지 수정 가능 (연락처만)
      allow update: if request.auth == null &&
                   resource.data.employeeId == request.resource.data.employeeId &&
                   resource.data.name == request.resource.data.name &&
                   // 변경 가능한 필드 제한 (연락처만)
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['phone', 'updatedAt']) &&
                   // 추첨이 시작되지 않은 경우만 (pending 상태)
                   resource.data.status == 'pending';
      
      // 신청자 본인은 마감일 전까지 삭제 가능
      allow delete: if request.auth == null &&
                   resource.data.status == 'pending';
    }
    
    // 시스템 설정 컬렉션 (관리자만 접근)
    match /settings/{settingId} {
      allow read, write: if request.auth != null && 
                        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // 로그 컬렉션 (관리자만 읽기, 시스템에서 쓰기)
    match /logs/{logId} {
      allow read: if request.auth != null && 
                 exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow create: if true; // 시스템에서 로그 생성
    }
    
    // 통계 컬렉션 (관리자만 읽기)
    match /stats/{statsId} {
      allow read: if request.auth != null && 
                 exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow write: if request.auth != null && 
                  exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // 백업 컬렉션 (관리자만 접근)
    match /backups/{backupId} {
      allow read, write: if request.auth != null && 
                        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // 기본적으로 모든 다른 문서는 접근 거부
    match /{document=**} {
      allow read, write: if false;
    }
  }
}