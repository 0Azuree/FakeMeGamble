// Game State Variables
const STARTING_BALANCE = 5500;
let playerBalance = STARTING_BALANCE;
let totalWinnings = 0;
let totalLosses = 0;
let currentBet = 0;
let deck = [];
let playerHand = [];
let dealerHand = [];
let isGameActive = false;

// DOM Elements
const screens = document.querySelectorAll('.screen');
const menuBtns = document.querySelectorAll('.menu-btn');
const backBtns = document.querySelectorAll('.back-btn');
const gameBtns = document.querySelectorAll('.game-btn');
const resetBtn = document.querySelector('.reset-btn');

// Game Specific Elements
const playerBalanceEl = document.getElementById('player-balance');
const moneyBalanceEl = document.getElementById('money-balance');
const betAmountEl = document.getElementById('bet-amount');
const placeBetBtn = document.getElementById('place-bet-btn');
const playerHandEl = document.getElementById('player-hand');
const dealerHandEl = document.getElementById('dealer-hand');
const playerScoreEl = document.getElementById('player-score');
const dealerScoreEl = document.getElementById('dealer-score');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const playAnotherBtn = document.getElementById('play-another-btn');
const gameControls = document.querySelector('.game-controls');
const betControls = document.querySelector('.bet-controls');
const gameMessageEl = document.getElementById('game-message');

// Money Screen Elements
const totalWinningsEl = document.getElementById('total-winnings');
const totalLossesEl = document.getElementById('total-losses');
const financialStatusEl = document.getElementById('financial-status');

// Initial Setup
updateBalances();
showScreen('home-screen');

// Event Listeners for Navigation
menuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen(btn.dataset.target);
    });
});

backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Simple back navigation for now
        if (btn.closest('.screen').id === 'gamble-menu') {
            showScreen('home-screen');
        } else if (btn.closest('.screen').id === 'game-screen') {
            resetGame();
            showScreen('gamble-menu');
        } else {
            showScreen('home-screen');
        }
    });
});

gameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.game === 'blackjack') {
            showScreen('game-screen');
        } else {
            alert("This game is coming soon!");
        }
    });
});

resetBtn.addEventListener('click', () => {
    const isConfirmed = confirm("Are you sure you want to reset all progress? Your balance will be set back to $5500.");
    if (isConfirmed) {
        resetAllProgress();
        showScreen('home-screen');
    }
});

// Game Logic Listeners (Blackjack)
placeBetBtn.addEventListener('click', startGame);
hitBtn.addEventListener('click', playerHit);
standBtn.addEventListener('click', playerStand);
playAnotherBtn.addEventListener('click', () => {
    resetGame();
    showScreen('game-screen');
});

// --- Helper Functions ---

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Update displays for specific screens
    if (screenId === 'money-screen') {
        updateMoneyHistory();
    }
}

function updateBalances() {
    playerBalanceEl.textContent = playerBalance;
    moneyBalanceEl.textContent = playerBalance;
}

function updateMoneyHistory() {
    totalWinningsEl.textContent = totalWinnings;
    totalLossesEl.textContent = totalLosses;
    const netChange = totalWinnings - totalLosses;
    if (netChange > 0) {
        financialStatusEl.textContent = `In the positives! ($${netChange})`;
        financialStatusEl.className = 'status-positive';
    } else if (netChange < 0) {
        financialStatusEl.textContent = `In the negatives. ($${Math.abs(netChange)})`;
        financialStatusEl.className = 'status-negative';
    } else {
        financialStatusEl.textContent = `Even Steven.`;
        financialStatusEl.className = 'status-neutral';
    }
}

function createDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ rank, suit });
        }
    }
    // Simple Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.rank)) {
        return 10;
    }
    if (card.rank === 'A') {
        return 11;
    }
    return parseInt(card.rank);
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
        score += getCardValue(card);
        if (card.rank === 'A') {
            aceCount++;
        }
    }
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function drawCard() {
    return deck.pop();
}

function renderCards(hand, container, isDealer) {
    container.innerHTML = '';
    hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${['♥', '♦'].includes(card.suit) ? 'red' : ''}`;
        
        if (isDealer && index === 1 && isGameActive) {
            cardEl.innerHTML = `?`; // Hide the second card
        } else {
            cardEl.innerHTML = `
                <span>${card.rank}</span>
                <span>${card.suit}</span>
            `;
        }
        container.appendChild(cardEl);
    });
}

// --- Blackjack Game Flow ---

function startGame() {
    currentBet = parseInt(betAmountEl.value);
    if (isNaN(currentBet) || currentBet <= 0 || currentBet > playerBalance) {
        alert("Please enter a valid bet amount.");
        return;
    }

    isGameActive = true;
    createDeck();
    playerHand = [];
    dealerHand = [];
    gameMessageEl.textContent = '';
    playAnotherBtn.classList.add('hidden');
    gameControls.classList.remove('hidden');
    betControls.classList.add('hidden');
    
    playerHand.push(drawCard(), drawCard());
    dealerHand.push(drawCard(), drawCard());

    renderCards(playerHand, playerHandEl, false);
    renderCards(dealerHand, dealerHandEl, true);
    playerScoreEl.textContent = calculateScore(playerHand);
    dealerScoreEl.textContent = '?';

    if (calculateScore(playerHand) === 21) {
        endGame('blackjack');
    }
}

function playerHit() {
    playerHand.push(drawCard());
    renderCards(playerHand, playerHandEl, false);
    const score = calculateScore(playerHand);
    playerScoreEl.textContent = score;

    if (score > 21) {
        endGame('bust');
    }
}

function playerStand() {
    isGameActive = false;
    gameControls.classList.add('hidden');
    
    // Show dealer's hidden card
    renderCards(dealerHand, dealerHandEl, false);
    dealerScoreEl.textContent = calculateScore(dealerHand);

    // Dealer's turn
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(drawCard());
        renderCards(dealerHand, dealerHandEl, false);
        dealerScoreEl.textContent = calculateScore(dealerHand);
    }
    
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (dealerScore > 21 || playerScore > dealerScore) {
        endGame('win');
    } else if (playerScore < dealerScore) {
        endGame('loss');
    } else {
        endGame('draw');
    }
}

function endGame(result) {
    gameControls.classList.add('hidden');
    
    if (result === 'win' || result === 'blackjack') {
        playerBalance += currentBet;
        totalWinnings += currentBet;
        gameMessageEl.textContent = `You win! You made $${currentBet}.`;
    } else if (result === 'loss' || result === 'bust') {
        playerBalance -= currentBet;
        totalLosses += currentBet;
        gameMessageEl.textContent = `You lost! You lost $${currentBet}.`;
    } else if (result === 'draw') {
        gameMessageEl.textContent = `It's a draw. Your bet has been returned.`;
    }

    updateBalances();
    playAnotherBtn.classList.remove('hidden');
}

function resetGame() {
    isGameActive = false;
    playerHandEl.innerHTML = '';
    dealerHandEl.innerHTML = '';
    playerScoreEl.textContent = '0';
    dealerScoreEl.textContent = '0';
    gameMessageEl.textContent = '';
    playAnotherBtn.classList.add('hidden');
    betControls.classList.remove('hidden');
    betAmountEl.value = '100';
}

function resetAllProgress() {
    playerBalance = STARTING_BALANCE;
    totalWinnings = 0;
    totalLosses = 0;
    updateBalances();
    updateMoneyHistory();
    resetGame();
    showScreen('home-screen');
}
