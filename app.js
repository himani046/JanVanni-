/* =====================================================================
   JanVaani — shared storage, seed data and page router
   Data lives in localStorage (demo only). A real deployment needs a
   backend + database + server-side login for users and officials.
   ===================================================================== */

const DB = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; } },
  set(key, value)    { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
};

const CITY_NAMES = ["Indore", "Bhopal", "Ujjain", "Gwalior", "Jabalpur", "Rewa", "Other town / village"];
const STATUSES = ["Received", "AI verified", "Ward assigned", "Inspection", "Resolved"];

/* How each issue type is resolved — one action per status step */
const PLANS = {
  "Road / Pothole":            ["Logged & geo-tagged", "Photo & duplicates verified", "Ward engineer assigned", "Site inspection & measurement", "Repair done · proof uploaded"],
  "Waterlogging / Water":      ["Logged & geo-tagged", "Verified with ward data", "Drainage crew assigned", "Pump / de-silting on site", "Cleared · proof uploaded"],
  "Garbage / Sanitation":      ["Logged & geo-tagged", "Verified & route checked", "Sanitation team assigned", "Vehicle dispatched", "Cleared · proof uploaded"],
  "Streetlight / Electricity": ["Logged & pole ID noted", "Verified & duplicates merged", "Electrical crew assigned", "Lamp / wiring inspected", "Fixed · proof uploaded"],
};

const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const SEED = [
  { id: "JV-IND-0489", issue: "Road / Pothole",            location: "Vijay Nagar, Indore",    priority: "High",   dept: "PWD & Nagar Nigam Roads", eta: 18, status: 3, note: "Engineer visited, tar mix ordered.", user: { name: "Ramesh Patel", phone: "9876500011" }, created: hoursAgo(20) },
  { id: "JV-BPL-0312", issue: "Waterlogging / Water",      location: "Ward 9, Bhopal",         priority: "High",   dept: "Water Supply & Drainage", eta: 12, status: 1, note: "",                                  user: { name: "Sunita Verma", phone: "9876500022" }, created: hoursAgo(11) },
  { id: "JV-IND-0477", issue: "Garbage / Sanitation",      location: "Ward 14, Indore",        priority: "Medium", dept: "Sanitation Department",   eta: 24, status: 2, note: "Team assigned for evening run.",    user: { name: "Amit Joshi",   phone: "9876500033" }, created: hoursAgo(9) },
  { id: "JV-UJN-0150", issue: "Streetlight / Electricity", location: "Freeganj, Ujjain",       priority: "Medium", dept: "Electricity Board",       eta: 20, status: 0, note: "",                                  user: null,                                     created: hoursAgo(3) },
  { id: "JV-GWL-0098", issue: "Road / Pothole",            location: "Lashkar, Gwalior",       priority: "High",   dept: "PWD & Nagar Nigam Roads", eta: 18, status: 4, note: "Resurfaced, photo verified.",       user: { name: "Neha Singh",   phone: "9876500044" }, created: hoursAgo(30) },
];

const Complaints = {
  all() {
    let list = DB.get("jv_complaints", null);
    if (!list) { list = SEED; DB.set("jv_complaints", list); }
    return list;
  },
  add(c)  { const l = this.all(); l.unshift(c); DB.set("jv_complaints", l); },
  save(l) { DB.set("jv_complaints", l); },
};

/* ---------- Router: #register and #admin are separate views ---------- */
const VIEWS = { "#register": "reg-view", "#admin": "admin-view" };

function route() {
  const target = VIEWS[location.hash] || "top";
  ["top", "reg-view", "admin-view"].forEach((id) => ($(id).hidden = id !== target));
  const anchor = location.hash.length > 1 && target === "top" ? $(location.hash.slice(1)) : null;
  anchor ? anchor.scrollIntoView() : window.scrollTo(0, 0);
  if (target === "reg-view" && window.renderRegister) renderRegister();
  if (target === "admin-view" && window.renderAdmin) renderAdmin();
}
addEventListener("hashchange", route);