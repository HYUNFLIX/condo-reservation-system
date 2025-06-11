// ========================================
// 🚀 법인콘도 예약 시스템 메인 JavaScript
// ========================================

import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ========================================
// 📊 콘도 데이터
// ========================================
const condoData = {
    '2025-07-25': [
        { name: '소노호텔앤리조트 쏠비치 양양', type: '패밀리 / 취사', duration: '1박 2일', dates: '2025.07.25~2025.07.26', note: '이용료 선불납입 필수' },
        { name: '한화리조트 설악 쏘라노', type: '디럭스', duration: '1박 2일', dates: '2025.07.25~2025.07.26', note: '' }
    ],
    '2025-07-26': [
        { name: '한화리조트 설악 쏘라노', type: '디럭스', duration: '1박 2일', dates: '2025.07.26~2025.07.27', note: '' },
        { name: '오크밸리리조트 밸리 빌리지', type: '31평형', duration: '1박 2일', dates: '2025.07.26~2025.07.27', note: '' },
        { name: '엘리시안리조트 강촌', type: '패밀리', duration: '1박 2일', dates: '2025.07.26~2025.07.27', note: '' }
    ],
    '2025-07-27': [
        { name: '오크밸리리조트 밸리 빌리지', type: '31평형', duration: '1박 2일', dates: '2025.07.27~2025.07.28', note: '' }
    ],
    '2025-08-01': [
        { name: '오크밸리리조트 밸리 빌리지', type: '31평형', duration: '1박 2일', dates: '2025.08.01~2025.08.02', note: '' },
        { name: '캔싱턴리조트 경주', type: '디럭스 플러스 마운틴뷰', duration: '1박 2일', dates: '2025.08.01~2025.08.02', note: '' }
    ],
    '2025-08-02': [
        { name: '엘리시안리조트 강촌', type: '패밀리', duration: '1박 2일', dates: '2025.08.02~2025.08.03', note: '' }
    ],
    '2025-08-03': [
        { name: '소노호텔앤리조트 쏠비치 양양', type: '패밀리 / 취사', duration: '1박 2일', dates: '2025.08.03~2025.08.04', note: '이용료 선불납입 필수' },
        { name: '오크밸리리조트 밸리 빌리지', type: '31평형', duration: '1박 2일', dates: '2025.08.03~2025.08.04', note: '' }
    ],
    '2025-08-05': [
        { name: '캔싱턴리조트 설악 비치', type: '스튜디오 오션뷰 (클린룸)', duration: '1박 2일', dates: '2025.08.05~2025.08.06', note: '' }
    ],
    '2025-08-08': [
        { name: '소노캄 델피노', type: '스위트 / 취사', duration: '1박 2일', dates: '2025.08.08~2025.08.09', note: '이용료 선불납입 필수' },
        { name: '소노벨 천안', type: '패밀리 / 취사', duration: '1박 2일', dates: '2025.08.08~2025.08.09', note: '이용료 선불납입 필수' }
    ],
    '2025-08-10': [
        { name: '디오션리조트 여수', type: '그린 40평', duration: '2박 3일', dates: '2025.08.10~2025.08.12', note: '이용료 선불납입 필수' }
    ],
    '2025-08-14': [
        { name: '소노벨 변산', type: '패밀리 / 취사', duration: '1박 2일', dates: '2025.08.14~2025.08.16', note: '이용료 선불납입 필수' },
        { name: '디오션리조트 여수', type: '그린 40평', duration: '2박 3일', dates: '2025.08.14~2025.08.16', note: '이용료 선불납입 필수' }
    ],
    '2025-08-15': [
        { name: '엘리시안리조트 강촌', type: '패밀리', duration: '1박 2일', dates: '2025.08.15~2025.08.16', note: '' }
    ],
    '2025-08-17': [
        { name: '한화리조트 설악 쏘라노', type: '디럭스', duration: '1박 2일', dates: '2025.08.17~2025.08.18', note: '' },
        { name: '한화리조트 대천 파로스', type: '디럭스', duration: '1박 2일', dates: '2025.08.17~2025.08.18', note: '' },
        { name: '한화리조트 해운대', type: '디럭스(오륙도뷰)', duration: '1박 2일', dates: '2025.08.17~2025.08.18', note: '' },
        { name: '캔싱턴리조트 설악 비치', type: '디럭스 오션뷰 (클린룸)', duration: '1박 2일', dates: '2025.08.17~2025.08.18', note: '' }
    ]
};

