
/* =========================================
   TOGETHER - JAVASCRIPT
   MODULE 1: NAVIGATION & THEME
========================================= */


/* =========================================
   1. PAGE NAVIGATION
========================================= */

const navigationButtons = document.querySelectorAll(
    "[data-view], [data-view-target]"
);

const pageViews = document.querySelectorAll(".page-view");

const pageTitles = {
    dashboard: "Dashboard",
    together: "Together Savings",
    "mr-account": "Mr. Account",
    "mrs-account": "Mrs. Account",
    analytics: "Analytics",
    settings: "Settings"
};

function switchPage(pageId) {
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage || !selectedPage.classList.contains("page-view")) {
        return;
    }

    pageViews.forEach(page => {
        page.classList.remove("active");
    });

    selectedPage.classList.add("active");

    document.getElementById("page-title").textContent =
        pageTitles[pageId] || "TOGETHER";

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === pageId
        );
    });

    document.querySelectorAll(".mobile-nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === pageId
        );
    });

    document.getElementById("sidebar").classList.remove("open");

    sessionStorage.setItem("together-current-page", pageId);
}

navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
        const pageId =
            button.dataset.view ||
            button.dataset.viewTarget;

        switchPage(pageId);
    });
});

const savedPage = sessionStorage.getItem("together-current-page");

if (savedPage && pageTitles[savedPage]) {
    switchPage(savedPage);
} else {
    switchPage("dashboard");
}


/* =========================================
   2. MOBILE SIDEBAR
========================================= */

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.addEventListener("click", (event) => {
    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedMenuButton = menuToggle.contains(event.target);

    if (!clickedInsideSidebar && !clickedMenuButton) {
        sidebar.classList.remove("open");
    }
});


/* =========================================
   3. THEME MANAGEMENT
========================================= */

const themeToggle = document.getElementById("theme-toggle");
const themeSelect = document.getElementById("theme-select");

let currentTheme =
    localStorage.getItem("together-theme") || "system";

function applyTheme(theme) {
    currentTheme = theme;

    if (theme === "system") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }

    themeSelect.value = theme;

    themeToggle.textContent =
        theme === "dark" ? "☀" :
        theme === "light" ? "☾" : "◐";

    localStorage.setItem("together-theme", theme);
}

themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
});

themeToggle.addEventListener("click", () => {
    const nextTheme = {
        system: "dark",
        dark: "light",
        light: "system"
    };

    applyTheme(nextTheme[currentTheme]);
});

applyTheme(currentTheme);


/* =========================================
   4. CURRENT DATE
========================================= */

function updateCurrentDate() {
    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("current-date").textContent =
        formattedDate;
}

updateCurrentDate();

console.log("TOGETHER: Navigation and Theme loaded successfully ❤️");


/* =========================================
   MODULE 2: TOGETHER SAVINGS ENGINE
========================================= */


/* =========================================
   1. SAVINGS CONFIGURATION
========================================= */

const SAVINGS_START_DATE = "2026-10-27";

const SAVINGS_STORAGE_KEY = "together-savings-data";

const INITIAL_COMPLETED_DAYS = 10;

let savingsRecords = JSON.parse(
    localStorage.getItem(SAVINGS_STORAGE_KEY)
);

function saveSavingsData() {
    localStorage.setItem(
        SAVINGS_STORAGE_KEY,
        JSON.stringify(savingsRecords)
    );
}

function formatLocalDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function getDayDifference(startDate, endDate) {
    const start = Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
    );

    const end = Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
    );

    return Math.floor((end - start) / 86400000);
}


/* =========================================
   2. INITIALIZE SAVINGS HISTORY
========================================= */

function initializeSavings() {
    if (!savingsRecords || typeof savingsRecords !== "object") {
        savingsRecords = {};

        for (let i = 0; i < INITIAL_COMPLETED_DAYS; i++) {
            const date = parseLocalDate(SAVINGS_START_DATE);

            date.setDate(date.getDate() + i);

            const dateKey = formatLocalDate(date);

            savingsRecords[dateKey] = {
                mrSaved: true,
                mrsSaved: true,
                mrAmount: i + 1,
                mrsAmount: i + 1
            };
        }

        saveSavingsData();
    }
}


