/* =========================================================
   SmartExpense - Shared App Logic
   ========================================================= */

const STORAGE_KEY = "smartExpense_v1";

const THEME_KEY = "smartExpense_theme";


/* =========================================================
   Categories
   ========================================================= */

const CATEGORIES = [
    ["Food", "🍔"],
    ["Transport", "🚗"],
    ["Shopping", "🛍️"],
    ["Bills", "🏠"],
    ["Entertainment", "🎮"],
    ["Travel", "✈️"],
    ["Health", "💊"],
    ["Education", "📚"],
    ["Rent", "🏠"],
    ["Others", "📦"]
];


/* =========================================================
   Default State
   ========================================================= */

const DEFAULT_STATE = {

    transactions: [

        {
            id: 1,
            type: "income",
            amount: 50000,
            description: "Monthly salary",
            category: "Salary",
            date: "2026-09-01",
            method: "Bank transfer"
        },

        {
            id: 2,
            type: "expense",
            amount: 850,
            description: "Groceries",
            category: "Food",
            date: "2026-09-02",
            method: "UPI"
        },

        {
            id: 3,
            type: "expense",
            amount: 420,
            description: "Fuel",
            category: "Transport",
            date: "2026-09-04",
            method: "Card"
        },

        {
            id: 4,
            type: "expense",
            amount: 1290,
            description: "Online shopping",
            category: "Shopping",
            date: "2026-09-06",
            method: "UPI"
        },

        {
            id: 5,
            type: "expense",
            amount: 650,
            description: "Electricity bill",
            category: "Bills",
            date: "2026-09-08",
            method: "Bank transfer"
        },

        {
            id: 6,
            type: "expense",
            amount: 320,
            description: "Lunch",
            category: "Food",
            date: "2026-09-10",
            method: "UPI"
        },

        {
            id: 7,
            type: "expense",
            amount: 550,
            description: "Movie & snacks",
            category: "Entertainment",
            date: "2026-09-12",
            method: "Card"
        }

    ],

    budgets: {

        Food: 5000,
        Transport: 4000,
        Shopping: 4000,
        Bills: 8000,
        Entertainment: 2500,
        Travel: 6000,
        Health: 3000,
        Education: 3000,
        Rent: 10000,
        Others: 2500

    },

    goals: [

        {
            id: 1,
            name: "Emergency Fund",
            target: 50000,
            current: 19000,
            date: "2027-03-01"
        }

    ],

    currency: "₹"

};


/* =========================================================
   Clone Default
   ========================================================= */

function cloneDefault() {

    return JSON.parse(
        JSON.stringify(DEFAULT_STATE)
    );

}


/* =========================================================
   Get Local Date
   ========================================================= */

function today() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   Normalize State
   ========================================================= */

function normalizeState(data) {

    const defaultState = cloneDefault();

    if (!data || typeof data !== "object") {

        return defaultState;

    }


    if (!Array.isArray(data.transactions)) {

        data.transactions = defaultState.transactions;

    }


    if (!data.budgets || typeof data.budgets !== "object") {

        data.budgets = defaultState.budgets;

    }


    if (!Array.isArray(data.goals)) {

        data.goals = defaultState.goals;

    }


    if (!data.currency) {

        data.currency = defaultState.currency;

    }


    return data;

}


/* =========================================================
   Read State
   ========================================================= */

function readState() {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) {

            const fresh = cloneDefault();

            writeState(fresh);

            return fresh;

        }


        const parsed = JSON.parse(raw);

        const normalized =
            normalizeState(parsed);

        writeState(normalized);

        return normalized;

    }

    catch (error) {

        const fresh = cloneDefault();

        writeState(fresh);

        return fresh;

    }

}


/* =========================================================
   Write State
   ========================================================= */

function writeState(state) {

    const normalized = normalizeState(state);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized)
    );

    // The storage event does not fire in the same tab that made the change.
    // Dispatch a local event so every component refreshes immediately.
    window.dispatchEvent(
        new CustomEvent("smartExpense:update", {
            detail: normalized
        })
    );

}


