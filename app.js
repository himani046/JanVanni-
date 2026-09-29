const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const categories = [
  ["🛣️","Road / Potholes","सड़क / गड्ढे"],["💧","Water Supply","जल आपूर्ति"],
  ["🗑️","Garbage & Sanitation","कचरा / स्वच्छता"],["💡","Streetlights","स्ट्रीट लाइट"],
  ["🚰","Drainage","नाली / जल निकासी"],["⚡","Electricity","बिजली"],
  ["🔥","Fire / Emergency","आग / आपातकाल"],["🌳","Trees / Parks","पेड़ / पार्क"],
  ["🏗️","Illegal Construction","अवैध निर्माण"],["🚦","Traffic Signals","ट्रैफिक सिग्नल"],
  ["🐕","Stray Animals","आवारा पशु"],["🏚️","Public Infrastructure","सार्वजनिक ढांचा"],
  ["🚛","Waste Transport","कचरा परिवहन"],["🌧️","Waterlogging","जलभराव"],
  ["🛶","Flooding","बाढ़"],["🧹","Public Cleanliness","सार्वजनिक सफाई"],
  ["📢","Noise / Public Nuisance","शोर / सार्वजनिक परेशानी"],["🛑","Road Obstruction","सड़क अवरोध"]
];

$("#categoryGrid").innerHTML = categories.map(function(c) {
  return '<div class="cat"><div>' + c[0] + '</div><b>' + c[1] + '</b><small>' + c[2] + '</small></div>';
}).join("");

function toast(message) {
  var t = $("#toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(function() { t.classList.remove("show"); }, 2300);
}

/* ---------------- Voice-first Saathi ---------------- */

var consoleEl = $("#voiceConsole");
var voiceButton = $("#voiceButton");
var voiceButtonLabel = $("#voiceButtonLabel");
var voiceButtonHint = $("#voiceButtonHint");
var voiceState = $("#voiceState");
var transcriptEl = $("#transcript");
var responseEl = $("#responseText");
var indicator = $("#speakingIndicator");
var languageSelect = $("#voiceLanguage");
var repeatButton = $("#repeatButton");
var stopButton = $("#stopButton");

var recognition = null;
var isListening = false;
var lastReply = "";
var conversationState = "idle";
var selectedLanguage = "hi-IN";

var statusData = {
  id: "JV-IND-0482",
  ward: "Ward 22",
  city: "Indore",
  department: "Road Maintenance",
  nextHours: 18,
  risk: 68,
  reports: 23,
  etaDays: 4
};

function setState(state, detail) {
  consoleEl.classList.toggle("listening", state === "listening");
  consoleEl.classList.toggle("speaking", state === "speaking");

  var copy = {
    ready: ["Ready to listen · सुनने के लिए तैयार", "बोलें", "Tap and speak"],
    listening: ["Listening… · सुन रहा हूँ…", "सुनने के बाद रुकें", "I’m listening"],
    speaking: ["Saathi is speaking · साथी जवाब दे रहा है", "जवाब", "Please listen"],
    error: ["Microphone needs attention · माइक्रोफोन जाँचें", "फिर बोलें", "Try again"]
  }[state] || ["Ready", "बोलें", "Tap and speak"];

  voiceState.textContent = detail || copy[0];
  voiceButtonLabel.textContent = copy[1];
  voiceButtonHint.textContent = copy[2];
  indicator.textContent = state === "speaking" ? "● Speaking now" : state === "listening" ? "● Listening now" : "● Ready";
}

$("#soundWave").innerHTML = Array.from({length: 31}, function() { return "<i></i>"; }).join("");

function chooseSpeechVoice(lang) {
  var voices = window.speechSynthesis && window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
  var exact = voices.find(function(v) { return v.lang && v.lang.toLowerCase() === lang.toLowerCase(); });
  if (exact) return exact;
  if (lang.indexOf("hi") === 0) {
    return voices.find(function(v) { return v.lang && v.lang.toLowerCase().indexOf("hi") === 0; }) ||
      voices.find(function(v) { return v.lang && v.lang.toLowerCase().indexOf("en-in") === 0; });
  }
  return voices.find(function(v) { return v.lang && v.lang.toLowerCase().indexOf("en-in") === 0; }) ||
    voices.find(function(v) { return v.lang && v.lang.toLowerCase().indexOf("en") === 0; });
}

function stopSpeaking() {
  try { window.speechSynthesis.cancel(); } catch (e) {}
  consoleEl.classList.remove("speaking");
  if (!isListening) setState("ready");
}

function speak(text, lang) {
  lang = lang || selectedLanguage;
  lastReply = text;
  if (!("speechSynthesis" in window)) {
    setState("ready", "Voice playback unavailable · आवाज़ playback उपलब्ध नहीं");
    return;
  }

  stopSpeaking();
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang.indexOf("hi") === 0 ? 0.94 : 0.96;
  utterance.pitch = 1.02;
  utterance.volume = 1;

  var voice = chooseSpeechVoice(lang);
  if (voice) utterance.voice = voice;

  utterance.onstart = function() { setState("speaking"); };
  utterance.onend = function() { setState("ready"); };
  utterance.onerror = function() { setState("ready", "Voice reply finished · आवाज़ जवाब पूरा हुआ"); };

  consoleEl.classList.add("speaking");
  window.speechSynthesis.speak(utterance);
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[?!.,।]/g, " ").replace(/\s+/g, " ").trim();
}

