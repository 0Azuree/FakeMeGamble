// Game State Variables
let playerBalance = 10000;
let dealerBalance = 10000;
let currentBet = 0;
let totalWinnings = 0;
let totalLosses = 0;
let deck = [];
let playerHand = [];
let dealerHand = [];
let isGameActive = false;

// DOM Elements
const playerBalanceEl = document.getElementById('player-balance');
const dealerBalanceEl = document.getElementById('dealer-balance');
const betAmountEl = document.getElementById('bet-amount');
const placeBetBtn = document.getElementById('place-bet-btn');
const gameArea = document.getElementById('game-area');
const dashboard = document.getElementById('dashboard');
const playerHandEl = document.getElementById('player-hand');
const dealerHandEl = document.getElementById('dealer-hand');
const playerScoreEl = document.getElementById('player-score');
const dealerScoreEl = document.getElementById('dealer-score');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const doubleBtn = document.getElementById('double-btn');
const playAnotherBtn = document.getElementById('play-another-btn');
const gameMessageEl = document.getElementById('game-message');
const moneyBtn = document.getElementById('money-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const moneyHistorySection = document.getElementById('money-history');
const howToPlaySection = document.getElementById('how-to-play');
const totalWinningsEl = document.getElementById('total-winnings');
const totalLossesEl = document.getElementById('total-losses');
const financialStatusEl = document.getElementById('financial-status');
const resetBtn = document.getElementById('reset-btn');

// Initial setup
updateBalances();
showSection('dashboard');

// Event Listeners
placeBetBtn.addEventListener('click', startGame);
hitBtn.addEventListener('click', playerHit);
standBtn.addEventListener('click', playerStand);
playAnotherBtn.addEventListener('click', resetGame);
moneyBtn.addEventListener('click', () => showSection('money-history'));
howToPlayBtn.addEventListener('click', () => showSection('how-to-play'));
resetBtn.addEventListener('click', resetAll);

// Game Logic
function showSection(sectionId) {
    dashboard.classList.add('hidden');
    gameArea.classList.add('hidden');
    moneyHistorySection.classList.add('hidden');
    howToPlaySection.classList.add('hidden');

    switch(sectionId) {
        case 'dashboard':
            dashboard.classList.remove('hidden');
            break;
        case 'game-area':
            gameArea.classList.remove('hidden');
            break;
        case 'money-history':
            moneyHistorySection.classList.remove('hidden');
            updateMoneyHistory();
            break;
        case 'how-to-play':
            howToPlaySection.classList.remove('hidden');
            break;
    }
}

function updateBalances() {
    playerBalanceEl.textContent = playerBalance;
    dealerBalanceEl.textContent = dealerBalance;
}

function updateMoneyHistory() {
    totalWinningsEl.textContent = totalWinnings;
    totalLossesEl.textContent = totalLosses;
    if (totalWinnings > totalLosses) {
        financialStatusEl.textContent = 'In the positives!';
        financialStatusEl.className = 'positive';
    } else if (totalWinnings < totalLosses) {
        financialStatusEl.textContent = 'In the negatives.';
        financialStatusEl.className = 'negative';
    } else {
        financialStatusEl.textContent = 'Even Steven.';
        financialStatusEl.className = '';
    }
}

function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ rank, suit });
        }
    }
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    if (['Jack', 'Queen', 'King'].includes(card.rank)) {
        return 10;
    }
    if (card.rank === 'Ace') {
        return 11;
    }
    return parseInt(card.rank);
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
        score += getCardValue(card);
        if (card.rank === 'Ace') {
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
        cardEl.className = `card ${['Hearts', 'Diamonds'].includes(card.suit) ? 'red' : ''}`;
        
        if (isDealer && index === 1 && !isGameActive) {
            cardEl.innerHTML = `
                <div class="card-back"></div>
            `;
        } else {
            cardEl.innerHTML = `
                <div class="card-top">${card.rank.charAt(0)}</div>
                <span class="card-symbol">${getSuitSymbol(card.suit)}</span>
                <div class="card-bottom">${card.rank.charAt(0)}</div>
            `;
        }
        container.appendChild(cardEl);
    });
}

function getSuitSymbol(suit) {
    switch(suit) {
        case 'Hearts': return '♥';
        case 'Diamonds': return '♦';
        case 'Clubs': return '♣';
        case 'Spades': return '♠';
    }
}

function startGame() {
    currentBet = parseInt(betAmountEl.value);
    if (currentBet > playerBalance || currentBet <= 0 || isNaN(currentBet)) {
        alert("Invalid bet amount. Please bet a value between 1 and your current balance.");
        return;
    }

    // Prepare for a new game
    isGameActive = true;
    createDeck();
    playerHand = [];
    dealerHand = [];
    gameMessageEl.textContent = '';
    playAnotherBtn.classList.add('hidden');
    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = false;
    
    // Deal initial cards
    playerHand.push(drawCard(), drawCard());
    dealerHand.push(drawCard(), drawCard());

    // Update UI
    renderCards(playerHand, playerHandEl, false);
    renderCards(dealerHand, dealerHandEl, true);
    playerScoreEl.textContent = calculateScore(playerHand);
    dealerScoreEl.textContent = '?';

    showSection('game-area');
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
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;

    // Reveal dealer's hidden card
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
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;
    
    let message = '';
    if (result === 'win') {
        playerBalance += currentBet;
        dealerBalance -= currentBet;
        totalWinnings += currentBet;
        message = `You win! You made $${currentBet}.`;
    } else if (result === 'loss') {
        playerBalance -= currentBet;
        dealerBalance += currentBet;
        totalLosses += currentBet;
        message = `You lose! You lost $${currentBet}.`;
    } else if (result === 'bust') {
        playerBalance -= currentBet;
        dealerBalance += currentBet;
        totalLosses += currentBet;
        message = `Bust! You lost $${currentBet}.`;
    } else { // draw
        message = `It's a draw! Your bet has been returned.`;
    }

    gameMessageEl.textContent = message;
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
    betAmountEl.value = '100';
    showSection('dashboard');
}

function resetAll() {
    playerBalance = 10000;
    dealerBalance = 10000;
    totalWinnings = 0;
    totalLosses = 0;
    updateBalances();
    updateMoneyHistory();
    resetGame();
    showSection('dashboard');
}
