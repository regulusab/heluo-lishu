/* 論命結果輸出：Word（docx.js）、PDF（html2pdf，瀏覽器字型繪製，中文不亂碼）、列印、分享 */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function loadScript(src){ return new Promise(function(ok,bad){ var s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=function(){bad(new Error('載入 '+src+' 失敗'));}; document.head.appendChild(s); }); }
var libs={};
function need(name,src){ if(window[name]) return Promise.resolve(); return libs[name]||(libs[name]=loadScript(src)); }
function download(blob,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },4000); }
function msg(t){ $('msg').textContent=t; }
var POS='初二三四五上';
function yn(b,p){ var y=b[p]==='1'; if(p===0) return '初'+(y?'九':'六'); if(p===5) return '上'+(y?'九':'六'); return (y?'九':'六')+POS[p]; }
function strip(s){ return String(s||'').replace(/<[^>]+>/g,''); }

// 共用報告模型：[{h1|h2|h3|p|table}]
function model(){
  var L=window.LAST; if(!L) throw new Error('尚無論命結果');
  var R=L.R, st=L.settings, H=window.Heluo, X=window.HEX, out=[];
  var name=$('caseName').value.trim(), note=$('caseNote').value.trim();
  out.push({h1:'河洛理數批命'+(name?'：'+name:'')});
  out.push({p:'派別：'+L.school.name+'　（依據：'+L.school.src+'）'});
  out.push({p:'輸入方式：'+(st.mode==='manual'?'手動輸入四柱':'西曆生辰')+'　性別：'+(st.sex==='1'?'男（乾造）':'女（坤造）')+'　陰陽男女依：'+(st.pol==='hour'?'時干':'年干')+(R.startAge>1?'　起運虛歲：'+R.startAge:'')});
  out.push({p:'西曆：'+R.solarText+'　農曆／四柱：'+R.lunarText});
  out.push({table:[['','年柱','月柱','日柱','時柱'],['干支'].concat(R.pillars)]});
  out.push({p:(R.yangP?'陽':'陰')+(st.sex==='1'?'男':'女')+'・'+(R.shun?'天數卦在上':'地數卦在上')+'・'+R.yuan});
  out.push({h2:'一、天地數'});
  out.push({p:'天數（奇）'+R.tian+'：'+R.tr.steps.join(' ')+' → 取 '+R.tr.value+' → '+R.tT.t+(R.tT.ji?'（五寄宮）':'')});
  out.push({p:'地數（偶）'+R.di+'：'+R.dr.steps.join(' ')+' → 取 '+R.dr.value+' → '+R.dT.t+(R.dT.ji?'（五寄宮）':'')});
  out.push({p:'天元氣（年干納甲）：'+R.tianyuan+'　化工：'+(R.huagong||'（手動模式未計）')});
  out.push({h2:'二、先天卦・後天卦'});
  out.push({p:'先天卦：'+X[R.xian.bits].full+'　元堂 '+yn(R.xian.bits,R.xian.pos)+(R.xian.note?'（'+R.xian.note+'）':'')});
  out.push({p:'後天卦：'+X[R.hou.bits].full+'　元堂 '+yn(R.hou.bits,R.hou.pos)+(R.hou.note?'（'+R.hou.note+'）':'')});
  var t=[['派別','先天・元堂','後天・元堂','虛歲一歲之年']]; for(var k in L.all){ var a=L.all[k]; t.push([H.SCHOOLS[k].name, X[a.xian.bits].name+' '+yn(a.xian.bits,a.xian.pos), X[a.hou.bits].name+' '+yn(a.hou.bits,a.hou.pos), String(a.firstYear)]); }
  out.push({h3:'三派對照'}); out.push({table:t});
  out.push({h2:'三、大運'});
  var dt=[['卦','運爻','虛歲','西元','起運年干']]; R.dayun.forEach(function(d){ dt.push([d.gua+' '+X[d.bits].name, yn(d.bits,d.pos), d.from+'–'+d.to, d.yearFrom+'–'+d.yearTo, d.firstStem+(d.firstYang?'（陽）':'（陰）')]); });
  out.push({table:dt});
  out.push({h2:'四、流年（全部大運）'});
  var lt=[['大運','虛歲','西元','干支','流年卦','流年元堂']]; R.dayun.forEach(function(d){ d.years.forEach(function(y,i){ lt.push([i===0? d.gua+X[d.bits].name+yn(d.bits,d.pos):'', String(y.age), String(y.year), y.gz, X[y.bits].full, yn(y.bits,y.changed)]); }); });
  out.push({table:lt});
  out.push({h2:'五、'+L.Y.year+'年（'+L.Y.gz+'）流月　流年卦 '+X[L.Y.bits].name});
  out.push({table:[['月'].concat(L.M.map(function(m,i){return (i+1)+'月';})).slice(0,7), ['卦'].concat(L.M.slice(0,6).map(function(m){return X[m.bits].name+' '+yn(m.bits,m.changed);})), ['月'].concat(L.M.slice(6).map(function(m,i){return (i+7)+'月';})), ['卦'].concat(L.M.slice(6).map(function(m){return X[m.bits].name+' '+yn(m.bits,m.changed);}))]});
  function texts(title,b,p){ var h=X[b]; out.push({h2:title+'：'+h.full+'　元堂 '+yn(b,p)});
    out.push({h3:'卦辭'}); out.push({p:h.gua}); if(h.xiang) out.push({p:h.xiang});
    out.push({h3:'元堂爻辭'}); out.push({p:h.yao[p]});
    if(h.dw){ out.push({h3:'斷文・卦論'}); out.push({p:h.dw}); }
    out.push({h3:'斷文・'+yn(b,p)}); out.push({p:h.dwy[p]||'（來源缺）'});
    if(h.sy){ out.push({h3:'歲運卦訣'}); out.push({p:h.sy+'\n'+(h.syy[p]||'')}); } }
  texts('六、先天卦批文',R.xian.bits,R.xian.pos); texts('七、後天卦批文',R.hou.bits,R.hou.pos);
  texts('八、本大運（'+L.D.from+'–'+L.D.to+'歲）',L.D.bits,L.D.pos); texts('九、'+L.Y.year+'流年',L.Y.bits,L.Y.changed);
  out.push({h2:'派別要點與歧義說明'}); (window.HeluoNotes[L.school.id]||[]).forEach(function(n){ out.push({p:'・'+strip(n)}); });
  if(R.warnings&&R.warnings.length) out.push({p:'四柱檢核提示：'+R.warnings.join('；')});
  if(note){ out.push({h2:'備註'}); out.push({p:note}); }
  out.push({p:'產生時間：'+new Date().toLocaleString('zh-TW')+'　來源網站：'+location.origin+location.pathname});
  return out;
}
function fname(ext){ var n=$('caseName').value.trim()||(window.LAST.R.pillars.join('')); return '河洛理數_'+n.replace(/[\\/:*?"<>|\s]+/g,'_')+'.'+ext; }

function buildDocx(){
  return need('docx','vendor/docx.js').then(function(){
    var D=window.docx, ch=[], F='PMingLiU';
    function run(t,o){ o=o||{}; return new D.TextRun(Object.assign({text:t,font:{ascii:F,eastAsia:F,hAnsi:F,cs:F}},o)); }
    model().forEach(function(b){
      if(b.h1) ch.push(new D.Paragraph({heading:D.HeadingLevel.TITLE,alignment:D.AlignmentType.CENTER,children:[run(b.h1,{bold:true,size:40,color:'7A2A1C'})]}));
      else if(b.h2) ch.push(new D.Paragraph({heading:D.HeadingLevel.HEADING_1,spacing:{before:240,after:120},children:[run(b.h2,{bold:true,size:28,color:'9B2C1F'})]}));
      else if(b.h3) ch.push(new D.Paragraph({heading:D.HeadingLevel.HEADING_2,spacing:{before:120},children:[run(b.h3,{bold:true,size:24,color:'5A3A22'})]}));
      else if(b.p!=null) String(b.p).split('\n').forEach(function(line){ ch.push(new D.Paragraph({spacing:{after:80},children:[run(line,{size:22})]})); });
      else if(b.table){ var n=Math.max.apply(null,b.table.map(function(r){return r.length;}));
        ch.push(new D.Table({width:{size:100,type:D.WidthType.PERCENTAGE},rows:b.table.map(function(r,ri){ var cells=r.slice(); while(cells.length<n) cells.push('');
          return new D.TableRow({tableHeader:ri===0,children:cells.map(function(c){ return new D.TableCell({shading:ri===0?{fill:'F1E6CF'}:undefined,children:[new D.Paragraph({alignment:D.AlignmentType.CENTER,children:[run(String(c),{size:20,bold:ri===0})]})]}); })}); })}));
        ch.push(new D.Paragraph({children:[]})); }
    });
    var doc=new D.Document({creator:'河洛理數批命站',title:'河洛理數批命',styles:{default:{document:{run:{font:{ascii:F,eastAsia:F,hAnsi:F},size:22}}}},sections:[{properties:{},children:ch}]});
    return D.Packer.toBlob(doc);
  });
}
function reportHTML(){
  var h='<div style="font-family:\'Noto Serif CJK TC\',\'Noto Sans CJK TC\',\'PMingLiU\',\'Songti TC\',serif;color:#2b2118;font-size:12px;line-height:1.7;padding:4px 6px;width:720px">';
  function e(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
  model().forEach(function(b){
    if(b.h1) h+='<h1 style="text-align:center;color:#7a2a1c;font-size:22px;margin:0 0 8px">'+e(b.h1)+'</h1>';
    else if(b.h2) h+='<h2 style="color:#9b2c1f;font-size:15px;border-left:4px solid #b08a3e;padding-left:6px;margin:14px 0 6px">'+e(b.h2)+'</h2>';
    else if(b.h3) h+='<h3 style="color:#5a3a22;font-size:13px;margin:8px 0 2px">'+e(b.h3)+'</h3>';
    else if(b.p!=null) h+='<p style="margin:2px 0;white-space:pre-wrap">'+e(b.p)+'</p>';
    else if(b.table) h+='<table style="border-collapse:collapse;width:100%;font-size:11px;margin:4px 0">'+b.table.map(function(r,ri){ return '<tr>'+r.map(function(c){ return '<td style="border:1px solid #d8c9a8;padding:2px 4px;text-align:center;'+(ri===0?'background:#f1e6cf;font-weight:bold':'')+'">'+e(c)+'</td>'; }).join('')+'</tr>'; }).join('')+'</table>';
  });
  return h+'</div>';
}
function buildPdf(){
  return need('html2pdf','vendor/html2pdf.js').then(function(){
    var box=document.createElement('div'); box.innerHTML=reportHTML(); box.style.cssText='position:fixed;left:0;top:0;z-index:-1;background:#fff';
    document.body.appendChild(box);
    return window.html2pdf().set({margin:[10,10,12,10],image:{type:'jpeg',quality:0.92},html2canvas:{scale:2,backgroundColor:'#ffffff'},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['tr','h2','h3']}}).from(box.firstChild).outputPdf('blob')
      .then(function(b){ box.remove(); return b; },function(err){ box.remove(); throw err; });
  });
}
function act(btn,fn){ btn.onclick=function(){ var t=btn.textContent; btn.disabled=true; btn.textContent='產生中…'; Promise.resolve().then(fn).catch(function(e){ msg('失敗：'+e.message); }).then(function(){ btn.disabled=false; btn.textContent=t; }); }; }
act($('dlDocx'),function(){ return buildDocx().then(function(b){ download(b,fname('docx')); msg('已下載 Word 檔'); }); });
act($('dlPdf'),function(){ return buildPdf().then(function(b){ download(b,fname('pdf')); msg('已下載 PDF 檔'); }); });
$('print').onclick=function(){ Array.prototype.forEach.call(document.querySelectorAll('details'),function(d){d.open=true;}); window.print(); };
act($('share'),function(){
  var url=HeluoCases.toURL(HeluoApp.settings());
  var kind=confirm('分享 PDF 檔？（取消則分享 Word 檔）')?'pdf':'docx';
  return (kind==='pdf'?buildPdf():buildDocx()).then(function(b){
    var f=new File([b],fname(kind),{type:kind==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    if(navigator.canShare&&navigator.canShare({files:[f]})) return navigator.share({files:[f],title:'河洛理數批命',text:'河洛理數批命結果　'+url}).then(function(){ msg('已分享'); },function(e){ if(e.name!=='AbortError') throw e; });
    if(navigator.share) return navigator.share({title:'河洛理數批命',url:url}).then(function(){ download(b,f.name); msg('此瀏覽器不支援分享檔案，已分享連結並下載檔案'); },function(){ download(b,f.name); msg('已下載檔案'); });
    download(b,f.name); (navigator.clipboard?navigator.clipboard.writeText(url):Promise.resolve()).then(function(){ msg('此瀏覽器不支援分享，已下載檔案並複製分享連結'); });
  });
});
window.HeluoExport={download:download, model:model, buildDocx:buildDocx, buildPdf:buildPdf, reportHTML:reportHTML};
})();
