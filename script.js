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
   FORMAT
===================================================== */

function formatRupiah(value) {

    const number =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).format(
        Math.round(number)
    );

}


/*
   MEMBACA NOMINAL RUPIAH DENGAN AMAN

   Contoh:
   50000
   50.000
   Rp 50.000
   Rp50.000

   semuanya menjadi:
   50000

   Ini penting supaya Number("Rp 50.000")
   tidak berubah menjadi NaN.
*/

function parseRupiah(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    if (
        typeof value === "number"
    ) {

        return Number.isFinite(value)
            ? Math.round(value)
            : 0;

    }


    let text =
        String(value)
            .trim();


    if (!text) {
        return 0;
    }


    /*
       Hapus semua karakter selain angka.

       Jadi:
       "Rp 50.000" -> "50000"
       "50.000"    -> "50000"
       "50000"     -> "50000"
    */

    text =
        text.replace(
           (/[^\d]/g),
            ""
        );


    if (!text) {
        return 0;
    }


    return Math.round(
        Number(text)
    ) || 0;

}


function parseNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(value);


    if (
        Number.isFinite(number)
    ) {

        return Math.round(number);

    }


    return parseRupiah(
        value
    );

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString);

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
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


function getDaysDifference(
    targetDate,
    fromDate = null
) {

    const target =
        normalizeDate(
            targetDate
        );

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
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("login-form");


if (loginForm) {

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

            initializeApp();

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

}


/* =====================================================
   INITIALIZE
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
        currentUser?.email || "-";


    await loadTransactions();

    await loadLoans();

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

        initializeApp();

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
                event === "SIGNED_IN"
            ) {

                currentUser =
                    session?.user || null;

            }

        }
    );


/* =====================================================
   TRANSACTIONS
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
                Number(
                    transaction.nominal
                ) || 0;


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


    document
        .getElementById(
            "balance-amount"
        )
        .textContent =
        formatRupiah(
            balance
        );


    document
        .getElementById(
            "total-income"
        )
        .textContent =
        formatRupiah(
            income
        );


    document
        .getElementById(
            "total-expense"
        )
        .textContent =
        formatRupiah(
            expense
        );

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


    if (
        pageName === "history"
    ) {

        renderHistory();

    }


    if (
        pageName === "summary"
    ) {

        renderSummary();

    }


    if (
        pageName === "recap"
    ) {

        renderRecap();

    }


    if (
        pageName === "loans"
    ) {

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


    editingTransactionId =
        transaction?.id || null;


    currentTransactionType =
        type;


    document
        .getElementById(
            "transaction-modal-title"
        )
        .textContent =
        transaction
            ? "Edit Transaksi"
            : "Tambah Transaksi";


    document
        .getElementById(
            "transaction-type"
        )
        .value =
        transaction?.jenis || type;


    updateCategoryOptions(
        transaction?.jenis || type,
        transaction?.kategori || ""
    );


    if (transaction) {

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

    } else {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        document
            .getElementById(
                "transaction-date"
            )
            .value =
            today;

    }


    modal
        .classList
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


function updateCategoryOptions(
    type,
    selectedCategory = ""
) {

    const select =
        document.getElementById(
            "transaction-category"
        );


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


            const type =
                document
                    .getElementById(
                        "transaction-type"
                    )
                    .value;


            const amount =
                parseRupiah(
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


            let error;


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
                    error
                );

                alert(
                    "Gagal menyimpan transaksi."
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

                return String(
                    item.id
                ) ===
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
            function (item) {

                return String(
                    item.id
                ) ===
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
            error
        );

        alert(
            "Gagal menghapus transaksi."
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
                function (
                    transaction
                ) {

                    return transaction.jenis ===
                        currentHistoryType;

                }
            );

    }


    if (month) {

        filtered =
            filtered.filter(
                function (
                    transaction
                ) {

                    return String(
                        transaction.tanggal
                    ).startsWith(
                        month
                    );

                }
            );

    }


    if (category) {

        filtered =
            filtered.filter(
                function (
                    transaction
                ) {

                    return transaction.kategori ===
                        category;

                }
            );

    }


    if (search) {

        filtered =
            filtered.filter(
                function (
                    transaction
                ) {

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
                function (
                    transaction
                ) {

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
        ]
            .sort();


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
            function (
                transaction
            ) {

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
        function (
            transaction
        ) {

            const amount =
                Number(
                    transaction.nominal
                ) || 0;


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


    document
        .getElementById(
            "current-month"
        )
        .textContent =
        currentSummaryDate
            .toLocaleDateString(
                "id-ID",
                {
                    month: "long",
                    year: "numeric"
                }
            );


    document
        .getElementById(
            "summary-income"
        )
        .textContent =
        formatRupiah(
            income
        );


    document
        .getElementById(
            "summary-expense"
        )
        .textContent =
        formatRupiah(
            expense
        );


    document
        .getElementById(
            "summary-balance"
        )
        .textContent =
        formatRupiah(
            balance
        );


    document
        .getElementById(
            "summary-count"
        )
        .textContent =
        monthTransactions.length;


    const percentage =
        income > 0
            ? Math.round(
                (
                    expense /
                    income
                ) * 100
            )
            : 0;


    document
        .getElementById(
            "expense-percentage"
        )
        .textContent =
        `${percentage}%`;


    document
        .getElementById(
            "expense-progress"
        )
        .style
        .width =
        `${Math.min(
            percentage,
            100
        )}%`;


    renderMonthlyChart(
        income,
        expense
    );


    renderCategorySummary(
        monthTransactions
    );

}


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


function renderCategorySummary(
    monthTransactions
) {

    const container =
        document.getElementById(
            "category-summary"
        );


    const expenses =
        monthTransactions.filter(
            function (
                transaction
            ) {

                return transaction.jenis ===
                    "Pengeluaran";

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
        function (
            transaction
        ) {

            const category =
                transaction.kategori ||
                "Lainnya";


            categoryTotals[category] =
                (
                    categoryTotals[category] ||
                    0
                ) +
                (
                    Number(
                        transaction.nominal
                    ) || 0
                );

        }
    );


    const sorted =
        Object.entries(
            categoryTotals
        )
        .sort(
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
        function (
            transaction
        ) {

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


    document
        .getElementById(
            "recap-income"
        )
        .textContent =
        formatRupiah(
            income
        );


    document
        .getElementById(
            "recap-expense"
        )
        .textContent =
        formatRupiah(
            expense
        );


    document
        .getElementById(
            "recap-balance"
        )
        .textContent =
        formatRupiah(
            balance
        );


    document
        .getElementById(
            "recap-count"
        )
        .textContent =
        `${transactions.length} transaksi`;


    document
        .getElementById(
            "recap-table-total"
        )
        .textContent =
        formatRupiah(
            balance
        );


    const tbody =
        document.getElementById(
            "recap-table-body"
        );


    const empty =
        document.getElementById(
            "recap-empty"
        );


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


    const chronological =
        [...transactions]
            .sort(
                function (a, b) {

                    return new Date(
                        a.tanggal
                    ) -
                    new Date(
                        b.tanggal
                    );

                }
            );


    let runningBalance = 0;

    const runningBalances =
        new Map();


    chronological.forEach(
        function (
            transaction
        ) {

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


            runningBalances.set(
                transaction.id,
                runningBalance
            );

        }
    );


    const sorted =
        [...transactions]
            .sort(
                function (a, b) {

                    return new Date(
                        b.tanggal
                    ) -
                    new Date(
                        a.tanggal
                    );

                }
            );


    tbody.innerHTML =
        sorted
            .map(
                function (
                    transaction
                ) {

                    const isIncome =
                        transaction.jenis ===
                        "Pemasukan";


                    const amount =
                        Number(
                            transaction.nominal
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
                                    runningBalances.get(
                                        transaction.id
                                    ) || 0
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   LOANS
===================================================== */


/*
   HELPER FIELD PINJAMAN

   Kita buat lebih aman.

   Prioritas:
   1. id langsung
   2. name
   3. beberapa nama alternatif

   Ini untuk menghindari masalah apabila HTML
   menggunakan nama field yang sedikit berbeda.
*/

function getLoanModalField(id) {

    const direct =
        document.getElementById(id);


    if (direct) {
        return direct;
    }


    const byName =
        document.querySelector(
            `[name="${id}"]`
        );


    if (byName) {
        return byName;
    }


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
        ]

    };


    const possibleIds =
        aliases[id] || [];


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


        /*
           SANGAT PENTING:

           Saat EDIT, cicilan bulanan
           mengambil nilai yang tersimpan.

           Tidak dihitung dari:

           jumlah pinjaman / tenor

           karena total pembayaran memang
           ditentukan oleh:

           cicilan bulanan × tenor
        */

        if (monthlyInput) {

            monthlyInput.value =
                parseRupiah(
                    loan.monthly
                ) || "";

        }

    }


    updateLoanCalculation();


    modal
        .classList
        .remove("hidden");

}


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


    /*
       Gunakan parseRupiah, BUKAN Number langsung.

       Jadi:
       50000
       50.000
       Rp 50.000

       semuanya menjadi 50000.
    */

    const monthly =
        parseRupiah(
            monthlyInput.value
        );


    const tenor =
        parseNumber(
            tenorInput.value
        );


    /*
       RUMUS FINAL

       TOTAL PEMBAYARAN =
       CICILAN PER BULAN × TENOR
    */

    const total =
        Math.round(
            monthly *
            tenor
        );


    totalElement.textContent =
        formatRupiah(
            total
        );

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
        function (event) {

            const target =
                event.target;


            if (
                target ===
                    getLoanModalField(
                        "loan-amount"
                    ) ||
                target ===
                    getLoanModalField(
                        "loan-tenor"
                    ) ||
                target ===
                    getLoanModalField(
                        "loan-monthly"
                    )
            ) {

                updateLoanCalculation();

            }

        }
    );


    loanForm.addEventListener(
        "change",
        function (event) {

            const target =
                event.target;


            if (
                target ===
                    getLoanModalField(
                        "loan-amount"
                    ) ||
                target ===
                    getLoanModalField(
                        "loan-tenor"
                    ) ||
                target ===
                    getLoanModalField(
                        "loan-monthly"
                    )
            ) {

                updateLoanCalculation();

            }

        }
    );

}


