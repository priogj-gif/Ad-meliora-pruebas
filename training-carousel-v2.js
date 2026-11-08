/* AD MELIORA V2 — siete fichas: calentamiento, cinco ejercicios, resumen.
   Prototipo de desarrollo: reutiliza nodos y eventos originales, sin alterar almacenamiento. */
(function(){'use strict';
 const configured=new WeakSet();
 const style=`
 .amv2-carousel{position:relative;width:100%;max-width:100%;margin:16px auto 20px;isolation:isolate}
 .amv2-carousel-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px;color:#e9c77b;font-weight:800;font-size:13px;letter-spacing:.04em}
 .amv2-carousel-head .amv2-counter{color:#f5e5bd}
 .amv2-carousel-viewport{position:relative;perspective:950px;overflow:hidden;height:calc(clamp(520px,84dvh,860px) + 12px);min-height:0;padding:0 7% 16px;touch-action:pan-y}
 .amv2-carousel-viewport>.amv2-slide{position:absolute!important;top:0!important;left:7%!important;width:86%!important;max-width:none!important;box-sizing:border-box!important;margin:0!important;display:block!important;transition:transform .42s cubic-bezier(.2,.8,.2,1),opacity .36s ease,visibility .36s ease!important;transform-origin:center top;height:clamp(520px,84dvh,860px)!important;min-height:0!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-y:contain;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
 .amv2-carousel-viewport>.amv2-current{z-index:4;transform:translateX(0) rotateY(0) scale(1);opacity:1;visibility:visible;pointer-events:auto}
 .amv2-carousel-viewport>.amv2-left{z-index:2;transform:translateX(-82%) rotateY(20deg) scale(.82);opacity:.43;visibility:visible;pointer-events:none}
 .amv2-carousel-viewport>.amv2-right{z-index:2;transform:translateX(82%) rotateY(-20deg) scale(.82);opacity:.43;visibility:visible;pointer-events:none}
 .amv2-carousel-viewport>.amv2-away{z-index:0;opacity:0;visibility:hidden;pointer-events:none;transform:scale(.75)}
 .amv2-carousel-viewport>.amv2-current.is-collapsed>*{display:revert!important}
 .amv2-carousel-viewport>.amv2-slide.exercise:not(.is-completed){border:2px solid #a94444!important;background:linear-gradient(150deg,#371d24,#171918)!important}
 .amv2-carousel-viewport>.amv2-slide.exercise.amv2-in-progress:not(.is-completed){border-color:#e58a24!important;background:linear-gradient(150deg,#49311b,#171918)!important}
 .amv2-carousel-viewport>.amv2-slide.exercise.is-completed{border:2px solid #398b64!important;background:linear-gradient(150deg,#183b2c,#171918)!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-complete{min-height:44px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise{border-radius:16px!important;box-shadow:0 12px 28px rgba(0,0,0,.3)!important}
 .amv2-carousel-viewport .rest-timer .amv2-google-in-timer{display:inline-flex!important;vertical-align:middle;margin:5px 0 5px 9px!important}
 /* 002-32: densidad visual consistente sin reducir la zona tactil de controles. */
 .amv2-carousel-viewport>.amv2-slide{padding:clamp(7px,2vw,12px)!important;scroll-padding-bottom:12px}
 .amv2-carousel-viewport>.amv2-slide.exercise h2{font-size:clamp(13px,3.5vw,16px)!important;line-height:1.2!important;margin:0 0 5px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise p{margin:3px 0!important;line-height:1.22!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .muscle,.amv2-carousel-viewport>.amv2-slide.exercise .small{margin:2px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise label{margin:3px 0 2px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise input,.amv2-carousel-viewport>.amv2-slide.exercise select{min-height:32px!important;box-sizing:border-box!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-complete{min-height:44px!important;margin:5px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise button:not(.exercise-complete){max-width:100%}
 .amv2-carousel-viewport>.amv2-slide.exercise .ad-log,.amv2-carousel-viewport>.amv2-slide.exercise .rest-timer{margin-top:4px!important;margin-bottom:4px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise table{width:100%;table-layout:fixed}
 .amv2-carousel-viewport>.amv2-slide.exercise td,.amv2-carousel-viewport>.amv2-slide.exercise th{padding:3px!important}
 @media(max-height:700px){.amv2-carousel-head{margin-bottom:5px}.amv2-carousel-note{margin-top:4px}.amv2-carousel-viewport>.amv2-slide.exercise h2{margin-bottom:3px!important}}
 .amv2-carousel-viewport>.amv2-slide:not(.amv2-current) *{user-select:none!important}
 .amv2-carousel-viewport>.amv2-slide.amv2-current{overflow-wrap:anywhere}
 .amv2-carousel-viewport>.amv2-current.is-collapsed>.ad-log{display:grid!important}
 .amv2-carousel-viewport>.amv2-current.is-collapsed>.rest-timer{display:block!important}
 .amv2-carousel-viewport>.amv2-current .exercise-toggle{pointer-events:none!important;cursor:default!important}
 .amv2-carousel-viewport>.amv2-current .toggle-state{display:none!important}
 .amv2-carousel-controls{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:8px}
 .amv2-carousel-controls button{min-height:44px;min-width:68px;border:1px solid #a47a34;border-radius:12px;background:#241e14;color:#f3d99b;font-size:13px;font-weight:700;font-family:inherit;padding:9px 8px}
 .amv2-carousel-controls button:disabled{opacity:.32}
 .amv2-carousel-dots{display:flex;justify-content:center;gap:5px;flex:1;min-width:0}
 .amv2-carousel-dots button{width:9px;min-width:9px;min-height:9px;height:9px;padding:0;border-radius:50%;background:#6b5b40;border:0}
 .amv2-carousel-dots button[aria-current=true]{background:#f5d38c;box-shadow:0 0 0 2px #8b6830}
 .amv2-carousel-note{text-align:center;font-size:11px;color:#d8c89e;margin-top:10px}

 /* 002-39: compactación para lectura de ficha completa sin scroll interior. */
 .amv2-carousel-viewport>.amv2-slide.exercise{display:flex!important;flex-direction:column!important;gap:clamp(2px,.45dvh,5px)!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-toggle{padding:7px 9px!important;min-height:37px!important;flex-shrink:0}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-toggle *{line-height:1.15!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-body{padding:0!important;margin:0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer{padding:8px!important;gap:5px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer button{min-height:38px!important;padding:6px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer select{min-height:36px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .ad-load-series{margin:3px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise input,.amv2-carousel-viewport>.amv2-slide.exercise select{font-size:14px!important;min-height:35px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-complete{min-height:44px!important;flex-shrink:0}
 .amv2-carousel-viewport>.amv2-slide.exercise p.small{font-size:12px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise h3{font-size:13px!important;margin:3px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .ad-log{padding:4px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer .amv2-google-in-timer{margin:0 0 0 6px!important}
 .amv2-carousel-viewport>.amv2-slide.amv2-needs-scroll{overflow-y:auto!important;scrollbar-width:thin}
 .amv2-carousel-viewport>.amv2-current{overflow-y:auto!important;touch-action:pan-y!important;scrollbar-gutter:stable;overscroll-behavior-y:contain!important}
 .amv2-carousel-viewport>.amv2-current::-webkit-scrollbar{width:5px}
 .amv2-carousel-viewport>.amv2-current::-webkit-scrollbar-thumb{background:#cba75d;border-radius:8px}
 .amv2-scroll-hint{font-size:11px;color:#e9ca87;text-align:center;min-height:15px;margin:3px 0 0}
 .amv2-carousel-viewport>.amv2-slide .exercise-body{min-height:0}
 .amv2-carousel-viewport>.amv2-slide{padding-bottom:20px!important}
 @media(max-width:420px){.amv2-carousel-viewport{padding-left:5%!important;padding-right:5%!important}.amv2-carousel-viewport>.amv2-slide{left:5%!important;width:90%!important}}
 @media(max-height:760px){.amv2-carousel-viewport>.amv2-slide.exercise .rest-timer{padding:5px!important}.amv2-carousel-viewport>.amv2-slide.exercise p{line-height:1.15!important}}
 /* 002-40: densidad optimizada para Galaxy S24; no se recorta contenido. */
 .amv2-carousel-viewport>.amv2-slide.exercise{font-size:12px!important;line-height:1.15!important;gap:2px!important;padding:7px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-toggle{padding:5px 7px!important;min-height:32px!important;font-size:13px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-body{font-size:12px!important;line-height:1.15!important}
 .amv2-carousel-viewport>.amv2-slide.exercise p,.amv2-carousel-viewport>.amv2-slide.exercise label{font-size:12px!important;line-height:1.16!important;margin:2px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer{padding:5px!important;margin:2px 0!important;gap:3px!important;border-radius:10px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer button{min-height:34px!important;padding:4px 5px!important;font-size:12px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer select{min-height:32px!important;font-size:12px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise input,.amv2-carousel-viewport>.amv2-slide.exercise select{font-size:13px!important;min-height:32px!important;padding:4px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .ad-load-series{margin:2px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .ad-log{padding:2px!important;margin:2px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise h3{font-size:12px!important;margin:2px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-complete{min-height:42px!important;margin:3px 0!important;font-size:12px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise td,.amv2-carousel-viewport>.amv2-slide.exercise th{padding:2px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .muscle,.amv2-carousel-viewport>.amv2-slide.exercise .small{font-size:11px!important;margin:1px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer .amv2-google-in-timer{margin:0 0 0 4px!important}
 /* 002-42: una sola superficie de scroll: la pagina, nunca un scroll anidado en la carta. */
 .amv2-carousel-viewport{overflow:hidden!important;touch-action:pan-y!important;padding-bottom:4px!important;transition:height .18s ease}
 .amv2-carousel-viewport>.amv2-slide{height:auto!important;max-height:none!important;min-height:0!important;overflow:visible!important;overscroll-behavior:auto!important;touch-action:pan-y!important;scrollbar-width:none!important}
 .amv2-carousel-viewport>.amv2-slide.exercise{gap:0!important;padding:6px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-toggle{margin:0!important;padding:5px 7px!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-body{padding:0!important;margin:0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .rest-timer{padding:5px!important;margin:2px 0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .ad-log{padding:2px!important;margin:0!important}
 .amv2-carousel-viewport>.amv2-slide.exercise .exercise-complete{margin:3px 0 0!important}
 .amv2-scroll-hint{display:none!important}
 @media(prefers-reduced-motion:reduce){.amv2-carousel-viewport,.amv2-carousel-viewport>.amv2-slide{transition:none!important}}
 `;
 function setup(doc){
  if(!doc||!doc.body||configured.has(doc))return;
  const warmup=doc.querySelector('section.card.exercise.warmup-exercise');
  const exercises=[...doc.querySelectorAll('section.card.exercise:not(.warmup-exercise)')];
  const summary=doc.querySelector('section.card[id^="ad-summary-"]');
  if(!warmup||!summary||exercises.length<1||!exercises.every(c=>c.querySelector('.ad-log')&&c.querySelector('.exercise-complete')&&c.querySelector('.rest-timer')&&c.querySelector('.ad-load-series')))return;
  const cards=[warmup,...exercises,summary];
  exercises.forEach(card=>{const timer=card.querySelector('.rest-timer');const google=card.querySelector('a[href*="google.com/search?tbm=isch"]');if(!timer||!google)return;const holder=google.closest('p.small');if(holder&&holder.textContent.trim()==='')holder.remove();google.classList.add('amv2-google-in-timer');timer.appendChild(google)});
  const parent=cards[0].parentNode;
  if(!cards.every(c=>c.parentNode===parent))return;
  configured.add(doc);
  const sheet=doc.createElement('style');sheet.id='amv2-carousel-style';sheet.textContent=style;doc.head.append(sheet);
  const shell=doc.createElement('section');shell.className='amv2-carousel';shell.setAttribute('aria-label','Carrusel del entrenamiento completo');
  const head=doc.createElement('div');head.className='amv2-carousel-head';
  const label=doc.createElement('span');label.textContent='ENTRENAMIENTO COMPLETO';
  const counter=doc.createElement('span');counter.className='amv2-counter';head.append(label,counter);
  const viewport=doc.createElement('div');viewport.className='amv2-carousel-viewport';
  const controls=doc.createElement('nav');controls.className='amv2-carousel-controls';controls.setAttribute('aria-label','Consultar fichas del entrenamiento');
  const prev=doc.createElement('button');prev.type='button';prev.textContent='‹ Anterior';prev.setAttribute('aria-label','Ver ficha anterior');
  const next=doc.createElement('button');next.type='button';next.textContent='Siguiente ›';next.setAttribute('aria-label','Ver ficha siguiente');
  const dots=doc.createElement('div');dots.className='amv2-carousel-dots';
  controls.append(prev,dots,next);
  const note=doc.createElement('p');note.className='amv2-carousel-note';note.textContent='Desliza para navegar. Los registros y el botón Completar se conservan dentro de cada ficha.';
  const scrollHint=doc.createElement('p');scrollHint.className='amv2-scroll-hint';scrollHint.setAttribute('aria-live','polite');
  shell.append(head,viewport,scrollHint,controls,note);
  parent.insertBefore(shell,cards[0]);cards.forEach(c=>{c.classList.add('amv2-slide');viewport.append(c)});
  let current=0,startX=null,startY=null;
  const names=['Calentamiento',...exercises.map((_,i)=>'Ejercicio '+(i+1)),'Resumen'];
  const dotButtons=cards.map((_,i)=>{const b=doc.createElement('button');b.type='button';b.setAttribute('aria-label','Consultar '+names[i]);b.addEventListener('click',()=>show(i));dots.append(b);return b});
  function height(){
   // La altura sigue el contenido real; la pagina es la unica superficie de scroll.
   // Nunca se recortan controles ni se fuerza al usuario a buscar una zona para deslizar.
   const active=cards[current];if(!active)return;
   cards.forEach(c=>{c.style.setProperty('height','auto','important');c.style.setProperty('overflow','visible','important')});
   const natural=Math.ceil(active.getBoundingClientRect().height);
   viewport.style.height=Math.max(180,natural+10)+'px';
  }
  function updateScrollHint(){}
  function show(i){current=Math.max(0,Math.min(cards.length-1,i));cards.forEach((c,j)=>{
    c.classList.remove('amv2-current','amv2-left','amv2-right','amv2-away');
    c.classList.add(j===current?'amv2-current':j===current-1?'amv2-left':j===current+1?'amv2-right':'amv2-away');
    c.setAttribute('aria-hidden',String(j!==current));
    if(j===current&&c.classList.contains('exercise')){c.classList.remove('is-collapsed');c.classList.add('is-open')}
  });counter.textContent=names[current]+' · '+(current+1)+' / '+cards.length;

   prev.disabled=current===0;next.disabled=current===cards.length-1;
   dotButtons.forEach((b,j)=>{b.setAttribute('aria-current',String(j===current));b.tabIndex=j===current?0:-1});height()}

  doc.defaultView?.addEventListener('resize',()=>height(),{passive:true});
  if(doc.defaultView?.ResizeObserver){const ro=new doc.defaultView.ResizeObserver(()=>height());cards.forEach(c=>ro.observe(c))}
  prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  viewport.addEventListener('touchstart',e=>{if(e.touches.length===1){startX=e.touches[0].clientX;startY=e.touches[0].clientY}},{passive:true});
  viewport.addEventListener('touchcancel',()=>{startX=startY=null},{passive:true});
  viewport.addEventListener('touchend',e=>{if(startX===null||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;startX=startY=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.65)show(current+(dx<0?1:-1))},{passive:true});
  cards.slice(0,-1).forEach(c=>{
   const mark=event=>{if(event.target.closest('button.exercise-complete'))return;if(!c.classList.contains('is-completed'))c.classList.add('amv2-in-progress')};
   c.addEventListener('input',mark);c.addEventListener('change',mark);
   c.querySelectorAll('.rest-start').forEach(b=>b.addEventListener('click',mark));
  });
  cards.slice(0,-1).forEach((c,i)=>{const btn=c.querySelector('.exercise-complete');if(!btn)return;btn.addEventListener('click',()=>setTimeout(()=>{
    if(i===current&&c.classList.contains('is-completed'))show(i+1);else height();
  },280))});
  // El alto no depende del contenido: evita saltos y observaciones recursivas.
  const firstPending=cards.slice(0,-1).findIndex(c=>!c.classList.contains('is-completed'));
  show(firstPending<0?cards.length-1:firstPending);
 }
 // Los entrenamientos son documentos srcdoc dentro de iframe.ficha-frame.
 // Observar y transformar el documento real de cada ficha (no el padre).
 const watched=new WeakSet();
 function attach(frame){
   let doc;try{doc=frame.contentDocument}catch(e){return}
   if(!doc||!doc.documentElement)return;
   if(watched.has(doc)){setup(doc);return}
   watched.add(doc);
   let pending=false;
   const scan=()=>{pending=false;try{setup(doc)}catch(e){console.error('AM carousel setup',e)}};
   const schedule=()=>{if(pending||configured.has(doc))return;pending=true;setTimeout(scan,120)};
   new MutationObserver(schedule).observe(doc.documentElement,{childList:true,subtree:true});
   if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',schedule,{once:true});
   schedule();
 }
 function scanFrames(){
   document.querySelectorAll('iframe.ficha-frame').forEach(frame=>{
     if(!frame.dataset.amv2LoadBound){frame.dataset.amv2LoadBound='1';frame.addEventListener('load',()=>attach(frame))}
     attach(frame);
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scanFrames,{once:true});else scanFrames();
 new MutationObserver(scanFrames).observe(document.documentElement,{childList:true,subtree:true});
})();
