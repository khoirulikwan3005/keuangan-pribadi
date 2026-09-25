// ========================================
// KONFIGURASI SUPABASE
// ========================================

const SUPABASE_URL = "https://pzbfdtunxiaunfnopsuc.supabase.co";

const SUPABASE_KEY = "sb_publishable_37DoAje5FQZr4FFO5jmpAA_IQHTDk_u";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// VARIABEL GLOBAL
// ========================================

let currentUser = null;

let transactions = [];

let currentTransactionType = "Pemasukan";

let editingTransactionId = null;

let currentSummaryDate = new Date();

let currentHistoryType = "Semua";

let monthlyChart = null;


// ========================================
// KATEGORI
// ========================================

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
    "Investasi",
    "Lainnya"
];


// ========================================
// QUOTE
// ========================================

const quotes = [
    "Mengatur uang hari ini adalah investasi untuk ketenangan besok.",
    "Bukan tentang berapa banyak uang yang kamu punya, tapi bagaimana kamu mengelolanya.",
    "Sedikit demi sedikit, kondisi keuangan yang sehat mulai terbentuk.",
    "Catat pengeluaranmu. Uang yang tidak tercatat sering terasa hilang entah ke mana.",
    "Keuangan yang rapi membuat keputusan hidup terasa lebih ringan.",
    "Menabung bukan soal sisa uang, tapi soal prioritas.",
    "Uang adalah alat. Gunakan dengan sadar, bukan sekadar mengikuti keinginan."
];

let quoteIndex = 0;


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(number) {

    number = Number(number) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}


// ========================================
// FORMAT TANGGAL
// ========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}


function formatShortDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}


// ========================================
// FORMAT BULAN
// ========================================

function formatMonth(date) {

    return new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric"
    }).format(date);
}


// ========================================
// FORMAT YYYY-MM
// ========================================

function getMonthValue(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
}


// ========================================
// TANGGAL HARI INI
// ========================================

function getToday() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ========================================
// IKON KATEGORI
// ========================================

function getCategoryIcon(category) {

    const icons = {

        "Gaji": "💰",
        "Bonus": "🎁",
        "Penjualan": "🛍️",
        "Bisnis": "💼",
        "Investasi": "📈",
        "Hadiah": "🎁",

        "Makanan": "🍜",
        "Transportasi": "🚗",
        "Belanja": "🛒",
        "Tagihan": "🧾",
        "Hiburan": "🎮",
        "Kesehatan": "💊",
        "Pendidikan": "📚",
        "Rumah": "🏠",
        "Keluarga": "👨‍👩‍👧",

        "Lainnya": "📌"
    };

    return icons[category] || "📌";
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// ELEMENT LOGIN
// ========================================

const loginPage =
    document.getElementById("login-page");

const app =
    document.getElementById("app");

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            document
                .getElementById("login-email")
                .value
                .trim();

        const password =
            document
                .getElementById("login-password")
                .value;

        loginMessage.textContent =
            "Sedang masuk...";

        try {

            const {
                data,
                error
            } =
                await db.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                throw error;
            }

            currentUser = data.user;

            loginMessage.textContent = "";

            await showApp();

        } catch (error) {

            console.error(error);

            loginMessage.textContent =
                "Email atau password salah.";

        }

    }
);


// ========================================
// TOGGLE PASSWORD
// ========================================

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
                passwordInput.type === "password"
            ) {

                passwordInput.type = "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                passwordInput.type = "password";

                togglePassword.textContent =
                    "👁";
            }

        }
    );

}


// ========================================
// CEK SESSION
// ========================================

async function checkSession() {

    try {

        const {
            data: {
                session
            }
        } = await db.auth.getSession();

        if (session) {

            currentUser = session.user;

            await showApp();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error(
            "Gagal mengecek session:",
            error
        );

        showLogin();

    }

}


// ========================================
// SHOW LOGIN
// ========================================

function showLogin() {

    loginPage.classList.remove(
        "hidden"
    );

    app.classList.add(
        "hidden"
    );

}


// ========================================
// SHOW APP
// ========================================

async function showApp() {

    loginPage.classList.add(
        "hidden"
    );

    app.classList.remove(
        "hidden"
    );

    document.getElementById(
        "account-email"
    ).textContent =
        currentUser?.email || "-";

    await loadTransactions();

    updateQuote();

    showPage("home");

}


// ========================================
// LOGOUT
// ========================================

document
    .getElementById("logout-button")
    .addEventListener(
        "click",
        async function () {

            const confirmed =
                confirm(
                    "Yakin ingin keluar dari akun?"
                );

            if (!confirmed) {
                return;
            }

            await db.auth.signOut();

            currentUser = null;

            transactions = [];

            showLogin();

        }
    );


// ========================================
// LOAD TRANSACTIONS
// ========================================

async function loadTransactions() {

    if (!currentUser) {
        return;
    }

    const {
        data,
        error
    } =
        await db
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
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(error);

        alert(
            "Gagal mengambil data transaksi."
        );

        return;
    }

    transactions = data || [];

    updateHome();

    updateHistory();

    updateSummary();

    updateCategoryFilter();

}


