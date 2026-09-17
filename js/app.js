/* SmartExpense - Dashboard data engine
   Shared storage key: smartExpense_v1
*/
const STORAGE_KEY = 'smartExpense_v1';
const CATEGORIES = [
  ['Food','🍔'],['Transport','🚗'],['Shopping','🛍️'],['Bills','🏠'],
  ['Entertainment','🎮'],['Travel','✈️'],['Health','💊'],['Education','📚'],['Others','📦']
];
const DEFAULT_STATE = {
  transactions: [
    {id:1,type:'income',amount:50000,description:'Monthly salary',category:'Salary',date:'2026-09-01',method:'Bank transfer'},
    {id:2,type:'expense',amount:850,description:'Groceries',category:'Food',date:'2026-09-02',method:'UPI'},
    {id:3,type:'expense',amount:420,description:'Fuel',category:'Transport',date:'2026-09-04',method:'Card'},
    {id:4,type:'expense',amount:1290,description:'Online shopping',category:'Shopping',date:'2026-09-06',method:'UPI'},
    {id:5,type:'expense',amount:650,description:'Electricity bill',category:'Bills',date:'2026-09-08',method:'Bank transfer'},
    {id:6,type:'expense',amount:320,description:'Lunch',category:'Food',date:'2026-09-10',method:'UPI'},
    {id:7,type:'expense',amount:550,description:'Movie & snacks',category:'Entertainment',date:'2026-09-12',method:'Card'}
  ],
  budgets:{Food:5000,Transport:4000,Shopping:4000,Bills:8000,Entertainment:2500,Travel:6000,Health:3000,Education:3000,Others:2500},
  goals:[{id:1,name:'Emergency Fund',target:50000,current:19000,date:'2027-03-01'}],
  currency:'₹'
};

