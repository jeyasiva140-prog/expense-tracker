(function () {
    "use strict";

    const THEME_KEY = "smartExpense_theme";

    function isDark() {
        return localStorage.getItem(THEME_KEY) === "dark";
    }

    function applyTheme() {
        const dark = isDark();
        const root = document.documentElement;

        root.classList.toggle("dark", dark);
        root.setAttribute("data-theme", dark ? "dark" : "light");

        document.querySelectorAll("#themeBtn, #settingsThemeBtn").forEach((button) => {
            button.textContent = dark ? "☀" : "☾";
            button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
            button.title = dark ? "Switch to light mode" : "Switch to dark mode";
        });
    }

    window.toggleTheme = function () {
        localStorage.setItem(THEME_KEY, isDark() ? "light" : "dark");
        applyTheme();
    };

    applyTheme();
    document.addEventListener("DOMContentLoaded", applyTheme);
    window.addEventListener("pageshow", applyTheme);
    window.addEventListener("storage", function (event) {
        if (event.key === THEME_KEY) applyTheme();
    });
})();
