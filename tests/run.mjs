import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
require(join(root,'lunar.js'));
require(join(root,'engine.js'));
require(join(root,'place.js'));
require(join(root,'lunation.js'));
require(join(root,'local_lunar.js'));
require(join(root,'guaql.js'));
const C = require(join(root,'calc.js'));
const P = global.HeluoPlace;
const Q = global.HeluoGuaQi;
const LL = global.HeluoLocalLunar;
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
ok('just west of 70E day-pillar 干支 advances one', west.dayLine.applied && west.pillars.join(' ')===jan2.pillars.join(' '));

const london=C.compute({y:2000,m:1,d:1,h:0,mi:0,male:true}, S.guben, {lon:-0.13, place:'london'});
ok('london day/hour 干支 match next civil day, year/month from same LMT', london.pillars.join(' ')===jan2.pillars.join(' ') && /東經 70° 以西日柱干支進一位（日期不動）/.test(london.solarText));
const londonNext=C.compute({y:2000,m:1,d:2,h:0,mi:0,male:true}, S.guben, {lon:-0.13});
ok('london lunar is unshifted 出生地農曆 (冬月廿六, not +1 date)', london.lunarInfo.source==='local' && /冬月廿六/.test(london.lunarInfo.text) && london.lunarInfo.day===londonNext.lunarInfo.day-1);


ok('tzFromLon Taipei ~ UTC+8', P.tzFromLon(121.57).id==='UTC+8');
ok('tzFromLon London ~ UTC+0', P.tzFromLon(-0.13).id==='UTC+0');

ok('precision recorded, no warnings', C.compute({y:1990,m:6,d:15,h:8,mi:55,male:true}, S.guben, {precision:'pm15'}).precWarnings.length===0);
ok('shichen recorded, no warnings', C.compute({y:2020,m:1,d:15,h:0,mi:20,male:true}, S.guben, {precision:'shichen'}).precision==='shichen' && C.compute({y:2020,m:1,d:15,h:0,mi:20,male:true}, S.guben, {precision:'shichen'}).precWarnings.length===0);

const mid=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang mid-season stays 四方伯', mid.huagong==='震' && !mid.huagongInfo.inTuwang);

