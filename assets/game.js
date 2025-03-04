const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('#btn'),
    win: document.querySelector('.win')
};

let msg = document.querySelector('.msg');
let msgText = document.querySelector('.msg p');
let startBtn = document.querySelector('#btn');
let rulesBtn = document.getElementById('rulesBtn');
let rulesPopup = document.getElementById('rulesPopup');
let closeBtn = rulesPopup.querySelector('.close');

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

const shuffle = array => {
    const clonedArray = [...array];
    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [clonedArray[index], clonedArray[randomIndex]] = [clonedArray[randomIndex], clonedArray[index]];
    }
    return clonedArray;
};

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let index = 0; index < items; index++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.");
    }

    const images = [
        'assets/images/image1.jpg',
        'assets/images/image2.jpg',
        'assets/images/image3.jpg',
        'assets/images/image4.jpg',
        'assets/images/image5.jpg',
        'assets/images/image6.jpg',
        'assets/images/image7.jpg',
        'assets/images/image8.jpg',
        'assets/images/image9.jpg',
        'assets/images/image10.jpg'
    ];
    const picks = pickRandom(images, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back"><img src="${item}" alt="card image"></div>
                </div>
            `).join('')}
        </div>
    `;
    
    const parser = new DOMParser().parseFromString(cards, 'text/html');
    selectors.board.replaceWith(parser.querySelector('.board'));
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    startBtn.classList.add("lock");
    startBtn.innerText = "Started";
    msg.style.display = "block";
    msgText.innerHTML = `Game has been Started`;

    setTimeout(() => {
        msg.style.display = "none";
    }, 1500);

    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerText = `${state.totalFlips} moves`;
        selectors.timer.innerText = `time: ${state.totalTime} sec`;
    }, 1000);
};

const flipBackCards = () => {
    const cardsToFlipBack = document.querySelectorAll('.card.flipped:not(.matched)');
    if (cardsToFlipBack.length > 0) {
        document.getElementById('noMatchSound').play();
    }
    cardsToFlipBack.forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

const flipCard = card => {
    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].querySelector('.card-back img').src === flippedCards[1].querySelector('.card-back img').src) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
            document.getElementById('matchSound').play();
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;
            startBtn.classList.remove("lock");
            startBtn.style.color = "white";
            startBtn.innerText = "Replay";
            startBtn.addEventListener("click", () => window.location.reload());
            clearInterval(state.loop);
        }, 1000);
    }
};

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent);
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            if (eventTarget.id === 'btn') {
                startGame();
            } else if (eventTarget.id === 'rulesBtn') {
                rulesPopup.style.display = 'block';
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        rulesPopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === rulesPopup) {
            rulesPopup.style.display = 'none';
        }
    });
};

generateGame();
attachEventListeners();
