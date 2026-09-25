/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://pzbfdtunxiaunfnopsuc.supabase.co/";

const SUPABASE_KEY =
    "sb_publishable_37DoAje5FQZr4FFO5jmpAA_IQHTDk_u";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   GLOBAL
===================================================== */

let currentUser = null;

let transactions = [];

let loans = [];

let currentTransactionType = "Pemasukan";

let editingTransactionId = null;

let editingLoanId = null;

let currentSummaryDate = new Date();

let currentHistoryType = "Semua";

let monthlyChart = null;


/* =====================================================
   CATEGORIES
===================================================== */

const incomeCategories = [
    "Gaji",
    "Bonus",
    "Penjualan",
    "Bisnis",
    "Investasi",
    "Hadiah",
    "Lainnya"
];


const expenseCategories = [
    "Makanan",
    "Transportasi",
    "Belanja",
    "Tagihan",
    "Hiburan",
    "Kesehatan",
    "Pendidikan",
    "Rumah",
    "Keluarga",
    "Pinjaman",
    "Investasi",
    "Lainnya"
];


/* =====================================================
   QUOTES
===================================================== */

const quotes = [
    "Atur uangmu sebelum uangmu yang mengatur hidupmu.",
    "Sedikit demi sedikit, lama-lama jadi saldo.",
    "Bukan tentang punya banyak uang, tapi tahu ke mana uang pergi.",
    "Keuangan yang rapi dimulai dari catatan yang sederhana.",
    "Jangan tunggu kaya untuk mulai mengatur uang.",
    "Uang yang dicatat lebih mudah dikendalikan.",
    "Menabung bukan soal sisa uang, tapi soal prioritas."
];


/* =====================================================
   FORMAT
===================================================== */

function formatRupiah(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   CATEGORY ICON
===================================================== */

function getCategoryIcon(category) {

    const icons = {

        Gaji: "💰",
        Bonus: "🎁",
        Penjualan: "🛒",
        Bisnis: "💼",
        Investasi: "📈",
        Hadiah: "🎁",

        Makanan: "🍜",
        Transportasi: "🚗",
        Belanja: "🛍️",
        Tagihan: "🧾",
        Hiburan: "🎮",
        Kesehatan: "💊",
        Pendidikan: "📚",
        Rumah: "🏠",
        Keluarga: "👨‍👩‍👧",

        Pinjaman: "💳",

        Lainnya: "•"
    };

    return icons[category] || "•";
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =====================================================
   LOGIN
===================================================== */

document
    .getElementById("login-form")
    .addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const email =
                document
                    .getElementById("login-email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("login-password")
                    .value;

            const errorElement =
                document
                    .getElementById("login-error");

            errorElement.textContent = "";

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({
                            email,
                            password
                        });

                if (error) {
                    throw error;
                }

                currentUser =
                    data.user;

                await initializeApp();

            } catch (error) {

                console.error(error);

                errorElement.textContent =
                    error.message ||
                    "Email atau password salah.";

            }

        }
    );


/* =====================================================
   PASSWORD
===================================================== */

document
    .getElementById("toggle-password")
    .addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "login-password"
                );

            if (input.type === "password") {

                input.type = "text";

                this.textContent = "🙈";

            } else {

                input.type = "password";

                this.textContent = "👁";

            }

        }
    );


/* =====================================================
   LOGOUT
===================================================== */

document
    .getElementById("logout-btn")
    .addEventListener(
        "click",
        async function () {

            await supabaseClient
                .auth
                .signOut();

            currentUser = null;

            transactions = [];

            loans = [];

            document
                .getElementById("app")
                .classList
                .add("hidden");

            document
                .getElementById("login-page")
                .classList
                .remove("hidden");

        }
    );


/* =====================================================
   INIT
===================================================== */

async function initializeApp() {

    document
        .getElementById("login-page")
        .classList
        .add("hidden");

    document
        .getElementById("app")
        .classList
        .remove("hidden");

    document
        .getElementById("account-email")
        .textContent =
        currentUser.email;

    await loadTransactions();

    await loadLoans();

    updateQuote();

    showPage("home");
}


async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();

    if (session) {

        currentUser =
            session.user;

        await initializeApp();

    }
}


