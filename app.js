
// Helpers e estado
// =====================================================
const el = (sel, root=document)=> root.querySelector(sel);
const els = (sel, root=document)=> [...root.querySelectorAll(sel)];
const fmt = (n) => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});

const state = {
  theme: 'dark',
  cart: [],
  filtroCat: 'all',
  filtroFast: false,
  filtroRating: false,
  filtroPromo: false,
  filtroFrete: false,
  filtroOpen: false,
  search: '',
  cupom: null,
};

let produtos = [];
let lojas = [];

// =====================================================
// Geração do cardápio (360 itens, 9 categorias)
// =====================================================
function seededRandom(seed) {
  // LCG simples para reprodutibilidade
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = s * 16807 % 2147483647) / 2147483647;
}

function generateMenu() {
  const rng = seededRandom(42);
  const cats = [
    {key:'burger',  icon:'🍔', names:['Smash', 'Cheddar Bacon', 'Double Cheese', 'Crispy Chicken', 'Veggie', 'Truffle', 'BBQ', 'Picanha', 'Brie & Onion', 'Chili']},
    {key:'pizza',   icon:'🍕', names:['Margherita', 'Calabresa', '4 Queijos', 'Portuguesa', 'Frango Catupiry', 'Pepperoni', 'Napolitana', 'Carbonara', 'Búfala', 'Toscana']},
    {key:'sushi',   icon:'🍣', names:['Combo', 'Temaki Salmão', 'Uramaki', 'Hossomaki', 'Nigiri', 'Sashimi Mix', 'Hot Roll', 'Gyoza', 'Yakisoba', 'Sunomono']},
    {key:'mex',     icon:'🌮', names:['Burrito', 'Tacos Al Pastor', 'Quesadilla', 'Nachos Supreme', 'Chilli', 'Guacamole Bowl', 'Enchilada', 'Tostada', 'Chimichanga', 'Fajitas']},
    {key:'br',      icon:'🍽️', names:['PF Picanha', 'Feijoada', 'Parmegiana', 'Strogonoff', 'Moqueca', 'Bobó de Camarão', 'Frango Grelhado', 'Costela', 'Virado à Paulista', 'Tilápia']},
    {key:'veg',     icon:'🥗', names:['Bowl Mediterrâneo', 'Bowl Oriental', 'Lasanha de Abobrinha', 'Falafel Plate', 'Tofu Grelhado', 'Ratatouille', 'Curry de Grão', 'Gnocchi de Abóbora', 'Quiche Veg', 'Wrap Verde']},
    {key:'dessert', icon:'🍰', names:['Brownie', 'Petit Gâteau', 'Cheesecake', 'Açaí 500ml', 'Tiramisù', 'Mousse', 'Churros', 'Pudim', 'Banoffee', 'Gelato Duo']},
    {key:'drinks',  icon:'🥤', names:['Suco Laranja', 'Suco Uva', 'Limonada', 'Refrigerante Lata', 'Chá Gelado', 'Água', 'Água com Gás', 'H2O Citrus', 'Mate', 'Smoothie']},
    {key:'pasta',   icon:'🍝', names:['Spaghetti Bolonhesa', 'Fettuccine Alfredo', 'Penne ao Pesto', 'Ravioli Ricota', 'Lasanha Bolonhesa', 'Gnocchi Sugo', 'Carbonara', 'Arrabbiata', 'Funghi', 'Camarão ao Limone']},
  ];

  const descs = {
    burger: 'Pão brioche, blend artesanal, queijo e molho da casa.',
    pizza: 'Massa de longa fermentação, molho rústico e queijo premium.',
    sushi: 'Seleção de peixes frescos e cortes equilibrados.',
    mex: 'Temperos autênticos, tortilhas e molhos artesanais.',
    br: 'Comida caseira com toques de chef e acompanhamentos completos.',
    veg: 'Ingredientes frescos, grãos e molhos leves.',
    dessert: 'Sobremesa clássica com toques de confeitaria.',
    drinks: 'Bebida gelada e refrescante.',
    pasta: 'Massa al dente com molhos cremosos e aromáticos.'
  };

  const tempos = [
    [15,25],[20,30],[25,35],[30,45],[35,50]
  ];

  const items = [];
  const perCat = 40; // 9 * 40 = 360
  cats.forEach(cat => {
    for (let i=1; i<=perCat; i++){
      const baseName = cat.names[Math.floor(rng()*cat.names.length)];
      const variant = i.toString().padStart(2,'0');
      const nome = `${baseName} ${variant}`;
      const minTempo = tempos[Math.floor(rng()*tempos.length)][0];
      const maxTempo = minTempo + 10 + Math.floor(rng()*10);
      const precoBase = {
        burger: [22, 44],
        pizza: [39, 79],
        sushi: [22, 69],
        mex: [20, 42],
        br: [25, 75],
        veg: [22, 48],
        dessert: [12, 32],
        drinks: [5, 18],
        pasta: [29, 64],
      }[cat.key];

      const preco = +(precoBase[0] + rng()*(precoBase[1]-precoBase[0])).toFixed(2);
      const rating = +(4 + rng()*1).toFixed(1); // 4.0 a 5.0
      const promo = rng() > 0.72 ? true : false;
      const freteGratis = rng() > 0.78 ? true : false;
      const aberto = rng() > 0.15 ? true : false; // 85% abertos

      items.push({
        id: `${cat.key}-${i}`, nome, cat: cat.key,
        preco, rating, tempo: `${minTempo}-${maxTempo}`,
        promo, freteGratis, aberto,
        icon: cat.icon,
        desc: descs[cat.key]
      });
    }
  });

  return items;
}