// ========================================
// HITUNG SALDO
// ========================================

function calculateBalance(
    data = transactions
) {

    let income = 0;

    let expense = 0;

    data.forEach(
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

    return {
        income,
        expense,
        balance: income - expense
    };

}


// ========================================
// TRANSAKSI BERDASARKAN BULAN
// ========================================

function getTransactionsByMonth(
    year,
    month
) {

    return transactions.filter(
        transaction => {

            const date =
                new Date(
                    transaction.tanggal +
                    "T00:00:00"
                );

            return (
                date.getFullYear() === year &&
                date.getMonth() === month
            );

        }
    );

}


// ========================================
// UPDATE BERANDA
// ========================================

function updateHome() {

    const totals =
        calculateBalance();

    document.getElementById(
        "balance"
    ).textContent =
        formatRupiah(
            totals.balance
        );

    document.getElementById(
        "total-income"
    ).textContent =
        formatRupiah(
            totals.income
        );

    document.getElementById(
        "total-expense"
    ).textContent =
        formatRupiah(
            totals.expense
        );


    const status =
        document.getElementById(
            "balance-status"
        );

    if (totals.balance > 0) {

        status.textContent =
            "Saldo masih positif";

    } else if (totals.balance < 0) {

        status.textContent =
            "Pengeluaran lebih besar dari pemasukan";

    } else {

        status.textContent =
            "Belum ada selisih pemasukan dan pengeluaran";

    }


    const now = new Date();

    document.getElementById(
        "home-month"
    ).textContent =
        formatMonth(now);


    const monthlyData =
        getTransactionsByMonth(
            now.getFullYear(),
            now.getMonth()
        );

    const monthlyTotals =
        calculateBalance(
            monthlyData
        );

    document.getElementById(
        "home-month-balance"
    ).textContent =
        `Sisa ${formatRupiah(
            monthlyTotals.balance
        )}`;


    renderRecentTransactions();

}


// ========================================
// TRANSAKSI TERBARU
// ========================================

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recent-transactions"
        );

    const recent =
        transactions.slice(0, 5);

    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada transaksi.
            </div>
        `;

        return;
    }

    container.innerHTML =
        recent
            .map(transactionHTML)
            .join("");

}


// ========================================
// HTML TRANSAKSI
// ========================================

function transactionHTML(
    transaction
) {

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

    const icon =
        getCategoryIcon(
            transaction.kategori
        );

    return `
        <div
            class="transaction-item"
            onclick="openTransactionDetail('${transaction.id}')"
        >

            <div class="transaction-left">

                <div class="transaction-icon ${typeClass}">
                    ${icon}
                </div>

                <div class="transaction-info">

                    <span class="transaction-name">
                        ${escapeHTML(
                            transaction.keterangan ||
                            transaction.kategori
                        )}
                    </span>

                    <span class="transaction-meta">
                        ${escapeHTML(
                            transaction.kategori
                        )}
                    </span>

                </div>

            </div>


            <div class="transaction-right">

                <span class="transaction-amount ${typeClass}">
                    ${sign} ${formatRupiah(
                        transaction.nominal
                    )}
                </span>

                <span class="transaction-date">
                    ${formatShortDate(
                        transaction.tanggal
                    )}
                </span>

            </div>

        </div>
    `;

}


// ========================================
// NAVIGASI
// ========================================

function showPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    pages.forEach(
        page => {
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


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(
        item => {

            item.classList.remove(
                "active"
            );

            if (
                item.dataset.page ===
                pageName
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );


    if (pageName === "home") {
        updateHome();
    }

    if (pageName === "summary") {
        updateSummary();
    }

    if (pageName === "history") {
        updateHistory();
    }

}


document
    .querySelectorAll(".nav-item")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    showPage(
                        this.dataset.page
                    );

                }
            );

        }
    );


// ========================================
// HISTORY
// ========================================

function updateHistory() {

    const container =
        document.getElementById(
            "history-list"
        );

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
        document.getElementById(
            "filter-month"
        ).value;

    if (month) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.tanggal
                        .startsWith(month)
            );

    }


    const category =
        document.getElementById(
            "filter-category"
        ).value;

    if (
        category &&
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
        document.getElementById(
            "search-transaction"
        ).value
            .toLowerCase()
            .trim();

    if (search) {

        filtered =
            filtered.filter(
                transaction => {

                    const text = `
                        ${transaction.keterangan || ""}
                        ${transaction.kategori || ""}
                        ${transaction.jenis || ""}
                    `.toLowerCase();

                    return text.includes(
                        search
                    );

                }
            );

    }


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada transaksi yang sesuai.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered
            .map(transactionHTML)
            .join("");

}


// ========================================
// FILTER JENIS
// ========================================

document
    .querySelectorAll(".filter-tab")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".filter-tab"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );

                    this.classList.add(
                        "active"
                    );

                    currentHistoryType =
                        this.dataset.type;

                    updateHistory();

                }
            );

        }
    );


// ========================================
// FILTER BULAN
// ========================================

document
    .getElementById(
        "filter-month"
    )
    .addEventListener(
        "change",
        updateHistory
    );


// ========================================
// FILTER KATEGORI
// ========================================

document
    .getElementById(
        "filter-category"
    )
    .addEventListener(
        "change",
        updateHistory
    );


// ========================================
// SEARCH
// ========================================

document
    .getElementById(
        "search-transaction"
    )
    .addEventListener(
        "input",
        updateHistory
    );


// ========================================
// CATEGORY FILTER
// ========================================

function updateCategoryFilter() {

    const select =
        document.getElementById(
            "filter-category"
        );

    const categories =
        [
            ...new Set(
                transactions
                    .map(
                        transaction =>
                            transaction.kategori
                    )
                    .filter(Boolean)
            )
        ]
        .sort();

    select.innerHTML = `
        <option value="Semua">
            Semua Kategori
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