/* =====================================================
   LOAN DUE DATE
===================================================== */

function getLoanStartDate(loan) {

    if (
        loan?.created_at
    ) {

        const created =
            new Date(
                loan.created_at
            );


        if (
            !isNaN(
                created.getTime()
            )
        ) {

            return normalizeDate(
                created
            );

        }

    }


    if (
        loan?.due_date
    ) {

        const due =
            new Date(
                loan.due_date
            );


        if (
            !isNaN(
                due.getTime()
            )
        ) {

            return normalizeDate(
                due
            );

        }

    }


    return getTodayDate();

}


function getLoanNextDueDate(loan) {

    if (!loan) {
        return null;
    }


    const paidTenor =
        getLoanPaidTenor(
            loan
        );


    const startDate =
        getLoanStartDate(
            loan
        );


    const nextDueDate =
        addMonths(
            startDate,
            paidTenor + 1
        );


    return nextDueDate;

}


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


    if (
        remainingTenor <= 0
    ) {

        return {
            status: "paid",
            days: 0,
            text: "Pinjaman sudah lunas."
        };

    }


    const dueDate =
        getLoanNextDueDate(
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


    if (
        remainingTenor <= 0
    ) {

        return `

            <div class="loan-due-date">

                <span>
                    Status Jatuh Tempo
                </span>

                <strong>
                    Pinjaman Lunas
                </strong>

            </div>

        `;

    }


    const dueDate =
        getLoanNextDueDate(
            loan
        );


    const dueStatus =
        getLoanDueStatus(
            loan
        );


    if (!dueDate) {

        return "";

    }


    const statusClass =
        dueStatus.status ===
            "warning"
            ? "loan-due-warning"
            : dueStatus.status ===
                "today"
                ? "loan-due-today"
                : dueStatus.status ===
                    "overdue"
                    ? "loan-due-overdue"
                    : "";


    const warningHTML =
        (
            dueStatus.status ===
                "warning" ||
            dueStatus.status ===
                "today" ||
            dueStatus.status ===
                "overdue"
        )
            ? `

                <div class="loan-due-alert ${statusClass}">

                    ${dueStatus.status === "overdue"
                        ? "⚠"
                        : "!"}

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
                    Jatuh tempo berikutnya
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
   SAVE LOAN
===================================================== */

document
    .getElementById(
        "loan-form"
    )
    ?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            console.log(
                "===================================="
            );

            console.log(
                "MULAI MENYIMPAN PINJAMAN"
            );

            console.log(
                "===================================="
            );


            /* -----------------------------------------
               CEK USER
            ----------------------------------------- */

            if (!currentUser) {

                console.error(
                    "currentUser tidak ditemukan."
                );

                alert(
                    "Sesi login tidak ditemukan.\n\nSilakan login kembali."
                );

                return;

            }


            console.log(
                "User ID:",
                currentUser.id
            );


            /* -----------------------------------------
               AMBIL INPUT
            ----------------------------------------- */

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


            if (
                !sourceInput ||
                !amountInput ||
                !tenorInput ||
                !monthlyInput
            ) {

                console.error(
                    "Input pinjaman tidak ditemukan.",
                    {
                        sourceInput,
                        amountInput,
                        tenorInput,
                        monthlyInput
                    }
                );

                alert(
                    "Form pinjaman tidak ditemukan.\n\n" +
                    "Periksa field jumlah pinjaman, tenor, dan cicilan."
                );

                return;

            }


            /* -----------------------------------------
               AMBIL NILAI
            ----------------------------------------- */

            const source =
                sourceInput.value
                    .trim();


            /*
               PENTING:

               Jangan gunakan Number() langsung
               untuk nominal Rupiah.

               parseRupiah menangani:
               50000
               50.000
               Rp 50.000
            */

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


            console.log(
                "Data input setelah parsing:",
                {
                    source,
                    amount,
                    tenor,
                    monthly,
                    rawAmount:
                        amountInput.value,
                    rawTenor:
                        tenorInput.value,
                    rawMonthly:
                        monthlyInput.value
                }
            );


            /* -----------------------------------------
               VALIDASI SUMBER
            ----------------------------------------- */

            if (!source) {

                alert(
                    "Sumber pinjaman wajib diisi."
                );

                sourceInput.focus();

                return;

            }


            /* -----------------------------------------
               VALIDASI JUMLAH
            ----------------------------------------- */

            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                alert(
                    "Jumlah pinjaman harus lebih dari 0."
                );

                amountInput.focus();

                return;

            }


            /* -----------------------------------------
               VALIDASI TENOR
            ----------------------------------------- */

            if (
                !Number.isFinite(
                    tenor
                ) ||
                tenor <= 0
            ) {

                alert(
                    "Tenor harus lebih dari 0."
                );

                tenorInput.focus();

                return;

            }


            /* -----------------------------------------
               VALIDASI CICILAN
            ----------------------------------------- */

            if (
                !Number.isFinite(
                    monthly
                ) ||
                monthly <= 0
            ) {

                console.error(
                    "CICILAN TIDAK VALID",
                    {
                        raw:
                            monthlyInput.value,
                        parsed:
                            monthly
                    }
                );

                alert(
                    "Cicilan per bulan harus lebih dari 0.\n\n" +
                    "Contoh isi: 50000 atau 50.000"
                );

                monthlyInput.focus();

                return;

            }


            /* -----------------------------------------
               TOTAL PEMBAYARAN
            ----------------------------------------- */

            const totalPayment =
                Math.round(
                    monthly *
                    tenor
                );


            console.log(
                "Data perhitungan FINAL:",
                {
                    source,
                    amount,
                    tenor,
                    monthly,
                    totalPayment,
                    rumus:
                        `${monthly} × ${tenor} = ${totalPayment}`
                }
            );


            /* -----------------------------------------
               DATA PINJAMAN
            ----------------------------------------- */

            const loanData = {

                user_id:
                    currentUser.id,

                source:
                    source,

                amount:
                    Math.round(
                        amount
                    ),

                tenor:
                    Math.round(
                        tenor
                    ),

                monthly:
                    Math.round(
                        monthly
                    ),

                total_payment:
                    Math.round(
                        totalPayment
                    )

            };


            console.log(
                "Data yang akan dikirim:",
                loanData
            );


            /* -----------------------------------------
               INSERT / UPDATE
            ----------------------------------------- */

            let result;

            const wasEditing =
                Boolean(
                    editingLoanId
                );


            try {

                if (wasEditing) {

                    console.log(
                        "MODE: UPDATE"
                    );

                    console.log(
                        "Loan ID:",
                        editingLoanId
                    );


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

                    console.log(
                        "MODE: INSERT"
                    );


                    result =
                        await supabaseClient
                            .from("loans")
                            .insert([
                                {
                                    ...loanData,

                                    paid_tenor:
                                        0
                                }
                            ])
                            .select();

                }

            } catch (error) {

                console.error(
                    "===================================="
                );

                console.error(
                    "EXCEPTION SAAT SIMPAN PINJAMAN"
                );

                console.error(
                    "===================================="
                );

                console.error(
                    error
                );


                alert(
                    "Gagal menyimpan pinjaman.\n\n" +
                    "Pesan error:\n" +
                    (
                        error?.message ||
                        "Terjadi kesalahan saat menghubungi server."
                    )
                );

                return;

            }


            /* -----------------------------------------
               CEK ERROR SUPABASE
            ----------------------------------------- */

            if (result?.error) {

                console.error(
                    "===================================="
                );

                console.error(
                    "SUPABASE LOANS ERROR"
                );

                console.error(
                    "===================================="
                );

                console.error(
                    "Message:",
                    result.error.message
                );

                console.error(
                    "Details:",
                    result.error.details
                );

                console.error(
                    "Hint:",
                    result.error.hint
                );

                console.error(
                    "Code:",
                    result.error.code
                );

                console.error(
                    "Full error:",
                    result.error
                );


                alert(
                    "Gagal menyimpan pinjaman.\n\n" +
                    "Pesan Supabase:\n" +
                    result.error.message
                );

                return;

            }


            /* -----------------------------------------
               BERHASIL
            ----------------------------------------- */

            console.log(
                "Pinjaman berhasil disimpan."
            );

            console.log(
                "Data hasil:",
                result?.data
            );


            closeLoanModal();

            await loadLoans();


            if (wasEditing) {

                alert(
                    "Pinjaman berhasil diperbarui."
                );

            } else {

                alert(
                    "Pinjaman berhasil ditambahkan."
                );

            }

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
            loan.paid_tenor
        )
    );

}


function getLoanRemainingTenor(loan) {

    const tenor =
        parseNumber(
            loan.tenor
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


/*
   TOTAL PEMBAYARAN SELALU:

   CICILAN PER BULAN × TENOR

   Kita sengaja TIDAK lagi menggunakan
   loan.total_payment sebagai sumber utama.

   Jadi kalau ada data lama yang total_payment
   tersimpan salah, tampilan aplikasi tetap
   mengikuti rumus yang benar.
*/

function getLoanTotalPayment(loan) {

    const tenor =
        parseNumber(
            loan.tenor
        );


    const monthly =
        parseRupiah(
            loan.monthly
        );


    return Math.round(
        monthly *
        tenor
    );

}


function getLoanPaidAmount(loan) {

    const paidTenor =
        getLoanPaidTenor(
            loan
        );


    const monthly =
        parseRupiah(
            loan.monthly
        );


    return Math.round(
        paidTenor *
        monthly
    );

}


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


    /*
       CATATAN:

       Di beberapa HTML, id "loan-monthly"
       bisa juga merupakan INPUT.

       Karena itu jangan mengubah .textContent
       kalau element tersebut adalah input.

       Kode lama menggunakan id yang sama untuk
       input modal dan summary.

       Kita tetap pertahankan perilaku lama,
       tetapi hanya jika element bukan input.
    */

    if (
        loanMonthlyElement &&
        loanMonthlyElement.tagName !== "INPUT" &&
        loanMonthlyElement.tagName !== "SELECT" &&
        loanMonthlyElement.tagName !== "TEXTAREA"
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

                                    <strong class="${isPaidOff ? "loan-paid" : ""}">
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

                return String(
                    item.id
                ) ===
                String(id);

            }
        );


    if (!loan) {
        return;
    }


    openLoanModal(
        loan
    );

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
            error
        );

        alert(
            "Gagal menghapus pinjaman."
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

                return String(
                    item.id
                ) ===
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


    for (
        let i = 1;
        i <= remainingTenor;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            i;


        option.textContent =
            `${i} tenor • ${formatRupiah(
                i *
                parseRupiah(
                    loan.monthly
                )
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

    if (
        !currentPaymentLoanId
    ) {

        return;

    }


    const loan =
        loans.find(
            function (item) {

                return String(
                    item.id
                ) ===
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


    const amount =
        Math.round(
            tenor *
            parseRupiah(
                loan.monthly
            )
        );


    paymentAmountElement.textContent =
        formatRupiah(
            amount
        );

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


            if (
                !currentPaymentLoanId
            ) {

                return;

            }


            const loan =
                loans.find(
                    function (item) {

                        return String(
                            item.id
                        ) ===
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
                    "Gagal menyimpan pembayaran."
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

checkSession();