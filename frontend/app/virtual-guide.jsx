import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

const buildAvatarHTML = (
  initialAudioUrl = "",
  initialText = "",
  initialLanguage = "en",
  modelUrl = "",
) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  html,body{margin:0;padding:0;background:#0a0800;overflow:hidden;height:100%;font-family:-apple-system,sans-serif}
  canvas{display:block;width:100%;height:100%;position:relative;z-index:1}
  #bg{position:absolute;inset:0;z-index:0;overflow:hidden}
  #ui{position:absolute;bottom:0;left:0;right:0;padding:14px 20px 22px;background:linear-gradient(transparent,rgba(4,3,0,.95));text-align:center;pointer-events:none;z-index:10}
  #subtitle{color:#f5e8cb;font-size:15px;font-weight:600;line-height:1.5;min-height:22px;text-shadow:0 1px 8px rgba(0,0,0,.8)}
  #status{color:#c8960a;font-size:11px;margin-top:5px;letter-spacing:.15em;text-transform:uppercase}
  #loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#f4dfbc;font-size:14px;background:rgba(20,12,0,.9);padding:16px 20px;border-radius:12px;z-index:15;box-shadow:0 10px 40px rgba(0,0,0,.7);border:1px solid rgba(200,150,10,.2)}
  #loading small{display:block;margin-top:6px;color:#9fb3d1;font-size:11px}
</style>
</head>
<body>
<div id="bg">
  <svg width="100%" height="100%" viewBox="0 0 400 900"
       preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#000008"/>
        <stop offset="45%"  stop-color="#080420"/>
        <stop offset="75%"  stop-color="#12100a"/>
        <stop offset="100%" stop-color="#1a0d03"/>
      </linearGradient>
      <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#2e1e06"/>
        <stop offset="100%" stop-color="#0e0802"/>
      </linearGradient>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#fff8dc" stop-opacity="1"/>
        <stop offset="35%"  stop-color="#f5d060" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#c8900a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="torchL" cx="50%" cy="0%" r="100%">
        <stop offset="0%"   stop-color="#ff8c00" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ff8c00" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="torchR" cx="50%" cy="0%" r="100%">
        <stop offset="0%"   stop-color="#ff8c00" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ff8c00" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="nileGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#0d3a6e" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#061a38" stop-opacity="0.6"/>
      </linearGradient>
      <linearGradient id="pyrL" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#1c1104"/>
        <stop offset="100%" stop-color="#2e2008"/>
      </linearGradient>
      <linearGradient id="pyrR" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#2a1c06"/>
        <stop offset="100%" stop-color="#0e0a02"/>
      </linearGradient>
      <linearGradient id="pyrShadL" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#000" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="pyrShadR" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%"   stop-color="#000" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="400" height="900" fill="url(#skyGrad)"/>
    <circle cx="22"  cy="18"  r="0.7" fill="#fff" opacity="0.75"/>
    <circle cx="55"  cy="9"   r="1.0" fill="#fff" opacity="0.85"/>
    <circle cx="90"  cy="30"  r="0.6" fill="#fff" opacity="0.6"/>
    <circle cx="130" cy="8"   r="0.9" fill="#fff" opacity="0.8"/>
    <circle cx="162" cy="24"  r="0.7" fill="#fff" opacity="0.65"/>
    <circle cx="195" cy="14"  r="1.1" fill="#fffbe0" opacity="0.95"/>
    <circle cx="228" cy="34"  r="0.6" fill="#fff" opacity="0.55"/>
    <circle cx="260" cy="10"  r="1.0" fill="#fff" opacity="0.8"/>
    <circle cx="295" cy="26"  r="0.7" fill="#fff" opacity="0.7"/>
    <circle cx="335" cy="8"   r="1.2" fill="#fffbe0" opacity="0.9"/>
    <circle cx="368" cy="22"  r="0.8" fill="#fff" opacity="0.7"/>
    <circle cx="42"  cy="52"  r="0.6" fill="#fff" opacity="0.5"/>
    <circle cx="85"  cy="60"  r="0.7" fill="#fff" opacity="0.55"/>
    <circle cx="140" cy="46"  r="0.8" fill="#fff" opacity="0.6"/>
    <circle cx="185" cy="58"  r="0.6" fill="#fff" opacity="0.45"/>
    <circle cx="242" cy="48"  r="0.7" fill="#fff" opacity="0.5"/>
    <circle cx="305" cy="55"  r="0.9" fill="#fff" opacity="0.6"/>
    <circle cx="358" cy="44"  r="0.6" fill="#fff" opacity="0.5"/>
    <circle cx="70"  cy="38"  r="1.4" fill="#fffbe0" opacity="0.95" filter="url(#glow)"/>
    <circle cx="318" cy="32"  r="1.3" fill="#fffbe0" opacity="0.9"  filter="url(#glow)"/>
    <circle cx="338" cy="68" r="28" fill="url(#moonGlow)"/>
    <circle cx="338" cy="68" r="18" fill="#fffae8" opacity="0.94" filter="url(#glow)"/>
    <circle cx="347" cy="61" r="14" fill="#000008" opacity="0.9"/>
    <ellipse cx="200" cy="75" rx="185" ry="16" fill="#051733" opacity="0.07" transform="rotate(-10 200 75)"/>
    <polygon points="40,530  68,478 96,530"  fill="#110c02" opacity="0.75"/>
    <polygon points="88,530 118,472 148,530" fill="#130e03" opacity="0.8"/>
    <polygon points="260,530 292,476 324,530" fill="#110c02" opacity="0.75"/>
    <polygon points="-20,650 108,405 236,650" fill="url(#pyrL)"/>
    <polygon points="-20,650 108,405 108,650" fill="url(#pyrShadL)"/>
    <line x1="5"   y1="622" x2="211" y2="622" stroke="#0a0700" stroke-width="0.9" opacity="0.45"/>
    <line x1="22"  y1="594" x2="194" y2="594" stroke="#0a0700" stroke-width="0.9" opacity="0.4"/>
    <line x1="38"  y1="566" x2="178" y2="566" stroke="#0a0700" stroke-width="0.8" opacity="0.35"/>
    <line x1="55"  y1="538" x2="161" y2="538" stroke="#0a0700" stroke-width="0.8" opacity="0.3"/>
    <line x1="70"  y1="512" x2="146" y2="512" stroke="#0a0700" stroke-width="0.7" opacity="0.25"/>
    <circle cx="108" cy="406" r="4" fill="#d4a017" opacity="0.7" filter="url(#glow)"/>
    <polygon points="200,650 316,442 432,650" fill="url(#pyrR)"/>
    <polygon points="316,442 316,650 432,650" fill="url(#pyrShadR)"/>
    <line x1="218" y1="622" x2="414" y2="622" stroke="#0a0700" stroke-width="0.8" opacity="0.4"/>
    <line x1="234" y1="594" x2="398" y2="594" stroke="#0a0700" stroke-width="0.8" opacity="0.35"/>
    <line x1="250" y1="566" x2="382" y2="566" stroke="#0a0700" stroke-width="0.7" opacity="0.3"/>
    <line x1="265" y1="538" x2="367" y2="538" stroke="#0a0700" stroke-width="0.7" opacity="0.25"/>
    <circle cx="316" cy="443" r="3" fill="#d4a017" opacity="0.6" filter="url(#glow)"/>
    <rect x="0" y="648" width="400" height="20" fill="url(#nileGrad)"/>
    <ellipse cx="205" cy="656" rx="30" ry="4" fill="#fffae0" opacity="0.12"/>
    <path d="M0,652 Q50,649 100,652 Q150,655 200,652 Q250,649 300,652 Q350,655 400,652" stroke="#1a5f9e" stroke-width="0.8" fill="none" opacity="0.35"/>
    <path d="M0,658 Q60,655 120,658 Q180,661 240,658 Q300,655 360,658 Q380,660 400,658" stroke="#1a5f9e" stroke-width="0.7" fill="none" opacity="0.25"/>
    <rect x="0" y="668" width="400" height="232" fill="url(#groundGrad)"/>
    <ellipse cx="90"  cy="668" rx="130" ry="14" fill="#3a2508" opacity="0.55"/>
    <ellipse cx="320" cy="668" rx="110" ry="11" fill="#3a2508" opacity="0.45"/>
    <path d="M138,668 Q150,648 166,644 Q174,640 182,646 L188,646 L190,668 Z" fill="#1c1306" opacity="0.92"/>
    <ellipse cx="166" cy="643" rx="11" ry="13" fill="#1c1306" opacity="0.92"/>
    <rect x="158" y="632" width="16" height="9" fill="#1c1306" opacity="0.85"/>
    <r>
    >
    <path d="M0 0 L40 0 L40 3 L3 3 L3 40 L0 40 Z" fill="#c8960a" opacity="0.5"/>
    <path d="M400 0 L360 0 L360 3 L397 3 L397 40 L400 40 Z" fill="#c8960a" opacity="0.5"/>
    <path d="M0 900 L40 900 L40 897 L3 897 L3 860 L0 860 Z" fill="#c8960a" opacity="0.35"/>
    <path d="M400 900 L360 900 L360 897 L397 897 L397 860 L400 860 Z" fill="#c8960a" opacity="0.35"/>
    <rect x="6" y="200" width="8" height="12" fill="none" stroke="#c8960a" stroke-width="0.8" opacity="0.3"/>
    <circle cx="10" cy="225" r="4" fill="none" stroke="#c8960a" stroke-width="0.8" opacity="0.3"/>
    <line x1="10" y1="232" x2="10" y2="245" stroke="#c8960a" stroke-width="0.8" opacity="0.3"/>
    <rect x="386" y="200" width="8" height="12" fill="none" stroke="#c8960a" stroke-width="0.8" opacity="0.3"/>
    <circle cx="390" cy="225" r="4" fill="none" stroke="#c8960a" stroke-width="0.8" opacity="0.3"/>
    <line x1="390" y1="232" x2="390" y2="245" stroke="#c8960a" stroke-width="0.8" opacity="0.3"/>
  </svg>
</div>
<div id="ui">
  <div id="subtitle"></div>
  <div id="status"></div>
</div>
<div id="loading">Loading...<small>Preparing avatar</small></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script>
const sub = document.getElementById('subtitle');
const sta = document.getElementById('status');
const loading = document.getElementById('loading');
const INITIAL_AUDIO_URL = ${JSON.stringify(initialAudioUrl)};
const INITIAL_TEXT = ${JSON.stringify(initialText)};
const INITIAL_LANGUAGE = ${JSON.stringify(initialLanguage)};
const MODEL_URL = ${JSON.stringify(modelUrl)};

const DEBUG = true;
function debug(msg, obj) {
  try {
    const payload = { t: 'AVATAR_DEBUG', m: String(msg) };
    if (obj !== undefined) payload.o = obj;
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    } else {
      console.log('AVATAR_DEBUG', payload);
    }
  } catch (e) {}
}

