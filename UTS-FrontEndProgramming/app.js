/* Dayak Site – Frontend SPA (no backend) */
const SEED = [
  {
    id: crypto.randomUUID(),
    title: "Asal Usul Suku Dayak",
    excerpt: "Sejarah singkat mengenai asal usul dan persebaran Suku Dayak di Kalimantan.",
    content: "Suku Dayak merupakan kelompok etnis asli Pulau Kalimantan dengan ratusan sub-suku. Mereka dikenal dengan tradisi, kearifan lokal, dan kesenian yang kaya, seperti ukiran, tarian, serta motif batik Dayak.",
    image: "",
    createdAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    title: "Motif Batik Dayak",
    excerpt: "Mengenal filosofi motif batik Dayak yang sarat makna alam dan spiritual.",
    content: "Motif Dayak banyak terinspirasi dari flora-fauna hutan Kalimantan dan unsur kosmologis. Garis-garis lengkung membentuk pola asimetris yang unik, sering dipakai pada pakaian adat dan dekorasi.",
    image: "",
    createdAt: Date.now()
  }
];

const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];

const state = {
  current: 'beranda',
  user: null,
  articles: []
};

// ---------- Storage Helpers ----------
const STORAGE_KEY = 'dayak_articles_v1';
function loadArticles(){
  const raw = localStorage.getItem(STORAGE_KEY);
  state.articles = raw ? JSON.parse(raw) : SEED;
  if(!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.articles));
}
function saveArticles(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.articles));
}

// ---------- Router (hash-based) ----------
function navigate(hash){
  state.current = (hash || location.hash || '#beranda').replace('#','');
  qsa('.section').forEach(s => s.classList.remove('show'));
  const sectionEl = qs(`#${state.current}`);
  if(sectionEl){ sectionEl.classList.add('show'); }
  if(state.current === 'artikel'){ renderArticles(); }
  if(state.current === 'artikel-detail'){ /* handled by openDetail */ }
}
window.addEventListener('hashchange', () => navigate());

// ---------- Navbar & Search ----------
const searchInput = qs('#searchInput');
searchInput.addEventListener('input', () => {
  if(state.current !== 'artikel') location.hash = '#artikel';
  renderArticles(searchInput.value.trim());
});

qs('#hamburger').addEventListener('click', () => {
  qs('.menu').classList.toggle('open');
});

// ---------- Articles UI ----------
function renderArticles(keyword=''){
  const grid = qs('#articlesGrid');
  grid.innerHTML = '';
  const items = state.articles
    .slice()
    .sort((a,b) => b.createdAt - a.createdAt)
    .filter(a => a.title.toLowerCase().includes(keyword.toLowerCase()) ||
                 a.excerpt.toLowerCase().includes(keyword.toLowerCase()) ||
                 a.content.toLowerCase().includes(keyword.toLowerCase()));
  qs('#emptyState').classList.toggle('hidden', items.length !== 0);
  items.forEach(a => {
    const card = document.createElement('div');
    card.className = 'card article-card';
    card.innerHTML = `
      <img src="${a.image || 'assets/placeholder.jpg'}" alt="${a.title}"/>
      <h3>${a.title}</h3>
      <div class="article-meta">${new Date(a.createdAt).toLocaleDateString('id-ID')}</div>
      <p>${a.excerpt}</p>
      <button class="btn small" data-id="${a.id}">Baca Selengkapnya</button>
    `;
    card.querySelector('button').addEventListener('click', () => openDetail(a.id));
    grid.appendChild(card);
  });
}

// Detail
function openDetail(id){
  const a = state.articles.find(x => x.id === id);
  if(!a) return;
  const detail = qs('#detailContent');
  detail.innerHTML = `
    <h2>${a.title}</h2>
    ${a.image ? `<img src="${a.image}" alt="${a.title}"/>` : ''}
    <p class="article-meta">${new Date(a.createdAt).toLocaleDateString('id-ID')}</p>
    <p>${a.content.replace(/\n/g,'<br/>')}</p>
  `;
  location.hash = '#artikel-detail';
  qs('#artikel-detail').classList.add('show');
}
qs('#backToList').addEventListener('click', () => { location.hash = '#artikel'; });

