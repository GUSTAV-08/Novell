/* ==========================================================
   Freidra.characters — энциклопедия персонажей v3.0.
   Масштабируемая структура, поддержка 100+ персонажей.
   Включает динамические шкалы характеристик, перекрестные
   ссылки и глубокую категоризацию лора.
   ========================================================== */
window.Freidra = window.Freidra || {};

(function () {

  // База данных персонажей (Канон "Хроник Фрейдра")
  const CHARACTERS = [
    {
        id: "draynord",
        name: "Драйнорд",
        aliases: ["Герой Империи", "Потомок варваров Фрейдра"],
        role: "Главный герой",
        teaser: "Юноша с душой умиравшего на Земле человека, восставший против слабости и готовый жрать чудовищ, чтобы защитить близких.",
        portrait: "assets/images/characters/draynord.jpeg",
        portrait: "assets/images/characters/draynord (2).jpeg",
        quote: "Лучше сдохнуть с топором в руках, захлебываясь собственной кровью в бою, чем снова сдаться.",
        
        stats: {
            gender: "Мужчина",
            race: "Человек (Душа попаданца)",
            age: "16 лет",
            height: "190 см",
            state: "Фрейдр",
            faction: "Варвары Фрейдра / Империя эльфов",
            status: "Жив"
        },
        appearance: {
            hair: "Тёмно-синие, длинные.",
            eyes: "Глубокие синие.",
            body: "Массивное, генетически крепкое телосложение.",
            clothes: "Грубые походные одежды варваров; парадные шелка Империи."
        },
        combat: {
            weapon: "Двойной топор отца → Гномья секира → Меч-арматура",
            magic: "Сила Бездны, базовая шаманская магия, магия Иггдрасиля",
            abilities: "Смешанный прагматичный стиль, инстинктивное парирование, партизанская тактика, иммунитет к Системе."
        },
        personality: "Мрачный прагматик, дерзкий реалист с железной волей. Испытывает ужас перед слабостью. Скрывает преданность под маской воина.",
        biography: "В прошлой жизни умирал на больничной койке. Переродившись на Севере, поклялся выжить любой ценой. Пережил резню родной деревни культистами. Прошел путь от озлобленного подростка до признанного лидера авангарда и будущего Императора эльфов.",
        relations: [
            { id: "kaern", relation: "Лучший друг, названый брат" }
        ],
        power: {
            strength: 10, speed: 7, intelligence: 8, magic: 5, leadership: 10, charisma: 7
        },
        timeline: [
            "Том I • Глава 1: Пробуждение и гибель деревни",
            "Том II: Странствия и первые столкновения с Кэлдрисом",
            "Том III: Война против Селантхи на стороне эльфов",
            "Финал: Слияние Бездны и Иггдрасиля, коронация"
        ],
        trivia: [
            "Испытывает паническое отвращение к постельному режиму.",
            "Единственный в мире, кто полностью лишен интерфейса Системы.",
            "Терпеть не может аристократический этикет."
        ]
    },
    {
        id: "kaern",
        name: "Каэрн",
        aliases: ["Каэрн из клана Серебряного Шрама"],
        role: "Боец авангарда",
        teaser: "Верный названый брат Драйнорда из племени ликанов. Сочетает разрушительную ярость дикого хищника и чуткую душу.",
        portrait: "assets/images/characters/kaern.jpeg",
        quote: "Я не останусь позади. Ты можешь бросать вызов хоть богам, хоть Бездне, но твою спину прикрою я.",
        
        stats: {
            gender: "Мужчина",
            race: "Ликан (оборотень)",
            age: "15 лет",
            height: "189 см",
            state: "Фрейдр",
            faction: "Племя Ликанов / Отряд Драйнорда",
            status: "Жив"
        },
        appearance: {
            hair: "Серебристо-пепельный мех с чёрными полосами.",
            eyes: "Янтарно-жёлтые.",
            body: "Гибкое, поджарое, покрытое шрамами телосложение.",
            clothes: "Легкие кожаные доспехи, анатомические ремни."
        },
        combat: {
            weapon: "Природные когти → Гномьи наручи-кастеты с камнями маны",
            magic: "Энергетический резонанс, магия крови ликанов",
            abilities: "Аномально прочный скелет (кости не ломаются), идеальный ночной слух и нюх, высочайшая скорость."
        },
        personality: "Честный, прямолинейный, с обостренным чувством справедливости. Борется со скрытым комплексом неполноценности перед Драйнордом.",
        biography: "Сирота, выросший в племени ликанов вместе с Драйнордом. Изнурял себя жесточайшими тренировками, чтобы стать надежным щитом для названого брата. Стал главным офицером штурмового авангарда.",
        relations: [
            { id: "draynord", relation: "Лучший друг, брат по духу" }
        ],
        power: {
            strength: 7, speed: 10, intelligence: 7, magic: 4, leadership: 6, charisma: 8
        },
        timeline: [
            "Том I • Глава 1: Побег из горящей деревни, клятва",
            "Том II: Пробуждение мутации, получение наручей",
            "Том III: Руководство разведкой против Селантхи",
            "Финал: Глава военного авангарда Империи"
        ],
        trivia: [
            "Единственный, с кем Драйнорд может снять маску и выпить вина.",
            "Бесится из-за эмоциональной тупости ГГ в отношениях.",
            "Обладает тонкой эмпатией — всегда чувствует боль Драйнорда."
        ]
    }
  ];

  let initialized = false;

  // Вспомогательная: Отрисовка портрета
  function portraitHTML(c) {
    if (c.portrait) return `<img src="${c.portrait}" alt="${c.name}" loading="lazy">`;
    return `<div class="placeholder-portrait">${c.name.charAt(0)}</div>`;
  }

  // Вспомогательная: Отрисовка шкалы характеристик
  function renderPowerBar(value) {
    const val = Math.min(Math.max(value || 0, 0), 10);
    return '█'.repeat(val) + '░'.repeat(10 - val);
  }

  // Вспомогательная: Разделитель секций
  function renderDivider(title) {
    return `
      <div class="char-section-divider">
        ━━━━━━━━━━━━━━━━━━━━━━<br>
        <span class="divider-title">${title.toUpperCase()}</span><br>
        ━━━━━━━━━━━━━━━━━━━━━━
      </div>
    `;
  }

  // Построение сетки карточек для общего меню
  function buildGrid() {
    const grid = document.getElementById('char-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    CHARACTERS.forEach(c => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.onclick = () => open(c.id);
      card.innerHTML = `
        <div class="char-portrait">${portraitHTML(c)}</div>
        <div class="char-info">
          <div class="char-name">${c.name}</div>
          ${c.role ? `<div class="char-role">${c.role}</div>` : ''}
          ${c.teaser ? `<div class="char-teaser">${c.teaser}</div>` : ''}
        </div>`;
      grid.appendChild(card);
    });
  }

  // Открытие полной энциклопедии персонажа
  function open(id) {
    const c = CHARACTERS.find(x => x.id === id);
    if (!c) return;

    // 1. Шапка (Имя, Роль, Цитата)
    let html = `
      <div class="char-header-block">
        <div class="char-header-border">==================================================</div>
        <h1 class="char-h1-name">${c.name.toUpperCase()}</h1>
        <div class="char-h2-role">${c.role || ''}</div>
        ${c.quote ? `<div class="char-quote">"${c.quote}"</div>` : ''}
        <div class="char-header-border">==================================================</div>
      </div>
    `;

    // 2. Портрет слева, Статы справа
    html += `
      <div class="char-top-split">
        <div class="char-top-left">${portraitHTML(c)}</div>
        <div class="char-top-right">
    `;
    
    const statLabels = { gender: 'Пол', age: 'Возраст', height: 'Рост', race: 'Раса', status: 'Статус', faction: 'Фракция' };
    if (c.stats) {
        html += `<ul class="char-stats-list">`;
        for (let [key, label] of Object.entries(statLabels)) {
            if (c.stats[key]) html += `<li><strong>${label}:</strong> ${c.stats[key]}</li>`;
        }
        html += `</ul>`;
    }
    html += `</div></div>`; // Конец char-top-split

    // 3. Биография и Личность
    if (c.biography) {
        html += renderDivider('Биография');
        html += `<p class="char-text">${c.biography}</p>`;
    }
    if (c.personality) {
        html += renderDivider('Личность');
        html += `<p class="char-text">${c.personality}</p>`;
    }

    // 4. Боевой профиль
    if (c.combat) {
        html += renderDivider('Боевой Профиль');
        html += `<ul class="char-details-list">`;
        if (c.combat.weapon) html += `<li><strong>Оружие:</strong> ${c.combat.weapon}</li>`;
        if (c.combat.magic) html += `<li><strong>Магия:</strong> ${c.combat.magic}</li>`;
        if (c.combat.abilities) html += `<li><strong>Навыки:</strong> ${c.combat.abilities}</li>`;
        html += `</ul>`;
    }

    // 5. Внешность
    if (c.appearance) {
        html += renderDivider('Внешность');
        html += `<ul class="char-details-list">`;
        if (c.appearance.hair) html += `<li><strong>Волосы:</strong> ${c.appearance.hair}</li>`;
        if (c.appearance.eyes) html += `<li><strong>Глаза:</strong> ${c.appearance.eyes}</li>`;
        if (c.appearance.body) html += `<li><strong>Телосложение:</strong> ${c.appearance.body}</li>`;
        if (c.appearance.clothes) html += `<li><strong>Одежда:</strong> ${c.appearance.clothes}</li>`;
        html += `</ul>`;
    }

    // 6. Характеристики (Шкалы)
    if (c.power) {
        html += renderDivider('Характеристики');
        const powerLabels = { strength: 'Сила', speed: 'Скорость', magic: 'Магия', intelligence: 'Интеллект', leadership: 'Лидерство' };
        html += `<div class="char-power-bars">`;
        for (let [key, label] of Object.entries(powerLabels)) {
            if (c.power[key] !== undefined) {
                html += `
                  <div class="power-row">
                    <span class="power-label">${label.padEnd(12, ' ')}</span>
                    <span class="power-bar">${renderPowerBar(c.power[key])}</span>
                  </div>
                `;
            }
        }
        html += `</div>`;
    }

    // 7. Связанные персонажи (Кликабельные)
    if (c.relations && c.relations.length > 0) {
        html += renderDivider('Связанные персонажи');
        html += `<div class="char-relations-grid">`;
        c.relations.forEach(rel => {
            const relChar = CHARACTERS.find(x => x.id === rel.id);
            if (relChar) {
                html += `
                  <div class="relation-card" onclick="Freidra.characters.open('${relChar.id}')">
                    <div class="relation-avatar">${portraitHTML(relChar)}</div>
                    <div class="relation-info">
                      <div class="relation-name">${relChar.name}</div>
                      <div class="relation-desc">${rel.relation}</div>
                    </div>
                  </div>
                `;
            }
        });
        html += `</div>`;
    }

    // 8. Хронология
    if (c.timeline && c.timeline.length > 0) {
        html += renderDivider('Хронология');
        html += `<ul class="char-timeline-list">`;
        c.timeline.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `</ul>`;
    }

    // 9. Интересные факты
    if (c.trivia && c.trivia.length > 0) {
        html += renderDivider('Интересные Факты');
        html += `<ul class="char-trivia-list">`;
        c.trivia.forEach(item => {
            html += `<li>• ${item}</li>`;
        });
        html += `</ul>`;
    }

    // Вставка в DOM
    const innerContainer = document.getElementById('char-profile-inner');
    if (innerContainer) {
        innerContainer.innerHTML = html;
        // Скроллим наверх при открытии или переходе по ссылке
        innerContainer.scrollTop = 0; 
    }
    
    document.getElementById('char-overlay').classList.add('active');
  }

  function close() { 
    document.getElementById('char-overlay').classList.remove('active'); 
  }

  function init() {
    if (!initialized) { 
        buildGrid(); 
        initialized = true; 
    }
  }

  // Экспорт API
  Freidra.characters = { init, open, close };

})();