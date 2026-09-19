(function () {
    const THEME_KEY = "smartExpense_theme";

    function isDark() {
        return localStorage.getItem(THEME_KEY) === "dark";
    }

    function applyTheme() {
        const dark = isDark();

        document.documentElement.classList.toggle("dark", dark);

        if (document.body) {
            document.body.classList.toggle("dark", dark);
        }

        document
            .querySelectorAll("#themeBtn, #settingsThemeBtn")
            .forEach(function (button) {
                button.textContent = dark ? "☀" : "☾";

                button.setAttribute(
                    "aria-label",
                    dark
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                );

                button.title = dark
                    ? "Switch to light mode"
                    : "Switch to dark mode";
            });
    }

    window.toggleTheme = function () {
        const newTheme = isDark() ? "light" : "dark";

        localStorage.setItem(THEME_KEY, newTheme);

        applyTheme();
    };

    // Apply theme immediately
    applyTheme();

    // Apply again after page loads
    document.addEventListener("DOMContentLoaded", function () {
        applyTheme();
    });

    // Update theme if changed from another page/tab
    window.addEventListener("storage", function (event) {
        if (event.key === THEME_KEY) {
            applyTheme();
        }
    });
})();