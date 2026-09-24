/* ==========================================================
   Freidra — общее пространство имён. Каждый модуль (reader.js,
   world.js, characters.js, gallery.js, encyclopedia.js) добавляет
   сюда свой раздел: Freidra.reader, Freidra.world, и т.д.
   ========================================================== */
window.Freidra = window.Freidra || {};

(function () {

  /* ------------------------------------------------------
     0. НАСТРОЙКИ (сохраняются в localStorage этого браузера)
     ------------------------------------------------------ */
  const DEFAULT_SETTINGS = { sound:false, volume:40, snow:true, fog:true, animations:true, quality:'high' };

  function loadSettings() {
    try {
      const raw = localStorage.getItem('freidra-settings');
      return raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : { ...DEFAULT_SETTINGS };
    } catch (e) { return { ...DEFAULT_SETTINGS }; }
  }
  function saveSettings() {
    try { localStorage.setItem('freidra-settings', JSON.stringify(settings)); } catch (e) { /* сохранение недоступно — не критично */ }
  }

  const settings = loadSettings();

  function applySettings() {
    document.body.classList.toggle('anim-off', !settings.animations);
    document.getElementById('snow-canvas').style.display = settings.snow ? 'block' : 'none';
    document.getElementById('fog-back').style.display = settings.fog ? 'block' : 'none';
    document.getElementById('fog-front').style.display = settings.fog ? 'block' : 'none';
    Audio_.setVolume(settings.volume / 100);
    Audio_.setMuted(!settings.sound);
  }

  function wireSettingsUI() {
    const $sound = document.getElementById('opt-sound');
    const $volume = document.getElementById('opt-volume');
    const $snow = document.getElementById('opt-snow');
    const $fog = document.getElementById('opt-fog');
    const $anim = document.getElementById('opt-animations');
    const $quality = document.getElementById('opt-quality');

    $sound.checked = settings.sound;
    $volume.value = settings.volume;
    $snow.checked = settings.snow;
    $fog.checked = settings.fog;
    $anim.checked = settings.animations;
    $quality.value = settings.quality;

    $sound.addEventListener('change', () => { settings.sound = $sound.checked; applySettings(); saveSettings(); if (settings.sound) Audio_.playAmbient(); });
    $volume.addEventListener('input', () => { settings.volume = Number($volume.value); applySettings(); saveSettings(); });
    $snow.addEventListener('change', () => { settings.snow = $snow.checked; applySettings(); saveSettings(); });
    $fog.addEventListener('change', () => { settings.fog = $fog.checked; applySettings(); saveSettings(); });
    $anim.addEventListener('change', () => { settings.animations = $anim.checked; applySettings(); saveSettings(); });
    $quality.addEventListener('change', () => {
      settings.quality = $quality.value; saveSettings();
      // low: половина числа снежинок; регулируется в snow-модуле через window.Freidra.settings
    });
  }

  Freidra.settings = settings;

  /* ------------------------------------------------------
     1. АУДИО-МЕНЕДЖЕР
     Файлы (assets/audio/*.mp3) — не входят в комплект по умолчанию.
     Если файла нет, звук просто не проигрывается — сайт не ломается.
     ------------------------------------------------------ */
  const Audio_ = (function () {
    const tracks = {};
    function make(name, src, loop) {
      const el = new window.Audio();
      el.src = src; el.loop = !!loop; el.volume = 0;
      el.addEventListener('error', () => { tracks[name] = null; }, { once:true });
      tracks[name] = el;
      return el;
    }
    make('ambient', 'assets/audio/ambient.mp3', true);
    make('page', 'assets/audio/page.mp3', false);
    make('click', 'assets/audio/click.mp3', false);
    make('hover', 'assets/audio/magic_hover.mp3', false);
    make('wind', 'assets/audio/wind.mp3', true);

    let muted = true;
    let vol = 0.4;

    function setVolume(v) { vol = v; Object.values(tracks).forEach(t => { if (t) t.volume = muted ? 0 : vol; }); }
    function setMuted(m) { muted = m; Object.values(tracks).forEach(t => { if (t) t.volume = muted ? 0 : vol; }); if (muted) { Object.values(tracks).forEach(t => t && t.pause()); } }
    function play(name) { const t = tracks[name]; if (!t || muted) return; try { t.currentTime = 0; t.play().catch(()=>{}); } catch (e) {} }
    function playAmbient() { const t = tracks.ambient; if (!t || muted) return; t.play().catch(()=>{}); }

    return { setVolume, setMuted, play, playAmbient };
  })();

  /* ------------------------------------------------------
     2. СНЕГОПАД (canvas, с предрендером снежинок в память)
     ------------------------------------------------------ */
  const canvas = document.getElementById('snow-canvas');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function preRenderSnowflake(size) {
    const c = document.createElement('canvas');
    c.width = size * 2.5; c.height = size * 2.5;
    const sCtx = c.getContext('2d');
    const radius = c.width / 2;
    sCtx.translate(radius, radius);
    sCtx.strokeStyle = 'rgba(235,245,255,1)';
    sCtx.lineWidth = size * 0.08;
    sCtx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      sCtx.rotate(Math.PI / 3);
      sCtx.beginPath(); sCtx.moveTo(0,0); sCtx.lineTo(0,-size); sCtx.stroke();
      sCtx.beginPath();
      sCtx.moveTo(0,-size*0.5); sCtx.lineTo(-size*0.25,-size*0.65);
      sCtx.moveTo(0,-size*0.5); sCtx.lineTo(size*0.25,-size*0.65);
      sCtx.moveTo(0,-size*0.75); sCtx.lineTo(-size*0.15,-size*0.85);
      sCtx.moveTo(0,-size*0.75); sCtx.lineTo(size*0.15,-size*0.85);
      sCtx.stroke();
    }
    return c;
  }

  const snowStyles = { small: preRenderSnowflake(8), medium: preRenderSnowflake(14), large: preRenderSnowflake(18) };
  let flakes = [];
  let parallaxOffset = { x:0, y:0 };

  function buildFlakes() {
    const count = settings.quality === 'low' ? 22 : settings.quality === 'medium' ? 36 : 50;
    flakes = [];
    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      let cache = snowStyles.small;
      if (depth > 0.4 && depth <= 0.8) cache = snowStyles.medium;
      if (depth > 0.8) cache = snowStyles.large;
      flakes.push({ x: Math.random()*width, y: Math.random()*height, cache, density: Math.random()*count, speed: depth*1.0+0.3, opacity: depth*0.6+0.2 });
    }
  }
  buildFlakes();

  function drawSnow() {
    ctx.clearRect(0, 0, width, height);
    if (settings.snow) {
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        ctx.globalAlpha = f.opacity;
        ctx.drawImage(f.cache, f.x - f.cache.width/2 + parallaxOffset.x*1.6, f.y - f.cache.height/2 + parallaxOffset.y*1.6);
        f.y += f.speed;
        f.x += Math.sin(f.density) * 0.3;
        if (f.y > height + 20) { f.y = -20; f.x = Math.random()*width; }
      }
      ctx.globalAlpha = 1.0;
    }
    requestAnimationFrame(drawSnow);
  }
  requestAnimationFrame(drawSnow);

  /* ------------------------------------------------------
     3. ПАРАЛЛАКС + НАКЛОН КНИГИ (движение мыши)
     3.2 ТЗ: горы/туман/снег/книга двигаются с разной силой
     ------------------------------------------------------ */
  const bookWrapper = document.getElementById('book-wrapper');
  const scene = document.getElementById('scene');
  const layerMountains = document.getElementById('layer-mountains-img');
  const fogBack = document.getElementById('fog-back');
  const fogFront = document.getElementById('fog-front');

  // диагностика фона — п.1 отчёта: если assets/images/mountains.png не найден
  // по пути, показываем явный баннер вместо того, чтобы молча остаться на
  // одних только CSS-слоях (туман/аврора), которые сами по себе фоном не являются
  Freidra.reportMissingBackground = function () {
    document.getElementById('missing-bg-banner').classList.add('show');
  };
  Freidra.reportBackgroundLoaded = function () {
    document.getElementById('missing-bg-banner').classList.remove('show');
  };

  let isOpened = false;
  let ticking = false;

  scene.addEventListener('mousemove', (e) => {
    if (isOpened) return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;
        const normX = (e.clientX - halfWidth) / halfWidth;
        const normY = (e.clientY - halfHeight) / halfHeight;

        if (settings.animations) {
          layerMountains.style.transform = `translate(${normX*5}px, ${normY*5}px)`;
          fogBack.style.transform = `translateX(${normX*15}px)`;
          fogFront.style.transform = `translateX(${normX*30}px)`;
          const maxTilt = 18;
          bookWrapper.style.transform = `rotateX(${-normY*maxTilt}deg) rotateY(${normX*maxTilt}deg) translate(${normX*20}px, ${normY*10}px) scale(1.04)`;
        }
        parallaxOffset.x = normX; parallaxOffset.y = normY;
        ticking = false;
      });
      ticking = true;
    }
  });

  scene.addEventListener('mouseleave', () => {
    if (isOpened) return;
    layerMountains.style.transform = 'translate(0,0)';
    fogBack.style.transform = 'translateX(0)';
    fogFront.style.transform = 'translateX(0)';
    bookWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) translate(0,0) scale(1)';
  });

  /* ------------------------------------------------------
     4. ДРАКОН — редкое, далёкое появление (3.5 ТЗ)
     ------------------------------------------------------ */
  const dragonEl = document.getElementById('dragon-container');
  if (settings.animations) dragonEl.classList.add('flying');

  /* ------------------------------------------------------
     5. ОТКРЫТИЕ КНИГИ — 4.2/4.3 ТЗ
     0с закрыта → ~1с руны/эмблема разгораются → ~2с крышка
     раскрывается → ~2.4с вспышка света + золотая пыль → ~3с меню
     ------------------------------------------------------ */
  const bookEl = document.getElementById('book');
  const clickGlowEl = document.getElementById('book-click-glow');
  const dustEl = document.getElementById('book-dust');

  // немного пыли, плавное движение — "меньше эффектов, но качественнее" (ТЗ v2.0, п.4)
  function spawnDust() {
    dustEl.innerHTML = '';
    const n = settings.quality === 'low' ? 6 : settings.quality === 'medium' ? 10 : 16;
    for (let i = 0; i < n; i++) {
      const mote = document.createElement('div');
      mote.className = 'dust-mote';
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 110;
      mote.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      mote.style.setProperty('--dy', (Math.sin(angle) * dist - 35) + 'px');
      mote.style.left = (46 + Math.random()*8) + '%';
      mote.style.top = (40 + Math.random()*10) + '%';
      mote.style.animationDelay = (Math.random() * 0.4) + 's';
      dustEl.appendChild(mote);
      requestAnimationFrame(() => mote.classList.add('rise'));
    }
  }

  // последовательность: 0с закрыта → тонкий отклик на клик → руны/эмблема
  // разгораются → крышка откидывается по верхней кромке (см. .book-cover
  // в style.css) → лёгкая пыль у щели → книга уступает место меню.
  function open() {
    if (isOpened) return;
    isOpened = true;

    if (settings.animations) clickGlowEl.classList.add('pulse'); // тонкий, недорогой отклик — без вспышки на весь экран
    Audio_.play('click');

    bookEl.classList.add('pre-open'); // руны и эмблема начинают светиться, свет проступает по кромке крышки

    setTimeout(() => {
      scene.classList.add('opened-scene'); // крышка откидывается (CSS transition ~1.9s, ease-lid)
      Audio_.play('page');
    }, 1000);

    setTimeout(() => {
      if (settings.animations) spawnDust(); // пыль появляется, когда крышка уже приподнята
    }, 1550);
  }

  Freidra.book = { open };

  /* ------------------------------------------------------
     6. НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ
     ------------------------------------------------------ */
  function navigate(target) {
    scene.style.display = 'none';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + target).classList.add('active');
    Audio_.play('click');

    if (target === 'reader') Freidra.reader.init();
    if (target === 'world') Freidra.world.init();
    if (target === 'characters') Freidra.characters.init();
    if (target === 'gallery') Freidra.gallery.init();
    if (target === 'encyclopedia') Freidra.encyclopedia.init();
  }

  function backToBook() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    scene.style.display = 'flex';
  }

  Freidra.navigate = navigate;
  Freidra.backToBook = backToBook;

  document.querySelectorAll('.nav-item[data-target]').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.target));
  });
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', backToBook);
  });

  /* ------------------------------------------------------
     7. ИНИЦИАЛИЗАЦИЯ
     ------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    wireSettingsUI();
    applySettings();
  });

})();