const app = {
  scene: null, camera: null, renderer: null, avatar: null,
  clock: new THREE.Clock(),
  rafId: null, isSpeaking: false, speakingStrength: 0,
  breathPhase: Math.random() * Math.PI * 2,
  blinkPhase: 0, blinkCooldown: 2.8 + Math.random() * 2.2,
  lookPhase: Math.random() * Math.PI * 2,
  rig: {
    jawBone: null, headBone: null, neckBone: null,
    leftUpperArmBone: null, rightUpperArmBone: null,
    leftEyeBone: null, rightEyeBone: null,
    leftEyeRestX: 0, leftEyeRestY: 0,
    rightEyeRestX: 0, rightEyeRestY: 0,
    jawRestRotX: 0, headRestRotX: 0, headRestRotY: 0,
    neckRestRotX: 0, neckRestRotY: 0,
    leftArmRestQuat: null, rightArmRestQuat: null,
    blinkTargets: [], mouthTargets: [], prioritizedMouthTargets: [],
    visemeGroups: { aa: [], oh: [], ee: [], fv: [], neutral: [] },
    cheekTargets: [], armRelaxed: false
  },
  audio: { element: null, context: null, sourceNode: null, analyser: null, freqData: null, timeData: null }
};

// ─── EYE STATE ────────────────────────────────────────────────────────────────
const _eyeState = {
  targetX: 0, targetY: 0,
  currentX: 0, currentY: 0,
  saccadeTimer: 0,
  saccadeInterval: 1.8 + Math.random() * 2.5,
  microTimer: 0,
  microInterval: 0.3 + Math.random() * 0.4,
  microX: 0, microY: 0
};

