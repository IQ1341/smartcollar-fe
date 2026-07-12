/*
|--------------------------------------------------------------------------
| Dashboard Monitoring
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| MAP
|--------------------------------------------------------------------------
*/

let map;
let marker;

const cowSelect =
document.getElementById("cowSelect");

let currentCow =
                cowSelect && cowSelect.value ? cowSelect.value : "";
const googleMapsApiKey = typeof GOOGLE_MAPS_API_KEY !== "undefined" ? GOOGLE_MAPS_API_KEY : "YOUR_GOOGLE_MAPS_API_KEY";
const useGoogleMaps = googleMapsApiKey && googleMapsApiKey !== "YOUR_GOOGLE_MAPS_API_KEY";
let mapProvider = useGoogleMaps ? "google" : "leaflet";
let mapAssetsLoaded = false;

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

    if (mapProvider === "google") {
        try {
            await loadScript(`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`);
        } catch (error) {
            console.error("Google Maps failed to load, falling back to Leaflet.", error);
            mapProvider = "leaflet";
        }
    }

    if (mapProvider === "leaflet") {
        loadCss("https://unpkg.com/leaflet/dist/leaflet.css");
        await loadScript("https://unpkg.com/leaflet/dist/leaflet.js");
    }

    mapAssetsLoaded = true;
}

function initGoogleMap(position) {
    if (!window.google || !window.google.maps) {
        console.error("Google Maps API not loaded");
        return;
    }
    map = new google.maps.Map(document.getElementById("map"), {
        center: position,
        zoom: 18,
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
    });
}

function initLeafletMap(position) {
    if (typeof L === "undefined") {
        console.error("Leaflet not loaded");
        return;
    }
    map = L.map("map").setView([position.lat, position.lng], 18);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
    }).addTo(map);
}

async function ensureMap(position) {
    await loadMapAssets();
    if (!map) {
        if (mapProvider === "google") {
            initGoogleMap(position);
        } else {
            initLeafletMap(position);
        }
    }
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

            loadMonitoring();

        }

    );

}

/*
|--------------------------------------------------------------------------
| Load Monitoring
|--------------------------------------------------------------------------
*/

async function loadMonitoring() {

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
            console.log('No monitoring data available for selected cow.');
            return;
        }

        await updateDashboard(data);

    }

    catch (error) {

        console.log(error);

    }

}

/*
|--------------------------------------------------------------------------
| Update Dashboard
|--------------------------------------------------------------------------
*/

