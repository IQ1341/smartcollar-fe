<?php

require_once "../config/auth.php";
require_once "../services/cow.service.php";
require_once "../services/collar.service.php";
require_once "../services/assignment.service.php";

requireLogin();

$cows = getAllCow();
$collars = getAllCollar();

require_once "../includes/header.php";
require_once "../includes/sidebar.php";

?>

<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>
            <h3 class="page-title mb-1">Assignment Management</h3>
            <p class="page-subtitle mb-0">Assign cows to collars.</p>
        </div>

    </div>

    <!-- ====================================================== -->
    <!-- Assign Form -->
    <!-- ====================================================== -->

    <div class="glass-card rounded-4 mb-4">
        <div class="card-body p-4">
            <form id="assignForm" class="row g-3 align-items-end">

                <div class="col-md-5">
                    <label class="form-label">Cow</label>
                    <select name="cowId" class="form-select">
                        <option value="">-- Select Cow --</option>
                        <?php foreach ($cows as $cow): ?>
                            <option value="<?= $cow['id'] ?>"><?= htmlspecialchars($cow['code'] . ' - ' . $cow['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="col-md-5">
                    <label class="form-label">Collar</label>
                    <select name="collarId" class="form-select">
                        <option value="">-- Select Collar --</option>
                        <?php foreach ($collars as $collar): ?>
                            <option value="<?= $collar['id'] ?>"><?= htmlspecialchars($collar['serialNumber'] . ' - ' . $collar['deviceName']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="col-md-2">
                    <button type="submit" class="btn btn-primary-glow w-100">
                        <i class="fas fa-link me-1"></i>Assign
                    </button>
                </div>

            </form>
        </div>
    </div>

    <!-- ====================================================== -->
    <!-- Assignment Table -->
    <!-- ====================================================== -->

    <div class="table-glass-card">
        <div class="card-body p-4">
            <div class="table-responsive">
                <table class="table table-dark-glass align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cow</th>
                            <th>Device</th>
                            <th>Status</th>
                            <th>Assigned At</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="assignmentTableBody">
                        <!-- Filled by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>

<?php

$pageScript = "assignment.js";

require_once "../includes/footer.php";

?>