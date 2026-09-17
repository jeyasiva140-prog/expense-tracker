// SmartExpense shared theme + storage helpers
(function () {
  const THEME_KEY = 'smartExpense_theme';

  function isDark() {
    return localStorage.getItem(THEME_KEY) === 'dark';
  }

  function applyTheme() {
    const dark = isDark();
    document.documentElement.classList.toggle('dark', dark);
    document.body?.classList.toggle('dark', dark);
    document.querySelectorAll('#themeBtn, #settingsThemeBtn').forEach(btn => {
      btn.textContent = dark ? '☀' : '☾';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }

  window.toggleTheme = function () {
    localStorage.setItem(THEME_KEY, isDark() ? 'light' : 'dark');
    applyTheme();
  };

  // Apply immediately and again after DOM exists.
  applyTheme();
  document.addEventListener('DOMContentLoaded', applyTheme);
  window.addEventListener('storage', function (event) {
    if (event.key === THEME_KEY) applyTheme();
  });
})();
