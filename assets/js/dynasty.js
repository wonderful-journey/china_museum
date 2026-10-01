(function(){
const ALL=UNIQUE_ITEMS;
// 只顯示本站有收錄文物的時期
const USED=PERIODS.filter(p=>ALL.some(it=>it.period===p.key));

const state={cat:null,q:""};
function filtered(){
  const q=state.q.trim().toLowerCase();
  return ALL.filter(it=>(!state.cat||it.cat===state.cat)&&
    (!q||it.name.toLowerCase().includes(q)||it.era.includes(q)||it.cat.includes(q)||it.mus.some(m=>MUSEUMS[m].n.includes(q)||MUSEUMS[m].p.includes(q))));
}

// stats
(function(){
  const cnt=p=>ALL.filter(it=>it.period===p.key).length;
  const top=USED.reduce((a,b)=>cnt(b)>cnt(a)?b:a);
  $("#stats").innerHTML=[[ALL.length,"件（組）文物"],[USED.length,"個時期"],[`${USED[0].s} → ${USED[USED.length-1].s}`,"涵蓋範圍"],[top.t,`收錄最多，${cnt(top)} 件`]]
    .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

function renderChips(){
  $("#catG").innerHTML='<span class="lbl">類別</span>'+[null,...CATS].map(c=>`<button class="chip" data-c="${c||""}" aria-pressed="${state.cat===c}">${c||"全部"}</button>`).join("");
}

let curList=[];
function update(){
  renderChips();
  const list=filtered();
  const groups=USED.map(p=>[p,list.filter(it=>it.period===p.key)]);
  curList=groups.flatMap(g=>g[1]);
  const max=Math.max(1,...groups.map(g=>g[1].length));
  $("#tbars").innerHTML=groups.map(([p,a])=>`<button class="tbar${a.length?"":" zero"}" data-per="${p.key}" title="${p.t} ${p.y}"${a.length?"":" disabled"}>
    <span class="n">${a.length}</span><span class="b" style="height:${a.length/max*120}px"></span><span class="l">${p.s}</span></button>`).join("");
  $("#tl").innerHTML=groups.filter(g=>g[1].length).map(([p,a])=>`<section class="panel" id="p-${p.key}"><h2>${p.t}<span>${p.y} · ${a.length} 件</span></h2><div class="grid">${a.map(itemRow).join("")}</div></section>`).join("")
    ||`<div class="panel"><div class="empty">沒有符合條件的文物。試試清除搜尋字或切換類別。</div></div>`;
  $("#pjump").innerHTML=groups.map(([p,a])=>`<button class="chip" data-per="${p.key}" title="${p.t} ${p.y}"${a.length?"":" disabled"}>${p.s}<small>${a.length}</small></button>`).join("");
  spy();
}

// 朝代快選：依捲動位置標示目前所在時期，並讓該按鈕保持在快選列可視範圍內
const bar=$("#pjump");
function syncBarH(){document.documentElement.style.setProperty("--pjump-h",bar.offsetHeight+"px");}
function spy(){
  const line=bar.offsetHeight+24;
  let cur=null;
  for(const s of document.querySelectorAll("#tl .panel[id]")){if(s.getBoundingClientRect().top<=line)cur=s.id.slice(2);else break;}
  for(const b of bar.querySelectorAll("[data-per]")){
    const on=b.dataset.per===cur;
    if(on&&b.getAttribute("aria-current")!=="true")
      bar.scrollTo({left:b.offsetLeft-(bar.clientWidth-b.offsetWidth)/2,behavior:"smooth"});
    b.setAttribute("aria-current",on);
  }
}
let ticking=false;
addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;spy();});}},{passive:true});
new ResizeObserver(syncBarH).observe(bar);

document.addEventListener("click",e=>{
  const c=e.target.closest("[data-c]");
  if(c){state.cat=c.dataset.c||null;update();return;}
  const b=e.target.closest("[data-per]");
  if(b){const s=$("#p-"+b.dataset.per);
    if(s)s.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});return;}
  const it=e.target.closest("[data-i]");
  if(it)openDetail(ITEM_INDEX[it.dataset.i],curList);
});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});

syncBarH();
update();
// 從首頁時間軸連入（#p-tang 等）時捲到該時期；時期區塊是程式產生的，瀏覽器不會自動捲動
if(/^#p-\w+$/.test(location.hash)){const s=$(location.hash);if(s)s.scrollIntoView();}
})();
