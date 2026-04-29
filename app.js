const types = [
  { key: "fire", icon: "🔥" },
  { key: "water", icon: "💧" },
  { key: "leaf", icon: "🍃" },
  { key: "star", icon: "✶" },
  { key: "dark", icon: "🌙" },
  { key: "heart", icon: "💗" },
];

const size = 7;
let board = [];
let selected = null;

const boardEl = document.getElementById("board");
const comboEl = document.getElementById("comboCount");
const damageEl = document.getElementById("damage");
const bonusEl = document.getElementById("bonus");
const enemyHp = document.getElementById("enemyHp");
const enemyHpText = document.getElementById("enemyHpText");

function randType() { return types[Math.floor(Math.random() * types.length)]; }

function makeArtPrompts() {
  const hero = "https://image.pollinations.ai/prompt/anime%20idol%20mage%20girl%20pink%20dress%20high%20detail%20fantasy%20rpg%20portrait";
  const enemy = "https://image.pollinations.ai/prompt/anime%20dark%20witch%20purple%20armor%20magic%20staff%20high%20detail%20fantasy%20rpg%20portrait";
  document.getElementById("heroArt").src = hero;
  document.getElementById("enemyArt").src = enemy;
}

function initBoard() {
  board = Array.from({ length: size * size }, () => randType().key);
  render();
}

function render() {
  boardEl.innerHTML = "";
  board.forEach((type, idx) => {
    const el = document.createElement("button");
    el.className = `tile ${type}`;
    el.textContent = types.find((t) => t.key === type).icon;
    if (selected === idx) el.classList.add("selected");
    el.onclick = () => onClickTile(idx);
    boardEl.appendChild(el);
  });
}

function neighbor(a, b) {
  const ax = a % size, ay = Math.floor(a / size);
  const bx = b % size, by = Math.floor(b / size);
  return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
}

function onClickTile(idx) {
  if (selected == null) { selected = idx; render(); return; }
  if (!neighbor(selected, idx)) { selected = idx; render(); return; }
  const a = selected;
  [board[a], board[idx]] = [board[idx], board[a]];
  selected = null;
  const combo = clearMatches();
  if (combo === 0) [board[a], board[idx]] = [board[idx], board[a]];
  render();
}

function clearMatches() {
  const kill = new Set();
  let combo = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 2; x++) {
      const i = y * size + x;
      const t = board[i];
      if (t && board[i + 1] === t && board[i + 2] === t) {
        kill.add(i); kill.add(i + 1); kill.add(i + 2); combo++;
      }
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size - 2; y++) {
      const i = y * size + x;
      const t = board[i];
      if (t && board[i + size] === t && board[i + 2 * size] === t) {
        kill.add(i); kill.add(i + size); kill.add(i + 2 * size); combo++;
      }
    }
  }

  if (!kill.size) return 0;

  kill.forEach((i) => board[i] = null);
  for (let x = 0; x < size; x++) {
    const col = [];
    for (let y = size - 1; y >= 0; y--) {
      const i = y * size + x;
      if (board[i]) col.push(board[i]);
    }
    for (let y = size - 1; y >= 0; y--) {
      const i = y * size + x;
      board[i] = col[size - 1 - y] ?? randType().key;
    }
  }

  const dmg = Math.floor(kill.size * 240 * (1 + combo * 0.1));
  enemyHp.value = Math.max(0, enemyHp.value - dmg);
  enemyHpText.textContent = `${enemyHp.value.toLocaleString()} / ${Number(enemyHp.max).toLocaleString()}`;
  comboEl.textContent = String(combo).padStart(2, "0");
  damageEl.textContent = dmg.toLocaleString();
  bonusEl.textContent = `x${(1 + combo * 0.1).toFixed(2)}`;

  return combo;
}

makeArtPrompts();
initBoard();