/* =========================================
   3. CALCULATE DAILY SAVINGS
========================================= */

function getSavingsDetails(date = new Date()) {
    const startDate = parseLocalDate(SAVINGS_START_DATE);

    const overallDay = getDayDifference(startDate, date) + 1;

    if (overallDay < 1) {
        return null;
    }

    const cycleDay = ((overallDay - 1) % 10) + 1;

    const dailyAmount = cycleDay;

    return {
        overallDay,
        cycleDay,
        dailyAmount,
        combinedTarget: dailyAmount * 2,
        dateKey: formatLocalDate(date)
    };
}


/* =========================================
   4. GET TODAY'S SAVINGS RECORD
========================================= */

function getTodaySavingsRecord() {
    const details = getSavingsDetails();

    if (!details) return null;

    if (!savingsRecords[details.dateKey]) {
        savingsRecords[details.dateKey] = {
            mrSaved: false,
            mrsSaved: false,
            mrAmount: details.dailyAmount,
            mrsAmount: details.dailyAmount
        };
    }

    return savingsRecords[details.dateKey];
}


/* =========================================
   5. DISPLAY TODAY'S SAVINGS
========================================= */

function renderTodaySavings() {
    const details = getSavingsDetails();

    if (!details) return;

    const record = getTodaySavingsRecord();

    document.getElementById("cycle-day").textContent =
        `${details.cycleDay} / 10`;

    document.getElementById("daily-target").textContent =
        `₹${details.combinedTarget}`;

    document.getElementById("mr-target").textContent =
        `₹${details.dailyAmount}`;

    document.getElementById("mrs-target").textContent =
        `₹${details.dailyAmount}`;

    const mrCheckbox = document.getElementById("mr-contribution");

    const mrsCheckbox = document.getElementById("mrs-contribution");

    mrCheckbox.checked = record.mrSaved;

    mrsCheckbox.checked = record.mrsSaved;

    updateContributionStatus();
}


/* =========================================
   6. HANDLE DAILY CONTRIBUTIONS
========================================= */

function handleContribution(person, isSaved) {
    const details = getSavingsDetails();

    if (!details) return;

    const record = getTodaySavingsRecord();

    if (person === "mr") {
        record.mrSaved = isSaved;
    }

    if (person === "mrs") {
        record.mrsSaved = isSaved;
    }

    saveSavingsData();

    updateContributionStatus();

    renderSavingsTotals();

    renderSavingsHistory();
}

document.getElementById("mr-contribution")
    .addEventListener("change", (event) => {
        handleContribution("mr", event.target.checked);
    });

document.getElementById("mrs-contribution")
    .addEventListener("change", (event) => {
        handleContribution("mrs", event.target.checked);
    });


/* =========================================
   7. UPDATE CONTRIBUTION STATUS
========================================= */

function updateContributionStatus() {
    const record = getTodaySavingsRecord();

    if (!record) return;

    const status = document.getElementById("contribution-status");

    if (record.mrSaved && record.mrsSaved) {
        status.textContent = "Both contributions completed! ❤️";
    } else if (record.mrSaved || record.mrsSaved) {
        status.textContent = "One contribution completed. Keep going!";
    } else {
        status.textContent = "Waiting for contributions.";
    }
}


/* =========================================
   8. CALCULATE TOTAL SAVINGS
========================================= */

