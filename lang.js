// EN/RU toggle shared by the guide pages. The landing keeps its own inline copy
// of this logic; the guide pages load this file instead of repeating it.
(function () {
  var buttons = { EN: document.getElementById('bEN'), RU: document.getElementById('bRU') };

  function setLang(l) {
    document.documentElement.lang = l === 'RU' ? 'ru' : 'en';
    for (var k in buttons) if (buttons[k]) buttons[k].classList.toggle('on', k === l);
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var v = el.getAttribute('data-' + l.toLowerCase());
      if (v != null) el.innerHTML = v;
    });
    try { localStorage.setItem('jamcrate-lang', l); } catch (e) { /* private mode */ }
    document.querySelectorAll('a[href*="play.jamcrate.app"]').forEach(function (a) {
      a.href = 'https://play.jamcrate.app/?lang=' + l.toLowerCase();
    });
  }

  if (buttons.EN) buttons.EN.onclick = function () { setLang('EN'); };
  if (buttons.RU) buttons.RU.onclick = function () { setLang('RU'); };

  var saved = null;
  try { saved = localStorage.getItem('jamcrate-lang'); } catch (e) { /* private mode */ }
  if ((saved || (navigator.language.indexOf('ru') === 0 ? 'RU' : 'EN')) === 'RU') setLang('RU');
})();