function setStatus(text, subtitle) {
  sta.textContent = text || '';
  if (typeof subtitle === 'string') sub.textContent = subtitle;
}

function smoothStep(current, target, speed, dt) {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: window.devicePixelRatio <= 2, alpha: true,
    powerPreference: 'high-performance', precision: 'mediump'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = false;
  return renderer;
}

function setupLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xd8e6ff, 0x1b1410, 0.9);
  hemi.position.set(0, 2, 0); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff3df, 2.1);
  key.position.set(1.8, 2.6, 2.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0x8fb3ff, 0.75);
  fill.position.set(-2.2, 1.7, 1.4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xb6d6ff, 1.05);
  rim.position.set(0.0, 1.8, -3.2); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.28));
}

function normalizeMaterials(root) {
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      if (!mat) return;
      if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
      if (mat.emissiveMap) mat.emissiveMap.encoding = THREE.sRGBEncoding;
      if (typeof mat.needsUpdate !== 'undefined') mat.needsUpdate = true;
      if (typeof mat.roughness === 'number') mat.roughness = Math.min(1, Math.max(0.25, mat.roughness));
      if (typeof mat.metalness === 'number') mat.metalness = Math.min(0.35, mat.metalness);
    });
    obj.frustumCulled = false;
  });
}

function findBestBone(root, candidates, excludes) {
  let best = null;
  root.traverse((obj) => {
    if (!obj.isBone || !obj.name) return;
    const n = obj.name.toLowerCase();
    if (excludes.some((x) => n.includes(x))) return;
    if (!candidates.some((x) => n.includes(x))) return;
    if (!best || n.length < best.name.length) best = obj;
  });
  return best;
}

function findBonesByAny(root, includes, excludes) {
  const hits = [];
  root.traverse((obj) => {
    if (!obj.isBone || !obj.name) return;
    const n = obj.name.toLowerCase();
    if (excludes.some((x) => n.includes(x))) return;
    if (includes.some((x) => n.includes(x))) hits.push(obj);
  });
  return hits;
}

function collectMorphTargets(root) {
  const mouthPatterns = ['viseme','mouthopen','mouth_open','jawopen','jaw_open','phoneme','talk','speak','lip','aa','ah','oh','ow'];
  const blinkPatterns = ['blink','eyeclose','eye_close'];
  const cheekPatterns = ['cheek','mouthsmile','smile'];
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
    const dict = obj.morphTargetDictionary;
    Object.keys(dict).forEach((name) => {
      const key = name.toLowerCase();
      const slot = { mesh: obj, index: dict[name], name: key };
      if (mouthPatterns.some((p) => key.includes(p))) app.rig.mouthTargets.push(slot);
      if (blinkPatterns.some((p) => key.includes(p))) app.rig.blinkTargets.push(slot);
      if (cheekPatterns.some((p) => key.includes(p))) app.rig.cheekTargets.push(slot);
    });
  });
}

function prioritizeMouthTargets() {
  if (!app.rig.mouthTargets.length) return;
  const scored = app.rig.mouthTargets.map((slot) => {
    const n = slot.name; let score = 0;
    if (n.includes('jawopen') || n.includes('mouthopen') || n.includes('mouth_open')) score += 100;
    if (n.includes('viseme_aa') || n.includes('aa') || n.includes('ah')) score += 70;
    if (n.includes('viseme_oh') || n.includes('oh') || n.includes('ow')) score += 50;
    if (n.includes('sil') || n.includes('rest')) score -= 90;
    if (n.includes('wide') || n.includes('open')) score += 25;
    return { slot, score };
  });
  scored.sort((a, b) => b.score - a.score);
  app.rig.prioritizedMouthTargets = scored.map((x) => x.slot).slice(0, 4);
}

function buildVisemeGroups() {
  const groups = { aa: [], oh: [], ee: [], fv: [], neutral: [] };
  (app.rig.mouthTargets || []).forEach((slot) => {
    const n = slot.name;
    if (n.includes('aa')||n.includes('ah')||n.includes('jawopen')||n.includes('mouthopen')||n.includes('open')) groups.aa.push(slot);
    else if (n.includes('oh')||n.includes('ow')||n.includes('u')||n.includes('o')) groups.oh.push(slot);
    else if (n.includes('ee')||n.includes('ih')||n.includes('i')||n.includes('smile')||n.includes('wide')) groups.ee.push(slot);
    else if (n.includes('fv')||n.includes('ff')||n.includes('v')||n.includes('bite')) groups.fv.push(slot);
    else groups.neutral.push(slot);
  });
  app.rig.visemeGroups = groups;
}

