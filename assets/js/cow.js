document.addEventListener("DOMContentLoaded", () => {

    /*
    |--------------------------------------------------------------------------
    | Bootstrap Check
    |--------------------------------------------------------------------------
    */

    if (typeof bootstrap === "undefined") {
        console.error("Bootstrap JS belum dimuat.");
        return;
    }

    /*
    |--------------------------------------------------------------------------
    | Toast Notification (pengganti alert())
    |--------------------------------------------------------------------------
    */

    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast-glass ${type}`;
        const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 350);
        }, 2500);
    }

    /*
    |--------------------------------------------------------------------------
    | Modal
    |--------------------------------------------------------------------------
    */

    const createCowModalElement = document.getElementById("createCowModal");
    const editCowModalElement = document.getElementById("editCowModal");
    const deleteCowModalElement = document.getElementById("deleteCowModal");

    const createModal = createCowModalElement ? new bootstrap.Modal(createCowModalElement) : null;
    const editModal = editCowModalElement ? new bootstrap.Modal(editCowModalElement) : null;
    const deleteModal = deleteCowModalElement ? new bootstrap.Modal(deleteCowModalElement) : null;

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    const createForm = document.getElementById("createCowForm");

    if (createForm) {
        createForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append("action", "create");

            const response = await fetch("../ajax/cow.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showToast("Cow berhasil ditambahkan.", "success");
                createModal.hide();
                setTimeout(() => location.reload(), 800);
            } else {
                showToast(result.message || "Gagal menambahkan cow.", "error");
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT BUTTON
    |--------------------------------------------------------------------------
    */

    document.querySelectorAll(".editBtn").forEach(button => {
        button.addEventListener("click", async function () {
            const id = this.dataset.id;

            const form = new FormData();
            form.append("action", "get");
            form.append("id", id);

            const response = await fetch("../ajax/cow.php", {
                method: "POST",
                body: form
            });

            const result = await response.json();

            if (!result.success) {
                showToast(result.message || "Gagal memuat data cow.", "error");
                return;
            }

            const cow = result.data;

            document.querySelector("#editCowForm input[name=id]").value = cow.id;

            document.getElementById("editBody").innerHTML = `

<div class="mb-3">
    <label class="form-label">Code</label>
    <input class="form-control" name="code" value="${cow.code}" required>
</div>

<div class="mb-3">
    <label class="form-label">Name</label>
    <input class="form-control" name="name" value="${cow.name}" required>
</div>

<div class="mb-3">
    <label class="form-label">Breed</label>
    <input class="form-control" name="breed" value="${cow.breed ?? ""}">
</div>

<div class="mb-3">
    <label class="form-label">Gender</label>
    <select class="form-select" name="gender">
        <option value="male" ${cow.gender == "male" ? "selected" : ""}>Male</option>
        <option value="female" ${cow.gender == "female" ? "selected" : ""}>Female</option>
    </select>
</div>

<div class="mb-3">
    <label class="form-label">Weight</label>
    <input type="number" class="form-control" name="weight" value="${cow.weight ?? 0}">
</div>

<div class="mb-3">
    <label class="form-label">Birth Date</label>
    <input type="date" class="form-control" name="birthDate" value="${cow.birthDate ?? ""}">
</div>

<div class="mb-3">
    <label class="form-label">Color</label>
    <input type="text" class="form-control" name="color" value="${cow.color ?? ""}">
</div>

<div class="mb-3">
    <label class="form-label">Status</label>
    <select class="form-select" name="status">
        <option value="healthy" ${cow.status == "healthy" ? "selected" : ""}>Healthy</option>
        <option value="sick" ${cow.status == "sick" ? "selected" : ""}>Sick</option>
        <option value="pregnant" ${cow.status == "pregnant" ? "selected" : ""}>Pregnant</option>
    </select>
</div>

<div class="mb-3">
    <label class="form-label">Description</label>
    <textarea class="form-control" name="description">${cow.note ?? ""}</textarea>
</div>

`;

            editModal.show();
        });
    });

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    const editForm = document.getElementById("editCowForm");

    if (editForm) {
        editForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append("action", "update");

            const response = await fetch("../ajax/cow.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showToast("Cow berhasil diupdate.", "success");
                editModal.hide();
                setTimeout(() => location.reload(), 800);
            } else {
                showToast(result.message || "Gagal update cow.", "error");
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE BUTTON (buka modal konfirmasi, TIDAK langsung hapus)
    |--------------------------------------------------------------------------
    */

    document.querySelectorAll(".deleteBtn").forEach(button => {
        button.addEventListener("click", function () {
            const id = this.dataset.id;
            document.querySelector("#deleteCowForm input[name=id]").value = id;
            deleteModal.show();
        });
    });

    /*
    |--------------------------------------------------------------------------
    | DELETE (dieksekusi setelah user konfirmasi di modal)
    |--------------------------------------------------------------------------
    */

    const deleteForm = document.getElementById("deleteCowForm");

    if (deleteForm) {
        deleteForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append("action", "delete");

            const response = await fetch("../ajax/cow.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showToast("Cow berhasil dihapus.", "success");
                deleteModal.hide();
                setTimeout(() => location.reload(), 800);
            } else {
                showToast(result.message || "Gagal menghapus cow.", "error");
            }
        });
    }

});