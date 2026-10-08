(function () {
  var scene = document.querySelector(".library-scene");
  if (!scene) return;

  /* ---------- pixel-art generators (rendered as crisp SVG) ---------- */

  function pixelSVG(W, H, grid, cls) {
    var out = [];
    for (var y = 0; y < H; y++) {
      var x = 0;
      while (x < W) {
        var c = grid[y][x];
        if (!c) { x++; continue; }
        var x0 = x;
        while (x < W && grid[y][x] === c) x++;
        out.push('<rect x="' + x0 + '" y="' + y + '" width="' + (x - x0) + '" height="1" fill="' + c + '"/>');
      }
    }
    return '<svg class="' + cls + '" viewBox="0 0 ' + W + " " + H + '" shape-rendering="crispEdges" aria-hidden="true">' + out.join("") + "</svg>";
  }

  function makeGrid(W, H) {
    var g = [];
    for (var y = 0; y < H; y++) { g.push(new Array(W).fill(null)); }
    g.set = function (x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
    g.rect = function (x, y, w, h, c) { for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) g.set(i, j, c); };
    return g;
  }

  function hash(n) { var r = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return r - Math.floor(r); }

  function scrollSVG(H) {
    H = H || 40;
    var W = 96, g = makeGrid(W, H);
    var P = { o: "#7e3a1c", e: "#b5703b", d: "#e0b26e", p: "#e9b874", l: "#efc283",
              r: "#d99a5c", rh: "#f0c083", rs: "#b8703a", rd: "#9a582b" };

    // paper with torn wavy edges
    var px0 = 8, px1 = 87, prevT = null, prevB = null;
    for (var x = px0; x <= px1; x++) {
      var t = 6 + Math.floor(hash(Math.floor(x / 5) + 3) * 3) - 1;
      var b = (H - 7) + Math.floor(hash(Math.floor(x / 6) + 40) * 3) - 1;
      for (var y = t; y <= b; y++) g.set(x, y, P.p);
      g.set(x, t, P.o); g.set(x, b, P.o);
      g.set(x, t + 1, P.e); g.set(x, b - 1, P.e);
      g.set(x, t + 2, P.d); g.set(x, b - 2, P.d);
      if (prevT !== null && prevT !== t) g.set(x, prevT, P.o);
      if (prevB !== null && prevB !== b) g.set(x, prevB, P.o);
      prevT = t; prevB = b;
    }
    // paper speckle texture
    for (var i = 0; i < 110; i++) {
      var sx = 12 + Math.floor(hash(i * 7 + 1) * 72), sy = 10 + Math.floor(hash(i * 13 + 5) * (H - 20));
      if (g[sy][sx] === P.p) g.set(sx, sy, hash(i) > 0.6 ? P.l : P.d);
    }

    // rolled ends
    function roll(x0) {
      var top = 1, bot = H - 2;
      for (var y = top; y <= bot; y++) {
        var l = x0, r = x0 + 11;
        if (y === top || y === bot) { l = x0 + 3; r = x0 + 8; }
        else if (y === top + 1 || y === bot - 1) { l = x0 + 1; r = x0 + 10; }
        for (var x = l; x <= r; x++) g.set(x, y, P.r);
        g.set(l, y, P.o); g.set(r, y, P.o);
        if (y === top + 1 || y === bot - 1) { g.set(l + 1, y, P.o); g.set(r - 1, y, P.o); }
      }
      for (var xx = x0 + 3; xx <= x0 + 8; xx++) { g.set(xx, top, P.o); g.set(xx, bot, P.o); }
      g.rect(x0 + 2, top + 3, 2, bot - top - 5, P.rh);
      g.rect(x0 + 8, top + 3, 2, bot - top - 5, P.rs);
      g.rect(x0 + 10, top + 3, 1, bot - top - 5, P.rd);
      // curl spirals
      [top + 3, bot - 8].forEach(function (cy) {
        g.rect(x0 + 4, cy, 4, 1, P.o);
        g.set(x0 + 3, cy + 1, P.o); g.set(x0 + 3, cy + 2, P.o);
        g.rect(x0 + 4, cy + 3, 4, 1, P.o);
        g.set(x0 + 8, cy + 2, P.o);
        g.set(x0 + 6, cy + 1, P.rs); g.set(x0 + 5, cy + 2, P.rs);
        g.rect(x0 + 4, cy + 4, 5, 1, P.rs);
      });
      // dashed paper edge inside the roll
      for (var dy = 12; dy <= H - 13; dy += 3) g.set(x0 + 6, dy, P.rs);
    }
    roll(2); roll(82);
    return pixelSVG(W, H, g, "ls-scroll ls-scroll-" + (H > 40 ? "tall" : "wide"));
  }

  function quillSVG() {
    var rows = [
      "..........oooooo",
      ".........obbbbbo",
      "........obpbbbbo",
      ".......occpbboo.",
      "......octccbbo..",
      ".....ocpccbbo...",
      ".....octpcbo....",
      "....occtcpo.....",
      "....ocptcbo.....",
      "...ocbpcco......",
      "...octtco.......",
      "..ocpcco........",
      "..occto.........",
      "..otoo..........",
      "..oo............",
      "..o.............",
      ".oo.............",
      ".o..............",
      "oo..............",
      "o..............."
    ];
    var P = { o: "#6b4a3a", c: "#efe8d8", t: "#d6c6ac", b: "#b98b6c", p: "#d3a58c" };
    var W = 16, H = rows.length, g = makeGrid(W, H);
    rows.forEach(function (r, y) { for (var x = 0; x < W; x++) if (r[x] !== ".") g.set(x, y, P[r[x]]); });
    return pixelSVG(W, H, g, "ls-quill-art");
  }

  function bubbleSVG() {
    var W = 30, H = 16, g = makeGrid(W, H);
    var o = "#3a2620", f = "#fff6e4";
    g.rect(2, 1, 26, 11, f);
    g.rect(1, 2, 28, 9, f);
    g.rect(3, 0, 24, 1, o); g.rect(3, 12, 24, 1, o);
    g.rect(0, 3, 1, 7, o); g.rect(29, 3, 1, 7, o);
    g.set(1, 1, o); g.set(2, 1, o); g.set(1, 2, o);
    g.set(27, 1, o); g.set(28, 1, o); g.set(28, 2, o);
    g.set(1, 11, o); g.set(2, 11, o); g.set(1, 10, o);
    g.set(27, 11, o); g.set(28, 11, o); g.set(28, 10, o);
    g.rect(2, 2, 25, 1, f); g.rect(2, 10, 25, 1, f); g.rect(1, 3, 27, 7, f);
    // tail (bottom-left, pointing down toward the cat)
    g.rect(7, 12, 4, 1, f); g.set(6, 12, o); g.set(11, 12, o);
    g.rect(8, 13, 2, 1, f); g.set(7, 13, o); g.set(10, 13, o);
    g.set(8, 14, o); g.set(9, 14, o);
    return pixelSVG(W, H, g, "ls-bubble-art");
  }

  /* ---------- inject art ---------- */

  var letter = scene.querySelector(".ls-letter");
  var scrollHost = letter.querySelector(".ls-scroll-host");
  scrollHost.innerHTML = scrollSVG(40) + scrollSVG(56);
  var quill = letter.querySelector(".ls-quill");
  quill.innerHTML = quillSVG();
  var bubble = scene.querySelector(".ls-bubble");
  bubble.insertAdjacentHTML("afterbegin", bubbleSVG());

  /* ---------- 8-bit sounds (synthesized, no files) ---------- */

  var audio = null;
  function ctx() {
    if (!audio) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) audio = new AC(); }
    if (audio && audio.state === "suspended") audio.resume();
    return audio;
  }
  function blip(freq, dur, vol, slide, type, when) {
    var ac = ctx(); if (!ac) return;
    var t = ac.currentTime + (when || 0);
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  var sfx = {
    select: function () { blip(660, 0.07, 0.12); blip(990, 0.09, 0.10, null, "square", 0.07); },
    close:  function () { blip(520, 0.07, 0.10); blip(340, 0.10, 0.08, null, "square", 0.07); },
    turn:   function () {
      if (!turnAudio) { turnAudio = new Audio(turnSrc); }
      try { turnAudio.currentTime = 0; } catch (e) {}
      turnAudio.volume = 0.5;
      var p = turnAudio.play();
      if (p && p.catch) p.catch(function () {});
    },
    meow:   function () {
      if (!meowAudio) { meowAudio = new Audio(meowSrc); }
      try { meowAudio.currentTime = 0; } catch (e) {}
      meowAudio.volume = 0.7;
      var p = meowAudio.play();
      if (p && p.catch) p.catch(function () {});
    },
    unroll: function () { blip(220, 0.18, 0.06, 440, "sawtooth"); },
    stamp:  function () { blip(150, 0.13, 0.22, 70, "square"); blip(90, 0.2, 0.16, 50, "triangle", 0.02); },
  };

  /* ---------- pen on paper (real recording, looped while writing) ---------- */

  var penSrc = "assets/pen-writing.m4a";
  var meowSrc = "assets/meow.m4a";
  var turnSrc = "assets/page-turn.m4a";
  var turnAudio = null;
  var pen = null, penFade = null, meowAudio = null;

  function penStart() {
    if (!pen) { pen = new Audio(penSrc); pen.loop = true; }
    clearInterval(penFade);
    pen.playbackRate = 0.94 + Math.random() * 0.12;
    try { pen.currentTime = Math.random() * 2.5; } catch (e) {}
    pen.volume = 0.34;
    var p = pen.play();
    if (p && p.catch) p.catch(function () {});
  }

  function penStop() {
    if (!pen) return;
    clearInterval(penFade);
    penFade = setInterval(function () {
      var v = pen.volume - 0.07;
      if (v <= 0.01) { clearInterval(penFade); pen.pause(); pen.volume = 0.34; }
      else pen.volume = v;
    }, 28);
  }

  /* ---------- hover cues ---------- */

  var hitGirl = scene.querySelector(".ls-hit-girl");
  var hitCat = scene.querySelector(".ls-hit-cat");

  function hoverBind(el, cls) {
    ["pointerenter", "focus"].forEach(function (e) { el.addEventListener(e, function () { scene.classList.add(cls); }); });
    ["pointerleave", "blur"].forEach(function (e) { el.addEventListener(e, function () { scene.classList.remove(cls); }); });
  }
  hoverBind(hitGirl, "hover-girl");
  hoverBind(hitCat, "hover-cat");

  /* ---------- letter ---------- */

  var textEl = letter.querySelector(".ls-letter-text");
  var message = textEl.getAttribute("data-text");
  var typing = null;

  function placeQuill() {
    var node = textEl.firstChild;
    if (!node || !node.length) {
      var r0 = textEl.getBoundingClientRect(), l0 = letter.getBoundingClientRect();
      setQuill(r0.left - l0.left, r0.top - l0.top + r0.height * 0.2);
      return;
    }
    var range = document.createRange();
    range.setStart(node, node.length - 1);
    range.setEnd(node, node.length);
    var rects = range.getClientRects();
    var r = rects[rects.length - 1];
    if (!r) return;
    var lr = letter.getBoundingClientRect();
    setQuill(r.right - lr.left, r.bottom - lr.top - r.height * 0.15);
  }

  function setQuill(x, y) {
    quill.style.left = (x / letter.clientWidth * 100) + "%";
    quill.style.top = (y / letter.clientHeight * 100) + "%";
  }

  function typeMessage() {
    var i = 0;
    textEl.textContent = "";
    letter.classList.remove("is-done");
    letter.classList.add("is-writing");
    placeQuill();
    penStart();
    function step() {
      if (i >= message.length) {
        letter.classList.remove("is-writing");
        letter.classList.add("is-done");
        penStop();
        quill.style.left = "82%";
        quill.style.top = "90%";
        typing = null;
        return;
      }
      var ch = message[i++];
      textEl.textContent += ch;
      placeQuill();
      var delay = 42;
      if (ch === "." || ch === "!" ) delay = 240;
      else if (ch === ",") delay = 140;
      else if (ch === " ") delay = 60;
      typing = setTimeout(step, delay);
    }
    typing = setTimeout(step, 120);
  }

  function openLetter() {
    scene.classList.remove("letter-idle");
    scene.classList.add("is-front", "letter-open");
    letter.classList.add("is-open");
    sfx.select();
    sfx.unroll();
    letter.setAttribute("aria-hidden", "false");
    clearTimeout(typing);
    textEl.textContent = "";
    typing = setTimeout(typeMessage, 520);
  }

  function closeLetter() {
    if (!letter.classList.contains("is-open")) return;
    sfx.close();
    penStop();
    scene.classList.remove("is-front", "letter-open");
    letter.classList.remove("is-open", "is-writing", "is-done");
    letter.setAttribute("aria-hidden", "true");
    clearTimeout(typing);
    typing = null;
  }

  hitGirl.addEventListener("click", function () {
    if (letter.classList.contains("is-open")) closeLetter(); else openLetter();
  });
  letter.querySelector(".ls-close").addEventListener("click", closeLetter);
  scene.querySelector(".ls-dim").addEventListener("click", closeLetter);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLetter(); });

  /* ---------- cat ---------- */

  var meowTimer = null;
  hitCat.addEventListener("click", function () {
    scene.classList.remove("cat-meow");
    void scene.offsetWidth;
    scene.classList.add("cat-meow");
    sfx.meow();
    clearTimeout(meowTimer);
    meowTimer = setTimeout(function () { scene.classList.remove("cat-meow"); }, 2400);
  });


  function stampToolSVG() {
    var W = 22, H = 30, g = makeGrid(W, H);
    var P = { wd: "#8a4a22", wdHi: "#b06a33", wdSh: "#5e3016", br: "#c9a24a",
              brHi: "#efd089", brSh: "#8e6a26", ink: "#3a2620" };
    // wooden handle
    g.rect(8, 1, 6, 2, P.wdSh);
    g.rect(8, 2, 6, 11, P.wd);
    g.rect(9, 3, 2, 9, P.wdHi);
    g.rect(13, 3, 1, 9, P.wdSh);
    g.rect(7, 5, 1, 5, P.wd);
    g.rect(14, 5, 1, 5, P.wd);
    // neck
    g.rect(9, 13, 4, 3, P.brSh);
    g.rect(9, 13, 2, 3, P.br);
    // brass head
    g.rect(4, 16, 14, 7, P.br);
    g.rect(5, 17, 12, 2, P.brHi);
    g.rect(4, 22, 14, 2, P.brSh);
    g.rect(3, 18, 1, 4, P.brSh);
    g.rect(18, 18, 1, 4, P.brSh);
    // engraved face
    g.rect(6, 24, 10, 2, P.brSh);
    g.rect(7, 25, 8, 1, P.ink);
    return pixelSVG(W, H, g, "ls-tool-svg");
  }

  function waxSealSVG() {
    var S = 48, g = makeGrid(S, S), c = (S - 1) / 2;
    var P = { edge: "#6f4a14", rim: "#caa047", rimHi: "#e8c875", wax: "#b9892f",
              dish: "#a7792a", hi: "#d9a94a", sh: "#8a5f1e" };
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var dx = x - c, dy = y - c;
        var ang = Math.atan2(dy, dx);
        // irregular, poured-wax edge
        var wob = 1 + 0.055 * Math.sin(ang * 5 + 1.2) + 0.04 * Math.sin(ang * 8 + 2.7) + 0.03 * Math.sin(ang * 3);
        var r = Math.sqrt(dx * dx + dy * dy) / (c * wob);
        if (r > 1) continue;
        var col = P.wax;
        if (r > 0.96) col = P.edge;                 // thin dark lip
        else if (r > 0.80) col = (dy < 0 ? P.rimHi : P.rim);   // raised rim, lit from above
        else if (r > 0.72) col = P.sh;              // shadow where the rim meets the dish
        else col = (dy < -2 ? P.hi : P.dish);       // pressed inner disc
        g.set(x, y, col);
      }
    }
    // pressed inner ring
    for (var a2 = 0; a2 < 360; a2 += 2) {
      var rad = a2 * Math.PI / 180;
      var rr = c * 0.60;
      g.set(Math.round(c + Math.cos(rad) * rr), Math.round(c + Math.sin(rad) * rr), P.sh);
    }
    return pixelSVG(S, S, g, "ls-wax-svg");
  }

  /* ---------- guestbook ---------- */

  function openBookSVG() {
    var W = 150, H = 104, g = makeGrid(W, H);
    var P = { ink: "#5a3418", cover: "#7e2f24", cover2: "#9c3b2e", coverHi: "#b2503f",
              edge: "#c9a06a", page: "#f4e6c4", page2: "#ecdab2", shade: "#d8c194", line: "#e0cba0" };
    g.rect(2, 6, 146, 95, P.cover2);
    g.rect(4, 4, 142, 97, P.cover);
    g.rect(4, 4, 142, 3, P.coverHi);
    for (var s = 0; s < 2; s++) {
      var px0 = s === 0 ? 8 : 77;
      g.rect(px0, 8, 65, 89, P.edge);
      g.rect(px0 + 1, 9, 63, 87, P.page2);
      g.rect(px0 + 2, 10, 61, 85, P.page);
      for (var ln = 18; ln < 92; ln += 7) {
        g.rect(px0 + 6, ln, 53, 1, P.line);
      }
      g.rect(px0 + (s === 0 ? 63 : 0), 9, 2, 87, P.shade);
    }
    g.rect(73, 6, 4, 93, P.cover);
    g.rect(74, 8, 2, 89, P.ink);
    return pixelSVG(W, H, g, "ls-gb-svg");
  }

  function arrowSVG() {
    var rows = [
      "...ooo...",
      "..ohhho..",
      "..ohhho..",
      ".oohhhoo.",
      "ohhhhhhho",
      ".ohhhhho.",
      "..ohhho..",
      "...oho...",
      "....o...."
    ];
    var P = { o: "#3a2620", h: "#ffd76a" };
    var W = 9, H = rows.length, g = makeGrid(W, H);
    rows.forEach(function (r, y) { for (var x = 0; x < W; x++) if (r[x] !== ".") g.set(x, y, P[r[x]]); });
    return pixelSVG(W, H, g, "ls-arrow-svg");
  }

  var ZONE_COUNTRY = {
    "Africa/Cairo":"Egypt","Africa/Johannesburg":"South Africa","Africa/Lagos":"Nigeria","Africa/Nairobi":"Kenya",
    "Africa/Casablanca":"Morocco","Africa/Accra":"Ghana","Africa/Algiers":"Algeria","Africa/Tunis":"Tunisia",
    "America/New_York":"United States","America/Chicago":"United States","America/Denver":"United States",
    "America/Los_Angeles":"United States","America/Phoenix":"United States","America/Anchorage":"United States",
    "Pacific/Honolulu":"United States","America/Detroit":"United States","America/Toronto":"Canada",
    "America/Vancouver":"Canada","America/Edmonton":"Canada","America/Winnipeg":"Canada","America/Halifax":"Canada",
    "America/Mexico_City":"Mexico","America/Bogota":"Colombia","America/Lima":"Peru","America/Santiago":"Chile",
    "America/Sao_Paulo":"Brazil","America/Argentina/Buenos_Aires":"Argentina","America/Caracas":"Venezuela",
    "America/Havana":"Cuba","America/Panama":"Panama","America/Guatemala":"Guatemala",
    "Asia/Jakarta":"Indonesia","Asia/Makassar":"Indonesia","Asia/Jayapura":"Indonesia","Asia/Pontianak":"Indonesia",
    "Asia/Kuala_Lumpur":"Malaysia","Asia/Singapore":"Singapore","Asia/Bangkok":"Thailand","Asia/Manila":"Philippines",
    "Asia/Ho_Chi_Minh":"Vietnam","Asia/Saigon":"Vietnam","Asia/Hong_Kong":"Hong Kong","Asia/Taipei":"Taiwan",
    "Asia/Shanghai":"China","Asia/Chongqing":"China","Asia/Urumqi":"China","Asia/Tokyo":"Japan","Asia/Seoul":"South Korea",
    "Asia/Kolkata":"India","Asia/Calcutta":"India","Asia/Karachi":"Pakistan","Asia/Dhaka":"Bangladesh",
    "Asia/Colombo":"Sri Lanka","Asia/Kathmandu":"Nepal","Asia/Yangon":"Myanmar","Asia/Phnom_Penh":"Cambodia",
    "Asia/Dubai":"United Arab Emirates","Asia/Riyadh":"Saudi Arabia","Asia/Qatar":"Qatar","Asia/Kuwait":"Kuwait",
    "Asia/Tehran":"Iran","Asia/Baghdad":"Iraq","Asia/Jerusalem":"Israel","Asia/Amman":"Jordan","Asia/Beirut":"Lebanon",
    "Asia/Istanbul":"Turkey","Europe/Istanbul":"Turkey","Asia/Tashkent":"Uzbekistan","Asia/Almaty":"Kazakhstan",
    "Europe/London":"United Kingdom","Europe/Dublin":"Ireland","Europe/Lisbon":"Portugal","Europe/Madrid":"Spain",
    "Europe/Paris":"France","Europe/Brussels":"Belgium","Europe/Amsterdam":"Netherlands","Europe/Berlin":"Germany",
    "Europe/Zurich":"Switzerland","Europe/Vienna":"Austria","Europe/Rome":"Italy","Europe/Prague":"Czechia",
    "Europe/Warsaw":"Poland","Europe/Budapest":"Hungary","Europe/Bucharest":"Romania","Europe/Sofia":"Bulgaria",
    "Europe/Athens":"Greece","Europe/Stockholm":"Sweden","Europe/Oslo":"Norway","Europe/Copenhagen":"Denmark",
    "Europe/Helsinki":"Finland","Europe/Moscow":"Russia","Europe/Kiev":"Ukraine","Europe/Kyiv":"Ukraine",
    "Australia/Sydney":"Australia","Australia/Melbourne":"Australia","Australia/Brisbane":"Australia",
    "Australia/Perth":"Australia","Australia/Adelaide":"Australia","Pacific/Auckland":"New Zealand",
    "Pacific/Fiji":"Fiji","Atlantic/Reykjavik":"Iceland"
  };

  function visitorPlace() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    var country = ZONE_COUNTRY[tz];
    if (!country && tz) {
      country = tz.split("/").pop().replace(/_/g, " ");   // fall back to the zone's city
    }
    return { tz: tz, country: country || "Somewhere" };
  }

  var gb = scene.querySelector(".ls-gb");
  var gbName = gb.querySelector(".ls-gb-name");
  var gbMsg = gb.querySelector(".ls-gb-msg");
  var gbFeather = gb.querySelector(".ls-gb-feather");
  var gbStamp = gb.querySelector(".ls-gb-stamp");
  var gbMark = gb.querySelector(".ls-gb-stamp-mark");
  var gbHint = gb.querySelector(".ls-gb-hint");
  gb.querySelector(".ls-gb-art").innerHTML = openBookSVG();
  var arrowArt = arrowSVG();
  scene.querySelectorAll(".ls-arrow").forEach(function (a) { a.innerHTML = arrowArt; });
  gbStampArt();

  function gbStampArt() {
    gb.querySelector(".ls-gb-stamp").innerHTML = stampToolSVG();
    gb.querySelector(".ls-gb-feather").innerHTML = quillSVG();
    gbMark.insertAdjacentHTML("afterbegin", waxSealSVG());
  }

  var hitBook = scene.querySelector(".ls-hit-book");
  hoverBind(hitBook, "hover-book");

  function openGuestbook() {
    gbOpened = true;
    if (spreads[spreadAt].stamped) {       // start fresh rather than reopening a signed page
      storeSpread();
      if (spreads.length < maxSpreads()) {
        spreads.push(newSpread());
        spreadAt = spreads.length - 1;
      }
      showSpread();
    }
    scene.classList.add("gb-open");
    scene.classList.remove("gb-idle");
    gb.setAttribute("aria-hidden", "false");
    sfx.select();
  }
  function closeGuestbook() {
    if (!scene.classList.contains("gb-open")) return;
    scene.classList.remove("gb-open");
    gb.setAttribute("aria-hidden", "true");
    sfx.close();
  }
  hitBook.addEventListener("click", function () {
    if (scene.classList.contains("gb-open")) closeGuestbook(); else openGuestbook();
  });
  gb.querySelector(".ls-gb-close").addEventListener("click", closeGuestbook);

  gbFeather.addEventListener("click", function (ev) {
    ev.stopPropagation();
    gbFeather.classList.add("is-active");
    (gbName.value.trim() ? gbMsg : gbName).focus();
    penStart();
    setTimeout(penStop, 700);
  });
  [gbName, gbMsg].forEach(function (el) {
    el.addEventListener("focus", function () { gbFeather.classList.add("is-active"); });
  });

  var gbPress = gb.querySelector(".ls-gb-press");
  var HINT_WRITE = "feather to write, stamp to sign";
  var HINT_ARMED = "press your seal anywhere on the page";
  var HINT_PAST  = "a note from an earlier visitor";

  function armStamp() {
    if (scene.classList.contains("gb-stamped")) return;
    scene.classList.add("gb-arming");
    gbHint.textContent = HINT_ARMED;
    sfx.select();
  }
  function disarmStamp() {
    scene.classList.remove("gb-arming");
    if (!scene.classList.contains("gb-stamped")) gbHint.textContent = HINT_WRITE;
  }

  gbStamp.addEventListener("click", function (ev) {
    ev.stopPropagation();
    if (scene.classList.contains("gb-arming")) disarmStamp(); else armStamp();
  });

  gbPress.addEventListener("click", function (ev) {
    ev.stopPropagation();
    if (!scene.classList.contains("gb-arming")) return;
    var box = gb.getBoundingClientRect();
    var sx = ((ev.clientX - box.left) / box.width) * 100;
    var sy = ((ev.clientY - box.top) / box.height) * 100;
    sx = Math.max(14, Math.min(86, sx));          // keep the seal on the pages
    sy = Math.max(16, Math.min(84, sy));
    gbMark.style.setProperty("--sx", sx.toFixed(2) + "%");
    gbMark.style.setProperty("--sy", sy.toFixed(2) + "%");
    pressSeal();
  });

  function pressSeal() {
    var msg = gbMsg.value.trim();
    var place = visitorPlace();
    var now = new Date();
    var when = now.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

    gbMark.querySelector(".ls-wax-text").innerHTML =
      place.country.toUpperCase() + "<br>" + when;

    scene.classList.remove("gb-arming");
    scene.classList.add("gb-stamping", "gb-stamped");
    sfx.stamp();
    setTimeout(function () { scene.classList.remove("gb-stamping"); }, 420);

    gbStamp.setAttribute("disabled", "");
    gbFeather.setAttribute("disabled", "");
    gbName.setAttribute("readonly", "");
    gbMsg.setAttribute("readonly", "");
    storeSpread();
    refreshNav();

    var body = new URLSearchParams({
      "form-name": "guestbook",
      name: gbName.value.trim() || "a visitor",
      message: msg || "(no message — just passing through)",
      country: place.country,
      timezone: place.tz,
      visited_at: now.toISOString()
    });
    fetch("/__forms.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .then(function (r) {
        gbHint.textContent = r.ok ? "thank you — turn the page for another" : "your note could not be sent";
        spreads[spreadAt].hint = gbHint.textContent;
      })
      .catch(function () {
        gbHint.textContent = "offline — your note could not be sent";
        spreads[spreadAt].hint = gbHint.textContent;
      });
  }


  /* ---------- spreads: one note per spread, flip for a fresh page ---------- */

  var NEW_SPREADS = 6;          // blank pages a single visitor may fill
  var spreads = [newSpread()];
  var spreadAt = 0;
  var turning = false;
  var pastCount = 0;            // read-only pages ahead of the writable one
  var gbOpened = false;
  function maxSpreads() { return pastCount + NEW_SPREADS; }

  function newSpread() { return { name: "", msg: "", stamped: false, sx: null, sy: null, wax: "", hint: HINT_WRITE }; }

  function storeSpread() {
    var sp = spreads[spreadAt];
    if (sp.readonly) return;    // never write over someone else's note
    sp.name = gbName.value;
    sp.msg = gbMsg.value;
    sp.stamped = scene.classList.contains("gb-stamped");
    sp.hint = gbHint.textContent;
    if (sp.stamped) {
      sp.sx = gbMark.style.getPropertyValue("--sx");
      sp.sy = gbMark.style.getPropertyValue("--sy");
      sp.wax = gbMark.querySelector(".ls-wax-text").innerHTML;
    }
  }

  var gbTitle = gb.querySelector(".ls-gb-title");

  function showSpread() {
    var sp = spreads[spreadAt];
    // someone else's page is for reading, so stop inviting a name
    gbTitle.textContent = sp.readonly ? "A visitor's note" : "Leave a note";
    gbName.placeholder = sp.readonly ? "" : "your name";
    gbName.value = sp.name;
    gbMsg.value = sp.msg;
    gbHint.textContent = sp.hint;
    gbMark.querySelector(".ls-wax-text").innerHTML = sp.wax;
    if (sp.sx) { gbMark.style.setProperty("--sx", sp.sx); gbMark.style.setProperty("--sy", sp.sy); }
    scene.classList.toggle("gb-stamped", sp.stamped);
    scene.classList.remove("gb-arming");
    [gbName, gbMsg].forEach(function (el) {
      if (sp.stamped) el.setAttribute("readonly", ""); else el.removeAttribute("readonly");
    });
    [gbStamp, gbFeather].forEach(function (el) {
      if (sp.stamped) el.setAttribute("disabled", ""); else el.removeAttribute("disabled");
    });
    gbFeather.classList.remove("is-active");
    refreshNav();
  }

  function refreshNav() {
    gbPrev.disabled = spreadAt === 0;
    gbNext.disabled = spreadAt >= maxSpreads() - 1 ||
      (!spreads[spreadAt].stamped && spreadAt === spreads.length - 1);
    gbFolio.textContent = "page " + (spreadAt + 1) + " of " + Math.max(spreads.length, 1);
  }

  function turnPage(dir) {
    if (turning) return;
    var target = spreadAt + dir;
    if (target < 0 || target >= maxSpreads()) return;
    if (target >= spreads.length) {
      if (!spreads[spreadAt].stamped) return;       // seal this one before starting another
      spreads.push(newSpread());
    }
    turning = true;
    storeSpread();
    sfx.turn();
    scene.classList.add("gb-turning", dir > 0 ? "gb-turn-next" : "gb-turn-prev");
    setTimeout(function () { spreadAt = target; showSpread(); }, 260);
    setTimeout(function () {
      scene.classList.remove("gb-turning", "gb-turn-next", "gb-turn-prev");
      turning = false;
    }, 540);
  }

  var gbPrev = gb.querySelector(".ls-gb-prev");
  var gbNext = gb.querySelector(".ls-gb-next");
  var gbFolio = gb.querySelector(".ls-gb-folio");
  gbPrev.addEventListener("click", function (ev) { ev.stopPropagation(); turnPage(-1); });
  gbNext.addEventListener("click", function (ev) { ev.stopPropagation(); turnPage(1); });
  showSpread();

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (scene.classList.contains("gb-arming")) { disarmStamp(); return; }
    closeGuestbook();
  });
  scene.querySelector(".ls-dim").addEventListener("click", closeGuestbook);
  /* ---------- earlier visitors' notes ----------
     Fetched once at load. They become read-only stamped pages before the blank
     one, so the book opens on a fresh page and you flip back to read others.
     If the request fails or returns nothing, the book is simply blank. */
  function waxFrom(country, iso) {
    var when = "";
    try {
      when = new Date(iso).toLocaleDateString(undefined,
        { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {}
    return String(country || "").toUpperCase() + "<br>" + when;
  }

  fetch("/.netlify/functions/notes")
    .then(function (r) { return r.ok ? r.json() : []; })
    .catch(function () { return []; })
    .then(function (notes) {
      // if someone already started writing, leave their page alone
      if (gbOpened || !Array.isArray(notes) || !notes.length) return;
      var past = notes.map(function (n, i) {
        return {
          name: "", msg: n.message, stamped: true, readonly: true,
          sx: (10 + (i * 7) % 12) + "%",      // scatter the seals a little
          sy: (56 + (i * 5) % 14) + "%",
          wax: waxFrom(n.country, n.at), hint: HINT_PAST
        };
      });
      pastCount = past.length;
      spreads = past.concat([newSpread()]);
      spreadAt = pastCount;
      showSpread();
    });

  setTimeout(function () { scene.classList.add("gb-idle", "letter-idle"); }, 2500);

})();
