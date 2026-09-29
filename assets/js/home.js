(function(){
// 各專題的文物收藏單位清單（每件一個陣列）；新增專題時在此加入
const TOPICS={
  forbidden:{unit:"件（組）",mus:FORBIDDEN.map(r=>r[4].split("|"))}
};

// stats
const provs=new Set(Object.values(MUSEUMS).map(m=>m.p));
const total=Object.values(TOPICS).reduce((n,t)=>n+t.mus.length,0);
const ready=SECTIONS.filter(s=>s.ready).length;
$("#stats").innerHTML=[[Object.keys(MUSEUMS).length,"收藏機構"],[provs.size,"省級行政區"],[total,"件（組）文物已收錄"],[`${ready} / ${SECTIONS.length}`,"專題已上線"]]
  .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");

// sections
$("#sections").innerHTML=SECTIONS.map(s=>{
  const t=TOPICS[s.key];
  const meta=s.ready?(t?`${t.mus.length} ${t.unit} · 進入專題 →`:"進入專題 →"):"籌備中";
  const body=`<h3>${s.t}</h3><p>${s.d}</p><span class="meta">${meta}</span>`;
  return s.ready?`<a class="sec" href="${s.href}">${body}</a>`:`<div class="sec soon">${body}</div>`;
}).join("");

// 各機構在所有專題中的文物數（同一件分藏多館時各館各計一次）
const cnt={};
Object.values(TOPICS).forEach(t=>t.mus.forEach(ms=>ms.forEach(m=>cnt[m]=(cnt[m]||0)+1)));
const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,10);
$("#toplist").innerHTML=top.map(([m,n])=>`<a class="rank" href="forbidden.html?prov=${encodeURIComponent(MUSEUMS[m].p)}"><span style="grid-column:1/3">${MUSEUMS[m].n}<span style="color:var(--muted);font-size:12px"> · ${MUSEUMS[m].p}</span></span><span class="n">${n}</span></a>`).join("");
})();
