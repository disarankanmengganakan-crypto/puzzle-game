const tile = 32;
const w = 25;
const h = 20;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const names = ['ドラゴン娘', 'スライム娘', 'ウルフ娘', 'スパイダー娘', 'ゴースト娘', 'サキュバス娘'];
const colors = ['#f95f5f', '#59b8ff', '#cccccc', '#9747ff', '#9ad0ff', '#ff69b4'];

const state = {
  floor: 1,
  maxFloor: 30,
  turn: 0,
  gold: 0,
  hp: 100,
  maxHp: 100,
  atk: 12,
  map: [],
  player: {x:1,y:1},
  stairs: {x:1,y:1},
  enemies: [],
};

function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

function makeFloor() {
  state.map = Array.from({length:h},()=>Array.from({length:w},()=>1));
  const rooms = [];
  const roomCount = rand(6, 10);
  for (let i=0; i<roomCount; i++) {
    const rw = rand(4,7), rh = rand(4,6);
    const rx = rand(1,w-rw-2), ry = rand(1,h-rh-2);
    rooms.push({x:rx,y:ry,w:rw,h:rh,cx:Math.floor(rx+rw/2),cy:Math.floor(ry+rh/2)});
    for (let y=ry; y<ry+rh; y++) for (let x=rx; x<rx+rw; x++) state.map[y][x]=0;
  }
  for (let i=1; i<rooms.length; i++) {
    const a=rooms[i-1], b=rooms[i];
    for (let x=Math.min(a.cx,b.cx); x<=Math.max(a.cx,b.cx); x++) state.map[a.cy][x]=0;
    for (let y=Math.min(a.cy,b.cy); y<=Math.max(a.cy,b.cy); y++) state.map[y][b.cx]=0;
  }
  const first = rooms[0], last = rooms[rooms.length-1];
  state.player = {x:first.cx, y:first.cy};
  state.stairs = {x:last.cx, y:last.cy};
  spawnEnemies();
  log(`地下 ${state.floor} 階に到着！`);
}

function spawnEnemies() {
  state.enemies = [];
  const n = rand(4, 6) + Math.floor(state.floor/5);
  for (let i=0; i<n; i++) {
    let x,y;
    do { x=rand(1,w-2); y=rand(1,h-2); }
    while(state.map[y][x]===1 || (x===state.player.x&&y===state.player.y));
    state.enemies.push({x,y,hp: 10+state.floor*2,name:names[rand(0,names.length-1)],color:colors[rand(0,colors.length-1)]});
  }
}

function passable(x,y){ return x>=0&&y>=0&&x<w&&y<h&&state.map[y][x]===0; }

function enemyAt(x,y){ return state.enemies.find(e=>e.x===x&&e.y===y); }

function step(dx,dy){
  const nx = state.player.x+dx, ny=state.player.y+dy;
  if(!passable(nx,ny)) return;
  const e = enemyAt(nx,ny);
  if (e) {
    e.hp -= state.atk;
    log(`${e.name}に${state.atk}ダメージ！`);
    if (e.hp<=0) {
      state.enemies = state.enemies.filter(v=>v!==e);
      state.gold += rand(8,24);
      log(`${e.name}を撃破！`);
    }
  } else {
    state.player.x=nx; state.player.y=ny;
  }
  endTurn();
}

function enemyTurn(){
  for (const e of state.enemies) {
    const dx = Math.sign(state.player.x - e.x);
    const dy = Math.sign(state.player.y - e.y);
    const tx = e.x + dx, ty = e.y + dy;
    if (Math.abs(state.player.x-e.x)+Math.abs(state.player.y-e.y)===1) {
      const dmg = rand(3, 7) + Math.floor(state.floor/4);
      state.hp -= dmg;
      log(`${e.name}の攻撃！ ${dmg}ダメージ`);
      if (state.hp<=0) {
        alert(`ゲームオーバー: 地下${state.floor}階 / ターン${state.turn}`);
        Object.assign(state,{floor:1,turn:0,gold:0,hp:100,maxHp:100,atk:12});
        makeFloor();
        return;
      }
    } else if (passable(tx,ty) && !enemyAt(tx,ty) && !(tx===state.player.x&&ty===state.player.y)) {
      e.x=tx; e.y=ty;
    }
  }
}

function endTurn(){
  state.turn++;
  if (state.player.x===state.stairs.x && state.player.y===state.stairs.y) {
    if (state.floor>=state.maxFloor) {
      alert(`地下30階制覇！ ターン:${state.turn} ゴールド:${state.gold}`);
      Object.assign(state,{floor:1,turn:0,gold:0,hp:100,maxHp:100,atk:12});
    } else {
      state.floor++;
      state.hp = Math.min(state.maxHp, state.hp + 8);
    }
    makeFloor();
    return;
  }
  enemyTurn();
  render();
  updateUI();
}

function drawTile(x,y,c){ ctx.fillStyle=c; ctx.fillRect(x*tile,y*tile,tile,tile); }
function render(){
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) drawTile(x,y,state.map[y][x]?'#24253a':'#3a3f5a');
  drawTile(state.stairs.x, state.stairs.y, '#d4b449');
  for (const e of state.enemies) {
    ctx.fillStyle=e.color; ctx.beginPath(); ctx.arc(e.x*tile+16,e.y*tile+16,10,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#6eff6e'; ctx.fillRect(state.player.x*tile+6,state.player.y*tile+6,20,20);
}

function updateUI(){
  document.getElementById('floorLabel').textContent = `地下 ${state.floor} 階`;
  document.getElementById('meta').innerHTML = `ターン: ${state.turn}<br>HP: ${state.hp}/${state.maxHp}<br>G: ${state.gold}<br>残敵: ${state.enemies.length}`;
  document.getElementById('partyStats').innerHTML = `<div class="row"><b>主人公</b><span>Lv ${Math.ceil(state.floor/2)}</span></div><div class="row"><span>HP</span><span>${state.hp}/${state.maxHp}</span></div><div class="row"><span>攻撃</span><span>${state.atk}</span></div>`;
  document.getElementById('dex').innerHTML = names.map((n,i)=>`<li style="color:${colors[i]}">${n}</li>`).join('');
}

function log(text){ document.getElementById('log').textContent = text; }

window.addEventListener('keydown',(e)=>{
  const k=e.key.toLowerCase();
  if(k==='arrowup'||k==='w') step(0,-1);
  if(k==='arrowdown'||k==='s') step(0,1);
  if(k==='arrowleft'||k==='a') step(-1,0);
  if(k==='arrowright'||k==='d') step(1,0);
  if(k===' ') endTurn();
});

makeFloor(); render(); updateUI();