function clone(v){ return JSON.parse(JSON.stringify(v)); }
function readState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){ const fresh=clone(DEFAULT_STATE); localStorage.setItem(STORAGE_KEY,JSON.stringify(fresh)); return fresh; }
    const parsed=JSON.parse(raw);
    if(!parsed || !Array.isArray(parsed.transactions)) throw new Error('Invalid state');
    return parsed;
  } catch(e) { return clone(DEFAULT_STATE); }
}
function writeState(state){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function today(){ return new Date().toISOString().slice(0,10); }
function currentMonth(t){ return String(t.date||'').slice(0,7) === today().slice(0,7); }
function money(n,currency='₹'){ return `${currency}${Math.round(Number(n)||0).toLocaleString('en-IN')}`; }
function sum(list){ return list.reduce((total,t)=>total+Number(t.amount||0),0); }
function esc(v){ return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function icon(category){ return (CATEGORIES.find(c=>c[0]===category)||['','•'])[1]; }

function renderDashboard(){
  const state=readState();
  const monthTx=state.transactions.filter(currentMonth);
  const income=monthTx.filter(t=>t.type==='income');
  const expenses=monthTx.filter(t=>t.type==='expense');
  const incomeTotal=sum(income), expenseTotal=sum(expenses), balance=incomeTotal-expenseTotal;

  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set('balance',money(balance,state.currency));
  set('income',money(incomeTotal,state.currency));
  set('expenses',money(expenseTotal,state.currency));
  set('savings',money(Math.max(0,balance),state.currency));
  set('savingRate',`${incomeTotal ? Math.round(Math.max(0,balance)/incomeTotal*100) : 0}% of income`);
  set('expenseChange',`${expenses.length} transaction${expenses.length===1?'':'s'} this month`);

  renderRecent(state);
  renderCategoryChart(state);
  renderTrendChart(state);
  renderInsight(state,expenseTotal);
}

function renderRecent(state){
  const box=document.getElementById('recentList');
  if(!box) return;
  const latest=[...state.transactions].sort((a,b)=>(b.id||0)-(a.id||0)).slice(0,6);
  if(!latest.length){ box.innerHTML='<p class="py-8 text-center text-slate-500">No transactions yet.</p>'; return; }
  box.innerHTML=latest.map(t=>`<div class="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60">
    <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center">${t.type==='income'?'💰':icon(t.category)}</div>
    <div class="flex-1 min-w-0"><p class="font-bold truncate">${esc(t.description)}</p><p class="text-xs text-slate-500">${esc(t.category||'Others')} · ${esc(t.date||'')}</p></div>
    <b class="${t.type==='income'?'text-emerald-600':'text-rose-500'}">${t.type==='income'?'+':'-'}${money(t.amount,state.currency)}</b>
  </div>`).join('');
}

let trendChartInstance=null, categoryChartInstance=null;
function renderTrendChart(state){
  const canvas=document.getElementById('trendChart');
  if(!canvas || typeof Chart==='undefined') return;
  const labels=[],values=[]; const now=new Date();
  for(let i=6;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); const key=d.toISOString().slice(0,10); labels.push(key.slice(5)); values.push(sum(state.transactions.filter(t=>t.type==='expense'&&t.date===key))); }
  if(trendChartInstance) trendChartInstance.destroy();
  trendChartInstance=new Chart(canvas,{type:'line',data:{labels,datasets:[{label:'Spending',data:values,tension:.35,fill:true,borderWidth:3,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
}
function renderCategoryChart(state){
  const canvas=document.getElementById('categoryChart');
  if(!canvas || typeof Chart==='undefined') return;
  const month=state.transactions.filter(t=>t.type==='expense'&&currentMonth(t)); const totals={};
  month.forEach(t=>totals[t.category]=(totals[t.category]||0)+Number(t.amount||0));
  const entries=Object.entries(totals).sort((a,b)=>b[1]-a[1]);
  if(categoryChartInstance) categoryChartInstance.destroy();
  categoryChartInstance=new Chart(canvas,{type:'doughnut',data:{labels:entries.map(e=>e[0]),datasets:[{data:entries.map(e=>e[1]),borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'64%',plugins:{legend:{position:'bottom'}}}});
}
function renderInsight(state,expenseTotal){
  const title=document.getElementById('insightTitle'),text=document.getElementById('insightText'); if(!title||!text)return;
  const month=state.transactions.filter(t=>t.type==='expense'&&currentMonth(t));
  if(!month.length){title.textContent='Start tracking';text.textContent='Add your first expense and your overview will update automatically.';return;}
  const totals={}; month.forEach(t=>totals[t.category]=(totals[t.category]||0)+Number(t.amount||0));
  const top=Object.entries(totals).sort((a,b)=>b[1]-a[1])[0];
  title.textContent=top?`${top[0]} is your top category`:'You\'re in control.';
  text.textContent=top?`${top[0]} accounts for ${money(top[1],state.currency)} of this month’s spending. Total spending is ${money(expenseTotal,state.currency)}.`:'Keep adding transactions to see patterns.';
}


function renderNavigation(){
  // Keep the full original sidebar navigation.
  const items = [
    ['index.html','Dashboard','⌂'],
    ['add-expense.html','Add Expense','＋'],
    ['recent-transactions.html','Recent Transactions','🧾'],
    ['analysis.html','See Analysis','◉'],
    ['income.html','Income','↗'],
    ['budgets.html','Budgets','◷'],
    ['goals.html','Goals','◉'],
    ['settings.html','Settings','⚙']
  ];

  const current = location.pathname.split('/').pop() || 'index.html';
  const desktop = document.getElementById('desktopNav');
  const mobile = document.getElementById('mobileNav');

  const link = (href,label,emoji,small=false) => `
    <a href="${href}"
       class="${small
         ? 'flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold'
         : 'flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800'}
       ${current===href ? 'nav-active' : ''}"
       ${current===href ? 'aria-current="page"' : ''}>
      <span class="${small ? 'text-lg leading-none' : 'text-lg w-6 text-center'}">${emoji}</span>
      <span>${label}</span>
    </a>`;

  if (desktop) desktop.innerHTML = items.map(x => link(...x)).join('');

  // On mobile show the most important five items and keep Add Expense accessible.
  if (mobile) {
    const mobileItems = [items[0], items[1], items[2], items[3], items[7]];
    mobile.innerHTML = mobileItems.map(x => link(...x, true)).join('');
  }
}

function setupDashboardActions(){
  const add=document.getElementById('addBtn'); if(add){
    const a=document.createElement('a'); a.href='add-expense.html'; a.className=add.className; a.textContent='+ Add transaction'; add.replaceWith(a);
  }
  const mobile=document.getElementById('mobileAdd'); if(mobile){
    const a=document.createElement('a'); a.href='add-expense.html'; a.className=mobile.className; a.innerHTML=mobile.innerHTML; mobile.replaceWith(a);
  }
  document.querySelectorAll('[data-page="expenses"]').forEach(el=>{const a=document.createElement('a');a.href='recent-transactions.html';a.className=el.className;a.textContent=el.textContent;el.replaceWith(a);});
  document.querySelectorAll('[data-page="analytics"]').forEach(el=>{const a=document.createElement('a');a.href='analysis.html';a.className=el.className;a.textContent=el.textContent;el.replaceWith(a);});
}

function setupTheme(){
  const apply=()=>{const dark=localStorage.getItem('smartExpense_theme')==='dark';document.documentElement.classList.toggle('dark',dark);document.querySelectorAll('#themeBtn,#settingsThemeBtn').forEach(b=>b.textContent=dark?'☾':'☼');};
  window.toggleTheme=()=>{const dark=!document.documentElement.classList.contains('dark');localStorage.setItem('smartExpense_theme',dark?'dark':'light');apply();};
  apply();
}

// Keep dashboard in sync when returning to the tab/page.
window.addEventListener('storage',renderDashboard);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderDashboard();});
document.addEventListener('DOMContentLoaded',()=>{renderNavigation();setupTheme();setupDashboardActions();renderDashboard();});
