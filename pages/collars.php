<?php

require_once "../config/auth.php";
require_once "../services/collar.service.php";

requireLogin();

$collars = getAllCollar();

require_once "../includes/header.php";
require_once "../includes/sidebar.php";

?>

<div class="container-fluid">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>
            <h3 class="page-title mb-1">Smart Collar Management</h3>
            <p class="page-subtitle mb-0">Manage all registered smart collars.</p>
        </div>

        <button class="btn btn-primary-glow" data-bs-toggle="modal" data-bs-target="#createCollarModal">
            <i class="fas fa-plus me-1"></i> Add Collar
        </button>

    </div>

    <div class="table-glass-card">

        <div class="card-body p-4">

            <div class="table-responsive">

                <table class="table table-dark-glass align-middle">

                    <thead>
                        <tr>
                            <th>Serial</th>
                            <th>Device Name</th>
                            <th>Device Secret</th>
                            <th>SIM</th>
                            <th width="150">Action</th>
                        </tr>
                    </thead>

                    <tbody id="collarTable">

                        <?php if (count($collars) == 0): ?>
                            <tr>
                                <td colspan="5" class="text-center text-muted py-4">No Data</td>
                            </tr>
                        <?php endif; ?>

                        <?php foreach ($collars as $collar): ?>
                            <tr>
                                <td><?= htmlspecialchars($collar["serialNumber"]) ?></td>
                                <td><?= htmlspecialchars($collar["deviceName"]) ?></td>

                                <td>
                                    <?php if (!empty($collar["deviceSecret"])): ?>
                                        <div class="input-group input-group-sm">
                                            <input type="password" class="form-control secret-input" value="<?= htmlspecialchars($collar["deviceSecret"]) ?>" readonly>
                                            <button type="button" class="btn btn-secret-action toggle-secret-btn">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button type="button" class="btn btn-secret-action copy-secret-btn">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    <?php else: ?>
                                        <span class="text-muted">-</span>
                                    <?php endif; ?>
                                </td>

                                <td><?= htmlspecialchars($collar["simNumber"] ?? "") ?></td>

                                <td>
                                    <button class="btn btn-sm btn-edit-glow editCollarBtn" data-id="<?= $collar["id"] ?>">
                                        <i class="fas fa-pen me-1"></i>Edit
                                    </button>
                                    <button class="btn btn-sm btn-delete-glow deleteCollarBtn" data-id="<?= $collar["id"] ?>" data-bs-toggle="modal" data-bs-target="#deleteCollarModal">
                                        <i class="fas fa-trash me-1"></i>Delete
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<!-- CREATE MODAL -->
<div class="modal fade" id="createCollarModal">
    <div class="modal-dialog">
        <form id="createCollarForm" class="modal-content modal-content-glass">

            <div class="modal-header">
                <h5>Add Collar</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="mb-3">
                    <label>Serial Number</label>
                    <input name="serialNumber" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Device Name</label>
                    <input name="deviceName" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Hardware Version</label>
                    <input name="hardwareVersion" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Firmware Version</label>
                    <input name="firmwareVersion" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>MAC Address</label>
                    <input name="macAddress" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>SIM Number</label>
                    <input name="simNumber" class="form-control">
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                <button class="btn btn-primary-glow">Save</button>
            </div>

        </form>
    </div>
</div>

<!-- EDIT MODAL -->
<div class="modal fade" id="editCollarModal">
    <div class="modal-dialog">
        <form id="editCollarForm" class="modal-content modal-content-glass">

            <input type="hidden" name="id">

            <div class="modal-header">
                <h5>Edit Collar</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="mb-3">
                    <label>Serial Number</label>
                    <input name="serialNumber" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Device Name</label>
                    <input name="deviceName" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Hardware Version</label>
                    <input name="hardwareVersion" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Firmware Version</label>
                    <input name="firmwareVersion" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>MAC Address</label>
                    <input name="macAddress" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>SIM Number</label>
                    <input name="simNumber" class="form-control">
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-primary-glow">Update</button>
            </div>

        </form>
    </div>
</div>

<!-- DELETE MODAL -->
<div class="modal fade" id="deleteCollarModal">
    <div class="modal-dialog">
        <form id="deleteCollarForm" class="modal-content modal-content-glass">

            <input type="hidden" name="id">

            <div class="modal-header">
                <h5>Delete Collar</h5>
            </div>

            <div class="modal-body">
                Are you sure want to delete this collar?
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-delete-glow">Delete</button>
            </div>

        </form>
    </div>
</div>

<?php

$pageScript = "collar.js";

require_once "../includes/footer.php";

?>