function orientBoneToDir(bone, child, targetDir) {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  bone.getWorldPosition(a);
  child.getWorldPosition(b);
  const currentDir = b.clone().sub(a).normalize();
  if (currentDir.lengthSq() < 1e-8) return;
  const delta = new THREE.Quaternion().setFromUnitVectors(currentDir, targetDir);
  const boneWorldQ = new THREE.Quaternion();
  bone.getWorldQuaternion(boneWorldQ);
  const targetWorldQ = delta.multiply(boneWorldQ);
  const parentWorldQ = new THREE.Quaternion();
  if (bone.parent && bone.parent.matrixWorld) {
    bone.parent.getWorldQuaternion(parentWorldQ);
  }
  bone.quaternion.copy(parentWorldQ.clone().invert().multiply(targetWorldQ));
  bone.updateMatrixWorld(true);
}

function dropArmChain(upperArm) {
  if (!upperArm) return;
  const isLeft = upperArm.name.toLowerCase().includes('left');
  const restQuat = upperArm.quaternion.clone();
  const offsetX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.8);
  const offsetZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), isLeft ? -0.4 : 0.4);
  upperArm.quaternion.copy(restQuat).multiply(offsetX).multiply(offsetZ);
  upperArm.updateMatrixWorld(true);
  let forearm = null;
  upperArm.children.forEach((c) => { if (c.isBone && !forearm) forearm = c; });
  if (forearm) {
    const forearmRest = forearm.quaternion.clone();
    const forearmOffsetX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.3);
    forearm.quaternion.copy(forearmRest).multiply(forearmOffsetX);
    forearm.updateMatrixWorld(true);
    let hand = null;
    forearm.children.forEach((c) => { if (c.isBone && !hand) hand = c; });
    if (hand) {
      const handRest = hand.quaternion.clone();
      const handOffsetX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.2);
      const handOffsetZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), isLeft ? -0.15 : 0.15);
      hand.quaternion.copy(handRest).multiply(handOffsetX).multiply(handOffsetZ);
      hand.updateMatrixWorld(true);
    }
  }
}

function pickArmsBySpatialFallback(root) {
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const size   = bounds.getSize(new THREE.Vector3());
  const bones  = [];
  root.traverse((obj) => {
    if (!obj.isBone || !obj.name) return;
    const n = obj.name.toLowerCase();
    if (['spine','neck','head','leg','thigh','calf','hand','finger','forearm','twist','ik','pole'].some((x) => n.includes(x))) return;
    const p = new THREE.Vector3();
    obj.getWorldPosition(p);
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    if (Math.abs(dx) < size.x * 0.09) return;
    if (dy < -size.y * 0.25 || dy > size.y * 0.45) return;
    bones.push({ bone: obj, dx, score: Math.abs(dx) });
  });
  bones.sort((a, b) => b.score - a.score);
  let left = null, right = null;
  for (const { bone, dx } of bones) {
    if (!left  && dx < 0) left  = bone;
    if (!right && dx > 0) right = bone;
    if (left && right) break;
  }
  return { left, right };
}

function relaxArms(root) {
  if (app.rig.armRelaxed) return;
  let leftUpperArm = findBestBone(root,
    ['mixamorig:leftarm','mixamorigleftarm','upperarm_l','leftupperarm','leftarm','left_arm','arm_l','leftshoulder','shoulder_l','arm_left_shoulder','arm_left_upper'],
    ['forearm','twist','spine','hand','elbow','wrist','finger']);
  let rightUpperArm = findBestBone(root,
    ['mixamorig:rightarm','mixamorigrightarm','upperarm_r','rightupperarm','rightarm','right_arm','arm_r','rightshoulder','shoulder_r','arm_right_shoulder','arm_right_upper'],
    ['forearm','twist','spine','hand','elbow','wrist','finger']);
  if (!leftUpperArm || !rightUpperArm) {
    root.traverse((obj) => {
      if (!obj.isBone || !obj.name) return;
      const n = obj.name.toLowerCase();
      if (n.includes('wrist') || n.includes('hand') || n.includes('finger')) return;
      if (!leftUpperArm  && n.includes('arm_left'))  leftUpperArm  = obj;
      if (!rightUpperArm && n.includes('arm_right')) rightUpperArm = obj;
    });
  }
  if (!leftUpperArm || !rightUpperArm) {
    const fb = pickArmsBySpatialFallback(root);
    if (!leftUpperArm)  leftUpperArm  = fb.left;
    if (!rightUpperArm) rightUpperArm = fb.right;
  }
  if (DEBUG) debug('relaxArms found', { left: leftUpperArm?.name ?? null, right: rightUpperArm?.name ?? null });
  app.rig.leftUpperArmBone  = leftUpperArm;
  app.rig.rightUpperArmBone = rightUpperArm;
  if (leftUpperArm)  { dropArmChain(leftUpperArm);  app.rig.leftArmRestQuat  = leftUpperArm.quaternion.clone(); }
  if (rightUpperArm) { dropArmChain(rightUpperArm); app.rig.rightArmRestQuat = rightUpperArm.quaternion.clone(); }
  app.rig.armRelaxed = true;
}

