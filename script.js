// ========================================
// KONFIGURASI SUPABASE
// ========================================

const SUPABASE_URL = "https://pzbfdtunxiaunfnopsuc.supabase.co/";

const SUPABASE_KEY = "sb_publishable_37DoAje5FQZr4FFO5jmpAA_IQHTDk_u";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// DATA
// ========================================

let transaksi = [];

let transaksiSedangDiedit = null;


// ========================================
// BULAN DASHBOARD
// ========================================

const sekarang = new Date();

let bulanDashboard =
    sekarang.getMonth();

let tahunDashboard =
    sekarang.getFullYear();


// ========================================
// CEK LOGIN
// ========================================

cekLogin();


async function cekLogin() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Gagal mengecek login:",
            error
        );

        return;
    }


    if (data.session) {

        tampilkanAplikasi();

        await ambilTransaksi();

    } else {

        tampilkanLogin();

    }

}


// ========================================
// TAMPILKAN LOGIN
// ========================================

function tampilkanLogin() {

    document.getElementById(
        "halamanLogin"
    ).style.display =
        "flex";


    document.getElementById(
        "halamanAplikasi"
    ).style.display =
        "none";

}


// ========================================
// TAMPILKAN APLIKASI
// ========================================

function tampilkanAplikasi() {

    document.getElementById(
        "halamanLogin"
    ).style.display =
        "none";


    document.getElementById(
        "halamanAplikasi"
    ).style.display =
        "block";

}


// ========================================
// LOGIN
// ========================================

async function login() {

    const email =
        document.getElementById(
            "emailLogin"
        ).value.trim();


    const password =
        document.getElementById(
            "passwordLogin"
        ).value;


    const pesan =
        document.getElementById(
            "pesanLogin"
        );


    if (email === "") {

        pesan.textContent =
            "Email wajib diisi.";

        return;
    }


    if (password === "") {

        pesan.textContent =
            "Password wajib diisi.";

        return;
    }


    pesan.textContent =
        "Sedang login...";


    const {
        error
    } =
        await supabaseClient
            .auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        console.error(
            "Login gagal:",
            error
        );

        pesan.textContent =
            "Email atau password salah.";

        return;
    }


    pesan.textContent = "";


    tampilkanAplikasi();


    await ambilTransaksi();

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        console.error(
            "Logout gagal:",
            error
        );

        return;
    }


    tampilkanLogin();

}


// ========================================
// AMBIL TRANSAKSI
// ========================================

async function ambilTransaksi() {

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        tampilkanLogin();

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("transactions")
            .select("*")
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

        console.error(
            "Gagal mengambil transaksi:",
            error
        );

        alert(
            "Gagal mengambil data transaksi."
        );

        return;
    }


    transaksi =
        data || [];


    tampilkanTransaksi();

    hitungKeuangan();

    tampilkanDashboardBulanan();

}


// ========================================
// FORM TAMBAH
// ========================================

