// 로또 번호 생성 클래스
class LottoGenerator {
    constructor() {
        this.totalGames = 0;
        this.init();
    }

    init() {
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.gameCountInput = document.getElementById('gameCount');
        this.resultsDiv = document.getElementById('results');
        this.totalGamesSpan = document.getElementById('totalGames');

        this.generateBtn.addEventListener('click', () => this.generateLotto());
        this.clearBtn.addEventListener('click', () => this.clearResults());

        // Enter 키로도 생성 가능
        this.gameCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateLotto();
            }
        });

        // 로컬 스토리지에서 통계 불러오기
        this.loadStats();
    }

    // 1-45 중 6개의 중복되지 않는 랜덤 번호 생성
    generateNumbers() {
        const numbers = [];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    // 로또 게임 생성
    generateLotto() {
        const gameCount = parseInt(this.gameCountInput.value);
        
        if (gameCount < 1 || gameCount > 10) {
            alert('게임 수는 1에서 10 사이여야 합니다.');
            return;
        }

        // 기존 결과 초기화
        this.resultsDiv.innerHTML = '';

        // 지정된 수만큼 게임 생성
        for (let i = 0; i < gameCount; i++) {
            const numbers = this.generateNumbers();
            this.displayGame(i + 1, numbers);
        }

        // 통계 업데이트
        this.totalGames += gameCount;
        this.updateStats();
        this.saveStats();

        // 생성 버튼 애니메이션
        this.generateBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.generateBtn.style.transform = 'scale(1)';
        }, 100);
    }

    // 게임 결과 표시
    displayGame(gameNum, numbers) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game';

        const title = document.createElement('div');
        title.className = 'game-title';
        title.textContent = `게임 ${gameNum}`;

        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'numbers';

        numbers.forEach((num, index) => {
            const numberSpan = document.createElement('div');
            numberSpan.className = 'number';
            numberSpan.textContent = num;
            numberSpan.style.animationDelay = `${index * 0.1}s`;
            numbersDiv.appendChild(numberSpan);
        });

        gameDiv.appendChild(title);
        gameDiv.appendChild(numbersDiv);
        this.resultsDiv.appendChild(gameDiv);
    }

    // 결과 초기화
    clearResults() {
        this.resultsDiv.innerHTML = '';
        this.gameCountInput.value = 1;
    }

    // 통계 업데이트
    updateStats() {
        this.totalGamesSpan.textContent = this.totalGames;
    }

    // 통계 저장
    saveStats() {
        localStorage.setItem('lottoTotalGames', this.totalGames.toString());
    }

    // 통계 불러오기
    loadStats() {
        const saved = localStorage.getItem('lottoTotalGames');
        if (saved) {
            this.totalGames = parseInt(saved);
            this.updateStats();
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LottoGenerator();
});
