// nav.js
(function(){
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) nav.classList.remove('open');
  });
})();
