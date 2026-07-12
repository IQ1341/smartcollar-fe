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
            <!-- CARD LOKASI REALTIME -->
            <!-- ========================= -->
            <div class="row g-3 g-md-4 mb-4">

                <div class="col-12 col-sm-6 col-md-4">
                    <div class="stat-card bg-gradient-koordinat">
                        <div class="card-body p-3 p-md-4">
                            <h6 class="text-uppercase opacity-75 fw-bold ls-1">Koordinat GPS</h6>
                            <div class="mt-2">
                                <div class="d-flex justify-content-between">
                                    <small class="opacity-75">Lat</small>
                                    <span class="value-text-sm" id="latitude">-</span>
                                </div>
                                <div class="d-flex justify-content-between mt-1">
                                    <small class="opacity-75">Long</small>
                                    <span class="value-text-sm" id="longitude">-</span>
                                </div>
                            </div>
                            <i class="fas fa-location-dot stat-icon-bg"></i>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                    <div class="stat-card bg-gradient-suhu">
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
                    <div class="stat-card bg-gradient-aktivitas">
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
            <!-- MAP (EMBED) -->
            <!-- ========================= -->
            <div class="row">
                <div class="col-12">
                    <div class="card border-0 rounded-4 glass-card mb-4">
                        <div class="card-header bg-transparent border-bottom-0 pt-4 px-3 px-md-4 pb-0 d-flex flex-wrap gap-1 justify-content-between align-items-center">
                            <h5 class="mb-0 fw-bold form-label">Lokasi Smart Collar</h5>
                            <small class="text-muted">Update saat ada data baru</small>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div id="map" class="map-wrapper">
                                <div class="d-flex justify-content-center align-items-center h-100" style="background:#eee;">
                                    <div class="text-center">
                                        <div class="spinner-border text-primary mb-2" role="status"></div>
                                        <p class="text-muted mb-0">Menghubungkan ke Satelit GPS...</p>
                                    </div>
                                </div>
                            </div>

                            <a id="maps" href="#" target="_blank" class="btn btn-primary rounded-pill px-4 mt-3">
                                <i class="fas fa-map-location-dot me-2"></i>Lihat di Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <style>

.map-wrapper {
    height: 400px;
    border-radius: 1rem;
    overflow: hidden;
}

.map-wrapper iframe {
    width: 100%;
    height: 100%;
    border: 0;
}

@media (max-width: 767.98px) {
    .map-wrapper {
        height: 280px;
    }
}

@media (max-width: 575.98px) {
    .map-wrapper {
        height: 220px;
    }

    .stat-card .value-text,
    .stat-card .value-text-sm {
        font-size: 1.4rem;
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

<script src="../assets/js/lokasi.js"></script>

<?php

require_once "../includes/footer.php";

?>