function generateStores() {
  const base = [
    {nome:'Smash Burger Pro', cat:'burger', distancia:'1.5km'},
    {nome:'Pizzaria La Forna', cat:'pizza', distancia:'2.2km'},
    {nome:'Sushi Prime', cat:'sushi', distancia:'3.1km'},
    {nome:'Taqueria Central', cat:'mex', distancia:'2.7km'},
    {nome:'Cantina Brasil', cat:'br', distancia:'1.9km'},
    {nome:'Green Bowl', cat:'veg', distancia:'2.4km'},
    {nome:'Dolce Vita', cat:'dessert', distancia:'1.2km'},
    {nome:'Refrescos do Vale', cat:'drinks', distancia:'0.9km'},
    {nome:'La Pasta Nostra', cat:'pasta', distancia:'2.0km'},
  ];
  return base.map(s => ({
    ...s,
    rating: (4 + Math.random()).toFixed(1),
    tempo: `${20+Math.floor(Math.random()*20)}-${40+Math.floor(Math.random()*20)}`,
    status: Math.random() > 0.15 ? 'Aberto' : 'Fechado'
  }));
}

// =====================================================
// Tema
// =====================================================
function toggleTheme() {
  if(state.theme==='dark'){
    state.theme='light';
    document.documentElement.style.setProperty('--bg', '#f7f8fd');
    document.documentElement.style.setProperty('--bg-soft', '#ffffff');
    document.documentElement.style.setProperty('--bg-elev', '#ffffff');
    document.documentElement.style.setProperty('--card', '#ffffff');
    document.documentElement.style.setProperty('--text', '#0f172a');
    document.documentElement.style.setProperty('--muted', '#43506b');
    document.body.style.background = 'linear-gradient(180deg, #eef2ff, #f7f8fd)';
  }else{
    state.theme='dark';
    location.reload(); // simplificação: volta ao tema padrão
  }
}

// =====================================================
// Renderização de produtos
// =====================================================
function passaFiltros(p){
  if(state.filtroCat !== 'all' && p.cat !== state.filtroCat) return false;
  if(state.filtroFast && parseInt(p.tempo.split('-')[0]) > 25) return false;
  if(state.filtroRating && p.rating < 4.5) return false;
  if(state.filtroPromo && !p.promo) return false;
  if(state.filtroFrete && !p.freteGratis) return false;
  if(state.filtroOpen && !p.aberto) return false;
  if(state.search && !(`${p.nome} ${p.desc}`.toLowerCase().includes(state.search.toLowerCase()))) return false;
  return true;
}

