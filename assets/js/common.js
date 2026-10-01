// 全站共用：簡繁省名對照、DOM 與樣式小工具
const TC={"北京":"北京","天津":"天津","上海":"上海","重庆":"重慶","河北":"河北","河南":"河南","云南":"雲南","辽宁":"遼寧","黑龙江":"黑龍江","湖南":"湖南","安徽":"安徽","山东":"山東","新疆":"新疆","江苏":"江蘇","浙江":"浙江","江西":"江西","湖北":"湖北","广西":"廣西","甘肃":"甘肅","山西":"山西","内蒙古":"內蒙古","陕西":"陝西","吉林":"吉林","福建":"福建","贵州":"貴州","广东":"廣東","青海":"青海","西藏":"西藏","四川":"四川","宁夏":"寧夏","海南":"海南","香港":"香港","澳门":"澳門"};
const SC={}; Object.keys(TC).forEach(k=>SC[TC[k]]=k);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// 全站專題分類：首頁卡片與導覽列共用；ready:false 為籌備中，不出現在導覽列
const SECTIONS=[
  {key:"museums",t:"博物館名錄",href:"museums.html",ready:true,d:"全中國以古代文物為主的國家一級、二級博物館與各專題文物的收藏機構，依地圖與省份瀏覽。"},
  {key:"forbidden",t:"禁止出境展覽文物",href:"forbidden.html",ready:true,d:"國家文物局 2002、2012、2013 年分三批公布，永久禁止出境展覽的一級文物。"},
  {key:"treasures",t:"鎮館之寶",href:"treasures.html",ready:true,d:"各省級博物館最具代表性的館藏，依地圖與省份瀏覽。"},
  {key:"dynasty",t:"依朝代瀏覽",href:"dynasty.html",ready:true,d:"從新石器時代到明清，以時間軸串起各時期的重要文物。"}
];

// 頁面放 <nav id="topbar" data-active="key">，載入時自動產生導覽列
(function(){
  const nav=$("#topbar"); if(!nav)return;
  const active=nav.dataset.active||"home";
  const links=[{key:"home",t:"首頁",href:"index.html"},...SECTIONS.filter(s=>s.ready)];
  nav.innerHTML=`<a class="brand" href="index.html"><span class="mini" aria-hidden="true">博</span>中國文物博物館</a>
    <div class="navlinks">${links.map(l=>`<a href="${l.href}"${l.key===active?' aria-current="page"':""}>${l.t}</a>`).join("")}</div>`;
})();

// 文物清單列與詳情卡（頁面需有 #scrim > #card）
function itemRow(it){return `<button class="item" data-i="${it.id}">${imageThumb(it.name)}<span class="tag ${it.cls}"><b>${it.tagB}</b>${it.tagN}</span><span><span class="nm">${esc(it.name)}</span><br><span class="meta">${esc(it.era)} · ${it.cat}</span></span></button>`;}
// 文物圖片（需載入 data/images.js）；無圖或載入失敗時不顯示
const imageOf=name=>typeof IMAGES!=="undefined"&&IMAGES[name];
// 維基共享資源的指定寬度縮圖網址：已是縮圖者換寬度，原檔網址則改為 thumb 路徑
function thumbUrl(src,w){
  if(/\/\d+px-[^/]+$/.test(src))return src.replace(/\/\d+px-([^/]+)$/,`/${w}px-$1`);
  const m=src.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w\/\w\w)\/([^/]+)$/);
  return m?`${m[1]}/thumb/${m[2]}/${m[3]}/${w}px-${m[3]}`:src;
}
// 清單縮圖改用維基共享資源的 120px 縮圖，減少下載量；無圖時放同尺寸的空方塊，讓各列對齊
function imageThumb(name){
  const im=imageOf(name);
  return im?`<img class="th" src="${im.th||thumbUrl(im.src,120)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'th'}))">`:`<span class="th" aria-hidden="true"></span>`;
}
function imageFigure(name){
  const im=imageOf(name);
  if(!im)return "";
  return `<figure class="pic"><img src="${im.src}" alt="${esc(name)}" onerror="this.parentNode.hidden=true">
    <figcaption>圖：${esc(im.by)} · ${im.lic} · <a href="${im.page}" target="_blank" rel="noopener">維基共享資源 ↗</a></figcaption></figure>`;
}
// 詳細介紹與影片（需載入 data/details.js）；沒有詳細介紹時沿用專題資料的短介紹
const detailOf=name=>typeof DETAILS!=="undefined"&&DETAILS[name];
function detailText(it){
  const d=detailOf(it.name);
  if(!d)return `<p>${esc(it.desc)}</p>`;
  const refs=d.refs&&d.refs.length?`<div class="refs">參考資料：${d.refs.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join("、")}</div>`:"";
  return `<div class="long">${d.text.map(p=>`<p>${esc(p)}</p>`).join("")}</div>${refs}`;
}
function videoList(name){
  const d=detailOf(name);
  if(!d||!d.videos||!d.videos.length)return "";
  return `<div class="vids"><h3>影片介紹</h3>${d.videos.map(([t,site,by,min,u,note])=>
    `<div class="vid"><a href="${u}" target="_blank" rel="noopener">▶ ${esc(t)} ↗</a><span class="vmeta">${site} · ${esc(by)} · ${min} 分鐘</span><p>${esc(note)}</p></div>`).join("")}</div>`;
}
let detailList=[];
// list 為上一件／下一件的順序；省略時沿用前一次的清單
function openDetail(it,list){
  if(list)detailList=list;
  const idx=detailList.indexOf(it);
  const mus=it.mus.map(m=>`<a href="museum.html?id=${m}">${MUSEUMS[m].n}</a>（${MUSEUMS[m].p}）`).join("、");
  const kw=encodeURIComponent(it.name.replace(/[（(].*?[）)]/g,""));
  $("#card").innerHTML=`<button class="x" id="dClose" aria-label="關閉">×</button>
   <div class="no ${it.cls}">${it.label}</div>
   <h2 id="dTitle">${esc(it.name)}</h2>
   ${imageFigure(it.name)}
   <dl><dt>年代</dt><dd>${esc(it.era)}</dd><dt>類別</dt><dd>${it.cat}</dd><dt>收藏單位</dt><dd>${mus}</dd></dl>
   ${detailText(it)}
   <div class="links"><a href="https://www.google.com/search?tbm=isch&q=${kw}" target="_blank" rel="noopener">查看圖片 ↗</a><a href="https://zh.wikipedia.org/w/index.php?search=${kw}" target="_blank" rel="noopener">維基百科 ↗</a></div>
   ${videoList(it.name)}
   <div class="nav"><button id="dPrev" ${idx<=0?"disabled":""}>← 上一件</button><button id="dNext" ${idx<0||idx>=detailList.length-1?"disabled":""}>下一件 →</button></div>`;
  $("#scrim").hidden=false;
  $("#card").scrollTop=0;
  $("#dClose").onclick=closeDetail;
  $("#dPrev").onclick=()=>idx>0&&openDetail(detailList[idx-1]);
  $("#dNext").onclick=()=>idx<detailList.length-1&&openDetail(detailList[idx+1]);
  $("#dClose").focus();
}
function closeDetail(){const s=$("#scrim");if(s)s.hidden=true;}
(function(){
  const s=$("#scrim"); if(!s)return;
  s.addEventListener("click",e=>{if(e.target.id==="scrim")closeDetail();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetail();});
})();
