const CATEGORIES = [
  ["Food","🍔"],["Transport","🚗"],["Shopping","🛍️"],["Bills","🏠"],
  ["Entertainment","🎮"],["Travel","✈️"],["Health","💊"],["Education","📚"],["Others","📦"]
];

const DEMO = [
  {id:1,type:"income",amount:50000,description:"Monthly salary",category:"Salary",date:"2026-09-01",method:"Bank transfer"},
  {id:2,type:"expense",amount:850,description:"Groceries",category:"Food",date:"2026-09-02",method:"UPI"},
  {id:3,type:"expense",amount:420,description:"Fuel",category:"Transport",date:"2026-09-04",method:"Card"},
  {id:4,type:"expense",amount:1290,description:"Online shopping",category:"Shopping",date:"2026-09-06",method:"UPI"},
  {id:5,type:"expense",amount:650,description:"Electricity bill",category:"Bills",date:"2026-09-08",method:"Bank transfer"},
  {id:6,type:"expense",amount:320,description:"Lunch",category:"Food",date:"2026-09-10",method:"UPI"},
  {id:7,type:"expense",amount:550,description:"Movie & snacks",category:"Entertainment",date:"2026-09-12",method:"Card"}
];

const KEY="smartExpense_v1";
const state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  transactions: DEMO,
  budgets: {Food:5000,Transport:4000,Shopping:4000,Bills:8000,Entertainment:2500,Travel:6000,Health:3000,Education:3000,Others:2500},
  goals: [{id:1,name:"Emergency Fund",target:50000,current:19000,date:"2027-03-01"}],
  currency:"₹"
};

let charts={};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const money=n=>`${state.currency}${Math.round(n).toLocaleString("en-IN")}`;
const today=()=>new Date().toISOString().slice(0,10);
const monthTx=()=>state.transactions.filter(t=>t.date?.slice(0,7)===today().slice(0,7));
const expenses=()=>monthTx().filter(t=>t.type==="expense");
const incomes=()=>monthTx().filter(t=>t.type==="income");
const total=a=>a.reduce((s,t)=>s+Number(t.amount),0);

function icon(category){ return (CATEGORIES.find(c=>c[0]===category)||["","•"])[1]; }
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.remove("translate-x-[130%]");
  setTimeout(()=>t.classList.add("translate-x-[130%]"),2200);
}

function setupNav(){
 const items=[["index.html","⌂","Dashboard"],["add-expense.html","+","Add Expense"],["recent-transactions.html","🧾","Recent Transactions"],["analysis.html","◉","See Analysis"],["income.html","↗","Income"],["budgets.html","◴","Budgets"],["goals.html","◎","Goals"],["settings.html","⚙","Settings"]];
 const make=i=>`<a href="${i[0]}" class="nav-item w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition hover:bg-slate-100"><span>${i[1]}</span>${i[2]}</a>`;
 $("#desktopNav").innerHTML=items.map(make).join("");
 $("#mobileNav").innerHTML=items.slice(0,5).map(i=>`<a href="${i[0]}" class="nav-item text-[10px] font-semibold py-2 rounded-xl text-center"><div class="text-lg">${i[1]}</div>${i[2]}</a>`).join("");
}
function showPage(id){
  $$(".page-section").forEach(s=>s.classList.toggle("hidden",s.id!==id));
  $$(".nav-item").forEach(b=>b.classList.toggle("nav-active",b.dataset.page===id));
  if(id==="analysis") renderAnalytics();
  if(id==="budgets") renderBudgets();
  if(id==="goals") renderGoals();
  if(id==="income") renderIncome();
  if(id==="recent-transactions") renderTransactions();
  if(id==="add-expense") renderAddExpensePage();
  window.scrollTo({top:0,behavior:"smooth"});
}

function populateCategories(){
  $("#txCategory").innerHTML=CATEGORIES.map(([n,i])=>`<option value="${n}">${i} ${n}</option>`).join("");
  $("#filterCategory").innerHTML=`<option value="all">All categories</option>`+CATEGORIES.map(c=>`<option value="${c[0]}">${c[1]} ${c[0]}</option>`).join("");
}

function openModal(){
  $("#modal").classList.remove("hidden"); $("#modal").classList.add("flex");
  $("#txDate").value=today(); $("#txAmount").focus();
}
function closeModal(){ $("#modal").classList.add("hidden"); $("#modal").classList.remove("flex"); $("#transactionForm").reset(); }

