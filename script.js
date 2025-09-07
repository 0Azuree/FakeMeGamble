// Game State
let gameState = {
    balance: 10000,
    initialBalance: 10000,
    totalWon: 0,
    totalLost: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    currentGame: null
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    loadGameState();
});

// Game Selection
function selectGame(game) {
    gameState.currentGame = game;
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('gameTitle').textContent = getGameName(game);
    document.querySelector('.game-selection').style.display = 'none';
    document.getElementById('gameContent').innerHTML = '';
}

function backToMenu() {
    document.getElementById('gameArea').style.display = 'none';
    document.querySelector('.game-selection').style.display = 'block';
    gameState.currentGame = null;
}

function getGameName(game) {
    const names = {
        blackjack: 'Blackjack',
        roulette: 'Roulette',
        slots: 'Slots',
        poker: 'Poker',
        baccarat: 'Baccarat'
    };
    return names[game];
}

// Betting
function setMaxBet() {
    document.getElementById('betAmount').value = gameState.balance;
}

// Play Game
function playGame() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    
    if (betAmount > gameState.balance) {
        alert('Insufficient balance!');
        return;
    }
    
    if (betAmount <= 0) {
        alert('Bet amount must be greater than 0!');
        return;
    }
    
    gameState.balance -= betAmount;
    gameState.gamesPlayed++;
    
    // Simulate game result
    const result = simulateGame(gameState.currentGame);
    const won = result.win;
    const amount = result.amount;
    
    if (won) {
        gameState.balance += amount;
        gameState.totalWon += (amount - betAmount);
        gameState.gamesWon++;
    } else {
        gameState.totalLost += betAmount;
    }
    
    displayGameResult(result, betAmount);
    updateUI();
    saveGameState();
}

// Simulate different games
function simulateGame(game) {
    const random = Math.random();
    let winChance = 0.45; // House edge
    
    switch(game) {
        case 'blackjack':
            winChance = 0.48;
            break;
        case 'roulette':
            winChance = 0.47;
            break;
        case 'slots':
            winChance = 0.44;
            break;
        case 'poker':
            winChance = 0.46;
            break;
        case 'baccarat':
            winChance = 0.49;
            break;
    }
    
    const won = random < winChance;
    const multiplier = won ? (1.5 + Math.random() * 1.5) : 0;
    const betAmount = parseInt(document.getElementById('betAmount').value);
    
    return {
        win: won,
        amount: Math.floor(betAmount * multiplier),
        message: won ? `You won $${Math.floor(betAmount * multiplier)}!` : 'You lost!',
        details: getGameDetails(game, won)
    };
}

function getGameDetails(game, won) {
    const details = {
        blackjack: won ? 'Blackjack! You beat the dealer!' : 'Busted! Dealer wins.',
        roulette: won ? 'Number hit! You win!' : 'No luck this spin.',
        slots: won ? 'Jackpot! Symbols aligned!' : 'No match. Try again!',
        poker: won ? 'Great hand! You win!' : 'Better luck next hand.',
        baccarat: won ? 'Your bet paid off!' : 'House takes this round.'
    };
    return details[game];
}

function displayGameResult(result, betAmount) {
    const content = document.getElementById('gameContent');
    content.innerHTML = `
        <div class="result-container">
            <div class="result-icon">
                <i class="fas fa-${result.win ? 'trophy' : 'times-circle'}"></i>
            </div>
            <h3 class="result-title">${result.win ? 'You Won!' : 'You Lost'}</h3>
            <p class="result-message">${result.details}</p>
            <div class="result-amount ${result.win ? 'positive' : 'negative'}">
                ${result.win ? '+' : '-'}$${Math.abs(result.amount - (result.win ? 0 : betAmount))}
            </div>
            <button class="btn-primary" onclick="playGame()">
                <i class="fas fa-redo"></i> Play Again
            </button>
        </div>
    `;
}

// UI Updates
function updateUI() {
    document.getElementById('balance').textContent = gameState.balance.toLocaleString();
    document.getElementById('totalWon').textContent = '$' + gameState.totalWon.toLocaleString();
    document.getElementById('totalLost').textContent = '$' + gameState.totalLost.toLocaleString();
    
    const netWorth = gameState.balance - gameState.initialBalance;
    const netWorthElement = document.getElementById('netWorth');
    netWorthElement.innerHTML = `
        <span class="${netWorth >= 0 ? 'positive' : 'negative'}">
            Net: ${netWorth >= 0 ? '+' : ''}$${Math.abs(netWorth).toLocaleString()}
        </span>
    `;
    
    const winRate = gameState.gamesPlayed > 0 
        ? Math.round((gameState.gamesWon / gameState.gamesPlayed) * 100) 
        : 0;
    document.getElementById('winRate').textContent = winRate + '%';
}

// How to Play
function toggleHowToPlay() {
    const content = document.getElementById('howToPlayContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

// Reset Game
function resetGame() {
    if (confirm('Are you sure you want to reset all progress?')) {
        gameState = {
            balance: 10000,
            initialBalance: 10000,
            totalWon: 0,
            totalLost: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            currentGame: null
        };
        updateUI();
        saveGameState();
        backToMenu();
    }
}

// Local Storage
function saveGameState() {
    localStorage.setItem('fakemegamble_state', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('fakemegamble_state');
    if (saved) {
        gameState = JSON.parse(saved);
        updateUI();
    }
}
