/* =====================================================================
   JanVaani AI — front-end behaviour
   1. Full-page blurred photo background (slideshow, 2 s per photo)
   2. "Talk to Saathi" chatbot (scripted demo)
   ===================================================================== */

/* ---------------------------------------------------------------------
   CONFIG — put your own photos here.
   Save monument photos inside the /images folder and list them, e.g.
     const API_BASE = "https://janvanni-backend.onrender.com";
const BG_IMAGES = [
  "assets/monuments/monument-01.jpg",
  "assets/monuments/monument-02.jpg",
  "assets/monuments/monument-03.jpg",
  "assets/monuments/monument-04.jpg"
];
   Photos added with the "Add photos" button are kept in the browser
   (localStorage) and shown after these.
--------------------------------------------------------------------- */
const BG_IMAGES = [
  // Direct image files — do not use Special:FilePath redirects here.
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Jahangir_Mahal%2C_Orchha%2C_Madhya_Pradesh%2C_India.jpg/1280px-Jahangir_Mahal%2C_Orchha%2C_Madhya_Pradesh%2C_India.jpg",
  "https://www.guiadasemana.com.br/contentFiles/image/2020/06/FEA/65762_shutterstock-295945166-1.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Khajuraho_Temple-Madhya_Pradesh-IMG_8473.jpg/1280px-Khajuraho_Temple-Madhya_Pradesh-IMG_8473.jpg",
  "https://images.moondeveloper.com/attractions/2025/01/25/67948ee31baca.jpg",
  "https://static.toiimg.com/img/65686862/Master.jpg"
];
const SLIDE_MS   = 5000;   // time each photo stays on screen
const MAX_UPLOAD = 24;     // max number of browser-stored photos
const STORE_KEY  = "jv_photos";

const $ = (id) => document.getElementById(id);

/* =====================================================================
   1. BACKGROUND PHOTO SLIDESHOW
   ===================================================================== */
let uploaded = [];                       // photos added by the user
try { uploaded = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch (e) {}

let current = 0;
let bgLayer = 0;
let manualPause = false;
let hoverPause  = false;                 // pointer over the control bar

const allPhotos = () => BG_IMAGES.concat(uploaded);

function renderBackground() {
  const list = allPhotos();
  const bg = $("bg");
  if (!bg) return;
  if (!list.length) { bg.innerHTML = ""; return; }
  if (!bg.children.length) bg.innerHTML = `<img class="bg-layer" alt=""><img class="bg-layer" alt="">`;
  const nextIndex = bgLayer === 0 ? 1 : 0;
  const nextLayer = bg.children[nextIndex];
  const oldLayer = bg.children[bgLayer];
  nextLayer.onload = () => { nextLayer.classList.add("bg-visible"); oldLayer.classList.remove("bg-visible"); bgLayer = nextIndex; };
  nextLayer.onerror = () => { nextLayer.classList.remove("bg-visible"); bgLayer = nextIndex; };
  nextLayer.src = list[current % list.length];
  nextLayer.classList.add("bg-visible");
}

/* Save to localStorage; if the quota is full, drop the oldest photos. */
function saveUploads() {
  while (uploaded.length) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(uploaded)); return; }
    catch (e) { uploaded.shift(); }
  }
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
}

/* Read an image file, shrink it (max 1200 px wide) and return a JPEG data URL. */
function loadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1200 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => resolve(null);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Auto-advance */
setInterval(() => {
  const list = allPhotos();
  if (!manualPause && !hoverPause && list.length > 1) {
    current = (current + 1) % list.length;
    renderBackground();
  }
}, SLIDE_MS);

/* Control bar (Add / Remove / Pause) — optional.
   It only runs if a <div id="tbar"> exists in index.html; the page
   ships without it, so photos come from BG_IMAGES only. */
if ($("tbar")) {
  /* Control bar */
  $("tbar").onpointerenter = () => (hoverPause = true);
  $("tbar").onpointerleave = () => (hoverPause = false);

  $("pz").onclick = () => {
    manualPause = !manualPause;
    $("pz").textContent = manualPause ? "▶ Play" : "⏸ Pause";
  };

  $("add").onclick = () => $("file").click();

  $("file").onchange = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const added = (await Promise.all(files.map(loadImage))).filter(Boolean);
    uploaded = uploaded.concat(added).slice(-MAX_UPLOAD);
    current = BG_IMAGES.length;            // jump to the first new photo
    saveUploads();
    renderBackground();
    e.target.value = "";
  };

  /* Remove the photo currently shown (only browser-added photos can be
     removed here; photos listed in BG_IMAGES are edited in this file). */
  $("del").onclick = () => {
    const list = allPhotos();
    if (!list.length) return;
    const index = current % list.length;
    if (index < BG_IMAGES.length) return;
    uploaded.splice(index - BG_IMAGES.length, 1);
    current = 0;
    saveUploads();
    renderBackground();
  };
}

