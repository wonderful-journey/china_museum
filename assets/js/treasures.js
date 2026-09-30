(function(){
const ITEMS=TOPICS.treasures.items;

const state={cat:null,q:"",prov:null};
const qProv=new URLSearchParams(location.search).get("prov");
if(qProv&&ITEMS.some(it=>MUSEUMS[it.mus[0]].p===qProv))state.prov=qProv;

const musOf=it=>it.mus[0];
function filtered(){
  const q=state.q.trim().toLowerCase();
  return ITEMS.filter(it=>{const m=MUSEUMS[musOf(it)];
    return (!state.cat||it.cat===state.cat)&&(!q||it.name.toLowerCase().includes(q)||it.era.includes(q)||it.cat.includes(q)||m.n.includes(q)||m.p.includes(q)||m.city.includes(q));});
}
function byMus(list){const o={};list.forEach(it=>(o[musOf(it)]=o[musOf(it)]||[]).push(it));return o;}
function byProv(list){const o={};list.forEach(it=>{const p=MUSEUMS[musOf(it)].p;o[p]=(o[p]||0)+1;});return o;}

// stats
(function(){
  const mus=new Set(ITEMS.map(musOf));
  const provs=new Set([...mus].map(m=>MUSEUMS[m].p));
  $("#stats").innerHTML=[[ITEMS.length,"件鎮館之寶"],[mus.size,"座博物館"],[provs.size,"省級行政區"],[ITEMS.filter(it=>it.dup).length,"件亦列禁止出境文物"]]
    .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

function renderChips(){
  const used=CATS.filter(c=>ITEMS.some(it=>it.cat===c));
  $("#catG").innerHTML='<span class="lbl">類別</span>'+[null,...used].map(c=>`<button class="chip" data-c="${c||""}" aria-pressed="${state.cat===c}">${c||"全部"}</button>`).join("");
}
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-c]");
  if(c){state.cat=c.dataset.c||null;update();return;}
  const p=e.target.closest("[data-p]");
  if(p){state.prov=p.dataset.p||null;update();return;}
  const it=e.target.closest("[data-i]");
  if(it)openDetail(ITEM_INDEX[it.dataset.i],curList);
});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});

function museumBlock([m,a]){return `<div class="mus"><h3><a href="museum.html?id=${m}">${MUSEUMS[m].n}</a><span>${MUSEUMS[m].city===MUSEUMS[m].p?MUSEUMS[m].p:MUSEUMS[m].city}</span></h3>${a.map(itemRow).join("")}</div>`;}

let curList=[];
function renderPanel(list){
  const ph=$("#ph"), pl=$("#plist");
  if(!state.prov){
    const arr=Object.entries(byProv(list)).sort((a,b)=>b[1]-a[1]); const max=arr.length?arr[0][1]:1;
    ph.innerHTML=`<div class="crumb">全國總覽</div><h2>${list.length} 件鎮館之寶</h2><div class="sub">來自 ${Object.keys(byMus(list)).length} 座博物館、${arr.length} 個省級行政區。點選省份查看各館。</div>`;
    pl.innerHTML=arr.length?`<div class="sect">各省數量</div>`+arr.map(([p,n])=>`<button class="rank" data-p="${p}"><span>${p}</span><span class="bar" style="width:${Math.max(4,n/max*100)}%"></span><span class="n">${n}</span></button>`).join("")
      :`<div class="empty">沒有符合條件的文物。試試清除搜尋字或切換類別。</div>`;
    curList=list;
    return;
  }
  const inP=list.filter(it=>MUSEUMS[musOf(it)].p===state.prov);
  const ms=Object.entries(byMus(inP));
  curList=ms.flatMap(g=>g[1]);
  ph.innerHTML=`<div class="crumb"><button data-p="">← 全國</button><span>/</span><span>${state.prov}</span></div><h2>${state.prov}</h2><div class="sub">${inP.length} 件 · ${ms.length} 座博物館</div>`;
  pl.innerHTML=ms.length?ms.map(museumBlock).join(""):`<div class="empty">${state.prov}在目前的篩選條件下沒有鎮館之寶。</div>`;
}

const map=chinaMap($("#map"),$("#legend"),{steps:[1,2,3],base:3,
  onProv:prov=>{state.prov=(state.prov===prov?null:prov);update();}});
function update(){
  renderChips();
  const list=filtered();
  renderPanel(list);
  map.render({provCounts:byProv(list),sel:state.prov,
    points:Object.entries(byMus(list)).map(([m,a])=>({name:MUSEUMS[m].n,value:[...MUSEUMS[m].c,a.length],prov:MUSEUMS[m].p,id:m}))});
}
update();
})();
