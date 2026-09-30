// 共用中國省級地圖（ECharts）：省份依數量分級上色，收藏機構以圓點標示
// steps：分級下限，例如 [1,4,10,20,40] 產生 0、1–3、4–9、10–19、20–39、40+ 六級（對應 --m0～--m5）
// onProv(省名)：點省份或圓點時呼叫；onPoint(點資料)：若提供，點圓點改呼叫此函式
// tip：{prov:n=>文字, point:n=>文字}，預設皆為「n 件」；base：最低一級使用的色階（預設 1，即 --m1）
function chinaMap(el,legendEl,{steps,onProv,onPoint,tip={},base=1}){
  const provTip=tip.prov||(n=>`${n} 件`), pointTip=tip.point||(n=>`${n} 件`);
  let chart=null, last=null;
  if(!window.echarts){ el.innerHTML='<div class="maperr">地圖元件載入失敗，請重新整理頁面。右側清單仍可正常瀏覽。</div>'; }
  else{
    chart=echarts.init(el,null,{renderer:"canvas"});
    chart.on("click",p=>{
      if(p.seriesType==="scatter"&&onPoint){onPoint(p.data);return;}
      const prov=p.seriesType==="scatter"?p.data.prov:TC[p.name];
      if(prov)onProv(prov);
    });
    window.addEventListener("resize",()=>chart.resize());
    // 深淺色切換時以新配色重畫
    const rerender=()=>last&&render(last);
    try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",rerender);}catch(e){}
    new MutationObserver(rerender).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  }

  // provCounts：{省名:數量}；points：[{name, value:[經,緯,數量], prov, id}]；sel：選取的省名
  function render(args){
    last=args; if(!chart)return;
    const {provCounts,points,sel}=args;
    const shade=i=>css("--m"+Math.min(5,i+base));
    // 用 gte/lte 明確表示含端點；只寫 min 不寫 max 時，ECharts 4 不會把剛好等於下限的值算進去
    const pieces=[{value:0,color:css("--m0"),label:"0"},...steps.map((s,i)=>i<steps.length-1?{gte:s,lte:steps[i+1]-1,color:shade(i)}:{gte:s,color:shade(i)})];
    legendEl.innerHTML=pieces.map((p,i)=>`<i style="background:${p.color}"></i>${i===0?"0":i===pieces.length-1?steps[steps.length-1]+"+":""}`).join("");
    const selSC=sel?SC[sel]:null;
    const data=Object.keys(TC).map(sc=>({name:sc,value:provCounts[TC[sc]]||0}));
    chart.setOption({
      backgroundColor:"transparent",
      tooltip:{trigger:"item",backgroundColor:css("--surface"),borderColor:css("--line"),textStyle:{color:css("--ink"),fontFamily:"Noto Sans TC, sans-serif"},
        formatter:p=>p.seriesType==="scatter"?`${p.name}<br>${pointTip(p.value[2])}`:`${TC[p.name]||p.name}<br>${provTip(p.value||0)}`},
      visualMap:{show:false,type:"piecewise",seriesIndex:0,pieces},
      geo:{map:"cnprov",roam:true,zoom:1.15,center:[104.5,36.5],scaleLimit:{min:1,max:6},
        label:{show:false},itemStyle:{borderColor:css("--surface"),borderWidth:1},
        emphasis:{label:{show:false},itemStyle:{areaColor:null}}},
      series:[
        {type:"map",geoIndex:0,data:data.map(d=>d.name===selSC?{...d,itemStyle:{borderColor:css("--seal"),borderWidth:2.5}}:d)},
        {type:"scatter",coordinateSystem:"geo",data:points,symbolSize:v=>Math.max(6,Math.sqrt(v[2])*5),
         itemStyle:{color:css("--seal"),borderColor:css("--surface"),borderWidth:1,opacity:.9},z:5,
         emphasis:{label:{show:true,formatter:"{b}",position:"top",color:css("--ink"),fontSize:12}}}
      ]
    },true);
  }
  return {render};
}
