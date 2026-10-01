/* =====================================================================
   CITIZEN REGISTRATION PORTAL  (#register)
   Collects name, email, mobile number and location.
   ===================================================================== */
const getUser = () => DB.get("jv_user", null);

function updateNavBadge() {
  const u = getUser();
  $("who").innerHTML = u ? `${u.name.split(" ")[0]}<small>मेरी प्रोफ़ाइल</small>` : "Register<small>पंजीकरण</small>";
}

function renderRegister() {
  const u = getUser();
  $("regf").hidden = !!u;
  $("prof").hidden = !u;
  $("regf").querySelector("select").innerHTML = CITY_NAMES.map((c) => `<option>${c}</option>`).join("");
  if (!u) return;

  const mine = Complaints.all().filter((c) => c.user && c.user.phone === u.phone);
  $("prof").innerHTML =
    `<span class="tag">Registered citizen</span><h3>Welcome, ${u.name}</h3>` +
    `<p>📧 ${u.email}<br>📱 ${u.phone}<br>📍 ${u.area}, ${u.city}</p>` +
    `<h3 style="margin-top:16px">My complaints</h3>` +
    (mine.length
      ? mine.map((c) => `<div class="row">${c.id} · ${c.issue}<span style="color:var(--or2)">${STATUSES[c.status]}</span></div>`).join("")
      : `<p>No complaints yet. <a href="#saathi" style="color:var(--or2)">Talk to Saathi</a> to file one.</p>`) +
    `<div class="fa" style="margin-top:14px"><button class="mini" id="signout" type="button">Sign out</button></div>`;
  $("signout").onclick = () => { localStorage.removeItem("jv_user"); updateNavBadge(); renderRegister(); };
}

$("regf").onsubmit = (e) => {
  e.preventDefault();
  const f = e.target, v = (n) => f.elements[n].value.trim();
  const rules = {
    name:  [v("name").length >= 3,                      "Enter your full name"],
    email: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email")), "Enter a valid email address"],
    phone: [/^[6-9]\d{9}$/.test(v("phone")),             "Enter a valid 10-digit mobile number"],
    area:  [v("area").length >= 2,                      "Enter your area / ward"],
  };
  let ok = true;
  Object.keys(rules).forEach((k) => {
    const bad = !rules[k][0];
    f.querySelector(`[data-err="${k}"]`).textContent = bad ? rules[k][1] : "";
    ok = ok && !bad;
  });
  if (!f.elements.consent.checked) { ok = false; f.querySelector('[data-err="consent"]').textContent = "Please accept to continue"; }
  else f.querySelector('[data-err="consent"]').textContent = "";
  if (!ok) return;

  const user = { name: v("name"), email: v("email"), phone: v("phone"), city: v("city"), area: v("area"), joined: new Date().toISOString() };
  DB.set("jv_user", user);
  const users = DB.get("jv_users", []).filter((x) => x.phone !== user.phone);
  DB.set("jv_users", users.concat(user));
  f.reset();
  updateNavBadge();
  renderRegister();
};

updateNavBadge();