function addTransaction(e){
  e.preventDefault();
  const t={id:Date.now(),type:$("#txType").value,amount:Number($("#txAmount").value),description:$("#txDescription").value.trim(),category:$("#txType").value==="income"?"Salary":$("#txCategory").value,date:$("#txDate").value,method:$("#txMethod").value};
  state.transactions.push(t); save(); closeModal(); renderAll(); toast("Transaction added ✓");
}

function renderDashboard(){
  const inc=total(incomes()), exp=total(expenses()), bal=inc-exp, sav=Math.max(0,bal);
  $("#balance").textContent=money(bal); $("#income").textContent=money(inc); $("#expenses").textContent=money(exp); $("#savings").textContent=money(sav);
  $("#savingRate").textContent=`${inc?Math.round(sav/inc*100):0}% of income`;
  const recent=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,6);
  $("#recentList").innerHTML=recent.length?recent.map(txRow).join(""):`<p class="text-sm text-slate-500 py-5 text-center">No transactions yet.</p>`;
  renderCharts();
  renderInsight();
  const goal=state.goals[0]; if(goal){$("#sideGoal").textContent=money(goal.target);const p=Math.min(100,goal.current/goal.target*100);$("#sideProgress").style.width=p+"%";$("#sideProgressText").textContent=`${Math.round(p)}% complete`;}
}

function txRow(t){
  const positive=t.type==="income";
  return `<div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition">
    <div class="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-lg">${positive?"💰":icon(t.category)}</div>
    <div class="min-w-0 flex-1"><p class="font-semibold text-sm truncate">${escapeHtml(t.description)}</p><p class="text-xs text-slate-500">${escapeHtml(t.category)} · ${t.date}</p></div>
    <p class="font-bold text-sm ${positive?"text-emerald-600":"text-slate-800"}">${positive?"+":"-"}${money(t.amount)}</p>
  </div>`;
}

function renderTransactions(){
  const q=($("#searchInput")?.value||"").toLowerCase(), cat=$("#filterCategory")?.value||"all", type=$("#filterType")?.value||"all";
  const arr=[...state.transactions]
    .filter(t=>(!q||`${t.description} ${t.category} ${t.method}`.toLowerCase().includes(q))&&(cat==="all"||t.category===cat)&&(type==="all"||t.type===type))
    .sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  $("#allTransactions").innerHTML=arr.length ? arr.map(t=>`<div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition"><div class="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-lg">${t.type==="income"?"💰":icon(t.category)}</div><div class="min-w-0 flex-1"><p class="font-semibold text-sm truncate">${escapeHtml(t.description)}</p><p class="text-xs text-slate-500">${escapeHtml(t.category)} · ${t.date} · ${escapeHtml(t.method||"")}</p></div><p class="font-bold text-sm ${t.type==="income"?"text-emerald-600":"text-rose-600"}">${t.type==="income"?"+":"-"}${money(t.amount)}</p><button onclick="removeTx(${t.id})" class="text-xs text-rose-500 ml-2">Delete</button></div>`).join("") : `<p class="p-8 text-center text-slate-500">No matching transactions.</p>`;
}
window.removeTx=id=>{state.transactions=state.transactions.filter(t=>t.id!==id);save();renderAll();toast("Transaction deleted");};

function renderIncome(){
  const groups={}; incomes().forEach(t=>groups[t.category]=(groups[t.category]||0)+Number(t.amount));
  $("#incomeCards").innerHTML=Object.keys(groups).length?Object.entries(groups).map(([k,v])=>`<div class="glass rounded-3xl p-5"><div class="w-11 h-11 rounded-2xl bg-emerald-50 grid place-items-center">💰</div><p class="text-sm text-slate-500 mt-4">${escapeHtml(k)}</p><p class="text-2xl font-black mt-1">${money(v)}</p></div>`).join(""):`<div class="glass rounded-3xl p-6 text-slate-500">No income recorded this month.</div>`;
}

