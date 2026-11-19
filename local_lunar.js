/* 出生地農曆。規則依老師 2026-11-19 裁定，演算法與合朔表複製自已審閱的
   heluo-ziwei/src/local_lunar.mjs（只保留河洛所需：合朔改為出生地經度地方平時，
   合朔所在之日為初一；月序、閏月依中國農曆。不加夏令。表外或未填經度則退回東八區／中國曆）。 */
(function(root){
'use strict';
function lib(){ return root.Solar ? root : require('./lunar.js'); }
function NM(){
  var T=root.HeluoLunation|| (typeof require==='function'?require('./lunation.js'):null);
  return T && T.NM;
}
var D=864e5, GAN='甲乙丙丁戊己庚辛壬癸', ZHI='子丑寅卯辰巳午未申酉戌亥';
var CN_NUM=['','正','二','三','四','五','六','七','八','九','十','冬','臘'];
function DAY_TXT(d){ return d<=10?'初'+'一二三四五六七八九十'[d-1]: d<20?'十'+'一二三四五六七八九'[d-11]: d===20?'二十': d<30?'廿'+'一二三四五六七八九'[d-21]:'三十'; }
function gzYear(y){ return GAN[((y-4)%10+10)%10]+ZHI[((y-4)%12+12)%12]; }
function ymdOf(n){ return new Date(n*D).toISOString().slice(0,10); }
function dayNum(s){ return Math.floor(Date.UTC(+s.slice(0,4), +s.slice(5,7)-1, +s.slice(8,10))/D); }
function frameOffsetMin(fr){ return fr.lon*4; }
function localDay(fr, ms){ return Math.floor((ms + frameOffsetMin(fr)*6e4)/D); }

var T_LO, T_HI;
function bounds(){
  var nm=NM(); if(!nm||!nm.length) throw new Error('合朔表未載入');
  T_LO=nm[0]*1000+40*D; T_HI=nm[nm.length-1]*1000-40*D;
}
function newMoonsBetween(t0, t1){
  var nm=NM(), out=[], i, ms;
  if(T_LO==null) bounds();
  if(!(t0>=T_LO && t1<=T_HI)) throw new Error('超出合朔表範圍（1899–2101）');
  for(i=0;i<nm.length;i++){ ms=nm[i]*1000; if(ms>=t1) break; if(ms>=t0) out.push(ms); }
  return out;
}
var cnCache={};
function chinaMonthOfNewMoon(ms){
  if(cnCache[ms]) return cnCache[ms];
  var Solar=lib().Solar;
  var mid=new Date(ms+8*36e5+14*D);
  var L=Solar.fromYmd(mid.getUTCFullYear(), mid.getUTCMonth()+1, mid.getUTCDate()).getLunar();
  var r={year:L.getYear(), month:Math.abs(L.getMonth()), leap:L.getMonth()<0};
  cnCache[ms]=r; return r;
}

function localLunar(fr, dn){
  var t=dn*D;
  var nms=newMoonsBetween(t-34*D, t+34*D).map(function(ms){ return {ms:ms, day:localDay(fr, ms)}; });
  var i=-1, j, m, cm, off, loc;
  for(j=0;j<nms.length;j++) if(nms[j].day<=dn) i=j;
  if(i<0||i+1>=nms.length) throw new Error('出生地農曆：找不到合朔 '+ymdOf(dn));
  m=nms[i]; cm=chinaMonthOfNewMoon(m.ms); off=frameOffsetMin(fr, m.ms);
  loc=new Date(m.ms+off*6e4).toISOString().slice(0,16).replace('T',' ');
  return {year:cm.year, yearGanZhi:gzYear(cm.year), month:cm.month, leap:cm.leap, day:dn-m.day+1,
    monthDays:nms[i+1].day-m.day, monthStart:ymdOf(m.day),
    newMoonUT:new Date(m.ms).toISOString().slice(0,16).replace('T',' '),
    newMoonLocal:loc, frameOffsetMinutes:Math.round(off*10)/10};
}
function lunarText(L){
  return L.year+'年（'+L.yearGanZhi+'）'+(L.leap?'閏':'')+CN_NUM[L.month]+'月'+DAY_TXT(L.day);
}
function chinaOf(ymd){
  var p=ymd.split('-').map(Number), Solar=lib().Solar, L=Solar.fromYmd(p[0],p[1],p[2]).getLunar();
  return {year:L.getYear(), month:Math.abs(L.getMonth()), leap:L.getMonth()<0, day:L.getDay(),
    yearGanZhi:gzYear(L.getYear()),
    text:L.getYearInChinese()+'年'+L.getMonthInChinese()+'月'+L.getDayInChinese(),
    fallback:true, source:'china'};
}
function forHeluo(lon, ymd){
  if(lon==null||lon===''){
    var c=chinaOf(ymd);
    c.note='未填經度，農曆依東八區／中國農曆。';
    return c;
  }
  try{
    var L=localLunar({lon:+lon}, dayNum(ymd));
    L.text=lunarText(L);
    L.fallback=false; L.source='local';
    L.note='出生地農曆：合朔改為出生地經度的地方平時（世界時＋經度×4分鐘，不加夏令），合朔所在之日為初一；月序、閏月依中國農曆。';
    return L;
  }catch(e){
    var f=chinaOf(ymd);
    f.note='出生地農曆計算失敗（'+(e&&e.message||e)+'），改依東八區／中國農曆。';
    f.error=String(e&&e.message||e);
    return f;
  }
}

/* 節氣：lunar-javascript 交節印記為「北京時間」（東八區）。世界時＝印記−8小時。
   出生地地方平時＝世界時＋經度×4分鐘（不加夏令），即印記＋(經度−120)×4分鐘。
   未填經度則不換算，比較方式與舊版相同（東八區印記對東八區民用時刻）。
   1929 年以前中國民用時為北平地方時（約 UTC+7:46），庫仍以東八區印出；本站依印記−8小時，可能與當時鐘點差約 14 分鐘。 */
var MONTH_JIE_ZHI=[['立春','寅'],['驚蟄','卯'],['清明','辰'],['立夏','巳'],['芒種','午'],['小暑','未'],['立秋','申'],['白露','酉'],['寒露','戌'],['立冬','亥'],['大雪','子'],['小寒','丑']];
var JIE_ZHI={}; MONTH_JIE_ZHI.forEach(function(x){ JIE_ZHI[x[0]]=x[1]; });
function civilMs(solar){
  return Date.UTC(solar.getYear(), solar.getMonth()-1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond?solar.getSecond():0);
}
function hasLon(lon){ return !(lon==null||lon===''); }
function jieqiLmtMs(solar, lon){
  var cst=civilMs(solar);
  if(!hasLon(lon)) return cst;
  return cst+((+lon)-120)*4*60*1000;
}
function compareKey(solar, lon, birth){
  if(!hasLon(lon)) return solar.getJulianDay();
  return (birth?civilMs(solar):jieqiLmtMs(solar, lon))/864e5;
}
function lmtStamp(ms){
  var d=new Date(ms);
  function p(n){ return String(n).padStart(2,'0'); }
  return d.getUTCFullYear()+'-'+p(d.getUTCMonth()+1)+'-'+p(d.getUTCDate())+' '+p(d.getUTCHours())+':'+p(d.getUTCMinutes())+':'+p(d.getUTCSeconds());
}
function monthGanZhi(yearGZ, zhi){
  var yg=GAN.indexOf(yearGZ[0]), mz=ZHI.indexOf(zhi);
  var mg=((yg%5)*2+2+((mz-2+12)%12))%10;
  return GAN[mg]+zhi;
}
function yearMonth(lib, solar, lon){
  var jq, k, s, name, items=[], i, prev=null, lichun=null, birthKey, KEY={惊蛰:'驚蟄',谷雨:'穀雨',小满:'小滿',芒种:'芒種',处暑:'處暑'};
  var years=[solar.getYear()-1, solar.getYear(), solar.getYear()+1];
  if(!hasLon(lon)) return null;
  birthKey=civilMs(solar);
  years.forEach(function(y){
    jq=lib.Solar.fromYmd(y,6,15).getLunar().getJieQiTable();
    for(k in jq){
      if(!Object.prototype.hasOwnProperty.call(jq,k)) continue;
      s=jq[k]; if(!s||!s.getYear) continue;
      name=KEY[k]||k;
      if(!JIE_ZHI[name]) continue;
      items.push({name:name, zhi:JIE_ZHI[name], solar:s, lmtMs:jieqiLmtMs(s, lon), cstMs:civilMs(s)});
    }
  });
  items.sort(function(a,b){ return a.lmtMs-b.lmtMs; });
  for(i=0;i<items.length;i++){
    if(items[i].lmtMs<=birthKey){
      if(!prev||items[i].lmtMs>prev.lmtMs) prev=items[i];
      if(items[i].name==='立春'){ if(!lichun||items[i].lmtMs>lichun.lmtMs) lichun=items[i]; }
    }
  }
  if(!prev||!lichun) return {error:'找不到出生地地方平時的節或立春'};
  var yearGZ=gzYear(lichun.solar.getYear());
  var monthGZ=monthGanZhi(yearGZ, prev.zhi);
  var note='節氣時刻已換算為出生地地方平時（世界時＋經度×4分鐘；lunar-javascript 交節印記為東八區，世界時＝印記−8小時）。上一節 '+prev.name+' 的地方平時為 '+lmtStamp(prev.lmtMs)+'（東八區印記 '+lmtStamp(prev.cstMs)+'）。';
  if(solar.getYear()<1929||lichun.solar.getYear()<1929){
    note+=' 1929 年以前中國民用時為北平地方時（約 UTC+7:46），庫仍以東八區印出，換算可能與當時鐘點差約 14 分鐘。';
  }
  return {year:yearGZ, month:monthGZ, jie:prev.name, zhi:prev.zhi, lichun:lichun, prev:prev, note:note, source:'lmt'};
}

root.HeluoLocalLunar={localLunar:localLunar, lunarText:lunarText, forHeluo:forHeluo, chinaOf:chinaOf, dayNum:dayNum, gzYear:gzYear,
  civilMs:civilMs, jieqiLmtMs:jieqiLmtMs, compareKey:compareKey, hasLon:hasLon, lmtStamp:lmtStamp, yearMonth:yearMonth, monthGanZhi:monthGanZhi};
if(typeof module!=='undefined') module.exports=root.HeluoLocalLunar;
})(typeof window!=='undefined'?window:global);
