/* =====================================================
   KEPRI
   Custom Financial App
===================================================== */


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

/* =====================================================
   CATATAN
===================================================== */

let notes = [];

let editingNoteId = null;

let currentTransactionType = "Pemasukan";

let editingTransactionId = null;

let editingLoanId = null;

let currentPaymentLoanId = null;

let currentSummaryDate = new Date();

let currentHistoryType = "Semua";

let monthlyChart = null;


/* =====================================================
   CATEGORY
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
    "Kelola uangmu sebelum uangmu yang mengelola hidupmu.",
    "Sedikit demi sedikit, lama-lama menjadi stabil.",
    "Keuangan yang rapi membuat keputusan terasa lebih ringan.",
    "Bukan soal berapa banyak yang kamu punya, tapi bagaimana kamu mengelolanya.",
    "Catat pengeluaran hari ini agar tidak bingung besok.",
    "Disiplin kecil dalam keuangan bisa membuat perbedaan besar.",
    "Uang yang terencana lebih berguna daripada uang yang hanya tersisa."
];


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function formatRupiah(value) {
    const number = parseRupiah(value);

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(number);
}


/* =====================================================
   PARSER RUPIAH
===================================================== */

function parseRupiah(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? Math.round(value)
            : 0;
    }

    let text = String(value).trim();

    if (!text) {
        return 0;
    }

    text = text.replace(/[^\d]/g, "");

    if (!text) {
        return 0;
    }

    const number = Number(text);

    return Number.isFinite(number)
        ? Math.round(number)
        : 0;
}


/* =====================================================
   PARSER ANGKA
===================================================== */

function parseNumber(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? Math.round(value)
            : 0;
    }

    const text = String(value).trim();

    if (!text) {
        return 0;
    }

    const direct = Number(text);

    if (Number.isFinite(direct)) {
        return Math.round(direct);
    }

    const cleaned =
        text.replace(/[^\d]/g, "");

    if (!cleaned) {
        return 0;
    }

    const number =
        Number(cleaned);

    return Number.isFinite(number)
        ? Math.round(number)
        : 0;
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
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
   FORMAT TIME
===================================================== */

function formatTime(timeString) {
    if (!timeString) {
        return "-";
    }

    const parts =
        String(timeString).split(":");

    if (parts.length < 2) {
        return timeString;
    }

    return `${parts[0]}:${parts[1]}`;
}


/* =====================================================
   DATE HELPERS
===================================================== */

function normalizeDate(date) {
    const result =
        new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
}


function getTodayDate() {
    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return today;
}


function addMonths(date, months) {
    const result =
        new Date(date);

    const originalDay =
        result.getDate();

    result.setDate(1);

    result.setMonth(
        result.getMonth() + months
    );

    const lastDay =
        new Date(
            result.getFullYear(),
            result.getMonth() + 1,
            0
        ).getDate();

    result.setDate(
        Math.min(
            originalDay,
            lastDay
        )
    );

    return result;
}


function formatDateForInput(date) {
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

    return `${year}-${month}-${day}`;
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
   CATEGORY ICON
===================================================== */

function getCategoryIcon(category) {
    const icons = {
        "Gaji": "💼",
        "Bonus": "🎁",
        "Penjualan": "🛒",
        "Bisnis": "🏢",
        "Investasi": "📈",
        "Hadiah": "🎁",

        "Makanan": "🍜",
        "Transportasi": "🚗",
        "Belanja": "🛍️",
        "Tagihan": "🧾",
        "Hiburan": "🎮",
        "Kesehatan": "❤️",
        "Pendidikan": "📚",
        "Rumah": "🏠",
        "Keluarga": "👨‍👩‍👧",
        "Pinjaman": "💳",

        "Lainnya": "📌"
    };

    return icons[category] || "📌";
}


/* =====================================================
   LOAN DATE STYLE
   Dipasang langsung dari JS agar tidak perlu edit CSS.
===================================================== */

function injectLoanDateStyles() {
    if (
        document.getElementById(
            "kepri-loan-date-small-style"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "kepri-loan-date-small-style";

    style.textContent = `
        .loan-card .loan-due-date {
            margin-top: 10px !important;
            margin-bottom: 8px !important;
            padding: 8px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            border-radius: 8px !important;
        }

        .loan-card .loan-due-date > div:first-child {
            min-width: 0 !important;
        }

        .loan-card .loan-due-date span {
            display: block !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            font-weight: 500 !important;
            margin-bottom: 2px !important;
            opacity: 0.7 !important;
        }

        .loan-card .loan-due-date strong {
            display: block !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
            font-weight: 600 !important;
        }

        .loan-card .loan-due-alert {
            font-size: 10px !important;
            line-height: 1.3 !important;
            padding: 4px 7px !important;
            border-radius: 6px !important;
            white-space: nowrap !important;
        }

        .loan-card .loan-due-paid {
            font-size: 10px !important;
            line-height: 1.3 !important;
            padding: 4px 7px !important;
            border-radius: 6px !important;
            white-space: nowrap !important;
        }

        @media (max-width: 480px) {
            .loan-card .loan-due-date {
                padding: 7px 9px !important;
            }

            .loan-card .loan-due-date span {
                font-size: 10px !important;
            }

            .loan-card .loan-due-date strong {
                font-size: 12px !important;
            }

            .loan-card .loan-due-alert,
            .loan-card .loan-due-paid {
                font-size: 9px !important;
                padding: 3px 6px !important;
            }
        }
    `;

    document.head.appendChild(style);
}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById(
        "login-form"
    );

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const email =
                document
                    .getElementById(
                        "login-email"
                    )
                    .value
                    .trim();

            const password =
                document.getElementById(
                    "login-password"
                ).value;

            const errorElement =
                document.getElementById(
                    "login-error"
                );

            errorElement.textContent = "";

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
                errorElement.textContent =
                    error.message;

                return;
            }

            currentUser =
                data.user;

            await initializeApp();
        }
    );
}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

const togglePassword =
    document.getElementById(
        "toggle-password"
    );

if (togglePassword) {
    togglePassword.addEventListener(
        "click",
        function () {
            const passwordInput =
                document.getElementById(
                    "login-password"
                );

            if (
                passwordInput.type ===
                "password"
            ) {
                passwordInput.type =
                    "text";

                togglePassword.textContent =
                    "🙈";
            } else {
                passwordInput.type =
                    "password";

                togglePassword.textContent =
                    "👁";
            }
        }
    );
}


/* =====================================================
   LOGOUT
===================================================== */

const logoutButton =
    document.getElementById(
        "logout-btn"
    );

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        async function () {
            await supabaseClient
                .auth
                .signOut();

            currentUser = null;

            transactions = [];

            loans = [];

            notes = [];

            editingNoteId = null;

            document
                .getElementById("app")
                ?.classList
                .add("hidden");

            document
                .getElementById("login-page")
                ?.classList
                .remove("hidden");
        }
    );
}


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeApp() {
    injectLoanDateStyles();

    document
        .getElementById("login-page")
        ?.classList
        .add("hidden");

    document
        .getElementById("app")
        ?.classList
        .remove("hidden");

    const accountEmail =
        document.getElementById(
            "account-email"
        );

    if (accountEmail) {
        accountEmail.textContent =
            currentUser?.email || "-";
    }

    await loadTransactions();

    await loadLoans();

    await loadNotes();

    updateQuote();

    showPage("home");
}


/* =====================================================
   SESSION
===================================================== */

async function checkSession() {
    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();

    if (error) {
        console.error(
            "Session error:",
            error
        );

        return;
    }

    if (data.session) {
        currentUser =
            data.session.user;

        await initializeApp();
    }
}


