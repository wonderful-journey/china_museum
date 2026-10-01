(function(){
// stats
const provs=new Set(Object.values(MUSEUMS).map(m=>m.p));
const total=UNIQUE_ITEMS.length;
$("#stats").innerHTML=[[Object.keys(MUSEUMS).length,"收藏機構"],[provs.size,"省級行政區"],[total,"件（組）文物已收錄"]]
  .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");

// 朝代時間軸：各時期等寬排列，點選連到依朝代瀏覽的該時期；本站無文物的時期不可點
const perCount=p=>UNIQUE_ITEMS.filter(it=>it.period===p.key).length;
$("#tlh").innerHTML=`<div class="tlh-row" style="grid-template-columns:repeat(${PERIODS.length},minmax(68px,1fr))">`+PERIODS.map(p=>{
  const n=perCount(p);
  const body=`<span class="band">${p.s}</span><span class="yr">${p.y.replace("–","<br>–")}</span><span class="n">${n?n+" 件":"—"}</span>`;
  return n?`<a class="seg" href="dynasty.html#p-${p.key}" title="${p.t}（${p.y}）">${body}</a>`:`<span class="seg none" title="${p.t}（${p.y}）：本站尚無收錄文物">${body}</span>`;
}).join("")+`</div>`;

// sections
const lv1=Object.values(MUSEUMS).filter(m=>m.lv===1).length,lv2=Object.values(MUSEUMS).filter(m=>m.lv===2).length;
const periods=new Set(UNIQUE_ITEMS.map(it=>it.period)).size;
// 非專題頁面（名錄、時間軸）的卡片數字
const EXTRA={museums:`${Object.keys(MUSEUMS).length} 個機構 · 一級 ${lv1}、二級 ${lv2}`,dynasty:`${total} 件 · ${periods} 個時期`};
$("#sections").innerHTML=SECTIONS.map(s=>{
  const t=TOPICS[s.key];
  const count=s.key==="treasures"&&TOPICS.collections?`${t.items.length+TOPICS.collections.items.length} 件 · `:t?`${t.items.length} ${t.unit} · `:EXTRA[s.key]?EXTRA[s.key]+" · ":"";
  const meta=s.ready?`${count}<span style="white-space:nowrap">進入專題 →</span>`:"籌備中";
  const body=`<h3>${s.t}</h3><p>${s.d}</p><span class="meta">${meta}</span>`;
  return s.ready?`<a class="sec" href="${s.href}">${body}</a>`:`<div class="sec soon">${body}</div>`;
}).join("");

// 關於本站：收錄數字隨資料更新
[["#ab-mus",Object.keys(MUSEUMS).length],["#ab-fb",TOPICS.forbidden.items.length],["#ab-tr",TOPICS.treasures.items.length],["#ab-cl",TOPICS.collections?new Set(TOPICS.collections.items.map(it=>it.mus[0])).size:0],["#ab-cln",TOPICS.collections?TOPICS.collections.items.length:0],["#ab-all",total],["#ab-per",PERIODS.length]]
  .forEach(([sel,n])=>$(sel).textContent=n);
})();