// ---------- Auth (Demo) ----------
// Simple demo credentials:
//  - admin / admin123  -> role: admin
//  - user / user123    -> role: user
qs('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const role = qs('#role').value;
  const username = qs('#username').value.trim();
  const password = qs('#password').value.trim();
  const ok =
    (role === 'admin' && username === 'admin' && password === 'admin123') ||
    (role === 'user'  && username === 'user'  && password === 'user123');
  const msg = qs('#loginMsg');
  if(ok){
    state.user = { role, username };
    msg.textContent = `Login sebagai ${role.toUpperCase()} berhasil.`;
    if(role === 'admin'){
      qs('#adminPanel').classList.remove('hidden');
    }else{
      qs('#adminPanel').classList.add('hidden');
      location.hash = '#artikel';
    }
  }else{
    msg.textContent = 'Username / password salah.';
  }
});

qs('#logoutBtn').addEventListener('click', () => {
  state.user = null;
  qs('#adminPanel').classList.add('hidden');
  qs('#loginMsg').textContent = 'Anda telah logout.';
});

// ---------- Admin CRUD ----------
const form = qs('#articleForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!state.user || state.user.role !== 'admin') return alert('Hanya admin.');
  const id = qs('#articleId').value || crypto.randomUUID();
  const title = qs('#title').value.trim();
  const excerpt = qs('#excerpt').value.trim();
  const content = qs('#content').value.trim();
  const file = qs('#image').files[0];
  let imageData = '';
  if(file){
    imageData = await toBase64(file);
  }
  const exists = state.articles.find(a => a.id === id);
  if(exists){
    exists.title = title; exists.excerpt = excerpt; exists.content = content;
    if(imageData) exists.image = imageData;
  }else{
    state.articles.push({ id, title, excerpt, content, image: imageData, createdAt: Date.now() });
  }
  saveArticles();
  form.reset();
  qs('#articleId').value = '';
  renderAdminList();
  renderArticles(searchInput.value.trim());
  alert('Tersimpan.');
});

qs('#resetForm').addEventListener('click', () => {
  form.reset();
  qs('#articleId').value = '';
});

function renderAdminList(){
  const wrap = qs('#adminList');
  wrap.innerHTML = '';
  state.articles
    .slice()
    .sort((a,b)=>b.createdAt-a.createdAt)
    .forEach(a => {
      const row = document.createElement('div');
      row.className = 'card';
      row.innerHTML = `
        <div class="row" style="align-items:center; justify-content:space-between;">
          <div>
            <strong>${a.title}</strong>
            <div class="article-meta">${new Date(a.createdAt).toLocaleDateString('id-ID')}</div>
          </div>
          <div class="row">
            <button class="btn small ghost" data-act="edit" data-id="${a.id}">Edit</button>
            <button class="btn small" data-act="preview" data-id="${a.id}">Lihat</button>
            <button class="btn small ghost" data-act="delete" data-id="${a.id}">Hapus</button>
          </div>
        </div>
      `;
      row.addEventListener('click', (ev)=>{
        const btn = ev.target.closest('button');
        if(!btn) return;
        const id = btn.getAttribute('data-id');
        const act = btn.getAttribute('data-act');
        if(act==='edit'){
          const item = state.articles.find(x=>x.id===id);
          if(!item) return;
          qs('#articleId').value = item.id;
          qs('#title').value = item.title;
          qs('#excerpt').value = item.excerpt;
          qs('#content').value = item.content;
          window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth'});
        }else if(act==='delete'){
          if(confirm('Hapus artikel ini?')){
            const idx = state.articles.findIndex(x=>x.id===id);
            if(idx>-1){ state.articles.splice(idx,1); saveArticles(); renderAdminList(); renderArticles(searchInput.value.trim()); }
          }
        }else if(act==='preview'){
          openDetail(id);
        }
      });
      wrap.appendChild(row);
    });
}

function toBase64(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// ---------- Init ----------
(function init(){
  document.querySelectorAll('[data-link]').forEach(a => {
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const href = a.getAttribute('href');
      if(href) location.hash = href;
    });
  });
  qs('#year').textContent = new Date().getFullYear();
  loadArticles();
  renderArticles();
  renderAdminList();
  navigate('#beranda');
})();
