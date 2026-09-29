(function(){
// stats
const provs=new Set(Object.values(MUSEUMS).map(m=>m.p));
const total=Object.values(TOPICS).reduce((n,t)=>n+t.items.length,0);
const ready=SECTIONS.filter(s=>s.ready).length;
$("#stats").innerHTML=[[Object.keys(MUSEUMS).length,"收藏機構"],[provs.size,"省級行政區"],[total,"件（組）文物已收錄"],[`${ready} / ${SECTIONS.length}`,"專題已上線"]]
  .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");

// sections
const lv1=Object.values(MUSEUMS).filter(m=>m.lv).length;
const periods=new Set(Object.values(ITEM_INDEX).map(it=>it.period)).size;
// 非專題頁面（名錄、時間軸）的卡片數字
const EXTRA={museums:`${Object.keys(MUSEUMS).length} 個機構 · ${lv1} 個一級博物館`,dynasty:`${total} 件 · ${periods} 個時期`};
$("#sections").innerHTML=SECTIONS.map(s=>{
  const t=TOPICS[s.key];
  const count=t?`${t.items.length} ${t.unit} · `:EXTRA[s.key]?EXTRA[s.key]+" · ":"";
  const meta=s.ready?`${count}<span style="white-space:nowrap">進入專題 →</span>`:"籌備中";
  const body=`<h3>${s.t}</h3><p>${s.d}</p><span class="meta">${meta}</span>`;
  return s.ready?`<a class="sec" href="${s.href}">${body}</a>`:`<div class="sec soon">${body}</div>`;
}).join("");
})();
