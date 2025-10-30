// main.js - No edits required. Uses a public CORS proxy so you can upload and publish immediately.
// Auto-refresh every 3 minutes and has a manual "Refresh prices" button.
// NOTE: Public proxies may be rate-limited during heavy use.

const PROXY = "https://api.allorigins.win/raw?url=";
const YAHOO_QUOTE = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=";

const WATCHLIST = [
  // large caps
  "AAPL","MSFT","GOOGL","AMZN","NVDA","TSLA","JPM","V","META","XOM",
  // small / speculative
  "PLTR","FSLY","SPCE","NIO","RBLX","UPWK","APPF",
  // ETFs
  "VOO","SPY","QQQ","IWM","DIA"
];

const tbody = document.getElementById('stockBody');
const searchEl = document.getElementById('search');
const sectorFilter = document.getElementById('sectorFilter');
const capFilter = document.getElementById('capFilter');
const priceFilter = document.getElementById('priceFilter');
const refreshBtn = document.getElementById('refreshBtn');
const status = document.getElementById('status');

let stocks = [];

// formatting
function fmtCap(n){
  if(!n) return '';
  if(n>=1e12) return (n/1e12).toFixed(2)+'T';
  if(n>=1e9) return (n/1e9).toFixed(2)+'B';
  if(n>=1e6) return (n/1e6).toFixed(2)+'M';
  return n.toString();
}

// fetch quotes via proxy
async function fetchQuotes(symbols){
  try{
    status.textContent = 'Fetching quotes...';
    const url = PROXY + encodeURIComponent(YAHOO_QUOTE + symbols.join(','));
    const res = await fetch(url);
    if(!res.ok) throw new Error('proxy error '+res.status);
    const j = await res.json();
    return j.quoteResponse && j.quoteResponse.result ? j.quoteResponse.result : [];
  }catch(err){
    console.error('fetchQuotes error', err);
    return [];
  }finally{
    status.textContent = '';
  }
}

async function refreshAll(){
  // fetch in batches of 10
  const batchSize = 10;
  let results = [];
  for(let i=0;i<WATCHLIST.length;i+=batchSize){
    const batch = WATCHLIST.slice(i,i+batchSize);
    const res = await fetchQuotes(batch);
    results = results.concat(res);
  }
  stocks = results.map(r => ({
    symbol: r.symbol,
    shortName: r.shortName,
    regularMarketPrice: r.regularMarketPrice,
    regularMarketChange: r.regularMarketChange,
    regularMarketChangePercent: r.regularMarketChangePercent,
    regularMarketVolume: r.regularMarketVolume,
    marketCap: r.marketCap,
    sector: r.sector || r.industry || ''
  }));
  populateSectors();
  render();
  status.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
}

// render table with filters
function render(){
  const q = searchEl.value.trim().toLowerCase();
  let filtered = stocks.filter(s=>s && s.symbol);
  filtered = filtered.filter(s=>{
    if(q && !(s.symbol.toLowerCase().includes(q) || (s.shortName && s.shortName.toLowerCase().includes(q)))) return false;
    if(capFilter.value){
      const cap = s.marketCap || 0;
      if(capFilter.value==='mega' && cap < 200e9) return false;
      if(capFilter.value==='large' && (cap < 10e9 || cap >= 200e9)) return false;
      if(capFilter.value==='mid' && (cap < 2e9 || cap >= 10e9)) return false;
      if(capFilter.value==='small' && cap >= 2e9) return false;
    }
    if(priceFilter.value){
      const p = s.regularMarketPrice || 0;
      if(priceFilter.value==='p1' && p>=20) return false;
      if(priceFilter.value==='p2' && (p<20||p>100)) return false;
      if(priceFilter.value==='p3' && (p<100||p>500)) return false;
      if(priceFilter.value==='p4' && p<=500) return false;
    }
    return true;
  });

  tbody.innerHTML = filtered.map(s=>`
    <tr>
      <td><strong>${s.symbol}</strong></td>
      <td>${s.shortName || ''}</td>
      <td>${s.regularMarketPrice!==undefined? '$'+s.regularMarketPrice.toFixed(2): ''}</td>
      <td style="color:${(s.regularMarketChange||0)>=0? '#7fe39a':'#ff7b7b'}">${s.regularMarketChange!==undefined? s.regularMarketChange.toFixed(2): ''}</td>
      <td style="color:${(s.regularMarketChangePercent||0)>=0? '#7fe39a':'#ff7b7b'}">${s.regularMarketChangePercent!==undefined? s.regularMarketChangePercent.toFixed(2)+'%': ''}</td>
      <td>${fmtCap(s.marketCap)}</td>
      <td>${s.regularMarketVolume? s.regularMarketVolume.toLocaleString(): ''}</td>
    </tr>
  `).join('');
}

// populate sectors dropdown
function populateSectors(){
  const sectors = Array.from(new Set(stocks.map(s=>s.sector).filter(Boolean))).sort();
  sectorFilter.innerHTML = '<option value="">All sectors</option>';
  sectors.forEach(sec=>{
    const o = document.createElement('option'); o.value = sec; o.textContent = sec; sectorFilter.appendChild(o);
  });
}

// UI events
refreshBtn.addEventListener('click', refreshAll);
searchEl.addEventListener('input', render);
capFilter.addEventListener('change', render);
priceFilter.addEventListener('change', render);

// auto-refresh every 3 minutes
setInterval(refreshAll, 3 * 60 * 1000);

// initial load
refreshAll();