const _gesture = {
  phase: 0, beatPhase: 0,
  leftTarget: new THREE.Quaternion(), rightTarget: new THREE.Quaternion(),
  activeGesture: 0, gestureTimer: 0
};

function updateArmIdle(dt, elapsed) {
  if (!app.rig.armRelaxed) return;
  const speak = app.isSpeaking ? Math.min(1, app.speakingStrength * 1.4) : 0;
  _gesture.phase     += dt * 0.55;
  _gesture.beatPhase += dt * 2.8;
  _gesture.gestureTimer += dt;
  if (speak > 0.1 && _gesture.gestureTimer > 2.5) { _gesture.activeGesture = (_gesture.activeGesture + 1) % 4; _gesture.gestureTimer = 0; }
  if (speak < 0.05) { _gesture.activeGesture = 0; _gesture.gestureTimer = 0; }
  const breathSway = Math.sin(elapsed * 0.9) * 0.012;
  const beat = Math.sin(_gesture.beatPhase) * speak * 0.055;
  const wave = Math.sin(_gesture.phase) * speak * 0.10;
  let liftL = 0, liftR = 0, swingL = 0, swingR = 0;
  switch (_gesture.activeGesture) {
    case 0: liftL = wave*0.6; liftR = wave*0.6; swingL = beat; swingR = -beat; break;
    case 1: liftL = beat*0.4; liftR = wave+beat; swingL = -beat*0.3; swingR = beat*0.5; break;
    case 2: liftL = wave+beat; liftR = beat*0.4; swingL = beat*0.5; swingR = -beat*0.3; break;
    case 3: liftL = Math.abs(wave)*0.8+beat*0.5; liftR = Math.abs(wave)*0.8+beat*0.5; swingL = -Math.abs(beat)*0.4; swingR = Math.abs(beat)*0.4; break;
  }
  if (app.rig.leftUpperArmBone && app.rig.leftArmRestQuat) {
    const rotZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), breathSway+swingL);
    const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), liftL);
    const target = app.rig.leftArmRestQuat.clone().multiply(rotZ).multiply(rotX);
    app.rig.leftUpperArmBone.quaternion.slerp(target, 1 - Math.exp(-5*dt));
  }
  if (app.rig.rightUpperArmBone && app.rig.rightArmRestQuat) {
    const rotZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), -breathSway+swingR);
    const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), liftR);
    const target = app.rig.rightArmRestQuat.clone().multiply(rotZ).multiply(rotX);
    app.rig.rightUpperArmBone.quaternion.slerp(target, 1 - Math.exp(-5*dt));
  }
}



function setupLipSync(root) {
  collectMorphTargets(root);
  prioritizeMouthTargets();
  buildVisemeGroups();
  app.rig.jawBone = findBestBone(root, ['jaw','mandible','chin'], ['armature','spine','neck','head']);
  if (!app.rig.jawBone)
    app.rig.jawBone = findBestBone(root, ['jaw','mouth','lowerlip','liplower','teeth_lower','teethlower','chin'], ['armature','spine']);
  app.rig.headBone     = findBestBone(root, ['head'],  ['armature','spine','jaw','neck']);
  app.rig.neckBone     = findBestBone(root, ['neck'],  ['armature','spine']);

  // XPS models: العيون ممكن تكون mesh مش bones - نبحث على الاتنين
  app.rig.leftEyeBone  = findBestBone(root, ['eye_l','lefteye','left_eye','eyeleft'],   ['right']);
  app.rig.rightEyeBone = findBestBone(root, ['eye_r','righteye','right_eye','eyeright'], ['left']);

  // لو مش لاقي bones، دور على أي object (mesh أو group) - XPS style
  if (!app.rig.leftEyeBone || !app.rig.rightEyeBone) {
    root.traverse((obj) => {
      if (!obj.name) return;
      const n = obj.name.toLowerCase();
      if (!app.rig.leftEyeBone) {
        if (n === 'l_eye' || n === 'eye_l' || n === 'lefteye' ||
            (n.includes('eye') && (n.includes('_l') || n.startsWith('l_') || n.endsWith('_l') || n.includes('left')))) {
          app.rig.leftEyeBone = obj;
          if (DEBUG) debug('leftEye found as mesh/obj', obj.name);
        }
      }
      if (!app.rig.rightEyeBone) {
        if (n === 'r_eye' || n === 'eye_r' || n === 'righteye' ||
            (n.includes('eye') && (n.includes('_r') || n.startsWith('r_') || n.endsWith('_r') || n.includes('right')))) {
          app.rig.rightEyeBone = obj;
          if (DEBUG) debug('rightEye found as mesh/obj', obj.name);
        }
      }
    });
  }

  // سجّل rest rotations للعيون
  app.rig.leftEyeRestX  = app.rig.leftEyeBone  ? app.rig.leftEyeBone.rotation.x  : 0;
  app.rig.leftEyeRestY  = app.rig.leftEyeBone  ? app.rig.leftEyeBone.rotation.y  : 0;
  app.rig.rightEyeRestX = app.rig.rightEyeBone ? app.rig.rightEyeBone.rotation.x : 0;
  app.rig.rightEyeRestY = app.rig.rightEyeBone ? app.rig.rightEyeBone.rotation.y : 0;

  if (DEBUG) debug('eyes final', {
    left:  app.rig.leftEyeBone  ? app.rig.leftEyeBone.name  : 'NOT FOUND',
    right: app.rig.rightEyeBone ? app.rig.rightEyeBone.name : 'NOT FOUND'
  });

  if (app.rig.jawBone)  app.rig.jawRestRotX  = app.rig.jawBone.rotation.x;
  if (app.rig.headBone) { app.rig.headRestRotX = app.rig.headBone.rotation.x; app.rig.headRestRotY = app.rig.headBone.rotation.y; }
  if (app.rig.neckBone) { app.rig.neckRestRotX = app.rig.neckBone.rotation.x; app.rig.neckRestRotY = app.rig.neckBone.rotation.y; }
  if (!app.rig.jawBone) {
    const cands = findBonesByAny(root, ['jaw','mouth','lip','chin','teeth'], ['spine','arm','leg','armature']);
    if (cands.length) { app.rig.jawBone = cands[0]; app.rig.jawRestRotX = cands[0].rotation.x; }
  }
}