function renderSavingsTotals() {
    let mrTotal = 0;
    let mrsTotal = 0;

    Object.values(savingsRecords).forEach(record => {
        if (record.mrSaved) {
            mrTotal += Number(record.mrAmount);
        }

        if (record.mrsSaved) {
            mrsTotal += Number(record.mrsAmount);
        }
    });

    const combinedTotal = mrTotal + mrsTotal;

    document.getElementById("mr-contributions").textContent =
        `₹${mrTotal}`;

    document.getElementById("mrs-contributions").textContent =
        `₹${mrsTotal}`;

    document.getElementById("available-savings").textContent =
        `₹${combinedTotal}`;

    // Dashboard savings overview.
    document.getElementById("total-savings").textContent =
        formatMoney(combinedTotal);

    document.getElementById("total-savings").dataset.value =
        combinedTotal;

    // Together Balance displays actual shared savings.
    const togetherBalanceCard = document.querySelector(
        '[data-balance="together"]'
    );

    if (togetherBalanceCard) {
        togetherBalanceCard.textContent = formatMoney(combinedTotal);
    }
}


/* =========================================
   9. RENDER SAVINGS HISTORY
========================================= */

function renderSavingsHistory() {
    const historyContainer =
        document.getElementById("savings-history");

    const sortedDates = Object.keys(savingsRecords).sort(
        (a, b) => b.localeCompare(a)
    );

    if (sortedDates.length === 0) {
        historyContainer.textContent = "No savings history.";
        return;
    }

    historyContainer.innerHTML = "";

    sortedDates.forEach(dateKey => {
        const record = savingsRecords[dateKey];

        const date = parseLocalDate(dateKey);

        const details = getSavingsDetails(date);

        const mrStatus = record.mrSaved ? "Saved" : "Pending";

        const mrsStatus = record.mrsSaved ? "Saved" : "Pending";

        const mrAmount = record.mrSaved ? Number(record.mrAmount) : 0;

        const mrsAmount = record.mrsSaved ? Number(record.mrsAmount) : 0;

        const combined = mrAmount + mrsAmount;

        const row = document.createElement("div");

        row.className = "contribution-row";

        row.innerHTML = `
            <div>
                <strong>${date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })}</strong>

                <br>

                <small>
                    Day ${details.overallDay} · Cycle ${details.cycleDay}
                </small>
            </div>

            <div>
                <small>Mr: ${mrStatus}</small>
                <br>
                <small>Mrs: ${mrsStatus}</small>
            </div>

            <strong>₹${combined}</strong>
        `;

        historyContainer.appendChild(row);
    });
}


/* =========================================
   10. START SAVINGS ENGINE
========================================= */

function startSavingsEngine() {
    initializeSavings();

    renderTodaySavings();

    renderSavingsTotals();

    renderSavingsHistory();

    console.log("Together Savings Engine started ❤️");
}

startSavingsEngine();


/* =========================================
   MODULE 3: PERSONAL ACCOUNT ENGINE
   MR. ACCOUNT & MRS. ACCOUNT
========================================= */


/* =========================================
   1. ACCOUNT CONFIGURATION
========================================= */

const PERSONAL_STORAGE_KEY = "together-personal-accounts";

let personalAccounts = JSON.parse(
    localStorage.getItem(PERSONAL_STORAGE_KEY) || "null"
);

// Create initial accounts if they don't exist.
if (!personalAccounts) {
    personalAccounts = {
        mr: {
            cash: 0,
            online: 0,
            transactions: []
        },

        mrs: {
            cash: 0,
            online: 0,
            transactions: []
        }
    };
} else {
    // Preserve existing records and fill any missing fields.
    ["mr", "mrs"].forEach(person => {
        if (!personalAccounts[person]) {
            personalAccounts[person] = {
                cash: 0,
                online: 0,
                transactions: []
            };
        }

        personalAccounts[person].cash =
            Number(personalAccounts[person].cash) || 0;

        personalAccounts[person].online =
            Number(personalAccounts[person].online) || 0;

        if (!Array.isArray(personalAccounts[person].transactions)) {
            personalAccounts[person].transactions = [];
        }
    });
}

function savePersonalAccounts() {
    localStorage.setItem(
        PERSONAL_STORAGE_KEY,
        JSON.stringify(personalAccounts)
    );
}


/* =========================================
   2. CURRENCY FORMATTER
========================================= */

function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}


/* =========================================
   3. ACCOUNT BALANCE CALCULATIONS
========================================= */

function getAccountTotal(person) {
    const account = personalAccounts[person];

    return Number(account.cash) + Number(account.online);
}