/* =========================================================
   Aliases
   ========================================================= */

function state() {

    return readState();

}


function getState() {

    return readState();

}


function saveState(data) {

    writeState(
        normalizeState(data)
    );

}


/* =========================================================
   Currency
   ========================================================= */

function money(amount, currency) {

    const value =
        Number(amount) || 0;

    const stateData =
        currency ||
        readState().currency ||
        "₹";

    return `${stateData}${Math.round(value).toLocaleString("en-IN")}`;

}


/* =========================================================
   Total
   ========================================================= */

function total(list) {

    return list.reduce(
        (sum, transaction) =>
            sum + Number(transaction.amount || 0),
        0
    );

}


/* =========================================================
   Current Month
   ========================================================= */

function isCurrentMonth(transaction) {

    return String(
        transaction.date || ""
    ).slice(0, 7) === today().slice(0, 7);

}


function monthTx(data) {

    const currentState =
        data || readState();

    return currentState.transactions.filter(
        isCurrentMonth
    );

}


function ex(data) {

    return monthTx(data).filter(
        transaction =>
            transaction.type === "expense"
    );

}


function inc(data) {

    return monthTx(data).filter(
        transaction =>
            transaction.type === "income"
    );

}


function expenses(data) {

    return ex(data);

}


function incomes(data) {

    return inc(data);

}


/* =========================================================
   Category Icon
   ========================================================= */

function icon(category) {

    const found =
        CATEGORIES.find(
            item => item[0] === category
        );

    return found
        ? found[1]
        : "•";

}


/* =========================================================
   HTML Escape
   ========================================================= */

function esc(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );

}


/* =========================================================
   Add Transaction
   ========================================================= */

function addSharedTransaction(data) {

    const currentState =
        readState();

    const transaction = {

        id:
            Date.now() +
            Math.floor(Math.random() * 1000),

        type:
            data.type || "expense",

        amount:
            Number(data.amount) || 0,

        description:
            String(
                data.description || ""
            ).trim(),

        category:
            data.category || "Others",

        date:
            data.date || today(),

        method:
            data.method || "UPI",

        notes:
            String(
                data.notes || ""
            ).trim()

    };


    currentState.transactions.unshift(
        transaction
    );


    writeState(currentState);


    return transaction;

}


/* =========================================================
   Delete Transaction
   ========================================================= */

function deleteSharedTransaction(id) {

    const currentState =
        readState();

    currentState.transactions =
        currentState.transactions.filter(
            transaction =>
                Number(transaction.id) !== Number(id)
        );


    writeState(currentState);


    return currentState;

}


/* =========================================================
   Theme
   ---------------------------------------------------------
   Theme state is handled only by js/theme.js.
   ========================================================= */

/* =========================================================
   Dashboard Navigation
   ========================================================= */

function renderNavigation() {

    const items = [

        [
            "index.html",
            "Dashboard",
            "⌂"
        ],

        [
            "add-expense.html",
            "Add Expense",
            "＋"
        ],

        [
            "recent-transactions.html",
            "Recent Transactions",
            "🧾"
        ],

        [
            "analysis.html",
            "See Analysis",
            "◉"
        ],

        [
            "income.html",
            "Income",
            "↗"
        ],

        [
            "budgets.html",
            "Budgets",
            "◷"
        ],

        [
            "goals.html",
            "Goals",
            "◎"
        ],

        [
            "settings.html",
            "Settings",
            "⚙"
        ]

    ];


    const current =
        location.pathname
            .split("/")
            .pop() || "index.html";


    const desktop =
        document.getElementById(
            "desktopNav"
        );

    const mobile =
        document.getElementById(
            "mobileNav"
        );


    function createLink(
        href,
        label,
        emoji,
        small = false
    ) {

        const active =
            current === href;


        return `

            <a
                href="${href}"
                class="${
                    small

                        ? "flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold"

                        : "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800"
                }

                ${active ? "nav-active" : ""}"

                ${
                    active
                        ? 'aria-current="page"'
                        : ""
                }
            >

                <span
                    class="${
                        small
                            ? "text-lg leading-none"
                            : "text-lg w-6 text-center"
                    }"
                >
                    ${emoji}
                </span>

                <span>
                    ${label}
                </span>

            </a>

        `;

    }


    if (desktop) {

        desktop.innerHTML =
            items
                .map(item =>
                    createLink(
                        item[0],
                        item[1],
                        item[2]
                    )
                )
                .join("");

    }


    if (mobile) {

        const mobileItems = [

            items[0],
            items[1],
            items[2],
            items[3],
            items[7]

        ];


        mobile.innerHTML =
            mobileItems
                .map(item =>
                    createLink(
                        item[0],
                        item[1],
                        item[2],
                        true
                    )
                )
                .join("");

    }

}


