/* GenAI Interview Prep — focused practice interactions */
(function () {
  'use strict';

  var STORE_KEY = 'genai-interview-prep-progress-v1';
  var SCENARIOS = [
    '01-enterprise-knowledge-assistant.html',
    '02-customer-support-agent.html',
    '03-secure-text-to-sql.html',
    '04-ats-recruiter-copilot.html',
    '05-multilingual-voice-assistant.html',
    '06-invoice-document-workflow.html',
    '07-high-scale-shopping-assistant.html',
    '08-regulated-financial-research.html'
  ];

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function writeProgress(value) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(value)); }
    catch (_) { /* Private browsing can disable storage. */ }
  }

  function isDone(key) { return !!readProgress()[key]; }

  function updateCompletionUI() {
    var progress = readProgress();
    document.querySelectorAll('[data-prep-complete]').forEach(function (button) {
      var key = button.getAttribute('data-key');
      var done = !!progress[key];
      button.classList.toggle('is-complete', done);
      button.setAttribute('aria-pressed', done ? 'true' : 'false');
      button.textContent = done ? 'Completed ✓' : (key && key.indexOf('scenario-') === 0 ? 'Mark scenario complete' : 'Mark topic complete');
    });

    document.querySelectorAll('[data-progress-key]').forEach(function (card) {
      var done = !!progress[card.getAttribute('data-progress-key')];
      card.classList.toggle('is-complete', done);
      var badge = card.querySelector('.prep-done-badge');
      if (done && !badge) {
        badge = document.createElement('span');
        badge.className = 'prep-done-badge';
        badge.textContent = 'Ready ✓';
        card.querySelector('div').appendChild(badge);
      } else if (!done && badge) {
        badge.remove();
      }
    });

    document.querySelectorAll('[data-prep-progress]').forEach(function (orb) {
      var type = orb.getAttribute('data-prep-progress');
      var prefix = type === 'scenario' ? 'scenario-' : 'topic-';
      var total = 8;
      var complete = Object.keys(progress).filter(function (key) { return key.indexOf(prefix) === 0 && progress[key]; }).length;
      var pct = Math.round((complete / total) * 100);
      var strong = orb.querySelector('strong');
      if (strong) strong.textContent = pct + '%';
      orb.style.setProperty('--prep-progress', pct + '%');
      orb.setAttribute('aria-label', complete + ' of ' + total + ' completed');
    });
  }

  function setupCompletion() {
    document.querySelectorAll('[data-prep-complete]').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-key');
        var progress = readProgress();
        progress[key] = !progress[key];
        writeProgress(progress);
        updateCompletionUI();
        button.animate([
          { transform: 'scale(.96)' },
          { transform: 'scale(1.03)' },
          { transform: 'scale(1)' }
        ], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
      });
    });
    updateCompletionUI();
  }

  function setupQuestionFilter() {
    var input = document.querySelector('[data-question-filter]');
    if (!input) return;
    var questions = Array.prototype.slice.call(document.querySelectorAll('.prep-question'));
    var count = document.querySelector('[data-question-count]');

    function filter() {
      var query = input.value.trim().toLowerCase();
      var shown = 0;
      questions.forEach(function (item) {
        var haystack = (item.getAttribute('data-question') || '') + ' ' + (item.getAttribute('data-tags') || '') + ' ' + item.textContent.toLowerCase();
        var visible = !query || haystack.indexOf(query) !== -1;
        item.hidden = !visible;
        if (visible) shown += 1;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' question' : ' questions');
    }
    input.addEventListener('input', filter);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  function setupExpandAnswers() {
    var button = document.querySelector('[data-expand-answers]');
    if (!button) return;
    var open = false;
    button.addEventListener('click', function () {
      open = !open;
      document.querySelectorAll('.prep-question:not([hidden])').forEach(function (item) { item.open = open; });
      button.textContent = open ? 'Close all' : 'Open all';
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.querySelectorAll('.prep-question').forEach(function (item) {
      item.addEventListener('toggle', function () {
        var icon = item.querySelector('.prep-chevron');
        if (icon) icon.textContent = item.open ? '−' : '＋';
      });
    });
  }

  function setupRandomScenario() {
    var button = document.querySelector('[data-random-scenario]');
    if (!button) return;
    button.addEventListener('click', function () {
      var target = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      window.location.href = target;
    });
  }

  function setupTimer() {
    var start = document.querySelector('[data-start-timer]');
    var panel = document.querySelector('[data-scenario-timer]');
    if (!start || !panel) return;
    var display = panel.querySelector('[data-timer-display]');
    var pause = panel.querySelector('[data-pause-timer]');
    var reset = panel.querySelector('[data-reset-timer]');
    var initial = Number(start.getAttribute('data-start-timer') || 20) * 60;
    var remaining = initial;
    var interval = null;

    function render() {
      var minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
      var seconds = (remaining % 60).toString().padStart(2, '0');
      display.textContent = minutes + ':' + seconds;
      panel.classList.toggle('is-ending', remaining > 0 && remaining <= 120);
      if (remaining === 0) {
        stop();
        pause.textContent = 'Time';
        panel.classList.add('is-finished');
      }
    }
    function stop() { if (interval) clearInterval(interval); interval = null; }
    function run() {
      stop();
      interval = setInterval(function () {
        remaining = Math.max(0, remaining - 1);
        render();
      }, 1000);
      pause.textContent = 'Pause';
      panel.classList.remove('is-finished');
    }

    start.addEventListener('click', function () {
      panel.hidden = false;
      if (remaining === 0) remaining = initial;
      render();
      run();
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    pause.addEventListener('click', function () {
      if (remaining === 0) return;
      if (interval) { stop(); pause.textContent = 'Resume'; }
      else run();
    });
    reset.addEventListener('click', function () {
      stop(); remaining = initial; render(); pause.textContent = 'Start';
    });
    render();
  }

  function setupKeyboardQuestionNav() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.prep-question'));
    if (!items.length) return;
    items.forEach(function (item, index) {
      var summary = item.querySelector('summary');
      summary.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        var direction = event.key === 'ArrowDown' ? 1 : -1;
        var target = items[(index + direction + items.length) % items.length];
        target.querySelector('summary').focus();
      });
    });
  }

  function init() {
    setupCompletion();
    setupQuestionFilter();
    setupExpandAnswers();
    setupRandomScenario();
    setupTimer();
    setupKeyboardQuestionNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
