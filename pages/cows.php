<?php

require_once "../config/auth.php";
require_once "../services/cow.service.php";

requireLogin();

$cows = getAllCow();

require_once "../includes/header.php";
require_once "../includes/sidebar.php";

?>

<div class="container-fluid">

    <!-- ====================================================== -->
    <!-- Page Title -->
    <!-- ====================================================== -->

    <div class="d-flex justify-content-between align-items-center mb-4">

        <div>
            <h3 class="page-title mb-1">Cow Management</h3>
            <p class="page-subtitle mb-0">Manage all registered cows.</p>
        </div>

        <button
            class="btn btn-primary-glow"
            data-bs-toggle="modal"
            data-bs-target="#createCowModal">
            <i class="fas fa-plus me-1"></i> Add Cow
        </button>

    </div>

    <!-- ====================================================== -->
    <!-- Table -->
    <!-- ====================================================== -->

    <div class="table-glass-card">

        <div class="card-body p-4">

            <div class="table-responsive">

                <table class="table table-dark-glass align-middle">

                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Breed</th>
                            <th>Gender</th>
                            <th>Age</th>
                            <th>Weight</th>
                            <th>Color</th>
                            <th>Status</th>
                            <th width="150">Action</th>
                        </tr>
                    </thead>

                    <tbody id="cowTable">

                        <?php if (count($cows) == 0): ?>
                            <tr>
                                <td colspan="6" class="text-center text-muted py-4">
                                    No Data
                                </td>
                            </tr>
                        <?php endif; ?>

                        <?php foreach ($cows as $cow): ?>
                            <tr>
                                <td><?= htmlspecialchars($cow["code"]) ?></td>
                                <td><?= htmlspecialchars($cow["name"]) ?></td>
                                <td><?= htmlspecialchars($cow["breed"]) ?></td>
                                <td>
                                    <span class="badge-gender-<?= htmlspecialchars($cow["gender"]) ?>">
                                        <i class="fas fa-<?= $cow["gender"] == "male" ? "mars" : "venus" ?> me-1"></i>
                                        <?= ucfirst(htmlspecialchars($cow["gender"])) ?>
                                    </span>
                                </td>
                                <td>
                                    <?php
                                    $birthDate = $cow["birthDate"] ?? null;
                                    if ($birthDate) {
                                        $today = new DateTime();
                                        $birth = new DateTime($birthDate);
                                        $age = $today->diff($birth)->y;
                                        echo "<span class=\"badge-age\">$age tahun</span>";
                                    } else {
                                        echo "<span class=\"badge-age\">-</span>";
                                    }
                                    ?>
                                </td>
                                <td>
                                    <span class="badge-weight"><?= htmlspecialchars($cow["weight"]) ?> kg</span>
                                </td>
                                <td>
                                    <span class="badge-color"><?= htmlspecialchars($cow["color"] ?? "N/A") ?></span>
                                </td>
                                <td>
                                    <span class="badge-status-<?= htmlspecialchars($cow["status"]) ?>">
                                        <?= ucfirst(htmlspecialchars($cow["status"])) ?>
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-edit-glow editBtn" data-id="<?= $cow["id"] ?>">
                                        <i class="fas fa-pen me-1"></i>Edit
                                    </button>
                                    <button class="btn btn-sm btn-delete-glow deleteBtn" data-id="<?= $cow["id"] ?>">
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

<!-- ====================================================== -->
<!-- CREATE MODAL -->
<!-- ====================================================== -->

<div class="modal fade" id="createCowModal">
    <div class="modal-dialog">
        <form id="createCowForm" class="modal-content modal-content-glass">

            <div class="modal-header">
                <h5>Add Cow</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

                <div class="mb-3">
                    <label>Code</label>
                    <input name="code" class="form-control" required>
                </div>

                <div class="mb-3">
                    <label>Name</label>
                    <input name="name" class="form-control" required>
                </div>

                <div class="mb-3">
                    <label>Breed</label>
                    <input name="breed" class="form-control">
                </div>

                <div class="mb-3">
                    <label>Gender</label>
                    <select name="gender" class="form-select">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label>Weight</label>
                    <input type="number" name="weight" class="form-control">
                </div>

                <div class="mb-3">
                    <label>Birth Date</label>
                    <input type="date" name="birthDate" class="form-control">
                </div>

                <div>
                    <label>Description</label>
                    <textarea name="description" class="form-control"></textarea>
                </div>

                <!-- Hidden fields to satisfy backend schema -->
                <input type="hidden" name="status" value="healthy">
                <input type="hidden" name="color" value="">
                <input type="hidden" name="photoUrl" value="">

            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                <button class="btn btn-primary-glow">Save</button>
            </div>

        </form>
    </div>
</div>

<!-- ====================================================== -->
<!-- EDIT MODAL -->
<!-- ====================================================== -->

<div class="modal fade" id="editCowModal">
    <div class="modal-dialog">
        <form id="editCowForm" class="modal-content modal-content-glass">

            <input type="hidden" name="id">

            <div class="modal-header">
                <h5>Edit Cow</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body" id="editBody">
                <!-- Filled by JS -->
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-primary-glow">Update</button>
            </div>

        </form>
    </div>
</div>

<!-- ====================================================== -->
<!-- DELETE MODAL -->
<!-- ====================================================== -->

<div class="modal fade" id="deleteCowModal">
    <div class="modal-dialog">
        <form id="deleteCowForm" class="modal-content modal-content-glass">

            <input type="hidden" name="id">

            <div class="modal-header">
                <h5>Delete Cow</h5>
            </div>

            <div class="modal-body">
                Are you sure want to delete this cow?
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-delete-glow">Delete</button>
            </div>

        </form>
    </div>
</div>

<?php

$pageScript = "cow.js";

require_once "../includes/footer.php";

?>