/* =========================================================
   Dashboard Recent Transactions
   ========================================================= */

function renderRecent(stateData) {

    const box =
        document.getElementById(
            "recentList"
        );

    if (!box) return;


    const latest =
        [...stateData.transactions]
            .sort(
                (a, b) =>
                    String(b.date || "")
                        .localeCompare(
                            String(a.date || "")
                        ) ||
                    Number(b.id || 0) -
                    Number(a.id || 0)
            )
            .slice(0, 6);


    if (!latest.length) {

        box.innerHTML = `
            <p class="py-8 text-center text-slate-500">
                No transactions yet.
            </p>
        `;

        return;

    }


    box.innerHTML =
        latest
            .map(transaction => `

                <div
                    class="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60"
                >

                    <div
                        class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center"
                    >
                        ${
                            transaction.type === "income"
                                ? "💰"
                                : icon(transaction.category)
                        }
                    </div>


                    <div
                        class="flex-1 min-w-0"
                    >

                        <p class="font-bold truncate">

                            ${esc(
                                transaction.description
                            )}

                        </p>


                        <p class="text-xs text-slate-500">

                            ${esc(
                                transaction.category ||
                                "Others"
                            )}

                            ·

                            ${esc(
                                transaction.date || ""
                            )}

                        </p>

                    </div>


                    <b
                        class="${
                            transaction.type === "income"
                                ? "text-emerald-600"
                                : "text-rose-500"
                        }"
                    >

                        ${
                            transaction.type === "income"
                                ? "+"
                                : "-"
                        }

                        ${money(
                            transaction.amount,
                            stateData.currency
                        )}

                    </b>

                </div>

            `)
            .join("");

}


/* =========================================================
   Dashboard Trend Chart
   ========================================================= */

let trendChartInstance = null;

function renderTrendChart(stateData) {

    const canvas =
        document.getElementById(
            "trendChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {

        return;

    }


    const labels = [];

    const values = [];


    const now =
        new Date();


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(now);


        date.setDate(
            now.getDate() - i
        );


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        const key =
            `${year}-${month}-${day}`;


        labels.push(
            `${month}/${day}`
        );


        values.push(
            total(
                stateData.transactions.filter(
                    transaction =>
                        transaction.type ===
                            "expense" &&
                        transaction.date === key
                )
            )
        );

    }


    if (trendChartInstance) {

        trendChartInstance.destroy();

    }


    trendChartInstance =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label: "Spending",

                            data: values,

                            tension: 0.35,

                            fill: true,

                            borderWidth: 3,

                            pointRadius: 3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


/* =========================================================
   Dashboard Category Chart
   ========================================================= */

let categoryChartInstance = null;


