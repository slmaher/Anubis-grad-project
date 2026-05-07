import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";

const AVATAR_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  html,body{margin:0;padding:0;background:#120a02;overflow:hidden;height:100%;font-family:-apple-system,sans-serif}
  canvas{display:block}
  #ui{position:absolute;bottom:0;left:0;right:0;padding:14px 20px 22px;background:linear-gradient(transparent,rgba(8,4,0,.9));text-align:center;pointer-events:none}
  #subtitle{color:#f5e0b0;font-size:15px;font-weight:600;line-height:1.5;min-height:22px;text-shadow:0 1px 8px rgba(0,0,0,.8)}
  #status{color:#b89050;font-size:11px;margin-top:5px;letter-spacing:.1em;text-transform:uppercase}
  #hint{position:absolute;top:14px;left:50%;transform:translateX(-50%);background:rgba(240,192,64,.1);border:1px solid rgba(240,192,64,.3);color:#f0d070;font-size:11px;font-weight:700;letter-spacing:.06em;padding:6px 16px;border-radius:999px;white-space:nowrap}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hint">👑 الدليل الفرعوني</div>
<div id="ui">
  <div id="subtitle">جاهز للكلام</div>
  <div id="status">Virtual Guide Ready</div>
</div>
<script>
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const sub=document.getElementById('subtitle'), sta=document.getElementById('status');
let W,H;
function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
resize();window.addEventListener('resize',resize);

let t=0,mouthOpen=0,mouthTarget=0,blinkT=0,nextBlink=4;
let audioEl=null,audioCtx=null,analyser=null,dataArr=null,audioLevel=0,isSpeaking=false;
const parts=[];

const SK='#c8824a',SK2='#a86030',SK3='#e0a878';
const GD='#f0c040',GD2='#c89010',GD3='#ffe080';
const LP='#1a3d9f',LP2='#0d2060';
const TQ='#188870',RD='#c03820',WH='#ece8dc';

function spawnPart(x,y){parts.push({x,y,vx:(Math.random()-.5)*.9,vy:-Math.random()*.7-.3,life:1,r:Math.random()*1.8+.8});}

function draw(){
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#080502');bg.addColorStop(.55,'#18100a');bg.addColorStop(1,'#2a1a08');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.save();
  for(let i=0;i<70;i++){
    const sx=(i*173+31)%W,sy=(i*97+17)%(H*.5);
    ctx.globalAlpha=(.25+.5*Math.abs(Math.sin(t*.6+i)))*.7;
    ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.arc(sx,sy,i%4===0?1.3:.6,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  const gr=ctx.createLinearGradient(0,H*.72,0,H);
  gr.addColorStop(0,'#2a1505');gr.addColorStop(1,'#40200a');
  ctx.fillStyle=gr;ctx.fillRect(0,H*.72,W,H*.28);
  ctx.fillStyle='#1e0e04';
  ctx.beginPath();ctx.moveTo(0,H*.76);
  ctx.quadraticCurveTo(W*.2,H*.69,W*.38,H*.74);
  ctx.quadraticCurveTo(W*.55,H*.66,W*.72,H*.73);
  ctx.quadraticCurveTo(W*.88,H*.68,W,H*.74);
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  const gg=ctx.createRadialGradient(W/2,H*.85,5,W/2,H*.85,W*.4);
  gg.addColorStop(0,'rgba(220,140,30,.06)');gg.addColorStop(1,'transparent');
  ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#160b03';
  [[W*.12,H*.71,120,95],[W*.88,H*.72,100,80]].forEach(([px,py,pw,ph])=>{
    ctx.beginPath();ctx.moveTo(px,py-ph);ctx.lineTo(px-pw/2,py);ctx.lineTo(px+pw/2,py);ctx.closePath();ctx.fill();
  });

  const S=Math.min(W/420,H/780,1);
  const CX=W/2+Math.sin(t*.32)*7*S;
  const CY=H*.5;

  ctx.save();
  ctx.translate(CX,CY+Math.sin(t*.9)*4*S);

  // Legs
  ctx.beginPath();ctx.moveTo(-22*S,180*S);ctx.quadraticCurveTo(-28*S,240*S,-26*S,290*S);
  ctx.lineWidth=28*S;ctx.strokeStyle=WH;ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.moveTo(22*S,180*S);ctx.quadraticCurveTo(28*S,240*S,26*S,290*S);
  ctx.lineWidth=28*S;ctx.strokeStyle=WH;ctx.stroke();
  [-26,26].forEach(lx=>{
    ctx.fillStyle=GD2;ctx.beginPath();ctx.ellipse(lx*S,292*S,16*S,6*S,0,0,Math.PI*2);ctx.fill();
  });

  // Robe hem
  ctx.fillStyle=GD;ctx.fillRect(-80*S,176*S,160*S,7*S);
  ctx.fillStyle=LP2;ctx.fillRect(-80*S,168*S,160*S,8*S);
  ctx.fillStyle=RD;ctx.fillRect(-80*S,162*S,160*S,6*S);

  // Torso
  ctx.beginPath();
  ctx.moveTo(-44*S,-80*S);
  ctx.bezierCurveTo(-52*S,-50*S,-60*S,40*S,-78*S,175*S);
  ctx.lineTo(78*S,175*S);
  ctx.bezierCurveTo(60*S,40*S,52*S,-50*S,44*S,-80*S);
  ctx.quadraticCurveTo(0,-88*S,-44*S,-80*S);
  ctx.closePath();
  ctx.fillStyle=WH;ctx.fill();ctx.strokeStyle='#c8b888';ctx.lineWidth=1*S;ctx.stroke();
  const rs=ctx.createLinearGradient(-60*S,-80*S,60*S,175*S);
  rs.addColorStop(0,'rgba(255,255,255,.04)');rs.addColorStop(1,'rgba(0,0,0,.1)');
  ctx.fillStyle=rs;ctx.fill();

  // Kilt
  ctx.beginPath();
  ctx.moveTo(-48*S,-6*S);ctx.lineTo(48*S,-6*S);ctx.lineTo(58*S,55*S);ctx.lineTo(-58*S,55*S);ctx.closePath();
  ctx.fillStyle=GD2;ctx.fill();ctx.strokeStyle='#806000';ctx.lineWidth=.8*S;ctx.stroke();
  for(let i=0;i<5;i++){
    ctx.strokeStyle=i%2===0?LP:GD3;ctx.lineWidth=2*S;
    ctx.beginPath();ctx.moveTo(-46*S+i*2*S,2*S+i*10*S);ctx.lineTo(46*S-i*2*S,2*S+i*10*S);ctx.stroke();
  }

  // Neck
  ctx.beginPath();ctx.ellipse(0,-112*S,15*S,40*S,0,0,Math.PI*2);
  ctx.fillStyle=SK;ctx.fill();ctx.strokeStyle=SK2;ctx.lineWidth=.8*S;ctx.stroke();

  // HEAD
  const HY=-195*S;

  // Nemes back - enhanced with more detail
  ctx.beginPath();
  ctx.moveTo(-54*S,HY-38*S);ctx.quadraticCurveTo(-82*S,HY+5*S,-72*S,HY+85*S);
  ctx.lineTo(72*S,HY+85*S);ctx.quadraticCurveTo(82*S,HY+5*S,54*S,HY-38*S);
  ctx.quadraticCurveTo(0,HY-62*S,-54*S,HY-38*S);ctx.closePath();
  ctx.fillStyle='#ddd5b8';ctx.fill();
  const nemesGrad=ctx.createLinearGradient(-82*S,HY,82*S,HY);
  nemesGrad.addColorStop(0,'rgba(0,0,0,.15)');nemesGrad.addColorStop(.5,'rgba(255,255,255,.08)');nemesGrad.addColorStop(1,'rgba(0,0,0,.15)');
  ctx.fillStyle=nemesGrad;ctx.fill();
  for(let s=0;s<14;s++){
    const sy=HY-36*S+s*8.5*S,xw=(54+s*2.4)*S;
    ctx.strokeStyle=s%3===0?GD:s%2===0?LP:LP2;ctx.lineWidth=s%2===0?2.8*S:1.8*S;
    ctx.beginPath();ctx.moveTo(-xw,sy);ctx.lineTo(xw,sy);ctx.stroke();
  }

  // Face
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-34*S,HY-48*S);
  ctx.bezierCurveTo(-56*S,HY-34*S,-56*S,HY+14*S,-46*S,HY+42*S);
  ctx.quadraticCurveTo(-26*S,HY+70*S,0,HY+72*S);
  ctx.quadraticCurveTo(26*S,HY+70*S,46*S,HY+42*S);
  ctx.bezierCurveTo(56*S,HY+14*S,56*S,HY-34*S,34*S,HY-48*S);
  ctx.quadraticCurveTo(0,HY-60*S,-34*S,HY-48*S);
  ctx.closePath();
  ctx.fillStyle=SK;ctx.fill();ctx.strokeStyle=SK2;ctx.lineWidth=1*S;ctx.stroke();
  const fsh=ctx.createLinearGradient(-40*S,HY-40*S,40*S,HY+50*S);
  fsh.addColorStop(0,'rgba(255,200,140,.08)');fsh.addColorStop(.5,'rgba(0,0,0,.0)');fsh.addColorStop(1,'rgba(0,0,0,.15)');
  ctx.fillStyle=fsh;ctx.fill();
  [[-22,20],[22,20]].forEach(([cx2,cy2])=>{
    const cg=ctx.createRadialGradient(cx2*S,HY+cy2*S,1,cx2*S,HY+cy2*S,14*S);
    cg.addColorStop(0,'rgba(180,80,50,.12)');cg.addColorStop(1,'transparent');
    ctx.fillStyle=cg;ctx.fill();
  });
  ctx.restore();

  // Nemes lappets - enhanced and larger
  [[-1,-54],[1,54]].forEach(([fl,ix])=>{
    ctx.beginPath();
    ctx.moveTo(ix*S,HY-15*S);
    ctx.quadraticCurveTo(fl<0?-76*S:76*S,HY+15*S,fl<0?-68*S:68*S,HY+82*S);
    ctx.lineTo(fl<0?-48*S:48*S,HY+85*S);
    ctx.quadraticCurveTo(fl<0?-56*S:56*S,HY+20*S,ix*S,HY-12*S);
    ctx.closePath();ctx.fillStyle='#d8d0b8';ctx.fill();
    const lapGrad=ctx.createLinearGradient(fl<0?-76*S:76*S,HY,fl<0?-48*S:48*S,HY+85*S);
    lapGrad.addColorStop(0,'rgba(255,255,255,.12)');lapGrad.addColorStop(1,'rgba(0,0,0,.2)');
    ctx.fillStyle=lapGrad;ctx.fill();
    ctx.strokeStyle=GD;ctx.lineWidth=1.2*S;ctx.stroke();
    for(let s=0;s<9;s++){
      ctx.strokeStyle=s%3===0?GD:s%2===0?LP2:LP;ctx.lineWidth=s%2===0?2*S:1.4*S;
      ctx.beginPath();ctx.moveTo(ix*S,HY-10*S+s*9*S);ctx.lineTo((ix+fl*3.5)*S,HY-10*S+s*9*S);ctx.stroke();
    }
  });

  // Diadem - enhanced with more jewels and detail
  ctx.beginPath();ctx.arc(0,HY-28*S,42*S,Math.PI*.72,Math.PI*.28,false);
  ctx.strokeStyle=GD2;ctx.lineWidth=6*S;ctx.stroke();
  ctx.beginPath();ctx.arc(0,HY-28*S,36*S,Math.PI*.72,Math.PI*.28,false);
  ctx.strokeStyle=GD3;ctx.lineWidth=2*S;ctx.stroke();
  [-.65,-.55,-.27,0,.27,.55,.65].forEach((a,i)=>{
    const gx=Math.cos(a*Math.PI-.5)*42*S,gy=HY-28*S+Math.sin(a*Math.PI-.5)*42*S;
    const jewels=[GD,TQ,RD,LP,'#cc1010',TQ,GD];
    ctx.beginPath();ctx.arc(gx,gy,4.5*S,0,Math.PI*2);
    ctx.fillStyle=jewels[i];ctx.fill();
    ctx.strokeStyle=GD2;ctx.lineWidth=.8*S;ctx.stroke();
    ctx.beginPath();ctx.arc(gx,gy,2.2*S,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.6)';ctx.fill();
  });

  // Uraeus - enhanced cobra
  ctx.save();ctx.translate(0,HY-34*S);
  ctx.strokeStyle=GD;ctx.lineWidth=3.5*S;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,10*S);ctx.quadraticCurveTo(-6*S,-5*S,-3*S,-15*S);
  ctx.quadraticCurveTo(5*S,-22*S,9*S,-12*S);ctx.quadraticCurveTo(11*S,-4*S,4*S,4*S);ctx.stroke();
  ctx.beginPath();ctx.ellipse(7*S,-10*S,8*S,5.5*S,-.35,0,Math.PI*2);
  ctx.fillStyle=GD2;ctx.fill();ctx.strokeStyle=GD;ctx.lineWidth=1*S;ctx.stroke();
  ctx.beginPath();ctx.ellipse(7*S,-10*S,5*S,3*S,-.35,0,Math.PI*2);
  ctx.fillStyle=GD3;ctx.fill();
  ctx.beginPath();ctx.arc(8*S,-10*S,1.8*S,0,Math.PI*2);
  ctx.fillStyle='#000';ctx.fill();
  ctx.beginPath();ctx.arc(9*S,-10.5*S,.7*S,0,Math.PI*2);
  ctx.fillStyle='#fff';ctx.fill();
  ctx.restore();

  // Eyes
  const blH=Math.max(.05,Math.abs(Math.sin(blinkT))<.06?.06:1);
  const EY=HY-8*S;
  [[-15*S,1],[15*S,-1]].forEach(([ex,fl])=>{
    ctx.strokeStyle='#000';ctx.lineWidth=1.2*S;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(ex+fl*11*S,EY);ctx.lineTo(ex+fl*20*S,EY+1*S);ctx.stroke();
    ctx.beginPath();ctx.ellipse(ex,EY,12*S,9*S*blH,0,0,Math.PI*2);ctx.fillStyle='#faf8f0';ctx.fill();
    ctx.beginPath();ctx.ellipse(ex+fl*.4*S,EY,6*S,7*S*blH,0,0,Math.PI*2);ctx.fillStyle='#2a1408';ctx.fill();
    ctx.beginPath();ctx.ellipse(ex+fl*.4*S,EY,3*S,3.5*S*blH,0,0,Math.PI*2);ctx.fillStyle='#0a0400';ctx.fill();
    ctx.beginPath();ctx.arc(ex+fl*1.2*S,EY-1.5*S,1.2*S,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fill();
    ctx.beginPath();ctx.moveTo(ex-12*S,EY);ctx.quadraticCurveTo(ex,EY-9*S*blH,ex+12*S,EY);
    ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=2*S;ctx.stroke();
    ctx.beginPath();ctx.moveTo(ex-12*S,EY);ctx.quadraticCurveTo(ex,EY+7*S*blH,ex+12*S,EY);
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.2*S;ctx.stroke();
  });

  // Eyebrows
  [[-15*S,-1],[15*S,1]].forEach(([bx,fl])=>{
    ctx.strokeStyle='#1a0a00';ctx.lineWidth=2.8*S;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(bx-10*S,EY-14*S);ctx.quadraticCurveTo(bx,EY-18*S,bx+10*S,EY-12*S);ctx.stroke();
  });

  // Nose
  ctx.strokeStyle=SK2;ctx.lineWidth=1.2*S;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-3*S,EY+18*S);ctx.quadraticCurveTo(-7*S,EY+34*S,-8*S,EY+43*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(3*S,EY+18*S);ctx.quadraticCurveTo(7*S,EY+34*S,8*S,EY+43*S);ctx.stroke();
  ctx.beginPath();ctx.ellipse(-7*S,EY+46*S,5*S,3.5*S,.2,0,Math.PI*2);ctx.fillStyle=SK2;ctx.fill();
  ctx.beginPath();ctx.ellipse(7*S,EY+46*S,5*S,3.5*S,-.2,0,Math.PI*2);ctx.fillStyle=SK2;ctx.fill();
  ctx.beginPath();ctx.ellipse(0,EY+44*S,6*S,4*S,0,0,Math.PI*2);ctx.fillStyle=SK3;ctx.fill();

  // Mouth
  const MY=EY+58*S;
  const MW=(20+mouthOpen*11)*S;
  const MH=(3+mouthOpen*13)*S;
  ctx.fillStyle='#a85040';
  ctx.beginPath();ctx.moveTo(-MW,MY);ctx.bezierCurveTo(-MW*.6,MY-5*S,-MW*.1,MY-6*S,0,MY-5*S);
  ctx.bezierCurveTo(MW*.1,MY-6*S,MW*.6,MY-5*S,MW,MY);ctx.closePath();ctx.fill();
  ctx.fillStyle='#bf6a58';
  ctx.beginPath();ctx.moveTo(-MW,MY);ctx.quadraticCurveTo(0,MY+MH+4*S,MW,MY);ctx.closePath();ctx.fill();
  if(mouthOpen>.1){
    ctx.fillStyle='#1e0404';
    ctx.beginPath();ctx.ellipse(0,MY+MH*.3,MW*.65,MH*.55,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(113, 87, 40, 0.8)';
    ctx.beginPath();ctx.ellipse(0,MY+1*S,MW*.58,MH*.2,0,0,Math.PI);ctx.fill();
  }
  ctx.strokeStyle='#803030';ctx.lineWidth=.8*S;
  ctx.beginPath();ctx.moveTo(-MW,MY);ctx.lineTo(MW,MY);ctx.stroke();

  // Beard
  ctx.fillStyle=GD2;
  ctx.beginPath();ctx.moveTo(-12*S,MY+28*S);ctx.lineTo(9*S,MY+26*S);ctx.lineTo(5*S,MY+56*S);ctx.lineTo(-5*S,MY+56*S);ctx.closePath();ctx.fill();
  for(let b=0;b<4;b++){ctx.strokeStyle=LP;ctx.lineWidth=1.8*S;ctx.beginPath();ctx.moveTo(-8*S+b*S,MY+30*S+b*6*S);ctx.lineTo(8*S-b*S,MY+30*S+b*6*S);ctx.stroke();}
  ctx.fillStyle=GD;ctx.beginPath();ctx.moveTo(-4*S,MY+56*S);ctx.quadraticCurveTo(0,MY+64*S,4*S,MY+56*S);ctx.closePath();ctx.fill();

  // Arms
  const armSway=Math.sin(t*.5)*.07;
  ctx.save();ctx.rotate(armSway);
  ctx.beginPath();ctx.moveTo(-42*S,-62*S);ctx.quadraticCurveTo(-82*S,-30*S,-90*S,40*S);
  ctx.lineWidth=20*S;ctx.strokeStyle=SK;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
  ctx.beginPath();ctx.moveTo(-90*S,40*S);ctx.quadraticCurveTo(-94*S,90*S,-88*S,128*S);
  ctx.lineWidth=17*S;ctx.strokeStyle=SK;ctx.stroke();
  ctx.beginPath();ctx.arc(-88*S,128*S,11*S,0,Math.PI*2);ctx.lineWidth=5*S;ctx.strokeStyle=GD2;ctx.stroke();
  ctx.beginPath();ctx.ellipse(-86*S,142*S,12*S,10*S,.2,0,Math.PI*2);
  ctx.fillStyle=SK;ctx.fill();ctx.strokeStyle=SK2;ctx.lineWidth=.8*S;ctx.stroke();
  drawAnkh(-86*S,157*S,S);
  ctx.restore();

  ctx.save();ctx.rotate(-armSway*.8);
  ctx.beginPath();ctx.moveTo(42*S,-62*S);ctx.quadraticCurveTo(82*S,-30*S,90*S,40*S);
  ctx.lineWidth=20*S;ctx.strokeStyle=SK2;ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.moveTo(90*S,40*S);ctx.quadraticCurveTo(94*S,90*S,88*S,124*S);
  ctx.lineWidth=17*S;ctx.strokeStyle=SK2;ctx.stroke();
  ctx.beginPath();ctx.arc(88*S,124*S,11*S,0,Math.PI*2);ctx.lineWidth=5*S;ctx.strokeStyle=GD2;ctx.stroke();
  ctx.beginPath();ctx.ellipse(86*S,138*S,12*S,10*S,-.2,0,Math.PI*2);
  ctx.fillStyle=SK2;ctx.fill();ctx.strokeStyle=SK2;ctx.lineWidth=.8*S;ctx.stroke();
  ctx.strokeStyle=GD;ctx.lineWidth=4.5*S;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(86*S,138*S);ctx.lineTo(86*S,102*S);ctx.quadraticCurveTo(86*S,74*S,68*S,68*S);ctx.stroke();
  for(let s=0;s<5;s++){
    ctx.strokeStyle=s%2===0?GD:LP;ctx.lineWidth=3.5*S;
    ctx.beginPath();ctx.moveTo(82*S,138*S-s*11*S);ctx.lineTo(90*S,138*S-s*11*S);ctx.stroke();
  }
  ctx.restore();

  ctx.restore();

  // Particles
  if(isSpeaking&&Math.random()<.12)spawnPart(CX-86*S+Math.random()*18*S,CY+157*S+Math.random()*35*S);
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.life-=.018;
    if(p.life<=0){parts.splice(i,1);continue;}
    ctx.globalAlpha=p.life*.55;ctx.fillStyle=GD;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  const ag=ctx.createRadialGradient(CX-86*S,CY+175*S,4,CX-86*S,CY+175*S,50*S);
  ag.addColorStop(0,'rgba(255,200,50,'+(isSpeaking ? .18 : .06)+')');ag.addColorStop(1,'transparent');
  ctx.fillStyle=ag;ctx.fillRect(CX-136*S,CY+125*S,100*S,100*S);
}

function drawAnkh(x,y,S){
  ctx.strokeStyle=GD;ctx.lineWidth=4.5*S;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+36*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-15*S,y+8*S);ctx.lineTo(x+15*S,y+8*S);ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,y-11*S,10*S,13*S,0,0,Math.PI*2);ctx.stroke();
}

function loop(){
  t+=.016;blinkT+=.016;
  if(blinkT>nextBlink){blinkT=-.12;nextBlink=3+Math.random()*5;}
  let analyserActive=false;
  if(analyser&&dataArr&&audioEl&&audioEl.currentTime>0.05){
    try{
      analyser.getByteTimeDomainData(dataArr);
      let energy=0;
      for(let i=0;i<dataArr.length;i++){
        const sample=(dataArr[i]-128)/128;
        energy+=sample*sample;
      }
      const rms=Math.sqrt(energy/dataArr.length);
      audioLevel=rms;
      if(rms>0.01){
        analyserActive=true;
        mouthTarget=Math.min(1,Math.max(0.08,rms*12-0.04));
        if(mouthTarget>0.5){
          mouthTarget=Math.min(1,mouthTarget+Math.abs(Math.sin(t*11))*0.06);
        }
      }
    }catch(e){}
  }
  if(!analyserActive&&isSpeaking){
    const audioPhase=audioEl?.currentTime||t;
    const baseOpen=0.22;
    const variance=Math.abs(Math.sin(audioPhase*8.5))*0.28+Math.abs(Math.sin(audioPhase*3.2))*0.15;
    mouthTarget=baseOpen+variance;
    mouthTarget=Math.min(1,Math.max(0.08,mouthTarget));
    audioLevel=mouthTarget;
  }
  if(!isSpeaking){mouthTarget=0;audioLevel=0;}
  const mouthEase=mouthTarget>mouthOpen?.36:.14;
  mouthOpen+=(mouthTarget-mouthOpen)*mouthEase;
  draw();requestAnimationFrame(loop);
}
loop();

function startAudio(url,text){
  if(audioEl){try{audioEl.pause();audioEl.src='';}catch(e){}}
  audioEl=new Audio(url);audioEl.crossOrigin='anonymous';
  try{
    if(!audioCtx){
      audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    }
    if(audioCtx.state==='suspended'){
      audioCtx.resume().catch(()=>{});
    }
    const src=audioCtx.createMediaElementSource(audioEl);
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=2048;
    analyser.smoothingTimeConstant=0.75;
    dataArr=new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);analyser.connect(audioCtx.destination);
  }catch(e){console.warn("Audio context setup failed:",e);analyser=null;dataArr=null;}
  audioEl.onloadedmetadata=()=>{sub.textContent=text||'...';};
  audioEl.onplay=()=>{if(audioCtx&&audioCtx.state==='suspended'){audioCtx.resume().catch(()=>{});}};
  audioEl.play().catch((err)=>{console.warn("Audio play failed:",err);});
  audioEl.onended=stopAudio;
  isSpeaking=true;sta.textContent='يتكلم...';
}
function stopAudio(){
  isSpeaking=false;mouthTarget=0;
  if(audioCtx){try{audioCtx.close();}catch(e){}audioCtx=null;analyser=null;dataArr=null;}
  sub.textContent='جاهز للكلام';sta.textContent='Virtual Guide Ready';
}
window.addEventListener('message',function(ev){
  try{
    const d=typeof ev.data==='string'?JSON.parse(ev.data):ev.data;
    if(d&&d.type==='PLAY_AUDIO'&&d.audioUrl)startAudio(d.audioUrl,d.text||'');
  }catch(e){}
});
</script>
</body>
</html>
`;

export default function VirtualGuide() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const webRef = useRef(null);

  const rawAudioParam = params?.audioUrl || "";
  const audioUrl = rawAudioParam ? decodeURIComponent(rawAudioParam) : null;
  const rawTextParam = params?.text || "";
  const guideText = rawTextParam ? decodeURIComponent(rawTextParam) : "";
  const rawLanguageParam = params?.language || "";
  const language = rawLanguageParam ? decodeURIComponent(rawLanguageParam) : "en";

  useEffect(() => {
    if (audioUrl && webRef.current) {
      const t = setTimeout(() => {
        try {
          webRef.current.postMessage(
            JSON.stringify({ type: "PLAY_AUDIO", audioUrl, text: guideText, language })
          );
        } catch (e) {
          console.warn("postMessage failed", e);
        }
      }, 600);
      return () => clearTimeout(t);
    }
  }, [audioUrl, guideText, language]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Virtual Guide</Text>
        <View style={{ width: 60 }} />
      </View>

      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: AVATAR_HTML }}
        javaScriptEnabled={true}
        style={{ flex: 1, backgroundColor: "transparent" }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#120a02" },
  header: {
    height: Platform.OS === "ios" ? 84 : 64,
    paddingTop: Platform.OS === "ios" ? 36 : 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#080502",
    borderBottomWidth: 1,
    borderBottomColor: "#2a1505",
  },
  back: { width: 60 },
  backText: { color: "#f0c040", fontWeight: "700" },
  title: { fontWeight: "800", color: "#f0c040" },
});