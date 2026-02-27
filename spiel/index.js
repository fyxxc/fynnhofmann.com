<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Claude Soccer Slime</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#111827;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}
    #app{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100%}
    h1{font-size:2.2rem;font-weight:bold;margin-bottom:1.2rem}
    h2{font-size:1.5rem;margin-bottom:1rem}
    p{color:#9ca3af;margin-bottom:.4rem}
    .row{display:flex;gap:.75rem;margin:.75rem 0;flex-wrap:wrap;justify-content:center}
    button{cursor:pointer;font-family:inherit;padding:.65rem 1.4rem;background:#1e3a8a;border:2px solid #4b5563;border-radius:6px;color:#fff;font-size:.95rem;transition:background .2s}
    button:hover{background:#1d4ed8}
    .btn-sm{padding:.35rem .9rem;background:#374151;font-size:.8rem}
    .btn-sm:hover{background:#4b5563}
    #scorebar{background:#1d4ed8;padding:.65rem 2rem;width:800px;max-width:100%;display:flex;justify-content:space-between;align-items:center;font-size:1.05rem;font-weight:bold;border-radius:6px 6px 0 0}
    canvas{border:4px solid #374151;display:block;max-width:100%}
    .hint{font-size:.78rem;color:#9ca3af;margin-top:.75rem;text-align:center}
    #winner{margin-top:1.5rem;text-align:center}
    #winner h2{font-size:1.8rem;margin-bottom:.75rem}
    .hidden{display:none!important}
  </style>
</head>
<body>
<div id="app">
  <!-- MENU -->
  <div id="screen-menu">
    <h1>⚽ Claude Soccer Slime</h1>
    <p>Ursprünglich von Quin Pendragon</p>
    <p style="margin-bottom:1.5rem">Adaptiert von Claude</p>
    <div class="row">
      <button id="btn-single">Einzelspieler</button>
      <button id="btn-multi">Mehrspieler</button>
    </div>
  </div>

  <!-- MODE SELECT -->
  <div id="screen-mode" class="hidden">
    <h2>Spieldauer wählen</h2>
    <div style="font-size:1.1rem;margin-bottom:.75rem">
      <span style="color:#00CED1">Cyan</span>
      <span style="color:#d1d5db;margin:0 .5rem">vs</span>
      <span style="color:#DC143C">Rot</span>
    </div>
    <div class="row">
      <button data-sec="60">1 Minute</button>
      <button data-sec="120">2 Minuten</button>
      <button data-sec="240">4 Minuten</button>
      <button data-sec="480">8 Minuten</button>
      <button data-sec="300">World Cup</button>
    </div>
    <p id="ctrl-hint" class="hint"></p>
    <div class="row"><button class="btn-sm" id="btn-back">← Zurück</button></div>
  </div>

  <!-- GAME -->
  <div id="screen-game" class="hidden">
    <div id="scorebar">
      <span id="score-l" style="color:#00CED1">Cyan: 0</span>
      <span id="timer" style="font-family:monospace;font-size:1.3rem">00:00</span>
      <span id="score-r" style="color:#DC143C">0 : Rot</span>
    </div>
    <canvas id="cv" width="800" height="400"></canvas>
    <div id="winner" class="hidden">
      <h2 id="winner-text"></h2>
      <button id="btn-menu">Zurück zum Menü</button>
    </div>
  </div>
</div>

<script>
// ── Constants ──────────────────────────────────────────────────────────
const GW=800,GH=400,GND=80,SR=40,BR=10,GW2=80,GH2=120;
const GRAV=0.6,SPD=5,JUMP=-12,DAMP=0.99,BDAMP=0.8,MAXSPD=13;

// ── State ──────────────────────────────────────────────────────────────
let playerMode='single', score={l:0,r:0}, timeLeft=0, timerInterval=null, running=false;
let gs; // game state

function initGs(){
  gs={
    ls:{x:200,y:GH-GND,vx:0,vy:0,grab:false,hasBall:false,glt:0,tx:200,cd:0,fresh:true,lastBy:GH-GND,stuck:0},
    rs:{x:600,y:GH-GND,vx:0,vy:0,grab:false,hasBall:false,glt:0},
    ball:{x:GW/2,y:150,vx:0,vy:0,held:null,ang:0,angV:0}
  };
}

// ── Keys ───────────────────────────────────────────────────────────────
const keys={};
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;e.preventDefault();keys[e.key.toLowerCase()]=true;});
window.addEventListener('keyup',  e=>{if(e.target.tagName==='INPUT')return;e.preventDefault();keys[e.key.toLowerCase()]=false;});

// ── Screens ────────────────────────────────────────────────────────────
const screens={menu:'screen-menu',mode:'screen-mode',game:'screen-game'};
function show(name){Object.values(screens).forEach(id=>document.getElementById(id).classList.add('hidden'));document.getElementById(screens[name]).classList.remove('hidden');}

// ── Menu buttons ────────────────────────────────────────────────────────
document.getElementById('btn-single').onclick=()=>{playerMode='single';document.getElementById('ctrl-hint').textContent='Du spielst Rot (rechts): Pfeiltasten · ↓ = Ball fangen';show('mode');};
document.getElementById('btn-multi').onclick= ()=>{playerMode='multi'; document.getElementById('ctrl-hint').textContent='Links: W/A/D + S (fangen) · Rechts: Pfeiltasten + ↓ (fangen)';show('mode');};
document.getElementById('btn-back').onclick=  ()=>show('menu');
document.getElementById('btn-menu').onclick=  ()=>{stopGame();show('menu');};

document.querySelectorAll('[data-sec]').forEach(btn=>{
  btn.onclick=()=>startGame(parseInt(btn.dataset.sec));
});

// ── Game lifecycle ─────────────────────────────────────────────────────
function startGame(secs){
  initGs();
  score={l:0,r:0};
  updateScoreUI();
  timeLeft=secs;
  updateTimerUI();
  document.getElementById('winner').classList.add('hidden');
  show('game');
  running=true;
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    timeLeft--;
    updateTimerUI();
    if(timeLeft<=0){clearInterval(timerInterval);endGame();}
  },1000);
  requestAnimationFrame(loop);
}

function stopGame(){running=false;clearInterval(timerInterval);}

function endGame(){
  running=false;
  const wt=document.getElementById('winner-text');
  if(score.l>score.r) wt.textContent='🏆 Cyan-Team gewinnt!';
  else if(score.r>score.l) wt.textContent='🏆 Rot-Team gewinnt!';
  else wt.textContent='🤝 Unentschieden!';
  document.getElementById('winner').classList.remove('hidden');
}

function resetPos(){initGs();}

function addGoal(side){
  score[side]++;
  updateScoreUI();
  resetPos();
}

function updateScoreUI(){
  document.getElementById('score-l').textContent='Cyan: '+score.l;
  document.getElementById('score-r').textContent=score.r+' : Rot';
}

function updateTimerUI(){
  const m=Math.floor(timeLeft/60), s=timeLeft%60;
  document.getElementById('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

// ── AI ─────────────────────────────────────────────────────────────────
function updateAI(){
  const ai=gs.ls, ball=gs.ball;
  if(ai.cd>0){
    ai.cd--;
    const d=ai.tx-ai.x;
    ai.vx=Math.abs(d)>10?Math.sign(d)*SPD*Math.min(Math.abs(d)/50,1):0;
    return;
  }
  if(ai.fresh&&timeLeft>55){
    ai.tx=200;ai.vx=0;
    if(Math.abs(ball.x-ai.x)<150||timeLeft<=55){ai.fresh=false;ai.cd=15;}
    return;
  }
  const ballH=GH-GND-ball.y;
  const aiDist=Math.abs(ai.x-ball.x);
  const toOpp=Math.abs(ball.x-(GW-GW2/2));
  const toOwn=Math.abs(ball.x-GW2/2);
  const ballLeft=ball.vx<-1;

  if(Math.abs(ball.y-ai.lastBy)<5&&Math.abs(ball.vx)<2)ai.stuck++;
  else ai.stuck=0;
  ai.lastBy=ball.y;

  let newTx=ai.tx,jump=false;

  if(toOpp<toOwn*1.5||(ball.x>GW*0.35&&!ballLeft)){
    newTx=ball.x-(ballH>60&&aiDist<150?45:30);
    if(aiDist<100){
      if(ai.stuck>30){jump=true;newTx=ball.x-40;}
      else if((ballH>30&&ballH<90)||(ball.x>GW*0.6&&ballH<120)){
        if(ai.y>=GH-GND-1)jump=true;
      }
    }
  } else if(ball.x<GW*0.65||ballLeft){
    newTx=ball.x;
    if(ball.x<GW2*2.5&&ballLeft){
      newTx=Math.max(ball.x-10,SR);
      if(aiDist<120&&ballH<100)jump=true;
    }
  } else {
    newTx=GW*0.4;
  }

  if(Math.abs(newTx-ai.tx)>15){ai.tx=newTx;ai.cd=10;}
  const d=ai.tx-ai.x;
  ai.vx=Math.abs(d)>10?Math.sign(d)*SPD*Math.min(Math.abs(d)/50,1):0;
  if(jump&&ai.vy===0)ai.vy=JUMP;
}

// ── Physics ────────────────────────────────────────────────────────────
function physics(){
  const {ls,rs,ball}=gs;

  if(playerMode==='multi'){
    ls.vx=keys['a']?-SPD:keys['d']?SPD:0;
    if(keys['w']&&ls.y>=GH-GND-1&&!ls.grab)ls.vy=JUMP;
    ls.grab=!!keys['s'];
    rs.vx=keys['arrowleft']?-SPD:keys['arrowright']?SPD:0;
    if(keys['arrowup']&&rs.y>=GH-GND-1&&!rs.grab)rs.vy=JUMP;
    rs.grab=!!keys['arrowdown'];
  } else {
    updateAI();
    rs.vx=keys['arrowleft']?-SPD:keys['arrowright']?SPD:0;
    if(keys['arrowup']&&rs.y>=GH-GND-1&&!rs.grab)rs.vy=JUMP;
    rs.grab=!!keys['arrowdown'];
  }

  [ls,rs].forEach((s,i)=>{
    s.vy+=GRAV; s.x+=s.vx; s.y+=s.vy;
    if(s.x<SR)s.x=SR;
    if(s.x>GW-SR)s.x=GW-SR;
    if(s.y>GH-GND){s.y=GH-GND;s.vy=0;}
    const inOwn=(i===0&&s.x<GW2)||(i===1&&s.x>GW-GW2);
    if(inOwn){s.glt+=1/60;if(s.glt>=1)addGoal(i===0?'r':'l');}
    else s.glt=0;
  });

  if(ball.held){
    const g=ball.held==='l'?ls:rs;
    const dir=ball.held==='l'?1:-1;
    ball.angV+=-g.vx*0.008*dir;
    ball.angV*=0.85;
    ball.ang+=ball.angV;
    const dist=SR+BR-5;
    ball.x=g.x+Math.cos(ball.ang)*dist;
    ball.y=g.y+Math.sin(ball.ang)*dist;
    ball.vx=g.vx;ball.vy=g.vy;
    if(!g.grab){
      const sp=Math.abs(ball.angV)*20;
      ball.vx=g.vx*1.5+Math.cos(ball.ang)*(3+sp);
      ball.vy=g.vy-2+Math.sin(ball.ang)*sp*0.3;
      ball.held=null;ball.ang=0;ball.angV=0;g.hasBall=false;
    }
  } else {
    ball.vy+=GRAV;ball.vx*=DAMP;ball.x+=ball.vx;ball.y+=ball.vy;
  }

  if(ball.x<BR){ball.x=BR;ball.vx=-ball.vx*BDAMP;}
  if(ball.x>GW-BR){ball.x=GW-BR;ball.vx=-ball.vx*BDAMP;}
  if(ball.y>GH-GND-BR){ball.y=GH-GND-BR;ball.vy=-ball.vy*BDAMP;}
  if(ball.y<BR){ball.y=BR;ball.vy=-ball.vy*BDAMP;}

  if(ball.x<=BR&&ball.y>GH-GND-GH2){addGoal('r');return;}
  if(ball.x>=GW-BR&&ball.y>GH-GND-GH2){addGoal('l');return;}

  [ls,rs].forEach((s,i)=>{
    const sn=i===0?'l':'r';
    const other=i===0?rs:ls;
    const dx=ball.x-s.x,dy=ball.y-s.y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<SR+BR){
      if(ball.held&&ball.held!==sn){
        const sp=Math.sqrt(s.vx*s.vx+s.vy*s.vy);
        if(sp>2||Math.abs(s.vy)>5){
          ball.held=null;other.hasBall=false;
          const a=Math.atan2(dy,dx);
          ball.vx=Math.cos(a)*8+s.vx;ball.vy=Math.sin(a)*8+s.vy;
        }
      } else if(s.grab&&!ball.held){
        ball.held=sn;ball.ang=Math.atan2(dy,dx);ball.angV=0;s.hasBall=true;
      } else if(!ball.held){
        const a=Math.atan2(dy,dx);
        if(ball.y<s.y||Math.abs(a)<Math.PI*0.5){
          ball.x=s.x+Math.cos(a)*(SR+BR);
          ball.y=s.y+Math.sin(a)*(SR+BR);
          const sp=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
          ball.vx=Math.cos(a)*sp*1.5+s.vx*0.5;
          ball.vy=Math.sin(a)*sp*1.5+s.vy*0.5;
          const ns=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
          if(ns>MAXSPD){ball.vx*=MAXSPD/ns;ball.vy*=MAXSPD/ns;}
        }
      }
    }
  });
}

// ── Draw ───────────────────────────────────────────────────────────────
const cv=document.getElementById('cv');
const ctx=cv.getContext('2d');

function drawGoalSide(flip){
  const gx=flip?GW-GW2:0;
  ctx.strokeStyle='#FFF';ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(gx,GH-GND);ctx.lineTo(gx+GW2,GH-GND);
  ctx.moveTo(gx+GW2/2,GH-GND);ctx.lineTo(gx+GW2/2,GH-GND-GH2);
  ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=1.2;
  for(let x=gx;x<=gx+GW2/2;x+=10){ctx.beginPath();ctx.moveTo(x,GH-GND-GH2);ctx.lineTo(x,GH-GND);ctx.stroke();}
  for(let y=GH-GND-GH2;y<=GH-GND;y+=10){ctx.beginPath();ctx.moveTo(gx,y);ctx.lineTo(gx+GW2/2,y);ctx.stroke();}
}

function drawSlime(s,isRight,col,acc){
  ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(s.x,s.y,SR,Math.PI,0);ctx.closePath();ctx.fill();
  ctx.fillStyle=acc;
  ctx.beginPath();ctx.arc(s.x,s.y,SR-5,Math.PI+0.3,Math.PI+0.7);ctx.arc(s.x,s.y,SR-15,Math.PI+0.7,Math.PI+0.3,true);ctx.closePath();ctx.fill();
  const ex=s.x+(isRight?-SR*0.3:SR*0.3);
  ctx.fillStyle='#FFF';ctx.beginPath();ctx.arc(ex,s.y-SR*0.3,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000';ctx.beginPath();ctx.arc(s.x+(isRight?-SR*0.35:SR*0.35),s.y-SR*0.3,2,0,Math.PI*2);ctx.fill();
}

function draw(){
  const {ls,rs,ball}=gs;
  ctx.fillStyle='#0000FF';ctx.fillRect(0,0,GW,GH);
  ctx.fillStyle='#808080';ctx.fillRect(0,GH-GND,GW,GND);
  drawGoalSide(false);drawGoalSide(true);
  drawSlime(ls,false,'#00CED1','#008B8B');
  drawSlime(rs,true,'#DC143C','#8B0000');
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(ball.x,ball.y,BR,0,Math.PI*2);ctx.fill();
}

// ── Loop ───────────────────────────────────────────────────────────────
let lastFrame=0;
function loop(t){
  if(!running)return;
  if(t-lastFrame>=1000/60){physics();draw();lastFrame=t;}
  requestAnimationFrame(loop);
}

// ── Init ───────────────────────────────────────────────────────────────
show('menu');
</script>
</body>
</html>