function applyMorphTarget(slot, value) {
  if (!slot?.mesh?.morphTargetInfluences) return;
  const cur = slot.mesh.morphTargetInfluences[slot.index] || 0;
  slot.mesh.morphTargetInfluences[slot.index] = cur + (value - cur) * 0.35;
}

function updateLipSync(dt, elapsed) {
  const analyser = app.audio.analyser;
  let targetEnergy = 0, lowBand = 0, midBand = 0, highBand = 0;
  if (app.isSpeaking && analyser && app.audio.freqData && app.audio.timeData) {
    analyser.getByteFrequencyData(app.audio.freqData);
    analyser.getByteTimeDomainData(app.audio.timeData);
    let weighted = 0;
    for (let i = 5; i < 45 && i < app.audio.freqData.length; i++) {
      weighted += app.audio.freqData[i] * (1 + i * 0.015);
      if (i < 14) lowBand += app.audio.freqData[i];
      else if (i < 28) midBand += app.audio.freqData[i];
      else highBand += app.audio.freqData[i];
    }
    weighted /= 45; lowBand /= 9; midBand /= 14; highBand /= 17;
    let rms = 0;
    for (let i = 0; i < app.audio.timeData.length; i++) { const c = (app.audio.timeData[i]-128)/128; rms += c*c; }
    rms = Math.sqrt(rms / app.audio.timeData.length);
    targetEnergy = Math.min(1, weighted/180 + rms*0.95);
  }
  if (app.isSpeaking && targetEnergy < 0.03)
    targetEnergy = Math.max(targetEnergy, 0.06 + Math.abs(Math.sin(elapsed*11.5))*0.07);
  app.speakingStrength = smoothStep(app.speakingStrength, targetEnergy, 12, dt);
  const mouthOpen = Math.min(0.9, app.speakingStrength * 1.25);
  const visemeBlend = Math.min(1, mouthOpen * 1.2);
  const activeMouth = app.rig.prioritizedMouthTargets.length > 0 ? app.rig.prioritizedMouthTargets : app.rig.mouthTargets;
  const groups = app.rig.visemeGroups;
  const hasGroups = groups.aa.length + groups.oh.length + groups.ee.length + groups.fv.length > 0;
  if (hasGroups) {
    const l = Math.min(1,lowBand/120), m = Math.min(1,midBand/120), h = Math.min(1,highBand/120);
    groups.aa.forEach((s) => applyMorphTarget(s, visemeBlend*(0.4+l*0.8)));
    groups.oh.forEach((s) => applyMorphTarget(s, visemeBlend*(0.25+m*0.9)));
    groups.ee.forEach((s) => applyMorphTarget(s, visemeBlend*(0.2+h*0.75)));
    groups.fv.forEach((s) => applyMorphTarget(s, visemeBlend*(0.08+h*0.5)*(0.5+Math.abs(Math.sin(elapsed*13))*0.5)));
    groups.neutral.forEach((s) => applyMorphTarget(s, mouthOpen*0.18));
  } else if (activeMouth.length > 0) {
    applyMorphTarget(activeMouth[0], mouthOpen);
    for (let i=1; i<activeMouth.length; i++)
      applyMorphTarget(activeMouth[i], mouthOpen*0.35*(0.7+Math.abs(Math.sin(elapsed*(7.5+i)))*0.3));
  } else if (app.rig.jawBone) {
    app.rig.jawBone.rotation.x = app.rig.jawRestRotX + mouthOpen*(0.18+Math.abs(Math.sin(elapsed*9.5))*0.08);
  } else if (app.rig.headBone) {
    app.rig.headBone.rotation.x = smoothStep(app.rig.headBone.rotation.x, app.rig.headRestRotX + mouthOpen*0.045, 10, dt);
  }
  if (app.rig.cheekTargets.length > 0) {
    const lift = (0.08 + mouthOpen*0.18) * (0.55 + Math.sin(elapsed*8.5)*0.12);
    app.rig.cheekTargets.slice(0,2).forEach((s) => applyMorphTarget(s, lift));
  }
}

