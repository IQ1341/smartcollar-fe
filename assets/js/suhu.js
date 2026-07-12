/*
|--------------------------------------------------------------------------
| Monitoring Suhu Real-time
|--------------------------------------------------------------------------
*/

const cowSelect = document.getElementById("cowSelect");
let currentCow = cowSelect && cowSelect.value ? cowSelect.value : "";

const MAX_POINTS = 30; // jumlah titik chart yang disimpan (± 1 menit @ interval 2 detik)
const CHART_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js";

let tempChart;
let historyData = []; // { timestamp, temperature }[]
let lastPlottedTimestamp = null; // hanya push ke chart kalau timestamp data berubah (data baru masuk)
let chartReady = null; // promise, biar renderChart() tidak dipanggil sebelum library siap
let resizeTimer = null;

/*
|--------------------------------------------------------------------------
| Load Chart.js (dynamic, hindari race condition)
|--------------------------------------------------------------------------
*/

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function ensureChartJs() {

    if (chartReady) {
        return chartReady;
    }

    if (typeof Chart !== "undefined") {
        chartReady = Promise.resolve();
        return chartReady;
    }

    chartReady = loadScript(CHART_JS_URL).catch((error) => {
        console.error("Gagal memuat Chart.js dari CDN. Periksa koneksi internet / ad-blocker.", error);
        throw error;
    });

    return chartReady;

}

/*
|--------------------------------------------------------------------------
| Helper: deteksi layar mobile
|--------------------------------------------------------------------------
*/

function isMobileScreen() {
    return window.innerWidth < 576;
}

function isTabletScreen() {
    return window.innerWidth < 768;
}

/*
|--------------------------------------------------------------------------
| Render Chart
|--------------------------------------------------------------------------
*/

function renderChart(data) {

    const ctx = document.getElementById("tempChart");
    if (!ctx || typeof Chart === "undefined") {
        return;
    }

    // Urutkan lama -> baru khusus untuk chart biar tren terbaca alami
    const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const mobile = isMobileScreen();
    const tablet = isTabletScreen();

    const labels = sorted.map(d => {
        const t = new Date(d.timestamp);
        if (isNaN(t.getTime())) return "";
        // Di layar sempit tampilkan jam:menit saja biar tidak penuh
        return mobile
            ? t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
            : t.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    });
    const temps = sorted.map(d => parseFloat(d.temperature) || null);

    if (tempChart) tempChart.destroy();

    const tickFont = mobile ? 10 : 12;
    const legendFont = mobile ? 11 : 13;
    const maxTicks = mobile ? 4 : (tablet ? 6 : 8);
    const pointRadius = mobile ? 1.5 : 2;

    tempChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Suhu (°C)",
                data: temps,
                borderColor: "#60a5fa",
                backgroundColor: "rgba(96, 165, 250, 0.15)",
                fill: true,
                tension: 0.35,
                borderWidth: mobile ? 1.5 : 2,
                pointRadius: pointRadius,
                pointBackgroundColor: "#38bdf8"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: mobile ? 4 : 8
            },
            plugins: {
                legend: {
                    display: !mobile, // sembunyikan legend di HP biar hemat ruang
                    labels: { color: "#e2e8f0", font: { size: legendFont } }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8", maxTicksLimit: maxTicks, font: { size: tickFont } },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    ticks: { color: "#94a3b8", font: { size: tickFont } },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });

}

function resetChart() {

    historyData = [];
    lastPlottedTimestamp = null;

    if (tempChart) {
        tempChart.destroy();
        tempChart = null;
    }

}

/*
|--------------------------------------------------------------------------
| Resize handling
|--------------------------------------------------------------------------
| Chart.js sendiri sudah responsive (auto resize saat container berubah),
| tapi label/font/ticks perlu di-render ulang penuh saat breakpoint mobile
| <-> desktop berubah (mis. rotasi layar HP). Di-debounce biar tidak
| render ulang berkali-kali saat drag resize.
*/

window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        if (historyData.length > 0) {
            renderChart(historyData);
        }
    }, 300);

});