renderBackground();

/* =====================================================================
   2. TALK TO SAATHI — scripted chatbot demo
   Recognises four problem types, asks for the ward, then "files" a
   complaint with an ID, priority, department and expected time.
   (No data is sent anywhere. Connect a backend to make it real.)
   ===================================================================== */
(() => {
  const msgs  = $("msgs");
  const input = $("ci");

  const CATEGORIES = [
    { test: /गड्ढ|सड़क|सडक|road|pothole|khadda/i,
      name: "Road / Pothole", hindi: "सड़क",
      dept: "PWD & Nagar Nigam Roads", priority: "High", hours: 18 },
    { test: /पानी|जल|नल|water|नाली|drain|bhar/i,
      name: "Waterlogging / Water", hindi: "जल",
      dept: "Water Supply & Drainage", priority: "High", hours: 12 },
    { test: /कचरा|कूड़ा|गंदगी|garbage|waste|kachra/i,
      name: "Garbage / Sanitation", hindi: "स्वच्छता",
      dept: "Sanitation Department", priority: "Medium", hours: 24 },
    { test: /बिजली|लाइट|light|electric|bijli/i,
      name: "Streetlight / Electricity", hindi: "बिजली",
      dept: "Electricity Board", priority: "Medium", hours: 20 },
  ];

  let step = 0;          // 0 = ask problem, 1 = ask ward, 2 = done
  let category = null;

  /* Add a chat bubble ("bot" or "me") */
  function addBubble(text, who) {
    const bubble = document.createElement("div");
    bubble.className = "b " + who;
    bubble.textContent = text;
    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* Quick-reply chips under the conversation */
  function showChips(labels) {
    const box = $("qr");
    box.innerHTML = "";
    labels.forEach((label) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.onclick = () => send(label);
      box.appendChild(btn);
    });
  }

  function startChat() {
    msgs.innerHTML = "";
    step = 0;
    category = null;
    addBubble(
      "नमस्ते! मैं साथी हूँ। आप अपनी समस्या अपनी भाषा में बताइए।\n" +
      "Hi! I'm Saathi. Tell me what's wrong in your area.", "bot");
    showChips(["सड़क में बड़ा गड्ढा", "हमार गली मा पानी भर गवा है",
               "Garbage not collected", "Streetlight not working"]);
  }

  async function send(text) {
    text = text.trim();
    if (!text) return;
    addBubble(text, "me");
    input.value = "";
    $("qr").innerHTML = "";

    if (step === 0) {
      try {
        const res = await fetch(API_BASE + "/api/v1/voice/respond", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({text, language: "hi-IN"})
        });
        if (res.ok) {
          const data = await res.json();
          addBubble(data.reply_text || "साथी ने आपकी बात समझ ली।", "bot");
        }
      } catch (e) {
        // Keep the local demo fallback below if the API is temporarily unavailable.
      }
    }

    setTimeout(() => {
      if (step === 0) {
        category = CATEGORIES.find((c) => c.test.test(text));
        if (!category) {
          addBubble(
            "मैं आपकी मदद करना चाहती हूँ। क्या समस्या सड़क, पानी, कचरे या बिजली से जुड़ी है?\n" +
            "Is it about road, water, garbage or streetlight?", "bot");
          showChips(["सड़क", "पानी", "कचरा", "बिजली"]);
          return;
        }
        step = 1;
        addBubble(
          `समझ गई: ${category.name} (${category.hindi}).\n` +
          "यह किस इलाके या वार्ड में है? Which area or ward?", "bot");
        showChips(["विजय नगर, इंदौर", "वार्ड 22", "Use my location"]);

      } else if (step === 1) {
        step = 2;
        const id = "JV-IND-" + (1000 + Math.floor(Math.random() * 8999));
        addBubble(
          "✅ शिकायत दर्ज हो गई\n\n" +
          `ID: ${id}\n` +
          `Subject: ${category.name}\n` +
          `Location: ${text}\n` +
          `Priority: ${category.priority}\n` +
          `Routed to: ${category.dept}\n` +
          `Expected action: ~${category.hours} hrs\n\n` +
          'आप "Track" से स्थिति देख सकते हैं।', "bot");
        showChips(["नई शिकायत / New complaint"]);

      } else {
        startChat();          // any message after completion restarts
      }
    }, 450);
  }

  /* Open the chat panel. It opens automatically on page load and the
     "Talk now" button re-opens / focuses it. */
  function openChat(focus) {
    const chat = $("chat");
    chat.classList.add("on");
    if (!msgs.children.length) startChat();
    if (focus) {
      input.focus();
      chat.scrollIntoView({ block: "nearest" });
    }
  }

  $("talk").onclick = () => openChat(true);
  openChat(false);            // banner is already open when the page loads

  /* ✕ closes the chat panel (Esc works too); "Talk now" opens it again. */
  const closeChat = () => $("chat").classList.remove("on");
  $("cx").onclick = closeChat;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });

  $("send").onclick = () => send(input.value);
  input.onkeydown = (e) => { if (e.key === "Enter") send(input.value); };

  /* Voice input (Chrome / Edge / Safari). Hindi by default. */
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = $("mc");
  let rec = null, listening = false;

  function listen() {
    if (!Recognition) {
      addBubble("Voice input is not supported in this browser. Please use Chrome or type.", "bot");
      return;
    }
    if (listening) { rec.stop(); return; }          // tap again = stop

    rec = new Recognition();
    rec.lang = "hi-IN";                              // use "en-IN" for English
    rec.interimResults = true;                       // show words while speaking

    rec.onstart = () => {
      listening = true;
      mic.classList.add("rec");
      input.placeholder = "Listening… बोलिए";
    };
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join("");
      input.value = text;                            // live text in the box
      if (e.results[e.results.length - 1].isFinal) send(text);
    };
    rec.onerror = (e) => addBubble(
      e.error === "not-allowed"
        ? "Please allow microphone access in the browser."
        : "Couldn't hear you. Try again or type.", "bot");
    rec.onend = () => {
      listening = false;
      mic.classList.remove("rec");
      input.placeholder = "Type or speak… यहाँ लिखें या बोलें";
    };
    try { rec.start(); } catch (e) {}
  }

  mic.onclick = listen;

  /* Used by the hero button, the orb and the report card */
  window.startVoiceComplaint = () => { openChat(true); listen(); };
})();

