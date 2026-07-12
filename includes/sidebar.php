<?php
    $currentPage = basename($_SERVER["PHP_SELF"] ?? "");
    function sidebarActive($page, $currentPage) {
        return $currentPage === $page ? 'active' : '';
    }
?>

<div id="wrapper">

    <!-- ====================================================== -->
    <!-- Sidebar -->
    <!-- ====================================================== -->
    <nav id="sidebar">
        <div class="sidebar-header">
            <a href="#" class="sidebar-brand">
                <i class="fas fa-paw me-2"></i> SMART COLLAR
            </a>
        </div>

        <div class="user-profile">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
       
        </div>

        <ul class="components">

            <li>
                <a href="/pages/dashboard.php" class="<?= sidebarActive('dashboard.php', $currentPage) ?>">
                    <i class="fa fa-dashboard"></i> Dashboard
                </a>
            </li>

            <div class="sidebar-label">Sistem</div>
            <li>
                <a href="/pages/cows.php" class="<?= sidebarActive('cows.php', $currentPage) ?>">
                    <i class="fa fa-cow"></i> Cows
                </a>
            </li>
            <li>
                <a href="/pages/collars.php" class="<?= sidebarActive('collars.php', $currentPage) ?>">
                    <i class="fa fa-gear"></i> Smart Collar
                </a>
            </li>
            <li>
                <a href="/pages/assignment.php" class="<?= sidebarActive('assignment.php', $currentPage) ?>">
                    <i class="fa fa-link"></i> Assignment
                </a>
            </li>

            <div class="sidebar-label">Monitoring</div>
            <li>
                <a href="/pages/suhu.php" class="<?= sidebarActive('suhu.php', $currentPage) ?>">
                    <i class="fa fa-temperature-high"></i> Suhu 
                </a>
            </li>
            <li>
                <a href="/pages/aktivitas.php" class="<?= sidebarActive('aktivitas.php', $currentPage) ?>">
                    <i class="fa fa-people-arrows"></i> Aktivitas 
                </a>
            </li>
            <li>
                <a href="/pages/lokasi.php" class="<?= sidebarActive('lokasi.php', $currentPage) ?>">
                    <i class="fa fa-location-arrow"></i> GPS 
                </a>
            </li>

            <div class="sidebar-label">Data</div>
            <li>
                <a href="/pages/history.php" class="<?= sidebarActive('history.php', $currentPage) ?>">
                    <i class="fa fa-history"></i> History
                </a>
            </li>
            <li>
                <a href="/logout.php" class="text-danger">
                    <i class="fa fa-sign-out-alt"></i> Logout
                </a>
            </li>

        </ul>
    </nav>

    <!-- Overlay gelap untuk mobile (klik untuk menutup sidebar) -->
    <div id="sidebarOverlay"></div>

    <!-- ====================================================== -->
    <!-- Page Content -->
    <!-- ====================================================== -->
    <div id="content">

        <!-- Top Navbar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-transparent mb-4">
            <div class="container-fluid p-0">

                <?php if ($currentPage !== 'dashboard.php'): ?>
                    <button type="button" id="sidebarCollapse" class="navbar-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                <?php endif; ?>

            </div>
        </nav>