supabaseClient
    .auth
    .onAuthStateChange(
        async function (
            event,
            session
        ) {

            if (
                event === "SIGNED_IN" &&
                session
            ) {

                currentUser =
                    session.user;

            }

        }
    );


/* =====================================================
   LOAD TRANSACTIONS
===================================================== */

async function loadTransactions() {

    if (!currentUser) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("transactions")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "tanggal",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        transactions =
            data || [];

        updateHistoryCategories();

        renderHome();

        renderHistory();

        renderSummary();

        renderRecap();

    } catch (error) {

        console.error(
            "Gagal mengambil transaksi:",
            error
        );

    }
}


/* =====================================================
   HOME
===================================================== */

function renderHome() {

    let income = 0;

    let expense = 0;

    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.nominal
                ) || 0;

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {

                income += amount;

            } else {

                expense += amount;

            }

        }
    );

    const balance =
        income - expense;

    const balanceElement =
        document.getElementById(
            "balance-amount"
        );

    const incomeElement =
        document.getElementById(
            "total-income"
        );

    const expenseElement =
        document.getElementById(
            "total-expense"
        );

    if (balanceElement) {
        balanceElement.textContent =
            formatRupiah(balance);
    }

    if (incomeElement) {
        incomeElement.textContent =
            formatRupiah(income);
    }

    if (expenseElement) {
        expenseElement.textContent =
            formatRupiah(expense);
    }
}


/* =====================================================
   NAVIGATION
===================================================== */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList
                    .remove("active")
        );

    const page =
        document.getElementById(
            `page-${pageName}`
        );

    if (page) {

        page.classList
            .add("active");

    }

    document
        .querySelectorAll(".nav-item")
        .forEach(
            item =>
                item.classList
                    .remove("active")
        );

    const nav =
        document.querySelector(
            `.nav-item[data-page="${pageName}"]`
        );

    if (nav) {

        nav.classList
            .add("active");

    }

    if (pageName === "history") {
        renderHistory();
    }

    if (pageName === "summary") {
        renderSummary();
    }

    if (pageName === "recap") {
        renderRecap();
    }

    if (pageName === "loans") {
        renderLoans();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   TRANSACTION MODAL
===================================================== */

function openTransactionModal(
    type = "Pemasukan",
    transaction = null
) {

    const modal =
        document.getElementById(
            "transaction-modal"
        );

    const form =
        document.getElementById(
            "transaction-form"
        );

    form.reset();

    editingTransactionId = null;

    currentTransactionType =
        type;

    if (transaction) {

        editingTransactionId =
            transaction.id;

        currentTransactionType =
            transaction.jenis;

        document
            .getElementById(
                "transaction-modal-title"
            )
            .textContent =
            "Edit Transaksi";

        document
            .getElementById(
                "transaction-type"
            )
            .value =
            transaction.jenis;

        document
            .getElementById(
                "transaction-amount"
            )
            .value =
            transaction.nominal;

        document
            .getElementById(
                "transaction-date"
            )
            .value =
            transaction.tanggal;

        document
            .getElementById(
                "transaction-description"
            )
            .value =
            transaction.keterangan || "";

        updateCategoryOptions(
            transaction.jenis,
            transaction.kategori
        );

    } else {

        document
            .getElementById(
                "transaction-modal-title"
            )
            .textContent =
            `Tambah ${type}`;

        document
            .getElementById(
                "transaction-type"
            )
            .value =
            type;

        document
            .getElementById(
                "transaction-date"
            )
            .value =
            new Date()
                .toISOString()
                .split("T")[0];

        updateCategoryOptions(type);

    }

    modal.classList
        .remove("hidden");
}


function closeTransactionModal() {

    document
        .getElementById(
            "transaction-modal"
        )
        .classList
        .add("hidden");

    editingTransactionId = null;
}


/* =====================================================
   CATEGORY OPTIONS
===================================================== */

function updateCategoryOptions(
    type,
    selectedCategory = ""
) {

    const select =
        document.getElementById(
            "transaction-category"
        );

    select.innerHTML = "";

    const categories =
        type === "Pemasukan"
            ? incomeCategories
            : expenseCategories;

    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            if (
                category ===
                selectedCategory
            ) {

                option.selected =
                    true;

            }

            select.appendChild(
                option
            );

        }
    );
}