function tampilkanForm() {

    transaksiSedangDiedit =
        null;


    document.getElementById(
        "judulForm"
    ).textContent =
        "Tambah Transaksi";


    document.getElementById(
        "btnSimpan"
    ).textContent =
        "Simpan";


    document.getElementById(
        "nominal"
    ).value = "";


    // TANGGAL OTOMATIS HARI INI

    const hariIni =
        new Date();


    const tahun =
        hariIni.getFullYear();


    const bulan =
        String(
            hariIni.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const hari =
        String(
            hariIni.getDate()
        ).padStart(
            2,
            "0"
        );


    document.getElementById(
        "tanggal"
    ).value =
        `${tahun}-${bulan}-${hari}`;


    document.getElementById(
        "keterangan"
    ).value = "";


    document.getElementById(
        "jenis"
    ).value =
        "pemasukan";


    document.getElementById(
        "kategori"
    ).value =
        "Gaji";


    document.getElementById(
        "formTransaksi"
    ).style.display =
        "block";

}


// ========================================
// TUTUP FORM
// ========================================

function tutupForm() {

    document.getElementById(
        "formTransaksi"
    ).style.display =
        "none";


    transaksiSedangDiedit =
        null;


    document.getElementById(
        "judulForm"
    ).textContent =
        "Tambah Transaksi";


    document.getElementById(
        "btnSimpan"
    ).textContent =
        "Simpan";

}


// ========================================
// SIMPAN / UPDATE
// ========================================

async function simpanTransaksi() {

    const jenis =
        document.getElementById(
            "jenis"
        ).value;


    const nominal =
        Number(
            document.getElementById(
                "nominal"
            ).value
        );


    const kategori =
        document.getElementById(
            "kategori"
        ).value;


    const tanggal =
        document.getElementById(
            "tanggal"
        ).value;


    const keterangan =
        document.getElementById(
            "keterangan"
        ).value.trim();


    if (nominal <= 0) {

        alert(
            "Nominal harus lebih dari 0."
        );

        return;
    }


    if (tanggal === "") {

        alert(
            "Tanggal wajib diisi."
        );

        return;
    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Sesi login tidak ditemukan."
        );

        tampilkanLogin();

        return;
    }


    const user =
        userData.user;


    // ====================================
    // UPDATE
    // ====================================

    if (transaksiSedangDiedit) {

        const {
            error
        } =
            await supabaseClient
                .from("transactions")
                .update({

                    jenis: jenis,

                    nominal: nominal,

                    kategori: kategori,

                    tanggal: tanggal,

                    keterangan: keterangan

                })
                .eq(
                    "id",
                    transaksiSedangDiedit
                )
                .eq(
                    "user_id",
                    user.id
                );


        if (error) {

            console.error(
                "Gagal mengedit transaksi:",
                error
            );

            alert(
                "Gagal mengedit transaksi."
            );

            return;
        }


        transaksi =
            transaksi.map(
                function(data) {

                    if (
                        data.id ===
                        transaksiSedangDiedit
                    ) {

                        return {

                            ...data,

                            jenis: jenis,

                            nominal: nominal,

                            kategori: kategori,

                            tanggal: tanggal,

                            keterangan: keterangan

                        };

                    }


                    return data;

                }
            );


        alert(
            "Transaksi berhasil diperbarui."
        );


        tampilkanTransaksi();

        hitungKeuangan();

        tampilkanDashboardBulanan();

        tutupForm();


        return;

    }


    // ====================================
    // TAMBAH TRANSAKSI
    // ====================================

    const dataBaru = {

        user_id: user.id,

        jenis: jenis,

        nominal: nominal,

        kategori: kategori,

        tanggal: tanggal,

        keterangan: keterangan

    };


    const {
        data,
        error
    } =
        await supabaseClient
            .from("transactions")
            .insert([
                dataBaru
            ])
            .select();


    if (error) {

        console.error(
            "Gagal menyimpan transaksi:",
            error
        );

        alert(
            "Gagal menyimpan transaksi."
        );

        return;
    }


    if (
        data &&
        data.length > 0
    ) {

        transaksi.push(
            data[0]
        );

    }


    tampilkanTransaksi();

    hitungKeuangan();

    tampilkanDashboardBulanan();


    document.getElementById(
        "nominal"
    ).value = "";


    document.getElementById(
        "tanggal"
    ).value = "";


    document.getElementById(
        "keterangan"
    ).value = "";


    tutupForm();

}


// ========================================
// EDIT TRANSAKSI
// ========================================

function editTransaksi(id) {

    const data =
        transaksi.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!data) {

        alert(
            "Data transaksi tidak ditemukan."
        );

        return;
    }


    transaksiSedangDiedit =
        id;


    document.getElementById(
        "judulForm"
    ).textContent =
        "Edit Transaksi";


    document.getElementById(
        "btnSimpan"
    ).textContent =
        "Update";


    document.getElementById(
        "jenis"
    ).value =
        data.jenis;


    document.getElementById(
        "nominal"
    ).value =
        data.nominal;


    document.getElementById(
        "kategori"
    ).value =
        data.kategori;


    document.getElementById(
        "tanggal"
    ).value =
        data.tanggal;


    document.getElementById(
        "keterangan"
    ).value =
        data.keterangan || "";


    document.getElementById(
        "formTransaksi"
    ).style.display =
        "block";


    document.getElementById(
        "formTransaksi"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


// ========================================
// HAPUS TRANSAKSI
// ========================================

async function hapusTransaksi(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus transaksi ini?"
        );


    if (!yakin) {

        return;
    }


    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Sesi login tidak ditemukan."
        );

        tampilkanLogin();

        return;
    }


    const user =
        userData.user;


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
                user.id
            );


    if (error) {

        console.error(
            "Gagal menghapus transaksi:",
            error
        );

        alert(
            "Gagal menghapus transaksi."
        );

        return;
    }


    transaksi =
        transaksi.filter(
            function(data) {

                return data.id !== id;

            }
        );


    tampilkanTransaksi();

    hitungKeuangan();

    tampilkanDashboardBulanan();


    alert(
        "Transaksi berhasil dihapus."
    );

}