function renderProdutos(){
  const grid = el('#productGrid');
  grid.innerHTML = '';
  const lista = produtos.filter(passaFiltros);

  if(lista.length===0){
    grid.innerHTML = `<div class="panel col-12"><div class="muted">Nenhum item encontrado com os filtros atuais.</div></div>`;
    return;
  }

  lista.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card col-3';
    card.innerHTML = `
      <div class="thumb">
        <div style="font-size:2rem">${p.icon}</div>
        <div class="fav" role="button" aria-label="Favoritar" data-id="${p.id}">❤</div>
        ${p.promo ? '<div class="tag" style="position:absolute; left:10px; top:10px">Promo</div>' : ''}
        ${p.freteGratis ? '<div class="tag" style="position:absolute; left:10px; top:42px; background: rgba(255,176,32,.15); color:#ffd27a; border-color:rgba(255,176,32,.35)">Frete Grátis</div>' : ''}
        ${!p.aberto ? '<div class="tag" style="position:absolute; right:10px; bottom:10px; background: rgba(255,92,92,.18); color:#ff9f9f; border-color:rgba(255,92,92,.4)">Fechado</div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${p.nome}</div>
        <div class="card-sub">${p.desc}</div>
        <div class="rating">⭐ ${p.rating} • ⏱️ ${p.tempo} min</div>
        <div class="price">
          <span class="value">${fmt(p.preco)}</span>
          <div class="qty-controller">
            <button data-minus="${p.id}">−</button>
            <span id="qty-${p.id}">0</span>
            <button data-plus="${p.id}" ${!p.aberto?'disabled title="Fechado"':''}>+</button>
          </div>
        </div>
        <div class="add-line">
          <button class="btn" data-add="${p.id}" ${!p.aberto?'disabled':''}>Adicionar</button>
          <span class="mini">Entrega: ${p.tempo} min</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  bindFavs();
  bindCardButtons();
}

function bindFavs(){
  els('.fav').forEach(f => f.addEventListener('click', ()=> f.classList.toggle('active')));
}

function bindCardButtons(){
  els('[data-plus]').forEach(b=> b.onclick = ()=> cartAdd(b.dataset.plus, 1));
  els('[data-minus]').forEach(b=> b.onclick = ()=> cartAdd(b.dataset.minus, -1));
  els('[data-add]').forEach(b=> b.onclick = ()=> cartAdd(b.dataset.add, 1));
}

// =====================================================
// Carrinho
// =====================================================
function getItem(id){ return produtos.find(p=>p.id===id); }

function cartAdd(id, qty=1){
  const item = state.cart.find(i=>i.id===id);
  if(item){ item.qty += qty; if(item.qty<0) item.qty=0; }
  else state.cart.push({id, qty: Math.max(1, qty)});
  state.cart = state.cart.filter(i=>i.qty>0);
  renderCart(); renderQuantidades();
}
function cartRemove(id){
  state.cart = state.cart.filter(i=>i.id!==id);
  renderCart(); renderQuantidades();
}
function cartClear(){
  state.cart = []; state.cupom = null; el('#cupom').value='';
  renderCart(); renderQuantidades();
}
function calcTotals(){
  const subtotal = state.cart.reduce((acc, i)=>acc + getItem(i.id).preco * i.qty, 0);
  let taxa = state.cart.length ? 6.90 : 0;
  let desconto = 0;
  if(state.cupom){
    if(state.cupom.type==='percent') desconto = subtotal * state.cupom.value;
    if(state.cupom.type==='frete') taxa = 0;
  }
  const total = Math.max(0, subtotal + taxa - desconto);
  return {subtotal, taxa, desconto, total};
}

function renderCart(){
  const list = el('#cartItems');
  list.innerHTML = '';
  if(state.cart.length===0){
    list.innerHTML = '<div class="panel"><div class="muted">Seu carrinho está vazio. Que tal adicionar um item delicioso?</div></div>';
  }else{
    state.cart.forEach(i=>{
      const p = getItem(i.id);
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="cart-thumb">${p.icon}</div>
        <div>
          <div class="cart-title">${p.nome}</div>
          <div class="mini">${fmt(p.preco)} • ${p.tempo} min • ${p.rating}★</div>
          <div class="qty-controller" style="margin-top:6px; max-width:140px">
            <button data-minus-cart="${p.id}">−</button>
            <span id="cqty-${p.id}">${i.qty}</span>
            <button data-plus-cart="${p.id}">+</button>
          </div>
        </div>
        <div class="cart-actions">
          <strong>${fmt(p.preco * i.qty)}</strong>
          <button class="btn circle" data-remove="${p.id}" title="Remover">🗑️</button>
        </div>
      `;
      list.appendChild(row);
    });
  }
  const {subtotal, taxa, desconto, total} = calcTotals();
  el('#subtotal').textContent = fmt(subtotal);
  el('#taxa').textContent = fmt(taxa);
  el('#desconto').textContent = desconto>0 ? `- ${fmt(desconto)}` : fmt(0);
  el('#total').textContent = fmt(total);
  el('#cartCount').textContent = state.cart.reduce((a,b)=>a+b.qty,0);

  els('[data-minus-cart]').forEach(b=> b.onclick = ()=> cartAdd(b.dataset.minusCart, -1));
  els('[data-plus-cart]').forEach(b=> b.onclick = ()=> cartAdd(b.dataset.plusCart, 1));
  els('[data-remove]').forEach(b=> b.onclick = ()=> cartRemove(b.dataset.remove));
}