document
    .getElementById(
        "transaction-type"
    )
    .addEventListener(
        "change",
        function () {

            currentTransactionType =
                this.value;

            updateCategoryOptions(
                this.value
            );

        }
    );


/* =====================================================
   SAVE TRANSACTION
===================================================== */

document
    .getElementById(
        "transaction-form"
    )
    .addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const type =
                document
                    .getElementById(
                        "transaction-type"
                    )
                    .value;

            const amount =
                Number(
                    document
                        .getElementById(
                            "transaction-amount"
                        )
                        .value
                );

            const category =
                document
                    .getElementById(
                        "transaction-category"
                    )
                    .value;

            const date =
                document
                    .getElementById(
                        "transaction-date"
                    )
                    .value;

            const description =
                document
                    .getElementById(
                        "transaction-description"
                    )
                    .value
                    .trim();

            if (
                !amount ||
                amount <= 0
            ) {

                alert(
                    "Nominal harus lebih dari 0."
                );

                return;
            }

            const transactionData = {

                user_id:
                    currentUser.id,

                jenis:
                    type,

                nominal:
                    amount,

                kategori:
                    category,

                tanggal:
                    date,

                keterangan:
                    description

            };

            try {

                if (
                    editingTransactionId
                ) {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                "transactions"
                            )
                            .update(
                                transactionData
                            )
                            .eq(
                                "id",
                                editingTransactionId
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            );

                    if (error) {
                        throw error;
                    }

                } else {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                "transactions"
                            )
                            .insert([
                                transactionData
                            ]);

                    if (error) {
                        throw error;
                    }

                }

                closeTransactionModal();

                await loadTransactions();

            } catch (error) {

                console.error(error);

                alert(
                    "Gagal menyimpan transaksi: " +
                    error.message
                );

            }

        }
    );


/* =====================================================
   DETAIL TRANSACTION
===================================================== */

function openDetailModal(id) {

    const transaction =
        transactions.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!transaction) {
        return;
    }

    const isIncome =
        transaction.jenis ===
        "Pemasukan";

    const typeClass =
        isIncome
            ? "income"
            : "expense";

    const sign =
        isIncome
            ? "+"
            : "-";

    const detail =
        document.getElementById(
            "transaction-detail"
        );

    detail.innerHTML = `

        <div class="detail-item">

            <div class="detail-label">
                Nominal
            </div>

            <div class="detail-amount ${typeClass}">
                ${sign} ${formatRupiah(transaction.nominal)}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Jenis
            </div>

            <div class="detail-value">
                ${escapeHTML(transaction.jenis)}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Kategori
            </div>

            <div class="detail-value">
                ${escapeHTML(transaction.kategori)}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Tanggal
            </div>

            <div class="detail-value">
                ${formatDate(transaction.tanggal)}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Keterangan
            </div>

            <div class="detail-value">
                ${escapeHTML(transaction.keterangan || "-")}
            </div>

        </div>

        <div class="detail-actions">

            <button
                class="detail-edit-btn"
                onclick="editTransaction('${transaction.id}')"
            >
                Edit
            </button>

            <button
                class="detail-delete-btn"
                onclick="deleteTransaction('${transaction.id}')"
            >
                Hapus
            </button>

        </div>

    `;

    document
        .getElementById(
            "detail-modal"
        )
        .classList
        .remove("hidden");
}


function closeDetailModal() {

    document
        .getElementById(
            "detail-modal"
        )
        .classList
        .add("hidden");
}


function editTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!transaction) {
        return;
    }

    closeDetailModal();

    openTransactionModal(
        transaction.jenis,
        transaction
    );
}


async function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Yakin ingin menghapus transaksi ini?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("transactions")
                .delete()
                .eq("id", id)
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (error) {
            throw error;
        }

        closeDetailModal();

        await loadTransactions();

    } catch (error) {

        console.error(error);

        alert(
            "Gagal menghapus transaksi: " +
            error.message
        );

    }
}


/* =====================================================
   HISTORY
===================================================== */

function setHistoryType(type) {

    currentHistoryType =
        type;

    document
        .querySelectorAll(
            ".filter-tab"
        )
        .forEach(
            tab => {

                tab.classList
                    .remove("active");

                if (
                    tab.dataset.type ===
                    type
                ) {

                    tab.classList
                        .add("active");

                }

            }
        );

    renderHistory();
}


