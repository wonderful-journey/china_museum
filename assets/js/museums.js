(function(){
const KINDS=["博物館","考古機構","圖書館","高校"];
const IDS=Object.keys(MUSEUMS);

const state={kind:null,lv1:false,q:"",prov:null};
const qProv=new URLSearchParams(location.search).get("prov");
if(qProv&&IDS.some(m=>MUSEUMS[m].p===qProv))state.prov=qProv;

function filtered(){
  const q=state.q.trim();
  return IDS.filter(m=>{const x=MUSEUMS[m];
    return (!state.kind||x.k===state.kind)&&(!state.lv1||x.lv1)&&(!q||x.n.includes(q)||x.p.includes(q)||x.city.includes(q));})
    .sort((a,b)=>musCount(b)-musCount(a));
}
function byProv(ids){const o={};ids.forEach(m=>{const p=MUSEUMS[m].p;o[p]=(o[p]||0)+1;});return o;}

// stats
(function(){
  const provs=new Set(IDS.map(m=>MUSEUMS[m].p));
  const total=Object.values(TOPICS).reduce((n,t)=>n+t.items.length,0);
  $("#stats").innerHTML=[[IDS.length,"收藏機構"],[IDS.filter(m=>MUSEUMS[m].lv1).length,"國家一級博物館"],[provs.size,"省級行政區"],[total,"件（組）文物已收錄"]]
    .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

// controls
function renderChips(){
  $("#kindG").innerHTML='<span class="lbl">類型</span>'+[null,...KINDS].map(k=>`<button class="chip" data-k="${k||""}" aria-pressed="${state.kind===k}">${k||"全部"}</button>`).join("");
  $("#lvG").innerHTML=`<button class="chip" data-lv aria-pressed="${state.lv1}">只看國家一級博物館</button>`;
}
document.addEventListener("click",e=>{
  const k=e.target.closest("[data-k]");
  if(k){state.kind=k.dataset.k||null;update();return;}
  if(e.target.closest("[data-lv]")){state.lv1=!state.lv1;update();return;}
  const p=e.target.closest("[data-p]");
  if(p){state.prov=p.dataset.p||null;update();}
});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});

// panel
function renderPanel(ids){
  const ph=$("#ph"), pl=$("#plist");
  if(!state.prov){
    const arr=Object.entries(byProv(ids)).sort((a,b)=>b[1]-a[1]); const max=arr.length?arr[0][1]:1;
    ph.innerHTML=`<div class="crumb">全國總覽</div><h2>${ids.length} 個收藏機構</h2><div class="sub">分布於 ${arr.length} 個省級行政區。點選省份或機構查看細目。</div>`;
    pl.innerHTML=arr.length?`<div class="sect">各省機構數</div>`+arr.map(([p,n])=>`<button class="rank" data-p="${p}"><span>${p}</span><span class="bar" style="width:${Math.max(4,n/max*100)}%"></span><span class="n">${n}</span></button>`).join("")
      +`<div class="sect">全部機構（依收錄文物數）</div>`+ids.map(museumRow).join("")
      :`<div class="empty">沒有符合條件的機構。試試清除搜尋字或切換類型。</div>`;
    return;
  }
  const inP=ids.filter(m=>MUSEUMS[m].p===state.prov);
  ph.innerHTML=`<div class="crumb"><button data-p="">← 全國</button><span>/</span><span>${state.prov}</span></div><h2>${state.prov}</h2><div class="sub">${inP.length} 個收藏機構 · ${inP.filter(m=>MUSEUMS[m].lv1).length} 個國家一級博物館</div>`;
  pl.innerHTML=inP.length?inP.map(museumRow).join(""):`<div class="empty">${state.prov}在目前的篩選條件下沒有收藏機構。</div>`;
}

// map
const map=chinaMap($("#map"),$("#legend"),{steps:[1,2,3,4,6],
  tip:{prov:n=>`${n} 個機構`,point:n=>`${n} 件文物已收錄`},
  onProv:prov=>{state.prov=(state.prov===prov?null:prov);update();},
  onPoint:d=>{location.href="museum.html?id="+d.id;}});
function update(){
  renderChips();
  const ids=filtered();
  renderPanel(ids);
  map.render({provCounts:byProv(ids),sel:state.prov,
    points:ids.map(m=>({name:MUSEUMS[m].n,value:[...MUSEUMS[m].c,musCount(m)],prov:MUSEUMS[m].p,id:m}))});
}
update();
})();