const preChun=C.compute({y:2024,m:1,d:20,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立春 is 艮', preChun.huagong==='艮' && preChun.huagongInfo.sourced);

const preQiu=C.compute({y:1990,m:7,d:25,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立秋 is 坤', preQiu.huagong==='坤' && preQiu.huagongInfo.sourced);

const preXia=C.compute({y:1990,m:4,d:25,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立夏 is 艮', preXia.huagong==='艮' && preXia.huagongInfo.inTuwang);

const preDong=C.compute({y:1990,m:10,d:25,h:12,mi:0,male:true}, S.guben, {huagong:'tuwang'});
ok('tuwang before 立冬 is 坤', preDong.huagong==='坤' && preDong.huagongInfo.inTuwang);

const G=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {});
ok('芒種 四正 震上', G.guaQi.sifang.gua==='震' && G.guaQi.sifang.jie==='芒種' && G.guaQi.sifang.yaoIndex===5);
ok('六日七分 index in range', G.guaQi.gua==='家人' && G.guaQi.index>=0 && G.guaQi.index<=59);
ok('日卦 芒種 not leftover', G.riGua.monthJie==='芒種' && G.riGua.bits && !G.riGua.leftover && G.riGua.pos>=0);

const lib=require(join(root,'lunar.js'));
const dz=lib.Solar.fromYmdHms(1989,12,22,5,22,0);
const atDz=Q.guaQiAt(lib, lib.Solar.fromYmdHms(1989,12,22,6,0,0));
ok('冬至起中孚', atDz.gua==='中孚' && atDz.index===0);

const PK=['mode','date','time','zi','sex','pol','school','byear','winter','startAge','focus','prec','place','lon','lat','tz','hg','yt','rg','rz','gq'];
function fromURL(qs){
  const u=new URLSearchParams(qs);
  const o={};
  PK.forEach(function(k){ if(u.has(k)) o[k]=u.get(k); });
  const p=u.get('p'); if(p&&p.length===8) o.pillars=[p.slice(0,2),p.slice(2,4),p.slice(4,6),p.slice(6,8)];
  return o;
}
const old=fromURL('mode=auto&date=1990-06-15&time=08:30&zi=2&sex=1&pol=year&school=guben');
ok('old link still parses', old.date==='1990-06-15' && old.zi==='2' && !old.prec && !old.hg && !old.lon && !old.yt && !old.rg && !old.gq);
const neu=fromURL('mode=auto&date=1990-06-15&time=08:30&zi=2&sex=1&pol=year&school=guben&prec=pm15&place=taipei&lon=121.57&lat=25.04&tz=Asia/Taipei&hg=cardinal&yt=chu&rg=tian5&gq=dayan');
ok('new link parses settings', neu.prec==='pm15' && neu.place==='taipei' && neu.lon==='121.57' && neu.hg==='cardinal' && neu.yt==='chu' && neu.rg==='tian5' && neu.gq==='dayan');

const YT=global.Heluo.yuantang;
// 小畜 111011，一陰在四爻。陰時午未在四爻；申時：初起寄初爻，順起自五爻。
ok('小畜 申 寄爻初起 初爻', YT('111011','申',true,{yuantang:'chu'}).pos===0);
ok('小畜 申 寄爻順起 五爻', YT('111011','申',true,{yuantang:'shun'}).pos===4);
ok('小畜 午 兩法皆四爻', YT('111011','午',true,{yuantang:'chu'}).pos===3 && YT('111011','午',true,{yuantang:'shun'}).pos===3);
// 萃 000110，二陽在四、五爻。辰時（重數後開始寄）：初起寄初爻，順起本位五爻則寄上爻。
ok('萃 辰 寄爻初起 初爻', YT('000110','辰',true,{yuantang:'chu'}).pos===0);
ok('萃 辰 寄爻順起 上爻', YT('000110','辰',true,{yuantang:'shun'}).pos===5);
// 師 010000，一陽在二爻。寅時開始寄：初起寄初爻，順起本位二爻則寄三爻。
ok('師 寅 寄爻初起 初爻', YT('010000','寅',true,{yuantang:'chu'}).pos===0);
ok('師 寅 寄爻順起 三爻', YT('010000','寅',true,{yuantang:'shun'}).pos===2);
// 三陽無寄，兩法相同（旅 101100 陽在初、三、四？ 101100 = 初、三、四 — that's 3 yang at 0,2,3). Use 火山旅 101100? 旅 is 艮下離上 = 001 101, bits 001101. 3 yang at 2,3,5. Let's use bits with 3 yang: 111000.
ok('三陽 兩法相同', [0,1,2,3,4,5].every(i=>{
  const z='子丑寅卯辰巳'[i];
  return YT('111000',z,true,{yuantang:'chu'}).pos===YT('111000',z,true,{yuantang:'shun'}).pos;
}));
ok('乾卦 兩法相同', YT('111111','子',true,{yuantang:'chu',qiankun:'solstice',winterHalf:true}).pos===YT('111111','子',true,{yuantang:'shun',qiankun:'solstice',winterHalf:true}).pos);

const defYt=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {});
const chuYt=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {yuantang:'chu'});
ok('default yuantang equals 寄爻初起', row(defYt)===row(chuYt) && defYt.xian.pos===4);

const shunSame=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {yuantang:'shun'});
ok('site-default 辰時 四陽寄五上 兩法元堂相同', shunSame.xian.pos===defYt.xian.pos && shunSame.xian.bits===defYt.xian.bits);

const defRg=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {});
const t5=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {rigua:'tian5'});
ok('default 日卦 equals 天五地六', defRg.riGua.bits===t5.riGua.bits && defRg.riGua.pos===t5.riGua.pos && t5.riGua.method==='tian5');
const d6=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {rigua:'di6'});
ok('地六天五 differs or labeled', d6.riGua.method==='di6' && d6.riGua.blocks.length===6 && (d6.riGua.bits!==t5.riGua.bits || d6.riGua.pos!==t5.riGua.pos || d6.riGua.blocks.length!==t5.riGua.blocks.length));

const defGq=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {});
const dayan=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {guaqi:'dayan'});
ok('default 卦氣 equals 大衍新法', defGq.guaQi.gua==='家人' && dayan.guaQi.method==='dayan' && dayan.guaQi.gua==='家人');