function renderHistory() {

    const list =
        document.getElementById(
            "history-list"
        );

    if (!list) {
        return;
    }

    let filtered =
        [...transactions];

    if (
        currentHistoryType !==
        "Semua"
    ) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.jenis ===
                    currentHistoryType
            );

    }

    const month =
        document
            .getElementById(
                "history-month"
            )
            .value;

    if (month) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.tanggal
                        ?.startsWith(month)
            );

    }

    const category =
        document
            .getElementById(
                "history-category"
            )
            .value;

    if (
        category !== "Semua"
    ) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.kategori ===
                    category
            );

    }

    const search =
        document
            .getElementById(
                "history-search"
            )
            .value
            .trim()
            .toLowerCase();

    if (search) {

        filtered =
            filtered.filter(
                transaction => {

                    const text =
                        (
                            transaction.keterangan ||
                            ""
                        )
                        .toLowerCase();

                    const categoryText =
                        (
                            transaction.kategori ||
                            ""
                        )
                        .toLowerCase();

                    return (
                        text.includes(search) ||
                        categoryText.includes(search)
                    );

                }
            );

    }

    if (
        filtered.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-state">
                Belum ada transaksi.
            </div>

        `;

        return;
    }

    list.innerHTML =
        filtered
            .map(
                transaction => {

                    const income =
                        transaction.jenis ===
                        "Pemasukan";

                    const typeClass =
                        income
                            ? "income"
                            : "expense";

                    const sign =
                        income
                            ? "+"
                            : "-";

                    return `

                        <div
                            class="transaction-item ${typeClass}"
                            onclick="openDetailModal('${transaction.id}')"
                        >

                            <div class="transaction-item-icon">
                                ${getCategoryIcon(
                                    transaction.kategori
                                )}
                            </div>

                            <div class="transaction-item-info">

                                <strong>
                                    ${escapeHTML(
                                        transaction.keterangan ||
                                        transaction.kategori
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        transaction.kategori
                                    )}
                                    ·
                                    ${formatDate(
                                        transaction.tanggal
                                    )}
                                </span>

                            </div>

                            <div class="transaction-item-amount">

                                ${sign}
                                ${formatRupiah(
                                    transaction.nominal
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");
}


document
    .getElementById(
        "history-month"
    )
    .addEventListener(
        "change",
        renderHistory
    );


document
    .getElementById(
        "history-category"
    )
    .addEventListener(
        "change",
        renderHistory
    );


document
    .getElementById(
        "history-search"
    )
    .addEventListener(
        "input",
        renderHistory
    );


function updateHistoryCategories() {

    const select =
        document.getElementById(
            "history-category"
        );

    if (!select) {
        return;
    }

    const categories =
        [
            ...new Set(
                transactions
                    .map(
                        item =>
                            item.kategori
                    )
                    .filter(Boolean)
            )
        ]
        .sort();

    select.innerHTML = `

        <option value="Semua">
            Semua kategori
        </option>

    `;

    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            select.appendChild(
                option
            );

        }
    );
}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary() {

    updateHistoryCategories();

    const year =
        currentSummaryDate
            .getFullYear();

    const month =
        currentSummaryDate
            .getMonth();

    const monthName =
        currentSummaryDate
            .toLocaleDateString(
                "id-ID",
                {
                    month: "long",
                    year: "numeric"
                }
            );

    const monthElement =
        document.getElementById(
            "current-month"
        );

    if (monthElement) {

        monthElement.textContent =
            monthName;

    }

    const monthTransactions =
        transactions.filter(
            transaction => {

                if (
                    !transaction.tanggal
                ) {
                    return false;
                }

                const date =
                    new Date(
                        transaction.tanggal
                    );

                return (
                    date.getFullYear() ===
                    year &&
                    date.getMonth() ===
                    month
                );

            }
        );

    let income = 0;

    let expense = 0;

    monthTransactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.nominal
                ) || 0;

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {

                income += amount;

            } else {

                expense += amount;

            }

        }
    );

    const balance =
        income - expense;

    const incomeElement =
        document.getElementById(
            "summary-income"
        );

    const expenseElement =
        document.getElementById(
            "summary-expense"
        );

    const balanceElement =
        document.getElementById(
            "summary-balance"
        );

    const countElement =
        document.getElementById(
            "summary-count"
        );

    if (incomeElement) {
        incomeElement.textContent =
            formatRupiah(income);
    }

    if (expenseElement) {
        expenseElement.textContent =
            formatRupiah(expense);
    }

    if (balanceElement) {
        balanceElement.textContent =
            formatRupiah(balance);
    }

    if (countElement) {
        countElement.textContent =
            monthTransactions.length;
    }

    let percentage = 0;

    if (income > 0) {

        percentage =
            (expense / income) * 100;

    }

    const rounded =
        Math.round(percentage);

    const percentageElement =
        document.getElementById(
            "expense-percentage"
        );

    const progressElement =
        document.getElementById(
            "expense-progress"
        );

    if (percentageElement) {

        percentageElement.textContent =
            `${rounded}%`;

    }

    if (progressElement) {

        progressElement.style.width =
            `${Math.min(
                rounded,
                100
            )}%`;

    }

    renderMonthlyChart(
        income,
        expense
    );

    renderCategorySummary(
        monthTransactions
    );
}


