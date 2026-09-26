'use strict';
// All calculations use millimetres and kilograms. Unit switches only change presentation.
const PRESETS={
 '20gp':{length:5898,width:2352,height:2393,door:2280,payload:28200},
 '40gp':{length:12032,width:2352,height:2393,door:2280,payload:26700},
 '40hc':{length:12032,width:2352,height:2698,door:2585,payload:26500},
 '45hc':{length:13556,width:2352,height:2698,door:2585,payload:25600}
};
const DEFAULT_ROLL={diameter:1150,rollHeight:1000,weight:850,clearance:15};
const t=(key,params,fallback)=>(typeof window!=='undefined'&&window.RollPackI18n?window.RollPackI18n.t(key,params,fallback):(fallback||key));
const getLang=()=>(typeof window!=='undefined'&&window.RollPackI18n?window.RollPackI18n.getLanguage():'th');
const FIELD_LABELS={
 length:{th:'ความยาวภายในตู้',zh:'箱内长度'},
 width:{th:'ความกว้างภายในตู้',zh:'箱内宽度'},
 height:{th:'ความสูงภายในตู้',zh:'箱内高度'},
 door:{th:'ความสูงช่องประตู',zh:'箱门高度'},
 payload:{th:'พิกัดน้ำหนักบรรทุกสุทธิ',zh:'最大有效载重'},
 diameter:{th:'เส้นผ่านศูนย์กลางม้วน',zh:'纸卷外径'},
 rollHeight:{th:'หน้ากว้างม้วน',zh:'纸卷幅宽 (高度)'},
 weight:{th:'น้ำหนักต่อม้วน',zh:'单卷重量'},
 clearance:{th:'ระยะเผื่อ',zh:'间隙余量'}
};
function getFieldLabel(k){
 const lang=getLang();
 return (FIELD_LABELS[k]&&FIELD_LABELS[k][lang])||(FIELD_LABELS[k]&&FIELD_LABELS[k].th)||k;
}
function getPlanLabel(type){
 const lang=getLang();
 const labels={
  'vertical-grid':{th:'ตั้ง · ตาราง',zh:'立放 · 矩形网格'},
  'vertical-hex-w':{th:'ตั้ง · สับหว่างตามกว้าง',zh:'立放 · 沿宽交错'},
  'vertical-hex-l':{th:'ตั้ง · สับหว่างตามยาว',zh:'立放 · 沿长交错'},
  'horizontal-l':{th:'นอน · แกนตามยาว',zh:'卧放 · 轴向顺长'},
  'horizontal-w':{th:'นอน · แกนตามกว้าง',zh:'卧放 · 轴向顺宽'}
 };
 return (labels[type]&&labels[type][lang])||(labels[type]&&labels[type].th)||type;
}
const FIELD_DEFS=[
 ['length','ความยาวภายในตู้','length','container-fields'],['width','ความกว้างภายในตู้','length','container-fields'],
 ['height','ความสูงภายในตู้','length','container-fields'],['door','ความสูงช่องประตู','length','container-fields'],
 ['payload','พิกัดน้ำหนักบรรทุกสุทธิ','weight','container-fields'],
 ['diameter','เส้นผ่านศูนย์กลางม้วน','length','roll-fields'],['rollHeight','หน้ากว้างม้วน','length','roll-fields'],
 ['weight','น้ำหนักต่อม้วน','weight','roll-fields'],['clearance','ระยะเผื่อ','length','clearance-field']
];
const LIMIT=10000; // Bounded coordinate generation prevents freezing on impractical inputs.
const fit=(span,pitch)=>Math.max(0,Math.floor((span+1e-7)/pitch));
function makePlan(s,orientation='auto'){
 const {length:L,width:W,height:H,door,payload,diameter:D,rollHeight:R,weight,clearance:g}=s;
 const vals=Object.values(s);
 if(vals.some(v=>!Number.isFinite(v))||FIELD_DEFS.some(([k])=>k==='clearance'?s[k]<0:s[k]<=0))return {error:'invalid',plans:[]};
 if(door>H)return {error:'door',plans:[]};
 const pitch=D+g, maxWeight=fit(payload,weight), plans=[];let oversized=false;
 function add(type,label,points,layers,unitHeight){
  if(!points.length||!layers)return;
  const total=points.length*layers;
  if(!Number.isSafeInteger(total)||total>1e9){oversized=true;return;}
  const count=Math.min(total,maxWeight),usedLayers=count?Math.ceil(count/points.length):0;
  plans.push({type,label:getPlanLabel(type),points,layers,unitHeight,total,count,usedLayers,perLayer:points.length});
 }
 function grid(a,b,circular){
  const nx=fit(L,a+g),ny=fit(W,b+g);
  if(nx*ny>LIMIT){oversized=true;return []}
  const pts=[];
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)pts.push({x:g/2+a/2+i*(a+g),y:g/2+b/2+j*(b+g),a,b,circular});
  return pts;
 }
 if(orientation!=='horizontal'&&R<=door+1e-7){
  const layers=fit(H,R);
  add('vertical-grid','ตั้ง · ตาราง',grid(D,D,true),layers,R);
  for(const swapped of [false,true]){
   const A=swapped?W:L,B=swapped?L:W,pts=[],dx=pitch*Math.sqrt(3)/2;
   const n= A>=pitch ? Math.floor((A-pitch+1e-7)/dx)+1:0;
   if(n>LIMIT){oversized=true;continue;}
   outer:for(let i=0;i<n;i++){
    const x=pitch/2+i*dx, start=pitch/2+(i%2?pitch/2:0);
    const rows=Math.max(0,Math.floor((B-pitch/2-start+1e-7)/pitch)+1);
    if(pts.length+rows>LIMIT){oversized=true;pts.length=0;break outer;}
    for(let j=0;j<rows;j++){
     const y=start+j*pitch;
     pts.push({x:swapped?y:x,y:swapped?x:y,a:D,b:D,circular:true});
    }
   }
   add('vertical-hex-'+(swapped?'w':'l'),'ตั้ง · สับหว่าง'+(swapped?'ตามกว้าง':'ตามยาว'),pts,layers,R);
  }
 }
 if(orientation!=='vertical'&&D<=door+1e-7){
  add('horizontal-l','นอน · แกนตามยาว',grid(R,D,false),fit(H,D),D);
  add('horizontal-w','นอน · แกนตามกว้าง',grid(D,R,false),fit(H,D),D);
 }
 if(oversized)return {error:'complex',plans:[]};
 plans.sort((a,b)=>b.count-a.count||a.usedLayers-b.usedLayers||b.total-a.total);
 return {plans,best:plans[0]||null,maxWeight};
}
let state={...PRESETS['20gp'],...DEFAULT_ROLL},unit='metric',preset='20gp',orientation='auto',result=null,layer=1,view='top',announceTimer;
const $=id=>document.getElementById(id);
const fmt=(n,digits=0)=>new Intl.NumberFormat(getLang()==='zh'?'zh-CN':'th-TH',{maximumFractionDigits:digits}).format(n);
const fieldType=k=>FIELD_DEFS.find(d=>d[0]===k)[2];
const factor=type=>unit==='metric'?1:type==='weight'?2.20462262185:1/25.4;
const unitText=type=>{
 const lang=getLang();
 if(unit==='metric'){
  return type==='weight'?(lang==='zh'?'kg':'กก.'):(lang==='zh'?'mm':'มม.');
 }
 return type==='weight'?(lang==='zh'?'lb':'ปอนด์'):(lang==='zh'?'in':'นิ้ว');
};
const weightText=v=>fmt(v*factor('weight'),1)+' '+unitText('weight');
function updateFieldLabels(){
 for(const [k] of FIELD_DEFS){
  const lbl=document.querySelector(`label[for="${k}"]`);
  if(lbl)lbl.textContent=getFieldLabel(k);
 }
}
function createFields(){
 for(const [key,,type,parent] of FIELD_DEFS){
  const div=document.createElement('div');div.className='field'+(['payload','weight'].includes(key)?' full':'');
  div.innerHTML=`<label class="field-label" for="${key}">${getFieldLabel(key)}</label><div class="input-wrap"><input id="${key}" type="number" inputmode="decimal" step="any" min="${key==='clearance'?0:0.000001}" required aria-describedby="${key}-error" autocomplete="off"><span class="unit" data-unit="${type}"></span></div><p class="error" id="${key}-error"></p>`;
  $(parent).appendChild(div);
  $(key).addEventListener('input',()=>{
   state[key]=$(key).value.trim()===''?NaN:Number($(key).value)/factor(type);
   if(parent==='container-fields'){preset='custom';updatePresetButtons();}
   layer=1;render();
  });
 }
}
function syncInputs(){
 for(const [k,,type] of FIELD_DEFS)$(k).value=Number.isFinite(state[k])?Number((state[k]*factor(type)).toFixed(6)):'';
 document.querySelectorAll('[data-unit]').forEach(el=>el.textContent=unitText(el.dataset.unit));
 $('units').value=unit;
}
function updatePresetButtons(){document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===preset)));}
function updateOrientation(){
 document.querySelectorAll('[data-orientation]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.orientation===orientation)));
 const lang=getLang();
 const texts={
  th:{
   auto:'เปรียบเทียบรูปแบบการวาง แล้วเลือกจำนวนมากที่สุดภายในพิกัดน้ำหนักที่ระบุ',
   vertical:'วางม้วนตั้งขึ้น ฐานวงกลมสัมผัสพื้น เปรียบเทียบการเรียงแบบตารางและสับหว่าง',
   horizontal:'วางม้วนนอนตามแกน เปรียบเทียบแนวยาวและแนวขวาง ต้องตรวจสอบการหนุนและรัดตรึง'
  },
  zh:{
   auto:'智能比对所有排列组合，选用在载重限制内装载量最大的方案',
   vertical:'纸卷垂直立放，圆形截面接触底面，比对矩阵与交错错位排布',
   horizontal:'纸卷水平卧放，沿纵向或横向滚动轴向排列，需配合加固防滚'
  }
 };
 $('orientation-help').textContent=(texts[lang]&&texts[lang][orientation])||texts.th[orientation];
}
function validate(){
 let valid=true;
 const lang=getLang();
 for(const [k] of FIELD_DEFS){let message='';
  if(!Number.isFinite(state[k]))message=lang==='zh'?'请输入有效数字':'กรุณาระบุตัวเลข';
  else if(k==='clearance'?state[k]<0:state[k]<=0)message=k==='clearance'?(lang==='zh'?'间隙余量必须为0或正数':'ระยะเผื่อต้องเป็นศูนย์หรือมากกว่า'):(lang==='zh'?'请输入大于0的数值':'กรุณาระบุตัวเลขที่มากกว่าศูนย์');
  else if(k==='door'&&state.door>state.height)message=lang==='zh'?'箱门高度不能超过箱内高度':'ช่องประตูต้องไม่สูงกว่าภายในตู้';
  $(k+'-error').textContent=message;$(k).setAttribute('aria-invalid',String(!!message));
  if(message){valid=false;if(['length','width','height','door','payload'].includes(k))$('container-details').open=true;}
 }
 return valid;
}
function render(){
 const valid=validate();
 const lang=getLang();
 const rollWord=lang==='zh'?'卷':'ม้วน';
 const layerWord=lang==='zh'?'层':'ชั้น';
 $('spec-summary').textContent=['length','width','height','payload'].every(k=>Number.isFinite(state[k])&&state[k]>0)?`${fmt(state.length*factor('length'),1)} × ${fmt(state.width*factor('length'),1)} × ${fmt(state.height*factor('length'),1)} ${unitText('length')} · `+(lang==='zh'?`限重 ${weightText(state.payload)}`:`รับน้ำหนัก ${weightText(state.payload)}`):(lang==='zh'?'请指定集装箱尺寸与限重':'ระบุขนาดและพิกัดน้ำหนักของตู้');
 result=valid?makePlan(state,orientation):{error:'invalid',plans:[]};
 const p=result.best,usable=!!p&&!result.error,count=usable?p.count:0;
 const unknown=!!result.error;
 $('result-count').textContent=unknown?'—':fmt(count);
 let limitBadgeText='';
 if(unknown)limitBadgeText=lang==='zh'?'检查输入数据':'ตรวจสอบข้อมูล';
 else if(!p)limitBadgeText=lang==='zh'?'未找到适配方案':'ไม่พบรูปแบบที่พอดี';
 else if(count===0)limitBadgeText=lang==='zh'?'单卷超重':'เกินพิกัดต่อม้วน';
 else if(count<p.total)limitBadgeText=lang==='zh'?'受载重限制':'จำกัดด้วยน้ำหนัก';
 else limitBadgeText=lang==='zh'?'受空间限制':'จำกัดด้วยขนาด';
 $('limit-badge').textContent=limitBadgeText;
 $('total-weight').textContent=unknown?'—':weightText(count*state.weight);
 $('remaining-weight').textContent=unknown?'—':weightText(state.payload-count*state.weight);
 const pct=unknown?0:count*state.weight/state.payload*100;
 $('payload-percent').textContent=unknown?'—':fmt(pct,1)+'%';$('payload-progress').value=pct;
 $('result-detail').textContent=usable?(lang==='zh'?`${p.label} · 实际装载 ${fmt(p.usedLayers)} 层`:`${p.label} · ${fmt(p.usedLayers)} ชั้นที่ใช้จริง`):(lang==='zh'?'请修改左侧参数以重新计算':'แก้ไขข้อมูลด้านซ้ายเพื่อคำนวณใหม่');
 $('per-layer').textContent=usable?fmt(p.perLayer)+' '+rollWord:'—';
 $('used-layers').textContent=usable?fmt(p.usedLayers)+' / '+fmt(p.layers)+' '+layerWord:'—';
 $('physical-count').textContent=usable?fmt(p.total)+' '+rollWord:'—';
 const notices=[];
 if(result.error==='complex')notices.push(lang==='zh'?'指定尺寸生成的点位过多，请核对单位与纸卷尺寸（每层最多支持 10,000 点位）':'ขนาดที่ระบุทำให้ผังมีจำนวนตำแหน่งมากเกินไป โปรดตรวจสอบหน่วยและขนาดม้วน (รองรับไม่เกิน 10,000 ตำแหน่งต่อชั้น)');
 else if(result.error)notices.push(lang==='zh'?'请修改红色提示项目，数据完整后系统将自动重新计算':'กรุณาแก้ไขช่องที่มีข้อความสีแดง ระบบจะคำนวณใหม่เมื่อข้อมูลครบถ้วน');
 else if(!p)notices.push(lang==='zh'?'在该摆放方向下，纸卷无法通过箱门或放入箱内。请检查尺寸、更换箱型或选择智能推荐':'ม้วนไม่พอดีกับตู้หรือช่องประตูในทิศทางที่เลือก ลองตรวจสอบขนาด เปลี่ยนตู้ หรือเลือกทิศทางอัตโนมัติ');
 else{
  if(!count)notices.push(lang==='zh'?'单卷纸卷重量已超过集装箱最大有效载重，无法装运':'น้ำหนักม้วนเดียวเกินพิกัดบรรทุกที่ระบุ จึงยังบรรจุไม่ได้');
  else if(count<p.total)notices.push(lang==='zh'?`空间理论可容纳 ${fmt(p.total)} 卷，但受限重约束最多装载 ${fmt(count)} 卷，排布图仅展示实际装箱数量`:`ตามขนาดวางได้ ${fmt(p.total)} ม้วน แต่พิกัดน้ำหนักที่กรอกจำกัดไว้ที่ ${fmt(count)} ม้วน ผังแสดงเฉพาะจำนวนนี้`);
  if(p.usedLayers*p.unitHeight>state.door+1e-7)notices.push(lang==='zh'?'实际摆放总高度超出箱门净高，装箱前请确认箱内吊装与叉车作业可行性':'ความสูงรวมของชั้นที่ใช้เกินช่องประตู ต้องตรวจสอบวิธียกและจัดชั้นภายในตู้ก่อนใช้แผนนี้');
  if(p.type.startsWith('horizontal'))notices.push(lang==='zh'?'卧放模式需要专业加固与垫仓，捆扎支架等辅料占用空间未计入排布图':'รูปแบบนี้วางม้วนนอน ต้องมีการหนุนและรัดตรึงที่เหมาะสม พื้นที่อุปกรณ์ยังไม่รวมในผัง');
 }
 $('notices').replaceChildren(...notices.map(t=>{const el=document.createElement('p');el.textContent=t;return el;}));$('notices').hidden=!notices.length;$('notices').classList.toggle('error-state',unknown||!p||!count);
 $('comparison-body').innerHTML=result.plans.map(q=>`<tr class="${q===p?'chosen':''}"><td>${q===p?'✓ ':''}${q.label}</td><td class="num">${fmt(q.total)}</td><td class="num">${fmt(q.count)} ${rollWord}</td></tr>`).join('')||`<tr><td colspan="3">${lang==='zh'?'暂无可比方案':'ยังไม่มีรูปแบบให้เปรียบเทียบ'}</td></tr>`;
 $('mobile-summary').textContent=unknown?(lang==='zh'?'检查输入数据':'ตรวจสอบข้อมูล'):fmt(count)+` ${rollWord} · `+weightText(count*state.weight);
 drawPlan();updatePrintSheet();clearTimeout(announceTimer);announceTimer=setTimeout(()=>{$('live-result').textContent=unknown?(lang==='zh'?'请更正输入':'กรุณาแก้ไขข้อมูล'):(lang==='zh'?`计算得出 ${fmt(count)} 卷 ${usable?p.label:''}`:`คำนวณได้ ${fmt(count)} ม้วน ${usable?p.label:''}`);},500);
}
function occupiedPositions(p,tier){
 const filled=Math.min(p.perLayer,Math.max(0,p.count-(tier-1)*p.perLayer)),occupied=new Set();
 if(tier===1&&filled<p.perLayer){for(let i=0;i<filled;i++)occupied.add(Math.floor((i+.5)*p.perLayer/filled));}
 else{for(let i=0;i<filled;i++)occupied.add(i);}
 return occupied;
}
function sideProjection(p){
 if(!p||!p.count)return {groups:[],simplified:false};
 if(p.usedLayers>200||p.usedLayers*p.perLayer>20000)return {groups:[],simplified:true};
 const groups=[];
 for(let tier=1;tier<=p.usedLayers;tier++){
  const positions=new Map();
  for(const i of occupiedPositions(p,tier)){
   const pt=p.points[i],key=pt.x.toFixed(6)+':'+pt.a.toFixed(6);
   if(positions.has(key))positions.get(key).count++;
   else positions.set(key,{x:pt.x,width:pt.a,bottom:(tier-1)*p.unitHeight,height:p.unitHeight,tier,count:1,circular:p.type==='horizontal-w'});
  }
  groups.push(...positions.values());
 }
 return {groups,simplified:false};
}
function drawSidePlan(p){
 const lang=getLang();
 const projection=sideProjection(p),stack=p.usedLayers*p.unitHeight;
 const vw=800,pad=65,scale=Math.min((vw-2*pad)/state.length,270/state.height),w=state.length*scale,h=state.height*scale,ox=(vw-w)/2,oy=46,base=oy+h,doorY=base-state.door*scale;
 const len=v=>fmt(v*factor('length'),1)+' '+unitText('length');
 const over=stack>state.door+1e-7;
 $('layer-controls').hidden=true;
 $('plan-subtitle').textContent=lang==='zh'?`${p.label} · 共 ${fmt(p.count)} 卷，摆放 ${fmt(p.usedLayers)} 层`:`${p.label} · ${fmt(p.count)} ม้วน รวม ${fmt(p.usedLayers)} ชั้น`;
 $('side-summary').innerHTML=[
  [lang==='zh'?'箱内净高':'ความสูงภายในตู้',state.height],
  [lang==='zh'?'装载总高':'ความสูงที่บรรจุ',stack],
  [lang==='zh'?'箱门高度':'ความสูงช่องประตู',state.door],
  [lang==='zh'?'顶层间隙':'ช่องว่างถึงเพดาน',Math.max(0,state.height-stack)]
 ].map(([label,value],i)=>`<div class="${i===1&&over?'height-warning':''}"><span>${label}</span><strong class="num">${len(value)}</strong></div>`).join('');
 $('side-note').textContent=(projection.simplified?(lang==='zh'?'点位较多，显示总高度包络线代替单卷 · ':'จำนวนตำแหน่งมาก แสดงกรอบความสูงรวมแทนม้วนรายชิ้น · '):'')+(lang==='zh'?'从集装箱侧面（长边）透视各层纸卷，重叠纸卷数字 × 表示沿宽度同向排列卷数，橙色虚线表示箱门上方高度。':'มองจากด้านยาวของตู้ รวมทุกชั้น ม้วนที่อยู่หลังกันอาจบังกัน ตัวเลข × คือจำนวนม้วนที่ซ้อนกันในภาพ เส้นประสีส้มแสดงระดับบนของช่องประตู');
 let shapes='';
 if(projection.simplified){const minX=Math.min(...p.points.map(q=>q.x-q.a/2)),maxX=Math.max(...p.points.map(q=>q.x+q.a/2));shapes=`<rect x="${ox+minX*scale}" y="${base-stack*scale}" width="${(maxX-minX)*scale}" height="${stack*scale}" fill="#e7efff" stroke="#366bed" stroke-dasharray="6 4"/>`;}
 else for(const q of projection.groups){
  const x=ox+q.x*scale,y=base-(q.bottom+q.height/2)*scale,a=q.width*scale,b=q.height*scale;
  const title=lang==='zh'?`第 ${q.tier} 层：宽向并排 ${q.count} 卷`:`ชั้น ${q.tier}: ${q.count} ม้วนในแนวกว้าง`;
  if(q.circular)shapes+=`<g><title>${title}</title><circle cx="${x}" cy="${y}" r="${b/2}" fill="#366bed" stroke="#2454c4" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${b*.1}" fill="#e7efff"/></g>`;
  else shapes+=`<rect x="${x-a/2}" y="${y-b/2}" width="${a}" height="${b}" rx="${Math.min(3,a/8,b/8)}" fill="#366bed" fill-opacity=".85" stroke="#2454c4" stroke-width="1.2"><title>${title}</title></rect>`;
  if(q.count>1&&Math.min(a,b)>32)shapes+=`<text x="${x}" y="${y+(q.circular?b*.3:5)}" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="14">×${q.count}</text>`;
 }
 $('diagram').innerHTML=`<svg viewBox="0 0 ${vw} ${h+104}" role="img" aria-labelledby="diagram-title diagram-description"><title id="diagram-title">${lang==='zh'?`侧视图 ${p.count} 卷 ${p.usedLayers} 层`:`มุมมองด้านข้าง ${p.count} ม้วน ${p.usedLayers} ชั้น`}</title><desc id="diagram-description">${lang==='zh'?`装载总高度 ${len(stack)} 箱门高度 ${len(state.door)} ${over?'总高超过箱门':''}`:`ความสูงบรรจุ ${len(stack)} ช่องประตูสูง ${len(state.door)} ม้วนตามแนวกว้างอาจบังกัน ${over?'ความสูงรวมเกินระดับช่องประตู':''}`}</desc><rect x="${ox-5}" y="${oy-5}" width="${w+10}" height="${h+10}" rx="4" fill="#e6edf7" stroke="#9baec9"/><rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="white"/>${shapes}<path d="M ${ox} ${doorY} H ${ox+w}" stroke="#b97912" stroke-width="1.5" stroke-dasharray="7 5"/><path d="M ${ox+w+4} ${doorY} V ${base}" stroke="#e59b27" stroke-width="5"/><path d="M ${ox} ${base+2} H ${ox+w}" stroke="#526781" stroke-width="3"/><text x="400" y="23" text-anchor="middle" fill="#526781" font-family="Tahoma,sans-serif" font-size="14">${lang==='zh'?'长 ':'ยาว '}${len(state.length)}</text><text x="400" y="${base+36}" text-anchor="middle" fill="#526781" font-family="Tahoma,sans-serif" font-size="14">${lang==='zh'?'集装箱底板 · 侧面透视':'พื้นตู้ · มองจากด้านยาว'}</text><text x="${ox-12}" y="${oy+h/2}" text-anchor="end" fill="#526781" font-family="Tahoma,sans-serif" font-size="12">${lang==='zh'?'箱头':'หัวตู้'}</text><text x="${ox+w+12}" y="${doorY+Math.max(14,state.door*scale/2)}" fill="#956514" font-family="Tahoma,sans-serif" font-size="12">${lang==='zh'?'箱门':'ประตู'}</text></svg>`;
}
function drawPlan(){
 const p=result.best;
 const lang=getLang();
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 $('side-summary').hidden=$('side-note').hidden=view!=='side'||!p||!p.count;
 $('empty-legend').hidden=view==='side';
 if(!p||!p.count){$('diagram').innerHTML='<div class="empty-diagram">'+(result.error?(lang==='zh'?'请填写完整数据以查看排布图':'กรอกข้อมูลให้ครบเพื่อดูผัง'):(lang==='zh'?'在此条件下无法装入纸卷':'ยังไม่มีม้วนที่บรรจุได้ในเงื่อนไขนี้'))+'</div>';$('plan-subtitle').textContent=view==='side'?(lang==='zh'?'侧视图':'มุมมองด้านข้าง'):(lang==='zh'?'俯视图':'มุมมองด้านบน');$('layer-controls').hidden=true;return;}
 if(view==='side'){drawSidePlan(p);return;}
 layer=Math.min(Math.max(1,layer),p.usedLayers);
 const filled=Math.min(p.perLayer,Math.max(0,p.count-(layer-1)*p.perLayer));
 $('plan-subtitle').textContent=lang==='zh'?`${p.label} · 第 ${fmt(layer)} 层容纳 ${fmt(filled)} 卷`:`${p.label} · ชั้น ${fmt(layer)} มี ${fmt(filled)} ม้วน`;
 $('layer-controls').hidden=p.usedLayers<=1;$('layer-label').textContent=fmt(layer)+' / '+fmt(p.usedLayers);$('layer-prev').disabled=layer===1;$('layer-next').disabled=layer===p.usedLayers;
 const vw=800,pad=55,maxH=350,scale=Math.min((vw-pad*2)/state.length,(maxH-70)/state.width),w=state.length*scale,h=state.width*scale,ox=(vw-w)/2,oy=42;
 const occupied=occupiedPositions(p,layer);
 let shapes='';p.points.forEach((pt,i)=>{
  const x=ox+pt.x*scale,y=oy+pt.y*scale,a=pt.a*scale,b=pt.b*scale,on=occupied.has(i),fill=on?'#366bed':'#f7f9fd',stroke=on?'#2454c4':'#a6b6cd',dash=on?'':'stroke-dasharray="4 3"';
  if(pt.circular){shapes+=`<circle cx="${x}" cy="${y}" r="${a/2}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" ${dash}/>`;if(on)shapes+=`<circle cx="${x}" cy="${y}" r="${a*.12}" fill="#e7efff"/>`;}
  else shapes+=`<rect x="${x-a/2}" y="${y-b/2}" width="${a}" height="${b}" rx="${Math.min(4,a/8,b/8)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" ${dash}/>`;
  if(on&&Math.min(a,b)>25){shapes+=`<text x="${x}" y="${y+4}" text-anchor="middle" fill="${pt.circular?'#17335b':'white'}" font-family="system-ui,sans-serif" font-size="11">${i+1}</text>`;}
 });
 $('diagram').innerHTML=`<svg viewBox="0 0 ${vw} ${h+85}" role="img" aria-labelledby="diagram-title diagram-description"><title id="diagram-title">${lang==='zh'?`俯视第 ${layer} 层：${filled} 卷`:`ผังชั้น ${layer}: ${filled} ม้วน`}</title><desc id="diagram-description">${p.label} ${lang==='zh'?'蓝色为装载纸卷，虚线为空位，右侧为箱门':'สีฟ้าคือม้วนที่บรรจุ เส้นประคือตำแหน่งว่าง ประตูอยู่ด้านขวา'}</desc><rect x="${ox-5}" y="${oy-5}" width="${w+10}" height="${h+10}" rx="4" fill="#e6edf7" stroke="#9baec9"/><rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="white"/>${shapes}<path d="M ${ox+w+4} ${oy} v ${h}" stroke="#e59b27" stroke-width="5"/><text x="400" y="22" text-anchor="middle" fill="#526781" font-family="Tahoma,sans-serif" font-size="13">${fmt(state.length*factor('length'),1)} ${unitText('length')}</text><text x="400" y="${oy+h+32}" text-anchor="middle" fill="#526781" font-family="Tahoma,sans-serif" font-size="12">${lang==='zh'?'宽 ':'กว้าง '}${fmt(state.width*factor('length'),1)} ${unitText('length')}</text><text x="${ox-12}" y="${oy+h/2}" text-anchor="end" fill="#526781" font-family="Tahoma,sans-serif" font-size="12">${lang==='zh'?'箱头':'หัวตู้'}</text><text x="${ox+w+12}" y="${oy+h/2}" fill="#956514" font-family="Tahoma,sans-serif" font-size="12">${lang==='zh'?'箱门':'ประตู'}</text></svg>`;
}
const PRESET_NAMES={
 th:{
  '20gp':'20′ Standard (ตู้แห้งทั่วไป)',
  '40gp':'40′ Standard (ตู้แห้งทั่วไป)',
  '40hc':'40′ High Cube (ตู้ทรงสูง)',
  '45hc':'45′ High Cube (ตู้ทรงสูง)',
  'custom':'กำหนดขนาดเอง (Custom)'
 },
 zh:{
  '20gp':'20′ Standard (标准普柜)',
  '40gp':'40′ Standard (标准普柜)',
  '40hc':'40′ High Cube (高柜 HQ)',
  '45hc':'45′ High Cube (高柜 HQ)',
  'custom':'自定义尺寸 (Custom)'
 }
};
const ORIENTATION_NAMES={
 th:{
  'auto':'อัตโนมัติ (เลือกแบบที่จุได้มากที่สุด)',
  'vertical':'แนวตั้ง (ฐานวงกลมสัมผัสพื้น)',
  'horizontal':'แนวนอน (แกนม้วนนอนตามยาว/กว้าง)'
 },
 zh:{
  'auto':'智能推荐 (按载重最优)',
  'vertical':'立放 (圆形底面接触底板)',
  'horizontal':'卧放 (沿轴向滚动摆放)'
 }
};
function getPresetName(p){
 const lang=getLang();
 return (PRESET_NAMES[lang]&&PRESET_NAMES[lang][p])||PRESET_NAMES.th[p]||p;
}
function getOrientationName(o){
 const lang=getLang();
 return (ORIENTATION_NAMES[lang]&&ORIENTATION_NAMES[lang][o])||ORIENTATION_NAMES.th[o]||o;
}
function updatePrintSheet(){
 if(!$('print-sheet'))return;
 const lang=getLang();
 const len=v=>Number.isFinite(v)?`${fmt(v*factor('length'),1)} ${unitText('length')}`:'—';
 const wgt=v=>Number.isFinite(v)?`${fmt(v*factor('weight'),1)} ${unitText('weight')}`:'—';
 const now=new Date();
 const dStr=now.toLocaleDateString(lang==='zh'?'zh-CN':'th-TH',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 if($('print-date'))$('print-date').textContent=(lang==='zh'?'报告时间: ':'วันที่ออกรายงาน: ')+dStr;
 if($('print-unit-label'))$('print-unit-label').textContent=(lang==='zh'?'计量单位: ':'ระบบหน่วย: ')+(unit==='metric'?(lang==='zh'?'公制 (毫米 / 公斤)':'เมตริก (มม. / กก.)'):(lang==='zh'?'英制 (英寸 / 磅)':'อิมพีเรียล (นิ้ว / ปอนด์)'));
 if($('print-container-name'))$('print-container-name').textContent=getPresetName(preset);
 if($('print-container-dims'))$('print-container-dims').textContent=`${len(state.length)} × ${len(state.width)} × ${len(state.height)}`;
 if($('print-container-door'))$('print-container-door').textContent=len(state.door);
 if($('print-container-payload'))$('print-container-payload').textContent=wgt(state.payload);
 if($('print-roll-diameter'))$('print-roll-diameter').textContent=len(state.diameter);
 if($('print-roll-height'))$('print-roll-height').textContent=len(state.rollHeight);
 if($('print-roll-weight'))$('print-roll-weight').textContent=wgt(state.weight);
 if($('print-roll-clearance'))$('print-roll-clearance').textContent=len(state.clearance);
 if($('print-roll-orientation'))$('print-roll-orientation').textContent=getOrientationName(orientation);
}
function getSpecText(){
 const activeResult=result||makePlan(state,orientation);
 const p=activeResult&&activeResult.best;
 const usable=!!p&&!activeResult.error;
 const count=usable?p.count:0;
 const lang=getLang();
 const lenText=v=>Number.isFinite(v)?`${fmt(v*factor('length'),1)} ${unitText('length')}`:'—';
 const now=new Date();
 const dateStr=now.toLocaleDateString(lang==='zh'?'zh-CN':'th-TH',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const presetName=getPresetName(preset);
 const orientName=getOrientationName(orientation);

 if(lang==='zh'){
  let text=`==================================================\n`;
  text+=` RollPack Pro · 集装箱装箱规划报告与规格总结\n`;
  text+=` 生成时间: ${dateStr}\n`;
  text+=` 计量单位: ${unit==='metric'?'公制 (毫米 / 公斤)':'英制 (英寸 / 磅)'}\n`;
  text+=`==================================================\n\n`;

  text+=`[1. 集装箱数据]\n`;
  text+=`• 箱型: ${presetName}\n`;
  text+=`• 箱内尺寸 (长 × 宽 × 高): ${lenText(state.length)} × ${lenText(state.width)} × ${lenText(state.height)}\n`;
  text+=`• 箱门净高: ${lenText(state.door)}\n`;
  text+=`• 最大有效载重: ${weightText(state.payload)}\n\n`;

  text+=`[2. 纸卷规格]\n`;
  text+=`• 外径 (OD): ${lenText(state.diameter)}\n`;
  text+=`• 幅宽 (立放高度): ${lenText(state.rollHeight)}\n`;
  text+=`• 单卷重量: ${weightText(state.weight)}\n`;
  text+=`• 间隙余量: ${lenText(state.clearance)}\n`;
  text+=`• 摆放方向: ${orientName}\n\n`;

  text+=`[3. 计算方案与空间排布]\n`;
  if(result&&result.error){
   text+=`• 状态: 数据不完整或存在错误，请核对输入参数\n`;
  }else if(!p||count===0){
   text+=`• 状态: 当前条件下无法装载（单卷超重或尺寸超限）\n`;
  }else{
   const limitStatus=count<p.total?'受载重限制':'受空间限制';
   const totalW=count*state.weight;
   const remainW=state.payload-totalW;
   const pct=(totalW/state.payload)*100;
   const stackH=p.usedLayers*p.unitHeight;
   const ceilingClearance=Math.max(0,state.height-stackH);

   text+=`• 最大装载量: ${fmt(count)} 卷 (${limitStatus})\n`;
   text+=`• 排列方案: ${p.label}\n`;
   text+=`• 单层装载量: ${fmt(p.perLayer)} 卷/层\n`;
   text+=`• 实际层数: ${fmt(p.usedLayers)} / ${fmt(p.layers)} 层\n`;
   text+=`• 纸卷总重: ${weightText(totalW)}\n`;
   text+=`• 剩余载重: ${weightText(remainW)}\n`;
   text+=`• 载重利用率: ${fmt(pct,1)}%\n`;
   text+=`• 理论空间容量: ${fmt(p.total)} 卷\n`;
   text+=`• 装载总高: ${lenText(stackH)}\n`;
   text+=`• 顶层余量: ${lenText(ceilingClearance)}\n`;
  }
  return text;
 }

 let text=`==================================================\n`;
 text+=` RollPack Pro · ข้อมูลสเปกและผลการวางแผนบรรจุ\n`;
 text+=` วันที่ออกรายงาน: ${dateStr}\n`;
 text+=` ระบบหน่วย: ${unit==='metric'?'เมตริก (มม. / กก.)':'อิมพีเรียล (นิ้ว / ปอนด์)'}\n`;
 text+=`==================================================\n\n`;

 text+=`[1. ข้อมูลตู้คอนเทนเนอร์]\n`;
 text+=`• ประเภทตู้: ${presetName}\n`;
 text+=`• ขนาดภายในตู้ (ย × ก × ส): ${lenText(state.length)} × ${lenText(state.width)} × ${lenText(state.height)}\n`;
 text+=`• ความสูงช่องประตู: ${lenText(state.door)}\n`;
 text+=`• พิกัดน้ำหนักบรรทุกสุทธิ: ${weightText(state.payload)}\n\n`;

 text+=`[2. ข้อมูลม้วนกระดาษ]\n`;
 text+=`• เส้นผ่านศูนย์กลาง (OD): ${lenText(state.diameter)}\n`;
 text+=`• หน้ากว้างม้วน (ความสูงเมื่อวางตั้ง): ${lenText(state.rollHeight)}\n`;
 text+=`• น้ำหนักต่อม้วน: ${weightText(state.weight)}\n`;
 text+=`• ระยะเผื่อระหว่างม้วน: ${lenText(state.clearance)}\n`;
 text+=`• ทิศทางการวาง: ${orientName}\n\n`;

 text+=`[3. ผลการคำนวณและแผนการจัดวาง]\n`;
 if(result&&result.error){
  text+=`• สถานะ: ข้อมูลไม่สมบูรณ์หรือมีข้อผิดพลาด กรุณาตรวจสอบค่าที่กรอก\n`;
 }else if(!p||count===0){
  text+=`• สถานะ: ไม่สามารถบรรจุได้ในเงื่อนไขนี้ (น้ำหนักเกินหรือขนาดไม่พอดี)\n`;
 }else{
  const limitStatus=count<p.total?'จำกัดด้วยพิกัดน้ำหนัก':'จำกัดด้วยขนาดมิติตู้';
  const totalW=count*state.weight;
  const remainW=state.payload-totalW;
  const pct=(totalW/state.payload)*100;
  const stackH=p.usedLayers*p.unitHeight;
  const ceilingClearance=Math.max(0,state.height-stackH);

  text+=`• จำนวนที่บรรจุได้: ${fmt(count)} ม้วน (${limitStatus})\n`;
  text+=`• รูปแบบการจัดวาง: ${p.label}\n`;
  text+=`• ความจุต่อชั้น: ${fmt(p.perLayer)} ม้วน/ชั้น\n`;
  text+=`• จำนวนชั้นที่ใช้จริง: ${fmt(p.usedLayers)} / ${fmt(p.layers)} ชั้น\n`;
  text+=`• น้ำหนักม้วนรวม: ${weightText(totalW)}\n`;
  text+=`• พิกัดน้ำหนักคงเหลือ: ${weightText(remainW)}\n`;
  text+=`• สัดส่วนการใช้พิกัดน้ำหนัก: ${fmt(pct,1)}%\n`;
  text+=`• ความจุตามมิติ (ก่อนคิดน้ำหนัก): ${fmt(p.total)} ม้วน\n`;
  text+=`• ความสูงรวมที่บรรจุ: ${lenText(stackH)}\n`;
  text+=`• ช่องว่างถึงเพดาน: ${lenText(ceilingClearance)}\n`;
 }

 const notices=[];
 if(p&&count>0){
  if(p.usedLayers*p.unitHeight>state.door+1e-7){
   notices.push('ความสูงรวมของชั้นที่ใช้เกินช่องประตู ต้องตรวจสอบวิธียกและจัดชั้นภายในตู้');
  }
  if(p.type.startsWith('horizontal')){
   notices.push('รูปแบบนี้วางม้วนนอน ต้องมีการหนุนและรัดตรึงที่เหมาะสม พื้นที่อุปกรณ์ยังไม่รวมในผัง');
  }
  if(count<p.total){
   notices.push(`ตามขนาดวางได้ ${fmt(p.total)} ม้วน แต่พิกัดน้ำหนักจำกัดไว้ที่ ${fmt(count)} ม้วน`);
  }
 }
 if(notices.length>0){
  text+=`\n[ข้อสังเกต / คำเตือน]\n`;
  notices.forEach(n=>{text+=`⚠️ ${n}\n`;});
 }

 text+=`\n--------------------------------------------------\n`;
 text+=`หมายเหตุ: ผลเป็นการประมาณเบื้องต้นสำหรับม้วนสเปกเดียว ไม่รวมวัสดุรองและรัดตรึง\n`;
 text+=`โปรดตรวจสอบการกระจายน้ำหนักและการรับแรงซ้อนก่อนการปฏิบัติงานจริง\n`;
 text+=`==================================================`;
 return text;
}
let toastTimer;
function showToast(msg){
 const el=$('toast');
 if(!el)return;
 el.textContent=msg;
 el.classList.add('show');
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>{el.classList.remove('show');},2600);
}
async function copySpecs(){
 const text=getSpecText();
 const lang=getLang();
 let ok=false;
 try{
  if(navigator.clipboard&&window.isSecureContext){
   await navigator.clipboard.writeText(text);
   ok=true;
  }else{
   const ta=document.createElement('textarea');
   ta.value=text;
   ta.style.position='fixed';
   ta.style.opacity='0';
   document.body.appendChild(ta);
   ta.focus();
   ta.select();
   ok=document.execCommand('copy');
   document.body.removeChild(ta);
  }
 }catch(e){
  console.error('Clipboard copy error:',e);
 }

 const updateBtn=(id)=>{
  const btn=$(id);
  if(!btn)return;
  const orig=btn.innerHTML;
  btn.classList.add('btn-copied');
  const span=btn.querySelector('.btn-text');
  if(span)span.textContent=lang==='zh'?'已复制!':'คัดลอกแล้ว!';
  else btn.textContent=lang==='zh'?'✓ 已复制!':'✓ คัดลอกแล้ว!';
  setTimeout(()=>{
   btn.innerHTML=orig;
   btn.classList.remove('btn-copied');
  },2000);
 };

 updateBtn('copy-spec-btn');
 updateBtn('copy-spec-btn-header');
 showToast(ok?(lang==='zh'?'✓ 规格与方案明细已复制到剪贴板':'✓ คัดลอกสเปกและผลลัพธ์ทั้งหมดเรียบร้อยแล้ว'):(lang==='zh'?'复制失败，请手动选择复制':'ไม่สามารถคัดลอกอัตโนมัติได้'));
}
function printPlan(){
 window.print();
}
function init(){
 createFields();syncInputs();render();
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;drawPlan();}));
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{preset=b.dataset.preset;if(preset==='custom'){$('container-details').open=true;$('length').focus();}else{Object.assign(state,PRESETS[preset]);syncInputs();}updatePresetButtons();layer=1;render();}));
 document.querySelectorAll('[data-sample]').forEach(b=>b.addEventListener('click',()=>{Object.assign(state,b.dataset.sample==='standard'?{diameter:1150,rollHeight:1000,weight:850}:{diameter:1250,rollHeight:1400,weight:1150});syncInputs();layer=1;render();}));
 document.querySelectorAll('[data-orientation]').forEach(b=>b.addEventListener('click',()=>{orientation=b.dataset.orientation;updateOrientation();layer=1;render();}));
 $('units').addEventListener('change',e=>{unit=e.target.value;syncInputs();render();});
 $('reset-button').addEventListener('click',()=>$('reset-dialog').showModal());
 $('confirm-reset').addEventListener('click',()=>{state={...PRESETS['20gp'],...DEFAULT_ROLL};unit='metric';preset='20gp';orientation='auto';layer=1;view='top';syncInputs();updatePresetButtons();updateOrientation();render();$('reset-dialog').close();});
 $('help-button').addEventListener('click',()=>$('help-dialog').showModal());
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
 $('jump-results').addEventListener('click',()=>{$('results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('result-title').setAttribute('tabindex','-1');$('result-title').focus({preventScroll:true});});
 $('layer-prev').addEventListener('click',()=>{layer--;drawPlan();});$('layer-next').addEventListener('click',()=>{layer++;drawPlan();});
 ['copy-spec-btn','copy-spec-btn-header'].forEach(id=>{const el=$(id);if(el)el.addEventListener('click',copySpecs);});
 ['print-btn','print-btn-header'].forEach(id=>{const el=$(id);if(el)el.addEventListener('click',printPlan);});
 window.addEventListener('languageChanged',()=>{
  updateFieldLabels();
  updateOrientation();
  syncInputs();
  render();
 });
 let installPrompt;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install-button').hidden=false;});
 $('install-button').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('install-button').hidden=true;}});
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
if(typeof document!=='undefined')init();
if(typeof module!=='undefined')module.exports={makePlan,PRESETS,DEFAULT_ROLL,FIELD_DEFS,occupiedPositions,sideProjection,getSpecText,PRESET_NAMES,ORIENTATION_NAMES};
