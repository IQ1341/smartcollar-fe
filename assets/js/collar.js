document.addEventListener("DOMContentLoaded", () => {

    if (typeof bootstrap === "undefined") {
        console.error("Bootstrap JS belum dimuat.");
        return;
    }

    const createModalEl = document.getElementById("createCollarModal");
    const editModalEl = document.getElementById("editCollarModal");
    const deleteModalEl = document.getElementById("deleteCollarModal");

    const createModal = createModalEl ? new bootstrap.Modal(createModalEl) : null;
    const editModal = editModalEl ? new bootstrap.Modal(editModalEl) : null;
    const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;

    /* CREATE */
    const createForm = document.getElementById("createCollarForm");
    if (createForm) {
        createForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {};
            formData.forEach((v, k) => data[k] = v);

            const form = new FormData();
            for (const k in data) form.append(k, data[k]);
            form.append("action", "create");

            const response = await fetch("../ajax/collar.php", { method: "POST", body: form });
            const result = await response.json();

            if (result.success) {
                alert("Collar berhasil ditambahkan.");
                createModal.hide();
                location.reload();
            } else {
                alert(result.message);
            }
        });
    }

    /* EDIT BUTTON */
    document.querySelectorAll('.editCollarBtn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.dataset.id;
            const form = new FormData();
            form.append('action', 'get');
            form.append('id', id);

            const response = await fetch('../ajax/collar.php', { method: 'POST', body: form });
            const result = await response.json();

            if (!result.success) { alert(result.message); return; }

            const collar = result.data;
            document.querySelector('#editCollarForm input[name=id]').value = collar.id;
            document.querySelector('#editCollarForm input[name=serialNumber]').value = collar.serialNumber ?? '';
            document.querySelector('#editCollarForm input[name=deviceName]').value = collar.deviceName ?? '';
            document.querySelector('#editCollarForm input[name=hardwareVersion]').value = collar.hardwareVersion ?? '';
            document.querySelector('#editCollarForm input[name=firmwareVersion]').value = collar.firmwareVersion ?? '';
            document.querySelector('#editCollarForm input[name=macAddress]').value = collar.macAddress ?? '';
            document.querySelector('#editCollarForm input[name=simNumber]').value = collar.simNumber ?? '';

            editModal.show();
        });
    });

    /* UPDATE */
    const editForm = document.getElementById('editCollarForm');
    if (editForm) {
        editForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = {};
            formData.forEach((v,k)=> data[k]=v);

            const form = new FormData();
            for (const k in data) form.append(k, data[k]);
            form.append('action','update');

            const response = await fetch('../ajax/collar.php', { method: 'POST', body: form });
            const result = await response.json();

            if (result.success) {
                alert('Collar berhasil diupdate.');
                editModal.hide();
                location.reload();
            } else { alert(result.message); }
        });
    }

    /* SECRET ACTIONS */
    document.querySelectorAll('.toggle-secret-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const group = this.closest('.input-group');
            const input = group.querySelector('.secret-input');
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.textContent = isPassword ? 'Hide' : 'Show';
        });
    });

    document.querySelectorAll('.copy-secret-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const group = this.closest('.input-group');
            const input = group.querySelector('.secret-input');
            if (!input) return;
            try {
                await navigator.clipboard.writeText(input.value);
                alert('Device secret copied to clipboard.');
            } catch (error) {
                console.error(error);
                alert('Unable to copy device secret.');
            }
        });
    });

    /* DELETE */
    document.querySelectorAll('.deleteCollarBtn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            const form = document.querySelector('#deleteCollarForm');
            form.querySelector('input[name=id]').value = id;
        });
    });

    const deleteForm = document.getElementById('deleteCollarForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            formData.append('action','delete');

            const response = await fetch('../ajax/collar.php', { method: 'POST', body: formData });
            const result = await response.json();

            if (result.success) {
                alert('Collar berhasil dihapus.');
                deleteModal.hide();
                location.reload();
            } else { alert(result.message); }
        });
    }

});
