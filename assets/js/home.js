(function(){
// stats
const provs=new Set(Object.values(MUSEUMS).map(m=>m.p));
const total=Object.values(TOPICS).reduce((n,t)=>n+t.items.length,0);
const ready=SECTIONS.filter(s=>s.ready).length;
$("#stats").innerHTML=[[Object.keys(MUSEUMS).length,"收藏機構"],[provs.size,"省級行政區"],[total,"件（組）文物已收錄"],[`${ready} / ${SECTIONS.length}`,"專題已上線"]]
  .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");

// sections
const lv1=Object.values(MUSEUMS).filter(m=>m.lv1).length;
$("#sections").innerHTML=SECTIONS.map(s=>{
  const t=TOPICS[s.key];
  const count=t?`${t.items.length} ${t.unit} · `:s.key==="museums"?`${Object.keys(MUSEUMS).length} 個機構 · ${lv1} 個一級博物館 · `:"";
  const meta=s.ready?`${count}進入專題 →`:"籌備中";
  const body=`<h3>${s.t}</h3><p>${s.d}</p><span class="meta">${meta}</span>`;
  return s.ready?`<a class="sec" href="${s.href}">${body}</a>`:`<div class="sec soon">${body}</div>`;
}).join("");

// 收錄文物最多的機構
const top=Object.keys(MUS_ITEMS).sort((a,b)=>musCount(b)-musCount(a)).slice(0,10);
$("#toplist").innerHTML=top.map(museumRow).join("");
})();