function updatePersonalBalances() {
    ["mr", "mrs"].forEach(person => {
        const account = personalAccounts[person];

        const total = getAccountTotal(person);

        document.getElementById(`${person}-cash`).textContent =
            formatMoney(account.cash);

        document.getElementById(`${person}-online`).textContent =
            formatMoney(account.online);

        document.getElementById(`${person}-total`).textContent =
            formatMoney(total);

        // Update dashboard personal balances.
        const dashboardBalance = document.querySelector(
            `[data-balance="${person}"]`
        );

        if (dashboardBalance && !hiddenBalances[person]) {
            dashboardBalance.textContent = formatMoney(total);
        }
    });
}


/* =========================================
   4. ADD MONEY TO CASH / ONLINE
========================================= */

function addMoneyToWallet(person, walletName) {
    const personName = person === "mr" ? "Mr." : "Mrs.";

    const walletLabel = walletName === "cash"
        ? "Cash in Hand"
        : "Online Balance";

    // Ask only for the amount.
    const amountInput = prompt(
        `${personName} Account · ${walletLabel}\n\nEnter amount to add (₹):`
    );

    if (amountInput === null) return;

    const amount = Number(amountInput.trim());

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than zero.");
        return;
    }

    const account = personalAccounts[person];

    account[walletName] = Number(account[walletName]) + amount;

    // Automatically create the transaction.
    account.transactions.push({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,

        type: "added",

        amount: amount,

        wallet: walletName,

        description: "Amount Added",

        date: formatLocalDate(new Date())
    });

    savePersonalAccounts();

    renderPersonalAccounts();
}


/* =========================================
   5. ADD EXPENSE ONLY
========================================= */

function addPersonalTransaction(person) {
    const personName = person === "mr" ? "Mr." : "Mrs.";

    // Step 1: Amount.
    const amountInput = prompt(
        `${personName} Account\n\nHow much did you use? (₹):`
    );

    if (amountInput === null) return;

    const amount = Number(amountInput.trim());

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than zero.");
        return;
    }

    // Step 2: Payment method.
    const walletChoice = prompt(
        "Where did you pay from?\n\n" +
        "1. Cash in Hand\n" +
        "2. Online Balance"
    );

    if (walletChoice === null) return;

    if (walletChoice !== "1" && walletChoice !== "2") {
        alert("Please choose 1 for Cash or 2 for Online Balance.");
        return;
    }

    const walletName = walletChoice === "1"
        ? "cash"
        : "online";

    const account = personalAccounts[person];

    // Check available balance.
    if (Number(account[walletName]) < amount) {
        alert(
            `Insufficient ${
                walletName === "cash" ? "cash" : "online"
            } balance!`
        );

        return;
    }

    // Step 3: Optional reason.
    const reasonInput = prompt(
        "Reason for this expense (optional):"
    );

    if (reasonInput === null) return;

    const description = reasonInput.trim() || "Used Somewhere";

    // Deduct from the selected wallet.
    account[walletName] = Number(account[walletName]) - amount;

    // Save expense.
    account.transactions.push({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,

        type: "expense",

        amount: amount,

        wallet: walletName,

        description: description,

        date: formatLocalDate(new Date())
    });

    savePersonalAccounts();

    renderPersonalAccounts();
}


/* =========================================
   6. RENDER PERSONAL TRANSACTIONS
========================================= */

