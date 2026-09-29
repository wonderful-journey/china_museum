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

const ITEM_INDEX={};
Object.values(TOPICS).forEach(t=>t.items.forEach(it=>ITEM_INDEX[it.id]=it));

// 各收藏機構在所有專題中的文物（同一件分藏多館時各館各計一次）
const MUS_ITEMS={};
Object.values(TOPICS).forEach(t=>t.items.forEach(it=>it.mus.forEach(m=>(MUS_ITEMS[m]=MUS_ITEMS[m]||[]).push(it))));
const musCount=m=>(MUS_ITEMS[m]||[]).length;
// 國家一級博物館各批次公布年份
const LV_BATCH={1:2008,2:2012,3:2017,4:2020,5:2024};
// 機構清單列：名稱、一級標記、所在地與批次（非一級者顯示類型）、收錄件數
function museumRow(m){const x=MUSEUMS[m],n=musCount(m);
  const where=x.city===x.p?x.p:x.p+" · "+x.city;
  return `<a class="mrow" href="museum.html?id=${m}"><span class="nm">${x.n}${x.lv?'<span class="badge">一級</span>':""}</span><span class="meta">${where} · ${x.lv?`第 ${x.b} 批（${LV_BATCH[x.b]}）`:x.k}</span><span class="n">${n?n+" 件":""}</span></a>`;}

// 依年代欄位歸入朝代分期（需先載入 data/periods.js）；無法歸類者為 null
if(typeof PERIODS!=="undefined")
  Object.values(ITEM_INDEX).forEach(it=>{const p=PERIODS.find(p=>p.re.test(it.era));it.period=p?p.key:null;});