/* =====================================================================
   3. UPLOAD VISUAL EVIDENCE
   The citizen adds a photo, picks the issue type and (optionally) adds
   GPS. Timestamp comes from the file. This demo does not run image
   analysis — hook a vision model / backend here to detect the issue.
   ===================================================================== */
const ISSUES = ["Road / Pothole", "Waterlogging", "Garbage", "Streetlight"];

(() => {
  const dz = $("dz"), input = $("ev"), out = $("evout");
  let issue = ISSUES[0], gps = null, file = null;

  function drawEvidence() {
    if (!file) { out.innerHTML = ""; return; }
    out.innerHTML =
      `<img class="ev-img" alt="Uploaded evidence" src="${URL.createObjectURL(file)}">` +
      `<div class="chipset" id="ev-issue">` +
        ISSUES.map((n) => `<button type="button" class="${n === issue ? "on" : ""}">${n}</button>`).join("") +
      `</div>` +
      `<div class="ev-meta">` +
        `🕒 ${new Date(file.lastModified || Date.now()).toLocaleString()}<br>` +
        `📄 ${file.name} · ${Math.round(file.size / 1024)} KB<br>` +
        `📍 ${gps ? gps.lat.toFixed(5) + ", " + gps.lon.toFixed(5) : "GPS not added"}` +
      `</div>` +
      `<div class="fa"><button class="mini" id="ev-gps" type="button">📍 Add GPS</button>` +
      `<button class="mini" id="ev-clear" type="button">✕ Remove</button></div>` +
      `<div class="ev-ok">✔ Evidence attached — ${issue}</div>`;

    $("ev-issue").onclick = (e) => {
      const b = e.target.closest("button");
      if (b) { issue = b.textContent; drawEvidence(); }
    };
    $("ev-gps").onclick = () => {
      if (!navigator.geolocation) { out.insertAdjacentText("beforeend", " GPS not supported."); return; }
      navigator.geolocation.getCurrentPosition(
        (p) => { gps = { lat: p.coords.latitude, lon: p.coords.longitude }; drawEvidence(); },
        () => { $("ev-gps").textContent = "Location blocked"; });
    };
    $("ev-clear").onclick = () => { file = null; gps = null; input.value = ""; drawEvidence(); };
  }

  function setFile(f) {
    if (f && f.type.startsWith("image/")) { file = f; drawEvidence(); }
  }

  dz.onclick = () => input.click();
  input.onchange = () => setFile(input.files[0]);
  dz.ondragover = (e) => { e.preventDefault(); dz.classList.add("over"); };
  dz.ondragleave = () => dz.classList.remove("over");
  dz.ondrop = (e) => {
    e.preventDefault();
    dz.classList.remove("over");
    setFile(e.dataTransfer.files[0]);
  };
})();

