/* =====================================================================
   OFFICIALS / ADMIN DASHBOARD  (#admin)
   Sign-in gate + complaint list with resolution plan and status control.
   NOTE: this login runs in the browser, so it only demonstrates the flow.
   Real access control must be enforced on a server.
   ===================================================================== */
const OFFICIALS = [
  { id: "admin",   pass: "Admin@2026",   name: "Municipal Admin", role: "Admin" },
  { id: "officer", pass: "Officer@2026", name: "Ward Officer",    role: "Official" },
];
const session = () => { try { return JSON.parse(sessionStorage.getItem("jv_admin")); } catch (e) { return null; } };
const filters = { status: "all", priority: "all" };

function renderAdmin() {
  const root = $("admin-view"), me = session();
  root.innerHTML = me ? dashboardHTML(me) : loginHTML();
  me ? bindDashboard(root) : bindLogin(root);
}

/* ---------------- Login ---------------- */
const ico = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v5"/>',
  card:   '<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="11" r="2.5"/><path d="M8 17c0-2 2-3 4-3s4 1 4 3"/>',
  lock:   '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/><circle cx="12" cy="16" r="1"/>',
  eye:    '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  signin: '<path d="M4 12h12M12 7l5 5-5 5"/><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/>',
  bank:   '<path d="M3 10l9-6 9 6H3z"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
};

function loginHTML() {
  return `<section class="auth-in">
    <div class="pill"><i>${ico(ICONS.shield)}</i>Officials Access <span class="h">अधिकृत अधिकारी के लिए</span></div>
    <h2 class="ttl">Officials <em>sign-in</em></h2>
    <div class="sub">अधिकृत अधिकारी लॉगिन</div>
    <p class="desc">Access the command center to view, assign and resolve citizen complaints.<br>शिकायतों को देखने, आवंटित करने और निपटाने के लिए कमांड सेंटर में लॉगिन करें।</p>

    <form class="auth-card" id="lg" style="max-width:520px" novalidate>
      <label class="fld">Official ID <span>/ अधिकारी आईडी</span>
        <div class="frow"><i class="ico">${ico(ICONS.card)}</i><input name="id" type="text" autocomplete="username" placeholder="Enter your official ID"></div>
        <small class="hint">अपनी अधिकारी आईडी दर्ज करें</small>
      </label>
      <label class="fld" style="margin-top:18px">Password <span>/ पासवर्ड</span>
        <div class="frow"><i class="ico">${ico(ICONS.lock)}</i>
          <div class="pw"><input name="pw" type="password" autocomplete="current-password" placeholder="Enter your password">
            <button type="button" class="eye-btn" id="pw-eye" aria-label="Show password">${ico(ICONS.eye)}</button></div></div>
        <small class="hint">अपना पासवर्ड दर्ज करें</small>
      </label>
      <div class="err" id="lg-err" style="margin-left:0" role="alert"></div>
      <button class="btn p wide" type="submit">${ico(ICONS.signin)}<span>Sign in · लॉगिन करें</span></button>
      <div class="or">or</div>
      <button class="dept" type="button" id="dept">${ico(ICONS.bank)}<span>Login with Department Account<small>विभागीय खाते से लॉगिन करें</small></span></button>
    </form></section>`;
}
function bindLogin(root) {
  $("pw-eye").onclick = () => {
    const i = root.querySelector('[name="pw"]');
    i.type = i.type === "password" ? "text" : "password";
  };
  $("dept").onclick = () => { $("lg-err").textContent = "Department account login is not connected in this demo."; };
  $("lg").onsubmit = (e) => {
    e.preventDefault();
    const id = e.target.elements.id.value.trim(), pw = e.target.elements.pw.value;
    const o = OFFICIALS.find((x) => x.id === id && x.pass === pw);
    if (!o) { $("lg-err").textContent = "Invalid ID or password."; return; }
    sessionStorage.setItem("jv_admin", JSON.stringify({ name: o.name, role: o.role }));
    renderAdmin();
  };
}

/* ---------------- Dashboard ---------------- */
const isLate = (c) => c.status < 4 && (Date.now() - new Date(c.created)) / 3600e3 > c.eta * 0.7;

