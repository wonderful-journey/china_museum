(function(){
const BATCH={1:{y:2002,t:"第一批"},2:{y:2012,t:"第二批"},3:{y:2013,t:"第三批"}};
const CATS=["青銅","陶瓷","玉器","書法","繪畫","漆木","金銀玻璃","織繡","壁畫石刻","簡帛古籍","其他"];

const counters={1:0,2:0,3:0};
const ITEMS=FORBIDDEN.map((r,i)=>{counters[r[0]]++;return {id:i,batch:r[0],no:counters[r[0]],cat:r[1],name:r[2],era:r[3],mus:r[4].split("|"),desc:r[5]};});

const state={batch:new Set([1,2,3]),cat:null,q:"",prov:null};
// 支援 ?prov=北京 直接開啟省份（首頁等其他頁面連入用）
const qProv=new URLSearchParams(location.search).get("prov");
if(qProv&&Object.values(MUSEUMS).some(m=>m.p===qProv))state.prov=qProv;

function filtered(){
  const q=state.q.trim().toLowerCase();
  return ITEMS.filter(it=>state.batch.has(it.batch)&&(!state.cat||it.cat===state.cat)&&
    (!q||it.name.toLowerCase().includes(q)||it.era.includes(q)||it.cat.includes(q)||it.mus.some(m=>MUSEUMS[m].n.includes(q)||MUSEUMS[m].p.includes(q))));
}
function byProv(list){const o={};list.forEach(it=>{const ps=new Set(it.mus.map(m=>MUSEUMS[m].p));ps.forEach(p=>o[p]=(o[p]||0)+1);});return o;}
function byMus(list){const o={};list.forEach(it=>it.mus.forEach(m=>{(o[m]=o[m]||[]).push(it);}));return o;}

// stats
(function(){
  const provs=new Set(Object.values(MUSEUMS).map(m=>m.p));
  const gg=ITEMS.filter(i=>i.mus.includes("gg")).length;
  $("#stats").innerHTML=[[ITEMS.length,"件（組）文物"],[[1,2,3].map(b=>counters[b]).join(" · "),[1,2,3].map(b=>BATCH[b].y).join(" · ")],[Object.keys(MUSEUMS).length,"收藏機構"],[provs.size,"省級行政區"],[gg,"故宮博物院收藏，居首"]]
   .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
})();

// controls
function renderChips(){
  $("#batchG").innerHTML='<span class="lbl">批次</span>'+[1,2,3].map(b=>`<button class="chip" data-b="${b}" aria-pressed="${state.batch.has(b)}"><span class="dot" style="background:var(--b${b})"></span>${BATCH[b].t} ${BATCH[b].y}</button>`).join("");
  $("#catG").innerHTML='<span class="lbl">類別</span>'+[null,...CATS].map(c=>`<button class="chip" data-c="${c||""}" aria-pressed="${state.cat===c}">${c||"全部"}</button>`).join("");
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-b]");
  if(b){const v=+b.dataset.b; if(state.batch.has(v)&&state.batch.size>1)state.batch.delete(v); else state.batch.add(v); update();return;}
  const c=e.target.closest("[data-c]");
  if(c){state.cat=c.dataset.c||null; update();return;}
  const p=e.target.closest("[data-p]");
  if(p){state.prov=p.dataset.p||null; update();return;}
  const it=e.target.closest("[data-i]");
  if(it){openDetail(+it.dataset.i);return;}
});
$("#q").addEventListener("input",e=>{state.q=e.target.value;update();});

// panel
function renderPanel(list){
  const ph=$("#ph"), pl=$("#plist");
  if(!state.prov){
    const bp=byProv(list); const arr=Object.entries(bp).sort((a,b)=>b[1]-a[1]); const max=arr.length?arr[0][1]:1;
    ph.innerHTML=`<div class="crumb">全國總覽</div><h2>${list.length} 件（組）</h2><div class="sub">分布於 ${arr.length} 個省級行政區。點選下方或地圖上的省份查看細目。</div>`;
    const bm=byMus(list); const ms=Object.entries(bm).sort((a,b)=>b[1].length-a[1].length).slice(0,8);
    pl.innerHTML=arr.length?`<div class="sect">各省數量</div>`+arr.map(([p,n])=>`<button class="rank" data-p="${p}"><span>${p}</span><span class="bar" style="width:${Math.max(4,n/max*100)}%"></span><span class="n">${n}</span></button>`).join("")
      +`<div class="sect">收藏最多的機構</div>`+ms.map(([m,a])=>`<button class="rank" data-p="${MUSEUMS[m].p}"><span style="grid-column:1/3">${MUSEUMS[m].n}<span class="meta" style="color:var(--muted);font-size:12px"> · ${MUSEUMS[m].p}</span></span><span class="n">${a.length}</span></button>`).join("")
      :`<div class="empty">沒有符合條件的文物。試試清除搜尋字或切換類別。</div>`;
    return;
  }
  const inP=list.filter(it=>it.mus.some(m=>MUSEUMS[m].p===state.prov));
  const bm={}; inP.forEach(it=>it.mus.filter(m=>MUSEUMS[m].p===state.prov).forEach(m=>(bm[m]=bm[m]||[]).push(it)));
  const ms=Object.entries(bm).sort((a,b)=>b[1].length-a[1].length);
  ph.innerHTML=`<div class="crumb"><button data-p="">← 全國</button><span>/</span><span>${state.prov}</span></div><h2>${state.prov}</h2><div class="sub">${inP.length} 件（組）· ${ms.length} 個收藏機構</div>`;
  pl.innerHTML=ms.length?ms.map(([m,a])=>`<div class="mus"><h3>${MUSEUMS[m].n}<span>${a.length} 件</span></h3>${a.map(itemRow).join("")}</div>`).join("")
    :`<div class="empty">${state.prov}在目前的篩選條件下沒有禁止出境展覽文物。</div>`;
}
function itemRow(it){return `<button class="item" data-i="${it.id}"><span class="tag b${it.batch}"><b>${BATCH[it.batch].t}</b>${String(it.no).padStart(2,"0")}</span><span><span class="nm">${esc(it.name)}</span><br><span class="meta">${esc(it.era)} · ${it.cat}</span></span></button>`;}

