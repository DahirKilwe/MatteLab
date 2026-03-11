// script-norsk.js
const nCategorySelect = document.getElementById('nCategorySelect');
const nCountSelect = document.getElementById('nCountSelect');
const nStartBtn = document.getElementById('nStartBtn');
const nProgressText = document.getElementById('nProgressText');
const nScoreText = document.getElementById('nScoreText');
const nQuestionText = document.getElementById('nQuestionText');
const nHint = document.getElementById('nHint');
const nAnswerInput = document.getElementById('nAnswerInput');
const nSubmitBtn = document.getElementById('nSubmitBtn');
const nSkipBtn = document.getElementById('nSkipBtn');
const nNextBtn = document.getElementById('nNextBtn');
const nFeedback = document.getElementById('nFeedback');
const nPlayBtn = document.getElementById('nPlayBtn');
const speakButtons = document.querySelectorAll('.speak-btn');
const MAX_NOR = 500;

const norwegianBase = {
  ord: ['sol','bok','venn','skole','bord','stol','hus','bil','sko','veske','jakke','lue','vann','mat','frukt','gronnsak','hund','katt','fugl','fisk'],
  verb: ['leser','skriver','spiser','drikker','loper','hopper','spiller','tegner','sover','sykler'],
  subject: ['Jeg','Du','Vi','Han','Hun','De'],
  object: ['bok','lekser','middag','vann','mat','ball','spill','film'],
  preposisjon: ['under','over','ved','bak','foran','mellom','i','pa'],
  steder: ['bordet','stolen','sofaen','huset','sekken','bokhyllen','vesken'],
};

const nbState = { questions: [], index: 0, score: 0, correct: 0, wrong: 0, skipped: 0, canGoNext: false };

function speakText(text){ if(!('speechSynthesis' in window)){ alert('Lyd er ikke stottet i denne nettleseren.'); return; } const utt=new SpeechSynthesisUtterance(text); utt.lang='nb-NO'; const v=speechSynthesis.getVoices().find((x)=>x.lang&&x.lang.startsWith('nb')); if(v) utt.voice=v; speechSynthesis.cancel(); speechSynthesis.speak(utt);} 

function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[randomInt(0, arr.length-1)]; }
function normalizeText(v){ return String(v||'').trim().toLowerCase(); }

function numberToNor(n){ const en=['null','en','to','tre','fire','fem','seks','sju','otte','ni']; const ti=['ti','elleve','tolv','tretten','fjorten','femten','seksten','sytten','atten','nitten']; const tier=['','','tjue','tretti','forti','femti','seksti','sytti','atti','nitti']; if(n<10)return en[n]; if(n<20)return ti[n-10]; if(n<100){const t=Math.floor(n/10);const u=n%10;return u===0?tier[t]:`${tier[t]} ${en[u]}`;} if(n<1000){const h=Math.floor(n/100);const rest=n%100;const hPart=h===1?'hundre':`${en[h]} hundre`; return rest===0?hPart:`${hPart} og ${numberToNor(rest)}`;} return String(n);} 

function createNorQuestion(category){
  switch(category){
    case 'ord': { const w=pick(norwegianBase.ord); return { text:`Skriv ordet "${w}"`, answer:w, hint:'Vanlig hverdagsord', speak:w }; }
    case 'setning': { const s=pick(norwegianBase.subject); const v=pick(norwegianBase.verb); const o=pick(norwegianBase.object); const sentence=`${s} ${v} ${o}`; return { text:`Skriv setningen: "${sentence}"`, answer: sentence.toLowerCase(), hint:'Bruk liten skrift, uten punktum', speak: sentence }; }
    case 'preposisjon': { const prep=pick(norwegianBase.preposisjon); const sted=pick(norwegianBase.steder); return { text:`Fyll inn: Boken ligger __ ${sted}.`, answer: prep, hint:'Preposisjon', speak:`Boken ligger ${prep} ${sted}.` }; }
    case 'tall': { const n=randomInt(1,999); const askText=Math.random()>0.5; if(askText) return { text:`Skriv tallet som tekst: ${n}`, answer:numberToNor(n), hint:'Bruk norsk tallord', speak:numberToNor(n) }; return { text:`Skriv tallet med tall: "${numberToNor(n)}"`, answer:String(n), hint:'Skriv siffer', speak:numberToNor(n) }; }
    default: return { text:'Skriv et ord', answer:'ord', hint:'', speak:'ord' };
  }
}

