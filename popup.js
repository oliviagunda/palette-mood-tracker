const PALETTE = [
  { id: 'p1', color: '#e8b4a0', label: 'calm' },
  { id: 'p2', color: '#f2d06b', label: 'happy' },
  { id: 'p3', color: '#a8c5a0', label: 'good' },
  { id: 'p4', color: '#89b4cc', label: 'blue' },
  { id: 'p5', color: '#c4a8d4', label: 'mellow' },
  { id: 'p6', color: '#e07a5f', label: 'stressed' },
  { id: 'p7', color: '#81b29a', label: 'grateful' },
  { id: 'p8', color: '#f4a261', label: 'energized' },
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const DAYS_SHORT = ['3rd','4th','5th','6th','7th','8th','9th','10th'];

let state = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedColor: null,
  moodData: {}, // key: "YYYY-MM-DD" → { color, note }
  activeDayKey: null,
};

// Storage helpers
function storageGet(key) {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(key, data => resolve(data[key] || {}));
    } else {
      try { resolve(JSON.parse(localStorage.getItem(key) || '{}')); }
      catch { resolve({}); }
    }
  });
}

function storageSet(key, value) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ [key]: value });
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Date helpers
function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function isToday(year, month, day) {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

function isFuture(year, month, day) {
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(year, month, day);
  return d > t;
}

function formatDateNice(year, month, day) {
  const d = new Date(year, month, day);
  const suffix = ['th','st','nd','rd'];
  const v = day % 100;
  const s = suffix[(v - 20) % 10] || suffix[v] || suffix[0];
  return `${MONTHS[month].toLowerCase()} ${day}${s}`;
}

// Render swatches
function renderSwatches() {
  const container = document.getElementById('swatches');
  container.innerHTML = '';
  PALETTE.forEach(p => {
    const s = document.createElement('div');
    s.className = 'swatch' + (state.selectedColor === p.color ? ' active' : '');
    if (state.selectedColor === 'clear') {
      document.getElementById('clearColor').classList.add('active-clear');
    } else {
      document.getElementById('clearColor').classList.remove('active-clear');
    }
    s.style.background = p.color;
    s.title = p.label;
    s.dataset.label = p.label;
    s.addEventListener('click', () => {
      state.selectedColor = state.selectedColor === p.color ? null : p.color;
      renderSwatches();
    });
    container.appendChild(s);
  });
}

// Render calendar
function renderCalendar() {
  document.getElementById('monthName').textContent = MONTHS[state.currentMonth];
  document.getElementById('yearLabel').textContent = state.currentYear;

  const grid = document.getElementById('daysGrid');
  grid.innerHTML = '';

  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(state.currentYear, state.currentMonth, day);
    const entry = state.moodData[key];
    const future = isFuture(state.currentYear, state.currentMonth, day);
    const today = isToday(state.currentYear, state.currentMonth, day);

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (today) cell.classList.add('today');
    if (future) cell.classList.add('future');
    if (entry?.color) {
      cell.classList.add('has-color');
      cell.style.background = entry.color;
    }
    if (entry?.note?.trim()) cell.classList.add('has-note');

    cell.textContent = day;

    if (!future) {
      cell.addEventListener('click', () => handleDayClick(day, key, cell));
    }

    grid.appendChild(cell);
  }
}

function handleDayClick(day, key, cell) {
  if (state.selectedColor === 'clear') {
    if (state.moodData[key]) {
      delete state.moodData[key].color;
      if (!state.moodData[key].note) delete state.moodData[key];
      storageSet('moodData', state.moodData);
      renderCalendar();
    }
    return;
  }
  if (state.selectedColor) {
    if (!state.moodData[key]) state.moodData[key] = {};
    state.moodData[key].color = state.selectedColor;
    storageSet('moodData', state.moodData);
    renderCalendar();
  }
  openNotePanel(day, key);
}

function openNotePanel(day, key) {
  state.activeDayKey = key;
  const panel = document.getElementById('notePanel');
  const dateLabel = document.getElementById('noteDate');
  const input = document.getElementById('noteInput');
  const overlay = document.querySelector('.overlay');

  dateLabel.textContent = formatDateNice(state.currentYear, state.currentMonth, day);
  input.value = state.moodData[key]?.note || '';

  panel.classList.add('open');
  overlay.classList.add('active');
  setTimeout(() => input.focus(), 250);
}

function closeNotePanel() {
  const panel = document.getElementById('notePanel');
  const input = document.getElementById('noteInput');
  const overlay = document.querySelector('.overlay');

  if (state.activeDayKey) {
    if (!state.moodData[state.activeDayKey]) state.moodData[state.activeDayKey] = {};
    state.moodData[state.activeDayKey].note = input.value.trim();
    // Clean up empty entries
    if (!state.moodData[state.activeDayKey].color && !state.moodData[state.activeDayKey].note) {
      delete state.moodData[state.activeDayKey];
    }
    storageSet('moodData', state.moodData);
  }

  panel.classList.remove('open');
  overlay.classList.remove('active');
  state.activeDayKey = null;
  renderCalendar();
}

// Init
async function init() {
  // Add overlay div
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.querySelector('.app').appendChild(overlay);
  overlay.addEventListener('click', closeNotePanel);

  state.moodData = await storageGet('moodData');

  renderSwatches();
  renderCalendar();

  document.getElementById('prevMonth').addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    const now = new Date();
    if (state.currentYear < now.getFullYear() || 
        (state.currentYear === now.getFullYear() && state.currentMonth < now.getMonth())) {
      state.currentMonth++;
      if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
      renderCalendar();
    }
  });

  document.getElementById('clearColor').addEventListener('click', () => {
    state.selectedColor = state.selectedColor === 'clear' ? null : 'clear';
    renderSwatches();
  });

  document.getElementById('noteClose').addEventListener('click', closeNotePanel);

  // Save note on input change
  document.getElementById('noteInput').addEventListener('input', () => {
    if (state.activeDayKey) {
      if (!state.moodData[state.activeDayKey]) state.moodData[state.activeDayKey] = {};
      state.moodData[state.activeDayKey].note = document.getElementById('noteInput').value;
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
