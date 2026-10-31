(function(){
'use strict';
var H=window.Heluo, C=window.HeluoCalc, S=H.SCHOOLS, cur='guben', state={dy:null,yr:null};
var POS='初二三四五上';
function yaoName(bits,p){ var y=bits[p]==='1'; if(p===0) return '初'+(y?'九':'六'); if(p===5) return '上'+(y?'九':'六'); return (y?'九':'六')+POS[p]; }
function hx(b){ return HEX[b]; }
function esc(s){ return String(s||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
var NOTES=window.HeluoNotes={
 guben:['乾坤二卦元堂：女命得乾生於冬至後夏至前、男命得坤生於夏至後冬至前，自上爻逆排；其餘順排。',
   '至尊卦（坎、屯、蹇）元堂在九五：陰令生「變而不易」（只變元堂爻，上下卦不換）；在上六：陽令生「變而不易」。',
   '「陰令／陽令」：推命術本以農曆月份奇偶（正三五七九十一為陽）判斷——原典「陰令」或指夏至後至冬至前，文意未盡明確，本站依推命術採農曆月奇偶。',
   '虛歲以正月初一為一歲之交。'],
 zhong:['乾坤二卦元堂：女命得乾而生於陽月（月建子寅辰午申戌）、男命得坤而生於陰月，逆排；其餘順排。',
   '月令陰陽以節氣月建地支判斷。至尊卦規則與古本同。',
   '書中討論以立春為歲首計虛歲（本站採立春）；並提及部分註家以時干定陰陽男女——可於上方「陰陽男女依」切換。'],
 cui:['乾坤二卦元堂：同古本，依冬至、夏至分逆順。','以節氣四柱起例；陽月為正、三、五、七、九、十一月（本站以節氣月建判斷）。',
   '<b>至尊卦規則與古本相反</b>：手稿 p.38 寫「九五：陽月生變為六五（變而不易）、陰月生不變」；「上六：陰月生變為上九、陽月生不變」。',
   '<b>歧義</b>：講義所謂「不變」語意不明——本站解讀為「不適用特例，依常法上下易位再變爻」。',
   '另附天地數按季令之強弱論（至弱／不足／有餘／太過），本站僅作簡要提示，閾值依講義 OCR 可辨部分。']};
function bar(b,on){ var s='<div class="lines">'; for(var i=0;i<6;i++) s+='<div class="ln '+(b[i]==='1'?'y':'n')+(i===on?' on':'')+'"><i></i>'+(b[i]==='1'?'':'<i></i>')+'</div>'; return s+'</div>'; }
function guaCard(title,b,p,note){
  var h=hx(b); return '<div><h3>'+title+'</h3><div class="gua">'+bar(b,p)+'<div><div class="big">'+h.full+'</div><div>'+H.TRI_IMG[H.upper(b)]+'上'+H.TRI_IMG[H.lower(b)]+'下・第'+h.n+'卦</div><div>元堂：<b>'+yaoName(b,p)+'</b></div></div></div>'+(note?'<div class="warn">'+note+'</div>':'')+'</div>';
}
function texts(b,p,ctx){
  var h=hx(b), s='<div class="card"><h2>'+ctx+'：'+h.full+'　元堂 '+yaoName(b,p)+'</h2>';
  s+='<h3>卦辭</h3><div>'+esc(h.gua)+'</div><div class="sub">'+esc(h.xiang)+'</div>';
  s+='<h3>元堂爻辭</h3><div>'+esc(h.yao[p])+'</div>';
  if(h.dw) s+='<h3>斷文・卦論</h3><div class="txt">'+esc(h.dw)+'</div>';
  s+='<h3>斷文・'+yaoName(b,p)+'</h3><div class="txt">'+esc(h.dwy[p]||'（來源缺）')+'</div>';
  if(h.sy) s+='<h3>歲運卦訣</h3><div class="txt">'+esc(h.sy)+'\n'+esc(h.syy[p])+'</div>';
  if(h.xy) s+='<details><summary>六十四卦象義</summary><div class="txt">'+esc(h.xy)+'</div></details>';
  s+='<details><summary>全卦六爻爻辭</summary><div>'+h.yao.map(esc).join('<br>')+'</div></details>';
  return s+'</div>';
}
function $(id){ return document.getElementById(id); }
var mode='auto';
function getPillars(){ return [0,1,2,3].map(function(i){ return $('pg'+i).value+$('pz'+i).value; }); }
function settings(){
  return {mode:mode, date:$('date').value, time:$('time').value, zi:$('zi').value, sex:$('sex').value, pol:$('pol').value,
    school:cur, pillars:getPillars(), byear:$('byear').value, winter:$('winter').value, startAge:+$('startAge').value||1, focus:$('focus').value.trim()};
}
function applySettings(o){ if(!o) return;
  ['date','time','zi','sex','pol','winter','startAge','focus'].forEach(function(k){ if(o[k]!=null&&o[k]!=='') $(k).value=o[k]; });
  if(o.focus==='') $('focus').value='';
  if(o.school&&S[o.school]) cur=o.school;
  if(o.pillars&&o.pillars.length===4) setPillars(o.pillars);
  if(o.byear){ fillYears(); $('byear').value=o.byear; }
  setMode(o.mode||'auto'); schoolsUI();
}
function setPillars(pl){ pl.forEach(function(p,i){ if(p&&p.length===2){ $('pg'+i).value=p[0]; $('pz'+i).value=p[1]; } }); $('pillarTxt').value=pl.join(' '); fillYears(); }
function fillYears(){ var gz=$('pg0').value+$('pz0').value, prev=$('byear').value, ys=C.yearsFor(gz);
  $('byear').innerHTML=ys.length?ys.map(function(y){return '<option>'+y+'</option>';}).join(''):'<option value="">（年柱陰陽不配）</option>';
  if(ys.indexOf(+prev)>=0) $('byear').value=prev; else { var now=new Date().getFullYear(), best=ys.filter(function(y){return y<=now;}).pop(); if(best) $('byear').value=best; } }
function setMode(m){ mode=m; $('autoBox').style.display=m==='auto'?'flex':'none'; $('manBox').style.display=m==='manual'?'block':'none';
  Array.prototype.forEach.call(document.querySelectorAll('#modeSw button'),function(b){ b.className=b.dataset.mode===m?'on':''; }); }
function opts(){ return {polarity:$('pol').value, ziSect:+$('zi').value, startAge:+$('startAge').value||1}; }
function calcFor(sc){ var st=settings();
  if(st.mode==='manual') return C.computeManual({pillars:st.pillars, male:st.sex==='1', birthYear:+st.byear, winter:st.winter, startAge:st.startAge}, S[sc], opts());
  var d=st.date.split('-'), t=st.time.split(':');
  return C.compute({y:+d[0],m:+d[1],d:+d[2],h:+t[0],mi:+t[1],male:st.sex==='1'}, S[sc], opts()); }
function render(){
  var inp={male:$('sex').value==='1'};
  var R; try{ R=calcFor(cur); }catch(e){ $('out').innerHTML='<div class="card warn">計算失敗：'+esc(e.message)+'</div>'; window.LAST=null; return; }
  if(mode==='manual'){ var ws=R.warnings||[], ns=R.notes||[]; $('manWarn').innerHTML=(ws.length?'<div class="warn'+(R.error?' err':'')+'">'+ws.map(esc).join('<br>')+'</div>':'<div class="sub">✔ 四柱干支檢核通過（陰陽相配、五虎遁、五鼠遁皆合）</div>')+(ns.length?'<div class="warn">'+ns.map(esc).join('<br>')+'</div>':''); }
  if(R.error){ $('out').innerHTML='<div class="card warn err">四柱有誤，無法起卦：'+R.warnings.map(esc).join('；')+'</div>'; window.LAST=null; return; }
  var all={}; for(var k in S) all[k]=calcFor(k);
  var out='';
  // 四柱
  out+='<section class="card"><h2>一、四柱與天地數</h2><div class="grid"><div><div class="pillars">'+['年','月','日','時'].map(function(n,i){return '<div>'+n+'柱<b>'+R.pillars[i]+'</b></div>';}).join('')+'</div>'
   +'<p>西曆 '+R.solarText+'<br>農曆 '+R.lunarText+'<br>'+(R.yangYear?'陽':'陰')+'年生'+(inp.male?'男':'女')+'・'+(R.shun?'天數卦在上':'地數卦在上')+'（'+(R.yangP?'陽':'陰')+(inp.male?'男':'女')+'，依'+(opts().polarity==='hour'?'時干':'年干')+'）・'+R.yuan+'</p></div>';
  out+='<div><table><tr><th>字</th>'+R.detail.map(function(d){return '<td>'+d.ch+'</td>';}).join('')+'</tr><tr><th>數</th>'+R.detail.map(function(d){return '<td>'+d.nums.join('、')+'</td>';}).join('')+'</tr></table>'
   +'<p>天數（奇）<b>'+R.tian+'</b>：'+R.tr.steps.join(' ')+' → 取 <b>'+R.tr.value+'</b> → '+R.tT.t+(R.tT.ji?'（五寄宮）':'')+'<br>地數（偶）<b>'+R.di+'</b>：'+R.dr.steps.join(' ')+' → 取 <b>'+R.dr.value+'</b> → '+R.dT.t+(R.dT.ji?'（五寄宮）':'')+'</p>'
   +'<div class="sub">天數過 25 減 25、地數過 30 減 30；餘數取個位，整十取十位。推命術言「減去 25 的倍數」，若恰為 25／50 之類，本站取 5 寄宮（各派皆同）。</div></div></div>';
  var tq=(cur==='cui')? strength(R):'';
  out+=tq+'<p>天元氣（年干納甲）：<span class="pill">'+R.tianyuan+'</span>　化工（月令）：<span class="pill">'+(R.huagong||'手動模式無節氣日，未計')+'</span>　'+(has(R,R.tianyuan)?'先後天卦中得天元氣 ✔':'')+' '+(has(R,R.huagong)?'得化工 ✔':'')+'<span class="sub">（化工依二分二至取坎震離兌；四季月土旺十八日之坤艮說各本不一，未採）</span></p></section>';
  // 卦
  out+='<section class="card"><h2>二、先天卦・後天卦（'+S[cur].name+'）</h2><div class="grid">'+guaCard('先天卦',R.xian.bits,R.xian.pos,R.xian.note)+guaCard('後天卦',R.hou.bits,R.hou.pos,R.hou.note)+'</div>';
  // differences
  var diffs=[]; for(var k2 in S){ var a=all[k2]; diffs.push('<tr'+(k2===cur?' class="sel"':'')+'><td>'+S[k2].name+'</td><td>'+hx(a.xian.bits).name+' '+yaoName(a.xian.bits,a.xian.pos)+'</td><td>'+hx(a.hou.bits).name+' '+yaoName(a.hou.bits,a.hou.pos)+'</td><td>'+a.firstYear+'</td></tr>'); }
  var same=Object.keys(S).every(function(k){return all[k].xian.bits+all[k].xian.pos+all[k].hou.bits+all[k].hou.pos+all[k].firstYear===R.xian.bits+R.xian.pos+R.hou.bits+R.hou.pos+R.firstYear;});
  out+='<div class="warn diff"><b>三派對照</b>（'+(same?'此命造三派結果一致':'此命造各派結果不同，請留意')+'）<table><tr><th>派別</th><th>先天・元堂</th><th>後天・元堂</th><th>虛歲一歲之年</th></tr>'+diffs.join('')+'</table></div></section>';
  // 大運
  out+='<section class="card"><h2>三、大運（陽爻九年、陰爻六年，虛歲）</h2><table><tr><th>卦</th><th>運爻</th><th>年歲</th><th>西元</th><th>起運年干</th></tr>';
  R.dayun.forEach(function(d,i){ out+='<tr class="click'+(state.dy===i?' sel':'')+'" data-dy="'+i+'"><td>'+d.gua+' '+hx(d.bits).name+'</td><td>'+yaoName(d.bits,d.pos)+'</td><td>'+d.from+'–'+d.to+'</td><td>'+d.yearFrom+'–'+d.yearTo+'</td><td>'+d.firstStem+(d.firstYang?'（陽）':'（陰）')+'</td></tr>'; });
  out+='</table><p class="sub">點選任一大運以展開流年。'+(cur==='guben'?'古本以正月初一為歲首':'本派以立春為歲首')+'計算西元年。</p>';
  var now=new Date().getFullYear(), fy=focusYear(R); if(fy) now=fy; if(state.dy===null){ state.dy=0; R.dayun.forEach(function(d,i){ if(now>=d.yearFrom&&now<=d.yearTo) state.dy=i; }); }
  var D=R.dayun[Math.min(state.dy,R.dayun.length-1)];
  out+='<h3>流年：'+D.gua+'卦 '+hx(D.bits).name+' '+yaoName(D.bits,D.pos)+'運（'+D.from+'–'+D.to+'歲）</h3><table><tr><th>虛歲</th><th>西元</th><th>干支</th><th>流年卦</th><th>流年元堂</th></tr>';
  if(state.yr===null||state.yr>=D.years.length){ state.yr=0; D.years.forEach(function(y,i){ if(y.year===now) state.yr=i; }); }
  D.years.forEach(function(y,i){ out+='<tr class="click'+(state.yr===i?' sel':'')+'" data-yr="'+i+'"><td>'+y.age+'</td><td>'+y.year+'</td><td>'+y.gz+'</td><td>'+hx(y.bits).full+'</td><td>'+yaoName(y.bits,y.changed)+'</td></tr>'; });
  out+='</table><p class="sub">'+(D.yang?'陽爻管九年：起運年'+(D.firstYang?'為陽年，首年用本卦不變，次年變應爻，三年還變運爻，其後逐年上變。':'為陰年，首年即變運爻，次年變應爻，三年復變運爻，其後逐年上變。'):'陰爻管六年：首年變運爻，其後逐年上變。')+'各家皆同。</p>';
  var Y=D.years[state.yr], M=H.liuyue(Y.bits,Y.changed);
  out+='<h3>流月：'+Y.year+'年（'+Y.gz+'）'+hx(Y.bits).name+'</h3><div class="months">'+M.map(function(m,i){return '<div>'+(i+1)+'月<br><b>'+hx(m.bits).name+'</b><br><span class="sub">'+yaoName(m.bits,m.changed)+'</span></div>';}).join('')+'</div><p class="sub">正月變流年元堂上一爻，三、五…十一月逐爻上變；雙月取前一單月變爻之應爻（依推命術例）。月份依節氣月。</p></section>';
  out+=texts(R.xian.bits,R.xian.pos,'先天卦批文')+texts(R.hou.bits,R.hou.pos,'後天卦批文');
  out+=texts(D.bits,D.pos,'本大運')+texts(Y.bits,Y.changed,Y.year+'流年');
  $('out').innerHTML=out; window.LAST={R:R,D:D,Y:Y,M:M,school:S[cur],settings:settings(),all:all};
  Array.prototype.forEach.call(document.querySelectorAll('[data-dy]'),function(tr){tr.onclick=function(){state.dy=+tr.dataset.dy;state.yr=null;render();};});
  Array.prototype.forEach.call(document.querySelectorAll('[data-yr]'),function(tr){tr.onclick=function(){state.yr=+tr.dataset.yr;render();};});
}
function has(R,t){ return [H.upper(R.xian.bits),H.lower(R.xian.bits),H.upper(R.hou.bits),H.lower(R.hou.bits)].indexOf(t)>=0; }
function strength(R){
  function c(n,b){ return n<b?'不足':n===b?'得中':(n<b+15?'有餘':'太過'); }
  return '<div class="warn"><b>崔講義・天地數強弱（簡示）</b>：天數 '+R.tian+'（標準 25）'+c(R.tian,25)+'；地數 '+R.di+'（標準 30）'+c(R.di,30)+'。講義另依節令細分「至弱、孤陽、孤陰」等，手稿 OCR 難辨，未逐條實作。</div>';
}
function schoolsUI(){
  var el=document.getElementById('schools'); el.innerHTML='';
  Object.keys(S).forEach(function(k){ var b=document.createElement('button'); b.textContent=S[k].name; b.className=k===cur?'on':''; b.onclick=function(){cur=k;schoolsUI();render();}; el.appendChild(b); });
  document.getElementById('schoolInfo').innerHTML='<p>依據：'+S[cur].src+'</p><div class="warn"><b>本派要點與歧義說明</b><ul>'+NOTES[cur].map(function(n){return '<li>'+n+'</li>';}).join('')+'</ul></div>';
}
function focusYear(R){ var f=$('focus').value.trim(); if(!f) return null; if(/^\d{3,4}$/.test(f)) return +f;
  var i=C.JZ.indexOf(f); if(i<0) return null; var now=new Date().getFullYear(), best=null;
  R.dayun.forEach(function(d){ d.years.forEach(function(y){ if(y.gz===f && (best===null||Math.abs(y.year-now)<Math.abs(best-now))) best=y.year; }); }); return best; }
// 四柱選單
(function(){ var h=''; ['年','月','日','時'].forEach(function(n,i){ h+='<label>'+n+'柱<span style="display:flex;gap:2px"><select id="pg'+i+'">'+H.GAN.split('').map(function(g){return '<option>'+g+'</option>';}).join('')+'</select><select id="pz'+i+'">'+H.ZHI.split('').map(function(z){return '<option>'+z+'</option>';}).join('')+'</select></span></label>'; });
  $('pillarSel').innerHTML=h; setPillars(['癸巳','甲子','丁酉','甲辰']); })();
function rerun(){ state.dy=null; state.yr=null; render(); }
['date','time','sex','pol','zi','winter','byear','startAge','focus'].forEach(function(id){ $(id).onchange=rerun; });
[0,1,2,3].forEach(function(i){ $('pg'+i).onchange=$('pz'+i).onchange=function(){ $('pillarTxt').value=getPillars().join(' '); if(i===0) fillYears(); rerun(); }; });
$('pillarTxt').onchange=function(){ var t=$('pillarTxt').value.replace(/[年月日時柱,，、\s]+/g,''); if(t.length!==8){ $('manWarn').innerHTML='<div class="warn err">請輸入八個字（四柱干支），例：癸巳甲子丁酉甲辰</div>'; return; }
  var pl=[t.slice(0,2),t.slice(2,4),t.slice(4,6),t.slice(6,8)], bad=pl.filter(function(p){return H.GAN.indexOf(p[0])<0||H.ZHI.indexOf(p[1])<0;});
  if(bad.length){ $('manWarn').innerHTML='<div class="warn err">無法辨識：'+bad.join('、')+'</div>'; return; } setPillars(pl); rerun(); };
Array.prototype.forEach.call(document.querySelectorAll('#modeSw button'),function(b){ b.onclick=function(){ setMode(b.dataset.mode); rerun(); }; });
$('go').onclick=rerun;
window.HeluoApp={settings:settings, applySettings:function(o){ applySettings(o); rerun(); }, rerun:rerun, setMode:setMode};
var q=window.HeluoCases&&HeluoCases.fromURL(); if(q) applySettings(q);
schoolsUI(); render();
})();
