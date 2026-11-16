/* =====================================================================
   CENTRAL CONFIGURATION: edit ONLY this block.
   Empty links ("") hide their buttons. Empty images show a placeholder.
   ===================================================================== */
const CONFIG = {
  ownerName: "Legrand Flaminiano",
  businessName: "NEKTIE",
  designation: "Necktie Buy & Sell",
  tagline: "Elevate Your Style. Discover Your Perfect Tie.",
  phone: "+639282345129",             // international format
  email: "hello@example.com",
  facebookUrl: "https://www.facebook.com/legrandflaminiano",                 
  instagramUrl: "https://www.instagram.com/leggyboii/",                  
  messengerUrl: "https://m.me/legrandflaminiano",                  
  profileImage: "leggy.jpg",                   // e.g. "images/owner.jpg"
  logoImage: "logo.png",                      // optional; monogram is used if empty
  currency: "₱",
  /* GOOGLE SHEET: paste your published CSV link here (see instructions).
     Leave "" to use the sample products list below instead. */
  sheetCsvUrl: "",
  /* GOOGLE APPS SCRIPT: paste your Web App URL (ends with /exec) here.
     If set, it is used instead of sheetCsvUrl. */
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbw8weWlEp0EfmnJLs4Bv0t5a9zGxUIdH92378GogtIPaJZmIFLRwkLpjFtSylmU9Xc/exec",                      // shown before numeric prices
  about: "We buy and sell neckties, with different styles and options for different occasions, from everyday work wear to weddings and formal events.",
  why: [
    { icon: "search-check", title: "Carefully Selected Neckties", text: "Each tie in the collection is picked by hand." },
    { icon: "wallet", title: "Affordable and Stylish Options", text: "Looks for different budgets and occasions." },
    { icon: "gem", title: "Quality Products", text: "Ask us for photos and details before you buy." },
    { icon: "smile", title: "Friendly Customer Service", text: "Quick, polite replies to every question." },
    { icon: "message-circle", title: "Convenient Ordering", text: "Just message us on Messenger. No account needed." }
  ],
  /* PRODUCTS: add, edit, or delete objects freely.
     availability must be "available", "reserved", or "sold".
     price: a number (e.g. 250) or text (e.g. "Ask for price"); use "" to hide.
     Prices, names and photos below are SAMPLE PLACEHOLDERS. */
  products: [
    { id: "tie-001", name: "Sample Necktie 1", category: "Brand new", price: 0, image: "", description: "Short description of this tie.", availability: "available" },
    { id: "tie-002", name: "Sample Necktie 2", category: "Pre-owned Neckties", price: 0, image: "", description: "Short description of this tie.", availability: "available" },
  ]
};

/* ===================== Implementation ===================== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STATUS = { available: "Available", reserved: "Reserved", sold: "Sold Out" };
let activeCat = "All";

const monogram = () => CONFIG.businessName.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
const fmtPrice = p => p === "" || p == null ? "" : typeof p === "number" ? (p > 0 ? CONFIG.currency + p.toLocaleString() : "Ask for price") : p;
function placeholder(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#222"/><path d="M175 120h50l14 40-39 50 39 40-34 160-34-160 39-40-39-50z" fill="none" stroke="#C5A46D" stroke-width="2"/><text x="200" y="470" fill="#8F8C86" font-family="sans-serif" font-size="16" text-anchor="middle">${esc(label)}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
const imgSrc = (src, label) => src || placeholder(label);

function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("show"), 2800); }
async function copyText(t) { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } }

/* Messenger link; adds ?text= prefill when supported */
function messengerLink(text) {
  const u = CONFIG.messengerUrl;
  if (!u) return CONFIG.phone ? `sms:${CONFIG.phone}${text ? "?body=" + encodeURIComponent(text) : ""}` : "";
  return text ? u + (u.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(text) : u;
}
const inquiryText = p => `Hi ${CONFIG.ownerName}! I'm interested in "${p.name}"${fmtPrice(p.price) && typeof p.price === "number" && p.price > 0 ? " (" + fmtPrice(p.price) + ")" : ""}. Is it still available?`;

/* Opens Messenger; also copies the message in case prefill isn't supported */
async function inquire(p) {
  const msg = inquiryText(p), url = messengerLink(msg);
  if (!url) return toast("Messaging link not set yet");
  const ok = await copyText(msg);
  if (ok) toast("Message copied. Paste it if the chat is empty.");
  window.open(url, "_blank", "noopener");
}

function actionBtn(p) {
  if (p.availability === "sold") return `<button class="btn ghost" disabled>Sold Out</button>`;
  const label = p.availability === "reserved" ? "Ask if available" : "Inquire / Buy Now";
  return `<button class="btn gold" data-inq="${esc(p.id)}">${label}</button>`;
}

function renderProducts() {
  const list = CONFIG.products.filter(p => activeCat === "All" || p.category === activeCat);
  $("#grid").innerHTML = list.length ? list.map(p => {
    const st = STATUS[p.availability] ? p.availability : "available";
    return `<article class="card ${st === "sold" ? "off" : ""}">
      <button class="pic" data-view="${esc(p.id)}" aria-label="View details for ${esc(p.name)}"><img loading="lazy" width="400" height="500" src="${esc(imgSrc(p.image, p.name))}" alt="${esc(p.name)}, ${esc(p.category)}"></button>
      ${st !== "available" ? `<span class="badge ${st}">${STATUS[st]}</span>` : ""}
      <div class="body"><span class="cat">${esc(p.category)}</span><h3>${esc(p.name)}</h3>
      ${fmtPrice(p.price) ? `<span class="price">${esc(fmtPrice(p.price))}</span>` : ""}
      <p class="d">${esc(p.description)}</p>${actionBtn({ ...p, availability: st })}</div></article>`;
  }).join("") : `<p class="empty">No neckties in this category right now.</p>`;
}

function renderFilters() {
  const cats = ["All", ...new Set(CONFIG.products.map(p => p.category))];
  $("#filters").innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c === activeCat}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
}

