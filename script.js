// 3 Schritte: (1) Tippen -> Rodeo startet, (2) Streichen -> Fortschritt füllen, (3) Tippen -> Code enthüllen
const GIFT_CODE = "WUNSCHGUTSCHEIN-20EURO"; // <- HIER ändern

const scene = document.getElementById("scene");
const tapBtn = document.getElementById("tapBtn");
const stepText = document.getElementById("stepText");
const hintText = document.getElementById("hintText");
const barFill = document.getElementById("barFill");
const reveal = document.getElementById("reveal");
const codeText = document.getElementById("codeText");
const restart = document.getElementById("restart");
const flakes = document.getElementById("flakes");

codeText.textContent = GIFT_CODE;

let step = 1;
let progress = 0;
let isDown = false;
let lastX = 0, lastY = 0;

// Snowflakes (simple, light)
const W = 900, H = 600;
const flakeCount = 70;
const flakeState = [];
function makeFlake(){
  const r = 2 + Math.random()*4;
  const x = Math.random()*W;
  const y = Math.random()*H;
  const s = 0.6 + Math.random()*1.8;
  const o = 0.35 + Math.random()*0.55;

  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", x);
  c.setAttribute("cy", y);
  c.setAttribute("r", r);
  c.setAttribute("fill", `rgba(255,255,255,${o.toFixed(2)})`);
  flakes.appendChild(c);
  flakeState.push({c, x, y, s, drift:(Math.random()*1.2-0.6)});
}
for(let i=0;i<flakeCount;i++) makeFlake();

let lastT = performance.now();
function tick(t){
  const dt = Math.min(0.033, (t-lastT)/1000);
  lastT = t;
  for(const f of flakeState){
    f.y += (35*f.s)*dt;
    f.x += (18*f.drift)*dt;
    if(f.y > H+10){ f.y = -10; f.x = Math.random()*W; }
    if(f.x < -10) f.x = W+10;
    if(f.x > W+10) f.x = -10;
    f.c.setAttribute("cx", f.x.toFixed(1));
    f.c.setAttribute("cy", f.y.toFixed(1));
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function setStep(n){
  step = n;
  if(step === 1){
    scene.classList.remove("is-rodeo","show-gift");
    progress = 0;
    barFill.style.width = "0%";
    stepText.textContent = "Schritt 1/3: Tippe die Kuh an 🤠";
    hintText.textContent = "Dann geht der Rodeo los…";
    tapBtn.textContent = "Tippen zum Starten";
    tapBtn.hidden = false;
  }
  if(step === 2){
    scene.classList.add("is-rodeo");
    stepText.textContent = "Schritt 2/3: Streiche wild übers Bild (Rodeo-Training) 👉";
    hintText.textContent = "Je mehr du streichst, desto näher kommt das Geschenk.";
    tapBtn.hidden = true;
  }
  if(step === 3){
    scene.classList.add("show-gift");
    stepText.textContent = "Schritt 3/3: Tippe zum Enthüllen 🎁";
    hintText.textContent = "Letzter Schritt…";
    tapBtn.textContent = "Jetzt öffnen";
    tapBtn.hidden = false;
  }
}

function showReveal(){ reveal.hidden = false; }
function hideReveal(){ reveal.hidden = true; }

tapBtn.addEventListener("click", () => {
  if(step === 1){ setStep(2); return; }
  if(step === 3){ showReveal(); }
});

restart.addEventListener("click", () => {
  hideReveal();
  setStep(1);
});

scene.addEventListener("pointerdown", (e) => {
  if(step !== 2) return;
  isDown = true;
  lastX = e.clientX; lastY = e.clientY;
  scene.setPointerCapture?.(e.pointerId);
});
scene.addEventListener("pointermove", (e) => {
  if(step !== 2 || !isDown) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  const dist = Math.sqrt(dx*dx + dy*dy);
  progress += dist;

  const pct = clamp((progress / 1000) * 100, 0, 100);
  barFill.style.width = pct.toFixed(0) + "%";
  if(pct >= 100) setStep(3);
});
scene.addEventListener("pointerup", () => { isDown = false; });
scene.addEventListener("pointercancel", () => { isDown = false; });

setStep(1);
