const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const base=__dirname;
class Elem {
  constructor(id='') {this.id=id;this.handlers=new Map();this.style={};this.hidden=true;this.disabled=false;this.textContent='';this.value='';this.naturalWidth=0;this.src='';this.options=[];this.clientWidth=1536;this.clientHeight=1024;this._set=new Set();this.tagName='DIV';const node=this;
    this.classList={add(name){node._set.add(name);if(name.startsWith('flip-'))setTimeout(()=>node.dispatchEvent('animationend',{target:node}),15)},remove(...names){for(const n of names)node._set.delete(n)},contains(name){return node._set.has(name)}};
  }
  addEventListener(name,fn,opts){if(!this.handlers.has(name))this.handlers.set(name,[]);this.handlers.get(name).push(fn)}
  removeEventListener(name,fn){this.handlers.set(name,(this.handlers.get(name)||[]).filter(f=>f!==fn))}
  dispatchEvent(name,ev={}){for(const fn of [...(this.handlers.get(name)||[])])fn(ev)}
  append(el){this.options.push(el)}
  setPointerCapture(){}
  setAttribute(){}
}
const ids=['stage','viewer','under','over','under-img','over-img','prev','next','counter','jump','status','zoom-in','zoom-out','zoom-level','fit'];
const el=Object.fromEntries(ids.map(id=>[id,new Elem(id)]));
class FakeImg extends Elem{
  constructor(){super('img');this.complete=false}
  set src(value){this._src=value;if(value){this.complete=false;const imagepath=path.resolve(base,value);setTimeout(()=>{if(fs.existsSync(imagepath)){this.naturalWidth=1536;this.complete=true;this.onload?.()}else this.onerror?.()},2)}}
  get src(){return this._src}
}
el['under-img']=new FakeImg();el['over-img']=new FakeImg();
const context={
  window:{}, document:{getElementById:id=>el[id],createElement:tag=>new Elem(tag),activeElement:null},
  Image:FakeImg,console,setTimeout,clearTimeout,
  addEventListener(){},
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'pages.js'),'utf8'),context);
context.window.CATALOG_PAGES=context.window.CATALOG_PAGES;
vm.runInContext(fs.readFileSync(path.join(base,'app.js'),'utf8'),context);
const wait=async(condition,timeout=2000)=>{const started=Date.now();while(!condition()){if(Date.now()-started>timeout)throw new Error('timeout');await new Promise(r=>setTimeout(r,5))}};
(async()=>{
 await wait(()=>el.counter.textContent==='1 / 11');
 for(let n=2;n<=11;n++){
  el.next.dispatchEvent('click');
  await wait(()=>el.counter.textContent===`${n} / 11`);
  assert.equal(el.status.hidden,true,`Error overlay at page ${n}`);
  assert.ok(fs.existsSync(path.resolve(base,el['over-img'].src)),`Missing photo at page ${n}`)
 }
 el.jump.value='2';el.jump.dispatchEvent('change');await wait(()=>el.counter.textContent==='3 / 11');
 el['zoom-in'].dispatchEvent('click');assert.equal(el['zoom-level'].textContent,'150 %');
 el.fit.dispatchEvent('click');assert.equal(el['zoom-level'].textContent,'100 %');
 console.log('SIMULACIÓN DE CÓDIGO OK: 11/11 páginas, 3/11 carga, cambio adelante/índice, error oculto, zoom y Ajustar.');
})().catch(e=>{console.error('ERROR SIMULACIÓN',e);process.exitCode=1});
