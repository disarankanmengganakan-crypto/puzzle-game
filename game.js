const defs = [
  { name:'Crimson Blade', cost:1, power:3, rarity:'N', palette:['#ff8b6e','#b8283d'], sigil:'⚔' },
  { name:'Frost Oracle', cost:2, power:5, rarity:'R', palette:['#7fe0ff','#2b5dbe'], sigil:'❄' },
  { name:'Storm Dancer', cost:2, power:4, rarity:'N', palette:['#ffe88d','#8a60ff'], sigil:'⚡' },
  { name:'Abyss Choir', cost:3, power:7, rarity:'SR', palette:['#d8a9ff','#311450'], sigil:'☾' },
  { name:'Flora Pulse', cost:1, power:2, rarity:'N', palette:['#ffb4da','#874286'], sigil:'✿' },
];

const els = {
  status: document.getElementById('status'),
  log: document.getElementById('log'),
  gallery: document.getElementById('assetGallery'),
  regenBtn: document.getElementById('regenBtn'),
  startBtn: document.getElementById('startBtn'),
  drawBtn: document.getElementById('drawBtn'),
  endTurnBtn: document.getElementById('endTurnBtn'),
  scene: document.getElementById('scene'),
};

const state = { hp:24, enemyHp:34, mana:3, maxMana:3, turn:1, deck:[], hand:[], canDraw:true };
const generated = { cards:[], board:null, enemy:null };
let three = null, scene = null, camera = null, renderer = null, enemyMesh = null, boardMesh = null;
let raycaster = null, pointer = null, cardMeshes = [];

function noiseDots(ctx,w,h,n,hue){ for(let i=0;i<n;i++){ctx.fillStyle=`hsla(${hue+Math.random()*40},85%,${40+Math.random()*45}%,${0.05+Math.random()*0.11})`;ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h,Math.random()*24+3,0,Math.PI*2);ctx.fill();}}

function genCardCanvas(card){const c=document.createElement('canvas');c.width=420;c.height=620;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,c.height);g.addColorStop(0,card.palette[0]);g.addColorStop(1,card.palette[1]);x.fillStyle=g;x.fillRect(0,0,c.width,c.height);noiseDots(x,c.width,c.height,120,Math.random()*360);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(28,90,364,364);x.strokeStyle='rgba(255,255,255,.82)';x.lineWidth=8;x.strokeRect(14,14,392,592);x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=3;x.strokeRect(30,30,360,560);x.textAlign='left';x.fillStyle='#f7fbff';x.font='bold 36px sans-serif';x.fillText(card.name,34,68);x.textAlign='center';x.font='bold 180px sans-serif';x.fillText(card.sigil,210,352);x.textAlign='left';x.font='bold 30px sans-serif';x.fillText(`Cost ${card.cost}`,36,540);x.fillText(`Power ${card.power}`,220,540);x.font='bold 28px sans-serif';x.fillText(card.rarity,36,585);return c;}
function genBoardCanvas(){const c=document.createElement('canvas');c.width=1024;c.height=1024;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'#1b275d');g.addColorStop(1,'#0a1029');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);noiseDots(x,c.width,c.height,400,220);x.strokeStyle='rgba(141,167,255,.26)';for(let i=0;i<11;i++){x.beginPath();x.moveTo(80+i*86,95);x.lineTo(80+i*86,930);x.stroke();}x.strokeRect(70,90,884,840);return c;}
function genEnemyCanvas(){const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');const g=x.createRadialGradient(260,170,20,250,230,340);g.addColorStop(0,'#ffb2cd');g.addColorStop(1,'#41182f');x.fillStyle=g;x.fillRect(0,0,512,512);noiseDots(x,512,512,220,330);x.fillStyle='rgba(255,255,255,.72)';x.font='bold 220px serif';x.textAlign='center';x.fillText('☠',260,320);x.font='bold 56px sans-serif';x.fillText('BOSS',260,420);return c;}

function generateAssets(){
  generated.cards = defs.map(genCardCanvas);
  generated.board = genBoardCanvas();
  generated.enemy = genEnemyCanvas();
  renderGallery();
  els.log.textContent = 'アセットを生成しました。下のギャラリーで確認できます。';
}

function renderGallery(){
  els.gallery.innerHTML = '';
  const assets = [
    ...generated.cards.map((c,i)=>({name:`Card ${i+1}`,canvas:c})),
    {name:'Board Texture',canvas:generated.board},
    {name:'Enemy Portrait',canvas:generated.enemy},
  ];
  assets.forEach((a)=>{
    const box = document.createElement('div'); box.className='asset-card';
    const img = document.createElement('img'); img.src = a.canvas.toDataURL('image/png');
    const p = document.createElement('p'); p.textContent = a.name;
    box.append(img,p); els.gallery.appendChild(box);
  });
}

function updateStatus(msg=''){
  els.status.innerHTML = `ターン <b>${state.turn}</b> / HP <b>${state.hp}</b> / Enemy <b>${state.enemyHp}</b> / Mana <b>${state.mana}/${state.maxMana}</b> / Deck <b>${state.deck.length}</b> / Hand <b>${state.hand.length}</b>`;
  if(msg) els.log.textContent = msg;
}

function refillDeck(){ state.deck=[]; for(let i=0;i<25;i++) state.deck.push({...defs[(Math.random()*defs.length)|0]}); }

async function startGame(){
  if (!generated.board) generateAssets();
  els.log.textContent = 'Three.js を読み込み中...';
  try {
    three = await import('https://unpkg.com/three@0.162.0/build/three.module.js');
  } catch (e) {
    els.log.textContent = 'Three.js の読み込みに失敗しました。アセット確認は可能です。ネット接続を確認してください。';
    return;
  }
  initThree();
  resetGame();
  els.drawBtn.disabled = false; els.endTurnBtn.disabled = false;
  els.log.textContent = 'ゲーム開始。';
}

function initThree(){
  const T = three;
  scene = new T.Scene(); scene.background = new T.Color(0x070a18); scene.fog = new T.Fog(0x070a18,18,34);
  camera = new T.PerspectiveCamera(58, innerWidth/innerHeight, 0.1, 100); camera.position.set(0,5.3,10.5); camera.lookAt(0,0.6,0);
  renderer?.dispose?.();
  renderer = new T.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
  els.scene.innerHTML=''; els.scene.appendChild(renderer.domElement);
  scene.add(new T.AmbientLight(0x8a97d1, 0.75)); const dir = new T.DirectionalLight(0xe6eeff,1.2); dir.position.set(4,6,5); scene.add(dir);
  boardMesh = new T.Mesh(new T.PlaneGeometry(17,11), new T.MeshStandardMaterial({map:new T.CanvasTexture(generated.board),roughness:.86,metalness:.12}));
  boardMesh.rotation.x = -Math.PI/2; boardMesh.position.y = -1.4; scene.add(boardMesh);
  enemyMesh = new T.Mesh(new T.CylinderGeometry(1.2,1.4,2.2,30), new T.MeshStandardMaterial({map:new T.CanvasTexture(generated.enemy),roughness:.45,metalness:.2}));
  enemyMesh.position.set(0,-0.2,-3.6); scene.add(enemyMesh);
  raycaster = new T.Raycaster(); pointer = new T.Vector2(); cardMeshes = [];
  addEventListener('resize',()=>{ if(!camera||!renderer)return; camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight); });
  addEventListener('pointerdown',(e)=>{
    if(!raycaster||!camera) return;
    pointer.x=(e.clientX/innerWidth)*2-1; pointer.y=-(e.clientY/innerHeight)*2+1; raycaster.setFromCamera(pointer,camera);
    const hit = raycaster.intersectObjects(cardMeshes)[0]; if(hit) playCard(cardMeshes.indexOf(hit.object));
  });
  requestAnimationFrame(loop);
}

