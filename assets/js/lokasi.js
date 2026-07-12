/*
|--------------------------------------------------------------------------
| Monitoring Lokasi (GPS) Real-time — Leaflet (tampilan ala Google Maps)
|--------------------------------------------------------------------------
*/

const cowSelect = document.getElementById("cowSelect");
let currentCow = cowSelect && cowSelect.value ? cowSelect.value : "";

let lastPlottedTimestamp = null; // hanya update peta kalau timestamp data berubah (data baru masuk)

/*
|--------------------------------------------------------------------------
| Map setup (Leaflet + tile bergaya Google Maps)
|--------------------------------------------------------------------------
*/

let map;
let marker;
let mapAssetsLoaded = false;

// Tile "Voyager" dari CARTO — palet warna paling mendekati Google Maps
// (jalan putih/kuning, air biru muda, area hijau lembut), gratis & tanpa API key.
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) {
        return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
}

async function loadMapAssets() {

    if (mapAssetsLoaded) {
        return;
    }

    loadCss("https://unpkg.com/leaflet/dist/leaflet.css");

    try {
        await loadScript("https://unpkg.com/leaflet/dist/leaflet.js");
    } catch (error) {
        console.error("Leaflet gagal dimuat dari CDN.", error);
        const mapEl = document.getElementById("map");
        if (mapEl) {
            mapEl.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 text-muted">Peta tidak dapat dimuat (CDN diblokir). Koordinat tetap tersedia pada card di atas.</div>';
        }
        throw error;
    }

    mapAssetsLoaded = true;

}

function getGoogleStylePin() {
    // Icon marker ala pin merah Google Maps.
    // Dibuat setelah Leaflet siap karena butuh L.divIcon.
    return L.divIcon({
        className: "gmap-style-pin",
        html: `
            <div style="
                width: 30px; height: 42px;
                display:flex; align-items:flex-start; justify-content:center;
            ">
                <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 12.4 24.6 14 26.4a1.3 1.3 0 0 0 2 0C17.6 39.6 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="#EA4335"/>
                    <circle cx="15" cy="15" r="6.5" fill="#ffffff"/>
                </svg>
            </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
    });
}

function initLeafletMap(position) {
    if (typeof L === "undefined") {
        console.error("Leaflet belum siap");
        return;
    }

    map = L.map("map", {
        zoomControl: true,
        attributionControl: true,
    }).setView([position.lat, position.lng], 17);

    L.tileLayer(TILE_URL, {
        maxZoom: 20,
        attribution: TILE_ATTRIBUTION,
    }).addTo(map);

    // Posisi kontrol zoom dipindah ke kanan bawah, seperti Google Maps
    map.zoomControl.setPosition("bottomright");
}

async function ensureMap(position) {

    await loadMapAssets();

    if (!map) {
        initLeafletMap(position);
    }

}

function updateMarker(position) {

    if (!marker) {
        marker = L.marker([position.lat, position.lng], { icon: getGoogleStylePin() }).addTo(map);
    } else {
        marker.setLatLng([position.lat, position.lng]);
    }
    map.panTo([position.lat, position.lng]);

}

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

            lastPlottedTimestamp = null;

            loadLokasi();

        }

    );

}

/*
|--------------------------------------------------------------------------
| Load Data Lokasi
|--------------------------------------------------------------------------
*/

async function loadLokasi() {

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
            console.log("Data lokasi tidak tersedia untuk sapi ini.");
            return;
        }

        await updateLokasi(data);

    }

    catch (error) {

        console.log(error);

    }

}

/*
|--------------------------------------------------------------------------
| Update Card & Peta
|--------------------------------------------------------------------------
*/

async function updateLokasi(data) {

    if (!data) {
        return;
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

    if (!data.gps || typeof data.gps.latitude === "undefined" || typeof data.gps.longitude === "undefined") {
        return;
    }

    // Card koordinat selalu ditampilkan sesuai data terkini
    const elLat = document.getElementById("latitude");
    if (elLat) elLat.innerText = data.gps.latitude;

    const elLng = document.getElementById("longitude");
    if (elLng) elLng.innerText = data.gps.longitude;

    const mapsLink = document.getElementById("maps");
    if (mapsLink) {
        mapsLink.href = data.gps.linkMaps || `https://www.google.com/maps?q=${data.gps.latitude},${data.gps.longitude}`;
    }

    // Peta hanya di-update (marker digeser) kalau ada data BARU dari
    // device (timestamp berbeda dari titik terakhir).
    const isNewData = data.timestamp !== lastPlottedTimestamp;

    if (!isNewData) {
        return;
    }

    lastPlottedTimestamp = data.timestamp;

    const position = { lat: data.gps.latitude, lng: data.gps.longitude };

    try {
        await ensureMap(position);
        updateMarker(position);
    } catch (error) {
        // sudah ditangani pesan fallback di loadMapAssets()
    }

}

/*
|--------------------------------------------------------------------------
| Init & Refresh
|--------------------------------------------------------------------------
*/

loadLokasi();

setInterval(

    loadLokasi,

    2000

);