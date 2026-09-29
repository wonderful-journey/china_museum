(function(){
const id=new URLSearchParams(location.search).get("id");
const x=MUSEUMS[id];
const page=$("#page");

if(!x){
  page.innerHTML=`<header style="grid-template-columns:1fr"><div><h1>找不到這個收藏機構</h1>
    <p class="lede">網址中的機構代號不存在，請從 <a href="museums.html" style="color:var(--accent)">博物館名錄</a> 重新選擇。</p></div></header>`;
  return;
}
document.title=`${x.n}｜中國文物博物館`;

const items=MUS_ITEMS[id]||[];
const kw=encodeURIComponent(x.n);
const peers=Object.keys(MUSEUMS).filter(m=>m!==id&&MUSEUMS[m].p===x.p).sort((a,b)=>musCount(b)-musCount(a));

// 依專題分組，保留專題內原本順序
const groups=Object.entries(TOPICS).map(([k,t])=>[k,t,items.filter(it=>it.topic===k)]).filter(g=>g[2].length);

page.innerHTML=`
  <div class="crumbs"><a href="museums.html">博物館名錄</a><span>/</span><a href="museums.html?prov=${encodeURIComponent(x.p)}">${x.p}</a></div>
  <header style="grid-template-columns:1fr">
    <div>
      <h1>${x.n}${x.lv?'<span class="badge" style="font-size:13px;font-family:var(--sans)">國家一級博物館</span>':""}</h1>
      <p class="lede">${x.d?esc(x.d):"本站尚未撰寫這間機構的簡介，可由下方連結查看維基百科或地圖。"}</p>
    </div>
  </header>
  <div class="facts">
    <span>所在地 <b>${x.city===x.p?x.p:x.p+" · "+x.city}</b></span>
    <span>類型 <b>${x.k}</b></span>
    ${x.lv?`<span>列入一級博物館 <b>第 ${x.b} 批（${LV_BATCH[x.b]}）</b></span>`:""}
    <span>本站收錄 <b>${items.length} 件（組）文物</b></span>
  </div>
  <div class="linkrow">
    <a href="https://zh.wikipedia.org/w/index.php?search=${kw}" target="_blank" rel="noopener">維基百科 ↗</a>
    <a href="https://www.google.com/maps/search/${kw}" target="_blank" rel="noopener">地圖 ↗</a>
    <a href="https://www.google.com/search?q=${kw}+官方網站" target="_blank" rel="noopener">搜尋官方網站 ↗</a>
  </div>
  ${groups.map(([k,t,a])=>`<section class="panel"><h2><a href="${t.href}">${t.t}</a><span>${a.length} ${t.unit}</span></h2><div class="grid">${a.map(itemRow).join("")}</div></section>`).join("")
    ||`<div class="panel"><div class="empty">本站目前尚未收錄這個機構的文物。</div></div>`}
  ${peers.length?`<section class="panel"><h2>${x.p}的其他收藏機構<span>${peers.length} 個</span></h2><div class="grid">${peers.map(museumRow).join("")}</div></section>`:""}
  <footer><div>機構簡介為摘要整理；開放時間、票價與展出狀況請以館方公告為準。</div></footer>`;

// 詳情卡的上一件／下一件依頁面上的順序
const order=groups.flatMap(g=>g[2]);
document.addEventListener("click",e=>{
  const it=e.target.closest("[data-i]");
  if(it)openDetail(ITEM_INDEX[it.dataset.i],order);
});
})();
