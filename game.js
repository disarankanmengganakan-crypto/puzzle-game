import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

const state = {
  playerHp: 28,
  enemyHp: 34,
  mana: 3,
  maxMana: 3,
  turn: 1,
  canDraw: true,
  deck: [],
  hand: [],
};

const defs = [
  { id:'crimson', name:'Crimson Blade', cost:1, power:3, rarity:'N', palette:['#ff8b6e','#b8283d'], sigil:'⚔' },
  { id:'frost', name:'Frost Oracle', cost:2, power:5, rarity:'R', palette:['#7fe0ff','#2b5dbe'], sigil:'❄' },
  { id:'storm', name:'Storm Dancer', cost:2, power:4, rarity:'N', palette:['#ffe88d','#8a60ff'], sigil:'⚡' },
  { id:'abyss', name:'Abyss Choir', cost:3, power:7, rarity:'SR', palette:['#d8a9ff','#311450'], sigil:'☾' },
  { id:'flora', name:'Flora Pulse', cost:1, power:2, rarity:'N', palette:['#ffb4da','#874286'], sigil:'✿' },
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070a18);
scene.fog = new THREE.Fog(0x070a18, 18, 34);
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 5.3, 10.5);
camera.lookAt(0, 0.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById('scene').appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x8a97d1, 0.75));
const dir = new THREE.DirectionalLight(0xe6eeff, 1.2);
dir.position.set(4, 6, 5);
scene.add(dir);

let ground;
const enemy = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.2, 30), new THREE.MeshStandardMaterial({color:0xb73f56}));
enemy.position.set(0, -0.2, -3.6);
scene.add(enemy);

const cardMeshes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const assetPreview = document.createElement('div');
assetPreview.className = 'asset-preview';
document.querySelector('.hud').appendChild(assetPreview);

function noiseDots(ctx, w, h, n, hue) {
  for (let i=0;i<n;i++) {
    ctx.fillStyle = `hsla(${hue + Math.random()*40},85%,${40+Math.random()*45}%,${0.04+Math.random()*0.12})`;
    ctx.beginPath();
    ctx.arc(Math.random()*w, Math.random()*h, Math.random()*24+3, 0, Math.PI*2);
    ctx.fill();
  }
}

function genBoardTexture() {
  const c = document.createElement('canvas'); c.width=1024; c.height=1024;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0,0,0,c.height);
  g.addColorStop(0,'#1b275d'); g.addColorStop(1,'#0a1029');
  x.fillStyle=g; x.fillRect(0,0,c.width,c.height);
  noiseDots(x,c.width,c.height,400,220);
  x.strokeStyle='rgba(141,167,255,.26)';
  for (let i=0;i<11;i++) { x.beginPath(); x.moveTo(80+i*86,95); x.lineTo(80+i*86,930); x.stroke(); }
  x.strokeRect(70,90,884,840);
  return c;
}

function genCardCanvas(card) {
  const c = document.createElement('canvas'); c.width=420; c.height=620;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0,0,0,c.height);
  g.addColorStop(0, card.palette[0]); g.addColorStop(1, card.palette[1]);
  x.fillStyle = g; x.fillRect(0,0,c.width,c.height);
  noiseDots(x, c.width, c.height, 120, Math.random()*360);

  x.fillStyle='rgba(255,255,255,.18)';
  x.fillRect(28,90,364,364);
  x.strokeStyle='rgba(255,255,255,.82)'; x.lineWidth=8; x.strokeRect(14,14,392,592);
  x.strokeStyle='rgba(255,255,255,.45)'; x.lineWidth=3; x.strokeRect(30,30,360,560);

  x.textAlign='left'; x.fillStyle='#f7fbff'; x.font='bold 36px sans-serif'; x.fillText(card.name,34,68);
  x.textAlign='center'; x.font='bold 180px sans-serif'; x.fillText(card.sigil,210,352);
  x.textAlign='left'; x.font='bold 30px sans-serif'; x.fillText(`Cost ${card.cost}`,36,540); x.fillText(`Power ${card.power}`,220,540);
  x.fillStyle='rgba(255,255,255,.88)'; x.font='bold 28px sans-serif'; x.fillText(card.rarity,36,585);
  return c;
}

function genEnemyPortrait() {
  const c = document.createElement('canvas'); c.width=512; c.height=512;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(260,170,20,250,230,340);
  g.addColorStop(0,'#ffb2cd'); g.addColorStop(1,'#41182f');
  x.fillStyle=g; x.fillRect(0,0,512,512);
  noiseDots(x,512,512,220,330);
  x.fillStyle='rgba(255,255,255,.7)';
  x.font='bold 220px serif'; x.textAlign='center'; x.fillText('☠',260,320);
  x.font='bold 56px sans-serif'; x.fillText('BOSS',260,420);
  return c;
}

