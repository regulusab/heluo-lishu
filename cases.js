/* 命例儲存（localStorage）、匯出匯入、分享連結 */
(function(){
'use strict';
var KEY='heluo_cases_v1';
function $(id){ return document.getElementById(id); }
function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||[]; }catch(e){ return []; } }
function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
function msg(t){ $('msg').textContent=t; }
function refresh(sel){ var l=load(); $('caseList').innerHTML=l.length? l.map(function(c,i){ return '<option value="'+c.id+'">'+escH(c.name)+'（'+(c.settings.mode==='manual'?c.settings.pillars.join(' '):c.settings.date+' '+c.settings.time)+'）</option>'; }).join('') : '<option value="">（無）</option>'; if(sel) $('caseList').value=sel; }
function escH(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function find(id){ return load().filter(function(c){return c.id===id;})[0]; }
var PK=['mode','date','time','zi','sex','pol','school','byear','winter','startAge','focus'];
function toURL(st){ var u=new URLSearchParams(); PK.forEach(function(k){ if(st[k]!=null&&st[k]!=='') u.set(k,st[k]); }); if(st.mode==='manual') u.set('p',st.pillars.join(''));
  else u.delete('byear'); return location.origin+location.pathname+'?'+u.toString(); }
function fromURL(){ var u=new URLSearchParams(location.search); if(!u.has('mode')&&!u.has('date')&&!u.has('p')) return null; var o={};
  PK.forEach(function(k){ if(u.has(k)) o[k]=u.get(k); }); var p=u.get('p'); if(p&&p.length===8) o.pillars=[p.slice(0,2),p.slice(2,4),p.slice(4,6),p.slice(6,8)];
  if(o.startAge) o.startAge=+o.startAge; return o; }
function importCases(arr){ if(!Array.isArray(arr)) arr=arr&&arr.cases; if(!Array.isArray(arr)) throw new Error('格式不符');
  var l=load(), n=0; arr.forEach(function(c){ if(!c||!c.settings||!c.name) return; c.id=c.id||('c'+Date.now()+Math.random().toString(36).slice(2,6));
    var i=l.findIndex(function(x){return x.id===c.id;}); if(i>=0) l[i]=c; else l.push(c); n++; }); save(l); refresh(); return n; }
window.HeluoCases={load:load, toURL:toURL, fromURL:fromURL, importCases:importCases};
document.addEventListener('DOMContentLoaded',function(){});
$('caseSave').onclick=function(){ var name=$('caseName').value.trim()||('命例 '+new Date().toLocaleString('zh-TW')); var st=HeluoApp.settings(), l=load();
  var ex=l.filter(function(c){return c.name===name;})[0];
  if(ex){ ex.settings=st; ex.note=$('caseNote').value; ex.updated=new Date().toISOString(); } else { ex={id:'c'+Date.now(), name:name, note:$('caseNote').value, settings:st, created:new Date().toISOString()}; l.push(ex); }
  save(l); refresh(ex.id); msg('已儲存命例「'+name+'」'); };
$('caseLoad').onclick=function(){ var c=find($('caseList').value); if(!c) return msg('請先選擇命例'); $('caseName').value=c.name; $('caseNote').value=c.note||''; HeluoApp.applySettings(c.settings); msg('已載入「'+c.name+'」'); };
$('caseRename').onclick=function(){ var id=$('caseList').value, l=load(), c=l.filter(function(x){return x.id===id;})[0]; if(!c) return msg('請先選擇命例');
  var n=prompt('新名稱', c.name); if(!n) return; c.name=n.trim(); save(l); refresh(id); $('caseName').value=c.name; msg('已改名為「'+c.name+'」'); };
$('caseDel').onclick=function(){ var id=$('caseList').value, c=find(id); if(!c) return msg('請先選擇命例'); if(!confirm('確定刪除「'+c.name+'」？')) return;
  save(load().filter(function(x){return x.id!==id;})); refresh(); msg('已刪除「'+c.name+'」'); };
$('caseExport').onclick=function(){ var blob=new Blob([JSON.stringify({app:'heluo-lishu',version:1,exported:new Date().toISOString(),cases:load()},null,2)],{type:'application/json'});
  HeluoExport.download(blob,'河洛理數命例_'+new Date().toISOString().slice(0,10)+'.json'); };
$('caseImport').onchange=function(e){ var f=e.target.files[0]; if(!f) return; f.text().then(function(t){ var n=importCases(JSON.parse(t)); msg('已匯入 '+n+' 筆命例'); }).catch(function(err){ msg('匯入失敗：'+err.message); }); e.target.value=''; };
$('copyLink').onclick=function(){ var u=toURL(HeluoApp.settings()); history.replaceState(null,'',u);
  (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){ msg('已複製分享連結：'+u); },function(){ prompt('複製此連結',u); }); };
refresh();
})();