// detail
let curList=[];
function openDetail(id){
  const it=ITEMS[id]; const idx=curList.findIndex(x=>x.id===id);
  const mus=it.mus.map(m=>`${MUSEUMS[m].n}（${MUSEUMS[m].p}）`).join("、");
  const kw=encodeURIComponent(it.name.replace(/[（(].*?[）)]/g,""));
  $("#card").innerHTML=`<button class="x" id="dClose" aria-label="關閉">×</button>
   <div class="no b${it.batch}">${BATCH[it.batch].t}（${BATCH[it.batch].y}）· 第 ${it.no} 件</div>
   <h2 id="dTitle">${esc(it.name)}</h2>
   <dl><dt>年代</dt><dd>${esc(it.era)}</dd><dt>類別</dt><dd>${it.cat}</dd><dt>收藏單位</dt><dd>${mus}</dd></dl>
   <p>${esc(it.desc)}</p>
   <div class="links"><a href="https://www.google.com/search?tbm=isch&q=${kw}" target="_blank" rel="noopener">查看圖片 ↗</a><a href="https://zh.wikipedia.org/w/index.php?search=${kw}" target="_blank" rel="noopener">維基百科 ↗</a></div>
   <div class="nav"><button id="dPrev" ${idx<=0?"disabled":""}>← 上一件</button><button id="dNext" ${idx<0||idx>=curList.length-1?"disabled":""}>下一件 →</button></div>`;
  $("#scrim").hidden=false;
  $("#dClose").onclick=closeDetail;
  $("#dPrev").onclick=()=>idx>0&&openDetail(curList[idx-1].id);
  $("#dNext").onclick=()=>idx<curList.length-1&&openDetail(curList[idx+1].id);
  $("#dClose").focus();
}
function closeDetail(){$("#scrim").hidden=true;}
$("#scrim").addEventListener("click",e=>{if(e.target.id==="scrim")closeDetail();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetail();});

// map
let chart=null;
function mapOption(list){
  const bp=byProv(list);
  const data=Object.keys(TC).map(sc=>({name:sc,value:bp[TC[sc]]||0}));
  const bm=byMus(list);
  const pts=Object.entries(bm).map(([m,a])=>({name:MUSEUMS[m].n,value:[...MUSEUMS[m].c,a.length],prov:MUSEUMS[m].p}));
  const pieces=[{value:0,color:css("--m0"),label:"0"},{min:1,max:3,color:css("--m1")},{min:4,max:9,color:css("--m2")},{min:10,max:19,color:css("--m3")},{min:20,max:39,color:css("--m4")},{min:40,color:css("--m5")}];
  $("#legend").innerHTML=["0","1–3","4–9","10–19","20–39","40+"].map((l,i)=>`<i style="background:${pieces[i].color}"></i>${i===0||i===5?l:""}`).join("");
  const sel=state.prov?SC[state.prov]:null;
  return {
    backgroundColor:"transparent",
    tooltip:{trigger:"item",backgroundColor:css("--surface"),borderColor:css("--line"),textStyle:{color:css("--ink"),fontFamily:"Noto Sans TC, sans-serif"},
      formatter:p=>p.seriesType==="scatter"?`${p.name}<br>${p.value[2]} 件`:`${TC[p.name]||p.name}<br>${p.value||0} 件`},
    visualMap:{show:false,type:"piecewise",seriesIndex:0,pieces},
    geo:{map:"cnprov",roam:true,zoom:1.15,center:[104.5,36.5],scaleLimit:{min:1,max:6},
      label:{show:false},itemStyle:{borderColor:css("--surface"),borderWidth:1},
      emphasis:{label:{show:false},itemStyle:{areaColor:null}}},
    series:[
      {type:"map",geoIndex:0,data:data.map(d=>d.name===sel?{...d,itemStyle:{borderColor:css("--seal"),borderWidth:2.5}}:d)},
      {type:"scatter",coordinateSystem:"geo",data:pts,symbolSize:v=>Math.max(6,Math.sqrt(v[2])*5),
       itemStyle:{color:css("--seal"),borderColor:css("--surface"),borderWidth:1,opacity:.9},z:5,
       emphasis:{label:{show:true,formatter:"{b}",position:"top",color:css("--ink"),fontSize:12}}}
    ]
  };
}
function initMap(){
  if(!window.echarts){ $("#map").innerHTML='<div class="maperr">地圖元件載入失敗，請重新整理頁面。右側清單仍可正常瀏覽。</div>'; return; }
  chart=echarts.init($("#map"),null,{renderer:"canvas"});
  chart.on("click",p=>{
    const prov=p.seriesType==="scatter"?p.data.prov:TC[p.name];
    if(!prov)return; state.prov=(state.prov===prov?null:prov); update();
  });
  window.addEventListener("resize",()=>chart.resize());
}
function update(){
  renderChips();
  const list=filtered();
  if(state.prov) curList=list.filter(it=>it.mus.some(m=>MUSEUMS[m].p===state.prov)); else curList=list;
  renderPanel(list);
  if(chart) chart.setOption(mapOption(list),true);
}
// theme follow
const rerender=()=>chart&&chart.setOption(mapOption(filtered()),true);
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",rerender);}catch(e){}
new MutationObserver(rerender).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});

initMap(); update();
})();
