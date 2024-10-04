const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const timeLimit = 25; 
let currentLetter;
let timeLeft;
let timerInterval;
let currentPlayer = 1;
let usedWords = new Set();
let player1Name;
let player2Name;

const startGameBtn = document.getElementById('start-game-btn');
const quitGameBtn = document.getElementById('quit-game-btn');
const letterElement = document.getElementById('letter');
const player1Input = document.getElementById('player1-input');
const player2Input = document.getElementById('player2-input');
const player1Submit = document.getElementById('player1-submit');
const player2Submit = document.getElementById('player2-submit');
const timerElement = document.getElementById('time');
const messageElement = document.getElementById('message');
const usedWordsContainer = document.getElementById('used-words-container');
const usedWordsList = document.getElementById('used-words-list');
const closeUsedWordsBtn = document.getElementById('close-used-words');
const player1Card = document.getElementById('player1-card');
const player2Card = document.getElementById('player2-card');
const celebrationSound = new Audio('/audios/winSound.mp3');
let btnSound = new Audio("/audios/startSound.wav")
function playBtnSound() {
  btnSound.play();
}

function generateRandomLetter() {
    return letters[Math.floor(Math.random() * letters.length)];
}

function startNewGame() {
    startGameBtn.style.display = 'none';
    quitGameBtn.style.display = "inline-block";
    player1Name = prompt("Enter Player 1's name:") || "Player 1";
    player2Name = prompt("Enter Player 2's name:") || "Player 2";

    document.querySelector('#player1-card .player-name').textContent = player1Name;
    document.querySelector('#player2-card .player-name').textContent = player2Name;

    usedWordsContainer.style.display = 'block';

    currentLetter = generateRandomLetter();
    letterElement.textContent = "The letter is : " + currentLetter ;
    usedWords.clear();
    updateUsedWords();
    currentPlayer = 1;
    startNewRound();
    startGameBtn.disabled = true;
}

function startNewRound() {
    player1Input.value = '';
    player2Input.value = '';
    messageElement.textContent = '';
    timeLeft = timeLimit;
    timerElement.textContent = timeLeft;
    clearInterval(timerInterval);
    startTimer();
    updatePlayerTurn();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            endGame(`Time's up! ${currentPlayer === 1 ? player2Name : player1Name} wins.`);
        }
    }, 1000);
}

function endGame(message) {
    messageElement.textContent = message;
    player1Submit.disabled = true;
    player2Submit.disabled = true;
    player1Input.disabled = true;
    player2Input.disabled = true;
    startGameBtn.disabled = false;
    startGameBtn.style.display = 'inline-block';
    quitGameBtn.style.display = 'none';
    player1Card.classList.remove('active-player');
    player2Card.classList.remove('active-player');
    usedWordsContainer.style.display = 'none';
    celebrateWin();

}
function celebrateWin() {
    console.log("Celebrating the win!");
    celebrationSound.play();

    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

function updatePlayerTurn() {
    player1Input.disabled = currentPlayer !== 1;
    player2Input.disabled = currentPlayer !== 2;
    player1Submit.disabled = currentPlayer !== 1;
    player2Submit.disabled = currentPlayer !== 2;

    player1Card.classList.toggle('active-player', currentPlayer === 1);
    player2Card.classList.toggle('active-player', currentPlayer === 2);
}

function updateUsedWords() {
    usedWordsList.innerHTML = '';
    Array.from(usedWords).forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        usedWordsList.appendChild(li);
    });
}

async function checkWord(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
    } catch (error) {
        console.error('Error checking word:', error);
        return false;
    }
}

async function handleSubmit(playerNumber) {
    const input = playerNumber === 1 ? player1Input : player2Input;
    const word = input.value.trim().toLowerCase();

    if (word[0].toUpperCase() !== currentLetter) {
        showMessage(`The word must start with the letter ${currentLetter}!`, 'error');
        shakeElement(input);
        return;
    }

    if (usedWords.has(word)) {
        showMessage('This word has already been used!', 'error');
        shakeElement(input);
        return;
    }

    const isValidWord = await checkWord(word);
    if (!isValidWord) {
        showMessage('That\'s not a valid word!', 'error');
        shakeElement(input);
        return;
    }

    usedWords.add(word);
    updateUsedWords();
    showMessage('Good word!', 'success');

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    startNewRound();
}

function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    setTimeout(() => {
        messageElement.className = 'message';
    }, 3000);
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

let isDragging = false;
let dragOffsetX, dragOffsetY;

usedWordsContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - usedWordsContainer.offsetLeft;
    dragOffsetY = e.clientY - usedWordsContainer.offsetTop;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        usedWordsContainer.style.left = (e.clientX - dragOffsetX) + 'px';
        usedWordsContainer.style.top = (e.clientY - dragOffsetY) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

closeUsedWordsBtn.addEventListener('click', () => {
    usedWordsContainer.style.display = 'none';
});

startGameBtn.addEventListener('click', startNewGame);
quitGameBtn.addEventListener('click', () => {
    location.reload();
});
player1Submit.addEventListener('click', () => handleSubmit(1));
player2Submit.addEventListener('click', () => handleSubmit(2));

player1Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit(1);
});

player2Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit(2);
});

const currentYear = new Date().getFullYear();
document.getElementById("year").textContent = currentYear;