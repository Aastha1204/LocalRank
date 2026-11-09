"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Full WebGL hero: floating phone with the WhatsApp review message, orbiting gold stars and a growing 3D bar chart. */

function starShape(outer: number, inner: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function screenTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0b141a"; g.fillRect(0, 0, 512, 1024);
  g.fillStyle = "#075e54"; g.fillRect(0, 0, 512, 120);
  g.fillStyle = "#f2a33a"; g.beginPath(); g.arc(60, 70, 32, 0, 7); g.fill();
  g.fillStyle = "#1f2340"; g.font = "bold 34px sans-serif"; g.fillText("T", 49, 82);
  g.fillStyle = "#fff"; g.font = "bold 30px sans-serif"; g.fillText("Tandoor Tales", 112, 66);
  g.fillStyle = "#b7e4dc"; g.font = "22px sans-serif"; g.fillText("Business account", 112, 98);
  // chat bubble
  g.fillStyle = "#005c4b";
  g.beginPath(); g.roundRect(34, 180, 430, 360, 22); g.fill();
  g.fillStyle = "#e9edef"; g.font = "28px sans-serif";
  ["Hi Aarav 👋 Thank you for", "dining with us at Tandoor", "Tales today! We hope you", "loved the meal. Would you", "share a quick review? It", "takes 20 seconds ⭐"].forEach((t, i) => g.fillText(t, 58, 236 + i * 42));
  g.fillStyle = "#8696a0"; g.font = "20px sans-serif"; g.fillText("Reply STOP to stop messages", 58, 520);
  // button
  g.fillStyle = "#103529"; g.beginPath(); g.roundRect(34, 556, 430, 78, 22); g.fill();
  g.fillStyle = "#53bdeb"; g.font = "bold 28px sans-serif"; g.fillText("↗  Leave a Google review", 80, 606);
  // stars
  g.font = "64px sans-serif"; g.fillStyle = "#fbbc04"; g.fillText("★★★★★", 90, 800);
  g.fillStyle = "#8696a0"; g.font = "24px sans-serif"; g.fillText("4.4 → 4.7  ·  64 → 131 reviews", 62, 860);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export default function Scene3D({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // no WebGL: CSS fallback behind the canvas stays visible
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x14172e, 0.035);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.4, 11);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 6); scene.add(key);
    const rim = new THREE.PointLight(0x3cc4b6, 60, 30); rim.position.set(-6, 2, -2); scene.add(rim);
    const warm = new THREE.PointLight(0xf2a33a, 60, 30); warm.position.set(6, -2, 3); scene.add(warm);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

    // ---- phone
    const phone = new THREE.Group();
    const bodyGeo = track(new THREE.ExtrudeGeometry(roundedRect(2.3, 4.6, 0.38), { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4, curveSegments: 16 }));
    const body = new THREE.Mesh(bodyGeo, track(new THREE.MeshStandardMaterial({ color: 0x0d0f1d, metalness: 0.85, roughness: 0.28 })));
    body.position.z = -0.11;
    phone.add(body);
    const tex = track(screenTexture());
    const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(2.1, 4.2)), new THREE.MeshBasicMaterial({ map: tex }));
    screen.position.z = 0.16;
    phone.add(screen);
    phone.position.set(0, 0, 0);
    scene.add(phone);

    // ---- stars
    const starGeo = track(new THREE.ExtrudeGeometry(starShape(0.5, 0.22), { depth: 0.14, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 }));
    starGeo.center();
    const starMat = track(new THREE.MeshStandardMaterial({ color: 0xfbbc04, emissive: 0xb86f0a, emissiveIntensity: 0.55, metalness: 0.6, roughness: 0.25 }));
    const stars: { m: THREE.Mesh; a: number; r: number; y: number; s: number; sp: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(starGeo, starMat);
      scene.add(m);
      stars.push({ m, a: (i / 14) * Math.PI * 2, r: 3.3 + (i % 3) * 0.55, y: (Math.random() - 0.5) * 4.2, s: 0.5 + Math.random() * 0.7, sp: 0.18 + Math.random() * 0.22 });
    }

    // ---- 3D bar chart (review count growth), right side
    const chart = new THREE.Group();
    const bars: { m: THREE.Mesh; h: number }[] = [];
    const barGeo = track(new THREE.BoxGeometry(0.28, 1, 0.28));
    const N = 12;
    for (let i = 0; i < N; i++) {
      const h = 0.35 + (i / (N - 1)) ** 1.5 * 3 + Math.sin(i * 1.7) * 0.08;
      const mat = track(new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.47 - i * 0.012, 0.65, 0.5), metalness: 0.3, roughness: 0.35 }));
      const m = new THREE.Mesh(barGeo, mat);
      m.position.x = i * 0.42;
      m.scale.y = 0.01;
      chart.add(m);
      bars.push({ m, h });
    }
    const base = new THREE.Mesh(track(new THREE.BoxGeometry(N * 0.42 + 0.3, 0.06, 0.7)), track(new THREE.MeshStandardMaterial({ color: 0x2a2f5a, metalness: 0.5, roughness: 0.4 })));
    base.position.set((N - 1) * 0.21, -0.03, 0);
    chart.add(base);
    chart.position.set(2.8, -2.3, 0.5);
    chart.rotation.y = -0.5;
    scene.add(chart);

    // ---- floating bubbles / particles
    const pCount = 220;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) { pPos[i * 3] = (Math.random() - 0.5) * 22; pPos[i * 3 + 1] = (Math.random() - 0.5) * 12; pPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2; }
    const pGeo = track(new THREE.BufferGeometry()); pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pts = new THREE.Points(pGeo, track(new THREE.PointsMaterial({ color: 0x7fe9dc, size: 0.05, transparent: true, opacity: 0.7 })));
    scene.add(pts);

    // ---- WhatsApp-send burst (fired by the demo form)
    const bubbleGeo = track(new THREE.SphereGeometry(0.16, 16, 16));
    const bubbleMat = track(new THREE.MeshStandardMaterial({ color: 0x25d366, emissive: 0x128c7e, emissiveIntensity: 0.8 }));
    const bubbles: { m: THREE.Mesh; v: THREE.Vector3; life: number }[] = [];
    let boost = 0;
    const onSend = () => {
      boost = 1;
      for (let i = 0; i < 18; i++) {
        const m = new THREE.Mesh(bubbleGeo, bubbleMat);
        m.position.set(0, -1.2, 0.4);
        scene.add(m);
        bubbles.push({ m, v: new THREE.Vector3((Math.random() - 0.3) * 0.09, 0.03 + Math.random() * 0.07, (Math.random() - 0.2) * 0.07), life: 1 });
      }
    };
    window.addEventListener("rb-send", onSend);

    // ---- sizing, pointer, scroll
    const mouse = { x: 0, y: 0 }, sm = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; };
    window.addEventListener("pointermove", onMove);
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const shift = w >= 1000 ? 0.2 : w >= 700 ? 0.16 : 0;
      if (shift) camera.setViewOffset(w, h, -w * shift, 0, w, h); else camera.clearViewOffset();
      const narrow = w < 700;
      camera.position.z = narrow ? 15 : 11;
      chart.visible = !narrow || w > 480;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05);
      void dt;
      sm.x += (mouse.x - sm.x) * 0.06; sm.y += (mouse.y - sm.y) * 0.06;
      boost *= 0.94;
      const grow = reduce ? 1 : Math.min(1, Math.max(0, (t - 0.4) / 2.2));
      phone.position.y = Math.sin(t * 0.9) * 0.14;
      phone.rotation.y = sm.x * 0.45 + Math.sin(t * 0.4) * 0.08 + boost * Math.sin(t * 22) * 0.04;
      phone.rotation.x = -sm.y * 0.2;
      phone.rotation.z = Math.sin(t * 0.6) * 0.03;
      stars.forEach((s, i) => {
        const a = s.a + t * s.sp;
        s.m.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.8 + i) * 0.25, Math.sin(a) * s.r * 0.55 - 0.8);
        s.m.rotation.y = t * (0.8 + s.sp) + i;
        s.m.rotation.z = Math.sin(t + i) * 0.3;
        const k = s.s * (1 + boost * 0.6);
        s.m.scale.setScalar(k);
      });
      bars.forEach((b, i) => {
        const p = Math.min(1, Math.max(0, grow * 1.6 - i * 0.07));
        const e = 1 - Math.pow(1 - p, 3);
        b.m.scale.y = Math.max(0.01, b.h * e);
        b.m.position.y = b.m.scale.y / 2;
      });
      chart.rotation.y = -0.5 + sm.x * 0.2;
      pts.rotation.y = t * 0.02 + sm.x * 0.05;
      pts.position.y = sm.y * -0.3;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.m.position.add(b.v); b.v.y *= 0.985;
        b.life -= 0.012;
        b.m.scale.setScalar(Math.max(0.01, b.life));
        if (b.life <= 0) { scene.remove(b.m); bubbles.splice(i, 1); }
      }
      camera.position.x = sm.x * 0.5;
      camera.position.y = 0.4 - sm.y * 0.3;
      camera.lookAt(0.6, -0.2, 0);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("rb-send", onSend);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect(); io.disconnect();
      bubbles.forEach((b) => scene.remove(b.m));
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={className} aria-hidden="true" />;
}
