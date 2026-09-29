(function(){
const ITEMS=TOPICS.forbidden.items;

const state={batch:new Set([1,2,3]),cat:null,q:"",prov:null};
// 支援 ?prov=北京 直接開啟省份（首頁等其他頁面連入用）
const qProv=new URLSearchParams(location.search).get("prov");
if(qProv&&Object.values(MUSEUMS).some(m=>m.p===qProv))state.prov=qProv;

function filtered(){
  const q=state.q.trim().toLowerCase();
  return ITEMS.filter(it=>state.batch.has(it.batch)&&(!state.cat||it.cat===state.cat)&&
    (!q||it.name.toLowerCase().includes(q)||it.era.includes(q)||it.cat.includes(q)||it.mus.some(m=>MUSEUMS[m].n.includes(q)||MUSEUMS[m].p.includes(q))));
}
function byProv(list){const o={};list.forEach(it=>{const ps=new Set(it.mus.map(m=>MUSEUMS[m].p));ps.forEach(p=>o[p]=(o[p]||0)+1);});return o;}
function byMus(list){const o={};list.forEach(it=>it.mus.forEach(m=>{(o[m]=o[m]||[]).push(it);}));return o;}

// stats
(function(){
  // 只計入收藏本專題文物的機構
  const mus=new Set(ITEMS.flatMap(i=>i.mus));
  const provs=new Set([...mus].map(m=>MUSEUMS[m].p));
  const gg=ITEMS.filter(i=>i.mus.includes("gg")).length;
  const perBatch=[1,2,3].map(b=>ITEMS.filter(i=>i.batch===b).length);
  $("#stats").innerHTML=[[ITEMS.length,"件（組）文物"],[perBatch.join(" · "),[1,2,3].map(b=>BATCH[b].y).join(" · ")],[mus.size,"收藏機構"],[provs.size,"省級行政區"],[gg,"故宮博物院收藏，居首"]]
   .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

// controls
function renderChips(){
  $("#batchG").innerHTML='<span class="lbl">批次</span>'+[1,2,3].map(b=>`<button class="chip" data-b="${b}" aria-pressed="${state.batch.has(b)}"><span class="dot" style="background:var(--b${b})"></span>${BATCH[b].t} ${BATCH[b].y}</button>`).join("");
  $("#catG").innerHTML='<span class="lbl">類別</span>'+[null,...CATS].map(c=>`<button class="chip" data-c="${c||""}" aria-pressed="${state.cat===c}">${c||"全部"}</button>`).join("");
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-b]");
  if(b){const v=+b.dataset.b; if(state.batch.has(v)&&state.batch.size>1)state.batch.delete(v); else state.batch.add(v); update();return;}
  const c=e.target.closest("[data-c]");
  if(c){state.cat=c.dataset.c||null; update();return;}
  const p=e.target.closest("[data-p]");
  if(p){state.prov=p.dataset.p||null; update();return;}
  const it=e.target.closest("[data-i]");
  if(it){openDetail(ITEM_INDEX[it.dataset.i],curList);return;}
});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});

// panel
function renderPanel(list){
  const ph=$("#ph"), pl=$("#plist");
  if(!state.prov){
    const bp=byProv(list); const arr=Object.entries(bp).sort((a,b)=>b[1]-a[1]); const max=arr.length?arr[0][1]:1;
    ph.innerHTML=`<div class="crumb">全國總覽</div><h2>${list.length} 件（組）</h2><div class="sub">分布於 ${arr.length} 個省級行政區。點選下方或地圖上的省份查看細目。</div>`;
    const bm=byMus(list); const ms=Object.entries(bm).sort((a,b)=>b[1].length-a[1].length).slice(0,8);
    pl.innerHTML=arr.length?`<div class="sect">各省數量</div>`+arr.map(([p,n])=>`<button class="rank" data-p="${p}"><span>${p}</span><span class="bar" style="width:${Math.max(4,n/max*100)}%"></span><span class="n">${n}</span></button>`).join("")
      +`<div class="sect">收藏最多的機構</div>`+ms.map(([m,a])=>`<button class="rank" data-p="${MUSEUMS[m].p}"><span style="grid-column:1/3">${MUSEUMS[m].n}<span class="meta" style="color:var(--muted);font-size:12px"> · ${MUSEUMS[m].p}</span></span><span class="n">${a.length}</span></button>`).join("")
      :`<div class="empty">沒有符合條件的文物。試試清除搜尋字或切換類別。</div>`;
    return;
  }
  const inP=list.filter(it=>it.mus.some(m=>MUSEUMS[m].p===state.prov));
  const bm={}; inP.forEach(it=>it.mus.filter(m=>MUSEUMS[m].p===state.prov).forEach(m=>(bm[m]=bm[m]||[]).push(it)));
  const ms=Object.entries(bm).sort((a,b)=>b[1].length-a[1].length);
  ph.innerHTML=`<div class="crumb"><button data-p="">← 全國</button><span>/</span><span>${state.prov}</span></div><h2>${state.prov}</h2><div class="sub">${inP.length} 件（組）· ${ms.length} 個收藏機構</div>`;
  pl.innerHTML=ms.length?ms.map(([m,a])=>`<div class="mus"><h3><a href="museum.html?id=${m}">${MUSEUMS[m].n}</a><span>${a.length} 件</span></h3>${a.map(itemRow).join("")}</div>`).join("")
    :`<div class="empty">${state.prov}在目前的篩選條件下沒有禁止出境展覽文物。</div>`;
}

// map
let curList=[];
const map=chinaMap($("#map"),$("#legend"),{steps:[1,4,10,20,40],
  onProv:prov=>{state.prov=(state.prov===prov?null:prov);update();}});
function update(){
  renderChips();
  const list=filtered();
  if(state.prov) curList=list.filter(it=>it.mus.some(m=>MUSEUMS[m].p===state.prov)); else curList=list;
  renderPanel(list);
  map.render({provCounts:byProv(list),sel:state.prov,
    points:Object.entries(byMus(list)).map(([m,a])=>({name:MUSEUMS[m].n,value:[...MUSEUMS[m].c,a.length],prov:MUSEUMS[m].p,id:m}))});
}
update();
})();
