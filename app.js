const ROWS = 6;
const COLS = 7;
const TYPES = ['fire', 'water', 'leaf', 'light', 'dark', 'heart'];
const boardEl = document.getElementById('board');
const damageBurst = document.getElementById('damageBurst');
const comboLabel = document.getElementById('comboLabel');
const bossHpFill = document.getElementById('bossHpFill');
const bossHpText = document.getElementById('bossHpText');
const turnsEl = document.getElementById('turns');

let board = [];
let selected = null;
let turns = 12;
let bossHp = 1256780;
const bossMaxHp = 2500000;

function randType() { return TYPES[Math.floor(Math.random() * TYPES.length)]; }
function buildBoard() {
  board = Array.from({ length: ROWS * COLS }, () => randType());
  draw();
}

function draw() {
  boardEl.innerHTML = '';
  board.forEach((type, idx) => {
    const orb = document.createElement('button');
    orb.className = `orb ${type}`;
    if (idx === selected) orb.classList.add('selected');
    orb.addEventListener('click', () => selectOrb(idx));
    boardEl.appendChild(orb);
  });
}

function adjacent(a, b) {
  const ar = Math.floor(a / COLS), ac = a % COLS;
  const br = Math.floor(b / COLS), bc = b % COLS;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

function selectOrb(idx) {
  if (selected === null) { selected = idx; draw(); return; }
  if (selected === idx) { selected = null; draw(); return; }
  if (!adjacent(selected, idx)) { selected = idx; draw(); return; }

  [board[selected], board[idx]] = [board[idx], board[selected]];
  selected = null;
  draw();
  resolveTurn();
}

function resolveTurn() {
  turns = Math.max(0, turns - 1);
  turnsEl.textContent = String(turns);
  const combo = 3 + Math.floor(Math.random() * 5);
  const damage = 68000 + Math.floor(Math.random() * 90000);
  bossHp = Math.max(0, bossHp - damage);

  comboLabel.innerHTML = `${combo} COMBO!<br><span>攻撃力 +${100 + combo * 5}%</span>`;
  damageBurst.innerHTML = `超強力!<br><strong>${damage.toLocaleString()}</strong>`;
  comboLabel.classList.add('show');
  damageBurst.classList.add('show');

  const pct = (bossHp / bossMaxHp) * 100;
  bossHpFill.style.width = `${pct}%`;
  bossHpText.textContent = `${bossHp.toLocaleString()} / ${bossMaxHp.toLocaleString()}`;

  setTimeout(() => {
    comboLabel.classList.remove('show');
    damageBurst.classList.remove('show');
  }, 900);

  if (turns === 0 || bossHp === 0) {
    setTimeout(() => {
      alert(bossHp === 0 ? '勝利！魔王を撃破！' : 'ターン終了！再挑戦しよう');
      resetGame();
    }, 300);
  }
}

function resetGame() {
  turns = 12;
  bossHp = 1256780;
  turnsEl.textContent = String(turns);
  bossHpFill.style.width = `${(bossHp / bossMaxHp) * 100}%`;
  bossHpText.textContent = `${bossHp.toLocaleString()} / ${bossMaxHp.toLocaleString()}`;
  buildBoard();
}

document.getElementById('shuffleBtn').addEventListener('click', buildBoard);
document.getElementById('autoBtn').addEventListener('click', () => alert('オート機能は演出のみです。'));
document.getElementById('speedBtn').addEventListener('click', () => alert('×2 スピード演出！'));

buildBoard();