// ========================================
// 🎛️ 전역 변수
// ========================================
let selectedDate = null;
let selectedCondo = null;
let selectedCondoData = null;
let currentView = 'calendar';
let isSubmitting = false;

// ========================================
// 🔥 Firebase 관련 함수들
// ========================================

/**
 * 중복 신청 체크
 * @param {string} employeeId - 사번
 * @returns {Promise<boolean>} - 중복 여부
 */
async function checkDuplicateApplication(employeeId) {
    try {
        if (!window.db) {
            throw new Error('Firebase가 초기화되지 않았습니다.');
        }

        const applicationsRef = collection(window.db, 'applications');
        const q = query(applicationsRef, where('employeeId', '==', employeeId));
        const querySnapshot = await getDocs(q);
        
        return !querySnapshot.empty;
    } catch (error) {
        console.error('중복 신청 체크 실패:', error);
        return false;
    }
}

/**
 * 신청 데이터를 Firestore에 저장
 * @param {Object} applicationData - 신청 데이터
 * @returns {Promise<string>} - 문서 ID
 */
async function saveApplicationToFirebase(applicationData) {
    try {
        if (!window.db) {
            throw new Error('Firebase가 초기화되지 않았습니다.');
        }

        const applicationsRef = collection(window.db, 'applications');
        const docRef = await addDoc(applicationsRef, {
            ...applicationData,
            createdAt: serverTimestamp(),
            status: 'pending', // pending, selected, rejected
            year: 2025
        });

        return docRef.id;
    } catch (error) {
        console.error('Firebase 저장 실패:', error);
        throw error;
    }
}

// ========================================
// 🗓️ 달력 관련 함수들
// ========================================

/**
 * 달력 생성
 * @param {number} year - 년도
 * @param {number} month - 월 (1-12)
 * @param {string} containerId - 컨테이너 ID
 */
function createCalendar(year, month, containerId) {
    const container = document.getElementById(containerId);
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    
    container.innerHTML = '';
    
    // 헤더 생성
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'text-center font-bold py-2 text-gray-600 text-sm';
        header.textContent = day;
        container.appendChild(header);
    });

    // 해당 월의 첫째 날과 마지막 날
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // 달력 시작일 (첫째 주 일요일)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // 42개 셀 생성 (6주)
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day text-center py-2 cursor-pointer rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center';
        dayElement.textContent = currentDate.getDate();

        // 현재 월이 아닌 날짜는 회색으로 표시
        if (currentDate.getMonth() !== month - 1) {
            dayElement.classList.add('text-gray-300', 'cursor-default');
        } else {
            // 예약 가능한 날짜인지 확인
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            if (condoData[dateStr]) {
                dayElement.classList.add('bg-green-100', 'border-2', 'border-green-400', 'text-green-800', 'hover:bg-green-200');
                dayElement.addEventListener('click', () => selectDate(dateStr, dayElement));
            } else {
                dayElement.classList.add('text-gray-400', 'hover:bg-gray-100');
            }
        }

        container.appendChild(dayElement);
    }
}

/**
 * 날짜 선택
 * @param {string} dateStr - 선택된 날짜 (YYYY-MM-DD)
 * @param {HTMLElement} element - 클릭된 요소
 */
function selectDate(dateStr, element) {
    // 이전 달력 선택 해제
    document.querySelectorAll('.calendar-day').forEach(el => {
        el.classList.remove('bg-blue-500', 'text-white');
        if (el.classList.contains('bg-green-100')) {
            el.classList.add('bg-green-100', 'border-2', 'border-green-400', 'text-green-800');
        }
    });

    // 리스트 뷰의 선택 상태도 초기화
    document.querySelectorAll('.condo-row').forEach(row => {
        row.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
    });

    // 새로운 선택
    element.classList.remove('bg-green-100', 'border-green-400', 'text-green-800');
    element.classList.add('bg-blue-500', 'text-white', 'border-2', 'border-blue-600');
    selectedDate = dateStr;

    // 새로운 날짜를 선택했으므로 이전 콘도 선택 정보 초기화
    selectedCondo = null;
    selectedCondoData = null;
    document.getElementById('selected-info').classList.add('hidden');

    // 콘도 옵션 업데이트
    updateCondoOptions(dateStr);
    
    // 신청 버튼 상태 업데이트
    updateSubmitButton();
}