// ========================================
// FILTER TRANSAKSI
// ========================================

function terapkanFilter() {

    tampilkanTransaksi();

}


// ========================================
// RESET FILTER
// ========================================

function resetFilter() {

    document.getElementById(
        "filterJenis"
    ).value =
        "semua";


    document.getElementById(
        "filterKategori"
    ).value =
        "semua";


    document.getElementById(
        "filterPeriode"
    ).value =
        "semua";


    tampilkanTransaksi();

}


// ========================================
// CEK TRANSAKSI SESUAI FILTER
// ========================================

function transaksiSesuaiFilter(data) {

    const filterJenis =
        document.getElementById(
            "filterJenis"
        ).value;


    const filterKategori =
        document.getElementById(
            "filterKategori"
        ).value;


    const filterPeriode =
        document.getElementById(
            "filterPeriode"
        ).value;


    // FILTER JENIS

    if (
        filterJenis !== "semua" &&
        data.jenis !== filterJenis
    ) {

        return false;

    }


    // FILTER KATEGORI

    if (
        filterKategori !== "semua" &&
        data.kategori !== filterKategori
    ) {

        return false;

    }


    // FILTER PERIODE

    if (
        filterPeriode === "semua"
    ) {

        return true;

    }


    const tanggalTransaksi =
        new Date(
            data.tanggal +
            "T00:00:00"
        );


    const sekarang =
        new Date();


    const tahunSekarang =
        sekarang.getFullYear();


    const bulanSekarang =
        sekarang.getMonth();


    // BULAN INI

    if (
        filterPeriode ===
        "bulanIni"
    ) {

        return (
            tanggalTransaksi.getFullYear() ===
                tahunSekarang &&

            tanggalTransaksi.getMonth() ===
                bulanSekarang
        );

    }


    // BULAN LALU

    if (
        filterPeriode ===
        "bulanLalu"
    ) {

        let bulanLalu =
            bulanSekarang - 1;


        let tahunBulanLalu =
            tahunSekarang;


        if (bulanLalu < 0) {

            bulanLalu = 11;

            tahunBulanLalu =
                tahunSekarang - 1;

        }


        return (
            tanggalTransaksi.getFullYear() ===
                tahunBulanLalu &&

            tanggalTransaksi.getMonth() ===
                bulanLalu
        );

    }


    return true;

}


// ========================================
// TAMPILKAN TRANSAKSI
// ========================================

function tampilkanTransaksi() {

    const daftar =
        document.getElementById(
            "daftarTransaksi"
        );


    const transaksiTerfilter =
        transaksi.filter(
            transaksiSesuaiFilter
        );


    if (
        transaksiTerfilter.length === 0
    ) {

        daftar.innerHTML =
            `
            <p class="belum-ada">
                Tidak ada transaksi yang sesuai dengan filter.
            </p>
            `;

        return;
    }


    daftar.innerHTML = "";


    transaksiTerfilter.forEach(
        function(data) {

            const item =
                document.createElement(
                    "div"
                );


            item.classList.add(
                "transaksi"
            );


            let nominalText =
                formatRupiah(
                    data.nominal
                );


            if (
                data.jenis ===
                "pemasukan"
            ) {

                nominalText =
                    "+ " +
                    nominalText;

            } else {

                nominalText =
                    "- " +
                    nominalText;

            }


            const kelasNominal =
                data.jenis ===
                "pemasukan"

                    ? "pemasukan-text"

                    : "pengeluaran-text";


            item.innerHTML = `

                <div class="transaksi-info">

                    <h4>
                        ${data.kategori}
                    </h4>

                    <p>

                        ${formatTanggal(data.tanggal)}

                        ${
                            data.keterangan
                                ? " • " +
                                  data.keterangan
                                : ""
                        }

                    </p>

                </div>


                <div class="transaksi-kanan">

                    <div
                        class="transaksi-nominal ${kelasNominal}"
                    >
                        ${nominalText}
                    </div>


                    <div class="transaksi-buttons">

                        <button
                            class="btn-edit"
                            onclick="editTransaksi('${data.id}')"
                        >
                            Edit
                        </button>


                        <button
                            class="btn-hapus"
                            onclick="hapusTransaksi('${data.id}')"
                        >
                            Hapus
                        </button>

                    </div>

                </div>

            `;


            daftar.appendChild(
                item
            );

        }
    );

}