function renderTransactionHistory(person) {
    const container = document.getElementById(
        `${person}-transactions`
    );

    const transactions =
        personalAccounts[person].transactions;

    container.innerHTML = "";

    if (transactions.length === 0) {
        container.textContent = "No transactions available.";
        return;
    }

    // Newest transactions first.
    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach(transaction => {
        const row = document.createElement("div");

        row.className = "contribution-row";

        const typeLabels = {
            added: "Amount Added",
            expense: "Expense",
            income: "Income",
            transfer: "Transfer",
            opening: "Opening Balance"
        };

        const date = parseLocalDate(transaction.date);

        const dateText = date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        const isExpense = transaction.type === "expense";

        const amountPrefix = isExpense ? "−" : "+";

        const amountColor = isExpense
            ? "var(--danger)"
            : "var(--success)";

        const details = document.createElement("div");

        const title = document.createElement("strong");

        title.textContent = transaction.description || (
            transaction.type === "expense"
                ? "Used Somewhere"
                : "Amount Added"
        );

        const subtitle = document.createElement("small");

        const walletLabel = transaction.wallet === "cash"
            ? "Cash in Hand"
            : transaction.wallet === "online"
                ? "Online Balance"
                : transaction.wallet;

        subtitle.textContent =
            `${typeLabels[transaction.type] || "Transaction"} · ` +
            `${walletLabel} · ${dateText}`;

        details.appendChild(title);

        details.appendChild(document.createElement("br"));

        details.appendChild(subtitle);

        const amountElement = document.createElement("strong");

        amountElement.textContent =
            `${amountPrefix}${formatMoney(transaction.amount)}`;

        amountElement.style.color = amountColor;

        row.appendChild(details);

        row.appendChild(amountElement);

        container.appendChild(row);
    });
}


/* =========================================
   7. DAILY EXPENSE TOTAL
========================================= */

function updateTodayExpenses() {
    const today = formatLocalDate(new Date());

    let totalExpenses = 0;

    ["mr", "mrs"].forEach(person => {
        personalAccounts[person].transactions.forEach(transaction => {
            if (
                transaction.date === today &&
                transaction.type === "expense"
            ) {
                totalExpenses += Number(transaction.amount) || 0;
            }
        });
    });

    document.getElementById("today-expenses").textContent =
        formatMoney(totalExpenses);
}


/* =========================================
   8. RENDER PERSONAL ACCOUNTS
========================================= */

function renderPersonalAccounts() {
    updatePersonalBalances();

    renderTransactionHistory("mr");

    renderTransactionHistory("mrs");

    updateTodayExpenses();
}


/* =========================================
   9. CONNECT ADD MONEY BUTTONS
========================================= */

// Mr. Account.
document.getElementById("mr-add-cash")
    .addEventListener("click", () => {
        addMoneyToWallet("mr", "cash");
    });

document.getElementById("mr-add-online")
    .addEventListener("click", () => {
        addMoneyToWallet("mr", "online");
    });

// Mrs. Account.
document.getElementById("mrs-add-cash")
    .addEventListener("click", () => {
        addMoneyToWallet("mrs", "cash");
    });

document.getElementById("mrs-add-online")
    .addEventListener("click", () => {
        addMoneyToWallet("mrs", "online");
    });


/* =========================================
   10. CONNECT EXPENSE BUTTONS
========================================= */

document.getElementById("mr-add-transaction")
    .addEventListener("click", () => {
        addPersonalTransaction("mr");
    });

document.getElementById("mrs-add-transaction")
    .addEventListener("click", () => {
        addPersonalTransaction("mrs");
    });


/* =========================================
   11. HIDE / SHOW BALANCES
========================================= */

const hiddenBalances = {
    mr: false,
    mrs: false
};

function toggleBalanceVisibility(person) {
    const balanceElement = document.querySelector(
        `[data-balance="${person}"]`
    );

    const button = document.querySelector(
        `[data-toggle-balance="${person}"]`
    );

    hiddenBalances[person] = !hiddenBalances[person];

    if (hiddenBalances[person]) {
        balanceElement.textContent = "••••••";

        button.textContent = "Show Balance";
    } else {
        balanceElement.textContent =
            formatMoney(getAccountTotal(person));

        button.textContent = "Hide Balance";
    }
}

document.querySelectorAll("[data-toggle-balance]")
    .forEach(button => {
        button.addEventListener("click", () => {
            toggleBalanceVisibility(button.dataset.toggleBalance);
        });
    });


/* =========================================
   12. INITIALIZE PERSONAL ACCOUNTS
========================================= */

function startPersonalAccounts() {
    renderPersonalAccounts();

    console.log(
        "Personal Accounts initialized successfully ❤️"
    );
}