function dashboardHTML(me) {
  const all = Complaints.all();
  const list = all.filter((c) =>
    (filters.status === "all" || STATUSES[c.status] === filters.status) &&
    (filters.priority === "all" || c.priority === filters.priority));
  const kpi = (n, label, color) => `<div class="card"><b style="font:800 34px 'Bricolage Grotesque';color:${color || "inherit"}">${n}</b><br><small style="color:var(--mut)">${label}</small></div>`;
  const opts = (arr, cur) => ["all"].concat(arr).map((o) => `<option ${o === cur ? "selected" : ""}>${o}</option>`).join("");

  return `<section class="sec">
    <div class="ah"><div><div class="eye">${me.role} view</div><h2>Complaint command center</h2>
      <span class="h">${me.name} · शिकायतें और समाधान योजना</span></div>
      <button class="mini" id="logout">Sign out</button></div>
    <div class="kpis">
      ${kpi(all.length, "Total complaints")}
      ${kpi(all.filter((c) => c.status < 4).length, "Open", "var(--or2)")}
      ${kpi(all.filter((c) => c.priority === "High" && c.status < 4).length, "High priority open", "#FF8A8A")}
      ${kpi(all.filter(isLate).length, "SLA at risk", "#FF8A8A")}
      ${kpi(all.filter((c) => c.status === 4).length, "Resolved", "var(--gr)")}
      ${kpi(DB.get("jv_users", []).length, "Registered citizens")}
    </div>
    <div class="fa" style="margin-top:18px">
      <select id="f-status" aria-label="Status">${opts(STATUSES, filters.status)}</select>
      <select id="f-prio" aria-label="Priority">${opts(["High", "Medium", "Low"], filters.priority)}</select>
    </div>
    ${list.map(cardHTML).join("") || '<p class="note">No complaints match.</p>'}
  </section>`;
}

function cardHTML(c) {
  const plan = PLANS[c.issue] || PLANS["Road / Pothole"];
  const steps = STATUSES.map((s, i) =>
    `<div class="${i < c.status ? "d" : i === c.status ? "c" : ""}"><i></i>${s}<small>${plan[i]}</small></div>`).join("");
  return `<div class="card cmp" data-id="${c.id}">
    <div class="cmp-h"><b>${c.id}</b> · ${c.issue}
      <span class="pri ${c.priority}">${c.priority}</span>${isLate(c) ? '<span class="pri High">SLA risk</span>' : ""}</div>
    <div class="cmp-m">📍 ${c.location} · 🏛 ${c.dept} · ⏱ target ${c.eta} hrs<br>
      👤 ${c.user ? c.user.name + " · " + c.user.phone : "Unregistered citizen"} · 🕒 ${new Date(c.created).toLocaleString()}</div>
    <div class="trk s5">${steps}</div>
    <div class="fa">
      <select class="st">${STATUSES.map((s, i) => `<option value="${i}" ${i === c.status ? "selected" : ""}>${s}</option>`).join("")}</select>
      <button class="mini adv" ${c.status === 4 ? "disabled" : ""}>Advance ▶</button>
    </div>
    <div class="fa"><input class="nt" placeholder="Resolution note for citizen…" value="${c.note.replace(/"/g, "&quot;")}"><button class="mini sv">Save note</button></div>
  </div>`;
}

function bindDashboard(root) {
  $("logout").onclick = () => { sessionStorage.removeItem("jv_admin"); renderAdmin(); };
  $("f-status").onchange = (e) => { filters.status = e.target.value; renderAdmin(); };
  $("f-prio").onchange   = (e) => { filters.priority = e.target.value; renderAdmin(); };

  root.querySelectorAll(".cmp").forEach((el) => {
    const update = (fn) => {
      const list = Complaints.all(), c = list.find((x) => x.id === el.dataset.id);
      fn(c); Complaints.save(list); renderAdmin();
    };
    el.querySelector(".st").onchange = (e) => update((c) => (c.status = +e.target.value));
    el.querySelector(".adv").onclick = () => update((c) => (c.status = Math.min(4, c.status + 1)));
    el.querySelector(".sv").onclick  = () => update((c) => (c.note = el.querySelector(".nt").value));
  });
}