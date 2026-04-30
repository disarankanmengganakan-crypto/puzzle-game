const W = 18;
const H = 18;
const MAX_FLOOR = 30;
const enemyPool = [
  { name: 'ドラゴン娘', icon: '🐉', hp: 28, atk: 9 },
  { name: 'スライム娘', icon: '💧', hp: 18, atk: 6 },
  { name: 'ウルフ娘', icon: '🐺', hp: 22, atk: 8 },
  { name: 'スパイダー娘', icon: '🕷️', hp: 20, atk: 7 },
  { name: 'ゴースト娘', icon: '👻', hp: 16, atk: 10 },
  { name: 'サキュバス娘', icon: '🦇', hp: 24, atk: 9 }
];

const state = {
  floor: 1, turn: 1, gold: 0,
  player: { x: 1, y: 1, hp: 120, maxHp: 120, atk: 14, def: 8, sp: 48, maxSp: 48 },
  map: [], seen: new Set(), enemies: [], items: [], stairs: null,
  defending: false
};

const grid = document.getElementById('grid');
const minimap = document.getElementById('minimap');
const floorTitle = document.getElementById('floorTitle');
const turnEl = document.getElementById('turn');
const goldEl = document.getElementById('gold');
const exploreEl = document.getElementById('explore');
const dangerEl = document.getElementById('danger');
const statusEl = document.getElementById('playerStatus');
const partyList = document.getElementById('partyList');
const logEl = document.getElementById('log');

function rnd(n) { return Math.floor(Math.random() * n); }
function key(x, y) { return `${x},${y}`; }

function makeFloor() {
  state.map = Array.from({ length: H }, () => Array.from({ length: W }, () => '#'));
  state.seen.clear();

  let x = 1, y = 1;
  state.map[y][x] = '.';
  for (let i = 0; i < 550; i += 1) {
    const d = [[1,0],[-1,0],[0,1],[0,-1]][rnd(4)];
    x = Math.max(1, Math.min(W - 2, x + d[0]));
    y = Math.max(1, Math.min(H - 2, y + d[1]));
    state.map[y][x] = '.';
  }

  state.player.x = 1;
  state.player.y = 1;
  state.enemies = [];
  state.items = [];

  const enemiesCount = 4 + Math.floor(state.floor / 2);
  for (let i = 0; i < enemiesCount; i += 1) {
    const base = enemyPool[rnd(enemyPool.length)];
    const pos = randomFloorCell();
    state.enemies.push({
      ...base,
      hp: base.hp + state.floor * 2,
      atk: base.atk + Math.floor(state.floor / 3),
      x: pos.x,
      y: pos.y
    });
  }

  const itemCount = 3 + Math.floor(state.floor / 6);
  for (let i = 0; i < itemCount; i += 1) {
    const pos = randomFloorCell();
    state.items.push({ x: pos.x, y: pos.y, type: rnd(2) ? 'gold' : 'potion' });
  }
  state.stairs = randomFloorCell();
}

function randomFloorCell() {
  while (true) {
    const x = rnd(W), y = rnd(H);
    if (state.map[y][x] !== '.') continue;
    if (x === state.player.x && y === state.player.y) continue;
    if (state.enemies.some((e) => e.x === x && e.y === y)) continue;
    if (state.items.some((i) => i.x === x && i.y === y)) continue;
    return { x, y };
  }
}

function render() {
  grid.innerHTML = '';
  minimap.innerHTML = '';

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const visible = Math.abs(state.player.x - x) <= 4 && Math.abs(state.player.y - y) <= 4;
      if (visible) state.seen.add(key(x, y));
      const seen = state.seen.has(key(x, y));

      const cell = document.createElement('div');
      cell.className = `cell ${seen ? (state.map[y][x] === '#' ? 'wall' : 'floor') : 'unknown'}`;

      const mini = document.createElement('div');
      mini.className = `mini ${seen ? (state.map[y][x] === '#' ? 'wall' : 'floor') : ''}`;

      if (seen) {
        const enemy = state.enemies.find((e) => e.x === x && e.y === y);
        const item = state.items.find((i) => i.x === x && i.y === y);
        const stairs = state.stairs.x === x && state.stairs.y === y;

        if (state.player.x === x && state.player.y === y) {
          cell.textContent = '🟥'; cell.classList.add('player'); mini.classList.add('player');
        } else if (enemy) {
          cell.textContent = enemy.icon; cell.classList.add('enemy');
        } else if (item) {
          cell.textContent = item.type === 'gold' ? '🪙' : '🧪'; cell.classList.add('item');
        } else if (stairs) {
          cell.textContent = '⬇️'; cell.classList.add('stairs');
        }
      }

      grid.appendChild(cell);
      minimap.appendChild(mini);
    }
  }

  floorTitle.textContent = `地下 ${state.floor}階`;
  turnEl.textContent = state.turn;
  goldEl.textContent = state.gold;

  const seenCells = state.seen.size;
  const totalWalkable = state.map.flat().filter((c) => c === '.').length;
  exploreEl.textContent = `${Math.floor((seenCells / totalWalkable) * 100)}%`;

  const dangerRanks = ['E', 'D', 'C', 'B', 'A', 'S'];
  dangerEl.textContent = dangerRanks[Math.min(5, Math.floor((state.floor - 1) / 5))];

  statusEl.innerHTML = `
    <strong>ドラゴン娘 Lv.${10 + state.floor}</strong><br>
    HP ${state.player.hp}/${state.player.maxHp}<br>
    SP ${state.player.sp}/${state.player.maxSp}<br>
    攻撃 ${state.player.atk} / 防御 ${state.player.def}
  `;

  partyList.innerHTML = `
    <div class="member"><div class="name">ドラゴン娘 Lv.${10 + state.floor}</div><div class="bars">HP ${state.player.hp}/${state.player.maxHp} / SP ${state.player.sp}/${state.player.maxSp}</div></div>
    <div class="member"><div class="name">スライム娘 Lv.${9 + state.floor}</div><div class="bars">HP ${85 + state.floor * 2}/${85 + state.floor * 2}</div></div>
    <div class="member"><div class="name">ウルフ娘 Lv.${8 + state.floor}</div><div class="bars">HP ${90 + state.floor * 2}/${90 + state.floor * 2}</div></div>
  `;
}