function openViewer(id) {
  const p = CONFIG.products.find(x => x.id === id); if (!p) return;
  const st = STATUS[p.availability] ? p.availability : "available";
  $("#vImg").src = imgSrc(p.image, p.name); $("#vImg").alt = p.name;
  $("#vCat").textContent = p.category; $("#vName").textContent = p.name;
  $("#vPrice").textContent = fmtPrice(p.price); $("#vDesc").textContent = p.description;
  $("#vStatus").textContent = STATUS[st];
  $("#vAct").innerHTML = st === "sold" ? `<button class="btn ghost" disabled>Sold Out</button>`
    : `<button class="btn gold" data-inq="${esc(p.id)}"><i data-lucide="message-circle"></i>Contact seller</button>`;
  window.lucide && lucide.createIcons();
  $("#viewer").showModal();
}

function render() {
  document.title = `${CONFIG.designation} | ${CONFIG.businessName}`;
  document.querySelectorAll("[data-bind]").forEach(el => el.textContent = CONFIG[el.dataset.bind]);
  $("#logo").innerHTML = CONFIG.logoImage ? `<img src="${esc(CONFIG.logoImage)}" alt="${esc(CONFIG.businessName)} logo" width="32" height="32">` : monogram();
  const pi = $("#profileImg"); pi.src = imgSrc(CONFIG.profileImage, "Owner photo"); pi.alt = `Portrait of ${CONFIG.ownerName}`;
  $("#year").textContent = new Date().getFullYear();

  const msg = messengerLink();
  const links = [
    { label: "Facebook", icon: "facebook", href: CONFIG.facebookUrl, ext: 1 },
    { label: "Instagram", icon: "instagram", href: CONFIG.instagramUrl, ext: 1 },
    { label: "Call", icon: "phone", href: CONFIG.phone ? `tel:${CONFIG.phone}` : "" },
    { label: "Message", icon: "message-circle", href: msg, ext: 1 }
  ].filter(l => l.href);
  const a = l => `<a class="c-btn" href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener noreferrer"' : ""}><i data-lucide="${l.icon}"></i>${l.label}</a>`;
  $("#connectGrid").innerHTML = links.map(a).join("");
  $("#orderBtns").innerHTML = (msg ? `<a class="btn gold" href="${esc(msg)}" target="_blank" rel="noopener noreferrer"><i data-lucide="message-circle"></i>Message on Messenger</a>` : "")
    + links.filter(l => l.label !== "Message").map(l => `<a class="btn ghost" href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener noreferrer"' : ""}><i data-lucide="${l.icon}"></i>${l.label}</a>`).join("");
  $("#footSocial").innerHTML = links.filter(l => l.ext).map(l => `<a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer" aria-label="${l.label}"><i data-lucide="${l.icon}"></i></a>`).join("");
  const hm = $("#heroMsg"), fab = $("#fab");
  msg ? (hm.href = msg, fab.href = msg) : (hm.hidden = fab.hidden = true);
  $("#fPhone").textContent = CONFIG.phone; $("#fPhone").href = `tel:${CONFIG.phone}`;
  $("#fEmail").textContent = CONFIG.email; $("#fEmail").href = `mailto:${CONFIG.email}`;
  $("#whyList").innerHTML = CONFIG.why.map(w => `<li><i data-lucide="${w.icon}"></i><div><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div></li>`).join("");
  renderFilters(); renderProducts();
  window.lucide && lucide.createIcons();
}

