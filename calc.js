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
  R.firstYear=firstYear;
  R.dayun.forEach(function(d){ d.yearFrom=firstYear+d.from-1; d.yearTo=firstYear+d.to-1;
    var gi=((d.yearFrom-4)%10+10)%10; d.firstStem=H.GAN[gi]; d.firstYang=gi%2===0;
    d.years=H.liunian(d.bits,d.pos,d.yang,d.firstYang).map(function(x,i){ var yr=d.yearFrom+i;
      return {age:d.from+i, year:yr, gz:JZ[((yr-4)%60+60)%60], bits:x.bits, changed:x.changed}; });
  });
  R.P=P; R.lunarText=lunar.getYearInChinese()+'年'+lunar.getMonthInChinese()+'月'+lunar.getDayInChinese()+' '+hG[1]+'時';
  R.lunarMonth=lunarMonth; R.pillars=[yG,mG,dG,hG]; R.solarText=solar.toYmd()+' '+String(inp.h).padStart(2,'0')+':'+String(inp.mi||0).padStart(2,'0');
  R.jieqiPrev=lunar.getPrevJieQi(true).getName(); R.yangMonth=yangMonth; R.winterHalf=winterHalf;
  // 化工（月令）
  var cf=t('春分'), qf=t('秋分');
  var hgT = (sNum>=dzPrev && sNum<cf)||sNum>=dz ? '坎' : sNum<xz ? '震' : sNum<qf ? '離' : '兌';
  R.huagong=hgT; R.tianyuan=H.NAJIA[yG[0]];
  return R;
}
root.HeluoCalc={compute:compute, JZ:JZ};
if(typeof module!=='undefined') module.exports=root.HeluoCalc;
})(typeof window!=='undefined'?window:global);