// ========================================
// MODAL TRANSAKSI
// ========================================

function openTransactionModal(
    type = "Pemasukan",
    transaction = null
) {

    const modal =
        document.getElementById(
            "transaction-modal"
        );

    const title =
        document.getElementById(
            "modal-title"
        );

    const subtitle =
        document.getElementById(
            "modal-subtitle"
        );


    editingTransactionId =
        transaction
            ? transaction.id
            : null;


    currentTransactionType =
        transaction
            ? transaction.jenis
            : type;


    document.getElementById(
        "transaction-type"
    ).value =
        currentTransactionType;


    if (transaction) {

        title.textContent =
            "Edit Transaksi";

        subtitle.textContent =
            "Perbarui informasi transaksi.";

    } else {

        title.textContent =
            `Tambah ${currentTransactionType}`;

        subtitle.textContent =
            "Catat transaksi baru.";

    }


    document.getElementById(
        "transaction-amount"
    ).value =
        transaction
            ? transaction.nominal
            : "";


    document.getElementById(
        "transaction-date"
    ).value =
        transaction
            ? transaction.tanggal
            : getToday();


    document.getElementById(
        "transaction-note"
    ).value =
        transaction
            ? transaction.keterangan || ""
            : "";


    populateTransactionCategories(
        currentTransactionType,
        transaction
            ? transaction.kategori
            : ""
    );


    document.getElementById(
        "transaction-message"
    ).textContent = "";


    modal.classList.remove(
        "hidden"
    );

}


// ========================================
// POPULATE KATEGORI
// ========================================