const atDzDayan=Q.guaQiAt(lib, lib.Solar.fromYmdHms(1989,12,22,6,0,0), 'dayan');
const atDzJing=Q.guaQiAt(lib, lib.Solar.fromYmdHms(1989,12,22,6,0,0), 'jingfang');
ok('冬至後約 40 分 大衍仍中孚', atDzDayan.gua==='中孚' && atDzDayan.index===0);
ok('冬至後約 40 分 京房為坎餘分', atDzJing.gua==='坎' && atDzJing.kind==='sifang');
const afterFen=Q.guaQiAt(lib, lib.Solar.fromYmdHms(1989,12,23,6,0,0), 'jingfang');
ok('冬至次日 京房已入中孚', afterFen.gua==='中孚' && afterFen.kind==='sixty');
ok('京房 頤晉井大畜 為五日十四分', atDzJing.segments.filter(s=>s.kind==='sixty'&&['頤','晉','井','大畜'].indexOf(s.gua)>=0).every(s=>Math.abs(s.dur-(5+14/80))<1e-10));

const west122=C.compute({y:2026,m:10,d:12,h:12,mi:1,male:true}, S.guben, {lon:-122.68});
ok('fictional 122W pillars', west122.pillars.join(' ')==='丙午 戊戌 庚申 壬午');
ok('fictional 122W 出生地農曆九月初三', west122.lunarInfo.month===9 && west122.lunarInfo.day===3 && west122.lunarInfo.leap===false && /九月初三/.test(west122.lunarInfo.text));
ok('fictional 122W 先天萃初六 後天歸妹九四', west122.xian.bits==='000110' && west122.xian.pos===0 && west122.hou.bits==='110100' && west122.hou.pos===3);
ok('fictional 122W wording and lunar date unshifted', west122.dayLine.applied && /東經 70° 以西日柱干支進一位（日期不動）/.test(west122.solarText) && !/排盤用|加一天/.test(west122.solarText));
// 節氣／化工須用所填地方平時 10-12，日期不動
ok('fictional 122W 化工依未移位日時', west122.huagong==='兌' || west122.huagong==='離' || west122.huagong==='坎' || west122.huagong==='震');

const noLon122=C.compute({y:2026,m:10,d:12,h:12,mi:1,male:true}, S.guben, {});
ok('no-lon same date keeps China lunar and unshifted pillars', !noLon122.dayLine.applied && noLon122.pillars.join(' ')!==west122.pillars.join(' '));

const tp06=C.compute({y:2027,m:2,d:6,h:12,mi:0,male:true}, S.guben, {lon:121.57, place:'taipei'});
const tp07=C.compute({y:2027,m:2,d:7,h:12,mi:0,male:true}, S.guben, {lon:121.57, place:'taipei'});
const cn06=C.compute({y:2027,m:2,d:6,h:12,mi:0,male:true}, S.guben, {});
ok('Taipei 2027-02-06 local 臘月三十', tp06.lunarInfo.year===2026 && tp06.lunarInfo.month===12 && tp06.lunarInfo.day===30 && tp06.lunarInfo.leap===false);
ok('Taipei 2027-02-07 local 正月初一', tp07.lunarInfo.year===2027 && tp07.lunarInfo.month===1 && tp07.lunarInfo.day===1);
ok('Taipei 初一 counts as new 虛歲 year', tp06.firstYear===2026 && tp07.firstYear===2027);
ok('no-lon 2027-02-06 is China 正月初一 (differs from Taipei local)', cn06.lunarInfo.year===2027 && cn06.lunarInfo.month===1 && cn06.lunarInfo.day===1 && cn06.firstYear===2027);
ok('中州 虛歲仍以立春年柱，不受出生地春節影響', C.compute({y:2027,m:2,d:6,h:12,mi:0,male:true}, S.zhong, {lon:121.57}).firstYear===C.compute({y:2027,m:2,d:6,h:12,mi:0,male:true}, S.zhong, {}).firstYear);

const taipeiSame=C.compute({y:1990,m:6,d:15,h:8,mi:30,male:true}, S.guben, {lon:121.57});
ok('Taipei mid-month matches no-lon snapshot', row(taipeiSame)===expect['site-default|guben'] || (taipeiSame.pillars.join(' ')==='庚午 壬午 辛亥 壬辰' && taipeiSame.xian.bits==='111100' && taipeiSame.xian.pos===4 && taipeiSame.hou.bits==='110111' && taipeiSame.hou.pos===1 && taipeiSame.firstYear===1990));

