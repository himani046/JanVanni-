/* JanVaani AI — citizen registration integration
   Uses localStorage so it works with the current frontend without a separate DB object.
*/
const JVStore = {
  get(key, fallback = null) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
};

const getUser = () => JVStore.get("jv_user", null);

function updateNavBadge() {
  const who = document.getElementById("who");
  if (!who) return;
  const u = getUser();
  who.innerHTML = u
    ? `${u.name.split(" ")[0]}<small>मेरी प्रोफ़ाइल</small>`
    : "Register<small>पंजीकरण</small>";
}

function renderRegister() {
  const regf = document.getElementById("regf");
  const prof = document.getElementById("prof");
  if (!regf || !prof) return;

  const u = getUser();
  regf.hidden = !!u;
  prof.hidden = !u;

  const select = regf.querySelector("select");
  if (select && window.CITY_NAMES) {
    select.innerHTML = window.CITY_NAMES.map(c => `<option>${c}</option>`).join("");
  }
  if (!u) return;

  const complaints = JVStore.get("jv_complaints", []);
  const mine = complaints.filter(c => c.user && c.user.phone === u.phone);

  prof.innerHTML =
    `<span class="tag">Registered citizen</span><h3>Welcome, ${u.name}</h3>` +
    `<p>📧 ${u.email}<br>📱 ${u.phone}<br>📍 ${u.area}, ${u.city}</p>` +
    `<h3 style="margin-top:16px">My complaints</h3>` +
    (mine.length
      ? mine.map(c => `<div class="row">${c.id} · ${c.issue}<span style="color:var(--or2)">${c.status || "Submitted"}</span></div>`).join("")
      : `<p>No complaints yet. <a href="#saathi" style="color:var(--or2)">Talk to Saathi</a> to file one.</p>`) +
    `<div class="fa" style="margin-top:14px"><button class="mini" id="signout" type="button">Sign out</button></div>`;

  document.getElementById("signout")?.addEventListener("click", () => {
    JVStore.remove("jv_user");
    updateNavBadge();
    renderRegister();
  });
}

function setupRegistration() {
  const form = document.getElementById("regf");
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const v = n => (form.elements[n]?.value || "").trim();
    const rules = {
      name: [v("name").length >= 3, "Enter your full name"],
      email: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email")), "Enter a valid email address"],
      phone: [/^[6-9]\d{9}$/.test(v("phone")), "Enter a valid 10-digit mobile number"],
      area: [v("area").length >= 2, "Enter your area / ward"]
    };

    let ok = true;
    Object.keys(rules).forEach(k => {
      const err = form.querySelector(`[data-err="${k}"]`);
      const bad = !rules[k][0];
      if (err) err.textContent = bad ? rules[k][1] : "";
      ok = ok && !bad;
    });

    const consent = form.elements.consent;
    const consentErr = form.querySelector('[data-err="consent"]');
    if (consent && !consent.checked) {
      ok = false;
      if (consentErr) consentErr.textContent = "Please accept to continue";
    } else if (consentErr) consentErr.textContent = "";

    if (!ok) return;

    const user = {
      name: v("name"), email: v("email"), phone: v("phone"),
      city: v("city"), area: v("area"), joined: new Date().toISOString()
    };
    JVStore.set("jv_user", user);

    const users = JVStore.get("jv_users", []).filter(x => x.phone !== user.phone);
    JVStore.set("jv_users", users.concat(user));

    form.reset();
    updateNavBadge();
    renderRegister();
  };

  updateNavBadge();
  renderRegister();
}

document.addEventListener("DOMContentLoaded", setupRegistration);