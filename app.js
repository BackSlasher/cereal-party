const CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxRgNlZbghH5dD0jMe3fG7jrsdUkvJUQYhY2KT7LjAErQb1RHbe-Xs8WQr9HB0YgpwmQQ/exec',

  DATES: [
    '2026-06-04',
    '2026-06-05',
    '2026-06-06',
    '2026-06-11',
    '2026-06-12',
    '2026-06-13',
  ],

  MAX_CEREALS: 2,

  // Event mode - set to show finalized event instead of voting
  EVENT: {
    finalized: true,
    date: '2026-06-12',
    time: '19:00',
    cereals: ['reeses-puffs', 'french-toast-crunch', 'cinnamon-toast', 'count-chocula'],
  },
};

const CEREALS = [
  { id: 'lucky-charms', name: 'Lucky Charms', desc: 'Oats + colorful marshmallows', img: 'images/lucky-charms.jpg' },
  { id: 'capn-crunch', name: "Cap'n Crunch", desc: 'Classic sweet crunch', img: 'images/capn-crunch.jpg' },
  { id: 'capn-crunch-berries', name: 'Crunch Berries', desc: 'With fruity berry balls', img: 'images/capn-crunch-berries.jpg' },
  { id: 'capn-crunch-pb', name: "Cap'n Crunch PB", desc: 'Peanut butter flavor', img: 'images/capn-crunch-pb.jpg' },
  { id: 'reeses-puffs', name: "Reese's Puffs", desc: 'Chocolate + peanut butter', img: 'images/reeses-puffs.jpg' },
  { id: 'french-toast-crunch', name: 'French Toast Crunch', desc: 'Tiny toast shapes!', img: 'images/french-toast-crunch.jpg' },
  { id: 'fruity-pebbles', name: 'Fruity Pebbles', desc: 'Colorful fruity flakes', img: 'images/fruity-pebbles.jpg' },
  { id: 'cocoa-pebbles', name: 'Cocoa Pebbles', desc: 'Chocolate rice flakes', img: 'images/cocoa-pebbles.png' },
  { id: 'froot-loops', name: 'Froot Loops', desc: 'Fruity colorful rings', img: 'images/froot-loops.png' },
  { id: 'count-chocula', name: 'Count Chocula', desc: 'Chocolate + marshmallows', img: 'images/count-chocula.png' },
  { id: 'cinnamon-toast', name: 'Cinnamon Toast Crunch', desc: 'Sweet cinnamon squares', img: 'images/cinnamon-toast.jpg' },
  { id: 'apple-jacks', name: 'Apple Jacks', desc: 'Apple cinnamon rings', img: 'images/apple-jacks.jpg' },
  { id: 'honey-smacks', name: 'Honey Smacks', desc: 'Honey puffed wheat', img: 'images/honey-smacks.jpg' },
  { id: 'cookie-crisp', name: 'Cookie Crisp', desc: 'Mini chocolate chip cookies', img: 'images/cookie-crisp.jpg' },
  { id: 'golden-grahams', name: 'Golden Grahams', desc: 'Golden graham squares', img: 'images/golden-grahams.jpg' },
];

