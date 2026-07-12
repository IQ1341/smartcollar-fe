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
                <div class="col-12">
                    <h3 class="fw-bold text-white">Dashboard Smart Collar</h3>
                    <p class="text-muted">
    Pantau kondisi kesehatan dan lokasi hewan ternak secara real-time.
</p>
                </div>
            </div>

            <!-- Kartu Data -->
            <div class="row g-4 mb-5 flex-nowrap">
    <!-- Suhu -->
    <a href="suhu.php" class="col feature-section text-decoration-none" id="section-suhu">
        <div class="stat-card bg-gradient-suhu">
            <div class="card-body p-4">
                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Total Sapi</h6>
                <div class="d-flex align-items-center mt-2">
                    <span class="value-text" id="totalCows"><?= $summary["cow"] ?></span>
                </div>
                <i class="fas fa-cow stat-icon-bg"></i>
            </div>
        </div>
    </a>

    <a href="suhu.php" class="col feature-section text-decoration-none" id="section-suhu">
        <div class="stat-card bg-gradient-aktivitas">
            <div class="card-body p-4">
                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Total Collar</h6>
                <div class="d-flex align-items-center mt-2">
                    <span class="value-text" id="totalCollars"><?= $summary["collar"] ?></span>
                </div>
                <i class="fas fa-satellite stat-icon-bg"></i>
            </div>
        </div>
    </a>

    <!-- Aktivitas -->
    <a href="aktivitas.php" class="col feature-section text-decoration-none" id="section-aktivitas">
        <div class="stat-card bg-gradient-suhu">
            <div class="card-body p-4">
                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Assignment</h6>
                <div class="mt-2">
                    <span class="value-text" id="totalAssignment"><?= $summary["assignment"] ?></span>
                </div>
                <i class="fas fa-clipboard-list stat-icon-bg"></i>
            </div>
        </div>
    </a>

    <a href="aktivitas.php" class="col feature-section text-decoration-none" id="section-aktivitas">
        <div class="stat-card bg-gradient-aktivitas">
            <div class="card-body p-4">
                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Online</h6>
                <div class="mt-2">
                    <span class="value-text" id="totalOnline"><?= $summary["online"] ?></span>
                </div>
                <i class="fas fa-wifi stat-icon-bg"></i>
            </div>
        </div>
    </a>

    <a href="lokasi.php" class="col feature-section text-decoration-none" id="section-lokasi">
        <div class="stat-card bg-gradient-suhu">
            <div class="card-body p-4">
                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Offline</h6>
                <div class="mt-2">
                    <span class="value-text" id="totalOffline"><?= $summary["offline"] ?></span>
                </div>
                <i class="fas fa-plug-circle-xmark stat-icon-bg"></i>
            </div>
        </div>
    </a>
</div>

                <!-- Lokasi -->
<div class="row">
    <div class="col-12">
        <div class="card border-0 rounded-4 glass-card">
            <div class="card-header bg-transparent border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold form-label">Monitoring Realtime Smart Collar</h5>
            </div>
            <div class="card-body p-4">

                <!-- ========================= -->
                <!-- PILIH SAPI -->
                <!-- ========================= -->
                <div class="row mb-4">
    <div class="col-md-5">
        <label class="form-label">Pilih Sapi</label>
        <select id="cowSelect" class="form-select">
            <?php foreach ($summary["cows"] as $cow): ?>
                <option value="<?= $cow["id"] ?>"><?= $cow["code"] ?> - <?= $cow["name"] ?></option>
            <?php endforeach; ?>
        </select>
    </div>
</div>

                <!-- ========================= -->
                <!-- SUHU, AKTIVITAS, GPS -->
                <!-- ========================= -->
                <div class="row g-4 mb-4">

                    <div class="col-md-4">
                        <div class="stat-card bg-gradient-suhu">
                            <div class="card-body p-4">
                                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Temperature</h6>
                                <div class="d-flex align-items-center mt-2">
                                    <span class="value-text" id="val-suhu">-</span>
                                </div>
                                <div class="d-flex align-items-center mt-2">
                                    <span class="value-text" id="val-kondisi">-</span>
                                </div>
                                <i class="fas fa-temperature-half stat-icon-bg"></i>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="stat-card bg-gradient-aktivitas">
                            <div class="card-body p-4">
                                <h6 class="text-uppercase opacity-75 fw-bold ls-1">Aktivitas</h6>
                                <div class="d-flex align-items-center mt-2">
                                    <span class="value-text" id="val-aktivitas">-</span>
                                </div>
                                <i class="fas fa-person-walking stat-icon-bg"></i>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="stat-card bg-gradient-koordinat">
                            <div class="card-body p-4">
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

                </div>

                <!-- ========================= -->
                <!-- UPDATE -->
                <!-- ========================= -->

                <!-- ========================= -->
                <!-- MAP -->
                <!-- ========================= -->
                <div class="card border-0 rounded-4 glass-card mb-4">
                    <div class="card-header bg-transparent border-bottom-0 pt-3 px-4 fw-bold">
                        Lokasi Smart Collar
                    </div>
                    <div class="card-body p-4">
                        <div id="map" style="height:400px; border-radius:1rem; overflow:hidden;"></div>
                    </div>
                </div>

                <!-- ========================= -->
                <!-- GOOGLE MAP LINK -->
                <!-- ========================= -->
                <a id="maps" href="#" target="_blank" class="btn btn-primary rounded-pill px-4">
                    <i class="fas fa-map-location-dot me-2"></i>Lihat di Google Maps
                </a>

            </div>
        </div>
    </div>
</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>

const BASE_URL =
"/ajax/dashboard.php";

</script>

<script
src="../assets/js/dashboard.js">

</script>

<?php

require_once "../includes/footer.php";

?>