<?php

require_once "../config/auth.php";
require_once "../services/dashboard.service.php";

requireLogin();

$summary = dashboardSummary();

require_once "../includes/header.php";
require_once "../includes/sidebar.php";

?>

        <!-- Main Content -->
        <div class="container">
            <div class="row mb-4">

            


            <!-- ========================= -->
            <!-- PILIH SAPI -->
            <!-- ========================= -->
            <div class="row mb-4">
                <div class="col-12 col-md-5">
                    <label class="form-label">Pilih Sapi</label>
                    <select id="cowSelect" class="form-select">
                        <?php foreach ($summary["cows"] as $cow): ?>
                            <option value="<?= $cow["id"] ?>"><?= $cow["code"] ?> - <?= $cow["name"] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <!-- ========================= -->
            <!-- CARD SUHU REALTIME -->
            <!-- ========================= -->
            <div class="row g-3 g-md-4 mb-4">

                <div class="col-12 col-sm-6 col-md-4">
                    <div class="stat-card bg-gradient-suhu">
                        <div class="card-body p-3 p-md-4">
                            <h6 class="text-uppercase opacity-75 fw-bold ls-1">Suhu Tubuh</h6>
                            <div class="d-flex align-items-center mt-2">
                                <span class="value-text" id="val-suhu">-</span>
                                <span class="ms-1 opacity-75">&deg;C</span>
                            </div>
                            <div class="mt-2">
                                <span class="badge bg-light text-dark px-3 py-1 rounded-pill" id="val-kondisi">-</span>
                            </div>
                            <i class="fas fa-temperature-half stat-icon-bg"></i>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <div class="stat-card bg-gradient-aktivitas">
                        <div class="card-body p-3 p-md-4">
                            <h6 class="text-uppercase opacity-75 fw-bold ls-1">Status Collar</h6>
                            <div class="d-flex align-items-center mt-2">
                                <span class="value-text" id="status">-</span>
                            </div>
                            <i class="fas fa-wifi stat-icon-bg"></i>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <div class="stat-card bg-gradient-koordinat">
                        <div class="card-body p-3 p-md-4">
                            <h6 class="text-uppercase opacity-75 fw-bold ls-1">Update Terakhir</h6>
                            <div class="mt-2">
                                <span class="value-text-sm" id="lastUpdate">-</span>
                            </div>
                            <i class="fas fa-clock stat-icon-bg"></i>
                        </div>
                    </div>
                </div>

            </div>

            <!-- ========================= -->
            <!-- CHART SUHU REALTIME -->
            <!-- ========================= -->
            <div class="row">
                <div class="col-12">
                    <div class="card border-0 rounded-4 glass-card">
                        <div class="card-header bg-transparent border-bottom-0 pt-4 px-3 px-md-4 pb-0 d-flex flex-wrap gap-1 justify-content-between align-items-center">
                            <h5 class="mb-0 fw-bold form-label">Grafik Suhu Real-time</h5>
                            <small class="text-muted">1 titik / 2 detik &middot; ±1 menit terakhir</small>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="chart-wrapper">
                                <canvas id="tempChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <style>

.chart-wrapper {
    position: relative;
    height: 320px;
}

@media (max-width: 767.98px) {
    .chart-wrapper {
        height: 240px;
    }
}

@media (max-width: 575.98px) {
    .chart-wrapper {
        height: 200px;
    }

    .stat-card .value-text {
        font-size: 1.6rem;
    }

    .stat-card .stat-icon-bg {
        font-size: 2.2rem;
    }
}

</style>

        <script>

const BASE_URL =
"/ajax/dashboard.php";

</script>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<script src="../assets/js/suhu.js"></script>

<?php

require_once "../includes/footer.php";

?>