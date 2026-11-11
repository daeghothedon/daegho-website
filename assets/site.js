'use strict';
const scroller=document.querySelector('main'),home=document.querySelector('#home'),hero=document.querySelector('.hero-stage'),identity=document.querySelector('.hero-identity'),cue=document.querySelector('.scroll-cue');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let heroHeight=1,heroFrame=0;
function measureHero(){heroHeight=Math.max(1,scroller.clientHeight);queueHero();}
function updateHero(){heroFrame=0;if(!home.classList.contains('active'))return;const progress=reducedMotion.matches?0:Math.min(1,Math.max(0,scroller.scrollTop/(heroHeight*.75)));const eased=progress*progress*(3-2*progress);identity.style.transform=`translate3d(0,${-heroHeight*.18*eased}px,0) scale(${1-.48*eased})`;cue.style.opacity=String(Math.max(0,1-progress*4));cue.style.visibility=progress>.3?'hidden':'visible';}
function queueHero(){if(!heroFrame)heroFrame=requestAnimationFrame(updateHero);}
scroller.addEventListener('scroll',queueHero,{passive:true});new ResizeObserver(measureHero).observe(scroller);
// Native scrolling preserves touch and precision trackpad inertia. Only navigation actions are smoothed.
cue.addEventListener('click',()=>scroller.scrollTo({top:hero.offsetHeight,behavior:reducedMotion.matches?'instant':'smooth'}));
const video=document.querySelector('#home-video');video.muted=true;
function syncVideo(){if(home.classList.contains('active')&&!reducedMotion.matches&&!document.hidden){if(!video.getAttribute('src'))video.src=video.dataset.src;video.play().catch(()=>{});}else{video.pause();if(reducedMotion.matches){video.removeAttribute('src');video.load();}}}
function route(){let [id,chapter]=location.hash.slice(1).split('/');id=id||'home';if(id==='eden-city'&&chapter==='daegho-enhanced-mind'){history.replaceState(null,'','#eden-city/brain-functionality');chapter='brain-functionality';}if(id==='eden-city'&&chapter){const file=document.getElementById('eden-file-'+chapter);if(file?.classList.contains('eden-file'))id=file.id;}if(!document.getElementById(id)?.classList.contains('page'))id='home';document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));const navId=(id.startsWith('eden-file-')||['eden-city','evolution'].includes(id))?'lore':id;document.querySelectorAll('header nav a').forEach(a=>{a.removeAttribute('aria-current');if(a.hash==='#'+navId)a.setAttribute('aria-current','page');});const index=/^[0-6]$/.test(chapter||'')?Number(chapter):0;document.querySelectorAll('.chapter').forEach((c,i)=>c.hidden=i!==index);document.querySelectorAll('[data-chapter]').forEach(a=>{a.removeAttribute('aria-current');if(Number(a.dataset.chapter)===index)a.setAttribute('aria-current','page');});scroller.scrollTo({top:0,behavior:'instant'});measureHero();syncVideo();if(id.startsWith('eden-file-'))document.querySelector('#'+id+' h2').focus({preventScroll:true});if(id==='evolution'&&chapter!==undefined){const section=document.querySelector('#chapter-'+index);scroller.scrollTo({top:section.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-24,behavior:'instant'});section.querySelector('h3').focus({preventScroll:true});}}
window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',syncVideo);reducedMotion.addEventListener('change',()=>{measureHero();syncVideo();});route();
const art=document.querySelector('#art'),artFlip=document.querySelector('#art-flip'),artworks=JSON.parse(document.querySelector('#artwork-data').textContent);let currentArt=null,showingBack=false;
function showArt(item){if(!item.src)return;currentArt=item;showingBack=false;art.querySelector('img').src=item.src;art.querySelector('img').alt=item.title;document.querySelector('#art-title').textContent=item.title+' / '+item.date;const pdf=document.querySelector('#pdf-link');pdf.hidden=!item.pdf;if(item.pdf)pdf.href=item.pdf;else pdf.removeAttribute('href');artFlip.hidden=!item.alternateSrc;artFlip.textContent='SHOW BACK ↻';art.showModal();}
artFlip.addEventListener('click',()=>{if(!currentArt?.alternateSrc)return;showingBack=!showingBack;art.querySelector('img').src=showingBack?currentArt.alternateSrc:currentArt.src;art.querySelector('img').alt=currentArt.title+(showingBack?' — back cover':' — front cover');artFlip.textContent=showingBack?'SHOW FRONT ↻':'SHOW BACK ↻';});
function showYear(year){document.querySelectorAll('[data-year]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===year)));document.querySelector('#year-title').textContent=year;const selected=artworks.filter(a=>a.year===year).sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate));document.querySelector('#art-count').textContent=selected.length+' WORKS';const gallery=document.querySelector('#archive');gallery.replaceChildren();selected.forEach(item=>{const button=document.createElement('button');button.className='art-card';button.type='button';button.setAttribute('aria-label','View '+item.title);if(item.src){const img=document.createElement('img');img.src=item.thumb||item.src;img.alt=item.title;img.loading='lazy';img.decoding='async';img.width=500;img.height=500;button.append(img);button.addEventListener('click',()=>showArt(item));}else{button.disabled=true;const notice=document.createElement('div');notice.className='archive-missing';notice.textContent='Original artwork needed for this draft';button.append(notice);}const label=document.createElement('span');label.textContent=item.title+(item.pdf?' / PDF':'');const date=document.createElement('small');date.textContent=item.date;button.append(label,date);gallery.append(button);});}
document.querySelectorAll('[data-year]').forEach(b=>b.addEventListener('click',()=>showYear(b.dataset.year)));showYear('2026');document.querySelector('#close-art').addEventListener('click',()=>art.close());art.addEventListener('click',e=>{if(e.target===art)art.close();});
// Manual default: no assumed release timezone and no unapproved automatic announcement.
// Set released=true after confirming the song is live, or supply a confirmed ISO releaseAt.
const releaseConfig={released:true,releaseAt:null};
function applyReleaseStatus(now=Date.now()){const released=releaseConfig.released||(releaseConfig.releaseAt!==null&&now>=Date.parse(releaseConfig.releaseAt));document.querySelector('.release-status').textContent=released?'LATEST RELEASE · OUT NOW':'DROPPING 30 OCTOBER 2026';document.querySelector('.edge-action').textContent=released?'LISTEN NOW ↗':'PRE-SAVE NOW ↗';document.querySelector('.edge-recent-action').textContent=released?'LISTEN NOW ↗':'PRE-SAVE ↗';}
applyReleaseStatus();

const albumFlip=document.querySelector('#flip');albumFlip.addEventListener('click',()=>{const flipped=document.querySelector('#cover').classList.toggle('flipped');albumFlip.setAttribute('aria-pressed',String(flipped));document.querySelector('#cover .back').setAttribute('aria-hidden',String(!flipped));document.querySelector('#cover img:not(.back)').setAttribute('aria-hidden',String(flipped));});


// Community FAQ: native buttons, announced state, and interruptible reduced-motion-aware transitions.
document.querySelectorAll('.community-faq-item>button').forEach(button=>{
 const panel=document.getElementById(button.getAttribute('aria-controls'));let animation;
 button.addEventListener('click',()=>{
  const opening=button.getAttribute('aria-expanded')!=='true';
  const start=panel.hidden?0:panel.getBoundingClientRect().height;
  if(animation){animation.cancel();animation=null;}
  button.setAttribute('aria-expanded',String(opening));
  if(reducedMotion.matches){panel.hidden=!opening;return;}
  panel.hidden=false;
  const end=opening?panel.firstElementChild.getBoundingClientRect().height:0;
  animation=panel.animate([{height:start+'px',opacity:opening?0:1},{height:end+'px',opacity:opening?1:0}],{duration:200,easing:'ease-out'});
  animation.onfinish=()=>{panel.hidden=!opening;animation=null;};
 });
});

// Resume only the two LORE videos when their panels become visible.
(()=>{
  const lore=document.querySelector('#lore');
  const clips=lore.querySelectorAll('.lore-replacement-video');
  function syncLoreVideos(){
    clips.forEach(clip=>{
      clip.muted=true;
      if(lore.classList.contains('active')&&clip.closest('details').open&&!document.hidden){clip.play().catch(()=>{});}
      else clip.pause();
    });
  }
  clips.forEach(clip=>clip.closest('details').addEventListener('toggle',syncLoreVideos));
  new MutationObserver(syncLoreVideos).observe(lore,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',syncLoreVideos);
  syncLoreVideos();
})();
