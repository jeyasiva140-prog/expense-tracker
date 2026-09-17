/* SmartExpense shared data + utilities for every page */
const CATEGORIES=[
 ["Food","🍔"],["Transport","🚗"],["Shopping","🛍️"],["Bills","🏠"],
 ["Entertainment","🎮"],["Travel","✈️"],["Health","💊"],["Education","📚"],["Others","📦"]
];
const KEY="smartExpense_v1";
const DEFAULT_STATE={
 transactions:[
  {id:1,type:"income",amount:50000,description:"Monthly salary",category:"Salary",date:"2026-09-01",method:"Bank transfer"},
  {id:2,type:"expense",amount:850,description:"Groceries",category:"Food",date:"2026-09-02",method:"UPI"},
  {id:3,type:"expense",amount:420,description:"Fuel",category:"Transport",date:"2026-09-04",method:"Card"},
  {id:4,type:"expense",amount:1290,description:"Online shopping",category:"Shopping",date:"2026-09-06",method:"UPI"},
  {id:5,type:"expense",amount:650,description:"Electricity bill",category:"Bills",date:"2026-09-08",method:"Bank transfer"},
  {id:6,type:"expense",amount:320,description:"Lunch",category:"Food",date:"2026-09-10",method:"UPI"},
  {id:7,type:"expense",amount:550,description:"Movie & snacks",category:"Entertainment",date:"2026-09-12",method:"Card"}
 ],
 budgets:{Food:5000,Transport:4000,Shopping:4000,Bills:8000,Entertainment:2500,Travel:6000,Health:3000,Education:3000,Others:2500},
 goals:[{id:1,name:"Emergency Fund",target:50000,current:19000,date:"2027-03-01"}],
 currency:"₹"
};

function cloneDefault(){return JSON.parse(JSON.stringify(DEFAULT_STATE));}
function state(){
 try{
  const saved=JSON.parse(localStorage.getItem(KEY));
  if(saved && Array.isArray(saved.transactions)) return saved;
 }catch(e){}
 const fresh=cloneDefault();
 save(fresh);
 return fresh;
}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));}
function getState(){return state();}
function saveState(s){save(s);}
function money(n,s=state()){return `${s.currency}${Math.round(Number(n)||0).toLocaleString("en-IN")}`;}
function today(){return new Date().toISOString().slice(0,10);}
function monthTx(s=state()){const m=today().slice(0,7);return s.transactions.filter(t=>String(t.date||"").slice(0,7)===m);}
function ex(s=state()){return monthTx(s).filter(t=>t.type==="expense");}
function inc(s=state()){return monthTx(s).filter(t=>t.type==="income");}
function expenses(s=state()){return ex(s);}
function incomes(s=state()){return inc(s);}
function total(a){return a.reduce((sum,t)=>sum+Number(t.amount||0),0);}
function icon(category){return (CATEGORIES.find(c=>c[0]===category)||["","•"])[1];}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function addSharedTransaction(data){
 const s=state();
 const t={id:Date.now()+Math.floor(Math.random()*1000),type:data.type||"expense",amount:Number(data.amount),description:String(data.description||"").trim(),category:data.category||"Others",date:data.date||today(),method:data.method||"UPI",notes:String(data.notes||"").trim()};
 s.transactions.unshift(t); save(s); return t;
}
function deleteSharedTransaction(id){const s=state();s.transactions=s.transactions.filter(t=>Number(t.id)!==Number(id));save(s);return s;}
function setTheme(dark){
 document.documentElement.classList.toggle("dark",!!dark);
 localStorage.setItem("smartExpense_theme",dark?"dark":"light");
 const b=document.getElementById("themeBtn"); if(b)b.textContent=dark?"☾":"☼";
}
function toggleTheme(){setTheme(!document.documentElement.classList.contains("dark"));}
function applySavedTheme(){if(localStorage.getItem("smartExpense_theme")==="dark")document.documentElement.classList.add("dark");}
function nav(active){
 const items=[
  ["index.html","⌂","Dashboard"],["add-expense.html","+","Add Expense"],
  ["recent-transactions.html","🧾","Recent Transactions"],["analysis.html","◉","See Analysis"],
  ["income.html","↗","Income"],["budgets.html","◴","Budgets"],["goals.html","◎","Goals"],["settings.html","⚙","Settings"]
 ];
 const desktop=document.getElementById("desktopNav"),mobile=document.getElementById("mobileNav");
 const make=i=>`<a href="${i[0]}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800 ${active===i[0]?"bg-slate-100 dark:bg-slate-800":""}"><span>${i[1]}</span>${i[2]}</a>`;
 if(desktop)desktop.innerHTML=items.map(make).join("");
 if(mobile)mobile.innerHTML=items.slice(0,5).map(make).join("");
}
window.addEventListener("storage",()=>{if(typeof render==="function")render();});
applySavedTheme();