// ========================================
// HITUNG KEUANGAN
// ========================================

function hitungKeuangan() {

    let totalPemasukan = 0;

    let totalPengeluaran = 0;


    transaksi.forEach(
        function(data) {

            if (
                data.jenis ===
                "pemasukan"
            ) {

                totalPemasukan +=
                    Number(
                        data.nominal
                    );

            } else {

                totalPengeluaran +=
                    Number(
                        data.nominal
                    );

            }

        }
    );


    const saldo =
        totalPemasukan -
        totalPengeluaran;


    document.getElementById(
        "totalPemasukan"
    ).textContent =
        formatRupiah(
            totalPemasukan
        );


    document.getElementById(
        "totalPengeluaran"
    ).textContent =
        formatRupiah(
            totalPengeluaran
        );


    document.getElementById(
        "saldo"
    ).textContent =
        formatRupiah(
            saldo
        );

}


// ========================================
// DASHBOARD BULANAN
// ========================================

function tampilkanDashboardBulanan() {

    const namaBulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];


    document.getElementById(
        "bulanAktif"
    ).textContent =
        namaBulan[bulanDashboard] +
        " " +
        tahunDashboard;


    let pemasukan = 0;

    let pengeluaran = 0;


    transaksi.forEach(
        function(data) {

            const tanggal =
                new Date(
                    data.tanggal +
                    "T00:00:00"
                );


            const tahun =
                tanggal.getFullYear();


            const bulan =
                tanggal.getMonth();


            if (
                tahun ===
                    tahunDashboard &&

                bulan ===
                    bulanDashboard
            ) {

                if (
                    data.jenis ===
                    "pemasukan"
                ) {

                    pemasukan +=
                        Number(
                            data.nominal
                        );

                } else {

                    pengeluaran +=
                        Number(
                            data.nominal
                        );

                }

            }

        }
    );


    const sisa =
        pemasukan -
        pengeluaran;


    document.getElementById(
        "pemasukanBulanan"
    ).textContent =
        formatRupiah(
            pemasukan
        );


    document.getElementById(
        "pengeluaranBulanan"
    ).textContent =
        formatRupiah(
            pengeluaran
        );


    document.getElementById(
        "sisaBulanan"
    ).textContent =
        formatRupiah(
            sisa
        );

}


// ========================================
// BULAN SEBELUMNYA
// ========================================

function bulanSebelumnya() {

    bulanDashboard--;


    if (
        bulanDashboard < 0
    ) {

        bulanDashboard = 11;

        tahunDashboard--;

    }


    tampilkanDashboardBulanan();

}


// ========================================
// BULAN BERIKUTNYA
// ========================================

function bulanBerikutnya() {

    bulanDashboard++;


    if (
        bulanDashboard > 11
    ) {

        bulanDashboard = 0;

        tahunDashboard++;

    }


    tampilkanDashboardBulanan();

}


// ========================================
// FORMAT RUPIAH
// ========================================

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",

            currency: "IDR",

            maximumFractionDigits: 0
        }
    ).format(angka);

}


// ========================================
// FORMAT TANGGAL
// ========================================

function formatTanggal(tanggal) {

    const date =
        new Date(
            tanggal +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",

            month: "long",

            year: "numeric"
        }
    );

}