function log(msg) { logEl.textContent = msg; }

function attackEnemy(enemy) {
  const dmg = Math.max(1, state.player.atk + rnd(6) - 2);
  enemy.hp -= dmg;
  log(`${enemy.name}に${dmg}ダメージ！`);
  if (enemy.hp <= 0) {
    state.gold += 20 + rnd(20) + state.floor;
    state.enemies = state.enemies.filter((e) => e !== enemy);
    log(`${enemy.name}を倒した！`);
  }
}

function enemyTurn() {
  state.enemies.forEach((enemy) => {
    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist === 1) {
      const reduced = state.defending ? Math.floor(state.player.def * 1.5) : state.player.def;
      const dmg = Math.max(1, enemy.atk - Math.floor(reduced / 3) + rnd(4));
      state.player.hp -= dmg;
      log(`${enemy.name}の攻撃！ ${dmg}ダメージ受けた。`);
      return;
    }

    if (dist <= 6) {
      const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      tryMoveEnemy(enemy, enemy.x + stepX, enemy.y + stepY);
    }
  });

  state.defending = false;
  if (state.player.hp <= 0) {
    alert(`地下${state.floor}階で力尽きた…`);
    restart();
  }
}

function tryMoveEnemy(enemy, nx, ny) {
  if (state.map[ny]?.[nx] !== '.') return;
  if (state.enemies.some((e) => e !== enemy && e.x === nx && e.y === ny)) return;
  if (state.player.x === nx && state.player.y === ny) return;
  enemy.x = nx; enemy.y = ny;
}

function handlePlayerAction(dx, dy) {
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (state.map[ny]?.[nx] !== '.') return;

  const enemy = state.enemies.find((e) => e.x === nx && e.y === ny);
  if (enemy) {
    attackEnemy(enemy);
  } else {
    state.player.x = nx;
    state.player.y = ny;

    const item = state.items.find((i) => i.x === nx && i.y === ny);
    if (item) {
      if (item.type === 'gold') {
        const g = 30 + rnd(30);
        state.gold += g;
        log(`${g}G を拾った。`);
      } else {
        const heal = 24 + rnd(12);
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
        log(`回復薬でHPが${heal}回復。`);
      }
      state.items = state.items.filter((i) => i !== item);
    }

    if (state.stairs.x === nx && state.stairs.y === ny) {
      if (state.floor >= MAX_FLOOR) {
        alert('30F制覇！モンスター娘パーティの勝利！');
        restart();
        return;
      }
      state.floor += 1;
      state.turn += 1;
      makeFloor();
      log(`地下${state.floor}階に到達！`);
      render();
      return;
    }
  }

  state.turn += 1;
  enemyTurn();
  render();
}

function waitTurn() {
  state.turn += 1;
  log('様子をうかがった。');
  enemyTurn();
  render();
}

function restart() {
  state.floor = 1;
  state.turn = 1;
  state.gold = 0;
  state.player.hp = state.player.maxHp;
  state.player.sp = state.player.maxSp;
  makeFloor();
  render();
}

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'w' || e.key === 'ArrowUp') handlePlayerAction(0, -1);
  if (k === 's' || e.key === 'ArrowDown') handlePlayerAction(0, 1);
  if (k === 'a' || e.key === 'ArrowLeft') handlePlayerAction(-1, 0);
  if (k === 'd' || e.key === 'ArrowRight') handlePlayerAction(1, 0);
  if (e.code === 'Space') waitTurn();
});

document.getElementById('endTurn').addEventListener('click', waitTurn);
document.getElementById('skillFlame').addEventListener('click', () => {
  const targets = state.enemies.filter((e) => Math.abs(e.x - state.player.x) + Math.abs(e.y - state.player.y) <= 2);
  if (!targets.length || state.player.sp < 8) return log('SP不足、または対象なし。');
  state.player.sp -= 8;
  targets.forEach((t) => t.hp -= 14 + rnd(8));
  state.enemies = state.enemies.filter((e) => e.hp > 0);
  log('ブレイズ！周囲の敵を焼き払った。');
  waitTurn();
});
document.getElementById('skillGuard').addEventListener('click', () => { state.defending = true; log('防御態勢を取った。'); waitTurn(); });
document.getElementById('skillScan').addEventListener('click', () => {
  if (state.player.sp < 4) return log('SP不足。');
  state.player.sp -= 4;
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) if (Math.abs(x - state.player.x) <= 7 && Math.abs(y - state.player.y) <= 7) state.seen.add(key(x, y));
  log('索敵した。周辺地形を把握！');
  render();
});

makeFloor();
render();
