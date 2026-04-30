import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

const CARD_W = 2.2;
const CARD_H = 3.2;

const app = {
  hp: 22,
  enemyHp: 30,
  mana: 3,
  maxMana: 3,
  turn: 1,
  deck: [],
  hand: [],
  board: [],
  canDraw: true,
};

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070b1f, 16, 30);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4.7, 10);
camera.lookAt(0, 0.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene').appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xdce8ff, 1.2);
light.position.set(3, 6, 5);
scene.add(light, new THREE.AmbientLight(0x7080c8, 0.75));

const boardGeo = new THREE.PlaneGeometry(16, 10);
const boardMat = new THREE.MeshStandardMaterial({ color: 0x0f1638, roughness: 0.7, metalness: 0.2 });
const board = new THREE.Mesh(boardGeo, boardMat);
board.rotation.x = -Math.PI / 2;
board.position.y = -1.4;
scene.add(board);

const enemy = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2, 1.35, 2.2, 24),
  new THREE.MeshStandardMaterial({ color: 0xb73858, emissive: 0x2b0814 })
);
enemy.position.set(0, -0.2, -3.2);
scene.add(enemy);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const cardMeshes = [];

function generateCardImage(card) {
  const c = document.createElement('canvas');
  c.width = 420; c.height = 620;
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, card.bg1);
  grad.addColorStop(1, card.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 55; i++) {
    ctx.fillStyle = `hsla(${card.hue + Math.random() * 25}, 90%, 70%, ${0.04 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * c.width, Math.random() * c.height, 8 + Math.random() * 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth = 7;
  ctx.strokeRect(14, 14, c.width - 28, c.height - 28);

  ctx.fillStyle = '#f7fbff';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(card.name, 32, 62);

  ctx.font = 'bold 150px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.icon, c.width / 2, 300);

  ctx.textAlign = 'left';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(`Cost: ${card.cost}`, 30, 545);
  ctx.fillText(`Power: ${card.power}`, 220, 545);

  return c;
}

function createCardMesh(card, i) {
  const tex = new THREE.CanvasTexture(generateCardImage(card));
  tex.anisotropy = 8;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W, CARD_H),
    new THREE.MeshStandardMaterial({ map: tex, metalness: 0.05, roughness: 0.75 })
  );
  mesh.userData.card = card;
  mesh.position.set((i - (app.hand.length - 1) / 2) * 2.5, -0.2, 3.7);
  scene.add(mesh);
  cardMeshes.push(mesh);
}

function clearHandMeshes() {
  while (cardMeshes.length) {
    const m = cardMeshes.pop();
    m.material.map.dispose();
    m.material.dispose();
    m.geometry.dispose();
    scene.remove(m);
  }
}

function cardPool() {
  return [
    { name: 'Flame Fox', icon: '🦊', cost: 1, power: 3, bg1: '#f2694f', bg2: '#7d1f27', hue: 12 },
    { name: 'Aqua Nymph', icon: '🧜', cost: 2, power: 5, bg1: '#63bff7', bg2: '#205ba3', hue: 205 },
    { name: 'Thunder Roc', icon: '🦅', cost: 2, power: 4, bg1: '#f0ce58', bg2: '#8e681d', hue: 45 },
    { name: 'Night Reaper', icon: '👻', cost: 3, power: 7, bg1: '#8f7aff', bg2: '#2e2363', hue: 265 },
    { name: 'Bloom Spirit', icon: '🌸', cost: 1, power: 2, bg1: '#ff9dd3', bg2: '#914b80', hue: 330 },
  ];
}

function refillDeck() {
  app.deck = [];
  for (let i = 0; i < 20; i++) app.deck.push({ ...cardPool()[Math.floor(Math.random() * 5)] });
}

function drawCard() {
  if (!app.canDraw) return log('今ターンはすでにドロー済みです。');
  if (app.hand.length >= 5) return log('手札上限です。');
  if (app.deck.length === 0) refillDeck();
  app.hand.push(app.deck.pop());
  app.canDraw = false;
  rebuildHand();
  renderStatus();
  log('カードを1枚引きました。');
}

function playCard(index) {
  const card = app.hand[index];
  if (!card) return;
  if (card.cost > app.mana) return log('マナ不足です。');
  app.mana -= card.cost;
  app.enemyHp = Math.max(0, app.enemyHp - card.power);
  app.hand.splice(index, 1);
  rebuildHand();
  pulseEnemy();
  if (app.enemyHp === 0) {
    log('勝利！ 敵を撃破しました。');
  } else {
    log(`${card.name} 発動！ ${card.power} ダメージ。`);
  }
  renderStatus();
}

function pulseEnemy() {
  enemy.scale.set(1.15, 0.85, 1.15);
  setTimeout(() => enemy.scale.set(1, 1, 1), 120);
}

function endTurn() {
  if (app.enemyHp === 0 || app.hp === 0) return;
  const dmg = 2 + Math.floor(Math.random() * 5);
  app.hp = Math.max(0, app.hp - dmg);
  app.turn += 1;
  app.maxMana = Math.min(7, app.maxMana + 1);
  app.mana = app.maxMana;
  app.canDraw = true;
  renderStatus();
  if (app.hp === 0) log(`敗北… ${dmg} ダメージを受けました。`);
  else log(`敵のターン: ${dmg} ダメージ。`);
}

function renderStatus() {
  document.getElementById('status').innerHTML =
    `ターン: <b>${app.turn}</b><br>あなたHP: <b>${app.hp}</b> / 敵HP: <b>${app.enemyHp}</b><br>マナ: <b>${app.mana}/${app.maxMana}</b><br>デッキ: <b>${app.deck.length}</b> / 手札: <b>${app.hand.length}</b>`;
}

function rebuildHand() {
  clearHandMeshes();
  app.hand.forEach((card, i) => createCardMesh(card, i));
}

function log(msg) {
  document.getElementById('log').textContent = msg;
}

function resetGame() {
  Object.assign(app, { hp: 22, enemyHp: 30, mana: 3, maxMana: 3, turn: 1, hand: [], canDraw: true });
  refillDeck();
  for (let i = 0; i < 3; i++) app.hand.push(app.deck.pop());
  rebuildHand();
  renderStatus();
  log('ゲーム開始。カードを使って敵を倒しましょう。');
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('pointerdown', (ev) => {
  const w = window.innerWidth, h = window.innerHeight;
  mouse.x = (ev.clientX / w) * 2 - 1;
  mouse.y = -(ev.clientY / h) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cardMeshes);
  if (hits.length > 0) {
    const mesh = hits[0].object;
    const idx = cardMeshes.indexOf(mesh);
    playCard(idx);
  }
});

document.getElementById('drawBtn').addEventListener('click', drawCard);
document.getElementById('endTurnBtn').addEventListener('click', endTurn);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function animate(t = 0) {
  enemy.rotation.y = Math.sin(t * 0.0008) * 0.18;
  cardMeshes.forEach((m, i) => {
    m.position.y = -0.2 + Math.sin(t * 0.0015 + i) * 0.05;
    m.rotation.y = Math.sin(t * 0.001 + i * 0.6) * 0.08;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resetGame();
animate();