// ─── EYE MOVEMENT ─────────────────────────────────────────────────────────────
function updateEyeMovement(dt, elapsed) {
  // Saccades - قفزات طبيعية
  _eyeState.saccadeTimer += dt;
  if (_eyeState.saccadeTimer >= _eyeState.saccadeInterval) {
    _eyeState.saccadeTimer = 0;
    _eyeState.saccadeInterval = 1.2 + Math.random() * 2.5;

    // XPS mesh eyes: نسب صغيرة جداً عشان متبقاش مبرقة
    const range = app.isSpeaking ? 0.04 : 0.025;
    const rand = Math.random();

    if (rand < 0.30) {
      // تواصل بصري مع الكاميرا
      _eyeState.targetX = 0;
      _eyeState.targetY = 0;
    } else if (rand < 0.65) {
      // نظرة خفيفة يمين/شمال
      _eyeState.targetX = (Math.random() - 0.5) * range;
      _eyeState.targetY = (Math.random() - 0.5) * range * 0.35;
    } else {
      // نظرة تفكير - أكبر شوية
      _eyeState.targetX = (Math.random() - 0.5) * range * 1.5;
      _eyeState.targetY = (Math.random() - 0.5) * range * 0.5;
    }
  }

  // Micro tremor - رعشة صغيرة جداً
  _eyeState.microTimer += dt;
  if (_eyeState.microTimer >= _eyeState.microInterval) {
    _eyeState.microTimer = 0;
    _eyeState.microInterval = 0.1 + Math.random() * 0.3;
    _eyeState.microX = (Math.random() - 0.5) * 0.004;
    _eyeState.microY = (Math.random() - 0.5) * 0.002;
  }

  // Smooth interpolation
  const speed = app.isSpeaking ? 9 : 6;
  _eyeState.currentX += (_eyeState.targetX - _eyeState.currentX) * (1 - Math.exp(-speed * dt));
  _eyeState.currentY += (_eyeState.targetY - _eyeState.currentY) * (1 - Math.exp(-speed * dt));

  const finalX = _eyeState.currentX + _eyeState.microX;
  const finalY = _eyeState.currentY + _eyeState.microY;

  // تطبيق على العيون - نضيف على الـ rest rotation مش نحل محله
  if (app.rig.leftEyeBone) {
    app.rig.leftEyeBone.rotation.y = smoothStep(
      app.rig.leftEyeBone.rotation.y,
      (app.rig.leftEyeRestY || 0) + finalX,
      12, dt
    );
    app.rig.leftEyeBone.rotation.x = smoothStep(
      app.rig.leftEyeBone.rotation.x,
      (app.rig.leftEyeRestX || 0) + finalY,
      12, dt
    );
  }
  if (app.rig.rightEyeBone) {
    app.rig.rightEyeBone.rotation.y = smoothStep(
      app.rig.rightEyeBone.rotation.y,
      (app.rig.rightEyeRestY || 0) + finalX,
      12, dt
    );
    app.rig.rightEyeBone.rotation.x = smoothStep(
      app.rig.rightEyeBone.rotation.x,
      (app.rig.rightEyeRestX || 0) + finalY,
      12, dt
    );
  }
}

function updateFacialIdle(dt, elapsed) {
  // Blink - morph targets بس، مش bones عشان XPS eyes متبرقش
  app.blinkCooldown -= dt;
  if (app.blinkCooldown <= 0) {
    app.blinkPhase += dt / 0.11;
    const blink = Math.sin(Math.min(1, app.blinkPhase) * Math.PI);
    if (app.rig.blinkTargets.length > 0) {
      app.rig.blinkTargets.forEach((t) => applyMorphTarget(t, blink * 0.95));
    }
    // ملاحظة: شيلنا الـ else اللي كان بيحرك rotation العين
    // لأنه كان بيعمل البرق على XPS models
    if (app.blinkPhase >= 1) { app.blinkPhase = 0; app.blinkCooldown = 2.2 + Math.random() * 3.4; }
  } else if (app.rig.blinkTargets.length > 0) {
    app.rig.blinkTargets.forEach((t) => applyMorphTarget(t, 0));
  }

  const speakInfluence = app.isSpeaking ? app.speakingStrength : 0;
  const nod  = Math.sin(elapsed * (app.isSpeaking ? 1.8 : 0.8)) * (0.005 + speakInfluence * 0.008);
  const turn = Math.sin(elapsed * 0.42 + app.lookPhase) * 0.03;

  if (app.rig.headBone) {
    app.rig.headBone.rotation.x = smoothStep(app.rig.headBone.rotation.x, app.rig.headRestRotX + nod,  8, dt);
    app.rig.headBone.rotation.y = smoothStep(app.rig.headBone.rotation.y, app.rig.headRestRotY + turn, 8, dt);
  }
  if (app.rig.neckBone) {
    app.rig.neckBone.rotation.x = smoothStep(app.rig.neckBone.rotation.x, app.rig.neckRestRotX + nod*0.35,  6, dt);
    app.rig.neckBone.rotation.y = smoothStep(app.rig.neckBone.rotation.y, app.rig.neckRestRotY + turn*0.4,  6, dt);
  }
}
function fitAvatarToCamera(root) {
  const box    = new THREE.Box3().setFromObject(root);
  const size   = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  const scale = 1.9 / Math.max(0.01, size.y);
  root.scale.setScalar(scale);
  const groundedBox = new THREE.Box3().setFromObject(root);
  root.position.y -= groundedBox.min.y;
  const h = groundedBox.getSize(new THREE.Vector3()).y;
  
  app.camera.position.set(0, h * 0.8, h * 1.30); 
  app.camera.fov = 46;
  app.camera.near = 0.071; app.camera.far = 100;
  app.camera.updateProjectionMatrix();
app.camera.lookAt(0, h * 0.60, 0);               // من 0.45 → 0.52
}

async function loadAvatar() {
  if (!MODEL_URL?.trim()) {
    setStatus('','');
    loading.innerHTML = 'Model not found<small>Please check avatar asset</small>'; return;
  }
  if (!THREE.GLTFLoader) {
    setStatus('','');
    loading.innerHTML = 'Viewer setup failed<small>GLTFLoader missing</small>'; return;
  }
  const loader = new THREE.GLTFLoader();
  let blobUrl = null;
  try {
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error('Model fetch failed: ' + res.status);
    blobUrl = URL.createObjectURL(await res.blob());
    const gltf = await new Promise((res, rej) => loader.load(blobUrl, res, undefined, rej));
    app.avatar = gltf.scene;
    app.scene.add(app.avatar);
    normalizeMaterials(app.avatar);
    fitAvatarToCamera(app.avatar);
    setupLipSync(app.avatar);
    relaxArms(app.avatar);
    loading.style.display = 'none';
    setStatus('','');
  } catch (err) {
    setStatus('','');
    loading.innerHTML = 'Failed to load avatar<small>' + String(err.message||err) + '</small>';
  } finally {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }
}

