/* Online games for the 2027 calendar share months, on
 * /calendar-2027/<month>-play/: the January crossword and the June and
 * December word searches. Game logic and puzzles come from the marketing
 * team's "2027 <Month> Scan" artifacts and match the printed pages. When a
 * game is solved it calls window.cal27.solved() (calendar-2027.js), which
 * unlocks the entry form. */
(function () {
  var root = document.getElementById('cal27Entry');
  if (!root || root.dataset.view !== 'play' || !window.cal27) return;
  var $ = function (id) { return document.getElementById(id); };
  var burst = window.cal27.burst;
  var slug = root.dataset.slug;

  /* ---------- January crossword ---------- */
  function crossword() {
    var COLS = 9, ROWS = 8;
    var WORDS = [
      { n: 4, dir: 'a', r: 1, c: 2, ans: 'GOALS', clue: 'Things you hope to achieve this year' },
      { n: 5, dir: 'a', r: 2, c: 0, ans: 'ERA', clue: 'A new ___ begins on 1 January' },
      { n: 6, dir: 'a', r: 4, c: 2, ans: 'MINDSET', clue: 'The first thing to change when you decide this year will be different' },
      { n: 7, dir: 'a', r: 7, c: 4, ans: 'RESET', clue: 'The button every new year lets you press' },
      { n: 1, dir: 'd', r: 0, c: 4, ans: 'CALENDAR', clue: "You're looking at one right now" },
      { n: 2, dir: 'd', r: 0, c: 8, ans: 'START', clue: 'What 1 January gives everyone: a fresh ___' },
      { n: 3, dir: 'd', r: 1, c: 0, ans: 'NEWYEAR', clue: 'What begins at midnight on 31 December?' },
      { n: 4, dir: 'd', r: 1, c: 2, ans: 'GAMMAK', clue: "<span class='si'>______ තමයි!</span> That's the spirit for 2027.", html: true }
    ];
    var GIVEN = { '6,2': 1, '1,2': 1, '7,0': 1, '7,8': 1, '4,6': 1 };
    var cell = {};
    WORDS.forEach(function (w, i) {
      for (var k = 0; k < w.ans.length; k++) {
        var r = w.r + (w.dir === 'd' ? k : 0), c = w.c + (w.dir === 'a' ? k : 0), key = r + ',' + c;
        cell[key] = cell[key] || { ch: w.ans[k] }; cell[key][w.dir] = i; if (k === 0) cell[key].n = w.n;
      }
    });
    var xw = $('xw'), inputs = {};
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var d = document.createElement('div'), key = r + ',' + c; d.className = 'c';
      if (cell[key]) {
        if (cell[key].n) { var s = document.createElement('span'); s.className = 'n'; s.textContent = cell[key].n; d.appendChild(s); }
        var inp = document.createElement('input'); inp.id = 'x-' + r + '-' + c; inp.maxLength = 1; inp.autocomplete = 'off';
        inp.setAttribute('autocapitalize', 'characters'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('aria-label', 'Row ' + (r + 1) + ', column ' + (c + 1));
        inp.dataset.key = key; d.appendChild(inp); inputs[key] = inp;
        if (GIVEN[key]) { inp.value = cell[key].ch; inp.readOnly = true; d.classList.add('given'); }
      }
      xw.appendChild(d);
    }
    var dir = 'a', cur = null, solvedW = {}, solvedN = 0;
    var keysOf = function (i) { var w = WORDS[i], o = []; for (var k = 0; k < w.ans.length; k++) o.push((w.r + (w.dir === 'd' ? k : 0)) + ',' + (w.c + (w.dir === 'a' ? k : 0))); return o; };
    var wordAt = function (key) { var x = cell[key]; return x[dir] !== undefined ? x[dir] : (x.a !== undefined ? x.a : x.d); };
    var lists = { a: $('across'), d: $('down') };
    WORDS.forEach(function (w, i) {
      var li = document.createElement('li'); li.id = 'clue-' + i;
      var b = document.createElement('b'); b.textContent = w.n;
      var sp = document.createElement('span'); if (w.html) sp.innerHTML = w.clue + ' '; else sp.textContent = w.clue + ' ';
      li.appendChild(b); li.appendChild(sp);
      li.onclick = function () { dir = w.dir; var ks = keysOf(i); var t = ks.filter(function (k) { return !inputs[k].readOnly; })[0]; (inputs[t] || inputs[ks[0]]).focus(); };
      lists[w.dir].appendChild(li);
    });
    function paint() {
      document.querySelectorAll('.cal27-scope .xw .c').forEach(function (d) { d.classList.remove('inword'); });
      document.querySelectorAll('.cal27-scope .clues li').forEach(function (l) { l.classList.remove('on'); });
      if (!cur) return;
      var i = wordAt(cur); dir = WORDS[i].dir;
      keysOf(i).forEach(function (k) { inputs[k].parentNode.classList.add('inword'); });
      $('clue-' + i).classList.add('on');
      var now = $('now'); now.innerHTML = '';
      var s = document.createElement('span'); s.textContent = WORDS[i].n + ' ' + (dir === 'a' ? 'Across' : 'Down') + ': ';
      var t = document.createElement('span'); t.style.color = 'inherit'; if (WORDS[i].html) t.innerHTML = WORDS[i].clue; else t.textContent = WORDS[i].clue;
      now.appendChild(s); now.appendChild(t);
    }
    function move(key, step) {
      var ks = keysOf(wordAt(key)), p = ks.indexOf(key) + step;
      while (p >= 0 && p < ks.length && inputs[ks[p]].readOnly) p += step;
      if (p >= 0 && p < ks.length) inputs[ks[p]].focus();
    }
    function check() {
      WORDS.forEach(function (w, i) {
        if (solvedW[i]) return;
        if (keysOf(i).every(function (k) { return inputs[k].value === cell[k].ch; })) {
          solvedW[i] = true; solvedN++; $('clue-' + i).classList.add('got');
          keysOf(i).forEach(function (k, j) { var d = inputs[k].parentNode; setTimeout(function () { d.classList.add('solved', 'pop'); setTimeout(function () { d.classList.remove('pop'); }, 400); }, j * 50); });
          burst(40);
        }
      });
      $('meter').style.width = (solvedN / WORDS.length * 100) + '%'; $('meter-n').textContent = solvedN + ' / ' + WORDS.length;
      if (solvedN === WORDS.length) {
        Object.keys(inputs).forEach(function (k) { inputs[k].readOnly = true; });
        window.cal27.solved();
      }
    }
    Object.keys(inputs).forEach(function (key) {
      var inp = inputs[key];
      inp.addEventListener('pointerdown', function () { var x = cell[key]; if (cur === key && x.a !== undefined && x.d !== undefined) { dir = dir === 'a' ? 'd' : 'a'; paint(); } });
      inp.addEventListener('focus', function () { cur = key; if (cell[cur][dir] === undefined) dir = dir === 'a' ? 'd' : 'a'; paint(); inp.select(); });
      inp.addEventListener('input', function () { var v = inp.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase(); inp.value = v; if (v) move(key, 1); check(); });
      inp.addEventListener('keydown', function (e) {
        var rc = key.split(',').map(Number), r = rc[0], c = rc[1];
        var go = function (dr, dc, d) {
          e.preventDefault();
          if (dir !== d && cell[key][d] !== undefined) { dir = d; paint(); return; }
          var rr = r + dr, cc = c + dc;
          while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) { if (inputs[rr + ',' + cc]) { inputs[rr + ',' + cc].focus(); return; } rr += dr; cc += dc; }
        };
        if (e.key === 'Backspace' && !inp.value) { e.preventDefault(); move(key, -1); var a = document.activeElement; if (a !== inp && a.dataset.key && !a.readOnly) a.value = ''; }
        else if (e.key === 'ArrowRight') go(0, 1, 'a'); else if (e.key === 'ArrowLeft') go(0, -1, 'a');
        else if (e.key === 'ArrowDown') go(1, 0, 'd'); else if (e.key === 'ArrowUp') go(-1, 0, 'd');
      });
    });
  }

  /* ---------- June and December word searches ---------- */
  var SEARCHES = {
    june: {
      rows: ['GDANSAL', 'MPWLPDF', 'TOVEEGE', 'VRBXPUE', 'BUCIMYD', 'YRGGLVB', 'JSHAREA', 'BHWWJRC', 'REVIEWK', 'VPYPTLW'],
      words: [['DANSAL', 'Free food, big queues, happy hearts'], ['MOBILE', 'Your HR, right in your pocket'], ['REVIEW', 'Six months done. How’s it going?'],
              ['LEXI', 'PeoplesHR’s AI buddy, always on call'], ['FEEDBACK', 'Free, like a dansala. Take some, give some!'], ['SHARE', 'What dansal and treats are all about']]
    },
    december: {
      rows: ['GVPWTVL', 'RCBPTOR', 'ISANTAS', 'NVGWGJJ', 'CPARTYB', 'HGOSGFB', 'SVVNPVA', 'WTGOTSI', 'VPAWYPL', 'PTGRRTA'],
      words: [['PARTY', 'The year-end office ___ everyone talks about till March'], ['STAR', 'Goes on top of the tree, like your best employee'],
              ['SANTA', 'Secret ___: who did you get this year?'], ['SNOW', 'Never seen in Colombo, but on every Christmas card'],
              ['GRINCH', 'The colleague who books a meeting on Christmas Eve'], ['BAILA', 'A Sri Lankan year-end party essential']]
    }
  };
  function wordsearch(g) {
    var ROWS = g.rows, WORDS = g.words, N = 7;
    var at = function (r, c) { return ROWS[r] && ROWS[r][c]; };
    var placed = {};
    WORDS.forEach(function (wd) {
      var w = wd[0];
      for (var r = 0; r < ROWS.length; r++) for (var c = 0; c < N; c++) [[0, 1], [1, 0], [1, 1]].forEach(function (dd) {
        for (var i = 0; i < w.length; i++) if (at(r + dd[0] * i, c + dd[1] * i) !== w[i]) return;
        placed[w] = w.split('').map(function (_, i) { return (r + dd[0] * i) * N + (c + dd[1] * i); });
      });
    });
    var wsEl = $('ws'), cells = [];
    ROWS.join('').split('').forEach(function (ch, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = ch;
      b.setAttribute('aria-label', 'Row ' + (Math.floor(i / N) + 1) + ', column ' + (i % N + 1) + ', ' + ch);
      b.onclick = function () { pick(i); }; wsEl.appendChild(b); cells.push(b);
    });
    WORDS.forEach(function (wd) {
      var li = document.createElement('li'); li.id = 'w-' + wd[0];
      var b = document.createElement('b'); b.textContent = wd[0]; var s = document.createElement('span'); s.textContent = wd[1];
      li.appendChild(b); li.appendChild(s); $('wl').appendChild(li);
    });
    var found = {}, foundN = 0, start = null;
    function line(a, b) {
      var r1 = Math.floor(a / N), c1 = a % N, r2 = Math.floor(b / N), c2 = b % N;
      var dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
      if (!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
      var o = []; for (var i = 0; i <= len; i++) o.push((r1 + dr * i) * N + (c1 + dc * i)); return o;
    }
    function pick(i) {
      var msg = $('ws-msg');
      if (foundN === WORDS.length) return;
      if (start === null) { start = i; cells[i].classList.add('start'); msg.textContent = 'Now tap the last letter.'; return; }
      cells[start].classList.remove('start');
      if (i === start) { start = null; msg.textContent = 'Selection cleared.'; return; }
      var ln = line(start, i); start = null;
      var hit = null;
      if (ln) Object.keys(placed).forEach(function (w) {
        var cs = placed[w];
        if (hit || found[w] || cs.length !== ln.length) return;
        if (cs.every(function (c, k) { return c === ln[k]; }) || cs.every(function (c, k) { return c === ln[ln.length - 1 - k]; })) hit = w;
      });
      if (hit) {
        found[hit] = true; foundN++;
        placed[hit].forEach(function (c) { cells[c].classList.add('found'); }); $('w-' + hit).classList.add('got');
        $('meter').style.width = (foundN / WORDS.length * 100) + '%'; $('meter-n').textContent = foundN + ' / ' + WORDS.length; burst(40);
        if (foundN === WORDS.length) { msg.textContent = 'All ' + WORDS.length + ' found!'; window.cal27.solved(); }
        else msg.textContent = 'Found ' + hit + '!';
      } else {
        (ln || [i]).forEach(function (c) { cells[c].classList.add('miss'); setTimeout(function () { cells[c].classList.remove('miss'); }, 450); });
        msg.textContent = ln ? 'Not one of the ' + WORDS.length + '. Try again.' : 'Words run in straight lines.';
      }
    }
  }

  if (slug === 'january') crossword();
  else if (SEARCHES[slug]) wordsearch(SEARCHES[slug]);
})();
