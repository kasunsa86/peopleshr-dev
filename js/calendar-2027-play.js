/* Online games for the 2027 calendar share months (January crossword,
 * June and December find the word), on /calendar-2027/<month>-play/.
 * The puzzles match the printed calendar pages. When the game is solved
 * the entry form is mounted by calendar-2027.js (entry type "online"). */
(function () {
  var root = document.getElementById('cal27Game');
  if (!root) return;
  var slug = root.getAttribute('data-slug');

  var GAMES = {
    january: {
      type: 'crossword', cols: 9, rows: 8,
      words: [
        { n: 4, dir: 'a', r: 1, c: 2, ans: 'GOALS', clue: 'Things you hope to achieve this year' },
        { n: 5, dir: 'a', r: 2, c: 0, ans: 'ERA', clue: 'A new ___ begins on 1 January' },
        { n: 6, dir: 'a', r: 4, c: 2, ans: 'MINDSET', clue: 'The first thing to change when you decide this year will be different' },
        { n: 7, dir: 'a', r: 7, c: 4, ans: 'RESET', clue: 'The button every new year lets you press' },
        { n: 1, dir: 'd', r: 0, c: 4, ans: 'CALENDAR', clue: "You're looking at one right now" },
        { n: 2, dir: 'd', r: 0, c: 8, ans: 'START', clue: 'What 1 January gives everyone: a fresh ___' },
        { n: 3, dir: 'd', r: 1, c: 0, ans: 'NEWYEAR', clue: 'What begins at midnight on 31 December? (3,4)' },
        { n: 4, dir: 'd', r: 1, c: 2, ans: 'GAMMAK', clue: "______ තමයි! That's the spirit for 2027" }
      ],
      given: ['6,2', '1,2', '7,0', '7,8', '4,6']
    },
    june: {
      type: 'wordsearch',
      grid: ['GDANSAL', 'MPWLPDF', 'TOVEEGE', 'VRBXPUE', 'BUCIMYD', 'YRGGLVB', 'JSHAREA', 'BHWWJRC', 'REVIEWK', 'VPYPTLW'],
      words: [
        { ans: 'DANSAL', clue: 'Free food, big queues, happy hearts' },
        { ans: 'MOBILE', clue: 'Your HR, right in your pocket (hiding diagonally!)' },
        { ans: 'REVIEW', clue: "Six months done. How's it going?" },
        { ans: 'LEXI', clue: "PeoplesHR's AI buddy, always on call" },
        { ans: 'FEEDBACK', clue: 'Free, like a dansala. Take some, give some!' },
        { ans: 'SHARE', clue: 'What dansal and treats are all about' }
      ]
    },
    december: {
      type: 'wordsearch',
      grid: ['GVPWTVL', 'RCBPTOR', 'ISANTAS', 'NVGWGJJ', 'CPARTYB', 'HGOSGFB', 'SVVNPVA', 'WTGOTSI', 'VPAWYPL', 'PTGRRTA'],
      words: [
        { ans: 'PARTY', clue: 'The year-end office ___ everyone talks about till March' },
        { ans: 'STAR', clue: 'Goes on top of the tree, like your best employee (hiding diagonally!)' },
        { ans: 'SANTA', clue: 'Secret ___: who did you get this year?' },
        { ans: 'SNOW', clue: 'Never seen in Colombo, but on every Christmas card' },
        { ans: 'GRINCH', clue: 'The colleague who books a meeting on Christmas Eve' },
        { ans: 'BAILA', clue: 'A Sri Lankan year-end party essential' }
      ]
    }
  };

  var game = GAMES[slug];
  if (!game) return;
  var gridEl = root.querySelector('.cal27-grid');
  var cluesEl = root.querySelector('.cal27-clues');
  var progressEl = root.querySelector('.cal27-progress');
  var total = game.words.length, found = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function progress() { progressEl.textContent = found + ' of ' + total + ' words'; }
  function solved() {
    root.classList.add('is-solved');
    var done = document.getElementById('cal27Solved');
    if (done) done.hidden = false;
    if (window.cal27) window.cal27.mountForm('online', null);
    if (done) done.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Find the word: tap the first and last letter ---------- */
  function wordsearch() {
    var g = game.grid, R = g.length, C = g[0].length, start = null, cells = [];
    gridEl.style.gridTemplateColumns = 'repeat(' + C + ', minmax(0, 1fr))';
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) {
      var b = el('button', 'cal27-ws', g[r].charAt(c));
      b.type = 'button';
      b.setAttribute('aria-label', 'Row ' + (r + 1) + ', column ' + (c + 1) + ': ' + g[r].charAt(c));
      b.dataset.r = r; b.dataset.c = c;
      b.onclick = tap;
      gridEl.appendChild(b); cells.push(b);
    }
    var items = game.words.map(function (w) {
      var li = el('li'); li.appendChild(el('b', null, w.ans)); li.appendChild(el('span', null, w.clue));
      cluesEl.appendChild(li); return li;
    });
    function at(r, c) { return cells[r * C + c]; }
    function path(r0, c0, r1, c1) {
      var dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0), n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
      if (!(r0 === r1 || c0 === c1 || Math.abs(r1 - r0) === Math.abs(c1 - c0))) return null;
      var out = [];
      for (var i = 0; i <= n; i++) out.push([r0 + i * dr, c0 + i * dc]);
      return out;
    }
    function tap(e) {
      var b = e.currentTarget, r = +b.dataset.r, c = +b.dataset.c;
      if (!start) { start = [r, c]; b.classList.add('is-start'); return; }
      at(start[0], start[1]).classList.remove('is-start');
      var p = path(start[0], start[1], r, c); start = null;
      if (!p) return;
      var word = p.map(function (x) { return g[x[0]].charAt(x[1]); }).join('');
      for (var i = 0; i < game.words.length; i++) {
        var w = game.words[i];
        if (items[i].classList.contains('is-found')) continue;
        if (word === w.ans || word.split('').reverse().join('') === w.ans) {
          p.forEach(function (x) { at(x[0], x[1]).classList.add('is-found'); });
          items[i].classList.add('is-found'); found++; progress();
          if (found === total) solved();
          return;
        }
      }
    }
  }

  /* ---------- Crossword: type into the grid ---------- */
  function crossword() {
    var map = {}, inputs = {}, dir = 'a';
    game.words.forEach(function (w, i) {
      for (var k = 0; k < w.ans.length; k++) {
        var r = w.r + (w.dir === 'd' ? k : 0), c = w.c + (w.dir === 'a' ? k : 0), key = r + ',' + c;
        map[key] = map[key] || { ch: w.ans.charAt(k) };
        map[key][w.dir] = i;
        if (k === 0) map[key].n = w.n;
      }
    });
    gridEl.classList.add('is-xw');
    gridEl.style.gridTemplateColumns = 'repeat(' + game.cols + ', minmax(0, 1fr))';
    for (var r = 0; r < game.rows; r++) for (var c = 0; c < game.cols; c++) {
      var key = r + ',' + c, d = el('div', 'cal27-xc');
      if (map[key]) {
        if (map[key].n) d.appendChild(el('span', 'cal27-xn', String(map[key].n)));
        var inp = el('input');
        inp.maxLength = 1; inp.autocomplete = 'off';
        inp.setAttribute('autocapitalize', 'characters'); inp.setAttribute('spellcheck', 'false');
        inp.setAttribute('aria-label', 'Row ' + (r + 1) + ', column ' + (c + 1));
        inp.dataset.key = key;
        if (game.given.indexOf(key) !== -1) { inp.value = map[key].ch; inp.readOnly = true; d.classList.add('is-given'); }
        inp.addEventListener('input', onInput);
        inp.addEventListener('keydown', onKey);
        inp.addEventListener('focus', function (e) {
          var m = map[e.target.dataset.key];
          if (m[dir] === undefined) dir = dir === 'a' ? 'd' : 'a';
        });
        d.appendChild(inp); inputs[key] = inp;
      } else d.classList.add('is-block');
      gridEl.appendChild(d);
    }
    var lists = { a: el('ol', 'cal27-xlist'), d: el('ol', 'cal27-xlist') }, items = [];
    cluesEl.appendChild(el('h3', null, 'Across')); cluesEl.appendChild(lists.a);
    cluesEl.appendChild(el('h3', null, 'Down')); cluesEl.appendChild(lists.d);
    game.words.forEach(function (w, i) {
      var li = el('li'); li.appendChild(el('b', null, String(w.n))); li.appendChild(el('span', null, w.clue));
      li.onclick = function () { dir = w.dir; var ks = keysOf(i); (inputs[ks.filter(function (k) { return !inputs[k].readOnly; })[0]] || inputs[ks[0]]).focus(); };
      lists[w.dir].appendChild(li); items[i] = li;
    });
    function keysOf(i) {
      var w = game.words[i], out = [];
      for (var k = 0; k < w.ans.length; k++) out.push((w.r + (w.dir === 'd' ? k : 0)) + ',' + (w.c + (w.dir === 'a' ? k : 0)));
      return out;
    }
    function check() {
      found = 0;
      game.words.forEach(function (w, i) {
        var ok = keysOf(i).every(function (k) { return (inputs[k].value || '').toUpperCase() === map[k].ch; });
        items[i].classList.toggle('is-found', ok);
        keysOf(i).forEach(function (k) { if (ok) inputs[k].parentNode.classList.add('is-ok'); });
        if (ok) found++;
      });
      Object.keys(inputs).forEach(function (k) {
        var m = map[k], okA = m.a !== undefined && items[m.a].classList.contains('is-found'), okD = m.d !== undefined && items[m.d].classList.contains('is-found');
        inputs[k].parentNode.classList.toggle('is-ok', okA || okD);
      });
      progress();
      if (found === total) solved();
    }
    function step(key, delta) {
      var p = key.split(',').map(Number), r = p[0], c = p[1];
      for (var i = 0; i < 12; i++) {
        if (dir === 'a') c += delta; else r += delta;
        var k = r + ',' + c;
        if (!map[k]) return null;
        if (!inputs[k].readOnly) return k;
      }
      return null;
    }
    function onInput(e) {
      var t = e.target; t.value = (t.value || '').replace(/[^a-z]/gi, '').slice(-1).toUpperCase();
      check();
      if (t.value) { var n = step(t.dataset.key, 1); if (n) inputs[n].focus(); }
    }
    function onKey(e) {
      var t = e.target;
      if (e.key === 'Backspace' && !t.value) { var p = step(t.dataset.key, -1); if (p) { inputs[p].focus(); inputs[p].value = ''; check(); e.preventDefault(); } }
      var moves = { ArrowRight: ['a', 1], ArrowLeft: ['a', -1], ArrowDown: ['d', 1], ArrowUp: ['d', -1] };
      if (moves[e.key]) { dir = moves[e.key][0]; var n = step(t.dataset.key, moves[e.key][1]); if (n) inputs[n].focus(); e.preventDefault(); }
    }
  }

  if (game.type === 'crossword') crossword(); else wordsearch();
  progress();
})();
