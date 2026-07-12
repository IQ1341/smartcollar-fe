<?php

require_once "../config/auth.php";
require_once "../services/dashboard.service.php";

requireLogin();

$summary = dashboardSummary();

require_once "../includes/header.php";
require_once "../includes/sidebar.php";

?>

<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
            <h3 class="page-title mb-1">Riwayat Monitoring</h3>
            <p class="page-subtitle mb-0">Lihat data monitoring per hari atau rentang tanggal.</p>
        </div>
        <button id="exportCsvBtn" class="btn btn-export-glow">
            <i class="fas fa-file-arrow-down me-1"></i> Export CSV
        </button>
    </div>

    <!-- ====================================================== -->
    <!-- Filter Form -->
    <!-- ====================================================== -->

    <div class="glass-card rounded-4 mb-4">
        <div class="card-body p-4">
            <div class="row g-3 align-items-end mb-3">

                <div class="col-md-4">
                    <label class="form-label">Pilih Sapi</label>
                    <select id="cowSelect" class="form-select">
                        <?php if (count($summary["cows"]) === 0): ?>
                            <option value="">Tidak ada sapi</option>
                        <?php else: ?>
                            <?php foreach ($summary["cows"] as $cow): ?>
                                <option value="<?= $cow["id"] ?>"><?= $cow["code"] ?> - <?= $cow["name"] ?></option>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label">Dari Tanggal</label>
                    <input id="dateStart" type="date" class="form-control" value="<?= date('Y-m-d') ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label">Sampai Tanggal</label>
                    <input id="dateEnd" type="date" class="form-control" value="<?= date('Y-m-d') ?>">
                </div>

                <div class="col-md-2">
                    <button id="loadHistory" class="btn btn-primary-glow w-100">
                        <i class="fas fa-magnifying-glass me-1"></i>Muat
                    </button>
                </div>

            </div>

            <!-- Quick date presets -->
            <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-preset" data-range="today">Hari Ini</button>
                <button type="button" class="btn btn-preset" data-range="7">7 Hari</button>
                <button type="button" class="btn btn-preset" data-range="30">30 Hari</button>
            </div>
        </div>
    </div>

    <!-- ====================================================== -->
    <!-- Summary Cards -->
    <!-- ====================================================== -->

    <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
            <div class="summary-mini-card d-flex justify-content-between align-items-center">
                <div>
                    <div class="summary-mini-label">Rata-rata Suhu</div>
                    <div class="summary-mini-value" id="avgTemp">-</div>
                </div>
                <i class="fas fa-temperature-half summary-mini-icon"></i>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="summary-mini-card d-flex justify-content-between align-items-center">
                <div>
                    <div class="summary-mini-label">Suhu Tertinggi</div>
                    <div class="summary-mini-value" id="maxTemp">-</div>
                </div>
                <i class="fas fa-arrow-trend-up summary-mini-icon"></i>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="summary-mini-card d-flex justify-content-between align-items-center">
                <div>
                    <div class="summary-mini-label">Suhu Terendah</div>
                    <div class="summary-mini-value" id="minTemp">-</div>
                </div>
                <i class="fas fa-arrow-trend-down summary-mini-icon"></i>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="summary-mini-card d-flex justify-content-between align-items-center">
                <div>
                    <div class="summary-mini-label">Total Data</div>
                    <div class="summary-mini-value" id="totalRecords">-</div>
                </div>
                <i class="fas fa-database summary-mini-icon"></i>
            </div>
        </div>
    </div>

    <!-- ====================================================== -->
    <!-- Chart Suhu -->
    <!-- ====================================================== -->

    <div class="chart-container-glass mb-4">
        <h6 class="text-uppercase opacity-75 fw-bold mb-3" style="font-size:0.8rem; letter-spacing:0.5px;">
            Tren Suhu
        </h6>
        <canvas id="tempChart" height="80"></canvas>
    </div>

    <!-- ====================================================== -->
    <!-- History Table -->
    <!-- ====================================================== -->

    <div class="table-glass-card">
        <div class="card-body p-4">

            <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div class="search-wrapper" style="max-width: 280px; width: 100%;">
                    <i class="fas fa-magnifying-glass"></i>
                    <input type="text" id="searchInput" class="form-control search-box-glass" placeholder="Cari data...">
                </div>
                <small class="text-muted" id="paginationInfo"></small>
            </div>

            <div class="table-responsive">
                <table class="table table-dark-glass align-middle" id="historyTable">
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Suhu</th>
                            <th>Signal</th>
                            <th>Movement</th>
                            <th>Koordinat</th>
                        </tr>
                    </thead>
                    <tbody id="historyBody">
                        <tr>
                            <td colspan="5" class="text-center text-muted py-4">
                                Pilih sapi dan tanggal lalu klik Muat
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <nav class="mt-3">
                <ul class="pagination pagination-glass justify-content-center mb-0" id="paginationControls">
                    <!-- Filled by JS -->
                </ul>
            </nav>

        </div>
    </div>

</div>

<script>
const BASE_URL_HISTORY = "/ajax/history.php";
</script>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="../assets/js/history.js"></script>

<?php

require_once "../includes/footer.php";

?>