function renderCategoryChart(stateData) {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {

        return;

    }


    const transactions =
        stateData.transactions.filter(
            transaction =>
                transaction.type === "expense" &&
                isCurrentMonth(transaction)
        );


    const totals = {};


    transactions.forEach(
        transaction => {

            const category =
                transaction.category ||
                "Others";


            totals[category] =
                (
                    totals[category] || 0
                ) +
                Number(
                    transaction.amount || 0
                );

        }
    );


    const entries =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (categoryChartInstance) {

        categoryChartInstance.destroy();

    }


    if (!entries.length) {

        return;

    }


    categoryChartInstance =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        entries.map(
                            entry => entry[0]
                        ),

                    datasets: [

                        {

                            data:
                                entries.map(
                                    entry => entry[1]
                                ),

                            borderWidth: 2

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "64%",

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


/* =========================================================
   Dashboard Insight
   ========================================================= */

function renderInsight(
    stateData,
    expenseTotal
) {

    const title =
        document.getElementById(
            "insightTitle"
        );

    const text =
        document.getElementById(
            "insightText"
        );


    if (!title || !text) return;


    const monthExpenses =
        stateData.transactions.filter(
            transaction =>
                transaction.type === "expense" &&
                isCurrentMonth(transaction)
        );


    if (!monthExpenses.length) {

        title.textContent =
            "Start tracking";

        text.textContent =
            "Add your first expense and your overview will update automatically.";

        return;

    }


    const totals = {};


    monthExpenses.forEach(
        transaction => {

            const category =
                transaction.category ||
                "Others";


            totals[category] =
                (
                    totals[category] || 0
                ) +
                Number(
                    transaction.amount || 0
                );

        }
    );


    const top =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    if (top) {

        title.textContent =
            `${top[0]} is your top category`;


        text.textContent =
            `${top[0]} accounts for ${money(
                top[1],
                stateData.currency
            )} of this month's spending. Total spending is ${money(
                expenseTotal,
                stateData.currency
            )}.`;

    }

}


/* =========================================================
   Dashboard
   ========================================================= */

function renderDashboard() {

    const stateData =
        readState();


    const transactions =
        stateData.transactions
            .filter(isCurrentMonth);


    const income =
        transactions.filter(
            transaction =>
                transaction.type === "income"
        );


    const expensesList =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    const incomeTotal =
        total(income);


    const expenseTotal =
        total(expensesList);


    const balance =
        incomeTotal -
        expenseTotal;


    const setText =
        (id, value) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value;

            }

        };


    setText(
        "balance",
        money(
            balance,
            stateData.currency
        )
    );


    setText(
        "income",
        money(
            incomeTotal,
            stateData.currency
        )
    );


    setText(
        "expenses",
        money(
            expenseTotal,
            stateData.currency
        )
    );


    setText(
        "savings",
        money(
            Math.max(
                0,
                balance
            ),
            stateData.currency
        )
    );


    setText(
        "savingRate",
        `${
            incomeTotal
                ? Math.round(
                    Math.max(
                        0,
                        balance
                    ) /
                    incomeTotal *
                    100
                )
                : 0
        }% of income`
    );


    setText(
        "expenseChange",
        `${
            expensesList.length
        } transaction${
            expensesList.length === 1
                ? ""
                : "s"
        } this month`
    );


    renderRecent(stateData);

    renderCategoryChart(stateData);

    renderTrendChart(stateData);

    renderInsight(
        stateData,
        expenseTotal
    );

}


/* =========================================================
   Dashboard Actions
   ========================================================= */

function setupDashboardActions() {

    const addButton =
        document.getElementById(
            "addBtn"
        );


    if (addButton) {

        const link =
            document.createElement("a");

        link.href =
            "add-expense.html";

        link.className =
            addButton.className;

        link.textContent =
            "+ Add transaction";

        addButton.replaceWith(link);

    }


    const mobileAdd =
        document.getElementById(
            "mobileAdd"
        );


    if (mobileAdd) {

        const link =
            document.createElement("a");

        link.href =
            "add-expense.html";

        link.className =
            mobileAdd.className;

        link.innerHTML =
            mobileAdd.innerHTML;

        mobileAdd.replaceWith(link);

    }


    document
        .querySelectorAll(
            '[data-page="expenses"]'
        )
        .forEach(element => {

            const link =
                document.createElement("a");

            link.href =
                "recent-transactions.html";

            link.className =
                element.className;

            link.textContent =
                element.textContent;

            element.replaceWith(link);

        });


    document
        .querySelectorAll(
            '[data-page="analytics"]'
        )
        .forEach(element => {

            const link =
                document.createElement("a");

            link.href =
                "analysis.html";

            link.className =
                element.className;

            link.textContent =
                element.textContent;

            element.replaceWith(link);

        });

}


/* =========================================================
   Currency
   ========================================================= */

function setupCurrency() {

    const select =
        document.getElementById(
            "currencySelect"
        );


    if (!select) return;


    const currentState =
        readState();


    select.value =
        currentState.currency || "₹";


    select.addEventListener(
        "change",
        function () {

            const stateData =
                readState();


            stateData.currency =
                this.value;


            writeState(
                stateData
            );


            renderDashboard();

        }
    );

}


/* =========================================================
   Settings
   ========================================================= */

function setupSettings() {

    const themeButton =
        document.getElementById(
            "settingsThemeBtn"
        );


    if (themeButton) {

        themeButton.onclick =
            function () {

                if (
                    typeof window.toggleTheme ===
                    "function"
                ) {

                    window.toggleTheme();

                }
                else {

                    toggleAppTheme();

                }

            };

    }


    const clearButton =
        document.getElementById(
            "clearBtn"
        );


    if (clearButton) {

        clearButton.onclick =
            function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to clear all SmartExpense data?"
                    );


                if (!confirmed) return;


                localStorage.removeItem(
                    STORAGE_KEY
                );


                location.reload();

            };

    }


    const demoButton =
        document.getElementById(
            "demoBtn"
        );


    if (demoButton) {

        demoButton.onclick =
            function () {

                const confirmed =
                    confirm(
                        "Load SmartExpense demo data?"
                    );


                if (!confirmed) return;


                writeState(
                    cloneDefault()
                );


                location.reload();

            };

    }

}


