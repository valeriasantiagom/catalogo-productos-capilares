(()=>{
  'use strict';
  const pages=window.CATALOG_PAGES;
  const $=id=>document.getElementById(id);
  const stage=$('stage'), viewer=$('viewer'), under=$('under'), over=$('over');
  const underImg=$('under-img'), overImg=$('over-img');
  const prev=$('prev'), next=$('next'), counter=$('counter'), jump=$('jump'), status=$('status');
  const zoomIn=$('zoom-in'),zoomOut=$('zoom-out'),zoomLevel=$('zoom-level'),fit=$('fit');
  const clamp=(n,a,b)=>Math.min(Math.max(n,a),b);
  let page=0,zoom=1,dx=0,dy=0,busy=false,seq=0;
  const CACHE=new Map();
  // Decode images before changing the visible page; do not preload all 11 full-resolution images at once.
  function load(index){
    const src=pages[index].src;
    if(CACHE.has(src)) return CACHE.get(src);
    const task=new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(src);
      img.onerror=()=>reject(new Error(`No se pudo abrir la imagen ${src}`));
      img.src=src;
      if(img.complete && img.naturalWidth>0) resolve(src);
    });
    CACHE.set(src,task);
    task.catch(()=>CACHE.delete(src));
    return task;
  }
  function msg(text=''){status.textContent=text;status.hidden=!text;}
  function bounds(){const maxX=Math.max(0,(stage.clientWidth*(zoom-1))/2);const maxY=Math.max(0,(stage.clientHeight*(zoom-1))/2);dx=clamp(dx,-maxX,maxX);dy=clamp(dy,-maxY,maxY)}
  function apply(){bounds();overImg.style.transform=`translate(${dx}px,${dy}px) scale(${zoom})`;underImg.style.transform=`translate(${dx}px,${dy}px) scale(${zoom})`;zoomLevel.textContent=`${Math.round(zoom*100)} %`;stage.style.cursor=zoom>1?'grab':'default'}
  function hud(){counter.textContent=`${page+1} / ${pages.length}`;jump.value=String(page);prev.disabled=busy||page===0;next.disabled=busy||page===pages.length-1}
  function adjust(){zoom=1;dx=dy=0;apply()}
  function setZoom(v){zoom=clamp(v,1,8);if(zoom===1)dx=dy=0;apply()}
  function show(index){page=index;overImg.src=pages[index].src;overImg.alt=pages[index].title;adjust();hud();msg()}
  async function turn(target){
    if(busy||target<0||target>=pages.length||target===page)return;
    const ticket=++seq;busy=true;hud();msg();
    try{
      await load(target);
      if(ticket!==seq)return;
      // The page underneath is ready BEFORE the page flip animation starts.
      underImg.src=pages[target].src;
      underImg.alt=pages[target].title;
      adjust();
      const direction=target>page?'flip-next':'flip-prev';
      await new Promise(resolve=>{
        let finished=false;
        const done=()=>{if(finished)return;finished=true;over.removeEventListener('animationend',end);clearTimeout(timer);resolve()};
        const end=e=>{if(e.target===over)done()};
        over.addEventListener('animationend',end);
        over.classList.add(direction);
        // Transition safeguard for hidden tabs, reduced-motion browsers, or dropped animation events.
        const timer=setTimeout(done,1050);
      });
      over.classList.remove('flip-next','flip-prev');
      show(target);
    }catch(e){
      // Leave the last functioning page visible and keep controls enabled.
      msg('Esta página no se pudo cargar. Comprueba que sus archivos estén completos y vuelve a intentarlo.');
    }finally{busy=false;hud()}
  }
  prev.addEventListener('click',()=>turn(page-1));next.addEventListener('click',()=>turn(page+1));
  zoomIn.addEventListener('click',()=>setZoom(zoom+.5));zoomOut.addEventListener('click',()=>setZoom(zoom-.5));fit.addEventListener('click',adjust);
  jump.addEventListener('change',()=>turn(Number(jump.value)));
  addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowRight')turn(page+1);if(e.key==='ArrowLeft')turn(page-1);if(e.key==='Escape')adjust()});
  viewer.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setZoom(zoom+(e.deltaY<0?.25:-.25))}else if(zoom>1){e.preventDefault();dx-=e.deltaX;dy-=e.deltaY;apply()}},{passive:false});
  let pointers=new Map(), start=null,pinch=null;
  stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){start={x:e.clientX,y:e.clientY,dx,dy};pinch=null}else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};start=null}});
  stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()];setZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance))}else if(pointers.size===1&&start&&zoom>1){dx=start.dx+e.clientX-start.x;dy=start.dy+e.clientY-start.y;apply()}});
  function stop(e){const wasSingle=pointers.size===1&&start;const delta=wasSingle?e.clientX-start.x:0;const vertical=wasSingle?e.clientY-start.y:0;pointers.delete(e.pointerId);if(pointers.size===0){if(zoom===1&&!busy&&wasSingle&&Math.abs(delta)>45&&Math.abs(delta)>Math.abs(vertical)*1.25)turn(page+(delta<0?1:-1));start=null;pinch=null}else{start=null;pinch=null}};
  stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
  stage.addEventListener('dblclick',()=>zoom>1?adjust():setZoom(2));
  pages.forEach((p,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${String(i+1).padStart(2,'0')} · ${p.title}`;jump.append(option)});
  if(!pages.length){msg('No se encontraron páginas en pages.js');return}
  load(0).then(()=>show(0)).catch(()=>msg('No se pudo cargar la portada. Comprueba la carpeta assets.'));
})();