async function updateDashboard(data) {

    if (!data) {
        return;
    }

    const status = document.getElementById("status");
    const lastUpdate = new Date(data.timestamp);
    const age = Date.now() - lastUpdate.getTime();
    const isOnline = age < 30000;

    if (data.gps && typeof data.gps.latitude !== "undefined" && typeof data.gps.longitude !== "undefined") {
        const lat = data.gps.latitude;
        const lng = data.gps.longitude;
        const position = { lat, lng };

        await ensureMap(position);

        if (mapProvider === "google") {
            if (!marker) {
                marker = new google.maps.Marker({
                    position,
                    map,
                    title: "Smart Collar"
                });
            } else {
                marker.setPosition(position);
            }
            map.panTo(position);
        } else if (mapProvider === "leaflet") {
            if (!marker) {
                marker = L.marker([position.lat, position.lng]).addTo(map);
            } else {
                marker.setLatLng([position.lat, position.lng]);
            }
            map.panTo([position.lat, position.lng]);
        }
    }

    // Render device cards (support single object or array)
    const cardsContainer = document.getElementById("deviceCards");
    if (cardsContainer) {
        const devices = Array.isArray(data) ? data : [data];
        renderDeviceCards(devices, cardsContainer);
    }

    // Safely update any legacy elements if present (page may have removed them)
    const elTemp = document.getElementById("temperature");
    if (elTemp && typeof data.temperature !== 'undefined') elTemp.innerHTML = (typeof data.temperature === 'object' && data.temperature.value ? data.temperature.value : data.temperature) + " °C";

    // Update new dashboard stat fields if present
    const valSuhu = document.getElementById('val-suhu');
    if (valSuhu && typeof data.temperature !== 'undefined') {
        const t = (typeof data.temperature === 'object' && data.temperature.value ? data.temperature.value : data.temperature);
        valSuhu.innerText = t !== null && typeof t !== 'undefined' ? t : '-';
    }

    const elSignal = document.getElementById("signal");
    if (elSignal && typeof data.signal !== 'undefined') elSignal.innerHTML = data.signal + " dBm";

    const valAkt = document.getElementById('val-aktivitas');
    if (valAkt) {
        // prefer movement status from backend (Diam/Bergerak)
        if (data.movement && typeof data.movement.status !== 'undefined') {
            const status = data.movement.status;
            // Map numeric status to Indonesian labels: 0=Diam, 1-2=Bergerak
            const statusLabel = status === 0 ? 'DIAM' : 'BERGERAK';
            valAkt.innerText = statusLabel;
        } else if (typeof data.activity !== 'undefined') {
            valAkt.innerText = data.activity;
        } else {
            valAkt.innerText = '-';
        }
    }

    if (status) { status.innerHTML = isOnline ? "ONLINE" : "OFFLINE"; status.className = isOnline ? "text-success" : "text-danger"; }

    const elLat = document.getElementById("latitude");
    if (elLat && data.gps && typeof data.gps.latitude !== 'undefined') elLat.innerHTML = data.gps.latitude;
    const elLng = document.getElementById("longitude");
    if (elLng && data.gps && typeof data.gps.longitude !== 'undefined') elLng.innerHTML = data.gps.longitude;

    const vLat = document.getElementById('val-lat');
    const vLng = document.getElementById('val-long');
    if (vLat && data.gps && typeof data.gps.latitude !== 'undefined') vLat.innerText = data.gps.latitude;
    if (vLng && data.gps && typeof data.gps.longitude !== 'undefined') vLng.innerText = data.gps.longitude;

    const elLast = document.getElementById("lastUpdate");
    if (elLast && lastUpdate) elLast.innerHTML = lastUpdate.toLocaleString();

    // Update register badge condition if present
    const valKond = document.getElementById('val-kondisi');
    if (valKond && typeof data.temperature !== 'undefined') {
        const t = (typeof data.temperature === 'object' && data.temperature.value ? data.temperature.value : data.temperature);
        if (t !== null && typeof t !== 'undefined') {
            if (t >= 40) { valKond.className = 'badge bg-danger px-3 py-1 rounded-pill'; valKond.innerText = 'BAHAYA'; }
            else if (t >= 39.5) { valKond.className = 'badge bg-warning text-dark px-3 py-1 rounded-pill'; valKond.innerText = 'WASPADA'; }
            else { valKond.className = 'badge bg-light text-dark px-3 py-1 rounded-pill'; valKond.innerText = 'NORMAL'; }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Google Maps
    |--------------------------------------------------------------------------
    */

    document
    .getElementById("maps")
    .href =
    data.gps.linkMaps;

}

function renderDeviceCards(devices, container) {
    container.innerHTML = "";
    devices.forEach((d) => {
        const id = d.deviceId || d.collarId || d.id || currentCow || "-";
        const tempVal = (typeof d.temperature !== 'undefined') ? d.temperature : null;
        const temp = tempVal !== null ? tempVal + ' °C' : '-';
        const rawMovement = (typeof d.movement !== 'undefined') ? d.movement : (typeof d.movementValue !== 'undefined' ? d.movementValue : null);
        let movementVal = null;
        // backend provides movement as object { accelX, status }
        if (rawMovement !== null && typeof rawMovement === 'number') movementVal = rawMovement;
        else if (rawMovement !== null && typeof rawMovement === 'object') {
            if (typeof rawMovement.accelX === 'number') movementVal = rawMovement.accelX;
            else if (typeof rawMovement.value === 'number') movementVal = rawMovement.value;
        }
        // prefer movement status string for display when available
        const movementStatusStr = (rawMovement && typeof rawMovement === 'object' && rawMovement.status) ? rawMovement.status : null;
        const activity = movementVal !== null ? movementVal : (movementStatusStr !== null ? movementStatusStr : (d.activity || d.motion || d.activityState || '-'));
        const lat = d.gps && typeof d.gps.latitude !== 'undefined' ? d.gps.latitude : '-';
        const lng = d.gps && typeof d.gps.longitude !== 'undefined' ? d.gps.longitude : '-';
        const lastUpdate = d.timestamp ? new Date(d.timestamp) : null;
        const age = lastUpdate ? (Date.now() - lastUpdate.getTime()) : Infinity;
        const status = age < 30000 ? 'ONLINE' : 'OFFLINE';
        const statusClass = age < 30000 ? 'text-success' : 'text-danger';

        // Temperature status: threshold — adjust as needed
        let tempStatus = 'Normal';
        let tempStatusClass = 'text-success';
        if (tempVal !== null) {
            if (tempVal >= 40) { tempStatus = 'Bahaya'; tempStatusClass = 'text-danger'; }
            else if (tempVal >= 39.5) { tempStatus = 'Waspada'; tempStatusClass = 'text-warning'; }
            else { tempStatus = 'Normal'; tempStatusClass = 'text-success'; }
        } else {
            tempStatus = '-'; tempStatusClass = 'text-muted';
        }

        // Use movement status from backend (Diam/Bergerak)
        let actShort = '-';
        if (movementStatusStr !== null && typeof movementStatusStr === 'number') {
            const status = Number(movementStatusStr);
            // Map numeric status to Indonesian labels: 0=Diam, 1-2=Bergerak
            actShort = status === 0 ? 'Diam' : 'Bergerak';
        } else if (activity) {
            // Fallback to activity string if status not available
            const actLower = ('' + activity).toLowerCase();
            actShort = (actLower.includes('move') || actLower.includes('moving') || actLower.includes('walk') || actLower.includes('run')) ? 'Bergerak' : (actLower.includes('sleep') || actLower.includes('rest') || actLower.includes('idle') ? 'Diam' : (activity === '-' ? '-' : activity));
        }

        const row = document.createElement('div');
        row.className = 'd-flex flex-row gap-3 mb-3 align-items-stretch';

        // Temp card
        const tempCard = document.createElement('div');
        tempCard.className = 'card text-center shadow-sm device-card bg-gradient-suhu';
        tempCard.style.flex = '1 1 32%';
        tempCard.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">Suhu Tubuh</h6>
                <div class="h2 mb-1">${temp}</div>
                <small class="${tempStatusClass}">${tempStatus}</small>
            </div>
        `;

        // Activity card
        const actCard = document.createElement('div');
        actCard.className = 'card text-center shadow-sm device-card bg-gradient-aktivitas';
        actCard.style.flex = '1 1 32%';
        actCard.innerHTML = `
                <div class="card-body">
                    <h6 class="card-title">Aktivitas</h6>
                    <div class="h3 mb-1">${actShort}</div>
                    <small class="text-muted">${fmt(movementVal !== null ? movementVal : activity)}</small>
                </div>
            `;

        // GPS card
        const gpsCard = document.createElement('div');
        gpsCard.className = 'card text-center shadow-sm device-card bg-gradient-lokasi';
        gpsCard.style.flex = '1 1 32%';
        const mapsHref = d.gps && d.gps.linkMaps ? d.gps.linkMaps : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        gpsCard.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">Koordinat GPS</h6>
                <div class="mb-1">Lat: ${lat}</div>
                <div class="mb-2">Lng: ${lng}</div>
            </div>
        `;

        // Status card
        const statusCard = document.createElement('div');
        statusCard.className = 'card text-center shadow-sm device-card';
        statusCard.style.flex = '1 1 20%';
        statusCard.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">Status</h6>
                <div class="h5 mb-1 ${statusClass}">${status}</div>
                <small class="text-muted">${lastUpdate ? lastUpdate.toLocaleString() : '-'}</small>
            </div>
        `;

        row.appendChild(tempCard);
        row.appendChild(actCard);
        row.appendChild(gpsCard);
        row.appendChild(statusCard);

        container.appendChild(row);
    });
}
        // small utility to format objects safely
        function fmt(v) {
            if (v === null || typeof v === 'undefined') return '-';
            if (typeof v === 'object') {
                if (typeof v.value !== 'undefined') return v.value;
                if (typeof v.movement !== 'undefined') return v.movement;
                if (typeof v.type !== 'undefined') return v.type;
                try { return JSON.stringify(v); } catch (e) { return String(v); }
            }
            return v;
        }

/*
|--------------------------------------------------------------------------
| Refresh
|--------------------------------------------------------------------------
*/

loadMonitoring();

setInterval(

    loadMonitoring,

    2000

);