/* =========================================================
   Profile Name
   ========================================================= */

function updateProfileButton() {

    const button =
        document.getElementById(
            "profileBtn"
        );


    if (!button) return;


    try {

        const raw =
            localStorage.getItem(
                "smartExpense_profile"
            );


        if (!raw) return;


        const profile =
            JSON.parse(raw);


        const name =
            String(
                profile.name || ""
            ).trim();


        if (name) {

            button.textContent =
                name;

        }

    }

    catch (error) {

        console.warn(
            "Unable to load profile.",
            error
        );

    }

}


/* =========================================================
   Global Storage Refresh
   ========================================================= */

window.addEventListener(
    "smartExpense:update",
    function () {
        renderDashboard();
        updateProfileButton();
    }
);


window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key === STORAGE_KEY ||
            event.key === THEME_KEY ||
            event.key === "smartExpense_profile"
        ) {

            renderDashboard();

            updateProfileButton();

        }

    }
);


/* =========================================================
   Visibility Refresh
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (!document.hidden) {

            renderDashboard();

            updateProfileButton();

        }

    }
);


/* =========================================================
   DOM Ready
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderNavigation();

        setupDashboardActions();

        setupCurrency();

        setupSettings();

        updateProfileButton();

        renderDashboard();

    }
);
// ===============================
// Dynamic Greeting
// ===============================

function updateGreeting() {
    const greetingElement = document.getElementById("greeting");

    if (!greetingElement) return;

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        greetingElement.textContent = "Good Morning 👋";
    }
    else if (hour >= 12 && hour < 17) {
        greetingElement.textContent = "Good Afternoon 👋";
    }
    else if (hour >= 17 && hour < 21) {
        greetingElement.textContent = "Good Evening 👋";
    }
    else {
        greetingElement.textContent = "Good Night 🌙";
    }
}

// Run when page loads
updateGreeting();

// Check every minute
setInterval(updateGreeting, 60000);