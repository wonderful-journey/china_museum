(function(){
const IDS=Object.keys(MUSEUMS);
// 等級篩選：值為 lv（0 為非評級的收藏機構）
const GRADES=[[null,"全部"],[1,"一級博物館"],[2,"二級博物館"],[0,"其他收藏機構"]];

const state={grade:null,hasItems:false,q:"",prov:null};
const qProv=new URLSearchParams(location.search).get("prov");
if(qProv&&IDS.some(m=>MUSEUMS[m].p===qProv))state.prov=qProv;

// 有收錄文物者優先，其次依等級（一級、二級、其他）、列入批次、館名
const lvRank=m=>MUSEUMS[m].lv||9;
const ORDER=IDS.slice().sort((a,b)=>musCount(b)-musCount(a)||lvRank(a)-lvRank(b)||(MUSEUMS[a].b||9)-(MUSEUMS[b].b||9)||MUSEUMS[a].n.localeCompare(MUSEUMS[b].n,"zh-Hant"));
function filtered(){
  const q=state.q.trim();
  return ORDER.filter(m=>{const x=MUSEUMS[m];
    return (state.grade===null||(x.lv||0)===state.grade)&&(!state.hasItems||musCount(m))&&(!q||x.n.includes(q)||x.p.includes(q)||x.city.includes(q));});
}
function byProv(ids){const o={};ids.forEach(m=>{const p=MUSEUMS[m].p;o[p]=(o[p]||0)+1;});return o;}

// stats
(function(){
  const provs=new Set(IDS.map(m=>MUSEUMS[m].p));
  $("#stats").innerHTML=[[IDS.length,"收藏機構"],[IDS.filter(m=>MUSEUMS[m].lv===1).length,"國家一級博物館"],[IDS.filter(m=>MUSEUMS[m].lv===2).length,"國家二級博物館"],[provs.size,"省級行政區"],[IDS.filter(musCount).length,"館有本站收錄文物"]]
    .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

// controls
function renderChips(){
  $("#kindG").innerHTML='<span class="lbl">等級</span>'+GRADES.map(([g,t])=>`<button class="chip" data-g="${g===null?"":g}" aria-pressed="${state.grade===g}">${t}</button>`).join("");
  $("#lvG").innerHTML=`<button class="chip" data-has aria-pressed="${state.hasItems}">只看有收錄文物的機構</button>`;
}
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-g]");
  if(g){state.grade=g.dataset.g===""?null:+g.dataset.g;update();return;}
  if(e.target.closest("[data-has]")){state.hasItems=!state.hasItems;update();return;}
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
      :`<div class="empty">沒有符合條件的機構。試試清除搜尋字或切換篩選。</div>`;
    return;
  }
  const inP=ids.filter(m=>MUSEUMS[m].p===state.prov);
  ph.innerHTML=`<div class="crumb"><button data-p="">← 全國</button><span>/</span><span>${state.prov}</span></div><h2>${state.prov}</h2><div class="sub">${inP.length} 個收藏機構 · 一級 ${inP.filter(m=>MUSEUMS[m].lv===1).length} · 二級 ${inP.filter(m=>MUSEUMS[m].lv===2).length}</div>`;
  pl.innerHTML=inP.length?inP.map(museumRow).join(""):`<div class="empty">${state.prov}在目前的篩選條件下沒有收藏機構。</div>`;
}

// 地圖下方的完整清單：依省份分組（機構多的省份在前），套用與地圖相同的篩選
function renderList(ids){
  const list=state.prov?ids.filter(m=>MUSEUMS[m].p===state.prov):ids;
  const groups={};list.forEach(m=>(groups[MUSEUMS[m].p]=groups[MUSEUMS[m].p]||[]).push(m));
  const arr=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length);
  $("#dir").innerHTML=`<div class="dirhead"><h2 class="hsect">機構清單</h2><span>${state.prov?state.prov+" · ":""}${list.length} 個機構</span></div>`
    +(arr.length?arr.map(([p,ms])=>`<div class="dgroup"><h3>${p}<span>${ms.length}</span></h3><div class="dgrid">${ms.map(museumRow).join("")}</div></div>`).join("")
      :`<div class="empty">沒有符合條件的機構。</div>`);
}

// map
const map=chinaMap($("#map"),$("#legend"),{steps:[1,5,10,20,40],
  tip:{prov:n=>`${n} 個機構`,point:n=>n?`${n} 件文物已收錄`:"點選查看機構"},
  onProv:prov=>{state.prov=(state.prov===prov?null:prov);update();},
  onPoint:d=>{location.href="museum.html?id="+d.id;}});
function update(){
  renderChips();
  const ids=filtered();
  renderPanel(ids);
  renderList(ids);
  map.render({provCounts:byProv(ids),sel:state.prov,
    points:ids.map(m=>({name:MUSEUMS[m].n,value:[...MUSEUMS[m].c,musCount(m)],prov:MUSEUMS[m].p,id:m}))});
}
update();
})();
