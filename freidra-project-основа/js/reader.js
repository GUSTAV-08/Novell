/* ==========================================================
   Freidra.reader — читальня с асинхронной загрузкой глав
   ========================================================== */
window.Freidra = window.Freidra || {};

(function () {

  const VOLUME_TITLE = 'Том I';
  const BOOK_FILE = 'book.txt'; // Ваш единый файл со всеми 40 главами

  // Массив заполняется автоматически из book.txt
  let CHAPTERS = [];

  const FONT_CHOICES = ['serif', 'sans', 'bold', 'medieval'];
  const LH_CHOICES = ['compact', 'normal', 'relaxed'];

  let currentIndex = 0;
  let fontSize = 18;
  let fontFamily = 'serif';
  let lineHeight = 'normal';
  let initialized = false;
  let inReadingMode = false;

  // Автоматическая загрузка и нарезка вашего большого .txt файла
  async function loadBook() {
    try {
      const response = await fetch(BOOK_FILE);
      if (!response.ok) throw new Error('Не удалось загрузить book.txt');
      const rawText = await response.text();

      // Разбиваем текст по знаку '#' в начале строки
      const rawChapters = rawText.split(/^#\s+/m).filter(Boolean);

      CHAPTERS = rawChapters.map((block, i) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        const title = lines[0] || `Глава ${i + 1}`;
        const text = lines.slice(1);
        return { id: 'ch' + i, title, text };
      });

      buildToc();
    } catch (err) {
      console.error(err);
      const list = document.getElementById('toc-list');
      if (list) {
        list.innerHTML = '<div style="color:red; padding:10px;">Ошибка: положите book.txt рядом с index.html</div>';
      }
    }
  }

  function loadPosition() {
    try {
      const saved = JSON.parse(localStorage.getItem('freidra-reader') || 'null');
      if (saved && CHAPTERS.length > 0) {
        currentIndex = Math.min(saved.index || 0, CHAPTERS.length - 1);
        fontSize = saved.fontSize || 18;
        fontFamily = FONT_CHOICES.includes(saved.fontFamily) ? saved.fontFamily : 'serif';
        lineHeight = LH_CHOICES.includes(saved.lineHeight) ? saved.lineHeight : 'normal';
      }
    } catch (e) {}
  }

  function savePosition() {
    try { 
      localStorage.setItem('freidra-reader', JSON.stringify({ index: currentIndex, fontSize, fontFamily, lineHeight })); 
    } catch (e) {}
  }

  function buildToc() {
    document.getElementById('toc-volume-title').textContent = VOLUME_TITLE;
    const list = document.getElementById('toc-list');
    if (!list) return;
    list.innerHTML = '';
    CHAPTERS.forEach((ch, i) => {
      const item = document.createElement('div');
      item.className = 'toc-item';
      item.innerHTML = `<span>${ch.title}</span><span class="toc-arrow">›</span>`;
      item.onclick = () => enterReadingMode(i);
      list.appendChild(item);
    });
  }

  function showToc() {
    inReadingMode = false;
    document.getElementById('reader-toc').style.display = 'block';
    document.getElementById('reader-layout').style.display = 'none';
    document.getElementById('reader-header-title').textContent = 'Читальня';
    document.getElementById('reader-inner-back').style.display = 'none';
    document.getElementById('page-indicator').textContent = '';
  }

  function enterReadingMode(index) {
    inReadingMode = true;
    document.getElementById('reader-toc').style.display = 'none';
    document.getElementById('reader-layout').style.display = 'flex';
    document.getElementById('reader-header-title').textContent = VOLUME_TITLE;

    const backBtn = document.getElementById('reader-inner-back');
    backBtn.style.display = 'inline-flex';
    backBtn.onclick = showToc;

    applyTextSettingsUI();
    wireTextSettings();
    renderChapter(index, false);
  }

  function applyTextSettingsUI() {
    const sheet = document.getElementById('paper-sheet');
    if (!sheet) return;
    FONT_CHOICES.forEach(f => sheet.classList.remove('font-' + f));
    sheet.classList.add('font-' + fontFamily);
    LH_CHOICES.forEach(l => sheet.classList.remove('lh-' + l));
    sheet.classList.add('lh-' + lineHeight);
    sheet.style.setProperty('--reader-font-size', fontSize + 'px');

    const sizeVal = document.getElementById('font-size-value');
    if (sizeVal) sizeVal.textContent = fontSize + 'px';

    document.querySelectorAll('.font-choice').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === fontFamily);
    });
    document.querySelectorAll('.lh-choice').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lh === lineHeight);
    });
  }

  let textSettingsWired = false;
  function wireTextSettings() {
    if (textSettingsWired) return;
    textSettingsWired = true;
    document.querySelectorAll('.font-choice').forEach(btn => {
      btn.addEventListener('click', () => setFontFamily(btn.dataset.font));
    });
    document.querySelectorAll('.lh-choice').forEach(btn => {
      btn.addEventListener('click', () => setLineHeight(btn.dataset.lh));
    });
  }

  function setFontFamily(name) {
    if (!FONT_CHOICES.includes(name)) return;
    fontFamily = name;
    applyTextSettingsUI();
    savePosition();
  }

  function setLineHeight(name) {
    if (!LH_CHOICES.includes(name)) return;
    lineHeight = name;
    applyTextSettingsUI();
    savePosition();
  }

  // Отрисовка главы из массива, собранного из book.txt
  async function renderChapter(index, animate) {
    if (!CHAPTERS.length) return;
    currentIndex = Math.max(0, Math.min(index, CHAPTERS.length - 1));
    const ch = CHAPTERS[currentIndex];
    const sheet = document.getElementById('paper-sheet');

    function paint() {
      document.getElementById('chapter-title').textContent = ch.title;
      document.getElementById('chapter-text').innerHTML = ch.text.map(line => {
  if (line.trim().startsWith('<img')) {
    return `<div class="chapter-art-wrap">${line}</div>`;
  }
  return `<p>${line}</p>`;
}).join('');
      sheet.scrollTop = 0;
      sheet.classList.remove('flip-out');
      sheet.classList.add('flip-in');
      document.getElementById('page-indicator').textContent = (currentIndex + 1) + ' / ' + CHAPTERS.length;
    }

    if (animate && Freidra.settings && Freidra.settings.animations) {
      sheet.classList.add('flip-out');
      setTimeout(paint, 260);
    } else {
      paint();
    }
    savePosition();
  }

  function nextChapter() { if (currentIndex < CHAPTERS.length - 1) renderChapter(currentIndex + 1, true); }
  function prevChapter() { if (currentIndex > 0) renderChapter(currentIndex - 1, true); }

  function setFontSize(delta) {
    fontSize = Math.max(14, Math.min(30, fontSize + delta));
    const sheet = document.getElementById('paper-sheet');
    if (sheet) sheet.style.setProperty('--reader-font-size', fontSize + 'px');
    const sizeVal = document.getElementById('font-size-value');
    if (sizeVal) sizeVal.textContent = fontSize + 'px';
    savePosition();
  }

  function wireSwipe() {
    const sheet = document.getElementById('paper-sheet');
    if (!sheet) return;
    let startX = null;
    sheet.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive:true });
    sheet.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) { dx < 0 ? nextChapter() : prevChapter(); }
      startX = null;
    }, { passive:true });
  }

  async function init() {
    if (!initialized) {
      await loadBook(); // Сначала загружаем и нарезаем book.txt
      loadPosition();
      wireSwipe();
      initialized = true;
    }
    showToc();
  }

  Freidra.reader = { init, nextChapter, prevChapter, setFontSize, setFontFamily, setLineHeight };

})();
