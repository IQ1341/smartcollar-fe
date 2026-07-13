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
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    let allData = [];
    let filteredData = [];
    let currentPage = 1;
    const perPage = 10;
    let tempChart = null;
    let cowDetails = null; // Store cow details

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

    async function fetchCowDetails(cowId) {
        try {
            const formData = new FormData();
            formData.append("action", "get");
            formData.append("id", cowId);
            
            const resp = await fetch("../ajax/cow.php", {
                method: "POST",
                body: formData
            });
            
            const result = await resp.json();
            if (result.success && result.data) {
                return result.data;
            }
            return null;
        } catch (err) {
            console.error('Gagal memuat detail sapi:', err);
            return null;
        }
    }

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

        // Ambil detail sapi terlebih dahulu
        cowDetails = await fetchCowDetails(cowId);

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
        // Simplified logic: only show "Diam" or "Aktif"
        if (!movement || !movement.status) return 'Diam';
        
        return movement.status === 0 ? 'Diam' : 'Gerak';
    }

    function isMovementActive(movement) {
        if (!movement || !movement.status) return false;
        return movement.status !== 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Search / Filter Client-side
    |--------------------------------------------------------------------------
    */

    function calculateAge(birthDate) {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age + ' tahun';
    }

    function applySearch() {
        const keyword = (searchInput.value || '').toLowerCase().trim();

        if (!keyword) {
            filteredData = [...allData];
        } else {
            filteredData = allData.filter(item => {
                const movementLabel = getMovementLabel(item.movement);
                const movementText = isMovementActive(item.movement) ? 'Gerak' : 'Diam';
                const cowInfo = cowDetails ? [
                    cowDetails.name ?? '',
                    cowDetails.code ?? '',
                    cowDetails.breed ?? '',
                    cowDetails.gender ?? '',
                    cowDetails.weight ?? '',
                    'normal',
                    movementText
                ].join(' ') : '';
                const haystack = [
                    item.timestamp ?? '',
                    item.temperature ?? '',
                    cowInfo,
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
            historyBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Tidak ada data</td></tr>';
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
            const movementLabel = getMovementLabel(item.movement);
            const movementClass = isMovementActive(item.movement) ? 'badge-movement-active' : 'badge-movement-idle';
            const gps = item.gps ? `${item.gps.latitude || '-'}, ${item.gps.longitude || '-'}` : '-';
            
            // Cow details
            const cowName = cowDetails ? cowDetails.name : '-';
            const cowCode = cowDetails ? cowDetails.code : '-';
            const cowBreed = cowDetails ? cowDetails.breed : '-';
            const cowGender = cowDetails ? cowDetails.gender : '-';
            const cowWeight = cowDetails ? cowDetails.weight + ' kg' : '-';
            const cowAge = cowDetails ? calculateAge(cowDetails.birthDate) : '-';
            const cowCondition = 'Normal';

            return `<tr>
                <td>${time}</td>
                <td>${temp}</td>
                <td>${cowCode}</td>
                <td>${cowName}</td>
                <td>${cowBreed}</td>
                <td>${cowGender}</td>
                <td>${cowAge}</td>
                <td>${cowWeight}</td>
                <td>${cowCondition}</td>
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
            <tr><td colspan="11" class="table-loading">
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
    | Helper: statistik ringkas untuk kop laporan (CSV & PDF)
    |--------------------------------------------------------------------------
    */

    function calculateStats(data) {
        const temps = data.map(d => parseFloat(d.temperature)).filter(t => !isNaN(t));
        const activeCount = data.filter(d => isMovementActive(d.movement)).length;

        return {
            total: data.length,
            avg: temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '-',
            max: temps.length ? Math.max(...temps).toFixed(1) : '-',
            min: temps.length ? Math.min(...temps).toFixed(1) : '-',
            activeCount,
            idleCount: data.length - activeCount
        };
    }

    function generateReportNumber() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const rand = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
        return `SC/RPT/${y}${m}${d}/${rand}`;
    }

    function formatLongDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    /*
    |--------------------------------------------------------------------------
    | Export CSV — format surat laporan terstruktur
    |--------------------------------------------------------------------------
    */

    exportCsvBtn.addEventListener('click', () => {
        if (filteredData.length === 0) {
            alert('Tidak ada data untuk diexport.');
            return;
        }

        const stats = calculateStats(filteredData);
        const reportNo = generateReportNumber();
        const now = new Date();
        const rows = [];

        const addRow = (...cols) => rows.push(cols);
        const csvEscape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
        const blankRow = () => rows.push(['']);

        // ---------- KOP LAPORAN ----------
        addRow('SMART COLLAR - LAPORAN RIWAYAT MONITORING TERNAK SAPI');
        addRow('Sistem Monitoring Kesehatan Ternak Sapi');
        blankRow();
        addRow('Nomor Laporan', ':', reportNo);
        addRow('Tanggal Dicetak', ':', now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ' ' + now.toLocaleTimeString('id-ID'));
        addRow('Periode Monitoring', ':', `${formatLongDate(dateStart.value)} s/d ${formatLongDate(dateEnd.value)}`);
        blankRow();

        // ---------- INFORMASI SAPI ----------
        addRow('DATA IDENTITAS SAPI');
        if (cowDetails) {
            addRow('Kode Sapi', ':', cowDetails.code ?? '-');
            addRow('Nama Sapi', ':', cowDetails.name ?? '-');
            addRow('Breed', ':', cowDetails.breed ?? '-');
            addRow('Gender', ':', cowDetails.gender ?? '-');
            addRow('Umur', ':', calculateAge(cowDetails.birthDate));
            addRow('Berat', ':', cowDetails.weight ? cowDetails.weight + ' kg' : '-');
        } else {
            addRow('Data sapi tidak tersedia', '', '');
        }
        blankRow();

        // ---------- RINGKASAN STATISTIK ----------
        addRow('RINGKASAN HASIL MONITORING');
        addRow('Total Catatan Data', ':', stats.total);
        addRow('Suhu Rata-rata', ':', stats.avg !== '-' ? stats.avg + ' °C' : '-');
        addRow('Suhu Tertinggi', ':', stats.max !== '-' ? stats.max + ' °C' : '-');
        addRow('Suhu Terendah', ':', stats.min !== '-' ? stats.min + ' °C' : '-');
        addRow('Jumlah Catatan Aktif Bergerak', ':', stats.activeCount);
        addRow('Jumlah Catatan Diam', ':', stats.idleCount);
        blankRow();

        // ---------- TABEL DATA ----------
        // Kolom identitas sapi tidak diulang di sini karena sudah tercantum sekali
        // pada bagian "Data Identitas Sapi" di atas (satu laporan = satu sapi).
        addRow('DETAIL DATA MONITORING');
        addRow('Waktu', 'Suhu', 'Kondisi', 'Aktivitas', 'Latitude', 'Longitude');

        filteredData.forEach(item => {
            const t = new Date(item.timestamp);
            const time = isNaN(t.getTime()) ? '-' : t.toLocaleString('id-ID');
            const movementText = isMovementActive(item.movement) ? 'Gerak' : 'Diam';
            addRow(
                time,
                item.temperature ?? '',
                'Normal',
                movementText,
                item.gps?.latitude ?? '',
                item.gps?.longitude ?? ''
            );
        });

        blankRow();
        addRow(`Laporan ini dibuat secara otomatis oleh Smart Collar System pada ${now.toLocaleString('id-ID')}.`);

        let csvContent = rows.map(row => row.map(csvEscape).join(',')).join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `laporan-riwayat-monitoring-${dateStart.value}_${dateEnd.value}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    });

    exportPdfBtn.addEventListener('click', () => {
        if (filteredData.length === 0) {
            alert('Tidak ada data untuk diexport.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18;
        const contentWidth = pageWidth - (2 * margin);

        const stats = calculateStats(filteredData);
        const reportNo = generateReportNumber();
        const now = new Date();

        const COLOR_PRIMARY = [37, 99, 153];   // biru kop/aksen
        const COLOR_DARK = [30, 30, 30];
        const COLOR_MUTED = [110, 110, 110];
        const COLOR_LINE = [190, 190, 190];
        const COLOR_ROW_ALT = [244, 247, 250];

        /* ---------------------------------------------------------------- *
         * KOP SURAT / LETTERHEAD (dicetak di setiap halaman)
         * ---------------------------------------------------------------- */
        function drawLetterhead() {
            doc.setFillColor(...COLOR_PRIMARY);
            doc.rect(0, 0, pageWidth, 24, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(14);
            doc.text('SMART COLLAR MONITORING SYSTEM', margin, 11);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.text('Sistem Monitoring Kesehatan & Aktivitas Ternak Sapi', margin, 17);

            doc.setFontSize(8);
            doc.text(`No. Laporan: ${reportNo}`, pageWidth - margin, 11, { align: 'right' });
            doc.text(now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), pageWidth - margin, 17, { align: 'right' });

            doc.setDrawColor(...COLOR_PRIMARY);
            doc.setLineWidth(0.8);
            doc.line(0, 24, pageWidth, 24);
        }

        function drawFooter(pageNum, totalPages) {
            const footerY = pageHeight - 12;
            doc.setDrawColor(...COLOR_LINE);
            doc.setLineWidth(0.2);
            doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

            doc.setFontSize(7.5);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(...COLOR_MUTED);
            doc.text('Dokumen ini dihasilkan otomatis oleh Smart Collar System dan sah tanpa tanda tangan basah.', margin, footerY);
            doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
        }

        drawLetterhead();
        let y = 34;

        /* ---------------------------------------------------------------- *
         * JUDUL LAPORAN & PERIHAL (gaya surat resmi)
         * ---------------------------------------------------------------- */
        doc.setTextColor(...COLOR_DARK);
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.text('LAPORAN RIWAYAT MONITORING TERNAK SAPI', pageWidth / 2, y, { align: 'center' });
        y += 7;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Perihal   : Rekapitulasi data suhu tubuh dan aktivitas gerak ternak`, margin, y);
        y += 5;
        doc.text(`Periode  : ${formatLongDate(dateStart.value)} s/d ${formatLongDate(dateEnd.value)}`, margin, y);
        y += 8;

        /* ---------------------------------------------------------------- *
         * KOTAK INFORMASI IDENTITAS SAPI
         * ---------------------------------------------------------------- */
        const infoBoxHeight = 28;
        doc.setDrawColor(...COLOR_LINE);
        doc.setFillColor(250, 250, 251);
        doc.roundedRect(margin, y, contentWidth, infoBoxHeight, 1.5, 1.5, 'FD');

        doc.setFont(undefined, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLOR_PRIMARY);
        doc.text('DATA IDENTITAS SAPI', margin + 4, y + 6);

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLOR_DARK);

        const colA = margin + 4;
        const colB = margin + contentWidth / 2 + 2;
        const labelValue = (label, value, x, yy) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, x, yy);
            doc.setFont(undefined, 'normal');
            doc.text(String(value ?? '-'), x + 24, yy);
        };

        if (cowDetails) {
            labelValue('Kode Sapi', cowDetails.code, colA, y + 13);
            labelValue('Nama Sapi', cowDetails.name, colB, y + 13);
            labelValue('Breed', cowDetails.breed, colA, y + 19);
            labelValue('Gender', cowDetails.gender, colB, y + 19);
            labelValue('Umur', calculateAge(cowDetails.birthDate), colA, y + 25);
            labelValue('Berat', (cowDetails.weight ? cowDetails.weight + ' kg' : '-'), colB, y + 25);
        } else {
            doc.text('Data identitas sapi tidak tersedia.', colA, y + 15);
        }

        y += infoBoxHeight + 6;

        /* ---------------------------------------------------------------- *
         * KOTAK RINGKASAN STATISTIK
         * ---------------------------------------------------------------- */
        const summaryBoxHeight = 22;
        doc.setDrawColor(...COLOR_LINE);
        doc.setFillColor(250, 250, 251);
        doc.roundedRect(margin, y, contentWidth, summaryBoxHeight, 1.5, 1.5, 'FD');

        doc.setFont(undefined, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLOR_PRIMARY);
        doc.text('RINGKASAN HASIL MONITORING', margin + 4, y + 6);

        const summaryItems = [
            ['Total Data', stats.total],
            ['Suhu Rata-rata', stats.avg !== '-' ? stats.avg + ' °C' : '-'],
            ['Suhu Tertinggi', stats.max !== '-' ? stats.max + ' °C' : '-'],
            ['Suhu Terendah', stats.min !== '-' ? stats.min + ' °C' : '-'],
            ['Aktif Bergerak', stats.activeCount],
            ['Diam', stats.idleCount]
        ];
        const cellW = contentWidth / summaryItems.length;
        summaryItems.forEach((sitem, i) => {
            const cx = margin + cellW * i + cellW / 2;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...COLOR_MUTED);
            doc.text(sitem[0], cx, y + 13, { align: 'center' });
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(...COLOR_DARK);
            doc.text(String(sitem[1]), cx, y + 19, { align: 'center' });
        });

        y += summaryBoxHeight + 8;

        /* ---------------------------------------------------------------- *
         * TABEL DETAIL DATA
         * ---------------------------------------------------------------- */
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLOR_PRIMARY);
        doc.text('DETAIL DATA MONITORING', margin, y);
        y += 4;

        // Kolom identitas sapi (kode/nama/breed/gender/berat) tidak diulang di sini
        // karena sudah ditampilkan sekali di kotak "Data Identitas Sapi" di atas
        // (satu laporan = satu sapi, nilainya sama untuk semua baris).
        // Lebar kolom dijumlah persis = contentWidth agar tidak meluber ke samping.
        const colWidths = [40, 24, 30, 30, 50]; // total = 174 = contentWidth
        const headers = ['Waktu', 'Suhu', 'Kondisi', 'Aktivitas', 'Lokasi GPS'];
        const xPos = colWidths.map((w, i) => margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0));
        const rowHeight = 6.5;

        function drawTableHeader(yy) {
            doc.setFillColor(...COLOR_PRIMARY);
            doc.rect(margin, yy, contentWidth, rowHeight, 'F');
            doc.setFont(undefined, 'bold');
            doc.setFontSize(7.8);
            doc.setTextColor(255, 255, 255);
            headers.forEach((h, i) => doc.text(h, xPos[i] + 1.5, yy + rowHeight - 2));
            // garis vertikal pemisah kolom pada header
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.2);
            xPos.forEach(x => doc.line(x, yy, x, yy + rowHeight));
            return yy + rowHeight;
        }

        let tableTop = y;
        let cursorY = drawTableHeader(tableTop);
        const bottomLimit = pageHeight - 22;

        function newPage() {
            doc.addPage();
            drawLetterhead();
            cursorY = drawTableHeader(34);
        }

        filteredData.forEach((item) => {
            if (cursorY + rowHeight > bottomLimit) {
                newPage();
            }

            const t = new Date(item.timestamp);
            const time = isNaN(t.getTime()) ? '-' : t.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

            const gpsText = item.gps ? `${item.gps.latitude ?? '-'}, ${item.gps.longitude ?? '-'}` : '-';

            const rowData = [
                time,
                item.temperature ? item.temperature + '°C' : '-',
                'Normal',
                getMovementLabel(item.movement),
                gpsText
            ];

            const isEven = Math.round((cursorY - tableTop) / rowHeight) % 2 === 0;
            if (isEven) {
                doc.setFillColor(...COLOR_ROW_ALT);
                doc.rect(margin, cursorY, contentWidth, rowHeight, 'F');
            }

            doc.setFont(undefined, 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(...COLOR_DARK);
            rowData.forEach((val, i) => {
                doc.text(String(val), xPos[i] + 1.5, cursorY + rowHeight - 2, { maxWidth: colWidths[i] - 2 });
            });

            // garis horizontal & vertikal (grid tabel penuh)
            doc.setDrawColor(...COLOR_LINE);
            doc.setLineWidth(0.15);
            doc.line(margin, cursorY, margin + contentWidth, cursorY);
            xPos.forEach(x => doc.line(x, cursorY, x, cursorY + rowHeight));
            doc.line(margin + contentWidth, cursorY, margin + contentWidth, cursorY + rowHeight);

            cursorY += rowHeight;
        });
        // garis penutup bawah tabel
        doc.setDrawColor(...COLOR_LINE);
        doc.line(margin, cursorY, margin + contentWidth, cursorY);

        /* ---------------------------------------------------------------- *
         * BLOK PENUTUP & TANDA TANGAN
         * ---------------------------------------------------------------- */
        const signatureBlockHeight = 38;
        if (cursorY + signatureBlockHeight > bottomLimit) {
            newPage();
        }
        cursorY += 10;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLOR_DARK);
        doc.text(
            'Demikian laporan riwayat monitoring ini dibuat berdasarkan data yang tercatat pada sistem Smart Collar',
            margin, cursorY
        );
        doc.text('untuk digunakan sebagaimana mestinya.', margin, cursorY + 5);

        cursorY += 16;
        const signCol = pageWidth - margin - 60;
        doc.text(`Padalarang, ${formatLongDate(now.toISOString().split('T')[0])}`, signCol, cursorY);
        doc.text('Petugas Monitoring,', signCol, cursorY + 5);
        cursorY += 28;
        doc.setFont(undefined, 'bold');
        doc.text('( ......................................... )', signCol, cursorY);

        // Cetak footer + nomor halaman pada setiap halaman setelah semua konten selesai
        const totalPageCount = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPageCount; p++) {
            doc.setPage(p);
            drawFooter(p, totalPageCount);
        }

        const fileName = `laporan-riwayat-monitoring-${dateStart.value}_${dateEnd.value}.pdf`;
        doc.save(fileName);
    });

    /*
    |--------------------------------------------------------------------------
    | Event Listener Utama
    |--------------------------------------------------------------------------
    */

    loadBtn.addEventListener('click', loadHistory);

});