supabaseClient
    .auth
    .onAuthStateChange(
        function (
            event,
            session
        ) {
            if (
                event ===
                "SIGNED_IN"
            ) {
                currentUser =
                    session?.user || null;
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
        console.error(
            "Gagal mengambil transaksi:",
            error
        );

        return;
    }

    transactions =
        data || [];

    updateHistoryCategories();

    renderHome();

    renderHistory();

    renderSummary();

    renderRecap();
}


/* =====================================================
   HOME
===================================================== */

function renderHome() {
    let income = 0;

    let expense = 0;

    transactions.forEach(
        function (transaction) {
            const amount =
                parseRupiah(
                    transaction.nominal
                );

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {
                income += amount;
            } else if (
                transaction.jenis ===
                "Pengeluaran"
            ) {
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
            function (page) {
                page.classList.remove(
                    "active"
                );
            }
        );

    const targetPage =
        document.getElementById(
            `page-${pageName}`
        );

    if (targetPage) {
        targetPage.classList.add(
            "active"
        );
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(
            function (item) {
                item.classList.toggle(
                    "active",
                    item.dataset.page ===
                    pageName
                );
            }
        );

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

    if (pageName === "notes") {
        renderNotes();
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

    if (!modal || !form) {
        return;
    }

    form.reset();

    editingTransactionId =
        transaction?.id || null;

    currentTransactionType =
        type;

    const title =
        document.getElementById(
            "transaction-modal-title"
        );

    if (title) {
        title.textContent =
            transaction
                ? "Edit Transaksi"
                : "Tambah Transaksi";
    }

    const typeInput =
        document.getElementById(
            "transaction-type"
        );

    if (typeInput) {
        typeInput.value =
            transaction?.jenis || type;
    }

    updateCategoryOptions(
        transaction?.jenis || type,
        transaction?.kategori || ""
    );

    if (transaction) {
        document.getElementById(
            "transaction-amount"
        ).value =
            parseRupiah(
                transaction.nominal
            );

        document.getElementById(
            "transaction-date"
        ).value =
            transaction.tanggal;

        document.getElementById(
            "transaction-description"
        ).value =
            transaction.keterangan || "";
    } else {
        document.getElementById(
            "transaction-date"
        ).value =
            formatDateForInput(
                new Date()
            );
    }

    modal
        .classList
        .remove("hidden");
}


function closeTransactionModal() {
    const modal =
        document.getElementById(
            "transaction-modal"
        );

    if (modal) {
        modal
            .classList
            .add("hidden");
    }

    editingTransactionId = null;
}


function updateCategoryOptions(
    type,
    selectedCategory = ""
) {
    const select =
        document.getElementById(
            "transaction-category"
        );

    if (!select) {
        return;
    }

    const categories =
        type === "Pemasukan"
            ? incomeCategories
            : expenseCategories;

    select.innerHTML = "";

    categories.forEach(
        function (category) {
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
    ?.addEventListener(
        "change",
        function () {
            currentTransactionType =
                this.value;

            updateCategoryOptions(
                this.value
            );
        }
    );


document
    .getElementById(
        "transaction-form"
    )
    ?.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            if (!currentUser) {
                alert(
                    "Sesi login tidak ditemukan."
                );

                return;
            }

            const type =
                document.getElementById(
                    "transaction-type"
                ).value;

            const amount =
                parseRupiah(
                    document.getElementById(
                        "transaction-amount"
                    ).value
                );

            const category =
                document.getElementById(
                    "transaction-category"
                ).value;

            const date =
                document.getElementById(
                    "transaction-date"
                ).value;

            const description =
                document.getElementById(
                    "transaction-description"
                ).value.trim();

            if (amount <= 0) {
                alert(
                    "Nominal harus lebih dari 0."
                );

                return;
            }

            if (!date) {
                alert(
                    "Tanggal wajib diisi."
                );

                return;
            }

            const transactionData = {
                user_id:
                    currentUser.id,

                jenis:
                    type,

                nominal:
                    Math.round(amount),

                kategori:
                    category,

                tanggal:
                    date,

                keterangan:
                    description
            };

            let error = null;

            if (editingTransactionId) {
                const result =
                    await supabaseClient
                        .from("transactions")
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

                error =
                    result.error;
            } else {
                const result =
                    await supabaseClient
                        .from("transactions")
                        .insert([
                            transactionData
                        ]);

                error =
                    result.error;
            }

            if (error) {
                console.error(
                    "Transaction error:",
                    error
                );

                alert(
                    "Gagal menyimpan transaksi.\n\n" +
                    error.message
                );

                return;
            }

            closeTransactionModal();

            await loadTransactions();
        }
    );


/* =====================================================
   DETAIL TRANSACTION
===================================================== */

function openDetailModal(id) {
    const transaction =
        transactions.find(
            function (item) {
                return String(item.id) ===
                    String(id);
            }
        );

    if (!transaction) {
        return;
    }

    const detail =
        document.getElementById(
            "transaction-detail"
        );

    if (!detail) {
        return;
    }

    const isIncome =
        transaction.jenis ===
        "Pemasukan";

    detail.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">
                Nominal
            </div>

            <div class="detail-amount ${isIncome ? "income" : "expense"}">
                ${isIncome ? "+" : "-"}${formatRupiah(transaction.nominal)}
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
                ${getCategoryIcon(transaction.kategori)}
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
        ?.classList
        .remove("hidden");
}


function closeDetailModal() {
    document
        .getElementById(
            "detail-modal"
        )
        ?.classList
        .add("hidden");
}


function editTransaction(id) {
    const transaction =
        transactions.find(
            function (item) {
                return String(item.id) ===
                    String(id);
            }
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
            "Hapus transaksi ini?"
        );

    if (!confirmed) {
        return;
    }

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
        console.error(
            error
        );

        alert(
            "Gagal menghapus transaksi.\n\n" +
            error.message
        );

        return;
    }

    closeDetailModal();

    await loadTransactions();
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
            function (tab) {
                tab.classList.toggle(
                    "active",
                    tab.dataset.type ===
                    type
                );
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

    const month =
        document
            .getElementById(
                "history-month"
            )
            ?.value || "";

    const category =
        document
            .getElementById(
                "history-category"
            )
            ?.value || "";

    const search =
        document
            .getElementById(
                "history-search"
            )
            ?.value
            .trim()
            .toLowerCase() || "";

    let filtered =
        [...transactions];

    if (
        currentHistoryType !==
        "Semua"
    ) {
        filtered =
            filtered.filter(
                function (transaction) {
                    return (
                        transaction.jenis ===
                        currentHistoryType
                    );
                }
            );
    }

    if (month) {
        filtered =
            filtered.filter(
                function (transaction) {
                    return String(
                        transaction.tanggal
                    ).startsWith(month);
                }
            );
    }

    if (category) {
        filtered =
            filtered.filter(
                function (transaction) {
                    return (
                        transaction.kategori ===
                        category
                    );
                }
            );
    }

    if (search) {
        filtered =
            filtered.filter(
                function (transaction) {
                    const text =
                        `${transaction.keterangan || ""} ${transaction.kategori || ""}`
                            .toLowerCase();

                    return text.includes(
                        search
                    );
                }
            );
    }

    if (!filtered.length) {
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
                function (transaction) {
                    const isIncome =
                        transaction.jenis ===
                        "Pemasukan";

                    return `
                        <div
                            class="transaction-item ${isIncome ? "income" : "expense"}"
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
                                    •
                                    ${formatDate(
                                        transaction.tanggal
                                    )}
                                </span>
                            </div>

                            <div class="transaction-item-amount">
                                ${isIncome ? "+" : "-"}
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
    ?.addEventListener(
        "change",
        renderHistory
    );


document
    .getElementById(
        "history-category"
    )
    ?.addEventListener(
        "change",
        renderHistory
    );


document
    .getElementById(
        "history-search"
    )
    ?.addEventListener(
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

    const currentValue =
        select.value;

    const categories =
        [
            ...new Set(
                transactions
                    .map(
                        function (
                            transaction
                        ) {
                            return transaction.kategori;
                        }
                    )
                    .filter(Boolean)
            )
        ].sort();

    select.innerHTML = `
        <option value="">
            Semua kategori
        </option>
    `;

    categories.forEach(
        function (category) {
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

    if (
        categories.includes(
            currentValue
        )
    ) {
        select.value =
            currentValue;
    }
}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary() {
    const month =
        currentSummaryDate.getMonth();

    const year =
        currentSummaryDate.getFullYear();

    const monthTransactions =
        transactions.filter(
            function (transaction) {
                const date =
                    new Date(
                        transaction.tanggal
                    );

                return (
                    date.getMonth() ===
                    month &&
                    date.getFullYear() ===
                    year
                );
            }
        );

    let income = 0;

    let expense = 0;

    monthTransactions.forEach(
        function (transaction) {
            const amount =
                parseRupiah(
                    transaction.nominal
                );

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {
                income += amount;
            } else if (
                transaction.jenis ===
                "Pengeluaran"
            ) {
                expense += amount;
            }
        }
    );

    const balance =
        income - expense;

    const currentMonth =
        document.getElementById(
            "current-month"
        );

    const summaryIncome =
        document.getElementById(
            "summary-income"
        );

    const summaryExpense =
        document.getElementById(
            "summary-expense"
        );

    const summaryBalance =
        document.getElementById(
            "summary-balance"
        );

    const summaryCount =
        document.getElementById(
            "summary-count"
        );

    const percentageElement =
        document.getElementById(
            "expense-percentage"
        );

    const progressElement =
        document.getElementById(
            "expense-progress"
        );

    if (currentMonth) {
        currentMonth.textContent =
            currentSummaryDate.toLocaleDateString(
                "id-ID",
                {
                    month: "long",
                    year: "numeric"
                }
            );
    }

    if (summaryIncome) {
        summaryIncome.textContent =
            formatRupiah(income);
    }

    if (summaryExpense) {
        summaryExpense.textContent =
            formatRupiah(expense);
    }

    if (summaryBalance) {
        summaryBalance.textContent =
            formatRupiah(balance);
    }

    if (summaryCount) {
        summaryCount.textContent =
            monthTransactions.length;
    }

    const percentage =
        income > 0
            ? Math.round(
                (
                    expense /
                    income
                ) * 100
            )
            : 0;

    if (percentageElement) {
        percentageElement.textContent =
            `${percentage}%`;
    }

    if (progressElement) {
        progressElement.style.width =
            `${Math.min(
                percentage,
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
   MONTHLY CHART
===================================================== */

function renderMonthlyChart(
    income,
    expense
) {
    const canvas =
        document.getElementById(
            "monthly-chart"
        );

    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {
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
                            data: [
                                income,
                                expense
                            ],

                            backgroundColor: [
                                "#22b07d",
                                "#ef6262"
                            ],

                            borderRadius: 8
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,

                            ticks: {
                                callback:
                                    function (
                                        value
                                    ) {
                                        return formatRupiah(
                                            value
                                        );
                                    }
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
            function (transaction) {
                return (
                    transaction.jenis ===
                    "Pengeluaran"
                );
            }
        );

    if (!expenses.length) {
        container.innerHTML = `
            <div class="empty-state">
                Belum ada pengeluaran bulan ini.
            </div>
        `;

        return;
    }

    const categoryTotals = {};

    expenses.forEach(
        function (transaction) {
            const category =
                transaction.kategori ||
                "Lainnya";

            categoryTotals[category] =
                (
                    categoryTotals[category] ||
                    0
                ) +
                parseRupiah(
                    transaction.nominal
                );
        }
    );

    const sorted =
        Object.entries(
            categoryTotals
        ).sort(
            function (a, b) {
                return b[1] - a[1];
            }
        );

    container.innerHTML =
        sorted
            .map(
                function (
                    [category, total]
                ) {
                    return `
                        <div class="category-item">
                            <div class="category-icon">
                                ${getCategoryIcon(
                                    category
                                )}
                            </div>

                            <div class="category-info">
                                <strong>
                                    ${escapeHTML(
                                        category
                                    )}
                                </strong>

                                <span>
                                    Pengeluaran
                                </span>
                            </div>

                            <div class="category-total">
                                ${formatRupiah(
                                    total
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
        "prev-month"
    )
    ?.addEventListener(
        "click",
        function () {
            currentSummaryDate.setMonth(
                currentSummaryDate.getMonth() - 1
            );

            renderSummary();
        }
    );


document
    .getElementById(
        "next-month"
    )
    ?.addEventListener(
        "click",
        function () {
            currentSummaryDate.setMonth(
                currentSummaryDate.getMonth() + 1
            );

            renderSummary();
        }
    );


/* =====================================================
   RECAP
===================================================== */

function renderRecap() {
    let income = 0;

    let expense = 0;

    transactions.forEach(
        function (transaction) {
            const amount =
                parseRupiah(
                    transaction.nominal
                );

            if (
                transaction.jenis ===
                "Pemasukan"
            ) {
                income += amount;
            } else if (
                transaction.jenis ===
                "Pengeluaran"
            ) {
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

    const recapCount =
        document.getElementById(
            "recap-count"
        );

    const recapTotal =
        document.getElementById(
            "recap-table-total"
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

    if (recapCount) {
        recapCount.textContent =
            `${transactions.length} transaksi`;
    }

    if (recapTotal) {
        recapTotal.textContent =
            formatRupiah(balance);
    }

    const tbody =
        document.getElementById(
            "recap-table-body"
        );

    const empty =
        document.getElementById(
            "recap-empty"
        );

    if (!tbody || !empty) {
        return;
    }

    if (!transactions.length) {
        tbody.innerHTML = "";

        empty
            .classList
            .remove("hidden");

        return;
    }

    empty
        .classList
        .add("hidden");


    /* =================================================
       URUTKAN TRANSAKSI
       PALING LAMA → PALING BARU
    ================================================= */

    const chronological =
        [...transactions].sort(
            function (a, b) {

                const dateA =
                    new Date(
                        `${a.tanggal}T00:00:00`
                    );

                const dateB =
                    new Date(
                        `${b.tanggal}T00:00:00`
                    );

                return (
                    dateA - dateB
                );
            }
        );


    /* =================================================
       HITUNG SALDO BERJALAN
       MENGIKUTI URUTAN TABEL
    ================================================= */

    let runningBalance = 0;

    tbody.innerHTML =
        chronological
            .map(
                function (transaction) {

                    const isIncome =
                        transaction.jenis ===
                        "Pemasukan";

                    const amount =
                        parseRupiah(
                            transaction.nominal
                        );


                    /* ---------------------------------
                       PEMASUKAN = TAMBAH
                       PENGELUARAN = KURANG
                    --------------------------------- */

                    if (isIncome) {
                        runningBalance +=
                            amount;
                    } else if (
                        transaction.jenis ===
                        "Pengeluaran"
                    ) {
                        runningBalance -=
                            amount;
                    }


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
                                    class="type-badge ${isIncome ? "income" : "expense"}"
                                >
                                    ${escapeHTML(
                                        transaction.jenis
                                    )}
                                </span>
                            </td>

                            <td
                                class="${isIncome ? "recap-income" : "recap-expense"} text-right"
                            >
                                ${isIncome ? "+" : "-"}${formatRupiah(
                                    amount
                                )}
                            </td>

                            <td class="text-right">
                                ${formatRupiah(
                                    runningBalance
                                )}
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


/* =====================================================
   LOAN MODAL FIELD
===================================================== */

function getLoanModalField(id) {
    const form =
        document.getElementById(
            "loan-form"
        );

    const aliases = {
        "loan-source": [
            "loan-source",
            "loan-lender",
            "loan-name"
        ],

        "loan-amount": [
            "loan-amount",
            "loan-principal",
            "loan-price"
        ],

        "loan-tenor": [
            "loan-tenor",
            "loan-duration"
        ],

        "loan-monthly": [
            "loan-monthly",
            "loan-installment",
            "loan-cicilan",
            "loan-cicilan-bulanan",
            "monthly-payment"
        ],

        "loan-start-date": [
            "loan-start-date",
            "loan-date",
            "loan-tanggal"
        ]
    };

    const possibleIds =
        aliases[id] || [id];

    if (form) {
        for (
            const possibleId of possibleIds
        ) {
            const element =
                form.querySelector(
                    `#${possibleId}`
                );

            if (element) {
                return element;
            }

            const nameElement =
                form.querySelector(
                    `[name="${possibleId}"]`
                );

            if (nameElement) {
                return nameElement;
            }
        }

        if (id === "loan-monthly") {
            const moneyInputs =
                form.querySelectorAll(
                    'input[type="number"], input[type="text"]'
                );

            for (
                const input of moneyInputs
            ) {
                const placeholder =
                    (
                        input.placeholder ||
                        ""
                    ).toLowerCase();

                const name =
                    (
                        input.name ||
                        ""
                    ).toLowerCase();

                const inputId =
                    (
                        input.id ||
                        ""
                    ).toLowerCase();

                if (
                    placeholder.includes("cicilan") ||
                    placeholder.includes("per bulan") ||
                    name.includes("monthly") ||
                    name.includes("installment") ||
                    inputId.includes("monthly") ||
                    inputId.includes("cicilan")
                ) {
                    return input;
                }
            }
        }
    }

    for (
        const possibleId of possibleIds
    ) {
        const element =
            document.getElementById(
                possibleId
            );

        if (element) {
            return element;
        }

        const nameElement =
            document.querySelector(
                `[name="${possibleId}"]`
            );

        if (nameElement) {
            return nameElement;
        }
    }

    return null;
}


/* =====================================================
   LOAN START DATE
===================================================== */

function getLoanStartDate(loan) {
    if (!loan) {
        return getTodayDate();
    }

    if (loan.loan_date) {
        const date =
            new Date(
                String(
                    loan.loan_date
                ).substring(0, 10)
            );

        if (!isNaN(date.getTime())) {
            return normalizeDate(date);
        }
    }

    if (loan.created_at) {
        const created =
            new Date(
                loan.created_at
            );

        if (!isNaN(created.getTime())) {
            return normalizeDate(
                created
            );
        }
    }

    return getTodayDate();
}


/* =====================================================
   LOAN START DATE FOR INPUT
===================================================== */

function getLoanStartDateForInput(loan) {
    if (loan?.loan_date) {
        return String(
            loan.loan_date
        ).substring(0, 10);
    }

    if (loan?.created_at) {
        const created =
            new Date(
                loan.created_at
            );

        if (!isNaN(created.getTime())) {
            return formatDateForInput(
                created
            );
        }
    }

    return formatDateForInput(
        getTodayDate()
    );
}


/* =====================================================
   DAYS DIFFERENCE
===================================================== */

function getDaysDifference(
    targetDate,
    fromDate = null
) {
    const target =
        normalizeDate(targetDate);

    const from =
        normalizeDate(
            fromDate || getTodayDate()
        );

    const difference =
        target.getTime() -
        from.getTime();

    return Math.ceil(
        difference /
        (
            1000 *
            60 *
            60 *
            24
        )
    );
}


/* =====================================================
   LOAN FINAL DUE DATE
   PENTING:
   Tidak membaca atau membutuhkan loan.due_date.
   Jatuh tempo dihitung dari loan_date + tenor.
===================================================== */

function getLoanFinalDueDate(loan) {
    if (!loan) {
        return null;
    }

    const startDate =
        getLoanStartDate(loan);

    const tenor =
        parseNumber(
            loan.tenor
        );

    if (
        tenor > 0 &&
        startDate
    ) {
        return normalizeDate(
            addMonths(
                startDate,
                tenor
            )
        );
    }

    return null;
}


/* =====================================================
   LOAN DUE STATUS
===================================================== */

function getLoanDueStatus(loan) {
    if (!loan) {
        return {
            status: "normal",
            days: 0,
            text: ""
        };
    }

    const remainingTenor =
        getLoanRemainingTenor(
            loan
        );

    if (remainingTenor <= 0) {
        return {
            status: "paid",
            days: 0,
            text: "Pinjaman sudah lunas."
        };
    }

    const dueDate =
        getLoanFinalDueDate(
            loan
        );

    if (!dueDate) {
        return {
            status: "normal",
            days: 0,
            text: ""
        };
    }

    const days =
        getDaysDifference(
            dueDate
        );

    if (days < 0) {
        const overdueDays =
            Math.abs(days);

        return {
            status: "overdue",
            days,
            text:
                `Terlambat ${overdueDays} hari.`
        };
    }

    if (days === 0) {
        return {
            status: "today",
            days,
            text:
                "Jatuh tempo hari ini."
        };
    }

    if (days <= 5) {
        return {
            status: "warning",
            days,
            text:
                `Jatuh tempo ${days} hari lagi.`
        };
    }

    return {
        status: "normal",
        days,
        text:
            `Jatuh tempo ${days} hari lagi.`
    };
}


/* =====================================================
   LOAN DUE DATE HTML
===================================================== */

function getLoanDueDateHTML(loan) {
    const remainingTenor =
        getLoanRemainingTenor(
            loan
        );

    const dueDate =
        getLoanFinalDueDate(
            loan
        );

    if (!dueDate) {
        return "";
    }

    if (remainingTenor <= 0) {
        return `
            <div class="loan-due-date">
                <div>
                    <span>
                        Tanggal Jatuh Tempo
                    </span>

                    <strong>
                        ${formatDate(
                            dueDate
                        )}
                    </strong>
                </div>

                <div class="loan-due-paid">
                    Pinjaman Lunas
                </div>
            </div>
        `;
    }

    const dueStatus =
        getLoanDueStatus(
            loan
        );

    let statusClass = "";

    if (
        dueStatus.status ===
        "warning"
    ) {
        statusClass =
            "loan-due-warning";
    } else if (
        dueStatus.status ===
        "today"
    ) {
        statusClass =
            "loan-due-today";
    } else if (
        dueStatus.status ===
        "overdue"
    ) {
        statusClass =
            "loan-due-overdue";
    }

    const warningHTML =
        (
            dueStatus.status === "warning" ||
            dueStatus.status === "today" ||
            dueStatus.status === "overdue"
        )
            ? `
                <div class="loan-due-alert ${statusClass}">
                    ${
                        dueStatus.status ===
                        "overdue"
                            ? "⚠"
                            : "!"
                    }

                    ${escapeHTML(
                        dueStatus.text
                    )}
                </div>
            `
            : "";

    return `
        <div class="loan-due-date">
            <div>
                <span>
                    Tanggal Jatuh Tempo
                </span>

                <strong>
                    ${formatDate(
                        dueDate
                    )}
                </strong>
            </div>

            ${warningHTML}
        </div>
    `;
}


/* =====================================================
   OPEN LOAN MODAL
===================================================== */

function openLoanModal(
    loan = null
) {
    const modal =
        document.getElementById(
            "loan-modal"
        );

    const form =
        document.getElementById(
            "loan-form"
        );

    if (!modal || !form) {
        console.error(
            "loan-modal atau loan-form tidak ditemukan."
        );

        return;
    }

    form.reset();

    editingLoanId =
        loan?.id || null;

    const title =
        document.getElementById(
            "loan-modal-title"
        );

    if (title) {
        title.textContent =
            loan
                ? "Edit Pinjaman"
                : "Tambah Pinjaman";
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

    const startDateInput =
        getLoanModalField(
            "loan-start-date"
        );

    if (loan) {
        if (sourceInput) {
            sourceInput.value =
                loan.source || "";
        }

        if (amountInput) {
            amountInput.value =
                parseRupiah(
                    loan.amount
                ) || "";
        }

        if (tenorInput) {
            tenorInput.value =
                parseNumber(
                    loan.tenor
                ) || "";
        }

        if (monthlyInput) {
            monthlyInput.value =
                parseRupiah(
                    loan.monthly
                ) || "";
        }

        if (startDateInput) {
            startDateInput.value =
                getLoanStartDateForInput(
                    loan
                );
        }
    } else {
        const today =
            formatDateForInput(
                getTodayDate()
            );

        if (startDateInput) {
            startDateInput.value =
                today;
        }
    }

    updateLoanCalculation();

    modal
        .classList
        .remove("hidden");
}


/* =====================================================
   CLOSE LOAN MODAL
===================================================== */

function closeLoanModal() {
    const modal =
        document.getElementById(
            "loan-modal"
        );

    if (modal) {
        modal
            .classList
            .add("hidden");
    }

    editingLoanId = null;
}


/* =====================================================
   LOAN CALCULATION
===================================================== */

function updateLoanCalculation() {
    const monthlyInput =
        getLoanModalField(
            "loan-monthly"
        );

    const tenorInput =
        getLoanModalField(
            "loan-tenor"
        );

    const totalElement =
        document.getElementById(
            "loan-calculated-total"
        );

    if (
        !monthlyInput ||
        !tenorInput ||
        !totalElement
    ) {
        return;
    }

    const monthly =
        parseRupiah(
            monthlyInput.value
        );

    const tenor =
        parseNumber(
            tenorInput.value
        );

    const total =
        Math.round(
            monthly * tenor
        );

    totalElement.textContent =
        formatRupiah(total);
}


/* =====================================================
   LOAN CALCULATION EVENTS
===================================================== */

const loanForm =
    document.getElementById(
        "loan-form"
    );

if (loanForm) {
    loanForm.addEventListener(
        "input",
        function () {
            updateLoanCalculation();
        }
    );

    loanForm.addEventListener(
        "change",
        function () {
            updateLoanCalculation();
        }
    );
}


/* =====================================================
   SAVE LOAN
   FIX:
   TIDAK MENGIRIM due_date KE SUPABASE.
===================================================== */

document
    .getElementById(
        "loan-form"
    )
    ?.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            if (!currentUser) {
                alert(
                    "Sesi login tidak ditemukan.\n\nSilakan login kembali."
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

            const startDateInput =
                getLoanModalField(
                    "loan-start-date"
                );

            if (
                !sourceInput ||
                !amountInput ||
                !tenorInput ||
                !monthlyInput ||
                !startDateInput
            ) {
                console.error(
                    "FIELD PINJAMAN TIDAK LENGKAP",
                    {
                        sourceInput,
                        amountInput,
                        tenorInput,
                        monthlyInput,
                        startDateInput
                    }
                );

                alert(
                    "Field pinjaman tidak ditemukan."
                );

                return;
            }

            const source =
                String(
                    sourceInput.value || ""
                ).trim();

            const amount =
                parseRupiah(
                    amountInput.value
                );

            const tenor =
                parseNumber(
                    tenorInput.value
                );

            const monthly =
                parseRupiah(
                    monthlyInput.value
                );

            const loanDate =
                String(
                    startDateInput.value || ""
                ).trim();

            if (!source) {
                alert(
                    "Sumber pinjaman wajib diisi."
                );

                sourceInput.focus();

                return;
            }

            if (!loanDate) {
                alert(
                    "Tanggal peminjaman wajib diisi."
                );

                startDateInput.focus();

                return;
            }

            if (amount <= 0) {
                alert(
                    "Jumlah pinjaman harus lebih dari 0."
                );

                amountInput.focus();

                return;
            }

            if (tenor <= 0) {
                alert(
                    "Tenor harus lebih dari 0."
                );

                tenorInput.focus();

                return;
            }

            if (monthly <= 0) {
                alert(
                    "Cicilan per bulan harus lebih dari 0."
                );

                monthlyInput.focus();

                return;
            }

            const startDateObject =
                new Date(
                    `${loanDate}T00:00:00`
                );

            if (
                isNaN(
                    startDateObject.getTime()
                )
            ) {
                alert(
                    "Tanggal peminjaman tidak valid."
                );

                startDateInput.focus();

                return;
            }

            /*
             * JATUH TEMPO TETAP DIHITUNG,
             * TAPI TIDAK DISIMPAN KE KOLOM DATABASE.
             *
             * Contoh:
             * 26 Sep 2026 + 6 bulan
             * = 26 Mar 2027
             */

            const dueDateObject =
                addMonths(
                    startDateObject,
                    tenor
                );

            const dueDate =
                formatDateForInput(
                    dueDateObject
                );

            const totalPayment =
                Math.round(
                    monthly * tenor
                );

            /*
             * PERHATIKAN:
             * Tidak ada due_date di object ini.
             *
             * Ini yang memperbaiki error:
             * "Could not find the 'due_date' column..."
             */

            const loanData = {
                user_id:
                    currentUser.id,

                source:
                    source,

                loan_date:
                    loanDate,

                amount:
                    Math.round(amount),

                tenor:
                    Math.round(tenor),

                monthly:
                    Math.round(monthly),

                total_payment:
                    Math.round(totalPayment)
            };

            let result;

            const wasEditing =
                Boolean(
                    editingLoanId
                );

            try {
                if (wasEditing) {
                    result =
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
                            )
                            .select();
                } else {
                    result =
                        await supabaseClient
                            .from("loans")
                            .insert([
                                {
                                    ...loanData,
                                    paid_tenor: 0
                                }
                            ])
                            .select();
                }
            } catch (error) {
                console.error(
                    "Exception saat menyimpan pinjaman:",
                    error
                );

                alert(
                    "Gagal menyimpan pinjaman.\n\n" +
                    (
                        error?.message ||
                        "Terjadi kesalahan saat menghubungi server."
                    )
                );

                return;
            }

            if (result?.error) {
                console.error(
                    "Supabase loans error:",
                    result.error
                );

                alert(
                    "Gagal menyimpan pinjaman.\n\n" +
                    result.error.message
                );

                return;
            }

            closeLoanModal();

            await loadLoans();

            alert(
                wasEditing
                    ? "Pinjaman berhasil diperbarui."
                    : "Pinjaman berhasil ditambahkan."
            );
        }
    );


/* =====================================================
   LOAD LOANS
===================================================== */

async function loadLoans() {
    if (!currentUser) {
        return;
    }

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
        console.error(
            "Gagal mengambil pinjaman:",
            error
        );

        return;
    }

    loans =
        data || [];

    renderLoans();
}


/* =====================================================
   LOAN CALC HELPERS
===================================================== */

function getLoanPaidTenor(loan) {
    return Math.max(
        0,
        parseNumber(
            loan?.paid_tenor
        )
    );
}


function getLoanRemainingTenor(loan) {
    const tenor =
        parseNumber(
            loan?.tenor
        );

    const paidTenor =
        getLoanPaidTenor(
            loan
        );

    return Math.max(
        0,
        tenor - paidTenor
    );
}


/* =====================================================
   TOTAL PAYMENT
===================================================== */

function getLoanTotalPayment(loan) {
    const tenor =
        parseNumber(
            loan?.tenor
        );

    const monthly =
        parseRupiah(
            loan?.monthly
        );

    return Math.round(
        monthly * tenor
    );
}


/* =====================================================
   PAID AMOUNT
===================================================== */

function getLoanPaidAmount(loan) {
    const paidTenor =
        getLoanPaidTenor(
            loan
        );

    const monthly =
        parseRupiah(
            loan?.monthly
        );

    return Math.round(
        paidTenor * monthly
    );
}


/* =====================================================
   REMAINING AMOUNT
===================================================== */

function getLoanRemainingAmount(loan) {
    return Math.max(
        0,

        getLoanTotalPayment(
            loan
        ) -
        getLoanPaidAmount(
            loan
        )
    );
}


/* =====================================================
   RENDER LOANS
===================================================== */

function renderLoans() {
    injectLoanDateStyles();

    const container =
        document.getElementById(
            "loan-list-container"
        );

    if (!container) {
        return;
    }

    let totalLoan = 0;

    let totalMonthly = 0;

    let totalRemaining = 0;

    loans.forEach(
        function (loan) {
            totalLoan +=
                parseRupiah(
                    loan.amount
                );

            totalMonthly +=
                parseRupiah(
                    loan.monthly
                );

            totalRemaining +=
                getLoanRemainingAmount(
                    loan
                );
        }
    );

    const loanTotalElement =
        document.getElementById(
            "loan-total"
        );

    if (loanTotalElement) {
        loanTotalElement.textContent =
            formatRupiah(
                totalLoan
            );
    }

    const loanMonthlyElement =
        document.getElementById(
            "loan-monthly"
        );

    if (
        loanMonthlyElement &&
        !(
            loanMonthlyElement.tagName === "INPUT" ||
            loanMonthlyElement.tagName === "SELECT" ||
            loanMonthlyElement.tagName === "TEXTAREA"
        )
    ) {
        loanMonthlyElement.textContent =
            formatRupiah(
                totalMonthly
            );
    }

    const loanRemainingElement =
        document.getElementById(
            "loan-remaining"
        );

    if (loanRemainingElement) {
        loanRemainingElement.textContent =
            formatRupiah(
                totalRemaining
            );
    }

    if (!loans.length) {
        container.innerHTML = `
            <div class="content-card">
                <div class="empty-state">
                    Belum ada pinjaman.
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML =
        loans
            .map(
                function (loan) {
                    const tenor =
                        parseNumber(
                            loan.tenor
                        );

                    const monthly =
                        parseRupiah(
                            loan.monthly
                        );

                    const totalPayment =
                        getLoanTotalPayment(
                            loan
                        );

                    const paidTenor =
                        getLoanPaidTenor(
                            loan
                        );

                    const remainingTenor =
                        getLoanRemainingTenor(
                            loan
                        );

                    const paidAmount =
                        getLoanPaidAmount(
                            loan
                        );

                    const remainingAmount =
                        getLoanRemainingAmount(
                            loan
                        );

                    const paidPercentage =
                        totalPayment > 0
                            ? Math.min(
                                100,
                                Math.round(
                                    (
                                        paidAmount /
                                        totalPayment
                                    ) * 100
                                )
                            )
                            : 0;

                    const isPaidOff =
                        remainingTenor <= 0 ||
                        remainingAmount <= 0;

                    const startDate =
                        getLoanStartDateForInput(
                            loan
                        );

                    /*
                     * Jatuh tempo dihitung langsung
                     * dari tanggal peminjaman + tenor.
                     * Tidak mengambil loan.due_date.
                     */

                    const dueDate =
                        getLoanFinalDueDate(
                            loan
                        );

                    const dueDateHTML =
                        getLoanDueDateHTML(
                            loan
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
                                            ${tenor} bulan
                                        </span>
                                    </div>

                                </div>

                                <div class="loan-actions">

                                    <button
                                        class="loan-action"
                                        onclick="editLoan('${loan.id}')"
                                        title="Edit"
                                    >
                                        ✎
                                    </button>

                                    <button
                                        class="loan-action delete"
                                        onclick="deleteLoan('${loan.id}')"
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
                                        Cicilan
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            monthly
                                        )}
                                    </strong>
                                </div>

                                <div class="loan-detail">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            totalPayment
                                        )}
                                    </strong>
                                </div>

                                <div class="loan-detail">
                                    <span>
                                        Sudah Bayar
                                    </span>

                                    <strong class="loan-paid-value">
                                        ${paidTenor} tenor
                                    </strong>
                                </div>

                                <div class="loan-detail">
                                    <span>
                                        Sisa Tenor
                                    </span>

                                    <strong class="loan-remaining-tenor">
                                        ${remainingTenor} tenor
                                    </strong>
                                </div>

                                <div class="loan-detail">
                                    <span>
                                        Persentase
                                    </span>

                                    <strong>
                                        ${paidPercentage}%
                                    </strong>
                                </div>

                            </div>


                            <!-- TANGGAL PEMINJAMAN -->

                            <div class="loan-due-date">

                                <div>

                                    <span>
                                        Tanggal Peminjaman
                                    </span>

                                    <strong>
                                        ${formatDate(
                                            startDate
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <!-- TANGGAL JATUH TEMPO -->

                            ${dueDateHTML}


                            <div class="loan-progress">

                                <div
                                    class="loan-progress-fill"
                                    style="width:${paidPercentage}%"
                                ></div>

                            </div>


                            <div class="loan-payment-status">

                                <div>

                                    <span>
                                        Sudah dibayar
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            paidAmount
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Sisa pembayaran
                                    </span>

                                    <strong>
                                        ${formatRupiah(
                                            remainingAmount
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="loan-remaining">

                                <div class="loan-remaining-row">

                                    <span>
                                        ${
                                            isPaidOff
                                                ? "Status Pinjaman"
                                                : "Sisa Kewajiban"
                                        }
                                    </span>

                                    <strong
                                        class="${
                                            isPaidOff
                                                ? "loan-paid"
                                                : ""
                                        }"
                                    >
                                        ${
                                            isPaidOff
                                                ? "Lunas"
                                                : formatRupiah(
                                                    remainingAmount
                                                )
                                        }
                                    </strong>

                                </div>

                            </div>


                            ${
                                isPaidOff
                                    ? `
                                        <div class="loan-paid-banner">
                                            ✓ Pinjaman sudah lunas
                                        </div>
                                    `
                                    : `
                                        <button
                                            class="loan-payment-btn"
                                            onclick="openPaymentModal('${loan.id}')"
                                        >
                                            Bayar Pinjaman
                                        </button>
                                    `
                            }

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
            function (item) {
                return String(item.id) ===
                    String(id);
            }
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
            "Hapus pinjaman ini?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("loans")
            .delete()
            .eq("id", id)
            .eq(
                "user_id",
                currentUser.id
            );

    if (error) {
        console.error(
            error
        );

        alert(
            "Gagal menghapus pinjaman.\n\n" +
            error.message
        );

        return;
    }

    await loadLoans();
}


/* =====================================================
   PAYMENT MODAL
===================================================== */

function openPaymentModal(
    loanId
) {
    const loan =
        loans.find(
            function (item) {
                return String(item.id) ===
                    String(loanId);
            }
        );

    if (!loan) {
        return;
    }

    const remainingTenor =
        getLoanRemainingTenor(
            loan
        );

    const remainingAmount =
        getLoanRemainingAmount(
            loan
        );

    if (
        remainingTenor <= 0 ||
        remainingAmount <= 0
    ) {
        alert(
            "Pinjaman ini sudah lunas."
        );

        return;
    }

    currentPaymentLoanId =
        loanId;

    const paymentLoanName =
        document.getElementById(
            "payment-loan-name"
        );

    if (paymentLoanName) {
        paymentLoanName.textContent =
            loan.source;
    }

    const paidTenor =
        getLoanPaidTenor(
            loan
        );

    const paidAmount =
        getLoanPaidAmount(
            loan
        );

    const paymentSummary =
        document.getElementById(
            "payment-summary"
        );

    if (paymentSummary) {
        paymentSummary.innerHTML = `
            <div class="payment-summary-row">
                <span>
                    Sudah dibayar
                </span>

                <strong>
                    ${paidTenor} tenor
                    •
                    ${formatRupiah(
                        paidAmount
                    )}
                </strong>
            </div>

            <div class="payment-summary-row">
                <span>
                    Sisa pembayaran
                </span>

                <strong>
                    ${remainingTenor} tenor
                    •
                    ${formatRupiah(
                        remainingAmount
                    )}
                </strong>
            </div>
        `;
    }

    const tenorSelect =
        document.getElementById(
            "payment-tenor"
        );

    if (!tenorSelect) {
        return;
    }

    tenorSelect.innerHTML = "";

    const monthly =
        parseRupiah(
            loan.monthly
        );

    for (
        let i = 1;
        i <= remainingTenor;
        i++
    ) {
        const option =
            document.createElement(
                "option"
            );

        option.value = i;

        option.textContent =
            `${i} tenor • ${formatRupiah(
                i * monthly
            )}`;

        tenorSelect.appendChild(
            option
        );
    }

    updatePaymentAmount();

    const paymentModal =
        document.getElementById(
            "payment-modal"
        );

    if (paymentModal) {
        paymentModal
            .classList
            .remove("hidden");
    }
}


function closePaymentModal() {
    const modal =
        document.getElementById(
            "payment-modal"
        );

    if (modal) {
        modal
            .classList
            .add("hidden");
    }

    currentPaymentLoanId =
        null;
}


/* =====================================================
   PAYMENT CALCULATION
===================================================== */

function updatePaymentAmount() {
    if (!currentPaymentLoanId) {
        return;
    }

    const loan =
        loans.find(
            function (item) {
                return String(item.id) ===
                    String(
                        currentPaymentLoanId
                    );
            }
        );

    if (!loan) {
        return;
    }

    const paymentTenorElement =
        document.getElementById(
            "payment-tenor"
        );

    const paymentAmountElement =
        document.getElementById(
            "payment-amount"
        );

    if (
        !paymentTenorElement ||
        !paymentAmountElement
    ) {
        return;
    }

    const tenor =
        parseNumber(
            paymentTenorElement.value
        );

    const monthly =
        parseRupiah(
            loan.monthly
        );

    const amount =
        Math.round(
            tenor * monthly
        );

    paymentAmountElement.textContent =
        formatRupiah(amount);
}


document
    .getElementById(
        "payment-tenor"
    )
    ?.addEventListener(
        "change",
        updatePaymentAmount
    );


/* =====================================================
   SAVE PAYMENT
===================================================== */

document
    .getElementById(
        "payment-form"
    )
    ?.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            if (!currentPaymentLoanId) {
                return;
            }

            if (!currentUser) {
                alert(
                    "Sesi login tidak ditemukan."
                );

                return;
            }

            const loan =
                loans.find(
                    function (item) {
                        return String(item.id) ===
                            String(
                                currentPaymentLoanId
                            );
                    }
                );

            if (!loan) {
                return;
            }

            const paymentTenorElement =
                document.getElementById(
                    "payment-tenor"
                );

            if (!paymentTenorElement) {
                return;
            }

            const payTenor =
                parseNumber(
                    paymentTenorElement.value
                );

            const currentPaidTenor =
                getLoanPaidTenor(
                    loan
                );

            const remainingTenor =
                getLoanRemainingTenor(
                    loan
                );

            if (
                payTenor <= 0 ||
                payTenor >
                remainingTenor
            ) {
                alert(
                    "Jumlah tenor pembayaran tidak valid."
                );

                return;
            }

            const newPaidTenor =
                currentPaidTenor +
                payTenor;

            const monthly =
                parseRupiah(
                    loan.monthly
                );

            const paymentAmount =
                Math.round(
                    payTenor *
                    monthly
                );

            const totalPayment =
                getLoanTotalPayment(
                    loan
                );

            const paidAmount =
                Math.round(
                    newPaidTenor *
                    monthly
                );

            const remainingPayment =
                Math.max(
                    0,
                    totalPayment -
                    paidAmount
                );

            const paymentData = {
                loan_id:
                    loan.id,

                user_id:
                    currentUser.id,

                tenor_number:
                    newPaidTenor,

                amount:
                    paymentAmount,

                payment_date:
                    formatDateForInput(
                        getTodayDate()
                    )
            };

            const paymentResult =
                await supabaseClient
                    .from("loan_payments")
                    .insert([
                        paymentData
                    ]);

            if (paymentResult.error) {
                console.warn(
                    "loan_payments tidak tersimpan:",
                    paymentResult.error
                );
            }

            const {
                error
            } =
                await supabaseClient
                    .from("loans")
                    .update({
                        paid_tenor:
                            newPaidTenor
                    })
                    .eq(
                        "id",
                        loan.id
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );

            if (error) {
                console.error(
                    error
                );

                alert(
                    "Gagal menyimpan pembayaran.\n\n" +
                    error.message
                );

                return;
            }

            closePaymentModal();

            await loadLoans();

            if (
                newPaidTenor >=
                parseNumber(
                    loan.tenor
                )
            ) {
                alert(
                    "Pembayaran berhasil. Pinjaman sudah lunas."
                );
            } else {
                alert(
                    `Pembayaran berhasil sebesar ${formatRupiah(
                        paymentAmount
                    )}.\n\n` +

                    `Sudah dibayar: ${newPaidTenor} tenor\n` +

                    `Sisa tenor: ${
                        parseNumber(
                            loan.tenor
                        ) -
                        newPaidTenor
                    } tenor\n` +

                    `Sisa pembayaran: ${formatRupiah(
                        remainingPayment
                    )}`
                );
            }
        }
    );


/* =====================================================
   CATATAN
   LOAD NOTES
===================================================== */

async function loadNotes() {
    if (!currentUser) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("notes")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "is_paid",
                {
                    ascending: true
                }
            )
            .order(
                "due_date",
                {
                    ascending: true,
                    nullsFirst: false
                }
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {
        console.error(
            "Gagal mengambil catatan:",
            error
        );

        return;
    }

    notes =
        data || [];

    renderNotes();
}


/* =====================================================
   CATATAN
   FORMAT BULAN
===================================================== */

function formatNoteMonth(monthString) {
    if (!monthString) {
        return "-";
    }

    const date =
        new Date(
            `${String(monthString).substring(0, 10)}T00:00:00`
        );

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            month: "long",
            year: "numeric"
        }
    );
}


/* =====================================================
   CATATAN
   RENDER
===================================================== */

function renderNotes() {
    const container =
        document.getElementById(
            "notes-list-container"
        );

    if (!container) {
        return;
    }

    const countElement =
        document.getElementById(
            "notes-count"
        );

    const unpaidCount =
        notes.filter(
            function (note) {
                return !note.is_paid;
            }
        ).length;

    if (countElement) {
        countElement.textContent =
            `${unpaidCount} belum selesai`;
    }

    if (!notes.length) {
        container.innerHTML = `
            <div class="content-card">
                <div class="empty-state">
                    Belum ada catatan.
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML =
        notes
            .map(
                function (note) {
                    const isPaid =
                        Boolean(
                            note.is_paid
                        );

                    const isReceivable =
                        note.type ===
                        "Piutang";

                    const title =
                        note.title ||
                        (
                            isReceivable
                                ? "Piutang"
                                : "Tagihan"
                        );

                    const amount =
                        parseRupiah(
                            note.amount
                        );

                    const dueDate =
                        note.due_date
                            ? formatDate(
                                note.due_date
                            )
                            : "-";

                    return `
                        <div
                            class="note-card ${isPaid ? "paid" : "unpaid"}"
                            onclick="openNoteDetail('${note.id}')"
                        >

                            <div class="note-card-main">

                                <div class="note-icon ${isReceivable ? "receivable" : "bill"}">
                                    ${
                                        isReceivable
                                            ? "↗"
                                            : "🧾"
                                    }
                                </div>

                                <div class="note-info">

                                    <strong>
                                        ${escapeHTML(
                                            title
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            note.type || "-"
                                        )}
                                        ${
                                            note.person
                                                ? ` • ${escapeHTML(note.person)}`
                                                : ""
                                        }
                                    </span>

                                    <small>
                                        ${
                                            note.month
                                                ? formatNoteMonth(
                                                    note.month
                                                )
                                                : "Bulan tidak ditentukan"
                                        }
                                    </small>

                                </div>

                                <div class="note-amount">

                                    <strong>
                                        ${formatRupiah(
                                            amount
                                        )}
                                    </strong>

                                    <span class="note-status ${isPaid ? "paid" : "unpaid"}">
                                        ${
                                            isPaid
                                                ? "Selesai"
                                                : "Belum selesai"
                                        }
                                    </span>

                                </div>

                            </div>

                            ${
                                note.due_date
                                    ? `
                                        <div class="note-card-footer">
                                            <span>
                                                Jatuh tempo
                                            </span>

                                            <strong>
                                                ${dueDate}
                                            </strong>
                                        </div>
                                    `
                                    : ""
                            }

                        </div>
                    `;
                }
            )
            .join("");
}


/* =====================================================
   CATATAN
   OPEN MODAL TAMBAH / EDIT
===================================================== */

function openNoteModal(
    note = null
) {
    const modal =
        document.getElementById(
            "note-modal"
        );

    const form =
        document.getElementById(
            "note-form"
        );

    if (!modal || !form) {
        console.error(
            "note-modal atau note-form tidak ditemukan."
        );

        return;
    }

    form.reset();

    editingNoteId =
        note?.id || null;

    const titleElement =
        document.getElementById(
            "note-modal-title"
        );

    if (titleElement) {
        titleElement.textContent =
            note
                ? "Edit Catatan"
                : "Tambah Catatan";
    }

    const typeInput =
        document.getElementById(
            "note-type"
        );

    const titleInput =
        document.getElementById(
            "note-title"
        );

    const personInput =
        document.getElementById(
            "note-person"
        );

    const amountInput =
        document.getElementById(
            "note-amount"
        );

    const monthInput =
        document.getElementById(
            "note-month"
        );

    const dueDateInput =
        document.getElementById(
            "note-due-date"
        );

    const descriptionInput =
        document.getElementById(
            "note-description"
        );

    if (note) {
        if (typeInput) {
            typeInput.value =
                note.type || "Tagihan";
        }

        if (titleInput) {
            titleInput.value =
                note.title || "";
        }

        if (personInput) {
            personInput.value =
                note.person || "";
        }

        if (amountInput) {
            amountInput.value =
                parseRupiah(
                    note.amount
                ) || "";
        }

        if (monthInput) {
            monthInput.value =
                note.month
                    ? String(
                        note.month
                    ).substring(0, 7)
                    : "";
        }

        if (dueDateInput) {
            dueDateInput.value =
                note.due_date
                    ? String(
                        note.due_date
                    ).substring(0, 10)
                    : "";
        }

        if (descriptionInput) {
            descriptionInput.value =
                note.notes || "";
        }
    } else {
        if (typeInput) {
            typeInput.value =
                "Tagihan";
        }

        const today =
            getTodayDate();

        if (monthInput) {
            monthInput.value =
                `${today.getFullYear()}-${String(
                    today.getMonth() + 1
                ).padStart(2, "0")}`;
        }
    }

    updateNotePersonField();

    modal
        .classList
        .remove("hidden");
}


/* =====================================================
   CATATAN
   CLOSE MODAL
===================================================== */

function closeNoteModal() {
    const modal =
        document.getElementById(
            "note-modal"
        );

    if (modal) {
        modal
            .classList
            .add("hidden");
    }

    editingNoteId = null;
}


/* =====================================================
   CATATAN
   PERSON FIELD
===================================================== */

function updateNotePersonField() {
    const typeInput =
        document.getElementById(
            "note-type"
        );

    const personGroup =
        document.getElementById(
            "note-person-group"
        );

    const personInput =
        document.getElementById(
            "note-person"
        );

    if (!typeInput) {
        return;
    }

    const isReceivable =
        typeInput.value ===
        "Piutang";

    if (personGroup) {
        personGroup.classList.toggle(
            "hidden",
            !isReceivable
        );
    }

    if (personInput) {
        personInput.required =
            isReceivable;
    }
}


document
    .getElementById(
        "note-type"
    )
    ?.addEventListener(
        "change",
        updateNotePersonField
    );


/* =====================================================
   CATATAN
   SAVE
===================================================== */

document
    .getElementById(
        "note-form"
    )
    ?.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            if (!currentUser) {
                alert(
                    "Sesi login tidak ditemukan."
                );

                return;
            }

            const typeInput =
                document.getElementById(
                    "note-type"
                );

            const titleInput =
                document.getElementById(
                    "note-title"
                );

            const personInput =
                document.getElementById(
                    "note-person"
                );

            const amountInput =
                document.getElementById(
                    "note-amount"
                );

            const monthInput =
                document.getElementById(
                    "note-month"
                );

            const dueDateInput =
                document.getElementById(
                    "note-due-date"
                );

            const descriptionInput =
                document.getElementById(
                    "note-description"
                );

            if (
                !typeInput ||
                !titleInput ||
                !amountInput
            ) {
                alert(
                    "Field catatan tidak ditemukan."
                );

                return;
            }

            const type =
                String(
                    typeInput.value || ""
                ).trim();

            const title =
                String(
                    titleInput.value || ""
                ).trim();

            const person =
                String(
                    personInput?.value || ""
                ).trim();

            const amount =
                parseRupiah(
                    amountInput.value
                );

            const month =
                String(
                    monthInput?.value || ""
                ).trim();

            const dueDate =
                String(
                    dueDateInput?.value || ""
                ).trim();

            const description =
                String(
                    descriptionInput?.value || ""
                ).trim();

            if (
                type !== "Tagihan" &&
                type !== "Piutang"
            ) {
                alert(
                    "Jenis catatan tidak valid."
                );

                return;
            }

            if (!title) {
                alert(
                    "Judul catatan wajib diisi."
                );

                titleInput.focus();

                return;
            }

            if (amount <= 0) {
                alert(
                    "Nominal harus lebih dari 0."
                );

                amountInput.focus();

                return;
            }

            if (
                type === "Piutang" &&
                !person
            ) {
                alert(
                    "Nama orang yang memiliki piutang wajib diisi."
                );

                personInput?.focus();

                return;
            }

            if (
                dueDate &&
                month &&
                dueDate.substring(0, 7) <
                month
            ) {
                alert(
                    "Jatuh tempo tidak boleh sebelum bulan catatan."
                );

                dueDateInput?.focus();

                return;
            }

            const noteData = {
                user_id:
                    currentUser.id,

                type:
                    type,

                title:
                    title,

                person:
                    type === "Piutang"
                        ? person
                        : null,

                amount:
                    Math.round(amount),

                month:
                    month
                        ? `${month}-01`
                        : null,

                due_date:
                    dueDate
                        ? dueDate
                        : null,

                notes:
                    description
            };

            let result;

            try {
                if (editingNoteId) {
                    result =
                        await supabaseClient
                            .from("notes")
                            .update(
                                noteData
                            )
                            .eq(
                                "id",
                                editingNoteId
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            )
                            .select();
                } else {
                    result =
                        await supabaseClient
                            .from("notes")
                            .insert([
                                {
                                    ...noteData,
                                    is_paid: false,
                                    paid_at: null
                                }
                            ])
                            .select();
                }
            } catch (error) {
                console.error(
                    "Exception saat menyimpan catatan:",
                    error
                );

                alert(
                    "Gagal menyimpan catatan.\n\n" +
                    (
                        error?.message ||
                        "Terjadi kesalahan saat menghubungi server."
                    )
                );

                return;
            }

            if (result?.error) {
                console.error(
                    "Supabase notes error:",
                    result.error
                );

                alert(
                    "Gagal menyimpan catatan.\n\n" +
                    result.error.message
                );

                return;
            }

            closeNoteModal();

            await loadNotes();

            showPage("notes");
        }
    );


/* =====================================================
   CATATAN
   DETAIL
===================================================== */

function openNoteDetail(id) {
    const note =
        notes.find(
            function (item) {
                return String(item.id) ===
                    String(id);
            }
        );

    if (!note) {
        return;
    }

    const detail =
        document.getElementById(
            "note-detail-content"
        );

    const modal =
        document.getElementById(
            "note-detail-modal"
        );

    if (!detail || !modal) {
        return;
    }

    const isPaid =
        Boolean(
            note.is_paid
        );

    const isReceivable =
        note.type ===
        "Piutang";

    detail.innerHTML = `
        <div class="note-detail-status ${isPaid ? "paid" : "unpaid"}">
            ${isPaid ? "Selesai" : "Belum selesai"}
        </div>

        <div class="detail-item">

            <div class="detail-label">
                Judul
            </div>

            <div class="detail-value">
                ${escapeHTML(
                    note.title || "-"
                )}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Jenis
            </div>

            <div class="detail-value">
                ${isReceivable ? "Piutang" : "Tagihan"}
            </div>

        </div>

        ${
            note.person
                ? `
                    <div class="detail-item">

                        <div class="detail-label">
                            Nama
                        </div>

                        <div class="detail-value">
                            ${escapeHTML(
                                note.person
                            )}
                        </div>

                    </div>
                `
                : ""
        }

        <div class="detail-item">

            <div class="detail-label">
                Nominal
            </div>

            <div class="detail-amount ${isPaid ? "income" : "expense"}">
                ${formatRupiah(
                    note.amount
                )}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Bulan
            </div>

            <div class="detail-value">
                ${formatNoteMonth(
                    note.month
                )}
            </div>

        </div>

        <div class="detail-item">

            <div class="detail-label">
                Jatuh Tempo
            </div>

            <div class="detail-value">
                ${
                    note.due_date
                        ? formatDate(
                            note.due_date
                        )
                        : "-"
                }
            </div>

        </div>

        ${
            note.paid_at
                ? `
                    <div class="detail-item">

                        <div class="detail-label">
                            Tanggal Selesai
                        </div>

                        <div class="detail-value">
                            ${formatDate(
                                note.paid_at
                            )}
                        </div>

                    </div>
                `
                : ""
        }

        <div class="detail-item">

            <div class="detail-label">
                Keterangan
            </div>

            <div class="detail-value">
                ${escapeHTML(
                    note.notes || "-"
                )}
            </div>

        </div>

        <div class="detail-actions">

            <button
                class="detail-edit-btn"
                onclick="editNote('${note.id}')"
            >
                Edit
            </button>

            <button
                class="note-paid-btn"
                onclick="toggleNotePaid('${note.id}')"
            >
                ${
                    isPaid
                        ? "Tandai Belum Selesai"
                        : "Tandai Selesai"
                }
            </button>

            <button
                class="detail-delete-btn"
                onclick="deleteNote('${note.id}')"
            >
                Hapus
            </button>

        </div>
    `;

    modal
        .classList
        .remove("hidden");
}


/* =====================================================
   CATATAN
   CLOSE DETAIL
===================================================== */

function closeNoteDetail() {
    document
        .getElementById(
            "note-detail-modal"
        )
        ?.classList
        .add("hidden");
}


/* =====================================================
   CATATAN
   EDIT
===================================================== */

function editNote(id) {
    const note =
        notes.find(
            function (item) {
                return String(item.id) ===
                    String(id);
            }
        );

    if (!note) {
        return;
    }

    closeNoteDetail();

    openNoteModal(
        note
    );
}


/* =====================================================
   CATATAN
   TOGGLE SELESAI / BELUM SELESAI
===================================================== */

async function toggleNotePaid(id) {
    if (!currentUser) {
        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }

    const note =
        notes.find(
            function (item) {
                return String(item.id) ===
                    String(id);
            }
        );

    if (!note) {
        return;
    }

    const newPaidStatus =
        !Boolean(
            note.is_paid
        );

    const updateData = {
        is_paid:
            newPaidStatus,

        paid_at:
            newPaidStatus
                ? formatDateForInput(
                    getTodayDate()
                )
                : null
    };

    const {
        error
    } =
        await supabaseClient
            .from("notes")
            .update(
                updateData
            )
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );

    if (error) {
        console.error(
            "Gagal mengubah status catatan:",
            error
        );

        alert(
            "Gagal mengubah status catatan.\n\n" +
            error.message
        );

        return;
    }

    closeNoteDetail();

    await loadNotes();

    showPage("notes");
}


/* =====================================================
   CATATAN
   DELETE
===================================================== */

async function deleteNote(id) {
    if (!currentUser) {
        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }

    const confirmed =
        confirm(
            "Hapus catatan ini?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("notes")
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
        console.error(
            "Gagal menghapus catatan:",
            error
        );

        alert(
            "Gagal menghapus catatan.\n\n" +
            error.message
        );

        return;
    }

    closeNoteDetail();

    await loadNotes();

    showPage("notes");
}


/* =====================================================
   QUOTE
===================================================== */

function updateQuote() {
    const quote =
        quotes[
            Math.floor(
                Math.random() *
                quotes.length
            )
        ];

    const element =
        document.getElementById(
            "quote-text"
        );

    if (element) {
        element.textContent =
            quote;
    }
}


/* =====================================================
   START
===================================================== */

injectLoanDateStyles();

checkSession();