function rebuildAssetsPanel(canvases) {
  assetPreview.innerHTML = '<h3>生成アセット</h3>';
  canvases.forEach((c) => {
    const img = document.createElement('img');
    img.src = c.toDataURL('image/png');
    assetPreview.appendChild(img);
  });
}

function buildArena() {
  if (ground) scene.remove(ground);
  const tex = new THREE.CanvasTexture(genBoardTexture());
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1,1);
  ground = new THREE.Mesh(new THREE.PlaneGeometry(17, 11), new THREE.MeshStandardMaterial({map:tex,roughness:.86,metalness:.12}));
  ground.rotation.x = -Math.PI/2;
  ground.position.y = -1.4;
  scene.add(ground);

  const enemyTex = new THREE.CanvasTexture(genEnemyPortrait());
  enemy.material = new THREE.MeshStandardMaterial({ map: enemyTex, roughness:.45, metalness:.2 });
}

function refillDeck(){
  state.deck = [];
  for (let i=0;i<22;i++) state.deck.push({ ...defs[(Math.random()*defs.length)|0] });
}

function clearHandMeshes() {
  while (cardMeshes.length) {
    const m = cardMeshes.pop();
    m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); scene.remove(m);
  }
}

function renderHand() {
  clearHandMeshes();
  const generatedCanvases = [];
  state.hand.forEach((card, i) => {
    const canvas = genCardCanvas(card);
    generatedCanvases.push(canvas);
    const tex = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.3,3.3), new THREE.MeshStandardMaterial({map:tex,roughness:.75,metalness:.05}));
    mesh.position.set((i-(state.hand.length-1)/2)*2.55, -0.25, 3.85);
    mesh.userData.index = i;
    scene.add(mesh);
    cardMeshes.push(mesh);
  });
  rebuildAssetsPanel(generatedCanvases.slice(0,3));
}

function updateHud(msg='') {
  document.getElementById('status').innerHTML =
    `ターン <b>${state.turn}</b><br>HP <b>${state.playerHp}</b> / Enemy <b>${state.enemyHp}</b><br>Mana <b>${state.mana}/${state.maxMana}</b><br>Deck <b>${state.deck.length}</b> | Hand <b>${state.hand.length}</b>`;
  if (msg) document.getElementById('log').textContent = msg;
}

function drawCard(){
  if(!state.canDraw) return updateHud('このターンはドロー済みです。');
  if(state.hand.length>=6) return updateHud('手札上限です。');
  if(!state.deck.length) refillDeck();
  state.hand.push(state.deck.pop());
  state.canDraw=false;
  renderHand();
  updateHud('カードを1枚ドロー。');
}

function playCard(i){
  const card = state.hand[i];
  if(!card) return;
  if(card.cost>state.mana) return updateHud('マナ不足。');
  state.mana -= card.cost;
  state.enemyHp = Math.max(0, state.enemyHp-card.power);
  state.hand.splice(i,1);
  renderHand();
  enemy.scale.set(1.2,0.78,1.2); setTimeout(()=>enemy.scale.set(1,1,1),110);
  updateHud(state.enemyHp===0 ? '勝利！敵を撃破しました。' : `${card.name}で${card.power}ダメージ。`);
}

function endTurn(){
  if(state.enemyHp===0||state.playerHp===0) return;
  const dmg = 2 + ((Math.random()*5)|0);
  state.playerHp = Math.max(0, state.playerHp-dmg);
  state.turn++; state.maxMana=Math.min(8,state.maxMana+1); state.mana=state.maxMana; state.canDraw=true;
  updateHud(state.playerHp===0?`敗北… ${dmg}ダメージ。`:`敵の攻撃 ${dmg}ダメージ。`);
}

function reset(){
  Object.assign(state,{playerHp:28,enemyHp:34,mana:3,maxMana:3,turn:1,canDraw:true,deck:[],hand:[]});
  refillDeck();
  for(let i=0;i<4;i++) state.hand.push(state.deck.pop());
  buildArena();
  renderHand();
  updateHud('生成アセットでゲームを開始。');
}

addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
addEventListener('pointerdown',(e)=>{
  pointer.x=(e.clientX/innerWidth)*2-1; pointer.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(cardMeshes)[0];
  if(hit) playCard(cardMeshes.indexOf(hit.object));
});

document.getElementById('drawBtn').addEventListener('click',drawCard);
document.getElementById('endTurnBtn').addEventListener('click',endTurn);
document.getElementById('resetBtn').addEventListener('click',reset);

function loop(t=0){
  enemy.rotation.y = Math.sin(t*0.0009)*0.24;
  cardMeshes.forEach((m,i)=>{ m.position.y=-0.25+Math.sin(t*0.0017+i)*0.06; m.rotation.y=Math.sin(t*0.001+i*0.7)*0.1;});
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}

reset();
loop();