function localVoiceResponse(text) {
  var t = normalizeText(text);
  var isHindi = selectedLanguage.indexOf("hi") === 0 ||
    /मेरी|शिकायत|रिपोर्ट|स्थिति|कब तक|विभाग|कितना|पानी|गड्ढा/.test(t);

  if (/status|स्थिति|रिपोर्ट.*स्थिति|शिकायत.*स्थिति|मेरी.*क्या.*स्थिति|क्या हुआ|track|ट्रैक/.test(t)) {
    return isHindi
      ? "जी, आपकी शिकायत " + statusData.id + " की स्थिति यह है। यह " + statusData.ward + ", " + statusData.city + " में " + statusData.department + " को भेजी गई है और अभी साइट निरीक्षण के चरण में है। अगला action लगभग " + statusData.nextHours + " घंटे में expected है। इस शिकायत में " + statusData.reports + " लोगों की समान reports जुड़ी हैं और अभी SLA risk " + statusData.risk + " प्रतिशत है।"
      : "Your complaint " + statusData.id + " is currently with " + statusData.department + ", " + statusData.ward + ", " + statusData.city + ". It is in the site inspection stage. The next action is expected in about " + statusData.nextHours + " hours. " + statusData.reports + " similar citizen reports are linked to the same incident, and the current SLA risk is " + statusData.risk + " percent.";
  }

  if (/how long|कब तक|कितना समय|कितने दिन|समय|eta|days|दिन/.test(t)) {
    return isHindi
      ? "इस तरह की शिकायत के लिए अनुमानित resolution time लगभग " + statusData.etaDays + " दिन है। लेकिन अभी अगला field action लगभग " + statusData.nextHours + " घंटे में expected है।"
      : "The estimated resolution time for this type of complaint is around " + statusData.etaDays + " days. The next field action is expected in about " + statusData.nextHours + " hours.";
  }

  if (/department|विभाग|कौन.*देख|कौन.*जिम्मेदार|officer|अधिकारी/.test(t)) {
    return isHindi
      ? "आपकी शिकायत " + statusData.department + " विभाग के पास है, " + statusData.ward + ", " + statusData.city + " में। JanVaani location और issue type के आधार पर इसे सही civic authority तक route करता है।"
      : "Your complaint is assigned to " + statusData.department + ", " + statusData.ward + ", " + statusData.city + ". JanVaani uses the location and issue type to route it to the responsible civic authority.";
  }

  if (/report|नई शिकायत|शिकायत दर्ज|file|register|दर्ज कर|problem|समस्या/.test(t)) {
    conversationState = "reporting";
    return isHindi
      ? "बिल्कुल। मैं आपके साथ voice में शिकायत दर्ज करूँगा। पहले अपने शब्दों में समस्या बताइए और अगर संभव हो तो नज़दीकी जगह या landmark भी बताइए।"
      : "Absolutely. I can take the complaint by voice. Tell me the problem in your own words and, if possible, mention the nearest landmark or area.";
  }

  if (/hello|hi|hey|namaste|नमस्ते|नमस्कार/.test(t)) {
    return isHindi
      ? "नमस्ते। मैं साथी हूँ। आप अपनी शिकायत की स्थिति, विभाग या समाधान का अनुमान पूछ सकते हैं। या बस अपनी नई समस्या बोल सकते हैं।"
      : "Hello. I’m Saathi. You can ask about your complaint status, responsible department, expected time, or simply tell me a new civic problem.";
  }

  if (conversationState === "reporting") {
    conversationState = "idle";
    return isHindi
      ? "समझ गया। मैंने आपकी बात नोट कर ली है। अगला चरण complaint details को structure करना और location के आधार पर routing करना है।"
      : "Got it. I have captured what you said. The next step is to structure the complaint details and route it using the location.";
  }

  return isHindi
    ? "जी, मैं सुन रहा हूँ। आप सीधे बोल सकते हैं — जैसे, मेरी शिकायत की स्थिति क्या है, कितने दिन लगेंगे, या कौन सा विभाग इसे देख रहा है?"
    : "I’m listening. You can ask directly about your complaint status, expected time, or the responsible department.";
}

