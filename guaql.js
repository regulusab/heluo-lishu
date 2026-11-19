/* 節氣輔助、化工（四方伯／土王）、京房／孟喜卦氣、原典日卦。規則皆附出處；無據者不實作。 */
(function(root){
'use strict';
var KEY_NAME={
  DA_XUE:'大雪', DONG_ZHI:'冬至', XIAO_HAN:'小寒', DA_HAN:'大寒', LI_CHUN:'立春',
  YU_SHUI:'雨水', JING_ZHE:'驚蟄', CHUN_FEN:'春分', QING_MING:'清明', GU_YU:'穀雨',
  LI_XIA:'立夏', XIAO_MAN:'小滿', MANG_ZHONG:'芒種', XIA_ZHI:'夏至', XIAO_SHU:'小暑',
  DA_SHU:'大暑', LI_QIU:'立秋', CHU_SHU:'處暑', BAI_LU:'白露', QIU_FEN:'秋分',
  HAN_LU:'寒露', SHUANG_JIANG:'霜降', LI_DONG:'立冬', XIAO_XUE:'小雪',
  惊蛰:'驚蟄', 谷雨:'穀雨', 小满:'小滿', 芒种:'芒種', 处暑:'處暑'
};
var MONTH_JIE=['立春','驚蟄','清明','立夏','芒種','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
var JIEQI_24=['冬至','小寒','大寒','立春','雨水','驚蟄','春分','清明','穀雨','立夏','小滿','芒種','夏至','小暑','大暑','立秋','處暑','白露','秋分','寒露','霜降','立冬','小雪','大雪'];
var SIFANG=[
  {gua:'坎', yao:['初爻','二爻','三爻','四爻','五爻','上爻'], jie:['冬至','小寒','大寒','立春','雨水','驚蟄']},
  {gua:'震', yao:['初爻','二爻','三爻','四爻','五爻','上爻'], jie:['春分','清明','穀雨','立夏','小滿','芒種']},
  {gua:'離', yao:['初爻','二爻','三爻','四爻','五爻','上爻'], jie:['夏至','小暑','大暑','立秋','處暑','白露']},
  {gua:'兌', yao:['初爻','二爻','三爻','四爻','五爻','上爻'], jie:['秋分','寒露','霜降','立冬','小雪','大雪']}
];
/* 六十卦序：河洛〈卦氣歌〉自立春「小過、蒙、益、漸、泰」起列；孟喜／京房自冬至「中孚」起算六日七分。兩者為同一循環的不同起點。 */
var GUAQI_60=['中孚','復','屯','謙','睽','升','臨','小過','蒙','益','漸','泰','需','隨','晉','解','大壯','豫','訟','蠱','革','夬','旅','師','比','小畜','乾','大有','家人','井','咸','姤','鼎','渙','豐','履','遯','恒','節','同人','損','否','巽','萃','大畜','觀','賁','歸妹','无妄','明夷','困','剝','艮','既濟','噬嗑','大過','坤','未濟','蹇','頤'];
var SRC={
  yuantang:'《河洛理數》卷一〈詳元堂爻位式〉〈起元堂詩〉，識典 https://www.shidianguji.com/zh/book/NA09030/chapter/1m8od60nhc1me',
  huagong:'《河洛理數》卷一〈論化工〉：冬至後春分前坎、春分後夏至前震、夏至後秋分前離、秋分後冬至前兌；並云「每序季月坤艮各旺十八日」。識典同上。',
  shuogua:'《周易·說卦》「致役乎坤」「成言乎艮」。https://zh.wikisource.org/zh-hant/周易/說卦',
  tuwangApp:'土王歸屬（丑辰陽遁之月取艮，未戌陰月取坤）：App 說明。立春前艮、立秋前坤並可參《說卦》。立夏前艮、立冬前坤僅見 App 說明，原典未拆分，來源待核。',
  rigua:'《河洛理數》卷一〈起日卦定式〉：以月卦為主，元堂爻不變，其餘五爻各變一卦，一卦管六日，五六共三十日；須按該月節氣起算。識典同上。此即 App「天五地六」。',
  riguaDi6:'地六天五：App 說明「以奇日變陽爻，偶日變陰爻。月卦六變而五日一輪」。原典〈起日卦定式〉未載此法，細部為本站依 App 文解讀，來源待核。',
  guaqiDayan:'大衍新法／孟氏：六十卦自冬至中孚起，平分一歲之氣，每卦六日七分；坎震離兌主二十四氣、各爻一節，不占六十卦之日。《新唐書》卷二十七上〈卦議〉：「當據孟氏，自冬至初，中孚用事……坎、震、離、兌，二十四氣，次主一爻，其初則二至、二分也。」https://zh.wikisource.org/zh-hant/新唐書/卷027上 一行稱「自唐曆以後」所用即此（App 謂之大衍新法）。四正節候見《河洛理數》卷一〈定節候卦說〉，月序見〈卦氣歌〉。',
  guaqiJingfang:'京房古法：《新唐書》卷二十七上〈卦議〉：「京氏又以卦爻配期之日，坎、離、震、兌，其用事自分、至之首，皆得八十分日之七十三。頤、晉、井、大畜，皆五日十四分，餘皆六日七分。」https://zh.wikisource.org/zh-hant/新唐書/卷027上 App 說明：四方伯入四正交氣日首，借晉、井、大畜、頤之餘分。',
  dayline:'日界線（東經70°以西日柱加一天）：老師裁定。鐘錶時，不做真太陽時校正。'
};
SRC.guaqi=SRC.guaqiDayan;


function jieName(k){ return KEY_NAME[k]||k; }

function jieqiList(lib, year){
  var acc=[], seen={}, ys=[year-1,year,year+1], yi, jq, k, s, id, name;
  for(yi=0;yi<ys.length;yi++){
    jq=lib.Solar.fromYmd(ys[yi],6,15).getLunar().getJieQiTable();
    for(k in jq){
      if(!Object.prototype.hasOwnProperty.call(jq,k)) continue;
      s=jq[k]; if(!s||!s.getYear) continue;
      id=s.getYear()+'-'+s.getMonth()+'-'+s.getDay()+' '+s.getHour()+':'+s.getMinute()+':'+s.getSecond();
      if(seen[id]) continue;
      name=jieName(k);
      if(JIEQI_24.indexOf(name)<0) continue;
      seen[id]=true;
      acc.push({name:name, solar:s, jd:s.getJulianDay()});
    }
  }
  acc.sort(function(a,b){ return a.jd-b.jd; });
  return acc;
}

function prevNamed(list, jd, names){
  var best=null, i;
  for(i=0;i<list.length;i++){
    if(names.indexOf(list[i].name)>=0 && list[i].jd<=jd){
      if(!best||list[i].jd>best.jd) best=list[i];
    }
  }
  return best;
}
function nextNamed(list, jd, names){
  var best=null, i;
  for(i=0;i<list.length;i++){
    if(names.indexOf(list[i].name)>=0 && list[i].jd>jd){
      if(!best||list[i].jd<best.jd) best=list[i];
    }
  }
  return best;
}

function jieMonth(lib, solar){
  var list=jieqiList(lib, solar.getYear());
  var jd=solar.getJulianDay();
  var prev=prevNamed(list, jd, MONTH_JIE);
  var next=nextNamed(list, jd, MONTH_JIE);
  if(!prev) return {error:'找不到上一節'};
  return {index:MONTH_JIE.indexOf(prev.name), name:prev.name, start:prev, next:next, month:MONTH_JIE.indexOf(prev.name)+1};
}

/* 直取四方伯；土王則在四立前十八日改取坤艮。丑辰（立春前、立夏前）取艮，未戌（立秋前、立冬前）取坤，據 App 說明。 */
function huagongAt(lib, solar, method){
  var list=jieqiList(lib, solar.getYear());
  var jd=solar.getJulianDay();
  var dz=prevNamed(list, jd, ['冬至']), cf=prevNamed(list, jd, ['春分']);
  var xz=prevNamed(list, jd, ['夏至']), qf=prevNamed(list, jd, ['秋分']);
  var cardinal='兌';
  if(dz && (!cf||dz.jd>=cf.jd) && (!xz||dz.jd>=xz.jd) && (!qf||dz.jd>=qf.jd)) cardinal='坎';
  else if(cf && (!xz||cf.jd>=xz.jd) && (!qf||cf.jd>=qf.jd)) cardinal='震';
  else if(xz && (!qf||xz.jd>=qf.jd)) cardinal='離';
  var base={method:method||'cardinal', cardinal:cardinal, trigram:cardinal, inTuwang:false,
    note:'直取四方伯（二分二至：坎震離兌）。', src:SRC.huagong};
  if(method!=='tuwang') return base;
  var lis=['立春','立夏','立秋','立冬'], hit=null, i, x;
  for(i=0;i<list.length;i++){
    x=list[i];
    if(lis.indexOf(x.name)>=0 && jd>=x.jd-18 && jd<x.jd){
      if(!hit||x.jd<hit.jd) hit=x;
    }
  }
  base.method='tuwang';
  if(!hit){ base.note='土王寄坤艮：今日不在四立前十八日內，仍取四方伯 '+cardinal+'。'; return base; }
  base.inTuwang=true; base.period=hit.name;
  var map={立春:{t:'艮', zhi:'丑'}, 立夏:{t:'艮', zhi:'辰'}, 立秋:{t:'坤', zhi:'未'}, 立冬:{t:'坤', zhi:'戌'}};
  var asg=map[hit.name];
  base.trigram=asg.t; base.sourced=true; base.periodZhi=asg.zhi;
  base.note='土王十八日（'+hit.name+'前，'+asg.zhi+'月）：取'+asg.t+'。'+SRC.huagong+' '+SRC.tuwangApp+(hit.name==='立春'||hit.name==='立秋'?' '+SRC.shuogua:'');
  return base;
}

function sifangAt(lib, solar){
  var list=jieqiList(lib, solar.getYear());
  var jd=solar.getJulianDay();
  var jie=prevNamed(list, jd, JIEQI_24);
  if(!jie) return null;
  var i,j,g;
  for(i=0;i<SIFANG.length;i++){
    j=SIFANG[i].jie.indexOf(jie.name);
    if(j>=0) return {gua:SIFANG[i].gua, yaoIndex:j, yao:SIFANG[i].yao[j], jie:jie.name, jieSolar:jie.solar};
  }
  return {jie:jie.name};
}

function guaQiAt(lib, solar, method){
  var list=jieqiList(lib, solar.getYear());
  var jd=solar.getJulianDay();
  var dz=prevNamed(list, jd, ['冬至']);
  var dzNext=nextNamed(list, jd, ['冬至']);
  if(!dz) return {error:'找不到冬至'};
  var unit=6+7/80;
  var sifang=sifangAt(lib, solar);
  method=method||'dayan';
  if(method==='jingfang'){
    var segs=[], t=dz.jd, i,g,short,seg=null, FEN=1/80;
    function add(gua, dur, kind, index){ segs.push({gua:gua, index:index, kind:kind, fromJd:t, toJd:t+dur, dur:dur}); t+=dur; }
    add('坎', 73*FEN, 'sifang', null);
    for(i=0;i<60;i++){
      g=GUAQI_60[i];
      short=(g==='頤'||g==='晉'||g==='井'||g==='大畜');
      add(g, short?(5+14*FEN):unit, 'sixty', i);
      if(g==='晉') add('震', 73*FEN, 'sifang', null);
      else if(g==='井') add('離', 73*FEN, 'sifang', null);
      else if(g==='大畜') add('兌', 73*FEN, 'sifang', null);
    }
    for(i=0;i<segs.length;i++){ if(jd>=segs[i].fromJd && jd<segs[i].toJd){ seg=segs[i]; break; } }
    if(!seg) seg=segs[segs.length-1];
    return {
      method:'jingfang', gua:seg.gua, index:seg.index, kind:seg.kind, unit:unit,
      fromJd:seg.fromJd, toJd:seg.toJd, segments:segs,
      dongzhi:dz, nextDongzhi:dzNext, sifang:sifang,
      src:SRC.guaqiJingfang,
      note:'京房古法：四方伯於二分二至之首各占 73/80 日，晉、井、大畜、頤各 5 日 14 分，餘卦仍 6 日 7 分。此時值'+seg.gua+(seg.kind==='sifang'?'（四方伯餘分）':'（六十卦第 '+(seg.index+1)+'）')+'。'
    };
  }
  var days=jd-dz.jd;
  var idx=Math.floor(days/unit);
  if(idx<0) idx=0;
  if(idx>59) idx=59;
  return {
    method:'dayan', gua:GUAQI_60[idx], index:idx, unit:unit, kind:'sixty',
    fromJd:dz.jd+idx*unit, toJd:dz.jd+(idx+1)*unit,
    dongzhi:dz, nextDongzhi:dzNext, sifang:sifang,
    src:SRC.guaqiDayan,
    note:'大衍新法（本站預設，與舊版相同）：自冬至中孚起，六十卦平分一歲，每卦六日七分（6+7/80 日）。四正卦另按節氣值爻，不占六十卦之日。'
  };
}

function riGuaTian5(H, M){
  var p=M.changed, blocks=[], k,q;
  for(k=0;k<5;k++){
    q=(p+1+k)%6;
    blocks.push({bits:H.flip(M.bits,q), flipYao:q, startDay:k*6, endDay:k*6+6});
  }
  return {blocks:blocks, span:6, count:5, method:'tian5'};
}
/* 地六天五（App 說明，原典未載，來源待核）。解讀：月卦六爻皆變（含元堂），奇次（一三五）先取陽爻、偶次（二四六）取陰爻，皆自初爻向上；一類用盡則續用另一類剩餘爻。每變管五日。五日之內，奇日（第 1、3、5 日）取該變卦陽爻為日爻、偶日取陰爻，皆自初爻向上輪值。 */
function riGuaDi6(H, M){
  var yang=[], yin=[], i,k,yi=0,ni=0,order=[],blocks=[];
  for(i=0;i<6;i++) (M.bits[i]==='1'?yang:yin).push(i);
  for(k=0;k<6;k++){
    if(k%2===0){ if(yi<yang.length) order.push(yang[yi++]); else order.push(yin[ni++]); }
    else { if(ni<yin.length) order.push(yin[ni++]); else order.push(yang[yi++]); }
  }
  for(k=0;k<6;k++) blocks.push({bits:H.flip(M.bits,order[k]), flipYao:order[k], startDay:k*5, endDay:k*5+5});
  return {blocks:blocks, span:5, count:6, method:'di6', order:order};
}
function riGuaDayPos(block, dayIn, method){
  if(method!=='di6') return dayIn;
  var want=(dayIn%2===0)?'1':'0', cands=[], i;
  for(i=0;i<6;i++) if(block.bits[i]===want) cands.push(i);
  if(!cands.length) return dayIn%6;
  return cands[Math.floor(dayIn/2)%cands.length];
}
function riGuaAt(H, R, lib, solar, method){
  var year=solar.getYear(), Y=null, i,j,d;
  method=method||'tian5';
  if(!R||!R.dayun) return {error:'無大運資料，無法起日卦'};
  for(i=0;i<R.dayun.length;i++){
    d=R.dayun[i];
    for(j=0;j<d.years.length;j++) if(d.years[j].year===year) Y=d.years[j];
  }
  if(!Y) return {error:'此日不在大運流年範圍內，未排日卦', src:SRC.rigua};
  var sm=jieMonth(lib, solar);
  if(sm.error) return {error:sm.error, src:SRC.rigua};
  var months=H.liuyue(Y.bits, Y.changed);
  var M=months[sm.index];
  var built=method==='di6'?riGuaDi6(H,M):riGuaTian5(H,M);
  var days=Math.floor(solar.getJulianDay()-sm.start.jd);
  var out={
    method:built.method, year:year, yearBits:Y.bits, yearPos:Y.changed,
    monthJie:sm.name, month:sm.month, monthBits:M.bits, monthPos:M.changed,
    jieStart:sm.start, blocks:built.blocks, daysFromJie:days, leftover:days>=30,
    src:method==='di6'?SRC.riguaDi6:SRC.rigua,
    note:method==='di6'
      ? '地六天五（App 說明）：月卦六變、五日一輪；奇次變陽爻、偶次變陰爻（自初爻向上，一類用盡則續另一類）。五日之內奇日取陽爻、偶日取陰爻為日爻。原典未載此法，上為本站依 App 文解讀，來源待核。'
      : '天五地六（原典〈起日卦定式〉，本站預設）：以流月卦為主，不改變月卦元堂爻，其餘五爻各變一卦、一卦管六日；自本月節氣起算。日爻自下而上，一爻一日。蓋動中有靜。'
  };
  if(days<0){ out.error='日期在節氣之前，未排日卦'; return out; }
  if(days>=30){
    out.note+=' 本節氣月已超過三十日。原典另有「每日添一刻七分、每月寄五時」的置閏說法，細部算法來源待核，置閏開關未啟用，故不另指定日卦。';
    return out;
  }
  out.block=built.blocks[Math.floor(days/built.span)];
  out.bits=out.block.bits;
  out.pos=riGuaDayPos(out.block, days%built.span, built.method);
  return out;
}

root.HeluoGuaQi={SRC:SRC, GUAQI_60:GUAQI_60, MONTH_JIE:MONTH_JIE, jieqiList:jieqiList,
  jieMonth:jieMonth, huagongAt:huagongAt, sifangAt:sifangAt, guaQiAt:guaQiAt, riGuaAt:riGuaAt,
  prevNamed:prevNamed, nextNamed:nextNamed};
if(typeof module!=='undefined') module.exports=root.HeluoGuaQi;
})(typeof window!=='undefined'?window:global);