/* =====================================================
   CHART
===================================================== */

function renderMonthlyChart(
    income,
    expense
) {

    const canvas =
        document.getElementById(
            "monthly-chart"
        );

    if (!canvas) {
        return;
    }

    if (monthlyChart) {

        monthlyChart.destroy();

    }

    monthlyChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Pemasukan",
                        "Pengeluaran"
                    ],

                    datasets: [

                        {

                            label:
                                "Nominal",

                            data: [
                                income,
                                expense
                            ],

                            borderRadius:
                                8,

                            backgroundColor: [
                                "#22b07d",
                                "#ef6262"
                            ]

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display:
                                false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    value =>
                                        formatRupiah(
                                            value
                                        )

                            }

                        }

                    }

                }

            }
        );
}


/* =====================================================
   CATEGORY SUMMARY
===================================================== */

function renderCategorySummary(
    monthTransactions
) {

    const container =
        document.getElementById(
            "category-summary"
        );

    if (!container) {
        return;
    }

    const expenses =
        monthTransactions.filter(
            transaction =>
                transaction.jenis ===
                "Pengeluaran"
        );

    if (
        expenses.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                Belum ada data pengeluaran.
            </div>

        `;

        return;
    }

    const totals = {};

    expenses.forEach(
        transaction => {

            const category =
                transaction.kategori ||
                "Lainnya";

            if (
                !totals[category]
            ) {

                totals[category] =
                    0;

            }

            totals[category] +=
                Number(
                    transaction.nominal
                ) || 0;

        }
    );

    const sorted =
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );

    container.innerHTML =
        sorted
            .map(
                ([category, total]) => `

                    <div class="category-item">

                        <div class="category-icon">
                            ${getCategoryIcon(category)}
                        </div>

                        <div class="category-info">

                            <strong>
                                ${escapeHTML(category)}
                            </strong>

                            <span>
                                Pengeluaran
                            </span>

                        </div>

                        <div class="category-total">
                            ${formatRupiah(total)}
                        </div>

                    </div>

                `
            )
            .join("");
}


/* =====================================================
   MONTH NAVIGATION
===================================================== */

document
    .getElementById(
        "prev-month"
    )
    .addEventListener(
        "click",
        function () {

            currentSummaryDate
                .setMonth(
                    currentSummaryDate
                        .getMonth() - 1
                );

            renderSummary();

        }
    );


document
    .getElementById(
        "next-month"
    )
    .addEventListener(
        "click",
        function () {

            currentSummaryDate
                .setMonth(
                    currentSummaryDate
                        .getMonth() + 1
                );

            renderSummary();

        }
    );


/* =====================================================
   RECAP
===================================================== */

function renderRecap() {

    const tbody =
        document.getElementById(
            "recap-table-body"
        );

    const empty =
        document.getElementById(
            "recap-empty"
        );

    if (!tbody) {
        return;
    }

    let income = 0;

    let expense = 0;

    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.nominal
                ) || 0;

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {

                income += amount;

            } else {

                expense += amount;

            }

        }
    );

    const balance =
        income - expense;

    const recapIncome =
        document.getElementById(
            "recap-income"
        );

    const recapExpense =
        document.getElementById(
            "recap-expense"
        );

    const recapBalance =
        document.getElementById(
            "recap-balance"
        );

    const recapTotal =
        document.getElementById(
            "recap-table-total"
        );

    const recapCount =
        document.getElementById(
            "recap-count"
        );

    if (recapIncome) {
        recapIncome.textContent =
            formatRupiah(income);
    }

    if (recapExpense) {
        recapExpense.textContent =
            formatRupiah(expense);
    }

    if (recapBalance) {
        recapBalance.textContent =
            formatRupiah(balance);
    }

    if (recapTotal) {
        recapTotal.textContent =
            formatRupiah(balance);
    }

    if (recapCount) {
        recapCount.textContent =
            `${transactions.length} transaksi`;
    }

    if (
        transactions.length === 0
    ) {

        tbody.innerHTML = "";

        if (empty) {
            empty.classList
                .remove("hidden");
        }

        return;
    }

    if (empty) {

        empty.classList
            .add("hidden");

    }

    /*
       Hitung saldo berjalan secara kronologis.
       Transaksi lama dihitung dulu,
       kemudian tabel ditampilkan terbaru di atas.
    */

    const chronological =
        [...transactions]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.tanggal
                        ).getTime();

                    const dateB =
                        new Date(
                            b.tanggal
                        ).getTime();

                    if (dateA !== dateB) {
                        return dateA - dateB;
                    }

                    return String(
                        a.id
                    ).localeCompare(
                        String(b.id)
                    );

                }
            );

    let runningBalance = 0;

    const balanceMap =
        new Map();

    chronological.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.nominal
                ) || 0;

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {

                runningBalance +=
                    amount;

            } else {

                runningBalance -=
                    amount;

            }

            balanceMap.set(
                String(transaction.id),
                runningBalance
            );

        }
    );

    const sorted =
        [...transactions]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.tanggal
                        ).getTime();

                    const dateB =
                        new Date(
                            b.tanggal
                        ).getTime();

                    if (dateA !== dateB) {
                        return dateB - dateA;
                    }

                    return String(
                        b.id
                    ).localeCompare(
                        String(a.id)
                    );

                }
            );

    tbody.innerHTML =
        sorted
            .map(
                transaction => {

                    const incomeType =
                        transaction.jenis ===
                        "Pemasukan";

                    const typeClass =
                        incomeType
                            ? "income"
                            : "expense";

                    const sign =
                        incomeType
                            ? "+"
                            : "-";

                    const running =
                        balanceMap.get(
                            String(
                                transaction.id
                            )
                        ) || 0;

                    return `

                        <tr>

                            <td>
                                ${formatDate(
                                    transaction.tanggal
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    transaction.keterangan ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    transaction.kategori ||
                                    "-"
                                )}
                            </td>

                            <td>

                                <span
                                    class="type-badge ${typeClass}"
                                >
                                    ${escapeHTML(
                                        transaction.jenis
                                    )}
                                </span>

                            </td>

                            <td
                                class="text-right ${
                                    incomeType
                                        ? "recap-income"
                                        : "recap-expense"
                                }"
                            >
                                ${sign}
                                ${formatRupiah(
                                    transaction.nominal
                                )}
                            </td>

                            <td
                                class="text-right"
                            >
                                ${formatRupiah(
                                    running
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");
}


/* =====================================================
   LOAN MODAL
===================================================== */

function getLoanModalField(id) {

    const modal =
        document.getElementById(
            "loan-modal"
        );

    if (!modal) {
        return null;
    }

    return modal.querySelector(
        `#${id}`
    );
}


function openLoanModal(loan = null) {

    const modal =
        document.getElementById(
            "loan-modal"
        );

    const form =
        document.getElementById(
            "loan-form"
        );

    if (!modal || !form) {
        return;
    }

    form.reset();

    editingLoanId = null;

    const title =
        document.getElementById(
            "loan-modal-title"
        );

    if (title) {

        title.textContent =
            "Tambah Pinjaman";

    }

    if (loan) {

        editingLoanId =
            loan.id;

        if (title) {

            title.textContent =
                "Edit Pinjaman";

        }

        const sourceInput =
            getLoanModalField(
                "loan-source"
            );

        const amountInput =
            getLoanModalField(
                "loan-amount"
            );

        const tenorInput =
            getLoanModalField(
                "loan-tenor"
            );

        const monthlyInput =
            getLoanModalField(
                "loan-monthly"
            );

        if (sourceInput) {
            sourceInput.value =
                loan.source || "";
        }

        if (amountInput) {
            amountInput.value =
                loan.amount || "";
        }

        if (tenorInput) {
            tenorInput.value =
                loan.tenor || "";
        }

        if (monthlyInput) {
            monthlyInput.value =
                loan.monthly || "";
        }

    }

    updateLoanCalculation();

    modal.classList
        .remove("hidden");
}


function closeLoanModal() {

    const modal =
        document.getElementById(
            "loan-modal"
        );

    if (modal) {

        modal.classList
            .add("hidden");

    }

    editingLoanId = null;
}


/* =====================================================
   LOAN CALCULATION
===================================================== */

function updateLoanCalculation() {

    const tenorInput =
        getLoanModalField(
            "loan-tenor"
        );

    const monthlyInput =
        getLoanModalField(
            "loan-monthly"
        );

    const totalElement =
        document.getElementById(
            "loan-calculated-total"
        );

    if (
        !tenorInput ||
        !monthlyInput ||
        !totalElement
    ) {
        return;
    }

    const tenor =
        Number(
            tenorInput.value
        ) || 0;

    const monthly =
        Number(
            monthlyInput.value
        ) || 0;

    const total =
        tenor *
        monthly;

    totalElement.textContent =
        formatRupiah(total);
}


const loanTenorInput =
    getLoanModalField(
        "loan-tenor"
    );

const loanMonthlyInput =
    getLoanModalField(
        "loan-monthly"
    );


if (loanTenorInput) {

    loanTenorInput.addEventListener(
        "input",
        updateLoanCalculation
    );

}


if (loanMonthlyInput) {

    loanMonthlyInput.addEventListener(
        "input",
        updateLoanCalculation
    );

}


/* =====================================================
   SAVE LOAN TO SUPABASE
===================================================== */

document
    .getElementById(
        "loan-form"
    )
    .addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            if (!currentUser) {

                alert(
                    "Sesi login tidak ditemukan."
                );

                return;
            }

            const sourceInput =
                getLoanModalField(
                    "loan-source"
                );

            const amountInput =
                getLoanModalField(
                    "loan-amount"
                );

            const tenorInput =
                getLoanModalField(
                    "loan-tenor"
                );

            const monthlyInput =
                getLoanModalField(
                    "loan-monthly"
                );

            const source =
                sourceInput
                    ?.value
                    .trim();

            const amount =
                Number(
                    amountInput
                        ?.value
                );

            const tenor =
                Number(
                    tenorInput
                        ?.value
                );

            const monthly =
                Number(
                    monthlyInput
                        ?.value
                );

            if (
                !source ||
                !amount ||
                amount <= 0 ||
                !tenor ||
                tenor <= 0 ||
                !monthly ||
                monthly <= 0
            ) {

                alert(
                    "Semua data pinjaman harus diisi dengan benar."
                );

                return;
            }

            const totalPayment =
                tenor *
                monthly;

            const loanData = {

                user_id:
                    currentUser.id,

                source,

                amount,

                tenor,

                monthly,

                total_payment:
                    totalPayment

            };

            try {

                if (editingLoanId) {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("loans")
                            .update(
                                loanData
                            )
                            .eq(
                                "id",
                                editingLoanId
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            );

                    if (error) {
                        throw error;
                    }

                } else {

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("loans")
                            .insert([
                                loanData
                            ]);

                    if (error) {
                        throw error;
                    }

                }

                closeLoanModal();

                await loadLoans();

            } catch (error) {

                console.error(
                    "Gagal menyimpan pinjaman:",
                    error
                );

                alert(
                    "Gagal menyimpan pinjaman: " +
                    error.message
                );

            }

        }
    );