startPersonalAccounts();


/* =========================================
   MODULE 4: FINANCIAL ANALYTICS
   SAVINGS, INCOME, EXPENSES & BALANCES
========================================= */

const analyticsCharts = {
    dashboard: null,
    savings: null,
    expenses: null,
    balance: null
};


/* =========================================
   1. ANALYTICS DATE HELPERS
========================================= */

function getMonthKey(dateString) {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return null;
    }

    return dateString.slice(0, 7);
}

function getMonthLabel(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit"
    });
}

function getLastSixMonths() {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );

        months.push(formatLocalDate(date).slice(0, 7));
    }

    return months;
}


/* =========================================
   2. MONTHLY TRANSACTION TOTALS
========================================= */

function getMonthlyTransactionTotals() {
    const months = getLastSixMonths();

    const totals = {};

    months.forEach(month => {
        totals[month] = {
            income: 0,
            expenses: 0
        };
    });

    ["mr", "mrs"].forEach(person => {
        personalAccounts[person].transactions.forEach(transaction => {
            const month = getMonthKey(transaction.date);

            if (!month || !totals[month]) return;

            const amount = Number(transaction.amount) || 0;

            if (transaction.type === "expense") {
                totals[month].expenses += amount;
            } else if (
                transaction.type === "added" ||
                transaction.type === "income" ||
                transaction.type === "opening"
            ) {
                totals[month].income += amount;
            }
        });
    });

    return {
        months,
        totals
    };
}


/* =========================================
   3. CHART CREATION HELPER
========================================= */

function createOrUpdateChart(key, canvasId, config) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof Chart === "undefined") return;

    if (analyticsCharts[key]) {
        analyticsCharts[key].destroy();
    }

    analyticsCharts[key] = new Chart(canvas, config);
}


/* =========================================
   4. DASHBOARD FINANCIAL OVERVIEW
========================================= */

