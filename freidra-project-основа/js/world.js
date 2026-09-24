window.Freidra = window.Freidra || {};

(function () {
  const MAP_FOLDER = 'assets/map/';
  
  // 1. Пропиши здесь названия для своих 7 карт по порядку, как они идут
  const MAP_NAMES = [
    "Политическая карта",
    "Общая карта",
    "Физическая карта",
    "Карта провинций",
    "Простая карта",
    "Климатические зоны",
    "Военные сферы влияния"
  ];
  
  const TOTAL_MAPS = MAP_NAMES.length; // Автоматически будет 7
  let currentIndex = 0; // Начинаем с первой карты (индекс 0 в массиве)
  let checked = false;

  // Формирует путь вида: assets/map/map-1.png, assets/map/map-2.png и т.д.
  function getMapPath(index) {
    return `${MAP_FOLDER}map-${index + 1}.png`;
  }

  function showMissing() {
    const frame = document.getElementById('map-frame');
    if (frame) frame.classList.add('missing');
  }

  function updateMapDisplay() {
    const frame = document.getElementById('map-frame');
    const img = document.getElementById('azgaar-image');
    const label = document.getElementById('map-layer-name');
    
    if (frame && img) {
      frame.classList.remove('missing');
      img.src = getMapPath(currentIndex);
    }
    
    if (label) {
      label.textContent = MAP_NAMES[currentIndex];
    }
  }

  // Функция для перехода к следующей карте
  function nextMap() {
    // Увеличиваем индекс на 1. Если дошли до конца (7) — сбрасываем в 0
    currentIndex = (currentIndex + 1) % TOTAL_MAPS;
    updateMapDisplay();
  }

  function checkMapExists() {
    const img = document.getElementById('azgaar-image');
    if (!img) return;

    img.onerror = function() {
      showMissing();
    };

    updateMapDisplay();
  }

  function setupButton() {
    const btn = document.getElementById('map-next-btn');
    if (btn) {
      btn.addEventListener('click', nextMap);
    }
  }

  function init() {
    if (!checked) { 
      setupButton();
      checkMapExists(); 
      checked = true; 
    }
  }

  // Оставляем метод switchMap на случай, если захочешь переключить из другого скрипта
  function switchMap(index) {
    if (index >= 0 && index < TOTAL_MAPS) {
      currentIndex = index;
      updateMapDisplay();
    }
  }

  Freidra.world = { init, nextMap, switchMap };
})();