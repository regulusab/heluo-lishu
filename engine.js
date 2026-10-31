/* 河洛理數 計算引擎 — 依附件來源整理之規則 */
(function(root){
'use strict';
var GAN='甲乙丙丁戊己庚辛壬癸', ZHI='子丑寅卯辰巳午未申酉戌亥';
// 天干取數：戊一乙癸二，庚三辛四同，壬甲從六數，丁七丙八宮，己九無差別
var GAN_NUM={甲:[6],乙:[2],丙:[8],丁:[7],戊:[1],己:[9],庚:[3],辛:[4],壬:[6],癸:[2]};
// 地支取數：亥子一六水，寅卯三八真，巳午二七火，申酉四九金，辰戌丑未土五十
var ZHI_NUM={子:[1,6],丑:[5,10],寅:[3,8],卯:[3,8],辰:[5,10],巳:[2,7],午:[2,7],未:[5,10],申:[4,9],酉:[4,9],戌:[5,10],亥:[1,6]};
// 洛書八卦數：一坎二坤三震四巽六乾七兌八艮九離
var NUM_TRI={1:'坎',2:'坤',3:'震',4:'巽',6:'乾',7:'兌',8:'艮',9:'離'};
var TRI_BITS={乾:'111',兌:'110',離:'101',震:'100',巽:'011',坎:'010',艮:'001',坤:'000'}; // 由下而上
var BITS_TRI={}; for(var k in TRI_BITS) BITS_TRI[TRI_BITS[k]]=k;
var TRI_IMG={乾:'天',兌:'澤',離:'火',震:'雷',巽:'風',坎:'水',艮:'山',坤:'地'};
var NAJIA={甲:'乾',壬:'乾',乙:'坤',癸:'坤',丙:'艮',丁:'兌',戊:'坎',己:'離',庚:'震',辛:'巽'};

var SCHOOLS={
  guben:{id:'guben',name:'古本通行派',src:'《河洛理數》原典（明陳仁錫序文明書局本，掃描檔）＋《河洛理數推命術》（fozhu920 整理本）＋《河洛理數斷文》',
    qiankun:'solstice', zhizun:'classic', monthBasis:'lunar', ageBoundary:'lunarNewYear'},
  zhong:{id:'zhong',name:'鍾月萍新編派',src:'鍾月萍《實用易經——新編河洛理數論命》（圓方，增訂版）',
    qiankun:'monthParity', zhizun:'classic', monthBasis:'jieqi', ageBoundary:'lichun'},
  cui:{id:'cui',name:'崔仁慧講義派',src:'崔仁慧編《河洛理數入門起例 自學講義便覽》（2018，翔大／宇克承一系）',
    qiankun:'solstice', zhizun:'cui', monthBasis:'jieqi', ageBoundary:'lichun'}
};

function reduceNum(n, base){ // base 25（天）或 30（地）
  var steps=[n+''];
  while(n>base){ n-=base; steps.push('−'+base+'='+n); }
  var r;
  if(n%10===0) r=n/10; else r=n%10;
  return {value:r, rest:n, steps:steps};
}
function hexBits(upper,lower){ return TRI_BITS[lower]+TRI_BITS[upper]; }
function flip(bits,i){ var a=bits.split(''); a[i]=a[i]==='1'?'0':'1'; return a.join(''); }
function ying(i){ return (i+3)%6; }
function lower(b){return BITS_TRI[b.slice(0,3)];} function upper(b){return BITS_TRI[b.slice(3)];}

// 三元：1864–1923 上元，1924–1983 中元，1984–2043 下元（以干支年之起始西元年計）
function sanyuan(y){ var k=(((y-1864)%180)+180)%180; return k<60?'上元':k<120?'中元':'下元'; }
function jiGong(yuan, male, yangYear){ // 寄宮詩訣
  if(yuan==='上元') return male?'艮':'坤';
  if(yuan==='下元') return male?'離':'兌';
  // 中元：陽男陰女艮，陰男陽女坤
  return (male===yangYear)?'艮':'坤';
}

// 元堂
function yuantang(bits, hourZhi, male, opt){
  var hi=ZHI.indexOf(hourZhi), yangHour=hi<6, idx=yangHour?hi:hi-6;
  var want=yangHour?'1':'0', other=yangHour?'0':'1';
  var same=[],diff=[]; for(var i=0;i<6;i++) (bits[i]===want?same:diff).push(i);
  var n=same.length, seq, note='';
  if(n===0 || n===6){
    // 純卦：乾或坤
    var isQian = bits==='111111';
    var standard=[0,1,2,0,1,2,3,4,5,3,4,5][hi]; // 子卯初、丑辰二、寅巳三、午酉四、未戌五、申亥上
    var reverse=[5,4,3,5,4,3,2,1,0,2,1,0][hi];
    var rev=false;
    if(opt.qiankun==='solstice'){
      // 古本：女得乾、男得坤，冬至後夏至前（乾女）／夏至後冬至前（坤男）自上而下
      if(isQian && !male && opt.winterHalf) rev=true;
      if(!isQian && male && !opt.winterHalf) rev=true;
      note=(isQian?'乾':'坤')+'卦元堂：依二至（'+(opt.winterHalf?'冬至後夏至前':'夏至後冬至前')+'）'+(rev?'逆排（自上而下）':'順排');
    } else {
      // 鍾：女得乾陽月生逆，男得坤陰月生逆
      if(isQian && !male && opt.yangMonth) rev=true;
      if(!isQian && male && !opt.yangMonth) rev=true;
      note=(isQian?'乾':'坤')+'卦元堂：依生月陰陽（'+(opt.yangMonth?'陽月':'陰月')+'）'+(rev?'逆排':'順排');
    }
    return {pos:rev?reverse:standard, note:note};
  }
  if(n===1||n===2) seq=same.concat(same).concat(diff);
  else if(n===3) seq=same.concat(same);
  else seq=same.concat(diff);
  return {pos:seq[idx], note:(yangHour?'陽':'陰')+'時生，卦中'+n+(yangHour?'陽':'陰')+'爻'};
}

// 後天卦
var ZHIZUN={'010010':'坎','100010':'屯','001010':'蹇'};
function houtian(bits, yt, opt){
  var normal=function(){ var nb=bits.slice(3)+bits.slice(0,3); var np=(yt+3)%6; return {bits:flip(nb,np), pos:np}; };
  var only=function(){ return {bits:flip(bits,yt), pos:yt}; };
  var r, note='';
  if(ZHIZUN[bits] && (yt===4||yt===5)){
    var ym=opt.yangMonth, mname=ym?'陽月':'陰月';
    if(opt.zhizun==='classic'){
      // 九五：陰令變而不易，陽令照常；上六：陽令變而不易，陰令照常
      var keep = (yt===4)? !ym : ym;
      r = keep?only():normal();
      note='至尊卦（'+ZHIZUN[bits]+'）元堂在'+(yt===4?'九五':'上六')+'，'+mname+'生：'+(keep?'變而不易（上下卦不換位，只變元堂爻）':'易而變（照常法）');
    } else {
      // 崔講義手稿：九五 陽月生變為六五、陰月生不變；上六 陰月生變為上九、陽月生不變
      var keep2 = (yt===4)? ym : !ym;
      r = keep2?only():normal();
      note='至尊卦（'+ZHIZUN[bits]+'）元堂在'+(yt===4?'九五':'上六')+'，'+mname+'生：'+(keep2?'變而不易':'依常法易位（講義寫「不變」，此處解讀為不適用特例）');
    }
    r.zhizun=true;
  } else r=normal();
  r.note=note; return r;
}

// 大運：陽爻九年、陰爻六年，自元堂起逐爻上行，先天行畢接後天
function dayun(xt, xp, ht, hp){
  var list=[], age=1;
  [[xt,xp,'先天'],[ht,hp,'後天']].forEach(function(g){
    for(var k=0;k<6;k++){ var p=(g[1]+k)%6, yrs=g[0][p]==='1'?9:6;
      list.push({gua:g[2], bits:g[0], pos:p, yang:g[0][p]==='1', from:age, to:age+yrs-1}); age+=yrs; }
  });
  return list;
}
// 流年（小象）
function liunian(base, p, yangYao, firstYearYang){
  var out=[], cur=base, i;
  function push(b,c){ out.push({bits:b, changed:c}); }
  if(yangYao){
    if(firstYearYang){ push(cur,p); }
    else { cur=flip(cur,p); push(cur,p); }
    cur=flip(cur,ying(p)); push(cur,ying(p));
    cur=flip(cur,p); push(cur,p);
    for(i=1;i<=6;i++){ var q=(p+i)%6; cur=flip(cur,q); push(cur,q); }
  } else {
    for(i=0;i<6;i++){ var q2=(p+i)%6; cur=flip(cur,q2); push(cur,q2); }
  }
  return out;
}
// 流月：正月起於流年元堂上一爻，陽月逐月上變；陰月取前一陽月變爻之應爻
function liuyue(bits, yt){
  var m=[], cur=bits, q=yt;
  for(var k=0;k<6;k++){ q=(q+1)%6; cur=flip(cur,q); m[2*k]={bits:cur,changed:q};
    m[2*k+1]={bits:flip(cur,ying(q)), changed:ying(q)}; }
  return m;
}

function huagong(md){ // 化工（只取月上）：冬至後春分前坎、春分後夏至前震、夏至後秋分前離、秋分後冬至前兌
  return md;
}

function computeFromPillars(P, opt){
  // P: {yg,yz,mg,mz,dg,dz,hg,hz, male, yearNum, winterHalf, yangMonth}
  var items=[[P.yg,'年干'],[P.yz,'年支'],[P.mg,'月干'],[P.mz,'月支'],[P.dg,'日干'],[P.dz,'日支'],[P.hg,'時干'],[P.hz,'時支']];
  var tian=0,di=0,detail=[];
  items.forEach(function(it){ var nums=(GAN_NUM[it[0]]||ZHI_NUM[it[0]]); nums.forEach(function(n){ if(n%2) tian+=n; else di+=n; }); detail.push({ch:it[0],label:it[1],nums:nums}); });
  var tr=reduceNum(tian,25), dr=reduceNum(di,30);
  var yangYear = GAN.indexOf(P.yg)%2===0;
  var polStem = opt.polarity==='hour'? P.hg : P.yg;
  var yangP = GAN.indexOf(polStem)%2===0;
  var yuan=sanyuan(P.yearNum);
  function tri(v){ return v===5? {t:jiGong(yuan,P.male,yangP), ji:true} : {t:NUM_TRI[v], ji:false}; }
  var tT=tri(tr.value), dT=tri(dr.value);
  var shun = (P.male===yangP); // 陽男陰女：天上地下
  var up=shun?tT.t:dT.t, lo=shun?dT.t:tT.t;
  var xt=hexBits(up,lo);
  var o={winterHalf:P.winterHalf, yangMonth:P.yangMonth, qiankun:opt.qiankun, zhizun:opt.zhizun};
  var yt=yuantang(xt,P.hz,P.male,o);
  var ht=houtian(xt,yt.pos,o);
  return {tian:tian,di:di,tr:tr,dr:dr,tT:tT,dT:dT,yuan:yuan,yangYear:yangYear,yangP:yangP,shun:shun,
    xian:{bits:xt,pos:yt.pos,note:yt.note}, hou:{bits:ht.bits,pos:ht.pos,note:ht.note,zhizun:!!ht.zhizun},
    detail:detail, dayun:dayun(xt,yt.pos,ht.bits,ht.pos)};
}

root.Heluo={GAN:GAN,ZHI:ZHI,SCHOOLS:SCHOOLS,TRI_BITS:TRI_BITS,BITS_TRI:BITS_TRI,TRI_IMG:TRI_IMG,NAJIA:NAJIA,
  reduceNum:reduceNum,yuantang:yuantang,houtian:houtian,dayun:dayun,liunian:liunian,liuyue:liuyue,flip:flip,
  computeFromPillars:computeFromPillars,sanyuan:sanyuan,upper:upper,lower:lower,ying:ying};
})(typeof window!=='undefined'?window:global);
