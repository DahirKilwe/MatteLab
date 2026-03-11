// script-matte.js
const gradeSelect = document.getElementById('gradeSelect');
const topicSelect = document.getElementById('topicSelect');
const difficultySelect = document.getElementById('difficultySelect');
const countSelect = document.getElementById('countSelect');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const skipBtn = document.getElementById('skipBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const questionSection = document.getElementById('ovelser');
const resultSection = document.getElementById('resultat');
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('scoreText');
const timerText = document.getElementById('timerText');
const progressBar = document.getElementById('progressBar');
const questionText = document.getElementById('questionText');
const questionHint = document.getElementById('questionHint');
const answerInput = document.getElementById('answerInput');
const feedbackText = document.getElementById('feedbackText');
const resultSummary = document.getElementById('resultSummary');
const resultStats = document.getElementById('resultStats');
const gradeButtons = document.querySelectorAll('[data-grade]');

const MAX_QUESTIONS = 400;
const state = { questions: [], index: 0, score: 0, correct: 0, wrong: 0, skipped: 0, canGoNext: false };

const gradeTopics = {
  1: ['addisjon', 'subtraksjon', 'mixed'],
  2: ['addisjon', 'subtraksjon', 'multiplikasjon', 'mixed'],
  3: ['addisjon', 'subtraksjon', 'multiplikasjon', 'divisjon', 'mixed'],
  4: ['addisjon', 'subtraksjon', 'multiplikasjon', 'divisjon', 'mixed'],
  5: ['multiplikasjon', 'divisjon', 'brok', 'desimal', 'mixed'],
  6: ['brok', 'desimal', 'prosent', 'mixed'],
  7: ['prosent', 'algebra', 'desimal', 'mixed'],
  8: ['algebra', 'prosent', 'geometri', 'mixed'],
};

const topicLabel = {
  addisjon: 'Addisjon', subtraksjon: 'Subtraksjon', multiplikasjon: 'Multiplikasjon', divisjon: 'Divisjon',
  brok: 'Brok', desimal: 'Desimal', prosent: 'Prosent', algebra: 'Algebra', geometri: 'Geometri', mixed: 'Blandet',
};

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randomInt(0, arr.length - 1)]; }
function round2(v) { return Math.round(v * 100) / 100; }
function normalizeInput(v) { return Number(String(v).replace(',', '.').trim()); }

function questionPack(text, answer, hint, explanation, tolerance = 0) { return { text, answer, hint, explanation, tolerance }; }

function createQuestion(grade, topic, difficulty) {
  const level = Number(difficulty);
  const base = Math.max(10, grade * 10 * level);
  switch (topic) {
    case 'addisjon': { const a = randomInt(1, base); const b = randomInt(1, base); return questionPack(`${a} + ${b} = ?`, a+b, 'Del opp i tiere og enere.', `${a}+${b}=${a+b}`); }
    case 'subtraksjon': { const a = randomInt(Math.floor(base/2), base+40); const b = randomInt(1, a-1); return questionPack(`${a} - ${b} = ?`, a-b, 'Tenk pa forskjell.', `${a}-${b}=${a-b}`); }
    case 'multiplikasjon': { const a = randomInt(2, Math.max(5, grade*3+level*4)); const b = randomInt(2, Math.max(5, grade*3+level*4)); return questionPack(`${a} x ${b} = ?`, a*b, 'Bruk gangetabellen.', `${a}x${b}=${a*b}`); }
    case 'divisjon': { const b = randomInt(2, 12+level*3); const ans = randomInt(2, 12+grade+level*2); const a = b*ans; return questionPack(`${a} / ${b} = ?`, ans, 'Motsatt av gange.', `${a}/${b}=${ans}`); }
    case 'brok': { const den = pick([2,3,4,5,6,8,10,12]); const n1 = randomInt(1, den-1); const n2 = randomInt(1, den-1); const sum = round2((n1+n2)/den); return { text: `${n1}/${den} + ${n2}/${den} = ? (desimal)`, answer: sum, hint: 'Legg sammen tellerne.', explanation: `(${n1}+${n2})/${den}=${sum}`, tolerance: 0.01 }; }
    case 'desimal': { const a = round2(randomInt(10,300)/10); const b = round2(randomInt(10,300)/10); return { text: `${a} + ${b} = ?`, answer: round2(a+b), hint: 'Komma under komma.', explanation: `${a}+${b}=${round2(a+b)}`, tolerance: 0.01 }; }
    case 'prosent': { const p = pick([10,20,25,30,40,50,75]); const t = randomInt(4,60)*10; const ans = round2((p/100)*t); return { text: `Hva er ${p}% av ${t}?`, answer: ans, hint: 'Prosent = per hundre', explanation: `${p}/100 x ${t} = ${ans}`, tolerance: 0.01 }; }
    case 'algebra': { const x = randomInt(2,20+level*4); const a = randomInt(2,9); const b = randomInt(1,30); const c = a*x+b; return questionPack(`Los: ${a}x + ${b} = ${c}`, x, 'Trekk fra og del.', `${a}x=${c-b}, x=${(c-b)}/${a}=${x}`); }
    case 'geometri': { const w = randomInt(3,20); const h = randomInt(3,20); return questionPack(`Rektangel ${w}x${h}. Areal?`, w*h, 'Areal = bredde x hoyde.', `${w}x${h}=${w*h}`); }
    default: return createQuestion(grade, pick(gradeTopics[grade].filter((t)=>t!=='mixed')), difficulty);
  }
}

