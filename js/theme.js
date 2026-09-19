(function () {
<<<<<<< HEAD
    "use strict";

=======
>>>>>>> 639c6571d506d46d253e869762d5acaa8f2c553e
    const THEME_KEY = "smartExpense_theme";

    function isDark() {
        return localStorage.getItem(THEME_KEY) === "dark";
    }

    function applyTheme() {
        const dark = isDark();
<<<<<<< HEAD
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
=======

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
>>>>>>> 639c6571d506d46d253e869762d5acaa8f2c553e
