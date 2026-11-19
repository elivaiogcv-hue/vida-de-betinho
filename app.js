const canvas = document.getElementById('city');
const ctx = canvas.getContext('2d');

const state = {
  balance: 500,
  rank: 'Sobrevivente',
  inventory: {},
  xp: 0,
  property: null,
  businessCount: 0,
  player: { x: 530, y: 570, r: 12, angle: 0 },
  keys: {}
};

const buildings = [
  { x: 80, y: 70, w: 220, h: 150, name: 'Supermercado', color: '#c69d52', type: 'market', price: 40 },
  { x: 430, y: 70, w: 250, h: 150, name: 'Centro Empreendedor', color: '#a95845', type: 'business', price: 100 },
  { x: 820, y: 80, w: 220, h: 140, name: 'Condomínio Norte', color: '#8f9fa3', type: 'property', price: 220 },
  { x: 95, y: 430, w: 180, h: 150, name: 'Estação de Trabalho', color: '#4a7c68', type: 'job', price: 0 },
  { x: 780, y: 430, w: 260, h: 170, name: 'Banco Central', color: '#4f6689', type: 'bank', price: 0 }
];

const market = [
  { name: 'Cimento', unit: 'saco', base: 18, stock: 30 },
  { name: 'Trigo', unit: 'tonelada', base: 42, stock: 18 },
  { name: 'Roupas', unit: 'lote', base: 65, stock: 12 },
  { name: 'Combustível', unit: 'litro', base: 9, stock: 60 }
];

const properties = [
  { name: 'Terreno Popular', location: 'Bairro Sul', price: 800 },
  { name: 'Apartamento', location: 'Centro', price: 1800 },
  { name: 'Vivenda Moderna', location: 'Zona Oeste', price: 5000 }
];

function resize() {
  const scale = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  ctx.setTransform(canvas.width / 1120, 0, 0, canvas.height / 720, 0, 0);
}

function roads() {
  ctx.fillStyle = '#577064'; ctx.fillRect(0, 0, 1120, 720);
  ctx.fillStyle = '#d1b98a';
  ctx.fillRect(0, 300, 1120, 95); ctx.fillRect(350, 0, 100, 720);
  ctx.fillStyle = '#9b8e70';
  ctx.fillRect(0, 308, 1120, 12); ctx.fillRect(358, 0, 12, 720);
  ctx.setLineDash([28, 22]); ctx.strokeStyle = '#ede1b1'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 347); ctx.lineTo(1120, 347); ctx.moveTo(400, 0); ctx.lineTo(400, 720); ctx.stroke(); ctx.setLineDash([]);
}

function draw() {
  roads();
  buildings.forEach(b => {
    ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.fillRect(b.x + 12, b.y + 12, b.w - 24, 28);
    ctx.fillStyle = '#fff'; ctx.font = '700 15px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText(b.name, b.x + b.w/2, b.y + b.h/2);
  });
  // NPCs and activity
  const t = performance.now() / 1000;
  [[180,330],[625,345],[950,350],[500,650],[330,180]].forEach((p,i) => {
    ctx.fillStyle = i % 2 ? '#e1a16f' : '#2d3632'; ctx.beginPath(); ctx.arc(p[0]+Math.sin(t+i)*20,p[1]+Math.cos(t*0.7+i)*8,7,0,Math.PI*2); ctx.fill();
  });
  ctx.fillStyle = '#f0cf67'; ctx.beginPath(); ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
}

function update() {
  const p = state.player, speed = 3.2;
  if (state.keys.w || state.keys.ArrowUp) p.y -= speed;
  if (state.keys.s || state.keys.ArrowDown) p.y += speed;
  if (state.keys.a || state.keys.ArrowLeft) p.x -= speed;
  if (state.keys.d || state.keys.ArrowRight) p.x += speed;
  p.x = Math.max(14, Math.min(1106, p.x)); p.y = Math.max(14, Math.min(706, p.y));
  draw(); requestAnimationFrame(update);
}

function money(n) { return Math.round(n).toLocaleString('pt'); }
function toast(text) { const el = document.getElementById('toast'); el.textContent = text; el.classList.add('toast-visible'); clearTimeout(el.timer); el.timer = setTimeout(() => el.classList.remove('toast-visible'), 2200); }

