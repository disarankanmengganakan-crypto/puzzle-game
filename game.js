const tile=32,w=25,h=20;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const portrait=document.getElementById('portrait'),pctx=portrait.getContext('2d');

const monsters=[
{name:'ドラゴン娘',body:'#e45858',hair:'#ff9160',eye:'#ffd56a',horn:1,ear:0,wing:1,tail:1},
{name:'スライム娘',body:'#58a9ff',hair:'#9ad1ff',eye:'#ecf8ff',horn:0,ear:0,wing:0,tail:0},
{name:'ウルフ娘',body:'#9b8ca8',hair:'#d7d0dd',eye:'#ffe7a8',horn:0,ear:1,wing:0,tail:1},
{name:'スパイダー娘',body:'#6b4aa6',hair:'#b08cff',eye:'#ff9de7',horn:0,ear:0,wing:0,tail:0},
{name:'ゴースト娘',body:'#9fd3ff',hair:'#eef6ff',eye:'#b5f8ff',horn:0,ear:0,wing:0,tail:0},
{name:'サキュバス娘',body:'#cc4f9f',hair:'#ff9fda',eye:'#ffd2ef',horn:1,ear:0,wing:1,tail:1},
];

const state={floor:1,maxFloor:30,turn:0,gold:0,hp:100,maxHp:100,atk:12,map:[],player:{x:1,y:1},stairs:{x:1,y:1},enemies:[],flash:0,lastHit:null};
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const passable=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&state.map[y][x]===0;
const enemyAt=(x,y)=>state.enemies.find(e=>e.x===x&&e.y===y);

function makeFloor(){state.map=Array.from({length:h},()=>Array.from({length:w},()=>1));let rooms=[];for(let i=0;i<rand(6,10);i++){let rw=rand(4,7),rh=rand(4,6),rx=rand(1,w-rw-2),ry=rand(1,h-rh-2);rooms.push({x:rx,y:ry,w:rw,h:rh,cx:Math.floor(rx+rw/2),cy:Math.floor(ry+rh/2)});for(let y=ry;y<ry+rh;y++)for(let x=rx;x<rx+rw;x++)state.map[y][x]=0;}for(let i=1;i<rooms.length;i++){let a=rooms[i-1],b=rooms[i];for(let x=Math.min(a.cx,b.cx);x<=Math.max(a.cx,b.cx);x++)state.map[a.cy][x]=0;for(let y=Math.min(a.cy,b.cy);y<=Math.max(a.cy,b.cy);y++)state.map[y][b.cx]=0;}state.player={x:rooms[0].cx,y:rooms[0].cy};state.stairs={x:rooms.at(-1).cx,y:rooms.at(-1).cy};spawnEnemies();log(`地下 ${state.floor} 階に到着！`)}
function spawnEnemies(){state.enemies=[];for(let i=0;i<rand(4,6)+Math.floor(state.floor/5);i++){let x,y;do{x=rand(1,w-2);y=rand(1,h-2)}while(state.map[y][x]===1||(x===state.player.x&&y===state.player.y));state.enemies.push({x,y,hp:10+state.floor*2,kind:monsters[rand(0,monsters.length-1)],hurt:0,idle:Math.random()*10});}}

function drawParts(cx,cy,m){
  if(m.wing){ctx.fillStyle='rgba(255,120,160,.35)';ctx.beginPath();ctx.ellipse(cx-9,cy+1,6,9,.7,0,Math.PI*2);ctx.ellipse(cx+9,cy+1,6,9,-.7,0,Math.PI*2);ctx.fill();}
  if(m.tail){ctx.strokeStyle=m.hair;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+3,cy+11);ctx.quadraticCurveTo(cx+12,cy+13,cx+8,cy+20);ctx.stroke();}
  ctx.fillStyle=m.body;ctx.fillRect(cx-7,cy+1,14,11);
  ctx.fillStyle='#ffd4bf';ctx.fillRect(cx-5,cy-6,10,9);
  ctx.fillStyle=m.hair;ctx.fillRect(cx-7,cy-8,14,4);
  if(m.horn){ctx.fillStyle='#e6c995';ctx.fillRect(cx-6,cy-11,3,3);ctx.fillRect(cx+3,cy-11,3,3);}
  if(m.ear){ctx.fillStyle=m.hair;ctx.fillRect(cx-9,cy-5,2,4);ctx.fillRect(cx+7,cy-5,2,4);}
  ctx.fillStyle=m.eye;ctx.fillRect(cx-3,cy-2,2,2);ctx.fillRect(cx+1,cy-2,2,2);
}

function drawUnit(tx,ty,m,isPlayer=false,hurt=0,idle=0){const x=tx*tile+16,y=ty*tile+16+Math.sin((performance.now()/180)+idle)*1.3;ctx.save();if(hurt>0)ctx.translate((Math.random()-.5)*2,0);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x,y+11,10,4,0,0,Math.PI*2);ctx.fill();drawParts(x,y,m);if(isPlayer){ctx.strokeStyle='#84ff95';ctx.lineWidth=2;ctx.strokeRect(tx*tile+4,ty*tile+4,24,24);}ctx.restore();}

