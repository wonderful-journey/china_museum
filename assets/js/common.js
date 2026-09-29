// 全站共用：簡繁省名對照、DOM 與樣式小工具
const TC={"北京":"北京","天津":"天津","上海":"上海","重庆":"重慶","河北":"河北","河南":"河南","云南":"雲南","辽宁":"遼寧","黑龙江":"黑龍江","湖南":"湖南","安徽":"安徽","山东":"山東","新疆":"新疆","江苏":"江蘇","浙江":"浙江","江西":"江西","湖北":"湖北","广西":"廣西","甘肃":"甘肅","山西":"山西","内蒙古":"內蒙古","陕西":"陝西","吉林":"吉林","福建":"福建","贵州":"貴州","广东":"廣東","青海":"青海","西藏":"西藏","四川":"四川","宁夏":"寧夏","海南":"海南","香港":"香港","澳门":"澳門"};
const SC={}; Object.keys(TC).forEach(k=>SC[TC[k]]=k);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// 全站專題分類：首頁卡片與導覽列共用；ready:false 為籌備中，不出現在導覽列
const SECTIONS=[
  {key:"museums",t:"博物館名錄",href:"museums.html",ready:false,d:"全國重點博物館的分布、館別、開放資訊與代表館藏。"},
  {key:"forbidden",t:"禁止出境展覽文物",href:"forbidden.html",ready:true,d:"國家文物局 2002、2012、2013 年分三批公布，永久禁止出境展覽的一級文物。"},
  {key:"treasures",t:"鎮館之寶",href:"treasures.html",ready:false,d:"各館最具代表性的館藏，依博物館與省份瀏覽。"},
  {key:"dynasty",t:"依朝代瀏覽",href:"dynasty.html",ready:false,d:"從新石器時代到明清，以時間軸串起各時期的重要文物。"},
  {key:"overseas",t:"流失海外文物",href:"overseas.html",ready:false,d:"散藏於海外博物館的中國文物，例如昭陵六駿中的颯露紫與拳毛騧。"}
];

// 頁面放 <nav id="topbar" data-active="key">，載入時自動產生導覽列
(function(){
  const nav=$("#topbar"); if(!nav)return;
  const active=nav.dataset.active||"home";
  const links=[{key:"home",t:"首頁",href:"index.html"},...SECTIONS.filter(s=>s.ready)];
  nav.innerHTML=`<a class="brand" href="index.html"><span class="mini" aria-hidden="true">博</span>中國文物博物館</a>
    <div class="navlinks">${links.map(l=>`<a href="${l.href}"${l.key===active?' aria-current="page"':""}>${l.t}</a>`).join("")}</div>`;
})();
