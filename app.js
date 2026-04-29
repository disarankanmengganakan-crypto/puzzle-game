const SIZE = 4;
const TOTAL = SIZE * SIZE;
let board = [];
let moves = 0;
let startTime = null;
let timerId = null;

const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const hintEl = document.getElementById('hint');
const winDialog = document.getElementById('winDialog');
const resultText = document.getElementById('resultText');

function init() {
  resetBoard();
  render();
  startTimer();
}

function resetBoard() {
  board = Array.from({ length: TOTAL }, (_, i) => (i + 1) % TOTAL);
  moves = 0;
  movesEl.textContent = moves;
  shuffle(300);
}

function shuffle(steps = 200) {
  let empty = board.indexOf(0);
  for (let i = 0; i < steps; i++) {
    const candidates = neighbors(empty);
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    [board[empty], board[selected]] = [board[selected], board[empty]];
    empty = selected;
  }
  moves = 0;
  movesEl.textContent = moves;
  startTimer();
  render();
}

function neighbors(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const result = [];
  if (row > 0) result.push(index - SIZE);
  if (row < SIZE - 1) result.push(index + SIZE);
  if (col > 0) result.push(index - 1);
  if (col < SIZE - 1) result.push(index + 1);
  return result;
}

function render() {
  const empty = board.indexOf(0);
  const movable = new Set(neighbors(empty));
  boardEl.innerHTML = '';

  board.forEach((value, i) => {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.type = 'button';

    if (value === 0) {
      tile.classList.add('empty');
      tile.disabled = true;
      tile.ariaLabel = '空きマス';
    } else {
      tile.textContent = value;
      tile.ariaLabel = `${value} 番タイル`;
      if (movable.has(i)) tile.classList.add('movable');
      tile.addEventListener('click', () => tryMove(i));
    }
    boardEl.appendChild(tile);
  });
}

function tryMove(index) {
  const empty = board.indexOf(0);
  if (!neighbors(empty).includes(index)) {
    hintEl.textContent = 'そのタイルは動かせません。光っているタイルを選びましょう。';
    return;
  }

  [board[index], board[empty]] = [board[empty], board[index]];
  moves += 1;
  movesEl.textContent = moves;
  hintEl.textContent = 'いい感じ！';
  render();

  if (isSolved()) {
    clearInterval(timerId);
    const time = timerEl.textContent;
    resultText.textContent = `手数 ${moves} / 時間 ${time}`;
    winDialog.showModal();
  }
}

function isSolved() {
  return board.every((v, i) => v === ((i + 1) % TOTAL));
}

function startTimer() {
  clearInterval(timerId);
  startTime = Date.now();
  timerEl.textContent = '00:00';
  timerId = setInterval(() => {
    const sec = Math.floor((Date.now() - startTime) / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    timerEl.textContent = `${mm}:${ss}`;
  }, 1000);
}

document.getElementById('shuffleBtn').addEventListener('click', () => shuffle(300));
document.getElementById('hintBtn').addEventListener('click', () => {
  const empty = board.indexOf(0);
  const options = neighbors(empty).map(i => board[i]).filter(Boolean);
  hintEl.textContent = `ヒント: [${options.join(', ')}] のどれかを動かせます。`;
});
document.getElementById('closeDialog').addEventListener('click', () => {
  winDialog.close();
  shuffle(300);
});

init();
