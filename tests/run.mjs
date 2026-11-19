import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
require(join(root,'lunar.js'));
require(join(root,'engine.js'));
require(join(root,'place.js'));
require(join(root,'guaql.js'));
const C = require(join(root,'calc.js'));
const P = global.HeluoPlace;
const Q = global.HeluoGuaQi;
const S = global.Heluo.SCHOOLS;

const expect = {
  'site-default|guben': '庚午 壬午 辛亥 壬辰|1990-06-15 08:30|111100|4|110111|1|震|震|1990',
  'fictional-1985|guben': '乙丑 己卯 庚戌 辛巳|1985-03-12 10:00|110111|2|111111|5|坎|坤|1985',
  'late-zi|guben': '己亥 丁丑 丁巳 壬子|2020-01-15 23:30|100000|0|000000|3|坎|離|2019',
  'new-year|guben': '己卯 丙子 戊午 壬子|2000-01-01 00:00|000111|3|011000|0|坎|離|1999',
  'dst-clock|guben': '庚子 壬午 庚寅 辛巳|1960-07-01 10:00|001011|5|010001|2|離|震|1960',
  'lichun-edge|guben': '癸卯 乙丑 戊戌 戊午|2024-02-04 12:00|011000|0|000111|3|坎|坤|2023'
};
const charts = [
  {name:'site-default', y:1990,m:6,d:15,h:8,mi:30,male:true},
  {name:'fictional-1985', y:1985,m:3,d:12,h:10,mi:0,male:true},
  {name:'late-zi', y:2020,m:1,d:15,h:23,mi:30,male:false},
  {name:'new-year', y:2000,m:1,d:1,h:0,mi:0,male:true},
  {name:'dst-clock', y:1960,m:7,d:1,h:10,mi:0,male:true},
  {name:'lichun-edge', y:2024,m:2,d:4,h:12,mi:0,male:false}
];

function row(R){ return [R.pillars.join(' '),R.solarText,R.xian.bits,R.xian.pos,R.hou.bits,R.hou.pos,R.huagong,R.tianyuan,R.firstYear].join('|'); }

let n=0, fail=0;
function ok(name, cond, detail){
  n++;
  if(cond) console.log('ok -', name);
  else { fail++; console.log('NOT ok -', name, detail||''); }
}

for (const sc of Object.keys(S)) {
  for (const c of charts) {
    const R=C.compute(c, S[sc], {});
    const exp=expect[c.name+'|guben'];
    ok('default '+c.name+' '+sc, row(R)===exp, 'got '+row(R));
    ok('no dayline without lon '+c.name+' '+sc, !R.dayLine.applied);
  }
}

const taipei=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {lon:121.57});
ok('taipei no shift', !taipei.dayLine.applied && taipei.pillars.join(' ')==='庚午 壬午 辛亥 壬辰');

const at70=C.compute({y:2000,m:1,d:1,h:0,mi:0,male:true}, S.guben, {lon:70});
ok('exactly 70E no shift', !at70.dayLine.applied && at70.pillars.join(' ')==='己卯 丙子 戊午 壬子');

const west=C.compute({y:2000,m:1,d:1,h:0,mi:0,male:true}, S.guben, {lon:69.99});
const jan2=C.compute({y:2000,m:1,d:2,h:0,mi:0,male:true}, S.guben, {});
ok('just west of 70E adds one day', west.dayLine.applied && west.pillars.join(' ')===jan2.pillars.join(' '));

const london=C.compute({y:2000,m:1,d:1,h:0,mi:0,male:true}, S.guben, {lon:-0.13, place:'london'});
ok('london matches next civil day', london.pillars.join(' ')===jan2.pillars.join(' ') && /東經70/.test(london.solarText));

ok('tzFromLon Taipei ~ UTC+8', P.tzFromLon(121.57).id==='UTC+8');
ok('tzFromLon London ~ UTC+0', P.tzFromLon(-0.13).id==='UTC+0');

ok('exact no warn', P.precisionWarnings(8,30,'exact',2).length===0);
ok('pm15 8:30 no 時辰 cross', P.precisionWarnings(8,30,'pm15',2).length===0);
ok('pm15 8:55 crosses 辰巳', P.precisionWarnings(8,55,'pm15',2).join('').indexOf('辰時')>=0);
ok('shichen 子 warns day', P.precisionWarnings(0,20,'shichen',2).join('').indexOf('日柱')>=0);
ok('pm15 0:05 warns midnight', P.precisionWarnings(0,5,'pm15',2).join('').indexOf('0:00')>=0);

const mid=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang mid-season stays 四方伯', mid.huagong==='震' && !mid.huagongInfo.inTuwang);

const preChun=C.compute({y:2024,m:1,d:20,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立春 is 艮', preChun.huagong==='艮' && preChun.huagongInfo.sourced);

const preQiu=C.compute({y:1990,m:7,d:25,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立秋 is 坤', preQiu.huagong==='坤' && preQiu.huagongInfo.sourced);

const preXia=C.compute({y:1990,m:4,d:25,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立夏 unlabeled', preXia.huagong==null && preXia.huagongInfo.alt.join('/')==='坤/艮' && preXia.huagongInfo.sourced===false);

const G=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {});
ok('芒種 四正 震上', G.guaQi.sifang.gua==='震' && G.guaQi.sifang.jie==='芒種' && G.guaQi.sifang.yaoIndex===5);
ok('六日七分 index in range', G.guaQi.gua==='家人' && G.guaQi.index>=0 && G.guaQi.index<=59);
ok('日卦 芒種 not leftover', G.riGua.monthJie==='芒種' && G.riGua.bits && !G.riGua.leftover && G.riGua.pos>=0);

const lib=require(join(root,'lunar.js'));
const dz=lib.Solar.fromYmdHms(1989,12,22,5,22,0);
const atDz=Q.guaQiAt(lib, lib.Solar.fromYmdHms(1989,12,22,6,0,0));
ok('冬至起中孚', atDz.gua==='中孚' && atDz.index===0);

const PK=['mode','date','time','zi','sex','pol','school','byear','winter','startAge','focus','prec','place','lon','lat','tz','hg'];
function fromURL(qs){
  const u=new URLSearchParams(qs);
  const o={};
  PK.forEach(function(k){ if(u.has(k)) o[k]=u.get(k); });
  const p=u.get('p'); if(p&&p.length===8) o.pillars=[p.slice(0,2),p.slice(2,4),p.slice(4,6),p.slice(6,8)];
  return o;
}
const old=fromURL('mode=auto&date=1990-06-15&time=08:30&zi=2&sex=1&pol=year&school=guben');
ok('old link still parses', old.date==='1990-06-15' && old.zi==='2' && !old.prec && !old.hg && !old.lon);
const neu=fromURL('mode=auto&date=1990-06-15&time=08:30&zi=2&sex=1&pol=year&school=guben&prec=pm15&place=taipei&lon=121.57&lat=25.04&tz=Asia/Taipei&hg=cardinal');
ok('new link parses settings', neu.prec==='pm15' && neu.place==='taipei' && neu.lon==='121.57' && neu.hg==='cardinal');

console.log(fail===0?('\nAll '+n+' tests passed.'):('\n'+fail+'/'+n+' failed.'));
process.exit(fail?1:0);
