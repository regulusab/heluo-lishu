/* 由西曆生辰取四柱及各派所需之曆法旗標（依 lunar-javascript） */
(function(root){
'use strict';
var H=root.Heluo;
function L(){ return root.Solar? root : require('./lunar.js'); }
function ymdNum(s){ return s.getYear()*10000+s.getMonth()*100+s.getDay(); }
function ganzhiYearStart(gz, approx){ var idx=60; for(var y=approx-2;y<=approx+2;y++){ if(((y-4)%60+60)%60===idx0(gz)) return y; } return approx; }
var JZ=[]; (function(){ for(var i=0;i<60;i++) JZ.push(H.GAN[i%10]+H.ZHI[i%12]); })();
function idx0(gz){ return JZ.indexOf(gz); }
function compute(inp, school, opts){
  var lib=L(); opts=opts||{};
  var solar=lib.Solar.fromYmdHms(inp.y,inp.m,inp.d,inp.h,inp.mi||0,0);
  var lunar=solar.getLunar();
  var ec=lunar.getEightChar(); ec.setSect(opts.ziSect||2); // 2：23 時即換日（傳統早子時）；1：晚子時日柱不換
  var yG=ec.getYear(), mG=ec.getMonth(), dG=ec.getDay(), hG=ec.getTime();
  var yearNum=ganzhiYearStart(yG, lunar.getYear());
  // 二至
  var jq=lunar.getJieQiTable(), sNum=ymdNum(solar)*10000+inp.h*100+(inp.mi||0);
  function t(name){ var s=jq[name]; return ymdNum(s)*10000+s.getHour()*100+s.getMinute(); }
  var dz= t('DONG_ZHI'), xz=t('夏至'), dzPrev=t('冬至');
  // lunar-javascript：'冬至'為前一年冬至、'DONG_ZHI'為本年末冬至
  var winterHalf = (sNum>=dzPrev && sNum<xz) || sNum>=dz;
  var lunarMonth=Math.abs(lunar.getMonth());
  var mz=mG.charAt(1), mzIdx=H.ZHI.indexOf(mz);
  var yangMonth = school.monthBasis==='lunar' ? (lunarMonth%2===1) : (mzIdx%2===0);
  var P={yg:yG[0],yz:yG[1],mg:mG[0],mz:mG[1],dg:dG[0],dz:dG[1],hg:hG[0],hz:hG[1],male:inp.male,yearNum:yearNum,winterHalf:winterHalf,yangMonth:yangMonth};
  var R=H.computeFromPillars(P,{qiankun:school.qiankun,zhizun:school.zhizun,polarity:opts.polarity||'year'});
  // 虛歲一歲之年
  var firstYear = school.ageBoundary==='lunarNewYear' ? lunar.getYear() : yearNum;
  finish(R, firstYear, opts.startAge);
  R.P=P; R.lunarText=lunar.getYearInChinese()+'年'+lunar.getMonthInChinese()+'月'+lunar.getDayInChinese()+' '+hG[1]+'時';
  R.lunarMonth=lunarMonth; R.pillars=[yG,mG,dG,hG]; R.solarText=solar.toYmd()+' '+String(inp.h).padStart(2,'0')+':'+String(inp.mi||0).padStart(2,'0');
  R.jieqiPrev=lunar.getPrevJieQi(true).getName(); R.yangMonth=yangMonth; R.winterHalf=winterHalf;
  // 化工（月令）
  var cf=t('春分'), qf=t('秋分');
  var hgT = (sNum>=dzPrev && sNum<cf)||sNum>=dz ? '坎' : sNum<xz ? '震' : sNum<qf ? '離' : '兌';
  R.huagong=hgT; R.tianyuan=H.NAJIA[yG[0]];
  return R;
}
function finish(R, firstYear, startAge){
  var off=(startAge&&startAge>1)?startAge-1:0;
  R.firstYear=firstYear; R.startAge=off+1;
  R.dayun.forEach(function(d){ d.from+=off; d.to+=off; d.yearFrom=firstYear+d.from-1; d.yearTo=firstYear+d.to-1;
    var gi=((d.yearFrom-4)%10+10)%10; d.firstStem=H.GAN[gi]; d.firstYang=gi%2===0;
    d.years=H.liunian(d.bits,d.pos,d.yang,d.firstYang).map(function(x,i){ var yr=d.yearFrom+i;
      return {age:d.from+i, year:yr, gz:JZ[((yr-4)%60+60)%60], bits:x.bits, changed:x.changed}; });
  });
}
// 干支檢核：陰陽相配、五虎遁（年干起月干）、五鼠遁（日干起時干）。只警告不阻擋。
function validate(pillars){
  var w=[], names=['年','月','日','時'];
  pillars.forEach(function(p,i){ if(!p||p.length!==2){ w.push(names[i]+'柱未填'); return; }
    var g=H.GAN.indexOf(p[0]), z=H.ZHI.indexOf(p[1]);
    if(g<0||z<0) w.push(names[i]+'柱「'+p+'」非干支');
    else if(g%2!==z%2) w.push(names[i]+'柱「'+p+'」陰陽不配（陽干須配陽支、陰干配陰支），六十甲子無此柱'); });
  if(w.length) return w;
  var yg=H.GAN.indexOf(pillars[0][0]), mg=H.GAN.indexOf(pillars[1][0]), mz=H.ZHI.indexOf(pillars[1][1]);
  var expM=((yg%5)*2+2+((mz-2+12)%12))%10;
  if(mg!==expM) w.push('五虎遁不合：'+pillars[0][0]+'年之'+pillars[1][1]+'月應為「'+H.GAN[expM]+pillars[1][1]+'」，現為「'+pillars[1]+'」');
  var dg=H.GAN.indexOf(pillars[2][0]), hg=H.GAN.indexOf(pillars[3][0]), hz=H.ZHI.indexOf(pillars[3][1]);
  var expH=((dg%5)*2+hz)%10;
  if(hg!==expH) w.push('五鼠遁不合：'+pillars[2][0]+'日之'+pillars[3][1]+'時應為「'+H.GAN[expH]+pillars[3][1]+'」，現為「'+pillars[3]+'」');
  return w;
}
// 西元年候選（與年柱同干支）
function yearsFor(gz){ var i=JZ.indexOf(gz), out=[]; if(i<0) return out; for(var y=1804+((i-0+60)%60);y<=2103;y+=60) out.push(y); return out; }
// 手動四柱：M={pillars:[年,月,日,時], male, birthYear, winter:'auto'|'yes'|'no', startAge}
function computeManual(M, school, opts){
  opts=opts||{}; var pl=M.pillars, warnings=validate(pl);
  if(warnings.some(function(x){return /未填|非干支|陰陽不配/.test(x);})) return {error:true, warnings:warnings};
  var mz=H.ZHI.indexOf(pl[1][1]);
  var autoWinter = [1,2,3,4,5].indexOf(mz)>=0 ? true : [7,8,9,10,11].indexOf(mz)>=0 ? false : null; // 子午月跨二至
  var winterHalf = M.winter==='yes'?true: M.winter==='no'?false: (autoWinter===null? (mz===0) : autoWinter);
  var notes=[];
  if(M.winter!=='yes'&&M.winter!=='no'&&autoWinter===null) notes.push(pl[1][1]+'月跨'+(mz===0?'冬至':'夏至')+'，未指定時預設'+(mz===0?'冬至後':'夏至後')+'；乾坤卦元堂可能受影響，請於「二至」欄指定。');
  var lunarMonth=((mz-2+12)%12)+1; // 以月建近似農曆月
  var yangMonth = school.monthBasis==='lunar' ? (lunarMonth%2===1) : (mz%2===0);
  if(school.monthBasis==='lunar') notes.push('手動模式無農曆日期，本派「陰陽令」以月建推估農曆月（寅月作正月）。');
  var by=+M.birthYear || yearsFor(pl[0]).filter(function(y){return y<=new Date().getFullYear();}).pop();
  var P={yg:pl[0][0],yz:pl[0][1],mg:pl[1][0],mz:pl[1][1],dg:pl[2][0],dz:pl[2][1],hg:pl[3][0],hz:pl[3][1],male:M.male,yearNum:by,winterHalf:winterHalf,yangMonth:yangMonth};
  var R=H.computeFromPillars(P,{qiankun:school.qiankun,zhizun:school.zhizun,polarity:opts.polarity||'year'});
  finish(R, by, M.startAge);
  R.P=P; R.pillars=pl.slice(); R.manual=true; R.warnings=warnings; R.notes=notes; R.yangMonth=yangMonth; R.winterHalf=winterHalf;
  R.solarText='（手動輸入四柱，西元 '+by+' 年生）'; R.lunarText=pl.join(' ');
  R.huagong=null; R.tianyuan=H.NAJIA[pl[0][0]];
  return R;
}
root.HeluoCalc={compute:compute, computeManual:computeManual, validate:validate, yearsFor:yearsFor, JZ:JZ};
if(typeof module!=='undefined') module.exports=root.HeluoCalc;
})(typeof window!=='undefined'?window:global);