function saveContact() {
  const v = ["BEGIN:VCARD", "VERSION:3.0", `FN:${CONFIG.ownerName}`, `ORG:${CONFIG.businessName}`, `TITLE:${CONFIG.designation}`,
    `TEL;TYPE=CELL:${CONFIG.phone}`, `EMAIL:${CONFIG.email}`, `NOTE:${CONFIG.designation}`,
    CONFIG.facebookUrl && `URL:${CONFIG.facebookUrl}`, CONFIG.instagramUrl && `URL:${CONFIG.instagramUrl}`, "END:VCARD"].filter(Boolean).join("\r\n");
  const l = document.createElement("a");
  l.href = URL.createObjectURL(new Blob([v], { type: "text/vcard" }));
  l.download = `${CONFIG.ownerName.replace(/\s+/g, "_")}.vcf`;
  document.body.append(l); l.click(); l.remove(); URL.revokeObjectURL(l.href);
  toast("Contact file downloaded");
}
async function shareCard() {
  try {
    if (navigator.share) return await navigator.share({ title: `${CONFIG.ownerName} | ${CONFIG.businessName}`, text: CONFIG.tagline, url: location.href });
    toast(await copyText(location.href) ? "Link copied" : "Copy the address bar link to share");
  } catch (e) { if (e.name !== "AbortError") toast("Sharing failed. Try Copy link."); }
}

/* ---------- Google Sheet loader ---------- */
function parseCSV(t) {
  const rows = []; let r = [], c = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { r.push(c); c = ""; }
    else if (ch === "\n") { r.push(c); rows.push(r); r = []; c = ""; }
    else if (ch !== "\r") c += ch;
  }
  if (c || r.length) { r.push(c); rows.push(r); }
  return rows;
}
/* Turns a Google Drive share link into a direct image link */
function fixImage(u) {
  u = (u || "").trim();
  const m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/(?:open|uc)\?.*id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : u;
}
function normalize(o, i) {
  const g = n => String(o[n] ?? "").trim();
  const price = g("price"), num = Number(price.replace(/[^\d.]/g, ""));
  const av = g("availability").toLowerCase();
  return {
    id: g("id") || "row-" + (i + 1), name: g("name"), category: g("category") || "Neckties",
    price: price && /^[\d.,\s₱$]+$/.test(price) ? num : price, image: fixImage(g("image")),
    description: g("description"),
    availability: av.startsWith("sold") ? "sold" : av.startsWith("reserv") ? "reserved" : "available"
  };
}
async function loadSheet() {
  const url = CONFIG.appsScriptUrl || CONFIG.sheetCsvUrl;
  if (!url) return;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    let objs;
    if (CONFIG.appsScriptUrl) {
      let j;
      try { j = JSON.parse(text); }
      catch { throw new Error("Apps Script sent a web page, not data. Deploy it with access set to Anyone."); }
      if (j.error) throw new Error(j.error);
      objs = Array.isArray(j) ? j : j.products;
      if (!Array.isArray(objs)) throw new Error("No products list in the response.");
    } else {
      const [head, ...rows] = parseCSV(text);
      const h = head.map(x => x.trim().toLowerCase());
      objs = rows.map(r => Object.fromEntries(h.map((k, n) => [k, r[n]])));
    }
    const list = objs.map(normalize).filter(p => p.name);
    if (!list.length) throw new Error("The sheet has no rows with a name.");
    CONFIG.products = list; activeCat = "All"; renderFilters(); renderProducts();
    window.lucide && lucide.createIcons();
  } catch (e) {
    console.warn("Sheet not loaded:", e);
    toast("Could not load the Google Sheet: " + e.message);
  }
}

function init() {
  render(); loadSheet();
  document.addEventListener("click", e => {
    const t = e.target.closest("button,a"); if (!t) return;
    if (t.dataset.cat) { activeCat = t.dataset.cat; renderFilters(); renderProducts(); }
    else if (t.dataset.view) openViewer(t.dataset.view);
    else if (t.dataset.inq) { const p = CONFIG.products.find(x => x.id === t.dataset.inq); p && inquire(p); }
  });
  $("#saveBtn").onclick = saveContact; $("#shareBtn").onclick = shareCard;
  $("#copyBtn").onclick = async () => toast(await copyText(location.href) ? "Link copied" : "Copy the address bar link");
  const v = $("#viewer"); $("#closeV").onclick = () => v.close(); v.addEventListener("click", e => e.target === v && v.close());
  const top = $("#toTop");
  addEventListener("scroll", () => top.classList.toggle("show", scrollY > 700), { passive: true });
  top.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("DOMContentLoaded", init);