// 節氣 UT：2024 立春庫印 16:27:07 東八區＝08:27:07 UT（紫金山／新華網 16:27 北京時間）
const lichun24=lib.Solar.fromYmd(2024,2,4).getLunar().getJieQiTable()['立春'];
ok('2024 立春 東八區印記 16:27', lichun24.getDay()===4 && lichun24.getHour()===16 && lichun24.getMinute()===27);
const ut24=LL.civilMs(lichun24)-8*3600*1000;
ok('2024 立春 UT 08:27', new Date(ut24).toISOString().startsWith('2024-02-04T08:27:'));
const xia24=lib.Solar.fromYmd(2024,6,21).getLunar().getJieQiTable()['夏至'];
ok('2024 夏至 東八區 04:51（HKO／年曆）', xia24.getMonth()===6 && xia24.getDay()===21 && xia24.getHour()===4 && xia24.getMinute()===51);
ok('lon 120° year/month matches 東八區 EightChar at 立春 instant', LL.yearMonth(lib, lib.Solar.fromYmdHms(1990,2,4,10,14,0), 120).year==='庚午' && LL.yearMonth(lib, lib.Solar.fromYmdHms(1990,2,4,10,13,0), 120).year==='己巳');

// 1990-02-04 立春 10:14 東八區；臺北 LMT 約 10:20。10:16 在東八區已交節、在臺北地方平時尚未交節。
const tpBefore=C.compute({y:1990,m:2,d:4,h:10,mi:16,male:true}, S.guben, {lon:121.57});
const tpAfter=C.compute({y:1990,m:2,d:4,h:10,mi:21,male:true}, S.guben, {lon:121.57});
const tpCst=C.compute({y:1990,m:2,d:4,h:10,mi:16,male:true}, S.guben, {});
ok('Taipei 10:16 LMT still 己巳 丁丑 (before local 立春)', tpBefore.pillars.join(' ')==='己巳 丁丑 庚子 辛巳');
ok('Taipei 10:21 LMT already 庚午 戊寅', tpAfter.pillars[0]==='庚午' && tpAfter.pillars[1]==='戊寅');
ok('same 10:16 without lon already 庚午 戊寅 (東八區 10:14 已交節)', tpCst.pillars.join(' ')==='庚午 戊寅 庚子 辛巳');
ok('中州 虛歲年隨 LMT 立春', C.compute({y:1990,m:2,d:4,h:10,mi:16,male:true}, S.zhong, {lon:121.57}).firstYear===1989 && C.compute({y:1990,m:2,d:4,h:10,mi:21,male:true}, S.zhong, {lon:121.57}).firstYear===1990);

// 西經 122.68，寒露地方平時約 2026-10-07 22:18:34。22:10 尚未交節；日柱干支進一位，年月柱不隨之。
const westNear=C.compute({y:2026,m:10,d:7,h:22,mi:10,male:true}, S.guben, {lon:-122.68});
const eastSame=C.compute({y:2026,m:10,d:7,h:22,mi:10,male:true}, S.guben, {lon:80});
ok('west-of-70 near 節: month stays 丁酉, day 干支 advances to 乙卯 丁亥', westNear.dayLine.applied && westNear.pillars.join(' ')==='丙午 丁酉 乙卯 丁亥');
ok('same LMT east of 70 keeps 丁酉 (not yet 寒露)', !eastSame.dayLine.applied && eastSame.pillars.join(' ')==='丙午 丁酉 甲寅 乙亥');
ok('west-of-70 22:10 lunar date unshifted', westNear.lunarInfo && westNear.lunarInfo.source==='local');

// 紐約式晚子時：河洛 0:00 換日，日柱仍為 5/10 再進一位＝丙子，時干起自新日柱的下一日干＝庚子。
const nyLate=C.compute({y:1990,m:5,d:10,h:23,mi:30,male:true}, S.guben, {lon:-74.0});
const nyMidnight=C.compute({y:1990,m:5,d:11,h:0,mi:0,male:true}, S.guben, {lon:-74.0});
ok('NY-like 1990-05-10 23:30 lon -74 is 丙子日 庚子時', nyLate.pillars[2]==='丙子' && nyLate.pillars[3]==='庚子');
ok('河洛 0:00 換日：同地 5/11 00:00 日柱已不同', nyMidnight.pillars[2]!==nyLate.pillars[2] && nyMidnight.pillars[2]==='丁丑');

console.log(fail===0?('\nAll '+n+' tests passed.'):('\n'+fail+'/'+n+' failed.'));
process.exit(fail?1:0);