function populateTransactionCategories(
    type,
    selected = ""
) {

    const select =
        document.getElementById(
            "transaction-category"
        );

    const categories =
        type === "Pemasukan"
            ? incomeCategories
            : expenseCategories;


    select.innerHTML = `
        <option value="">
            Pilih kategori
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

            if (
                category === selected
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


// ========================================
// CLOSE TRANSACTION MODAL
// ========================================

function closeTransactionModal() {

    document
        .getElementById(
            "transaction-modal"
        )
        .classList.add(
            "hidden"
        );

    editingTransactionId =
        null;

}


// ========================================
// SUBMIT TRANSACTION
// ========================================

document
    .getElementById(
        "transaction-form"
    )
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!currentUser) {
                return;
            }


            const type =
                document.getElementById(
                    "transaction-type"
                ).value;

            const amount =
                Number(
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

            const note =
                document.getElementById(
                    "transaction-note"
                ).value
                    .trim();

            const message =
                document.getElementById(
                    "transaction-message"
                );


            if (
                !amount ||
                amount <= 0
            ) {

                message.textContent =
                    "Nominal harus lebih dari 0.";

                return;

            }


            if (!category) {

                message.textContent =
                    "Pilih kategori terlebih dahulu.";

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
                    note || null

            };


            message.textContent =
                "Menyimpan...";


            try {

                let error;


                if (
                    editingTransactionId
                ) {

                    const result =
                        await db
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

                    error =
                        result.error;

                } else {

                    const result =
                        await db
                            .from(
                                "transactions"
                            )
                            .insert(
                                transactionData
                            );

                    error =
                        result.error;

                }


                if (error) {
                    throw error;
                }


                closeTransactionModal();

                await loadTransactions();


            } catch (error) {

                console.error(
                    error
                );

                message.textContent =
                    "Gagal menyimpan transaksi.";

            }

        }
    );


// ========================================
// DETAIL TRANSAKSI
// ========================================

function openTransactionDetail(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
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


    const container =
        document.getElementById(
            "transaction-detail-content"
        );


    container.innerHTML = `

        <div class="detail-main">

            <span class="detail-type ${typeClass}">
                ${escapeHTML(
                    transaction.jenis
                )}
            </span>

            <div class="detail-amount ${typeClass}">
                ${sign} ${formatRupiah(
                    transaction.nominal
                )}
            </div>

        </div>


        <div class="detail-list">

            <div class="detail-row">

                <span>
                    Kategori
                </span>

                <strong>
                    ${escapeHTML(
                        transaction.kategori
                    )}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    Tanggal
                </span>

                <strong>
                    ${formatDate(
                        transaction.tanggal
                    )}
                </strong>

            </div>


            <div class="detail-row">

                <span>
                    Keterangan
                </span>

                <strong>
                    ${escapeHTML(
                        transaction.keterangan ||
                        "-"
                    )}
                </strong>

            </div>

        </div>


        <div class="detail-actions">

            <button
                class="edit-button"
                onclick="editTransaction('${transaction.id}')"
            >
                Edit
            </button>

            <button
                class="delete-button"
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
        .classList.remove(
            "hidden"
        );

}


// ========================================
// CLOSE DETAIL
// ========================================

function closeDetailModal() {

    document
        .getElementById(
            "detail-modal"
        )
        .classList.add(
            "hidden"
        );

}


// ========================================
// EDIT TRANSAKSI
// ========================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
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


// ========================================
// DELETE TRANSAKSI
// ========================================