function createUniqueQuestionSet(grade, selectedTopic, difficulty, count) {
  const target = Math.min(count, MAX_QUESTIONS);
  const questions = []; const used = new Set(); const tries = Math.max(1000, target*40);
  for (let i=0; i<tries && questions.length<target; i+=1) {
    const topic = selectedTopic === 'mixed' ? pick(gradeTopics[grade].filter((t)=>t!=='mixed')) : selectedTopic;
    const q = createQuestion(grade, topic, difficulty);
    const key = `${topic}|${q.text}`;
    if (used.has(key)) continue; used.add(key); questions.push(q);
  }
  while (questions.length < target) {
    const topic = selectedTopic === 'mixed' ? pick(gradeTopics[grade].filter((t)=>t!=='mixed')) : selectedTopic;
    questions.push(createQuestion(grade, topic, difficulty));
  }
  return questions;
}

function updateHeader() {
  const total = state.questions.length;
  progressText.textContent = `${Math.min(state.index+1,total)} / ${total}`;
  scoreText.textContent = String(state.score);
  progressBar.style.width = `${(state.index / Math.max(1,total)) * 100}%`;
  timerText.textContent = 'Uten tidspress';
}

function setFeedback(msg, type) {
  feedbackText.textContent = msg;
  feedbackText.classList.remove('ok','bad');
  if (type) feedbackText.classList.add(type);
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.canGoNext = false;
  answerInput.value = '';
  questionText.textContent = q.text;
  questionHint.textContent = q.hint || '';
  setFeedback('', null);
  submitBtn.disabled = false;
  nextBtn.disabled = true;
  updateHeader();
  answerInput.focus();
}

function nextQuestion(){
  state.index += 1;
  if (state.index >= state.questions.length) { finishQuiz(); return; }
  renderQuestion();
}

function submitAnswer(){
  if (state.canGoNext) return;
  const q = state.questions[state.index];
  const val = normalizeInput(answerInput.value);
  const ok = Math.abs(val - q.answer) <= (q.tolerance ?? 0);
  if (ok){ state.correct++; state.score+=10; setFeedback(`Riktig! ${q.explanation}`, 'ok'); }
  else { state.wrong++; setFeedback(`Ikke riktig. Riktig svar er ${q.answer}. ${q.explanation}`, 'bad'); }
  state.canGoNext=true; submitBtn.disabled=true; nextBtn.disabled=false;
}

function skipQuestion(){
  if (state.canGoNext) return;
  const q = state.questions[state.index];
  state.skipped++; state.wrong++;
  setFeedback(`Hoppet over. Riktig svar: ${q.answer}. ${q.explanation}`, 'bad');
  state.canGoNext=true; submitBtn.disabled=true; nextBtn.disabled=false;
}

function finishQuiz(){
  questionSection.classList.add('hidden');
  resultSection.classList.remove('hidden');
  const total = state.questions.length;
  const percent = total ? Math.round((state.correct/total)*100) : 0;
  resultSummary.textContent = `Du fikk ${state.correct} av ${total} riktige (${percent}%).`;
  resultStats.innerHTML = `<li>Poeng: ${state.score}</li><li>Riktige: ${state.correct}</li><li>Feil: ${state.wrong}</li><li>Hoppet over: ${state.skipped}</li>`;
}

function buildGradeOptions(){ gradeSelect.innerHTML=''; for(let g=1; g<=8; g++){ const opt=document.createElement('option'); opt.value=String(g); opt.textContent=`${g}. klasse`; if(g===4) opt.selected=true; gradeSelect.appendChild(opt);} }
function buildTopicOptions(){
  const current = topicSelect.value;
  topicSelect.innerHTML = '';
  const g = Number(gradeSelect.value);
  const topics = gradeTopics[g];
  if (!topics) return;
  const mixedOpt = document.createElement('option');
  mixedOpt.value = 'mixed';
  mixedOpt.textContent = 'Blandet (alle tema)';
  topicSelect.appendChild(mixedOpt);
  topics.filter((t)=>t!=='mixed').forEach((t)=>{ const opt=document.createElement('option'); opt.value=t; opt.textContent=topicLabel[t]||t; topicSelect.appendChild(opt); });
  if (current && [...topicSelect.options].some(o => o.value === current)) {
    topicSelect.value = current;
  } else {
    topicSelect.value = 'mixed';
  }
}


function startQuiz(){
  if (!gradeSelect.options.length) buildGradeOptions();
  buildTopicOptions();
  nextBtn.disabled=true;
  const grade=Number(gradeSelect.value);
  const selectedTopic=topicSelect.value;
  const difficulty=Number(difficultySelect.value);
  const count=Math.min(Number(countSelect.value), MAX_QUESTIONS);
  state.questions=createUniqueQuestionSet(grade, selectedTopic, difficulty, count);
  state.index=0; state.score=0; state.correct=0; state.wrong=0; state.skipped=0; state.canGoNext=false;
  resultSection.classList.add('hidden');
  questionSection.classList.remove('hidden');
  renderQuestion();
  questionSection.scrollIntoView({behavior:'smooth'});
}

startBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', submitAnswer);
skipBtn.addEventListener('click', skipQuestion);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', startQuiz);
gradeSelect.addEventListener('change', buildTopicOptions);
answerInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); (state.canGoNext?nextBtn:submitBtn).click(); } });
gradeButtons.forEach((btn)=>btn.addEventListener('click', ()=>{ gradeSelect.value=String(btn.dataset.grade); buildTopicOptions(); topicSelect.value='mixed'; document.getElementById('start').scrollIntoView({behavior:'smooth'});}));

buildGradeOptions();
buildTopicOptions();