function renderHand3D(){
  if(!scene||!three) return;
  cardMeshes.forEach((m)=>{ scene.remove(m); m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); });
  cardMeshes=[];
  state.hand.forEach((card,i)=>{
    const canvas = genCardCanvas(card);
    const tex = new three.CanvasTexture(canvas);
    const mesh = new three.Mesh(new three.PlaneGeometry(2.3,3.3), new three.MeshStandardMaterial({map:tex,roughness:.75,metalness:.05}));
    mesh.position.set((i-(state.hand.length-1)/2)*2.55, -0.25, 3.85);
    scene.add(mesh); cardMeshes.push(mesh);
  });
}

function drawCard(){ if(!state.canDraw) return updateStatus('このターンはドロー済みです。'); if(state.hand.length>=6) return updateStatus('手札上限です。'); if(!state.deck.length) refillDeck(); state.hand.push(state.deck.pop()); state.canDraw=false; renderHand3D(); updateStatus('カードを1枚ドロー。'); }
function playCard(i){ const card=state.hand[i]; if(!card) return; if(card.cost>state.mana) return updateStatus('マナ不足。'); state.mana-=card.cost; state.enemyHp=Math.max(0,state.enemyHp-card.power); state.hand.splice(i,1); renderHand3D(); if(enemyMesh){ enemyMesh.scale.set(1.2,0.78,1.2); setTimeout(()=>enemyMesh.scale.set(1,1,1),110);} updateStatus(state.enemyHp===0?'勝利！敵を撃破しました。':`${card.name}で${card.power}ダメージ。`); }
function endTurn(){ if(state.enemyHp===0||state.hp===0) return; const dmg=2+((Math.random()*5)|0); state.hp=Math.max(0,state.hp-dmg); state.turn++; state.maxMana=Math.min(8,state.maxMana+1); state.mana=state.maxMana; state.canDraw=true; updateStatus(state.hp===0?`敗北… ${dmg}ダメージ。`:`敵の攻撃 ${dmg}ダメージ。`); }
function resetGame(){ Object.assign(state,{hp:24,enemyHp:34,mana:3,maxMana:3,turn:1,deck:[],hand:[],canDraw:true}); refillDeck(); for(let i=0;i<4;i++)state.hand.push(state.deck.pop()); renderHand3D(); updateStatus('アセットを使ってゲームを開始しました。'); }

function loop(t=0){ if(!scene||!camera||!renderer) return; if(enemyMesh) enemyMesh.rotation.y = Math.sin(t*0.0009)*0.24; cardMeshes.forEach((m,i)=>{ m.position.y=-0.25+Math.sin(t*0.0017+i)*0.06; m.rotation.y=Math.sin(t*0.001+i*0.7)*0.1;}); renderer.render(scene,camera); requestAnimationFrame(loop); }

els.regenBtn.addEventListener('click', generateAssets);
els.startBtn.addEventListener('click', startGame);
els.drawBtn.addEventListener('click', drawCard);
els.endTurnBtn.addEventListener('click', endTurn);

generateAssets();
updateStatus('まず生成アセットを確認してください。');
