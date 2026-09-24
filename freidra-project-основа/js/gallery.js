/* ==========================================================
   Freidra.gallery — галерея.
   ТЗ v2.0 п.10: плавное появление, ленивая загрузка,
   лайтбокс со стрелками вперёд/назад и подписями.
   Включает ключевые сцены и иллюстрации Тома I.
   ========================================================== */
window.Freidra = window.Freidra || {};

(function () {

  // Расширенный список сцен 1 тома с сохранением структуры
  const GALLERY_ITEMS = [
    { 
      caption: 'Обложка тома I • Иггдрасиль на закате', 
      src: 'assets/images/gallery/иггдрасиль.jpeg' 
    },
    { 
      caption: 'Концепт-арт • Последний варвар Драйнорд', 
      src: 'assets/images/gallery/draynord (2).jpeg' 
    },
    { 
      caption: 'Концепт-арт •  Драйнорд', 
      src: 'assets/images/gallery/draynord (3).jpeg' 
    },
    { 
      caption: 'Концепт-арт • Драйнорд', 
      src: 'assets/images/gallery/draynord.jpeg' 
    },
    { 
      caption: 'Kарта • Политическая карта Фрейдра', 
      src: 'assets/images/gallery/map-2.png' 
    },
    { 
      caption: 'Пролог • О Том, Кто Выжил (Возрождение)', 
      src: 'assets/images/gallery/' // Сюда можно добавить арт с пробуждением ГГ
    },
    { 
      caption: 'Глава 1 • Двойной боевой топор отца варвара', 
      src: 'assets/images/gallery/' /// Сюда можно добавить изображение первого оружия
    },
    { 
      caption: 'Сцена • Первый раз на море', 
      src: 'assets/images/gallery/sea1.jpeg' 
    },
    { 
      caption: 'Сцена • Рождение легенды: Драйнорд', 
      src: 'assets/images/gallery/family.jpeg' 
    },
    { 
      caption: 'Концепт-арт • Ковка гномьей секиры в пещерах', 
      src: 'assets/images/gallery/' 
    },
    { 
      caption: 'Локация • Крепость-комплекс и бастионы Империи', 
      src: 'assets/images/gallery/' 
    },
    { 
      caption: 'Сцена • Лагерь отряда Драйнорда у подножия холма', 
      src: 'assets/images/gallery/' 
    },
    { 
      caption: 'Персонаж • Эльвира — Избранная Иггдрасилем', 
      src: 'assets/images/gallery/elvira.jpeg' 
    },
    { 
      caption: 'Персонаж • Шион — Верная защитница Пепельного Короля', 
      src: 'assets/images/gallery/shion.jpeg' 
    },
    { 
      caption: 'Персонаж • Каэрн — Щит и верный друг Драйнорда', 
      src: 'assets/images/gallery/kaern (2).jpeg' 
    },
    { 
      caption: 'Финал Тома I • Иллюстрация — Триумф Героя Империи', 
      src: 'assets/images/gallery/' 
    }
  ];

  let initialized = false;
  let currentIndex = 0;

  function buildGrid() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    GALLERY_ITEMS.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.onclick = () => open(i);
      div.innerHTML = item.src
        ? `<img src="${item.src}" alt="${item.caption}" loading="lazy"><div class="gallery-caption">${item.caption}</div>`
        : `<div class="gallery-placeholder">${item.caption}<br><span style="opacity:.5">(добавь src в js/gallery.js)</span></div>`;
      grid.appendChild(div);
      setTimeout(() => div.classList.add('shown'), 70 * i);
    });
  }

  function render() {
    const item = GALLERY_ITEMS[currentIndex];
    document.getElementById('lightbox-img').src = item.src;
    document.getElementById('lightbox-caption').textContent = item.caption;
  }

  function open(i) {
    const item = GALLERY_ITEMS[i];
    if (!item.src) return;
    currentIndex = i;
    render();
    document.getElementById('lightbox').classList.add('active');
  }
  function close() { document.getElementById('lightbox').classList.remove('active'); }

  function withImages() { return GALLERY_ITEMS.filter((it,i)=>({...it,i})).filter(it => it.src); }

  function next(e) {
    if (e) e.stopPropagation();
    const withSrc = withImages();
    if (!withSrc.length) return;
    const pos = withSrc.findIndex(it => it.i === currentIndex);
    currentIndex = withSrc[(pos + 1) % withSrc.length].i;
    render();
  }
  function prev(e) {
    if (e) e.stopPropagation();
    const withSrc = withImages();
    if (!withSrc.length) return;
    const pos = withSrc.findIndex(it => it.i === currentIndex);
    currentIndex = withSrc[(pos - 1 + withSrc.length) % withSrc.length].i;
    render();
  }

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('active')) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') close();
  });

  function init() {
    if (!initialized) { buildGrid(); initialized = true; }
  }

  Freidra.gallery = { init, open, close, next, prev };

})();