function renderBudgets(){
  const ex=expenses();
  $("#budgetGrid").innerHTML=CATEGORIES.map(([cat,ic])=>{
    const spent=ex.filter(t=>t.category===cat).reduce((s,t)=>s+Number(t.amount),0), limit=state.budgets[cat]||0, p=limit?Math.min(100,spent/limit*100):0;
    return `<div class="glass rounded-3xl p-5"><div class="flex justify-between"><div class="flex gap-3 items-center"><span class="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center">${ic}</span><div><p class="font-bold">${cat}</p><p class="text-xs text-slate-500">${money(spent)} spent</p></div></div><span class="text-xs font-bold ${p>=90?"text-rose-500":"text-slate-500"}">${Math.round(p)}%</span></div><div class="h-2 bg-slate-100 rounded-full mt-5 overflow-hidden"><div class="h-full rounded-full ${p>=90?"bg-rose-500":"bg-slate-900"} transition-all duration-700" style="width:${p}%"></div></div><p class="text-xs text-slate-500 mt-2">Budget: ${money(limit)}</p></div>`;
  }).join("");
}

function renderGoals(){
  $("#goalGrid").innerHTML=state.goals.length?state.goals.map(g=>{const p=Math.min(100,g.target?g.current/g.target*100:0);return `<div class="glass rounded-3xl p-5"><div class="flex justify-between"><span class="text-2xl">🎯</span><span class="text-xs font-bold">${Math.round(p)}%</span></div><h3 class="font-bold mt-4">${escapeHtml(g.name)}</h3><p class="text-sm text-slate-500 mt-1">${money(g.current)} of ${money(g.target)}</p><div class="h-3 bg-slate-100 rounded-full mt-5 overflow-hidden"><div class="h-full bg-slate-900 rounded-full transition-all duration-700" style="width:${p}%"></div></div><button onclick="addGoalMoney(${g.id})" class="mt-4 text-sm font-bold">Add savings +</button></div>`}).join(""):`<div class="glass rounded-3xl p-6 text-slate-500">Create your first savings goal.</div>`;
}
window.addGoalMoney=id=>{const g=state.goals.find(x=>x.id===id), v=Number(prompt("Amount to add:", "1000"));if(g&&v>0){g.current+=v;save();renderAll();toast("Savings goal updated ✓");}};

function renderInsight(){
  const ex=expenses(); if(!ex.length){$("#insightTitle").textContent="Start tracking";$("#insightText").textContent="Add transactions to unlock personalized spending insights.";return;}
  const groups={};ex.forEach(t=>groups[t.category]=(groups[t.category]||0)+Number(t.amount));
  const [cat,val]=Object.entries(groups).sort((a,b)=>b[1]-a[1])[0], pct=Math.round(val/total(ex)*100);
  $("#insightTitle").textContent=`${cat} is your top category`;
  $("#insightText").textContent=`You've spent ${money(val)} on ${cat} this month, which is ${pct}% of your tracked expenses.`;
}

