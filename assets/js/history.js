/* History page script */

document.addEventListener('DOMContentLoaded', () => {

    const loadBtn = document.getElementById('loadHistory');
    const cowSelect = document.getElementById('cowSelect');
    const dateStart = document.getElementById('dateStart');
    const dateEnd = document.getElementById('dateEnd');
    const historyBody = document.getElementById('historyBody');
    const searchInput = document.getElementById('searchInput');
    const paginationControls = document.getElementById('paginationControls');
    const paginationInfo = document.getElementById('paginationInfo');
    const exportBtn = document.getElementById('exportCsvBtn');

    let allData = [];
    let filteredData = [];
    let currentPage = 1;
    const perPage = 10;
    let tempChart = null;

    /*
    |--------------------------------------------------------------------------
    | Quick Date Presets
    |--------------------------------------------------------------------------
    */

    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const today = new Date();
            const range = this.dataset.range;

            if (range === 'today') {
                dateStart.value = formatDate(today);
                dateEnd.value = formatDate(today);
            } else {
                const days = parseInt(range, 10);
                const past = new Date();
                past.setDate(today.getDate() - (days - 1));
                dateStart.value = formatDate(past);
                dateEnd.value = formatDate(today);
            }

            loadHistory();
        });
    });

    function formatDate(d) {
        return d.toISOString().split('T')[0];
    }

    /*
    |--------------------------------------------------------------------------
    | Bikin daftar tanggal antara start - end (inklusif)
    |--------------------------------------------------------------------------
    */

    function getDateRange(start, end) {
        const dates = [];
        let current = new Date(start);
        const last = new Date(end);

        while (current <= last) {
            dates.push(formatDate(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    /*
    |--------------------------------------------------------------------------
    | Ambil satu hari data dari API asli (GET ?cowId=..&date=..)
    |--------------------------------------------------------------------------
    */

    async function fetchOneDay(cowId, date) {
        try {
            const resp = await fetch(`${BASE_URL_HISTORY}?cowId=${encodeURIComponent(cowId)}&date=${encodeURIComponent(date)}`);
            const result = await resp.json();
            if (!result.success || !Array.isArray(result.data)) return [];
            return result.data;
        } catch (err) {
            console.error(`Gagal memuat data tanggal ${date}:`, err);
            return [];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Load Data (loop tiap tanggal dalam rentang, lalu digabung)
    |--------------------------------------------------------------------------
    */

    async function loadHistory() {
        const cowId = cowSelect.value;

        if (!cowId) {
            alert('Pilih sapi terlebih dahulu');
            return;
        }

        if (!dateStart.value || !dateEnd.value) {
            alert('Pilih rentang tanggal terlebih dahulu');
            return;
        }

        if (dateStart.value > dateEnd.value) {
            alert('Tanggal awal tidak boleh lebih besar dari tanggal akhir');
            return;
        }

        renderLoadingState();

        const dates = getDateRange(dateStart.value, dateEnd.value);

        // Ambil data tiap tanggal secara paralel
        const results = await Promise.all(dates.map(date => fetchOneDay(cowId, date)));
        allData = results.flat();

        // Urutkan berdasarkan waktu terbaru dulu
        allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        currentPage = 1;
        applySearch();
        updateSummary(allData);
        renderChart(allData);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper: ambil label movement dari struktur asli (object/string)
    |--------------------------------------------------------------------------
    */

    function getMovementLabel(movement) {
        if (movement && typeof movement === 'object') {
            return movement.status ?? movement.accelX ?? JSON.stringify(movement);
        }
        return movement ?? '-';
    }

    function isMovementActive(movement) {
        const label = getMovementLabel(movement);
        return String(label).toLowerCase().includes('active') || String(label).toLowerCase().includes('moving');
    }

    /*
    |--------------------------------------------------------------------------
    | Search / Filter Client-side
    |--------------------------------------------------------------------------
    */

    function applySearch() {
        const keyword = (searchInput.value || '').toLowerCase().trim();

        if (!keyword) {
            filteredData = [...allData];
        } else {
            filteredData = allData.filter(item => {
                const movementLabel = getMovementLabel(item.movement);
                const haystack = [
                    item.timestamp ?? '',
                    item.temperature ?? '',
                    item.signal ?? '',
                    movementLabel,
                    item.gps?.latitude ?? '',
                    item.gps?.longitude ?? ''
                ].join(' ').toLowerCase();
                return haystack.includes(keyword);
            });
        }

        renderTable();
    }

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        applySearch();
    });

    /*
    |--------------------------------------------------------------------------
    | Render Table + Pagination
    |--------------------------------------------------------------------------
    */

    function renderTable() {
        if (filteredData.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Tidak ada data</td></tr>';
            paginationControls.innerHTML = '';
            paginationInfo.textContent = '';
            return;
        }

        const totalPages = Math.ceil(filteredData.length / perPage);
        if (currentPage > totalPages) currentPage = totalPages;

        const startIdx = (currentPage - 1) * perPage;
        const pageData = filteredData.slice(startIdx, startIdx + perPage);

        const rows = pageData.map(item => {
            const t = new Date(item.timestamp);
            const time = isNaN(t.getTime()) ? '-' : t.toLocaleString();
            const temp = (item.temperature !== undefined && item.temperature !== null) ? item.temperature + ' °C' : '-';
            const signal = item.signal !== undefined ? item.signal + ' dBm' : '-';
            const movementLabel = getMovementLabel(item.movement);
            const movementClass = isMovementActive(item.movement) ? 'badge-movement-active' : 'badge-movement-idle';
            const gps = item.gps ? `${item.gps.latitude || '-'}, ${item.gps.longitude || '-'}` : '-';

            return `<tr>
                <td>${time}</td>
                <td>${temp}</td>
                <td>${signal}</td>
                <td><span class="${movementClass}">${movementLabel}</span></td>
                <td>${gps}</td>
            </tr>`;
        }).join('');

        historyBody.innerHTML = rows;

        paginationInfo.textContent = `Menampilkan ${startIdx + 1}-${Math.min(startIdx + perPage, filteredData.length)} dari ${filteredData.length} data`;
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        const createPageItem = (label, page, disabled = false, active = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = label;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (disabled) return;
                currentPage = page;
                renderTable();
            });
            li.appendChild(a);
            return li;
        };

        paginationControls.appendChild(createPageItem('«', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            paginationControls.appendChild(createPageItem(i, i, false, i === currentPage));
        }
        paginationControls.appendChild(createPageItem('»', currentPage + 1, currentPage === totalPages));
    }

    function renderLoadingState() {
        historyBody.innerHTML = `
            <tr><td colspan="5" class="table-loading">
                <i class="fas fa-spinner fa-spin me-2"></i>Memuat data...
            </td></tr>
        `;
        paginationControls.innerHTML = '';
        paginationInfo.textContent = '';
    }

    /*
    |--------------------------------------------------------------------------
    | Summary Cards
    |--------------------------------------------------------------------------
    */

    function updateSummary(data) {
        const temps = data.map(d => parseFloat(d.temperature)).filter(t => !isNaN(t));

        document.getElementById('totalRecords').textContent = data.length;

        if (temps.length === 0) {
            document.getElementById('avgTemp').textContent = '-';
            document.getElementById('maxTemp').textContent = '-';
            document.getElementById('minTemp').textContent = '-';
            return;
        }

        const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
        const max = Math.max(...temps).toFixed(1);
        const min = Math.min(...temps).toFixed(1);

        document.getElementById('avgTemp').textContent = avg + '°C';
        document.getElementById('maxTemp').textContent = max + '°C';
        document.getElementById('minTemp').textContent = min + '°C';
    }

    /*
    |--------------------------------------------------------------------------
    | Chart Tren Suhu (Chart.js)
    |--------------------------------------------------------------------------
    */

    function renderChart(data) {
        const ctx = document.getElementById('tempChart');
        if (!ctx) return;

        // Urutkan lama -> baru khusus untuk chart biar tren terbaca alami
        const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const labels = sorted.map(d => {
            const t = new Date(d.timestamp);
            return isNaN(t.getTime()) ? '' : t.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        });
        const temps = sorted.map(d => parseFloat(d.temperature) || null);

        if (tempChart) tempChart.destroy();

        tempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Suhu (°C)',
                    data: temps,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.15)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2,
                    pointBackgroundColor: '#38bdf8'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8', maxTicksLimit: 8 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Export CSV
    |--------------------------------------------------------------------------
    */

    exportBtn.addEventListener('click', () => {
        if (filteredData.length === 0) {
            alert('Tidak ada data untuk diexport.');
            return;
        }

        const header = ['Waktu', 'Suhu', 'Signal', 'Movement', 'Latitude', 'Longitude'];
        const rows = filteredData.map(item => {
            const t = new Date(item.timestamp);
            const time = isNaN(t.getTime()) ? '-' : t.toLocaleString();
            return [
                time,
                item.temperature ?? '',
                item.signal ?? '',
                getMovementLabel(item.movement),
                item.gps?.latitude ?? '',
                item.gps?.longitude ?? ''
            ];
        });

        let csvContent = header.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `riwayat-monitoring-${dateStart.value}_${dateEnd.value}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    });

    /*
    |--------------------------------------------------------------------------
    | Event Listener Utama
    |--------------------------------------------------------------------------
    */

    loadBtn.addEventListener('click', loadHistory);

});