function renderQuantidades(){
  produtos.forEach(p=>{
    const span = el(`#qty-${p.id}`);
    if(span){
      const item = state.cart.find(i=>i.id===p.id);
      span.textContent = item ? item.qty : 0;
    }
  });
}

// =====================================================
// Cupons
// =====================================================
function aplicarCupom(code){
  const c = code.trim().toUpperCase();
  if(!c){ state.cupom=null; return 'Cupom limpo.'; }
  if(c==='BEMVINDO10'){ state.cupom = {type:'percent', value:0.10}; return '10% aplicado!'; }
  if(c==='FRETEGRATIS'){ state.cupom = {type:'frete'}; return 'Frete grátis aplicado!'; }
  return 'Cupom inválido.';
}

// =====================================================
// Lojas
// =====================================================
function renderLojas(){
  const grid = el('#storeGrid');
  grid.innerHTML = '';
  lojas.forEach(l=>{
    const div = document.createElement('div');
    div.className = 'card col-6';
    div.innerHTML = `
      <div class="card-body">
        <div class="flex space">
          <div style="font-weight:800">${l.nome}</div>
          <span class="mini-pill">${l.status}</span>
        </div>
        <div class="mini">Categoria: ${l.cat.toUpperCase()} • ${l.rating}★ • ${l.tempo} min • ${l.distancia}</div>
        <div class="flex gap-6" style="margin-top:8px">
          <button class="btn">Ver menu</button>
          <button class="btn ghost">Favoritar ❤</button>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
}

// =====================================================
// Modais e sidebar
// =====================================================
function openCart(){ el('#cart').classList.add('open'); }
function closeCart(){ el('#cart').classList.remove('open'); }
function openModal(id){ el('#'+id).classList.add('open'); }
function closeModal(id){ el('#'+id).classList.remove('open'); }

// =====================================================
// Checkout
// =====================================================
function preencherResumoCheckout(){
  const wrap = el('#resumoLista');
  const {total, subtotal, taxa, desconto} = calcTotals();
  if(state.cart.length===0){ wrap.innerHTML = '<div class="muted">Nenhum item no carrinho.</div>'; }
  else{
    wrap.innerHTML = state.cart.map(i=>{
      const p = getItem(i.id);
      return `<div class="row"><span>${i.qty}x ${p.nome}</span><strong>${fmt(p.preco*i.qty)}</strong></div>`;
    }).join('') + `
      <div class="divider"></div>
      <div class="row"><span>Subtotal</span><strong>${fmt(subtotal)}</strong></div>
      <div class="row"><span>Taxa</span><strong>${fmt(taxa)}</strong></div>
      <div class="row"><span>Desconto</span><strong>${desconto>0?'- '+fmt(desconto):fmt(0)}</strong></div>
    `;
  }
  el('#resumoTotal').textContent = fmt(total);
}

function confirmarPedido(){
  if(state.cart.length===0){ alert('Adicione itens ao carrinho antes de finalizar.'); return; }
  const nome = el('#ckNome').value.trim();
  const tel = el('#ckTel').value.trim();
  const end = el('#ckEndereco').value.trim();
  if(!nome || !tel || !end){
    alert('Preencha nome, telefone e endereço.');
    return;
  }
  closeModal('checkoutModal');
  closeCart();
  setTimeout(()=> alert(`Pedido confirmado! Obrigado, ${nome}. Acompanhe pelo seu e-mail.`), 200);
  cartClear();
}

// =====================================================
// Eventos
// =====================================================
function bindEventos(){
  el('#toggleTheme').addEventListener('click', toggleTheme);

  el('#btnCart').addEventListener('click', openCart);
  el('#closeCart').addEventListener('click', closeCart);
  el('#limparCarrinho').addEventListener('click', cartClear);
  el('#irCheckout').addEventListener('click', ()=>{ openModal('checkoutModal'); preencherResumoCheckout(); });
  el('#openCheckout').addEventListener('click', ()=>{ openModal('checkoutModal'); preencherResumoCheckout(); });
  els('[data-close]').forEach(b => b.addEventListener('click', ()=> closeModal(b.getAttribute('data-close')) ));

  el('#aplicarCupom').addEventListener('click', ()=>{
    const msg = aplicarCupom(el('#cupom').value);
    renderCart();
    alert(msg);
  });

  // Busca
  el('#searchInput').addEventListener('input', (e)=>{
    state.search = e.target.value;
    renderProdutos();
  });

  // Filtros de categoria
  els('#categoryBar .pill').forEach(pill=>{
    pill.addEventListener('click', ()=>{
      els('#categoryBar .pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active');
      state.filtroCat = pill.dataset.cat;
      renderProdutos();
    });
  });

  // Outros filtros
  const togglePill = (id, key) => {
    el(id).addEventListener('click', ()=>{
      state[key] = !state[key];
      el(id).classList.toggle('active');
      renderProdutos();
    });
  };
  togglePill('#filterFast','filtroFast');
  togglePill('#filterRating','filtroRating');
  togglePill('#filterPromo','filtroPromo');
  togglePill('#filterFrete','filtroFrete');
  togglePill('#filterOpen','filtroOpen');

  // Modais login/cadastro
  el('#btnLogin').addEventListener('click', ()=> openModal('loginModal'));
  el('#openRegister').addEventListener('click', ()=>{ closeModal('loginModal'); openModal('registerModal'); });
  el('#doLogin').addEventListener('click', ()=>{
    const email = el('#loginEmail').value.trim();
    const pass = el('#loginSenha').value.trim();
    if(!email || !pass){ alert('Preencha e-mail e senha.'); return; }
    closeModal('loginModal'); alert('Login simulado com sucesso!');
  });
  el('#doRegister').addEventListener('click', ()=>{
    const n = el('#regNome').value.trim();
    const e = el('#regEmail').value.trim();
    const s1 = el('#regSenha').value;
    const s2 = el('#regSenha2').value;
    if(!n || !e || !s1 || s1!==s2){ alert('Verifique os campos do cadastro.'); return; }
    closeModal('registerModal'); alert('Cadastro realizado! Faça login.');
  });

  // Localização
  el('#btnLocation')?.addEventListener('click', ()=>{
    const endereco = prompt('Informe seu endereço:');
    if(endereco) alert('Endereço definido: ' + endereco);
  });
  el('#locDetect').addEventListener('click', ()=>{
    if(!navigator.geolocation){ alert('Geolocalização não suportada.'); return; }
    navigator.geolocation.getCurrentPosition(
      ({coords})=> alert(`Local aproximado: lat ${coords.latitude.toFixed(4)}, lon ${coords.longitude.toFixed(4)}.`),
      (err)=> alert('Não foi possível obter sua localização: ' + err.message),
      {enableHighAccuracy:false, timeout: 7000, maximumAge: 20000}
    );
  });
  el('#locSet').addEventListener('click', ()=>{
    const endereco = prompt('Informe seu endereço:');
    if(endereco) alert('Endereço definido: ' + endereco);
  });

  // Atalhos
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ closeCart(); els('.modal-backdrop.open').forEach(m=>m.classList.remove('open')); }
    if(e.key==='/' && document.activeElement.tagName!=='INPUT'){ e.preventDefault(); el('#searchInput').focus(); }
    if(e.key==='c' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); openCart(); }
  });

  // Checkout confirmar
  el('#confirmarPedido').addEventListener('click', confirmarPedido);
}

// =====================================================
// Boot
// =====================================================
function boot(){
  produtos = generateMenu();           // 360 itens
  lojas = generateStores();
  renderProdutos();
  renderLojas();
  renderCart();
  bindEventos();
}
document.addEventListener('DOMContentLoaded', boot);

// Notas:
// - Troque a geração mock por API real quando integrar backend.
// - Separe em módulos JS (ESM) se preferir estruturas maiores.
// - Integre gateway de pagamento e mapas em produção.