function renderCharts(){
  const labels=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10)});
  const vals=labels.map(day=>state.transactions.filter(t=>t.type==="expense"&&t.date===day).reduce((s,t)=>s+Number(t.amount),0));
  charts.trend?.destroy(); charts.trend=new Chart($("#trendChart"),{type:"line",data:{labels:labels.map(x=>new Date(x).toLocaleDateString("en",{weekday:"short"})),datasets:[{data:vals,borderWidth:3,tension:.4,fill:true,backgroundColor:"rgba(99,102,241,.10)",borderColor:"#4f46e5",pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:"rgba(148,163,184,.12)"}},x:{grid:{display:false}}}}});
  const groups={};expenses().forEach(t=>groups[t.category]=(groups[t.category]||0)+Number(t.amount));
  const entries=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  charts.cat?.destroy(); charts.cat=new Chart($("#categoryChart"),{type:"doughnut",data:{labels:entries.map(x=>x[0]),datasets:[{data:entries.map(x=>x[1]),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"68%",plugins:{legend:{display:false}}}});
  $("#categoryLegend").innerHTML=entries.slice(0,6).map(([k,v])=>`<div class="flex items-center gap-2"><span>${icon(k)}</span><span class="truncate">${k}</span><b class="ml-auto">${money(v)}</b></div>`).join("");
}

function renderAnalytics(){
  const ex=expenses(), inc=incomes(), groups={};ex.forEach(t=>groups[t.category]=(groups[t.category]||0)+Number(t.amount));
  charts.cash?.destroy(); charts.cash=new Chart($("#cashChart"),{type:"bar",data:{labels:["Income","Expenses","Savings"],datasets:[{data:[total(inc),total(ex),Math.max(0,total(inc)-total(ex))],borderRadius:10}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  charts.bar?.destroy();charts.bar=new Chart($("#barChart"),{type:"bar",data:{labels:Object.keys(groups),datasets:[{data:Object.values(groups),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  const avg=ex.length?total(ex)/new Set(ex.map(t=>t.date)).size:0;
  $("#analyticsStats").innerHTML=[["Transactions",state.transactions.length],["Avg. spend/day",money(avg)],["Top category",Object.entries(groups).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—"],["Savings rate",inc.length?`${Math.round(Math.max(0,total(inc)-total(ex))/total(inc)*100)}%`:"0%"]].map(([a,b])=>`<div class="glass rounded-2xl p-4"><p class="text-xs text-slate-500">${a}</p><p class="font-black text-lg mt-1">${b}</p></div>`).join("");
}

function renderAll(){renderDashboard();renderTransactions();renderIncome();renderBudgets();renderGoals();renderAddExpensePage();}

function syncThemeButton(){
  const dark=document.documentElement.classList.contains("dark");
  $("#themeBtn").textContent=dark?"☾":"☼";
  if($("#settingsThemeBtn")) $("#settingsThemeBtn").textContent=dark?"Switch to light":"Switch to night mode";
}
function setTheme(dark){
  document.documentElement.classList.toggle("dark", !!dark);
  document.body.classList.toggle("dark-mode", !!dark);
  localStorage.setItem("smartExpense_theme", dark ? "dark" : "light");
  syncThemeButton();
}
function initTheme(){
  const saved=localStorage.getItem("smartExpense_theme");
  const dark=saved==="dark";
  document.documentElement.classList.toggle("dark", dark);
  if(document.body) document.body.classList.toggle("dark-mode", dark);
  syncThemeButton();
}
function renderAddExpensePage(){
  $("#pageDate").value=today();
  $("#expenseCurrency").textContent=state.currency;
  $("#pageMonthExpense").textContent=money(total(expenses()));
  $("#pageCategory").innerHTML=CATEGORIES.map(([n,i])=>`<option value="${n}">${i} ${n}</option>`).join("");
}
function submitExpensePage(e){
  e.preventDefault();
  const amount=Number($("#pageAmount").value);
  if(!amount || amount<=0){toast("Enter a valid amount");return;}
  state.transactions.push({
    id:Date.now(),type:"expense",amount,
    description:$("#pageDescription").value.trim(),
    category:$("#pageCategory").value,date:$("#pageDate").value,
    method:$("#pageMethod").value,notes:$("#pageNotes").value.trim()
  });
  save(); $("#expensePageForm").reset(); renderAll(); renderAddExpensePage();
  toast("Expense saved ✓"); showPage("dashboard");
}


function init(){
  setupNav();populateCategories();
  $("#dateText").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  ["searchInput","filterCategory","filterType"].forEach(id=>$("#"+id).addEventListener("input",renderTransactions));
  $("#budgetBtn").onclick=()=>{const cat=prompt("Category (e.g. Food):","Food");if(!cat)return;const val=Number(prompt(`Monthly budget for ${cat}:`,"5000"));if(val>0){state.budgets[cat]=val;save();renderAll();toast("Budget saved ✓")}};
  $("#goalBtn").onclick=()=>{const name=prompt("Goal name:","New Goal"),target=Number(prompt("Target amount:","50000"));if(name&&target>0){state.goals.push({id:Date.now(),name,target,current:0,date:""});save();renderAll();toast("Goal created ✓")}};
  $("#demoBtn").onclick=()=>{state.transactions=DEMO.map(x=>({...x}));save();renderAll();toast("Demo data loaded")};
  $("#clearBtn").onclick=()=>{if(confirm("Delete all transactions and goals?")){state.transactions=[];state.goals=[];save();renderAll();toast("All data cleared")}};
  $("#currencySelect").value=state.currency==="₹"?"₹ INR":state.currency===" $"?"$ USD":state.currency==="€"?"€ EUR":"£ GBP";
  $("#currencySelect").onchange=e=>{state.currency=e.target.value.split(" ")[0];save();renderAll();syncThemeButton()};
  $("#themeBtn").onclick=()=>setTheme(!document.documentElement.classList.contains("dark"));
  $("#settingsThemeBtn").onclick=()=>setTheme(!document.documentElement.classList.contains("dark"));
  $("#expensePageForm").onsubmit=submitExpensePage;
  $("#expenseReset").onclick=()=>{ $("#expensePageForm").reset(); renderAddExpensePage(); };
  initTheme();
  renderAll();showPage("dashboard");
}
init();
