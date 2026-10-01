// 各專題文物整理為統一格式，供專題頁、單館頁與首頁共用
// 每件：{id, topic, name, era, cat, mus[], desc, tagB, tagN, cls, label}
// tagB/tagN 為清單左側標籤（粗體／編號），cls 為標籤顏色，label 為詳情卡上方說明
const BATCH={1:{y:2002,t:"第一批"},2:{y:2012,t:"第二批"},3:{y:2013,t:"第三批"}};
const CATS=["青銅","陶瓷","玉器","書法","繪畫","漆木","金銀玻璃","織繡","壁畫石刻","簡帛古籍","其他"];

const TOPICS={
  forbidden:{t:"禁止出境展覽文物",href:"forbidden.html",unit:"件（組）",items:(()=>{
    const n={1:0,2:0,3:0};
    return FORBIDDEN.map((r,i)=>{const b=r[0],no=++n[b];return {
      id:"forbidden-"+i,topic:"forbidden",batch:b,no,cat:r[1],name:r[2],era:r[3],mus:r[4].split("|"),desc:r[5],
      tagB:BATCH[b].t,tagN:String(no).padStart(2,"0"),cls:"b"+b,label:`${BATCH[b].t}（${BATCH[b].y}）· 第 ${no} 件`};});
  })()}
};

// 鎮館之寶（需先載入 data/treasures.js）；與禁出文物同名者記在 dup，統計與時間軸不重複計入
// 只比對名稱：少數文物的保管單位與展出館不同（如「五星出東方利中國」護膊）
if(typeof TREASURES!=="undefined")
  TOPICS.treasures={t:"鎮館之寶",href:"treasures.html",unit:"件",items:TREASURES.map((r,i)=>{
    const f=TOPICS.forbidden.items.find(x=>x.name===r[2]);
    return {id:"treasures-"+i,topic:"treasures",cat:r[1],name:r[2],era:r[3],mus:[r[0]],desc:r[4],
      tagB:"鎮館",tagN:MUSEUMS[r[0]].p,cls:"tr",dup:f?f.id:null,
      label:`${MUSEUMS[r[0]].n} · 鎮館之寶${f?"（亦列禁止出境展覽文物）":""}`};})};

// 館藏精選（需先載入 data/collections.js）；沒有專題頁，只出現在單館頁、依朝代瀏覽與首頁統計
if(typeof COLLECTIONS!=="undefined")
  TOPICS.collections={t:"館藏精選",href:null,unit:"件",items:COLLECTIONS.map((r,i)=>({
    id:"collections-"+i,topic:"collections",cat:r[1],name:r[2],era:r[3],mus:[r[0]],desc:r[4],
    tagB:"館藏",tagN:MUSEUMS[r[0]].p,cls:"cl",label:`${MUSEUMS[r[0]].n} · 館藏精選`}))};

const ITEM_INDEX={};
Object.values(TOPICS).forEach(t=>t.items.forEach(it=>ITEM_INDEX[it.id]=it));
// 不重複的文物（排除與其他專題重複者）
const UNIQUE_ITEMS=Object.values(ITEM_INDEX).filter(it=>!it.dup);

// 各收藏機構在所有專題中的文物（同一件分藏多館時各館各計一次）
const MUS_ITEMS={};
Object.values(TOPICS).forEach(t=>t.items.forEach(it=>it.mus.forEach(m=>(MUS_ITEMS[m]=MUS_ITEMS[m]||[]).push(it))));
const musCount=m=>(MUS_ITEMS[m]||[]).filter(it=>!it.dup).length;
// 國家一、二級博物館各批次公布年份（兩者同批評定）
const LV_BATCH={1:2008,2:2012,3:2017,4:2020,5:2024};
const LV_T={1:"一級",2:"二級"};
// 等級標記；批次說明（部分二級館名單未載批次）
const gradeBadge=(x,long)=>x.lv?`<span class="badge l${x.lv}"${long?' style="font-size:13px;font-family:var(--sans)"':""}>${long?"國家":""}${LV_T[x.lv]}${long?"博物館":""}</span>`:"";
const batchText=x=>x.b?`第 ${x.b} 批（${LV_BATCH[x.b]}）`:"批次未載";
// 機構清單列：名稱、等級標記、所在地與批次（非評級機構顯示類型）、收錄件數
function museumRow(m){const x=MUSEUMS[m],n=musCount(m);
  const where=x.city===x.p?x.p:x.p+" · "+x.city;
  return `<a class="mrow" href="museum.html?id=${m}"><span class="nm">${x.n}${gradeBadge(x)}</span><span class="meta">${where} · ${x.lv?batchText(x):x.k}</span><span class="n">${n?n+" 件":""}</span></a>`;}

// 依年代欄位歸入朝代分期（需先載入 data/periods.js）；無法歸類者為 null
if(typeof PERIODS!=="undefined")
  Object.values(ITEM_INDEX).forEach(it=>{const p=PERIODS.find(p=>p.re.test(it.era));it.period=p?p.key:null;});