const app = {
  state: {
    name: '',
    datesHigh: [],
    datesLow: [],
    cereals: [],
    isUpdate: false,
  },

  init() {
    if (CONFIG.EVENT?.finalized) {
      this.renderFinalists();
      return;
    }

    // Voting mode
    document.getElementById('step-event').classList.remove('active');
    document.getElementById('step-name').classList.add('active');

    this.renderDates();
    this.renderCereals();

    // Check for name in URL
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name) {
      document.getElementById('name-input').value = name;
      this.checkNameForStats(name);
    }
  },

  renderFinalists() {
    const grid = document.getElementById('finalist-cereals');
    const finalists = CONFIG.EVENT.cereals
      .map(id => CEREALS.find(c => c.id === id))
      .filter(Boolean);

    grid.innerHTML = finalists.map(cereal => `
      <div class="finalist-card">
        <img src="${cereal.img}" alt="${cereal.name}">
        <div class="finalist-name">${cereal.name}</div>
      </div>
    `).join('');
  },

  downloadICS() {
    const event = CONFIG.EVENT;
    const date = event.date.replace(/-/g, '');
    const startTime = event.time.replace(':', '') + '00';
    const endTime = '2200' + '00'; // Assume 3 hours

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cereal Party//EN
BEGIN:VEVENT
DTSTART:${date}T${startTime}
DTEND:${date}T${endTime}
SUMMARY:Fancy Cereal Party 🥣
DESCRIPTION:Breakfast cereals: ${CONFIG.EVENT.cereals.map(id => CEREALS.find(c => c.id === id)?.name).join(', ')}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cereal-party.ics';
    a.click();
    URL.revokeObjectURL(url);
  },

  renderDates() {
    const grid = document.getElementById('dates-grid');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    grid.innerHTML = CONFIG.DATES.map(dateStr => {
      const date = new Date(dateStr);
      const dayName = dayNames[date.getDay()];
      const dayNum = date.getDate();
      const month = monthNames[date.getMonth()];

      return `
        <div class="date-card" data-date="${dateStr}" onclick="app.toggleDate('${dateStr}')">
          <div class="day-name">${dayName}</div>
          <div class="day-num">${month} ${dayNum}</div>
          <div class="date-status">No</div>
        </div>
      `;
    }).join('');
  },

  renderCereals() {
    const grid = document.getElementById('cereals-grid');

    grid.innerHTML = CEREALS.map(cereal => `
      <div class="cereal-card" data-id="${cereal.id}" onclick="app.toggleCereal('${cereal.id}')">
        <div class="cereal-img-wrap">
          <img class="cereal-img" src="${cereal.img}" alt="${cereal.name}">
          <button class="zoom-btn" onclick="event.stopPropagation(); app.openLightbox('${cereal.img}')" title="Zoom">🔍</button>
        </div>
        <div class="cereal-name">${cereal.name}</div>
        <div class="cereal-desc">${cereal.desc}</div>
      </div>
    `).join('');
  },

  async checkName() {
    const name = document.getElementById('name-input').value.trim();
    if (!name) {
      alert('Please enter your name');
      return;
    }

    this.state.name = name;

    const btn = document.getElementById('name-btn');
    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'lookup', name })
      });
      const data = await response.json();

      if (data.found) {
        this.state.isUpdate = true;
        this.prefill(data);
        document.getElementById('welcome-back').classList.remove('hidden');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }

    btn.disabled = false;
    btn.textContent = 'Continue';

    // Update URL with name
    const url = new URL(window.location);
    url.searchParams.set('name', name);
    window.history.replaceState({}, '', url);

    document.getElementById('display-name').textContent = name;
    document.getElementById('step-name').classList.remove('active');
    document.getElementById('step-form').classList.add('active');
  },

  async checkNameForStats(name) {
    this.state.name = name;

    // Show loading state immediately
    document.getElementById('stats-name').textContent = name;
    document.getElementById('thanks-new').classList.add('hidden');
    document.getElementById('thanks-returning').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('stats-dates').innerHTML = '<p>Loading...</p>';
    document.getElementById('stats-cereals').innerHTML = '';
    document.getElementById('stats-drinks').innerHTML = '';
    document.getElementById('step-name').classList.remove('active');
    document.getElementById('step-thanks').classList.add('active');

    try {
      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'lookup', name, includeStats: true })
      });
      const data = await response.json();

      if (data.found) {
        // User exists - save for edit, show stats
        this.state.isUpdate = true;
        this.pendingPrefill = data;
        if (data.stats) {
          this.renderStats(data.stats);
        }
      } else {
        // New user - go to form
        document.getElementById('thanks-returning').classList.add('hidden');
        document.getElementById('thanks-new').classList.remove('hidden');
        document.querySelector('#thanks-new h2').textContent = `Hi ${name}!`;
        document.querySelector('#thanks-new p').textContent = 'Fill out the form to join';
        document.getElementById('step-thanks').classList.remove('active');
        document.getElementById('step-form').classList.add('active');
        document.getElementById('display-name').textContent = name;

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('name', name);
        window.history.replaceState({}, '', url);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  },

  goToEdit() {
    // Prefill form with saved data
    if (this.pendingPrefill) {
      this.prefill(this.pendingPrefill);
    }
    document.getElementById('display-name').textContent = this.state.name;
    document.getElementById('welcome-back').classList.remove('hidden');
    document.getElementById('step-thanks').classList.remove('active');
    document.getElementById('step-form').classList.add('active');
  },

  goBack() {
    // Reset state
    this.state = {
      name: '',
      datesHigh: [],
      datesLow: [],
      cereals: [],
      isUpdate: false,
    };

    // Clear URL
    const url = new URL(window.location);
    url.searchParams.delete('name');
    window.history.replaceState({}, '', url);

    // Reset UI
    document.querySelectorAll('.date-card').forEach(card => {
      card.classList.remove('high', 'low');
      card.querySelector('.date-status').textContent = 'No';
    });
    document.querySelectorAll('.cereal-card').forEach(card => {
      card.classList.remove('selected', 'disabled');
    });
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.getElementById('cereal-count').textContent = 'Selected: 0/2';
    document.getElementById('welcome-back').classList.add('hidden');
    document.getElementById('name-input').value = '';

    // Switch step
    document.getElementById('step-form').classList.remove('active');
    document.getElementById('step-name').classList.add('active');
  },

  prefill(data) {
    // Dates - High priority
    if (data.datesHigh) {
      const dates = data.datesHigh.split(', ').map(d => d.trim());
      dates.forEach(dateStr => {
        if (CONFIG.DATES.includes(dateStr)) {
          this.state.datesHigh.push(dateStr);
          const card = document.querySelector(`.date-card[data-date="${dateStr}"]`);
          if (card) {
            card.classList.add('high');
            card.querySelector('.date-status').textContent = 'Yes!';
          }
        }
      });
    }

    // Dates - Low priority
    if (data.datesLow) {
      const dates = data.datesLow.split(', ').map(d => d.trim());
      dates.forEach(dateStr => {
        if (CONFIG.DATES.includes(dateStr)) {
          this.state.datesLow.push(dateStr);
          const card = document.querySelector(`.date-card[data-date="${dateStr}"]`);
          if (card) {
            card.classList.add('low');
            card.querySelector('.date-status').textContent = 'If needed';
          }
        }
      });
    }

    // Cereals
    if (data.cereals) {
      const cereals = data.cereals.split(', ').map(c => c.trim());
      cereals.forEach(id => {
        if (this.state.cereals.length < CONFIG.MAX_CEREALS) {
          const card = document.querySelector(`.cereal-card[data-id="${id}"]`);
          if (card) {
            this.state.cereals.push(id);
            card.classList.add('selected');
          }
        }
      });
      this.updateCerealCount();
    }

    // Milk
    if (data.milk) {
      const radio = document.querySelector(`input[name="milk"][value="${data.milk}"]`);
      if (radio) radio.checked = true;
    }

    // Juice
    if (data.juice) {
      const radio = document.querySelector(`input[name="juice"][value="${data.juice}"]`);
      if (radio) radio.checked = true;
    }
  },

  toggleDate(dateStr) {
    const card = document.querySelector(`.date-card[data-date="${dateStr}"]`);
    const status = card.querySelector('.date-status');
    const highIdx = this.state.datesHigh.indexOf(dateStr);
    const lowIdx = this.state.datesLow.indexOf(dateStr);

    if (highIdx === -1 && lowIdx === -1) {
      // unselected → high
      this.state.datesHigh.push(dateStr);
      card.classList.add('high');
      card.classList.remove('low');
      status.textContent = 'Yes!';
    } else if (highIdx !== -1) {
      // high → low
      this.state.datesHigh.splice(highIdx, 1);
      this.state.datesLow.push(dateStr);
      card.classList.remove('high');
      card.classList.add('low');
      status.textContent = 'If needed';
    } else {
      // low → unselected
      this.state.datesLow.splice(lowIdx, 1);
      card.classList.remove('low');
      status.textContent = 'No';
    }
  },

  toggleCereal(id) {
    const card = document.querySelector(`.cereal-card[data-id="${id}"]`);
    if (card.classList.contains('disabled')) return;

    const idx = this.state.cereals.indexOf(id);

    if (idx === -1) {
      if (this.state.cereals.length >= CONFIG.MAX_CEREALS) return;
      this.state.cereals.push(id);
      card.classList.add('selected');
    } else {
      this.state.cereals.splice(idx, 1);
      card.classList.remove('selected');
    }

    this.updateCerealCount();
  },

  updateCerealCount() {
    const count = this.state.cereals.length;
    document.getElementById('cereal-count').textContent = `Selected: ${count}/${CONFIG.MAX_CEREALS}`;

    document.querySelectorAll('.cereal-card').forEach(card => {
      const id = card.dataset.id;
      if (count >= CONFIG.MAX_CEREALS && !this.state.cereals.includes(id)) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }
    });
  },

  async submit(event) {
    event.preventDefault();

    const form = document.getElementById('party-form');
    const formData = new FormData(form);

    const milk = formData.get('milk');
    const juice = formData.get('juice');

    // Validation
    if (this.state.datesHigh.length === 0 && this.state.datesLow.length === 0) {
      alert('Please select at least one date');
      return false;
    }
    if (this.state.cereals.length === 0) {
      alert('Please select at least one cereal');
      return false;
    }
    if (!milk) {
      alert('Please select a milk option');
      return false;
    }
    if (!juice) {
      alert('Please select a juice option');
      return false;
    }

    const data = {
      name: this.state.name,
      datesHigh: this.state.datesHigh,
      datesLow: this.state.datesLow,
      cereals: this.state.cereals,
      milk,
      juice,
      isUpdate: this.state.isUpdate,
    };

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Submit error:', err);
    }

    document.getElementById('step-form').classList.remove('active');
    document.getElementById('step-thanks').classList.add('active');

    // Show stats loading state immediately
    document.getElementById('stats').classList.remove('hidden');
    document.getElementById('stats-dates').innerHTML = '<p>Loading results...</p>';
    document.getElementById('stats-cereals').innerHTML = '';
    document.getElementById('stats-drinks').innerHTML = '';

    // Load stats
    this.loadStats();

    return false;
  },

  async loadStats() {
    try {
      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'stats' })
      });
      const data = await response.json();
      if (data.stats) {
        this.renderStats(data.stats);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  },

  renderStats(stats) {
    const container = document.getElementById('stats');
    const total = stats.total || 1;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Dates - calendar-style heatmap
    const datesHtml = `<h4>📅 Dates</h4><div class="date-heatmap">` + CONFIG.DATES.map(d => {
      const date = new Date(d);
      const dayName = dayNames[date.getDay()];
      const dayNum = date.getDate();
      const high = stats.datesHigh?.[d] || 0;
      const low = stats.datesLow?.[d] || 0;
      const totalVotes = high + low;
      const intensity = Math.min((high + low * 0.5) / total, 1);
      const hue = high > low ? '260' : '280'; // More purple if more "Yes!"
      const bg = totalVotes > 0
        ? `hsla(${hue}, 70%, 60%, ${0.3 + intensity * 0.7})`
        : '#f5f5f5';
      return `
        <div class="heatmap-cell" style="background: ${bg}">
          <div class="heatmap-day">${dayName}</div>
          <div class="heatmap-num">${dayNum}</div>
          ${totalVotes > 0 ? `<div class="heatmap-votes">${high}${low ? '+' + low : ''}</div>` : ''}
        </div>
      `;
    }).join('') + '</div>';
    document.getElementById('stats-dates').innerHTML = datesHtml;

    // Cereals - only show those with votes, sorted
    const cerealCounts = CEREALS.map(c => ({
      ...c,
      count: stats.cereals?.[c.id] || 0
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    const maxCereal = cerealCounts[0]?.count || 1;
    const cerealsHtml = cerealCounts.length > 0
      ? `<h4>🥣 Top Cereals</h4><div class="cereal-ranks">` + cerealCounts.map((c, i) => {
        const width = (c.count / maxCereal) * 100;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `
          <div class="rank-row">
            <span class="rank-medal">${medal}</span>
            <span class="rank-name">${c.name}</span>
            <div class="rank-bar" style="width: ${width}%"></div>
            <span class="rank-count">${c.count}</span>
          </div>
        `;
      }).join('') + '</div>'
      : '';
    document.getElementById('stats-cereals').innerHTML = cerealsHtml;

    // Drinks - compact pills
    const milkLabels = { regular: '🥛 Regular', 'lactose-free': '🥛 LF', almond: '🌰 Almond', oat: '🌾 Oat', none: '🚫' };
    const juiceLabels = { orange: '🍊', apple: '🍎', none: '🚫' };

    const milkPills = Object.entries(stats.milk || {})
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `<span class="pill">${milkLabels[type] || type} <b>${count}</b></span>`)
      .join('');

    const juicePills = Object.entries(stats.juice || {})
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `<span class="pill">${juiceLabels[type] || type} <b>${count}</b></span>`)
      .join('');

    const drinksHtml = (milkPills || juicePills) ? `
      <h4>🥤 Drinks</h4>
      <div class="pills-row">
        ${milkPills}
        <span class="pill-divider">|</span>
        ${juicePills}
      </div>
    ` : '';
    document.getElementById('stats-drinks').innerHTML = drinksHtml;

    container.classList.remove('hidden');
  },

  openLightbox(imgSrc) {
    document.getElementById('lightbox-img').src = imgSrc;
    document.getElementById('lightbox').classList.add('active');
  },

  closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
  },
};

document.addEventListener('DOMContentLoaded', () => app.init());