function renderDashboardFinancialChart() {
    const periodSelect = document.getElementById("overview-period");

    const canvas = document.getElementById("financial-chart");

    if (!canvas || typeof Chart === "undefined") return;

    const period = periodSelect ? periodSelect.value : "month";

    const { months, totals } = getMonthlyTransactionTotals();

    let selectedMonths = months;

    if (period === "week") {
        selectedMonths = months.slice(-2);
    } else if (period === "year") {
        selectedMonths = months;
    } else {
        selectedMonths = months.slice(-6);
    }

    const labels = selectedMonths.map(getMonthLabel);

    const incomeData = selectedMonths.map(
        month => totals[month].income
    );

    const expenseData = selectedMonths.map(
        month => totals[month].expenses
    );

    createOrUpdateChart("dashboard", "financial-chart", {
        type: "bar",

        data: {
            labels,

            datasets: [
                {
                    label: "Money Added",

                    data: incomeData,

                    backgroundColor: "rgba(34, 197, 94, 0.72)",

                    borderRadius: 6
                },

                {
                    label: "Expenses",

                    data: expenseData,

                    backgroundColor: "rgba(239, 68, 68, 0.72)",

                    borderRadius: 6
                }
            ]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: value =>
                            "₹" + Number(value).toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}


/* =========================================
   5. SAVINGS GROWTH CHART
========================================= */

function renderSavingsGrowthChart() {
    const sortedDates = Object.keys(savingsRecords).sort();

    const labels = [];

    const mrTotals = [];

    const mrsTotals = [];

    let mrRunningTotal = 0;

    let mrsRunningTotal = 0;

    sortedDates.forEach(dateKey => {
        const record = savingsRecords[dateKey];

        if (record.mrSaved) {
            mrRunningTotal += Number(record.mrAmount) || 0;
        }

        if (record.mrsSaved) {
            mrsRunningTotal += Number(record.mrsAmount) || 0;
        }

        labels.push(
            parseLocalDate(dateKey).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
            })
        );

        mrTotals.push(mrRunningTotal);

        mrsTotals.push(mrsRunningTotal);
    });

    createOrUpdateChart("savings", "savings-chart", {
        type: "line",

        data: {
            labels,

            datasets: [
                {
                    label: "Mr. Savings",

                    data: mrTotals,

                    borderColor: "#3b82f6",

                    backgroundColor: "rgba(59, 130, 246, 0.12)",

                    fill: true,

                    tension: 0.3
                },

                {
                    label: "Mrs. Savings",

                    data: mrsTotals,

                    borderColor: "#ec4899",

                    backgroundColor: "rgba(236, 72, 153, 0.10)",

                    fill: true,

                    tension: 0.3
                }
            ]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: value =>
                            "₹" + Number(value).toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}


/* =========================================
   6. INCOME VS EXPENSES CHART
========================================= */

function renderIncomeExpenseChart() {
    const { months, totals } = getMonthlyTransactionTotals();

    createOrUpdateChart("expenses", "expense-chart", {
        type: "bar",

        data: {
            labels: months.map(getMonthLabel),

            datasets: [
                {
                    label: "Income / Money Added",

                    data: months.map(
                        month => totals[month].income
                    ),

                    backgroundColor: "rgba(34, 197, 94, 0.75)",

                    borderRadius: 6
                },

                {
                    label: "Expenses",

                    data: months.map(
                        month => totals[month].expenses
                    ),

                    backgroundColor: "rgba(239, 68, 68, 0.75)",

                    borderRadius: 6
                }
            ]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: value =>
                            "₹" + Number(value).toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}


/* =========================================
   7. PERSONAL BALANCE OVERVIEW
========================================= */

function renderPersonalBalanceChart() {
    createOrUpdateChart("balance", "balance-chart", {
        type: "bar",

        data: {
            labels: ["Mr.", "Mrs."],

            datasets: [
                {
                    label: "Current Balance",

                    data: [
                        getAccountTotal("mr"),
                        getAccountTotal("mrs")
                    ],

                    backgroundColor: [
                        "rgba(59, 130, 246, 0.75)",
                        "rgba(236, 72, 153, 0.75)"
                    ],

                    borderRadius: 8
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
                    beginAtZero: true,

                    ticks: {
                        callback: value =>
                            "₹" + Number(value).toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}


/* =========================================
   8. RENDER ALL ANALYTICS
========================================= */

function renderAllAnalytics() {
    renderDashboardFinancialChart();

    renderSavingsGrowthChart();

    renderIncomeExpenseChart();

    renderPersonalBalanceChart();
}

function refreshFinancialCharts() {
    renderDashboardFinancialChart();

    renderSavingsGrowthChart();

    renderIncomeExpenseChart();

    renderPersonalBalanceChart();
}


/* =========================================
   9. DASHBOARD PERIOD FILTER
========================================= */

const overviewPeriod = document.getElementById("overview-period");

if (overviewPeriod) {
    overviewPeriod.addEventListener(
        "change",
        renderDashboardFinancialChart
    );
}


/* =========================================
   10. REFRESH CHARTS ON NAVIGATION
========================================= */

navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
        const pageId =
            button.dataset.view ||
            button.dataset.viewTarget;

        if (pageId === "dashboard" || pageId === "analytics") {
            refreshFinancialCharts();
        }
    });
});


/* =========================================
   11. KEEP CHARTS UPDATED
========================================= */

// Refresh savings and balance charts after savings updates.
const originalRenderSavingsTotals = renderSavingsTotals;

renderSavingsTotals = function () {
    originalRenderSavingsTotals();

    renderSavingsGrowthChart();

    renderPersonalBalanceChart();
};


// Refresh financial charts after personal account updates.
const originalRenderPersonalAccounts = renderPersonalAccounts;

renderPersonalAccounts = function () {
    originalRenderPersonalAccounts();

    renderDashboardFinancialChart();

    renderIncomeExpenseChart();

    renderPersonalBalanceChart();
};


/* =========================================
   12. INITIALIZE ANALYTICS
========================================= */

renderAllAnalytics();

console.log("TOGETHER: Financial Analytics loaded successfully ❤️");