function ensureAudioGraph() {
  if (!app.audio.context) app.audio.context = new (window.AudioContext||window.webkitAudioContext)();
  if (!app.audio.analyser) {
    app.audio.analyser = app.audio.context.createAnalyser();
    app.audio.analyser.fftSize = 1024;
    app.audio.analyser.smoothingTimeConstant = 0.84;
    app.audio.freqData = new Uint8Array(app.audio.analyser.frequencyBinCount);
    app.audio.timeData = new Uint8Array(app.audio.analyser.fftSize);
    app.audio.analyser.connect(app.audio.context.destination);
  }
}

function disconnectAudioGraph() {
  if (app.audio.sourceNode) { try { app.audio.sourceNode.disconnect(); } catch(_){} app.audio.sourceNode = null; }
  if (app.audio.element) {
    try { app.audio.element.pause(); app.audio.element.onended = null; app.audio.element.src = ''; } catch(_){}
    app.audio.element = null;
  }
}

async function startAudio(url) {
  disconnectAudioGraph();
  setStatus('','');
  app.audio.element = new Audio(url);
  app.audio.element.crossOrigin = 'anonymous';
  app.audio.element.playsInline = true;
  try {
    ensureAudioGraph();
    if (app.audio.context.state === 'suspended') await app.audio.context.resume();
    app.audio.sourceNode = app.audio.context.createMediaElementSource(app.audio.element);
    app.audio.sourceNode.connect(app.audio.analyser);
  } catch(_) { app.audio.analyser = null; app.audio.freqData = null; app.audio.timeData = null; }
  app.isSpeaking = true;
  app.audio.element.onended = stopAudio;
  app.audio.element.play().catch(() => { app.isSpeaking = false; setStatus('',''); });
}

function stopAudio() {
  app.isSpeaking = false; app.speakingStrength = 0;
  disconnectAudioGraph();
  setStatus('','');
}

function animate() {
  app.rafId = requestAnimationFrame(animate);
  if (!app.renderer||!app.scene||!app.camera) return;
  const dt = Math.min(0.05, app.clock.getDelta());
  const elapsed = app.clock.elapsedTime;
  if (app.avatar) {
    app.breathPhase += dt * 1.3;
    app.avatar.position.y = smoothStep(app.avatar.position.y, Math.sin(app.breathPhase)*0.008+0.01, 5.5, dt);
    updateLipSync(dt, elapsed);
    updateEyeMovement(dt, elapsed);
    updateFacialIdle(dt, elapsed);
    updateArmIdle(dt, elapsed);
  }
  app.renderer.render(app.scene, app.camera);
}

function onWindowResize() {
  if (!app.camera||!app.renderer) return;
  app.camera.aspect = window.innerWidth/window.innerHeight;
  app.camera.updateProjectionMatrix();
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  app.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
}

function handleIncomingMessage(ev) {
  try {
    const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
    if (d?.type === 'PLAY_AUDIO' && d.audioUrl) startAudio(d.audioUrl);
    if (d?.type === 'STOP_AUDIO') stopAudio();
  } catch(_){}
}

function init() {
  app.scene = new THREE.Scene();
  app.scene.background = null;
  app.camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.01, 100);
  app.renderer = createRenderer();
  setupLighting(app.scene);
  document.body.appendChild(app.renderer.domElement);
  window.addEventListener('resize', onWindowResize, { passive: true });
  window.addEventListener('message', handleIncomingMessage);
  document.addEventListener('message', handleIncomingMessage);
  loadAvatar().then(() => animate());
}

init();
if (INITIAL_AUDIO_URL) setTimeout(() => startAudio(INITIAL_AUDIO_URL, INITIAL_TEXT||'', INITIAL_LANGUAGE||'en'), 500);
</script>
</body>
</html>
`;

export default function VirtualGuide() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [modelUrl, setModelUrl] = useState("");

  useEffect(() => {
    const loadModel = async () => {
      try {
        const asset = Asset.fromModule(
          require("../assets/models/face_rigged_male_09.glb"),
        );
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setModelUrl(`data:model/gltf-binary;base64,${base64Data}`);
      } catch (error) {
        console.error("Model load error:", error);
      }
    };
    loadModel();
  }, []);

  const audioUrl = params?.audioUrl
    ? decodeURIComponent(params.audioUrl)
    : null;
  const guideText = params?.text ? decodeURIComponent(params.text) : "";
  const language = params?.language
    ? decodeURIComponent(params.language)
    : "en";

  return (
    <View style={styles.container}>
      <WebView
        key={modelUrl}
        originWhitelist={["*"]}
        source={{
          html: buildAvatarHTML(audioUrl, guideText, language, modelUrl),
        }}
        javaScriptEnabled={true}
        javaScriptEnabledAndroid={true}
        style={{ flex: 1, backgroundColor: "transparent" }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.t === "AVATAR_DEBUG")
              console.log("[Avatar]", msg.m, msg.o ?? "");
          } catch (_) {
            console.log("WebView:", event.nativeEvent.data);
          }
        }}
        onError={(error) => console.error("WebView error:", error)}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.backIcon}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0800", position: "relative" },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 20,
  },
  backIcon: {
    color: "#f5e8cb",
    fontSize: 16,
    fontWeight: "500",
  },
});