/* =====================================================================
   4. FIND THE RIGHT AUTHORITY
   Issue type + city -> who is responsible and where to escalate.
   "Use my location" picks the nearest listed city. Demo data: confirm
   names with the local body before going live.
   ===================================================================== */
(() => {
  const CITIES = [
    { n: "Indore",   body: "Indore Municipal Corporation",   lat: 22.7196, lon: 75.8577, discom: "MP Paschim Kshetra Vidyut Vitaran Co." },
    { n: "Bhopal",   body: "Bhopal Municipal Corporation",   lat: 23.2599, lon: 77.4126, discom: "MP Madhya Kshetra Vidyut Vitaran Co." },
    { n: "Ujjain",   body: "Ujjain Municipal Corporation",   lat: 23.1765, lon: 75.7885, discom: "MP Paschim Kshetra Vidyut Vitaran Co." },
    { n: "Gwalior",  body: "Gwalior Municipal Corporation",  lat: 26.2183, lon: 78.1828, discom: "MP Madhya Kshetra Vidyut Vitaran Co." },
    { n: "Jabalpur", body: "Jabalpur Municipal Corporation", lat: 23.1815, lon: 79.9864, discom: "MP Poorv Kshetra Vidyut Vitaran Co." },
    { n: "Rewa",     body: "Rewa Municipal Corporation",     lat: 24.5362, lon: 81.3037, discom: "MP Poorv Kshetra Vidyut Vitaran Co." },
    { n: "Other town / village", body: "Local Nagar Palika / Nagar Parishad / Gram Panchayat", discom: "Regional Vidyut Vitaran Co." },
  ];
  const TOPICS = {
    "Road / Pothole": { dept: "Roads & Engineering Dept", up: () => "PWD (state highways & major roads)", eta: "18 hrs" },
    "Waterlogging":   { dept: "Water Works & Drainage Dept", up: () => "Public Health Engineering (PHE) Dept", eta: "12 hrs" },
    "Garbage":        { dept: "Sanitation & Solid Waste Dept", up: () => "Health Officer → Municipal Commissioner", eta: "24 hrs" },
    "Streetlight":    { dept: "Electrical Dept (streetlights)", up: (c) => c.discom + " (for power faults)", eta: "20 hrs" },
  };

  let topic = "Road / Pothole";
  const cats = $("au-cat"), city = $("au-city"), out = $("auout");

  cats.innerHTML = Object.keys(TOPICS).map((t) => `<button type="button">${t}</button>`).join("");
  city.innerHTML = CITIES.map((c, i) => `<option value="${i}">${c.n}</option>`).join("");

  function show(note) {
    [...cats.children].forEach((b) => b.classList.toggle("on", b.textContent === topic));
    const c = CITIES[city.value], t = TOPICS[topic];
    out.innerHTML =
      (note ? `<small style="color:var(--gr)">${note}</small>` : "") +
      `<ol class="chain">` +
        `<li data-n="1">Ward officer, ${c.n}<small>First point of contact</small></li>` +
        `<li data-n="2">${t.dept}<small>${c.body}</small></li>` +
        `<li data-n="3">Escalate: ${t.up(c)}<small>If not resolved in time</small></li>` +
      `</ol><small>Expected first action: ~${t.eta}</small>`;
  }

  cats.onclick = (e) => {
    if (e.target.closest("button")) { topic = e.target.textContent; show(); }
  };
  city.onchange = () => show();

  /* Great-circle distance in km */
  const km = (a, b) => {
    const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(x));
  };

  $("au-gps").onclick = () => {
    if (!navigator.geolocation) { show("Location is not supported in this browser."); return; }
    $("au-gps").textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const me = { lat: p.coords.latitude, lon: p.coords.longitude };
        let best = 0, dist = Infinity;
        CITIES.slice(0, -1).forEach((c, i) => { const d = km(me, c); if (d < dist) { dist = d; best = i; } });
        city.value = dist > 60 ? CITIES.length - 1 : best;
        $("au-gps").textContent = "📍 Use my location";
        show(dist > 60 ? "You seem to be outside the listed cities." : `Location matched: ${CITIES[best].n}`);
      },
      () => { $("au-gps").textContent = "📍 Use my location"; show("Location blocked — pick your city."); });
  };

  show();
})();