/* =====================================================
   LOAD LOANS FROM SUPABASE
===================================================== */

async function loadLoans() {

    if (!currentUser) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("loans")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        loans =
            data || [];

        renderLoans();

    } catch (error) {

        console.error(
            "Gagal mengambil pinjaman:",
            error
        );

        loans = [];

        renderLoans();

    }
}


/* =====================================================
   RENDER LOANS
===================================================== */

function renderLoans() {

    const container =
        document.getElementById(
            "loan-list-container"
        );

    if (!container) {
        return;
    }

    let totalLoan = 0;

    let totalMonthly = 0;

    let totalPayment = 0;

    loans.forEach(
        loan => {

            totalLoan +=
                Number(
                    loan.amount
                ) || 0;

            totalMonthly +=
                Number(
                    loan.monthly
                ) || 0;

            totalPayment +=
                Number(
                    loan.total_payment
                ) || 0;

        }
    );

    const totalElement =
        document.getElementById(
            "loan-total"
        );

    const monthlyElement =
        document.getElementById(
            "loan-monthly"
        );

    const remainingElement =
        document.getElementById(
            "loan-remaining"
        );

    if (totalElement) {

        totalElement.textContent =
            formatRupiah(totalLoan);

    }

    if (monthlyElement) {

        monthlyElement.textContent =
            formatRupiah(totalMonthly);

    }

    if (remainingElement) {

        remainingElement.textContent =
            formatRupiah(totalPayment);

    }

    if (
        loans.length === 0
    ) {

        container.innerHTML = `

            <div class="content-card">

                <div class="empty-state">

                    Belum ada pinjaman yang dicatat.

                    <br><br>

                    Tekan
                    <strong>+ Pinjaman</strong>
                    untuk menambahkan.

                </div>

            </div>

        `;

        return;
    }

    container.innerHTML =
        loans
            .map(
                loan => {

                    const loanId =
                        String(
                            loan.id
                        );

                    return `

                        <div class="loan-card">

                            <div class="loan-card-header">

                                <div class="loan-source">

                                    <div class="loan-source-icon">
                                        Rp
                                    </div>

                                    <div>

                                        <strong>
                                            ${escapeHTML(
                                                loan.source
                                            )}
                                        </strong>

                                        <span>
                                            ${Number(
                                                loan.tenor
                                            ) || 0}
                                            bulan
                                        </span>

                                    </div>

                                </div>

                                <div class="loan-actions">

                                    <button
                                        class="loan-action"
                                        onclick="editLoan('${loanId}')"
                                        title="Edit"
                                    >
                                        ✎
                                    </button>

                                    <button
                                        class="loan-action delete"
                                        onclick="deleteLoan('${loanId}')"
                                        title="Hapus"
                                    >
                                        ×
                                    </button>

                                </div>

                            </div>

                            <div class="loan-details">

                                <div class="loan-detail">

                                    <span>
                                        Pinjaman
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            loan.amount
                                        )}
                                    </strong>

                                </div>

                                <div class="loan-detail">

                                    <span>
                                        / Bulan
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            loan.monthly
                                        )}
                                    </strong>

                                </div>

                                <div class="loan-detail">

                                    <span>
                                        Total Bayar
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            loan.total_payment
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <div class="loan-remaining">

                                <div class="loan-remaining-row">

                                    <span>
                                        Total kewajiban
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            loan.total_payment
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");
}


/* =====================================================
   EDIT LOAN
===================================================== */

function editLoan(id) {

    const loan =
        loans.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!loan) {
        return;
    }

    openLoanModal(loan);
}


/* =====================================================
   DELETE LOAN
===================================================== */

async function deleteLoan(id) {

    const confirmed =
        confirm(
            "Yakin ingin menghapus pinjaman ini?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            error
        } =
            await supabaseClient
                .from("loans")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (error) {
            throw error;
        }

        await loadLoans();

    } catch (error) {

        console.error(
            "Gagal menghapus pinjaman:",
            error
        );

        alert(
            "Gagal menghapus pinjaman: " +
            error.message
        );

    }
}


/* =====================================================
   QUOTE
===================================================== */

function updateQuote() {

    const element =
        document.getElementById(
            "quote-text"
        );

    if (!element) {
        return;
    }

    const index =
        Math.floor(
            Math.random() *
            quotes.length
        );

    element.textContent =
        quotes[index];
}


/* =====================================================
   START
===================================================== */

checkSession();