function buildNorSet(category, count){ const target=Math.min(count, MAX_NOR); const qs=[]; const used=new Set(); const tries=Math.max(800, target*30); for(let i=0;i<tries && qs.length<target;i++){ const q=createNorQuestion(category); if(used.has(q.text)) continue; used.add(q.text); qs.push(q);} while(qs.length<target) qs.push(createNorQuestion(category)); return qs; }

function updateNorHeader(){ const total=nbState.questions.length; const current=Math.min(nbState.index+1,total); nProgressText.textContent=`${current} / ${total}`; nScoreText.textContent=String(nbState.score); }

function checkNorAnswer(user,q){ const norm=normalizeText(user); const ans=normalizeText(q.answer); if(norm===ans) return true; const numU=Number(norm.replace(',', '.')); const numA=Number(ans.replace(',', '.')); if(!Number.isNaN(numU) && !Number.isNaN(numA)) return numU===numA; return false; }

function renderNorQuestion(){ const q=nbState.questions[nbState.index]; nbState.canGoNext=false; nAnswerInput.value=''; nQuestionText.textContent=q.text; nHint.textContent=q.hint||''; nFeedback.textContent=''; nSubmitBtn.disabled=false; nNextBtn.disabled=true; updateNorHeader(); }

function submitNorAnswer(){ if(nbState.canGoNext) return; const q=nbState.questions[nbState.index]; const ok=checkNorAnswer(nAnswerInput.value,q); if(ok){ nbState.correct++; nbState.score+=10; nFeedback.textContent='Riktig!'; nFeedback.classList.add('ok'); nFeedback.classList.remove('bad'); } else { nbState.wrong++; nFeedback.textContent=`Ikke riktig. Fasit: ${q.answer}`; nFeedback.classList.add('bad'); nFeedback.classList.remove('ok'); } nbState.canGoNext=true; nSubmitBtn.disabled=true; nNextBtn.disabled=false; }

function skipNorQuestion(){ if(nbState.canGoNext) return; const q=nbState.questions[nbState.index]; nbState.skipped++; nFeedback.textContent=`Hoppet over. Fasit: ${q.answer}`; nFeedback.classList.add('bad'); nFeedback.classList.remove('ok'); nbState.canGoNext=true; nSubmitBtn.disabled=true; nNextBtn.disabled=false; }

function nextNorQuestion(){ nbState.index+=1; if(nbState.index>=nbState.questions.length){ nFeedback.textContent='Ferdig! Trykk Start norsk for ny runde.'; nSubmitBtn.disabled=true; nNextBtn.disabled=true; return; } renderNorQuestion(); }

function startNorQuiz(){ const count=Math.min(Number(nCountSelect.value), MAX_NOR); nbState.questions=buildNorSet(nCategorySelect.value, count); nbState.index=0; nbState.score=0; nbState.correct=0; nbState.wrong=0; nbState.skipped=0; nbState.canGoNext=false; renderNorQuestion(); document.getElementById('norsk-ovelser').scrollIntoView({behavior:'smooth'}); }

speakButtons.forEach((btn)=>btn.addEventListener('click', ()=>speakText(btn.dataset.say)));
nStartBtn.addEventListener('click', startNorQuiz);
nSubmitBtn.addEventListener('click', submitNorAnswer);
nSkipBtn.addEventListener('click', skipNorQuestion);
nNextBtn.addEventListener('click', nextNorQuestion);
nPlayBtn.addEventListener('click', ()=>{ const q=nbState.questions[nbState.index]; if(q) speakText(q.speak || q.text); });
nAnswerInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); (nbState.canGoNext ? nNextBtn : nSubmitBtn).click(); } });
