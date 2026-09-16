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
function getState(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(DEFAULT_STATE)}catch{return structuredClone(DEFAULT_STATE)}}
function saveState(s){localStorage.setItem(KEY,JSON.stringify(s))}
function money(n,s=getState()){return `${s.currency}${Math.round(Number(n)||0).toLocaleString("en-IN")}`}
function today(){return new Date().toISOString().slice(0,10)}
function monthTx(s=getState()){const m=today().slice(0,7);return s.transactions.filter(t=>t.date?.slice(0,7)===m)}
function expenses(s=getState()){return monthTx(s).filter(t=>t.type==="expense")}
function incomes(s=getState()){return monthTx(s).filter(t=>t.type==="income")}
function total(a){return a.reduce((sum,t)=>sum+Number(t.amount||0),0)}
function icon(category){return (CATEGORIES.find(c=>c[0]===category)||["","•"])[1]}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function setTheme(dark){
 document.documentElement.classList.toggle("dark",!!dark);
 localStorage.setItem("smartExpense_theme",dark?"dark":"light");
 const b=document.getElementById("themeBtn"); if(b)b.textContent=dark?"☾":"☼";
}
(function(){if(localStorage.getItem("smartExpense_theme")==="dark")document.documentElement.classList.add("dark")})();
function toggleTheme(){setTheme(!document.documentElement.classList.contains("dark"))}
function go(page){window.location.href=page}
function nav(active){
 const items=[
  ["index.html","⌂","Dashboard"],["add-expense.html","+","Add Expense"],
  ["recent-transactions.html","🧾","Recent Transactions"],["analysis.html","◉","See Analysis"],
  ["income.html","↗","Income"],["budgets.html","◴","Budgets"],["goals.html","◎","Goals"],["settings.html","⚙","Settings"]
 ];
 const desktop=document.getElementById("desktopNav"), mobile=document.getElementById("mobileNav");
 const make=(i)=>`<a href="${i[0]}" class="nav-link ${active===i[0]?"nav-active":""} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition hover:bg-slate-100"><span>${i[1]}</span>${i[2]}</a>`;
 if(desktop)desktop.innerHTML=items.map(make).join("");
 if(mobile)mobile.innerHTML=items.slice(0,5).map(make).join("");
}
function baseCss(){
 return `<style>
 *{box-sizing:border-box}body{min-height:100vh;background:#f6f8fb;color:#0f172a;transition:.25s}
 .glass{background:rgba(255,255,255,.82);backdrop-filter:blur(18px);border:1px solid rgba(226,232,240,.9)}
 .card-3d{transition:transform .25s,box-shadow .25s}.card-3d:hover{transform:perspective(900px) rotateX(2deg) rotateY(-2deg) translateY(-3px);box-shadow:0 20px 45px rgba(15,23,42,.1)}
 @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.float{animation:float 5s ease-in-out infinite}
 html.dark,html.dark body{background:#070b14!important;color:#e5e7eb!important}
 html.dark .glass{background:rgba(15,23,42,.96)!important;border-color:#263449!important;color:#e5e7eb!important}
 html.dark .bg-white,html.dark .bg-slate-50{background:#0f172a!important}html.dark .bg-slate-100{background:#1e293b!important}
 html.dark .text-slate-800,html.dark .text-slate-900{color:#f1f5f9!important}html.dark .text-slate-500{color:#94a3b8!important}
 html.dark .text-slate-400{color:#64748b!important}html.dark input,html.dark select,html.dark textarea{background:#111827!important;color:#f8fafc!important;border-color:#334155!important}
 html.dark .border-slate-200{border-color:#334155!important}html.dark .divide-slate-100>:not([hidden])~:not([hidden]){border-color:#263449!important}
 html.dark .hover\\:bg-slate-50:hover,html.dark .hover\\:bg-slate-100:hover{background:#1e293b!important}
 html.dark .bg-rose-50{background:#3b1118!important}html.dark .bg-emerald-50{background:#052e24!important}
 @media(min-width:1600px){body{font-size:18px}.tv-shell{max-width:1900px}}
 @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
 </style>`
