class CampingChecklist {
    constructor() {
        this.totalItems = 0;
        this.checkedItems = 0;
        this.currentDate = '';
        this.init();
    }

    init() {
        // DOM 요소
        this.dateInput = document.getElementById('campingDate');
        this.loadDateBtn = document.getElementById('loadDateBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressText = document.getElementById('progressText');
        this.progressFill = document.getElementById('progressFill');
        this.savedDatesList = document.getElementById('savedDatesList');
        this.checkboxes = document.querySelectorAll('input[type="checkbox"]');

        // 총 아이템 수 계산
        this.totalItems = this.checkboxes.length;

        // 오늘 날짜 설정
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
        this.currentDate = today;

        // 이벤트 리스너
        this.loadDateBtn.addEventListener('click', () => this.loadDate());
        this.saveBtn.addEventListener('click', () => this.saveChecklist());
        this.resetBtn.addEventListener('click', () => this.resetChecklist());
        
        this.checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateProgress());
        });

        // 저장된 날짜 목록 로드
        this.loadSavedDates();
        
        // 현재 날짜의 체크리스트 자동 로드
        this.loadDate();
    }

    // 체크리스트 저장
    saveChecklist() {
        const date = this.dateInput.value;
        if (!date) {
            alert('날짜를 선택해주세요.');
            return;
        }

        const checklist = {};
        this.checkboxes.forEach(checkbox => {
            const itemId = checkbox.getAttribute('data-item');
            checklist[itemId] = checkbox.checked;
        });

        // localStorage에 저장
        localStorage.setItem(`camping_${date}`, JSON.stringify(checklist));
        
        // 저장된 날짜 목록 업데이트
        this.updateSavedDatesList(date);
        
        alert(`${date} 체크리스트가 저장되었습니다!`);
        this.loadSavedDates();
    }

    // 날짜별 체크리스트 불러오기
    loadDate() {
        const date = this.dateInput.value;
        if (!date) {
            alert('날짜를 선택해주세요.');
            return;
        }

        this.currentDate = date;
        const savedData = localStorage.getItem(`camping_${date}`);

        if (savedData) {
            const checklist = JSON.parse(savedData);
            this.checkboxes.forEach(checkbox => {
                const itemId = checkbox.getAttribute('data-item');
                checkbox.checked = checklist[itemId] || false;
            });
            this.updateProgress();
        } else {
            // 저장된 데이터가 없으면 모두 초기화
            this.resetChecklist();
        }
    }

    // 체크리스트 초기화
    resetChecklist() {
        if (confirm('정말 모든 체크를 초기화하시겠습니까?')) {
            this.checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            this.updateProgress();
        }
    }

    // 진행률 업데이트
    updateProgress() {
        this.checkedItems = 0;
        this.checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                this.checkedItems++;
            }
        });

        const percentage = Math.round((this.checkedItems / this.totalItems) * 100);
        this.progressText.textContent = `${this.checkedItems}/${this.totalItems} (${percentage}%)`;
        this.progressFill.style.width = `${percentage}%`;
    }

    // 저장된 날짜 목록에 추가
    updateSavedDatesList(date) {
        let savedDates = JSON.parse(localStorage.getItem('camping_dates') || '[]');
        if (!savedDates.includes(date)) {
            savedDates.push(date);
            savedDates.sort().reverse(); // 최신 날짜가 앞으로
            localStorage.setItem('camping_dates', JSON.stringify(savedDates));
        }
    }

    // 저장된 날짜 목록 로드
    loadSavedDates() {
        const savedDates = JSON.parse(localStorage.getItem('camping_dates') || '[]');
        this.savedDatesList.innerHTML = '';

        if (savedDates.length === 0) {
            this.savedDatesList.innerHTML = '<p class="empty-state">저장된 날짜가 없습니다</p>';
            return;
        }

        savedDates.forEach(date => {
            const dateTag = document.createElement('div');
            dateTag.className = 'date-tag';
            
            const dateText = document.createElement('span');
            dateText.textContent = date;
            dateText.addEventListener('click', () => {
                this.dateInput.value = date;
                this.loadDate();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSavedDate(date);
            });

            dateTag.appendChild(dateText);
            dateTag.appendChild(deleteBtn);
            this.savedDatesList.appendChild(dateTag);
        });
    }

    // 저장된 날짜 삭제
    deleteSavedDate(date) {
        if (confirm(`${date}의 체크리스트를 삭제하시겠습니까?`)) {
            // 체크리스트 데이터 삭제
            localStorage.removeItem(`camping_${date}`);
            
            // 날짜 목록에서 삭제
            let savedDates = JSON.parse(localStorage.getItem('camping_dates') || '[]');
            savedDates = savedDates.filter(d => d !== date);
            localStorage.setItem('camping_dates', JSON.stringify(savedDates));
            
            // UI 업데이트
            this.loadSavedDates();
            
            // 현재 선택된 날짜가 삭제된 경우 초기화
            if (this.dateInput.value === date) {
                this.resetChecklist();
            }
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new CampingChecklist();
});