// ========================================
// 🏨 콘도 선택 관련 함수들
// ========================================

/**
 * 콘도 옵션 업데이트 (달력 뷰용)
 * @param {string} dateStr - 선택된 날짜
 */
function updateCondoOptions(dateStr) {
    const container = document.getElementById('calendar-condo-options');
    const condos = condoData[dateStr] || [];

    if (condos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                <p class="text-lg">선택한 날짜에 예약 가능한 콘도가 없습니다.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    condos.forEach((condo, index) => {
        const option = document.createElement('div');
        option.className = 'border-2 border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md';
        option.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-lg mb-1">${condo.name}</h4>
                    <p class="text-gray-600 mb-2">${condo.type} | ${condo.duration}</p>
                    ${condo.note ? `<div class="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-lg inline-block">※ ${condo.note}</div>` : ''}
                </div>
                <div class="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg">
                    ${condo.dates}
                </div>
            </div>
        `;

        option.addEventListener('click', () => selectCondoFromCalendar(option, condo, index));
        container.appendChild(option);
    });
}

/**
 * 달력에서 콘도 선택
 * @param {HTMLElement} element - 선택된 요소
 * @param {Object} condo - 콘도 정보
 * @param {number} index - 인덱스
 */
function selectCondoFromCalendar(element, condo, index) {
    // 이전 선택 해제
    document.querySelectorAll('#calendar-condo-options > div').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50');
        el.classList.add('border-gray-200');
    });

    // 새로운 선택
    element.classList.remove('border-gray-200');
    element.classList.add('border-blue-500', 'bg-blue-50');
    
    selectedCondo = condo;
    selectedCondoData = { ...condo, date: selectedDate };

    // 선택 정보 업데이트
    updateSelectedInfo();
    updateSubmitButton();
}

// ========================================
// 📋 리스트 뷰 관련 함수들
// ========================================

/**
 * 리스트 뷰 테이블 생성
 */
function createCondoTable() {
    const tbody = document.getElementById('condo-table-body');
    tbody.innerHTML = '';

    // 모든 콘도 데이터를 플랫 배열로 변환
    const allCondos = [];
    Object.entries(condoData).forEach(([date, condos]) => {
        condos.forEach((condo, index) => {
            allCondos.push({
                ...condo,
                date: date,
                uniqueId: `${date}_${index}`
            });
        });
    });

    // 날짜순으로 정렬
    allCondos.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 테이블 행 생성
    allCondos.forEach((condo, index) => {
        const row = document.createElement('tr');
        row.className = 'condo-row hover:bg-gray-50 transition-colors duration-200 cursor-pointer';
        row.dataset.condoId = condo.uniqueId;
        row.innerHTML = `
            <td class="py-4 px-4 font-medium text-gray-900">${condo.name}</td>
            <td class="py-4 px-4 text-gray-700">${condo.type}</td>
            <td class="py-4 px-4 text-gray-700">${condo.duration}</td>
            <td class="py-4 px-4 text-blue-600 font-medium">${condo.dates}</td>
            <td class="py-4 px-4 text-gray-700">${condo.note || '-'}</td>
            <td class="py-4 px-4 text-center">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200" onclick="selectCondoFromList('${condo.uniqueId}', this)">
                    선택
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * 리스트에서 콘도 선택
 * @param {string} condoId - 콘도 ID
 * @param {HTMLElement} button - 클릭된 버튼
 */
function selectCondoFromList(condoId, button) {
    // 이전 선택 해제
    document.querySelectorAll('.condo-row').forEach(row => {
        row.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
    });
    
    // 새로운 선택
    const row = button.closest('tr');
    row.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');

    // 콘도 데이터 찾기
    const parts = condoId.split('_');
    if (parts.length >= 2) {
        const date = parts[0];
        const index = parseInt(parts[1]);
        
        if (condoData[date] && condoData[date][index] !== undefined) {
            selectedDate = date;
            selectedCondo = condoData[date][index];
            selectedCondoData = { ...selectedCondo, date: date };

            // 선택 정보 업데이트
            updateSelectedInfo();
            updateSubmitButton();
        } else {
            console.error('콘도 데이터를 찾을 수 없습니다:', date, index);
        }
    } else {
        console.error('잘못된 condoId 형식:', condoId);
    }
}

// 전역에서 접근 가능하도록 설정
window.selectCondoFromList = selectCondoFromList;

// ========================================
// 🎛️ 탭 전환 관련 함수들
// ========================================

/**
 * 뷰 전환
 * @param {string} view - 전환할 뷰 ('calendar' | 'list')
 */
function switchView(view) {
    currentView = view;
    
    // 탭 버튼 업데이트
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });
    document.querySelector(`[data-view="${view}"]`).classList.remove('bg-gray-100', 'text-gray-600');
    document.querySelector(`[data-view="${view}"]`).classList.add('bg-blue-600', 'text-white');

    // 뷰 전환
    if (view === 'calendar') {
        document.getElementById('calendar-view').classList.remove('hidden');
        document.getElementById('list-view').classList.add('hidden');
        document.getElementById('calendar-condo-section').classList.remove('hidden');
        
        // 달력 뷰로 전환시 달력 선택 상태 초기화
        document.querySelectorAll('.calendar-day').forEach(el => {
            el.classList.remove('bg-blue-500', 'text-white');
        });
        
        // 콘도 옵션 영역을 초기 상태로 되돌림
        document.getElementById('calendar-condo-options').innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <p class="text-lg">달력에서 날짜를 선택하면 해당 날짜에 예약 가능한 콘도가 표시됩니다.</p>
            </div>
        `;
        
        // selectedDate만 초기화 (selectedCondoData는 유지)
        selectedDate = null;
        
    } else {
        document.getElementById('calendar-view').classList.add('hidden');
        document.getElementById('list-view').classList.remove('hidden');
        document.getElementById('calendar-condo-section').classList.add('hidden');
        
        // 리스트 뷰에서 선택 상태 복원
        if (selectedCondoData) {
            updateListSelection();
        }
    }
}

// ========================================
// 📝 폼 관련 함수들
// ========================================

/**
 * 선택 정보 업데이트
 */
function updateSelectedInfo() {
    if (!selectedCondoData) return;

    const info = document.getElementById('selected-info');
    document.getElementById('selected-date-text').textContent = formatDate(selectedCondoData.date);
    document.getElementById('selected-condo-text').textContent = selectedCondoData.name;
    document.getElementById('selected-type-text').textContent = selectedCondoData.type;
    document.getElementById('selected-duration-text').textContent = selectedCondoData.duration;
    
    const noteElement = document.getElementById('selected-note-text');
    if (selectedCondoData.note) {
        noteElement.innerHTML = `<div class="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg mt-3 font-medium">※ ${selectedCondoData.note}</div>`;
    } else {
        noteElement.innerHTML = '';
    }

    info.classList.remove('hidden');
}

/**
 * 날짜 포맷팅
 * @param {string} dateStr - 날짜 문자열 (YYYY-MM-DD)
 * @returns {string} - 포맷된 날짜
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 신청 버튼 상태 업데이트
 */
function updateSubmitButton() {
    const submitBtn = document.getElementById('submit-btn');
    const name = document.getElementById('applicant-name').value.trim();
    const employeeId = document.getElementById('employee-id').value.trim();
    const phone = document.getElementById('phone-number').value.trim();

    if (selectedCondoData && name && employeeId && phone && !isSubmitting) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

/**
 * 신청 처리
 */
async function handleSubmit() {
    if (isSubmitting) return;
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    
    try {
        isSubmitting = true;
        submitBtn.disabled = true;
        submitText.textContent = '처리 중...';
        
        // 입력값 검증
        const name = document.getElementById('applicant-name').value.trim();
        const employeeId = document.getElementById('employee-id').value.trim();
        const phone = document.getElementById('phone-number').value.trim();
        
        if (!selectedCondoData) {
            throw new Error('콘도를 선택해주세요.');
        }
        
        if (!name || !employeeId || !phone) {
            throw new Error('모든 필수 정보를 입력해주세요.');
        }
        
        // 사번 형식 검증 (숫자만)
        if (!/^\d+$/.test(employeeId)) {
            throw new Error('사번은 숫자만 입력해주세요.');
        }
        
        // 연락처 형식 검증
        if (!/^[\d-\s()]+$/.test(phone)) {
            throw new Error('올바른 연락처 형식을 입력해주세요.');
        }
        
        // 중복 신청 체크
        const isDuplicate = await checkDuplicateApplication(employeeId);
        if (isDuplicate) {
            throw new Error('이미 신청하신 내역이 있습니다. 중복 신청은 불가능합니다.');
        }
        
        // 신청 데이터 준비
        const applicationData = {
            employeeId,
            name,
            phone,
            condoName: selectedCondoData.name,
            condoType: selectedCondoData.type,
            condoDuration: selectedCondoData.duration,
            condoDate: selectedCondoData.date,
            condoDates: selectedCondoData.dates,
            condoNote: selectedCondoData.note || ''
        };
        
        // Firebase에 저장
        const docId = await saveApplicationToFirebase(applicationData);
        
        console.log('신청 완료! 문서 ID:', docId);
        
        // 성공 메시지 표시
        window.Firebase.showSuccess('신청이 완료되었습니다! 추첨 결과는 6월 16일(월) 16시에 발표됩니다.');
        
        // 폼 초기화
        resetForm();
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('신청 처리 중 오류:', error);
        window.Firebase.handleError(error, error.message);
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitText.textContent = '신청하기';
        updateSubmitButton();
    }
}

// ========================================
// 🔄 유틸리티 함수들
// ========================================

/**
 * 리스트 뷰 선택 상태 복원
 */
function updateListSelection() {
    if (!selectedCondoData) return;
    
    document.querySelectorAll('.condo-row').forEach(row => {
        row.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
    });
    
    // 해당 콘도의 테이블 행 찾아서 선택 표시
    const targetId = `${selectedCondoData.date}_${findCondoIndex(selectedCondoData.date, selectedCondoData)}`;
    const targetRow = document.querySelector(`[data-condo-id="${targetId}"]`);
    if (targetRow) {
        targetRow.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
    }
}

/**
 * 콘도 인덱스 찾기
 * @param {string} date - 날짜
 * @param {Object} targetCondo - 찾을 콘도
 * @returns {number} - 인덱스
 */
function findCondoIndex(date, targetCondo) {
    const condos = condoData[date] || [];
    return condos.findIndex(condo => 
        condo.name === targetCondo.name && 
        condo.type === targetCondo.type && 
        condo.dates === targetCondo.dates
    );
}

/**
 * 폼 초기화
 */
function resetForm() {
    selectedDate = null;
    selectedCondo = null;
    selectedCondoData = null;

    document.querySelectorAll('.calendar-day').forEach(el => {
        el.classList.remove('bg-blue-500', 'text-white', 'border-blue-600');
    });

    document.querySelectorAll('#calendar-condo-options > div').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50');
        el.classList.add('border-gray-200');
    });

    document.querySelectorAll('.condo-row').forEach(el => {
        el.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
    });

    document.getElementById('selected-info').classList.add('hidden');
    document.getElementById('calendar-condo-options').innerHTML = `
        <div class="text-center py-12 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            <p class="text-lg">달력에서 날짜를 선택하면 해당 날짜에 예약 가능한 콘도가 표시됩니다.</p>
        </div>
    `;

    ['applicant-name', 'employee-id', 'phone-number'].forEach(id => {
        document.getElementById(id).value = '';
    });

    updateSubmitButton();
}

// ========================================
// 🚀 초기화 함수
// ========================================

/**
 * 애플리케이션 초기화
 */
function initializeApp() {
    console.log('🚀 애플리케이션 초기화 시작');
    
    // 달력 생성
    createCalendar(2025, 7, 'july-calendar');
    createCalendar(2025, 8, 'august-calendar');
    
    // 리스트 테이블 생성
    createCondoTable();
    
    // 이벤트 리스너 등록
    setupEventListeners();
    
    console.log('✅ 애플리케이션 초기화 완료');
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 탭 이벤트 리스너
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            switchView(button.dataset.view);
        });
    });

    // 입력 필드 이벤트 리스너
    const inputs = ['applicant-name', 'employee-id', 'phone-number'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateSubmitButton);
        }
    });

    // 신청 버튼 이벤트
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
}

// ========================================
// 📱 DOM 로드 완료 시 실행
// ========================================

// Firebase 준비 완료 이벤트 리스너
window.addEventListener('firebaseReady', function() {
    initializeApp();
});

// Firebase 없이도 기본 기능 동작하도록 (개발/테스트용)
document.addEventListener('DOMContentLoaded', function() {
    // Firebase가 준비되지 않은 경우 3초 후 강제 초기화
    setTimeout(() => {
        if (!window.Firebase || !window.Firebase.isReady()) {
            console.warn('⚠️ Firebase 연결 없이 애플리케이션 초기화');
            initializeApp();
        }
    }, 3000);
});