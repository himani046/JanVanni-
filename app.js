const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const categories=[
["🛣️","Road / Potholes","सड़क / गड्ढे"],["💧","Water Supply","जल आपूर्ति"],["🗑️","Garbage & Sanitation","कचरा / स्वच्छता"],["💡","Streetlights","स्ट्रीट लाइट"],["🚰","Drainage","नाली / जल निकासी"],["⚡","Electricity","बिजली"],["🔥","Fire / Emergency","आग / आपातकाल"],["🌳","Trees / Parks","पेड़ / पार्क"],["🏗️","Illegal Construction","अवैध निर्माण"],["🚦","Traffic Signals","ट्रैफिक सिग्नल"],["🐕","Stray Animals","आवारा पशु"],["🏚️","Public Infrastructure","सार्वजनिक ढांचा"],["🚛","Waste Transport","कचरा परिवहन"],["🌧️","Waterlogging","जलभराव"],["🛶","Flooding","बाढ़"],["🧹","Public Cleanliness","सार्वजनिक सफाई"],["📢","Noise / Public Nuisance","शोर / सार्वजनिक परेशानी"],["🛑","Road Obstruction","सड़क अवरोध"]
];
const cg=$("#categoryGrid");
cg.innerHTML=categories.map(c=>`<div class="cat"><div style="font-size:22px;margin-bottom:6px">${c[0]}</div><b>${c[1]}</b><small>${c[2]}</small></div>`).join("");
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)};
const chat=$("#chatPanel"), body=$("#chatBody"), input=$("#chatInput");
const addMsg=(t,me=false,hi="")=>{const d=document.createElement("div");d.className="msg"+(me?" me":"");d.innerHTML=t+(hi?`<small>${hi}</small>`:"");body.appendChild(d);body.scrollTop=body.scrollHeight};
function bot(q){
 const low=q.toLowerCase();
 addMsg("…",false); const loading=body.lastElementChild;
 setTimeout(()=>{
   loading.remove();
   if(/status|स्थिति|क्या हुआ|track|कब तक/.test(low)) return addMsg("आपकी शिकायत <b>JV-IND-0482</b> Ward 22, Indore Road Maintenance को भेजी गई है. अभी site inspection चरण में है. अनुमानित अगला action ~18 घंटे में है.","", "शिकायत अभी निरीक्षण के चरण में है।");
   if(/time|कितना|कितने|समय/.test(low)) return addMsg("Similar incidents in this ward have taken around <b>1–2 days</b>. This ticket has 68% SLA risk, so it is already flagged for monitoring.","", "इस वार्ड में सामान्यतः 1–2 दिन लगते हैं।");
   if(/department|विभाग|कौन/.test(low)) return addMsg("The responsible desk is <b>Road Maintenance • Ward 22 • Indore Municipal Corporation</b>. JanVaani uses GPS + issue type + ward boundary to route it.","","सही विभाग तक शिकायत सीधे भेजी गई है।");
   if(/new|नई|complaint|शिकायत|report/.test(low)) return addMsg("बिल्कुल। समस्या अपने शब्दों में बताइए। मैं पहले जगह पूछूँगा, फिर urgency और photo evidence लेकर शिकायत तैयार करूँगा.","","अपनी भाषा में समस्या बताइए।");
   return addMsg("नमस्ते! मैं साथी हूँ। आप Hindi, Bundelkhandi, Malvi, Nimadi या English में बात कर सकते हैं. आप क्या जानना चाहते हैं?");
 },650);
}
$("#openChat").onclick=()=>{chat.classList.add("open");if(!body.children.length){addMsg("नमस्ते! 🙏 मैं साथी हूँ। अपनी समस्या बताइए या शिकायत की स्थिति पूछिए।","", "मैं हिंदी और अंग्रेज़ी में मदद कर सकता हूँ।")}
};
$("#closeChat").onclick=()=>chat.classList.remove("open");
$("#sendBtn").onclick=()=>{const q=input.value.trim();if(!q)return;input.value="";addMsg(q,true);bot(q)};
input.onkeydown=e=>{if(e.key==="Enter")$("#sendBtn").click()};
$$(".quick-row button").forEach(b=>b.onclick=()=>{addMsg(b.textContent,true);bot(b.textContent)});
$("#startVoice").onclick=()=>{chat.classList.add("open");toast("Microphone demo ready — speak naturally / अपनी भाषा में बोलें");if(!body.children.length)addMsg("🎙 सुन रहा हूँ… सड़क, पानी, कचरा या किसी और समस्या के बारे में बताइए।")};
$("#voiceOrb").onclick=()=>$("#startVoice").click();
let recognition;
$("#micBtn").onclick=()=>{
 if(recognition){try{recognition.stop()}catch(e){}return}
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){toast("Browser speech recognition is unavailable. Use the text box.");return}
 recognition=new SR(); recognition.lang="hi-IN"; recognition.interimResults=false;
 recognition.onstart=()=>toast("Listening… / सुन रहे हैं…");
 recognition.onresult=e=>{input.value=e.results[0][0].transcript;$("#sendBtn").click()};
 recognition.onerror=()=>toast("Could not hear clearly. Please try again.");
 recognition.onend=()=>{recognition=null};
 recognition.start();
};
$("#imageInput").onchange=e=>{const file=e.target.files?.[0];if(!file)return;const url=URL.createObjectURL(file);$("#imagePreview").classList.remove("hidden");$("#imagePreview").innerHTML=`<img src="${url}" alt="uploaded civic issue"><div style="padding:9px 11px;font-size:11px;color:#8fa7ba">AI triage preview: image received • awaiting backend vision model • GPS metadata check pending</div>`;toast("Evidence uploaded / फोटो अपलोड हो गया")};
$$(".filter").forEach(b=>b.onclick=()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");toast(b.textContent+" incidents selected")});
$("#langToggle").onclick=()=>{document.body.classList.toggle("hindi-mode");$("#langToggle").textContent=document.body.classList.contains("hindi-mode")?"EN":"हिं"};
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",()=>$$("nav a").forEach(n=>n.classList.toggle("active",n===a))));