async function getVoiceResponse(text) {
  var apiBase = window.JANVAANI_API_BASE || "http://127.0.0.1:8000";
  try {
    var controller = new AbortController();
    var timeout = setTimeout(function() { controller.abort(); }, 1800);
    var res = await fetch(apiBase + "/api/v1/voice/respond", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({text: text, language: selectedLanguage}),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      var data = await res.json();
      if (data && data.reply_text) return data.reply_text;
    }
  } catch (e) {}
  return localVoiceResponse(text);
}

function startListening() {
  if (isListening) {
    try { if (recognition) recognition.stop(); } catch (e) {}
    return;
  }

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setState("error", "This browser does not support speech recognition · Chrome में कोशिश करें");
    toast("Speech recognition is not available in this browser.");
    return;
  }

  stopSpeaking();
  recognition = new SpeechRecognition();
  recognition.lang = selectedLanguage;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = function() {
    isListening = true;
    setState("listening");
    transcriptEl.textContent = "“सुन रहा हूँ…”";
  };

  recognition.onresult = function(event) {
    var finalText = "";
    var interim = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += piece;
      else interim += piece;
    }
    transcriptEl.textContent = "“" + (finalText || interim) + "”";
    if (finalText) handleSpeech(finalText);
  };

  recognition.onerror = function(event) {
    isListening = false;
    setState("error", event.error === "not-allowed" ? "Microphone permission denied · Mic permission दें" : "Could not hear clearly · फिर से बोलें");
    toast(event.error === "not-allowed" ? "Please allow microphone access." : "I couldn't hear that clearly.");
  };

  recognition.onend = function() {
    isListening = false;
    recognition = null;
    if (!consoleEl.classList.contains("speaking")) setState("ready");
  };

  try { recognition.start(); }
  catch (e) { isListening = false; recognition = null; setState("error"); }
}

async function handleSpeech(text) {
  transcriptEl.textContent = "“" + text + "”";
  setState("speaking", "Thinking… · समझ रहा हूँ…");
  var reply = await getVoiceResponse(text);
  responseEl.textContent = reply;
  speak(reply, selectedLanguage);
}

voiceButton.addEventListener("click", startListening);

$("#heroOrb").addEventListener("click", function() {
  $("#voice").scrollIntoView({behavior:"smooth", block:"center"});
  setTimeout(startListening, 450);
});

$("#heroSpeak").addEventListener("click", function() {
  $("#voice").scrollIntoView({behavior:"smooth", block:"center"});
  setTimeout(startListening, 450);
});

repeatButton.addEventListener("click", function() {
  if (lastReply) speak(lastReply, selectedLanguage);
  else toast("पहले Saathi से बात करें.");
});

stopButton.addEventListener("click", stopSpeaking);

languageSelect.addEventListener("change", function() {
  selectedLanguage = languageSelect.value;
  setState("ready", selectedLanguage === "hi-IN" ? "Hindi voice ready · हिंदी आवाज़ तैयार" : "English voice ready");
});

$$("[data-example]").forEach(function(button) {
  button.addEventListener("click", function() {
    var text = button.dataset.example;
    transcriptEl.textContent = "“" + text + "”";
    $("#voice").scrollIntoView({behavior:"smooth", block:"center"});
    setTimeout(function() { handleSpeech(text); }, 250);
  });
});

$$("[data-focus-voice]").forEach(function(button) {
  button.addEventListener("click", function() {
    $("#voice").scrollIntoView({behavior:"smooth", block:"center"});
    setTimeout(startListening, 350);
  });
});

if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
  window.speechSynthesis.addEventListener("voiceschanged", function() {
    window.speechSynthesis.getVoices();
  });
}

/* ---------------- Image evidence ---------------- */

$("#imageInput")?.addEventListener("change", function(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;
  var url = URL.createObjectURL(file);
  var preview = $("#imagePreview");
  preview.classList.remove("hidden");
  preview.innerHTML = '<img src="' + url + '" alt="Uploaded civic issue"><div style="padding:8px 10px;font-size:11px;color:#777487">Evidence received • backend vision model can be connected here • GPS metadata check pending</div>';
  toast("Evidence uploaded · फोटो अपलोड हो गया");
});

/* ---------------- Language UI + navigation ---------------- */

$("#langToggle")?.addEventListener("click", function() {
  document.body.classList.toggle("hindi-mode");
  $("#langToggle").textContent = document.body.classList.contains("hindi-mode") ? "EN" : "हिं";
});

$$('a[href^="#"]').forEach(function(a) {
  a.addEventListener("click", function() {
    $$("nav a").forEach(function(n) { n.classList.toggle("active", n === a); });
  });
});

setState("ready");
