(function(){
const ITEMS=TOPICS.treasures.items;
const musOf=it=>it.mus[0];
// 省份依資料排列順序（北京、天津、河北……）
const PROVS=[...new Set(ITEMS.map(it=>MUSEUMS[musOf(it)].p))];

const state={cat:null,q:"",prov:null};
const qProv=new URLSearchParams(location.search).get("prov");
if(PROVS.includes(qProv))state.prov=qProv;

function filtered(){
  const q=state.q.trim().toLowerCase();
  return ITEMS.filter(it=>{const m=MUSEUMS[musOf(it)];
    return (!state.cat||it.cat===state.cat)&&(!state.prov||m.p===state.prov)
      &&(!q||it.name.toLowerCase().includes(q)||it.era.includes(q)||it.cat.includes(q)||m.n.includes(q)||m.p.includes(q)||m.city.includes(q));});
}
function byMus(list){const o={};list.forEach(it=>(o[musOf(it)]=o[musOf(it)]||[]).push(it));return o;}

// stats
(function(){
  const mus=new Set(ITEMS.map(musOf));
  $("#stats").innerHTML=[[ITEMS.length,"件鎮館之寶"],[mus.size,"座博物館"],[PROVS.length,"省級行政區"],[ITEMS.filter(it=>it.dup).length,"件亦列禁止出境文物"]]
    .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

// controls
function renderChips(){
  const used=CATS.filter(c=>ITEMS.some(it=>it.cat===c));
  $("#catG").innerHTML='<span class="lbl">類別</span>'+[null,...used].map(c=>`<button class="chip" data-c="${c||""}" aria-pressed="${state.cat===c}">${c||"全部"}</button>`).join("");
}
$("#prov").innerHTML=`<option value="">全部省份</option>`+PROVS.map(p=>`<option${p===state.prov?" selected":""}>${p}</option>`).join("");
$("#prov").addEventListener("change",e=>{state.prov=e.target.value||null;update();});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-c]");
  if(c){state.cat=c.dataset.c||null;update();return;}
  const it=e.target.closest("[data-i]");
  if(it)openDetail(ITEM_INDEX[it.dataset.i],curList);
});

// 清單：每館一張卡片，依省份順序排列
let curList=[];
function museumCard([m,a]){const x=MUSEUMS[m];
  return `<div class="tcard"><div class="prov">${x.p}${x.city===x.p?"":" · "+x.city}</div><h3><a href="museum.html?id=${m}">${x.n}</a></h3>${a.map(itemRow).join("")}</div>`;}
function update(){
  renderChips();
  const groups=Object.entries(byMus(filtered()));
  curList=groups.flatMap(g=>g[1]);
  $("#tlist").innerHTML=groups.length?`<div class="tgrid">${groups.map(museumCard).join("")}</div>`
    :`<div class="empty">沒有符合條件的文物。試試清除搜尋字或切換類別、省份。</div>`;
}
update();
})();
