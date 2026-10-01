(function(){
// 鎮館之寶與館藏精選同頁呈現；kind：tr 鎮館之寶、cl 館藏精選
const TR=TOPICS.treasures.items,CL=TOPICS.collections?TOPICS.collections.items:[];
const ITEMS=[...TR,...CL];
const kindOf=it=>it.topic==="treasures"?"tr":"cl";
const KINDS={tr:"鎮館之寶",cl:"館藏精選"};
const musOf=it=>it.mus[0];
// 省份依名錄資料排列順序（北京、天津、河北……）
const PROVS=[...new Set(Object.values(MUSEUMS).map(x=>x.p))].filter(p=>ITEMS.some(it=>MUSEUMS[musOf(it)].p===p));
const hasTr=new Set(TR.map(musOf));

const params=new URLSearchParams(location.search);
const state={kind:KINDS[params.get("kind")]?params.get("kind"):null,cat:null,q:"",prov:null};
if(PROVS.includes(params.get("prov")))state.prov=params.get("prov");

function filtered(){
  const q=state.q.trim().toLowerCase();
  return ITEMS.filter(it=>{const m=MUSEUMS[musOf(it)];
    return (!state.kind||kindOf(it)===state.kind)&&(!state.cat||it.cat===state.cat)&&(!state.prov||m.p===state.prov)
      &&(!q||it.name.toLowerCase().includes(q)||it.era.includes(q)||it.cat.includes(q)||m.n.includes(q)||m.p.includes(q)||m.city.includes(q));});
}

// stats
$("#stats").innerHTML=[[TR.length,"件鎮館之寶"],[CL.length,"件館藏精選"],[new Set(ITEMS.map(musOf)).size,"座博物館"],[PROVS.length,"省級行政區"]]
  .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");

// controls
function renderChips(){
  $("#kindG").innerHTML='<span class="lbl">種類</span>'+[null,"tr","cl"].map(k=>`<button class="chip" data-k="${k||""}" aria-pressed="${state.kind===k}">${k?KINDS[k]:"全部"}</button>`).join("");
  const used=CATS.filter(c=>ITEMS.some(it=>it.cat===c));
  $("#catG").innerHTML='<span class="lbl">類別</span>'+[null,...used].map(c=>`<button class="chip" data-c="${c||""}" aria-pressed="${state.cat===c}">${c||"全部"}</button>`).join("");
}
$("#prov").innerHTML=`<option value="">全部省份</option>`+PROVS.map(p=>`<option${p===state.prov?" selected":""}>${p}</option>`).join("");
$("#prov").addEventListener("change",e=>{state.prov=e.target.value||null;update();});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});
document.addEventListener("click",e=>{
  const k=e.target.closest("[data-k]");
  if(k){state.kind=k.dataset.k||null;update();return;}
  const c=e.target.closest("[data-c]");
  if(c){state.cat=c.dataset.c||null;update();return;}
  const it=e.target.closest("[data-i]");
  if(it)openDetail(ITEM_INDEX[it.dataset.i],curList);
});

// 清單：每館一張卡片；依省份順序，同省內有鎮館之寶的館在前，其次依等級與件數
const lvRank=m=>MUSEUMS[m].lv||9;
let curList=[];
function museumCard([m,a]){const x=MUSEUMS[m];
  const sub=k=>{const b=a.filter(it=>kindOf(it)===k);return b.length?`<div class="tsub ${k}">${KINDS[k]}</div>${b.map(itemRow).join("")}`:"";};
  return `<div class="tcard"><div class="prov">${x.p}${x.city===x.p?"":" · "+x.city}${gradeBadge(x)}</div><h3><a href="museum.html?id=${m}">${x.n}</a></h3>${sub("tr")}${sub("cl")}</div>`;}
function update(){
  renderChips();
  const o={};filtered().forEach(it=>(o[musOf(it)]=o[musOf(it)]||[]).push(it));
  const groups=Object.entries(o).sort(([a,x],[b,y])=>PROVS.indexOf(MUSEUMS[a].p)-PROVS.indexOf(MUSEUMS[b].p)
    ||hasTr.has(b)-hasTr.has(a)||lvRank(a)-lvRank(b)||y.length-x.length);
  curList=groups.flatMap(([,a])=>[...a.filter(it=>kindOf(it)==="tr"),...a.filter(it=>kindOf(it)==="cl")]);
  $("#tlist").innerHTML=groups.length?`<div class="tgrid">${groups.map(museumCard).join("")}</div>`
    :`<div class="empty">沒有符合條件的文物。試試清除搜尋字或切換種類、類別、省份。</div>`;
}
update();
})();
