class TaxCalculator {
    constructor() {
        this.init();
    }

    init() {
        // DOM 요소
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.resultSection = document.getElementById('resultSection');

        // 이벤트 리스너
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    // 입력값 가져오기
    getValue(id) {
        const element = document.getElementById(id);
        if (element.type === 'checkbox') {
            return element.checked ? 1 : 0;
        }
        return Number(element.value) || 0;
    }

    // 근로소득공제 계산
    calculateWorkIncomeDeduction(totalIncome) {
        if (totalIncome <= 5000000) {
            return totalIncome * 0.7;
        } else if (totalIncome <= 15000000) {
            return 3500000 + (totalIncome - 5000000) * 0.4;
        } else if (totalIncome <= 45000000) {
            return 7500000 + (totalIncome - 15000000) * 0.15;
        } else if (totalIncome <= 100000000) {
            return 12000000 + (totalIncome - 45000000) * 0.05;
        } else {
            return 14750000 + (totalIncome - 100000000) * 0.02;
        }
    }

    // 과세표준 → 산출세액 계산 (2024년 세율)
    calculateTax(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        
        if (taxableIncome <= 14000000) {
            return taxableIncome * 0.06;
        } else if (taxableIncome <= 50000000) {
            return 840000 + (taxableIncome - 14000000) * 0.15;
        } else if (taxableIncome <= 88000000) {
            return 6240000 + (taxableIncome - 50000000) * 0.24;
        } else if (taxableIncome <= 150000000) {
            return 15360000 + (taxableIncome - 88000000) * 0.35;
        } else if (taxableIncome <= 300000000) {
            return 37060000 + (taxableIncome - 150000000) * 0.38;
        } else if (taxableIncome <= 500000000) {
            return 94060000 + (taxableIncome - 300000000) * 0.40;
        } else if (taxableIncome <= 1000000000) {
            return 174060000 + (taxableIncome - 500000000) * 0.42;
        } else {
            return 384060000 + (taxableIncome - 1000000000) * 0.45;
        }
    }

    // 지방소득세 계산 (산출세액의 10%)
    calculateLocalTax(calculatedTax) {
        return calculatedTax * 0.1;
    }

    // 계산 실행
    calculate() {
        // 기본 정보
        const totalIncome = this.getValue('totalIncome');
        const paidTax = this.getValue('paidTax');

        if (totalIncome === 0) {
            alert('총급여액을 입력해주세요.');
            return;
        }

        // 1. 근로소득공제
        const workIncomeDeduction = this.calculateWorkIncomeDeduction(totalIncome);
        const workIncome = totalIncome - workIncomeDeduction;

        // 2. 인적공제
        const 본인공제 = 1500000; // 본인은 항상
        const 배우자공제 = this.getValue('배우자') * 1500000;
        const 부양가족공제 = this.getValue('부양가족수') * 1500000;
        
        // 자녀세액공제 계산
        const 자녀수 = this.getValue('자녀수');
        let 자녀세액공제 = 0;
        if (자녀수 === 1) {
            자녀세액공제 = 150000;
        } else if (자녀수 === 2) {
            자녀세액공제 = 300000;
        } else if (자녀수 >= 3) {
            자녀세액공제 = 300000 + (자녀수 - 2) * 300000;
        }
        
        const 인적공제 = 본인공제 + 배우자공제 + 부양가족공제;

        // 3. 기타 소득공제
        const 국민연금 = this.getValue('국민연금');
        const 건강보험 = this.getValue('건강보험');
        
        // 카드 공제 계산 (총급여의 25% 초과분만 공제)
        const cardMinimum = totalIncome * 0.25;
        const 신용카드 = this.getValue('신용카드');
        const 체크카드 = this.getValue('체크카드');
        const 현금영수증 = this.getValue('현금영수증');
        const totalCard = 신용카드 + 체크카드 + 현금영수증;
        
        let 카드공제 = 0;
        if (totalCard > cardMinimum) {
            const excessAmount = totalCard - cardMinimum;
            카드공제 = (신용카드 > cardMinimum ? (신용카드 - cardMinimum) : 0) * 0.15
                     + Math.min(체크카드, Math.max(0, excessAmount - Math.max(0, 신용카드 - cardMinimum))) * 0.3
                     + Math.min(현금영수증, Math.max(0, excessAmount - Math.max(0, 신용카드 - cardMinimum) - 체크카드)) * 0.3;
            // 한도: 최소(min(연봉 * 0.2, 300만원))
            const 카드한도 = Math.min(totalIncome * 0.2, 3000000);
            카드공제 = Math.min(카드공제, 카드한도);
        }
        
        const 주택자금 = this.getValue('주택자금') * 0.4;
        
        const 기타소득공제 = 국민연금 + 건강보험 + 카드공제 + 주택자금;

        // 4. 과세표준
        const 과세표준 = Math.max(0, workIncome - 인적공제 - 기타소득공제);

        // 5. 산출세액 (소득세)
        const 소득세 = this.calculateTax(과세표준);
        
        // 6. 지방소득세
        const 지방소득세 = this.calculateLocalTax(소득세);
        
        // 총 산출세액
        const 산출세액 = 소득세 + 지방소득세;

        // 7. 세액공제
        const 보험료 = Math.min(this.getValue('보험료') * 0.12, 1000000);
        
        // 의료비 공제 (총급여의 3% 초과분)
        const 의료비한도 = totalIncome * 0.03;
        const 의료비입력 = this.getValue('의료비');
        const 의료비 = 의료비입력 > 의료비한도 ? (의료비입력 - 의료비한도) * 0.15 : 0;
        
        const 교육비 = this.getValue('교육비') * 0.15;
        const 기부금 = this.getValue('기부금') * 0.15;
        
        // 월세 세액공제
        const 월세입력 = this.getValue('월세');
        const 월세 = Math.min(월세입력 * 0.12, 7500000 * 0.12);
        
        // 연금저축 세액공제
        const 연금저축입력 = this.getValue('연금저축');
        const 연금저축 = Math.min(연금저축입력 * 0.12, 4000000 * 0.12);
        
        const 세액공제 = 보험료 + 의료비 + 교육비 + 기부금 + 월세 + 연금저축 + 자녀세액공제;

        // 8. 결정세액
        const 결정세액 = Math.max(0, 산출세액 - 세액공제);

        // 9. 환급/추가납부
        const 차액 = paidTax - 결정세액;
        const isRefund = 차액 > 0;

        // 결과 표시
        this.displayResult({
            총급여: totalIncome,
            근로소득공제: workIncomeDeduction,
            근로소득금액: workIncome,
            인적공제: 인적공제,
            기타소득공제: 기타소득공제,
            과세표준: 과세표준,
            산출세액: 산출세액,
            세액공제: 세액공제,
            결정세액: 결정세액,
            기납부세액: paidTax,
            최종: Math.abs(차액),
            isRefund: isRefund
        });
    }

    // 결과 표시
    displayResult(result) {
        document.getElementById('result총급여').textContent = this.formatCurrency(result.총급여);
        document.getElementById('result근로소득공제').textContent = this.formatCurrency(result.근로소득공제);
        document.getElementById('result근로소득금액').textContent = this.formatCurrency(result.근로소득금액);
        document.getElementById('result인적공제').textContent = this.formatCurrency(result.인적공제);
        document.getElementById('result기타소득공제').textContent = this.formatCurrency(result.기타소득공제);
        document.getElementById('result과세표준').textContent = this.formatCurrency(result.과세표준);
        document.getElementById('result산출세액').textContent = this.formatCurrency(result.산출세액);
        document.getElementById('result세액공제').textContent = this.formatCurrency(result.세액공제);
        document.getElementById('result결정세액').textContent = this.formatCurrency(result.결정세액);
        document.getElementById('result기납부세액').textContent = this.formatCurrency(result.기납부세액);
        
        const 최종결과 = document.getElementById('result최종');
        const finalResult = document.getElementById('finalResult');
        
        if (result.isRefund) {
            최종결과.textContent = '환급 ' + this.formatCurrency(result.최종);
            최종결과.className = 'result-value';
            finalResult.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
        } else {
            최종결과.textContent = '추가납부 ' + this.formatCurrency(result.최종);
            최종결과.className = 'result-value negative';
            finalResult.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        }

        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 숫자 포맷팅
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(amount);
    }

    // 초기화
    reset() {
        if (confirm('모든 입력값을 초기화하시겠습니까?')) {
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                if (input.id === '부양가족수' || input.id === '자녀수') {
                    input.value = 0;
                } else {
                    input.value = '';
                }
            });

            const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#본인)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            this.resultSection.style.display = 'none';
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TaxCalculator();
});
