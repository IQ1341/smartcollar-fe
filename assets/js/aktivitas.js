/*
|--------------------------------------------------------------------------
| Monitoring Aktivitas Real-time (accelX)
|--------------------------------------------------------------------------
*/

const cowSelect = document.getElementById("cowSelect");
let currentCow = cowSelect && cowSelect.value ? cowSelect.value : "";

const MAX_POINTS = 30; // jumlah titik chart yang disimpan
const CHART_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.4/chart.umd.min.js";

let activityChart;
let historyData = []; // { timestamp, accelX }[]
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

    const ctx = document.getElementById("activityChart");
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
        return mobile
            ? t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
            : t.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    });
    const values = sorted.map(d => parseFloat(d.accelX) || 0);

    if (activityChart) activityChart.destroy();

    const tickFont = mobile ? 10 : 12;
    const legendFont = mobile ? 11 : 13;
    const maxTicks = mobile ? 4 : (tablet ? 6 : 8);
    const pointRadius = mobile ? 1.5 : 2;

    activityChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Aktivitas - accelX",
                data: values,
                borderColor: "#34d399",
                backgroundColor: "rgba(52, 211, 153, 0.15)",
                fill: true,
                tension: 0.35,
                borderWidth: mobile ? 1.5 : 2,
                pointRadius: pointRadius,
                pointBackgroundColor: "#10b981"
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
                    display: !mobile,
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

    if (activityChart) {
        activityChart.destroy();
        activityChart = null;
    }

}

/*
|--------------------------------------------------------------------------
| Resize handling (debounced)
|--------------------------------------------------------------------------
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
            loadAktivitas();

        }

    );

}

/*
|--------------------------------------------------------------------------
| Load Data Aktivitas
|--------------------------------------------------------------------------
*/

async function loadAktivitas() {

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
            console.log("Data aktivitas tidak tersedia untuk sapi ini.");
            return;
        }

        updateAktivitas(data);

    }

    catch (error) {

        console.log(error);

    }

}

/*
|--------------------------------------------------------------------------
| Ambil Nilai accelX
|--------------------------------------------------------------------------
| Sesuai skema BE (createMonitoringSchema): sensor.movement hanya berisi
| field accelX (number). Tidak ada accelY di data yang dikirim device.
*/

function extractAccelX(movement) {

    if (!movement || typeof movement !== "object") {
        return null;
    }

    return (typeof movement.accelX !== "undefined" && movement.accelX !== null)
        ? movement.accelX
        : null;

}

/*
|--------------------------------------------------------------------------
| Update Card & Chart
|--------------------------------------------------------------------------
*/

function updateAktivitas(data) {

    if (!data) {
        return;
    }

    // Ambil nilai sensor accelX dari data.movement (sesuai skema BE).
    const movement = (typeof data.movement === "object" && data.movement !== null) ? data.movement : null;
    const accelX = extractAccelX(movement);

    const movementStatus = movement && typeof movement.status !== "undefined" ? movement.status : null;

    // Card nilai aktivitas (accelX)
    const valAktivitas = document.getElementById("val-aktivitas");
    if (valAktivitas) {
        valAktivitas.innerText = (accelX !== null && typeof accelX !== "undefined") ? accelX : "-";
    }

    // Badge Diam / Bergerak (berdasarkan movement.status: 0 = Diam, selain itu Bergerak)
    const valGerak = document.getElementById("val-gerak");
    if (valGerak && movementStatus !== null && typeof movementStatus !== "undefined") {
        const status = Number(movementStatus);
        if (status === 0) {
            valGerak.className = "badge bg-light text-dark px-3 py-1 rounded-pill";
            valGerak.innerText = "DIAM";
        } else {
            valGerak.className = "badge bg-success px-3 py-1 rounded-pill";
            valGerak.innerText = "BERGERAK";
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
    if (accelX !== null && typeof accelX !== "undefined" && data.timestamp) {

        const isNewData = data.timestamp !== lastPlottedTimestamp;

        if (isNewData) {

            lastPlottedTimestamp = data.timestamp;

            historyData.push({ timestamp: data.timestamp, accelX: accelX });

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
        // Card aktivitas tetap jalan normal, hanya grafik yang tidak tampil.
        const cardChart = document.getElementById("activityChart");
        if (cardChart && cardChart.parentElement) {
            cardChart.parentElement.innerHTML =
                '<p class="text-muted mb-0">Grafik tidak dapat dimuat (Chart.js gagal diakses). Data aktivitas tetap diperbarui pada card di atas.</p>';
        }
    }

    loadAktivitas();

    setInterval(loadAktivitas, 2000);

}

start();