async function deleteTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
        );

    if (!transaction) {
        return;
    }


    const confirmed =
        confirm(
            `Hapus transaksi ${formatRupiah(
                transaction.nominal
            )}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await db
                .from(
                    "transactions"
                )
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


        closeDetailModal();

        await loadTransactions();


    } catch (error) {

        console.error(
            error
        );

        alert(
            "Gagal menghapus transaksi."
        );

    }

}


// ========================================
// SUMMARY
// ========================================

function updateSummary() {

    const year =
        currentSummaryDate.getFullYear();

    const month =
        currentSummaryDate.getMonth();


    document.getElementById(
        "summary-period"
    ).textContent =
        formatMonth(
            currentSummaryDate
        );


    const monthlyTransactions =
        getTransactionsByMonth(
            year,
            month
        );


    const totals =
        calculateBalance(
            monthlyTransactions
        );


    document.getElementById(
        "summary-income"
    ).textContent =
        formatRupiah(
            totals.income
        );


    document.getElementById(
        "summary-expense"
    ).textContent =
        formatRupiah(
            totals.expense
        );


    document.getElementById(
        "summary-balance"
    ).textContent =
        formatRupiah(
            totals.balance
        );


    document.getElementById(
        "summary-count"
    ).textContent =
        monthlyTransactions.length;


    renderCategorySummary(
        monthlyTransactions
    );

    renderMonthlyChart();

}


// ========================================
// BULAN SEBELUMNYA
// ========================================

document
    .getElementById(
        "prev-month"
    )
    .addEventListener(
        "click",
        function () {

            currentSummaryDate =
                new Date(
                    currentSummaryDate.getFullYear(),
                    currentSummaryDate.getMonth() - 1,
                    1
                );

            updateSummary();

        }
    );


// ========================================
// BULAN BERIKUTNYA
// ========================================

document
    .getElementById(
        "next-month"
    )
    .addEventListener(
        "click",
        function () {

            currentSummaryDate =
                new Date(
                    currentSummaryDate.getFullYear(),
                    currentSummaryDate.getMonth() + 1,
                    1
                );

            updateSummary();

        }
    );


// ========================================
// CATEGORY SUMMARY
// ========================================

function renderCategorySummary(
    monthlyTransactions
) {

    const container =
        document.getElementById(
            "category-summary"
        );


    const expenses =
        monthlyTransactions.filter(
            transaction =>
                transaction.jenis ===
                "Pengeluaran"
        );


    if (expenses.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada pengeluaran pada bulan ini.
            </div>
        `;

        return;

    }


    const categoryTotals = {};


    expenses.forEach(
        transaction => {

            const category =
                transaction.kategori;

            const amount =
                Number(
                    transaction.nominal
                ) || 0;


            if (
                !categoryTotals[
                    category
                ]
            ) {

                categoryTotals[
                    category
                ] = 0;

            }


            categoryTotals[
                category
            ] += amount;

        }
    );


    const sortedCategories =
        Object.entries(
            categoryTotals
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    container.innerHTML =
        sortedCategories
            .map(
                ([category, amount]) => `

                    <div class="category-row">

                        <div class="transaction-left">

                            <div class="transaction-icon expense">
                                ${getCategoryIcon(
                                    category
                                )}
                            </div>

                            <span class="category-name">
                                ${escapeHTML(
                                    category
                                )}
                            </span>

                        </div>

                        <span class="category-amount">
                            ${formatRupiah(
                                amount
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


// ========================================
// CHART.JS
// ========================================

function loadChartLibrary() {

    return new Promise(
        (resolve, reject) => {

            if (window.Chart) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );

            script.src =
                "https://cdn.jsdelivr.net/npm/chart.js";

            script.onload =
                resolve;

            script.onerror =
                reject;

            document.head.appendChild(
                script
            );

        }
    );

}


// ========================================
// MONTHLY CHART
// ========================================

async function renderMonthlyChart() {

    const canvas =
        document.getElementById(
            "monthly-chart"
        );

    if (!canvas) {
        return;
    }


    try {

        await loadChartLibrary();

    } catch (error) {

        console.error(
            "Chart.js gagal dimuat.",
            error
        );

        return;

    }


    const year =
        currentSummaryDate.getFullYear();

    const month =
        currentSummaryDate.getMonth();


    const monthlyTransactions =
        getTransactionsByMonth(
            year,
            month
        );


    let income = 0;

    let expense = 0;


    monthlyTransactions.forEach(
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
                            label: "Jumlah",

                            data: [
                                income,
                                expense
                            ],

                            borderRadius: 8,

                            borderWidth: 0
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return formatRupiah(
                                            context.raw
                                        );

                                    }

                            }

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

                                        return formatCompactRupiah(
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


// ========================================
// FORMAT RUPIAH SINGKAT
// ========================================

function formatCompactRupiah(
    value
) {

    value =
        Number(value) || 0;


    if (
        value >= 1000000000
    ) {

        return (
            "Rp " +
            (
                value /
                1000000000
            )
                .toFixed(1)
                .replace(".0", "") +
            " M"
        );

    }


    if (
        value >= 1000000
    ) {

        return (
            "Rp " +
            (
                value /
                1000000
            )
                .toFixed(1)
                .replace(".0", "") +
            " jt"
        );

    }


    if (
        value >= 1000
    ) {

        return (
            "Rp " +
            (
                value /
                1000
            )
                .toFixed(0) +
            " rb"
        );

    }


    return "Rp " + value;

}


// ========================================
// QUOTE ROTATION
// ========================================

function updateQuote() {

    const quoteElement =
        document.getElementById(
            "quote-text"
        );

    if (!quoteElement) {
        return;
    }


    quoteElement.style.opacity =
        "0";


    setTimeout(
        function () {

            quoteElement.textContent =
                quotes[quoteIndex];

            quoteElement.style.opacity =
                "1";

            quoteIndex =
                (
                    quoteIndex + 1
                ) %
                quotes.length;

        },
        250
    );

}


setInterval(
    updateQuote,
    8000
);


// ========================================
// SUPABASE AUTH LISTENER
// ========================================

db.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        if (session) {

            currentUser =
                session.user;

        } else {

            currentUser =
                null;

        }

    }
);


// ========================================
// MULAI APLIKASI
// ========================================

checkSession();