function updateHud() {
  document.getElementById('balance').textContent = money(state.balance);
  document.getElementById('rank').textContent = state.rank;
  document.getElementById('inventory').innerHTML = Object.entries(state.inventory).map(([name,q]) => `<div class="chip">${name} ×${q}</div>`).join('') || '<small class="muted">Vazio</small>';
}

function renderMarket() {
  document.getElementById('market-list').innerHTML = market.map((item,i) => {
    const demand = 0.85 + ((Math.sin(Date.now()/9000 + i) + 1) * 0.18);
    const price = Math.round(item.base * demand);
    return `<div class="card"><div><strong>${item.name}</strong><small>${item.stock} disponíveis · ${item.unit}</small></div><button data-buy="${i}" data-price="${price}">${price} V$</button></div>`;
  }).join('');
}

function renderBusinesses() {
  document.getElementById('business-list').innerHTML = state.businessCount
    ? `<div class="card"><div><strong>Loja do Jogador ${state.businessCount}</strong><small>Lucro diário +50 V$</small></div><button data-income="50">Cobrar</button></div>`
    : '<div class="card"><div><strong>Sem negócios</strong><small>Crie a sua primeira empresa</small></div></div>';
}

function renderProperties() {
  document.getElementById('property-list').innerHTML = properties.map((p,i) => `<div class="card"><div><strong>${p.name}</strong><small>${p.location}</small></div><button data-property="${i}" ${state.property===i?'disabled':''}>${state.property===i?'Adquirido':p.price+' V$'}</button></div>`).join('');
}

function nearby() { return buildings.find(b => Math.hypot(state.player.x-(b.x+b.w/2), state.player.y-(b.y+b.h/2)) < 150); }

function interact() {
  const b = nearby();
  if (!b) return toast('Aproxime-se de um local');
  if (b.type === 'job') {
    state.balance += 25; state.xp += 10; toast('Turno concluído: +25 V$');
  } else if (b.type === 'bank') {
    toast('Conta ativa · depósitos seguros');
  } else {
    toast(b.name); document.querySelector(`[data-panel="${b.type}"]`)?.click();
  }
  updateRank(); updateHud();
}

function updateRank() {
  if (state.xp >= 500) state.rank = 'Bilionário virtual';
  else if (state.xp >= 180) state.rank = 'Grande empresário';
  else if (state.xp >= 80) state.rank = 'Empresário';
  else if (state.xp >= 30) state.rank = 'Pequeno empreendedor';
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab,.panel').forEach(el => el.classList.remove('active'));
  tab.classList.add('active'); document.getElementById(tab.dataset.panel).classList.add('active');
  if (tab.dataset.panel === 'market') renderMarket();
}));

document.addEventListener('click', e => {
  const buy = e.target.dataset.buy;
  if (buy !== undefined) {
    const i = Number(buy), price = Number(e.target.dataset.price), item = market[i];
    if (state.balance < price) return toast('Saldo insuficiente');
    state.balance -= price; item.stock--; state.inventory[item.name] = (state.inventory[item.name]||0)+1; state.xp += 2;
    toast(`${item.name} comprado`); updateRank(); updateHud(); renderMarket();
  }
  const income = e.target.dataset.income;
  if (income) { state.balance += Number(income); state.xp += 10; toast(`Receita recebida: +${income} V$`); updateRank(); updateHud(); }
  const property = e.target.dataset.property;
  if (property !== undefined) {
    const i = Number(property), p = properties[i];
    if (state.balance < p.price) return toast('Saldo insuficiente');
    state.balance -= p.price; state.property=i; state.xp+=40; toast(`${p.name} adquirido`); updateRank(); updateHud(); renderProperties();
  }
});

document.getElementById('open-business').addEventListener('click', () => {
  if (state.balance < 1000) return toast('São necessários 1 000 V$');
  state.balance -= 1000; state.businessCount++; state.xp+=30; updateRank(); updateHud(); renderBusinesses(); toast('Empresa criada');
});

window.addEventListener('keydown', e => { state.keys[e.key] = true; if (e.key.toLower === 'e') interact(); if (e.key.toLower === 'm') document.querySelector('[data-panel="market"]').click(); });
window.addEventListener('keyup', e => { state.keys[e.key] = false; });
window.addEventListener('resize', resize);

resize(); renderMarket(); renderBusinesses(); renderProperties(); updateHud(); update();