function step(dx,dy){const nx=state.player.x+dx,ny=state.player.y+dy;if(!passable(nx,ny))return;const e=enemyAt(nx,ny);if(e){e.hp-=state.atk;e.hurt=8;state.lastHit=e.kind;log(`${e.kind.name}に${state.atk}ダメージ！`);if(e.hp<=0){state.enemies=state.enemies.filter(v=>v!==e);state.gold+=rand(8,24);log(`${e.kind.name}を撃破！`);}}else{state.player.x=nx;state.player.y=ny;}endTurn();}
function enemyTurn(){for(const e of state.enemies){const dx=Math.sign(state.player.x-e.x),dy=Math.sign(state.player.y-e.y),tx=e.x+dx,ty=e.y+dy;if(Math.abs(state.player.x-e.x)+Math.abs(state.player.y-e.y)===1){const dmg=rand(3,7)+Math.floor(state.floor/4);state.hp-=dmg;state.flash=6;state.lastHit=e.kind;log(`${e.kind.name}の攻撃！ ${dmg}ダメージ`);if(state.hp<=0){alert(`ゲームオーバー: 地下${state.floor}階 / ターン${state.turn}`);Object.assign(state,{floor:1,turn:0,gold:0,hp:100,maxHp:100,atk:12});makeFloor();return;}}else if(passable(tx,ty)&&!enemyAt(tx,ty)&&!(tx===state.player.x&&ty===state.player.y)){e.x=tx;e.y=ty;}}}
function endTurn(){state.turn++;if(state.player.x===state.stairs.x&&state.player.y===state.stairs.y){if(state.floor>=state.maxFloor){alert(`地下30階制覇！ ターン:${state.turn} ゴールド:${state.gold}`);Object.assign(state,{floor:1,turn:0,gold:0,hp:100,maxHp:100,atk:12});}else{state.floor++;state.hp=Math.min(state.maxHp,state.hp+8);}makeFloor();}enemyTurn();updateUI();}

function render(){ctx.fillStyle=state.flash>0?'#3f1f2f':'#10131f';ctx.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<h;y++)for(let x=0;x<w;x++)drawTile(x,y,state.map[y][x]?'#24253a':'#3a3f5a');drawTile(state.stairs.x,state.stairs.y,'#d4b449');for(const e of state.enemies){drawUnit(e.x,e.y,e.kind,false,e.hurt,e.idle);if(e.hurt>0)e.hurt--;}drawUnit(state.player.x,state.player.y,monsters[0],true,0,0);if(state.flash>0)state.flash--;drawPortrait(state.lastHit||monsters[0]);requestAnimationFrame(render);} 
function drawTile(x,y,c){ctx.fillStyle=c;ctx.fillRect(x*tile,y*tile,tile,tile);} 
function drawPortrait(m){pctx.clearRect(0,0,240,280);pctx.fillStyle='rgba(255,255,255,.05)';pctx.fillRect(12,12,216,256);pctx.fillStyle='#f3c3ff';pctx.font='bold 24px sans-serif';pctx.fillText(m.name,20,40);const cx=120,cy=150,s=4;pctx.save();pctx.translate(cx,cy);pctx.scale(s,s);ctxDummy(pctx,m);pctx.restore();}
function ctxDummy(c,m){c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,20,20,7,0,0,Math.PI*2);c.fill();if(m.wing){c.fillStyle='rgba(255,120,160,.35)';c.beginPath();c.ellipse(-18,2,10,14,.7,0,Math.PI*2);c.ellipse(18,2,10,14,-.7,0,Math.PI*2);c.fill();}if(m.tail){c.strokeStyle=m.hair;c.lineWidth=1.2;c.beginPath();c.moveTo(6,18);c.quadraticCurveTo(20,22,14,32);c.stroke();}c.fillStyle=m.body;c.fillRect(-12,-2,24,20);c.fillStyle='#ffd4bf';c.fillRect(-9,-16,18,14);c.fillStyle=m.hair;c.fillRect(-12,-20,24,7);if(m.horn){c.fillStyle='#e6c995';c.fillRect(-10,-25,5,5);c.fillRect(5,-25,5,5);}if(m.ear){c.fillStyle=m.hair;c.fillRect(-16,-15,4,7);c.fillRect(12,-15,4,7);}c.fillStyle=m.eye;c.fillRect(-5,-10,3,3);c.fillRect(2,-10,3,3);} 
function updateUI(){document.getElementById('floorLabel').textContent=`地下 ${state.floor} 階`;document.getElementById('meta').innerHTML=`ターン: ${state.turn}<br>HP: ${state.hp}/${state.maxHp}<br>G: ${state.gold}<br>残敵: ${state.enemies.length}`;document.getElementById('partyStats').innerHTML=`<div class="row"><b>主人公: ドラゴン娘</b><span>Lv ${Math.ceil(state.floor/2)}</span></div><div class="row"><span>HP</span><span>${state.hp}/${state.maxHp}</span></div><div class="row"><span>攻撃</span><span>${state.atk}</span></div>`;document.getElementById('dex').innerHTML=monsters.map(m=>`<li style="color:${m.body}">${m.name}</li>`).join('');}
function log(t){document.getElementById('log').textContent=t;}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='arrowup'||k==='w')step(0,-1);if(k==='arrowdown'||k==='s')step(0,1);if(k==='arrowleft'||k==='a')step(-1,0);if(k==='arrowright'||k==='d')step(1,0);if(k===' ')endTurn();});
makeFloor();updateUI();render();