/*
|--------------------------------------------------------------------------
| Change Cow
|--------------------------------------------------------------------------
*/

if (cowSelect) {

    cowSelect.addEventListener(

        "change",

        function () {

            currentCow = this.value;

            resetChart();
            loadSuhu();

        }

    );

}

/*
|--------------------------------------------------------------------------
| Load Data Suhu
|--------------------------------------------------------------------------
*/

async function loadSuhu() {

    if (!currentCow) {
        return;
    }

    try {

        const response =
        await fetch(

            "../ajax/dashboard.php?cowId=" +

            currentCow

        );

        const result =
        await response.json();

        if (!result.success) {

            console.log(result.message);

            return;

        }

        const data = result.data;
        if (!data || Object.keys(data).length === 0) {
            console.log("Data suhu tidak tersedia untuk sapi ini.");
            return;
        }

        updateSuhu(data);

    }

    catch (error) {

        console.log(error);

    }

}

/*
|--------------------------------------------------------------------------
| Update Card & Chart
|--------------------------------------------------------------------------
*/

function updateSuhu(data) {

    if (!data) {
        return;
    }

    const t = (typeof data.temperature === "object" && data.temperature !== null)
        ? data.temperature.value
        : data.temperature;

    // Card nilai suhu
    const valSuhu = document.getElementById("val-suhu");
    if (valSuhu) {
        valSuhu.innerText = (t !== null && typeof t !== "undefined") ? t : "-";
    }

    // Badge kondisi
    const valKondisi = document.getElementById("val-kondisi");
    if (valKondisi && t !== null && typeof t !== "undefined") {
        if (t >= 40) {
            valKondisi.className = "badge bg-danger px-3 py-1 rounded-pill";
            valKondisi.innerText = "BAHAYA";
        } else if (t >= 39.5) {
            valKondisi.className = "badge bg-warning text-dark px-3 py-1 rounded-pill";
            valKondisi.innerText = "WASPADA";
        } else {
            valKondisi.className = "badge bg-light text-dark px-3 py-1 rounded-pill";
            valKondisi.innerText = "NORMAL";
        }
    }

    // Status online/offline collar
    const lastUpdate = data.timestamp ? new Date(data.timestamp) : null;
    const age = lastUpdate ? (Date.now() - lastUpdate.getTime()) : Infinity;
    const isOnline = age < 30000;

    const status = document.getElementById("status");
    if (status) {
        status.innerText = isOnline ? "ONLINE" : "OFFLINE";
        status.className = "value-text " + (isOnline ? "text-success" : "text-danger");
    }

    const elLast = document.getElementById("lastUpdate");
    if (elLast && lastUpdate) {
        elLast.innerText = lastUpdate.toLocaleString();
    }

    // Chart: hanya tambah titik & render ulang kalau ada data BARU dari
    // device (timestamp berbeda dari titik terakhir yang sudah diplot).
    // Bukan setiap kali polling 2 detik meskipun datanya masih sama.
    if (t !== null && typeof t !== "undefined" && data.timestamp) {

        const isNewData = data.timestamp !== lastPlottedTimestamp;

        if (isNewData) {

            lastPlottedTimestamp = data.timestamp;

            historyData.push({ timestamp: data.timestamp, temperature: t });

            if (historyData.length > MAX_POINTS) {
                historyData.shift();
            }

            renderChart(historyData);

        }

    }

}

/*
|--------------------------------------------------------------------------
| Init & Refresh
|--------------------------------------------------------------------------
*/

async function start() {

    try {
        await ensureChartJs();
    } catch (error) {
        // Chart.js gagal dimuat (mis. offline / CDN diblokir).
        // Card suhu tetap jalan normal, hanya grafik yang tidak tampil.
        const cardChart = document.getElementById("tempChart");
        if (cardChart && cardChart.parentElement) {
            cardChart.parentElement.innerHTML =
                '<p class="text-muted mb-0">Grafik tidak dapat dimuat (Chart.js gagal diakses). Data suhu tetap diperbarui pada card di atas.</p>';
        }
    }

    loadSuhu();

    setInterval(loadSuhu, 2000);

}

start();