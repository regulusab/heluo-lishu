/* 出生地、時區估算、東經70°日界線（地方平時；精度欄僅供記錄） */
(function(root){
'use strict';
var PLACES=[
  {id:'', name:'（未填）', lon:'', lat:'', tz:''},
  {id:'taipei', name:'臺北', lon:121.57, lat:25.04, tz:'Asia/Taipei'},
  {id:'taichung', name:'臺中', lon:120.68, lat:24.15, tz:'Asia/Taipei'},
  {id:'tainan', name:'臺南', lon:120.21, lat:22.99, tz:'Asia/Taipei'},
  {id:'kaohsiung', name:'高雄', lon:120.31, lat:22.63, tz:'Asia/Taipei'},
  {id:'hongkong', name:'香港', lon:114.17, lat:22.32, tz:'Asia/Hong_Kong'},
  {id:'macau', name:'澳門', lon:113.54, lat:22.20, tz:'Asia/Macau'},
  {id:'beijing', name:'北京', lon:116.41, lat:39.90, tz:'Asia/Shanghai'},
  {id:'shanghai', name:'上海', lon:121.47, lat:31.23, tz:'Asia/Shanghai'},
  {id:'guangzhou', name:'廣州', lon:113.26, lat:23.13, tz:'Asia/Shanghai'},
  {id:'singapore', name:'新加坡', lon:103.82, lat:1.35, tz:'Asia/Singapore'},
  {id:'tokyo', name:'東京', lon:139.69, lat:35.68, tz:'Asia/Tokyo'},
  {id:'seoul', name:'首爾', lon:126.98, lat:37.57, tz:'Asia/Seoul'},
  {id:'bangkok', name:'曼谷', lon:100.50, lat:13.76, tz:'Asia/Bangkok'},
  {id:'sydney', name:'雪梨', lon:151.21, lat:-33.87, tz:'Australia/Sydney'},
  {id:'london', name:'倫敦', lon:-0.13, lat:51.51, tz:'Europe/London'},
  {id:'paris', name:'巴黎', lon:2.35, lat:48.86, tz:'Europe/Paris'},
  {id:'newyork', name:'紐約', lon:-74.01, lat:40.71, tz:'America/New_York'},
  {id:'losangeles', name:'洛杉磯', lon:-118.24, lat:34.05, tz:'America/Los_Angeles'},
  {id:'vancouver', name:'溫哥華', lon:-123.12, lat:49.28, tz:'America/Vancouver'},
  {id:'custom', name:'自訂', lon:'', lat:'', tz:''}
];
var TZ_LIST=[
  'Asia/Taipei','Asia/Shanghai','Asia/Hong_Kong','Asia/Macau','Asia/Tokyo','Asia/Seoul',
  'Asia/Singapore','Asia/Bangkok','Asia/Kolkata','Asia/Dubai','Europe/London','Europe/Paris',
  'Europe/Berlin','Europe/Moscow','Africa/Cairo','America/New_York','America/Chicago',
  'America/Denver','America/Los_Angeles','America/Vancouver','America/Sao_Paulo',
  'Australia/Sydney','Australia/Perth','Pacific/Auckland','UTC'
];
var ZHI='子丑寅卯辰巳午未申酉戌亥';
var PREC_LABEL={exact:'確切時刻', pm15:'±15 分鐘', pm60:'±60 分鐘', shichen:'僅知時辰', unknown:'時刻不明'};

function findPlace(id){ for(var i=0;i<PLACES.length;i++) if(PLACES[i].id===id) return PLACES[i]; return PLACES[0]; }

function parseLon(v){ if(v==null||v==='') return null; var n=parseFloat(v); return isNaN(n)?null:n; }

function tzFromLon(lon){
  lon=parseLon(lon); if(lon==null) return null;
  while(lon>180) lon-=360; while(lon<-180) lon+=360;
  var off=Math.round(lon/15);
  if(off>12) off=12; if(off<-12) off=-12;
  var id='UTC'+(off>=0?'+':'')+off;
  return {id:id, offset:off, estimated:true};
}

function tzOptions(){
  var out=[], i, id;
  for(i=0;i<TZ_LIST.length;i++) out.push({id:TZ_LIST[i], label:TZ_LIST[i]});
  for(i=-12;i<=14;i++){ id='UTC'+(i>=0?'+':'')+i; if(id!=='UTC+0') out.push({id:id, label:id+'（由經度估算用）'}); }
  out.push({id:'UTC+0', label:'UTC+0（由經度估算用）'});
  return out;
}

/* 老師裁定：東經 70° 以西日柱干支進一位（日期不動）；時干依新日干五鼠遁。未填經度則不套用。年月柱、農曆、節氣皆不因日柱進位而改。 */
function dayLineShift(lon){
  lon=parseLon(lon);
  if(lon==null) return {applied:false, days:0, lon:null};
  if(lon>=70) return {applied:false, days:0, lon:lon, side:'east'};
  return {applied:true, days:1, lon:lon, side:'west'};
}

/* 時支：23:00–01:00 為子，其後每兩小時一辰，與 lunar-javascript 八字時支一致。 */
function hourZhiIndex(h, mi){
  var m=(h||0)*60+(mi||0);
  if(m>=23*60||m<60) return 0;
  return Math.floor((m-60)/120)+1;
}

function dayChangeMin(ziSect){ return (+ziSect===1)?23*60:0; }

function shichenBounds(idx){
  if(idx===0) return [{lo:23*60, hi:24*60},{lo:0, hi:60}];
  var lo=60+(idx-1)*120; return [{lo:lo, hi:lo+120}];
}

function inMinRange(m, lo, hi){ return m>=lo && m<hi; }

function windowMinutes(h, mi, prec){
  var t=((h||0)*60+(mi||0)+24*60)%(24*60);
  if(prec==='exact') return [{lo:t, hi:t+1}];
  if(prec==='pm15') return wrapWindow(t,15);
  if(prec==='pm60') return wrapWindow(t,60);
  if(prec==='shichen') return shichenBounds(hourZhiIndex(h,mi));
  if(prec==='unknown'){
    var i=hourZhiIndex(h,mi), prev=(i+11)%12, next=(i+1)%12;
    return shichenBounds(prev).concat(shichenBounds(i)).concat(shichenBounds(next));
  }
  return [{lo:t, hi:t+1}];
}
function wrapWindow(t, d){
  var lo=t-d, hi=t+d+1;
  if(lo>=0 && hi<=24*60) return [{lo:lo, hi:hi}];
  if(lo<0) return [{lo:0, hi:hi},{lo:24*60+lo, hi:24*60}];
  return [{lo:lo, hi:24*60},{lo:0, hi:hi-24*60}];
}
function rangesOverlap(a,b){
  var i,j;
  for(i=0;i<a.length;i++) for(j=0;j<b.length;j++) if(a[i].lo<b[j].hi && b[j].lo<a[i].hi) return true;
  return false;
}
function crossesBoundary(ranges, minute){
  var i;
  for(i=0;i<ranges.length;i++) if(ranges[i].lo<minute && ranges[i].hi>minute) return true;
  /* wrap: 0:00 as 0 and 1440 */
  if(minute===0){ for(i=0;i<ranges.length;i++) if(ranges[i].lo<=0 && ranges[i].hi>0) return true; }
  return false;
}

function precisionWarnings(h, mi, prec, ziSect){
  var out=[], ranges, z0, z1, i, dc, names=[];
  prec=prec||'exact';
  if(prec==='exact') return out;
  ranges=windowMinutes(h, mi, prec);
  z0=hourZhiIndex(h,mi);
  var seen={}; seen[z0]=true;
  for(i=0;i<12;i++) if(i!==z0){
    if(rangesOverlap(ranges, shichenBounds(i))) seen[i]=true;
  }
  var keys=Object.keys(seen).map(function(x){return +x;}).sort(function(a,b){return a-b;});
  if(keys.length>1){
    names=keys.map(function(k){return ZHI[k]+'時';});
    out.push('時間精度為「'+PREC_LABEL[prec]+'」，可能跨越 '+names.join('、')+'，時柱（及可能的元堂）不穩定。');
  } else if(prec==='shichen'){
    out.push('僅知時辰為'+ZHI[z0]+'時（約兩小時），未指定時辰內的確切時刻。');
  } else if(prec==='unknown'){
    out.push('時刻不明，依慣例可能相差上下一個時辰，時柱與元堂均不穩定。');
  } else if(prec==='pm15'||prec==='pm60'){
    /* still mention if close but maybe only one 時辰 — OK, no extra */
  }
  dc=dayChangeMin(ziSect);
  var dayUncertain=false;
  if(dc===0){
    if(crossesBoundary(ranges,0) || rangesOverlap(ranges,[{lo:0,hi:1}]) || rangesOverlap(ranges,[{lo:23*60,hi:24*60}]) && rangesOverlap(ranges,[{lo:0,hi:60}])) dayUncertain=true;
    /* 子時 window that includes both 23:00-24:00 and 00:00-01:00 */
    if(rangesOverlap(ranges,[{lo:23*60,hi:24*60}]) && rangesOverlap(ranges,[{lo:0,hi:60}])) dayUncertain=true;
  } else {
    if(crossesBoundary(ranges,23*60) || (rangesOverlap(ranges,[{lo:23*60,hi:24*60}]) && rangesOverlap(ranges,[{lo:22*60,hi:23*60}]))) dayUncertain=true;
  }
  if(dayUncertain){
    if(+ziSect===1) out.push('此精度下可能跨越 23:00 換日，日柱不穩定。');
    else out.push('此精度下可能跨越午夜 0:00 換日（河洛預設），日柱不穩定。');
  }
  if(prec==='shichen' && z0===0){
    out.push('子時跨午夜：23:00–24:00 日柱仍屬前一日，0:00–1:00 為次日（預設 0:00 換日）。僅知子時時，日柱無法確定。');
  }
  if(prec==='unknown' && (z0===0||z0===11||z0===1)){
    out.push('時刻不明且接近子時／換日，日柱可能改變。');
  }
  return out;
}

root.HeluoPlace={PLACES:PLACES, PREC_LABEL:PREC_LABEL, findPlace:findPlace, parseLon:parseLon,
  tzFromLon:tzFromLon, tzOptions:tzOptions, dayLineShift:dayLineShift, hourZhiIndex:hourZhiIndex,
  precisionWarnings:precisionWarnings, dayChangeMin:dayChangeMin};
if(typeof module!=='undefined') module.exports=root.HeluoPlace;
})(typeof window!=='undefined'?window:global);
