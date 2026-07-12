document.addEventListener('DOMContentLoaded', () => {

    const assignForm = document.getElementById('assignForm');
    const assignTableBody = document.getElementById('assignmentTableBody');
    const cowSelect = document.querySelector('select[name="cowId"]');
    const collarSelect = document.querySelector('select[name="collarId"]');

    const initialCowOptions = cowSelect
        ? Array.from(cowSelect.options)
            .filter(option => option.value)
            .map(option => ({ value: option.value, text: option.text }))
        : [];
    const initialCollarOptions = collarSelect
        ? Array.from(collarSelect.options)
            .filter(option => option.value)
            .map(option => ({ value: option.value, text: option.text }))
        : [];

    function refreshDropdowns(assignedCowIds, assignedCollarIds) {
        if (cowSelect) {
            cowSelect.innerHTML = '';
            cowSelect.appendChild(new Option('-- Select Cow --', ''));
            for (const option of initialCowOptions) {
                if (assignedCowIds.has(option.value)) continue;
                cowSelect.appendChild(new Option(option.text, option.value));
            }
        }

        if (collarSelect) {
            collarSelect.innerHTML = '';
            collarSelect.appendChild(new Option('-- Select Collar --', ''));
            for (const option of initialCollarOptions) {
                if (assignedCollarIds.has(option.value)) continue;
                collarSelect.appendChild(new Option(option.text, option.value));
            }
        }
    }

    async function loadAssignments() {
        if (!assignTableBody) {
            console.error('Assignment table body element not found');
            return;
        }

        const form = new FormData();
        form.append('action', 'list');
        const res = await fetch('../ajax/assignment.php', { method: 'POST', body: form });
        const json = await res.json();
        if (!json.success) {
            alert(json.message);
            return;
        }

        const activeAssignments = Array.isArray(json.data)
            ? json.data.filter(a => a.active)
            : [];

        const assignedCowIds = new Set(activeAssignments.map(a => a.cowId).filter(Boolean));
        const assignedCollarIds = new Set(activeAssignments.map(a => a.collarId).filter(Boolean));
        refreshDropdowns(assignedCowIds, assignedCollarIds);

        assignTableBody.innerHTML = '';
        if (activeAssignments.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="text-center">No active assignments</td>';
            assignTableBody.appendChild(emptyRow);
        } else {
            for (const a of activeAssignments) {
                const status = a.active ? 'Assigned' : 'Inactive';
                const cowLabel = a.cowName ? a.cowName : a.cowId ?? '';
                const deviceLabel = a.deviceName ? a.deviceName : a.collarId ?? '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${a.id}</td>
                    <td>${cowLabel}</td>
                    <td>${deviceLabel}</td>
                    <td>${status}</td>
                    <td>${a.assignedAt ?? ''}</td>
                    <td><button class="btn btn-sm btn-danger detachBtn" data-cowid="${a.cowId}">Detach</button></td>
                `;
                assignTableBody.appendChild(tr);
            }
        }

        document.querySelectorAll('.detachBtn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const cowId = this.dataset.cowid;
                if (!confirm('Detach this assignment?')) return;
                const form = new FormData();
                form.append('action', 'detach');
                form.append('cowId', cowId);
                const res = await fetch('../ajax/assignment.php', { method: 'POST', body: form });
                const j = await res.json();
                if (j.success) {
                    alert('Detached');
                    loadAssignments();
                } else {
                    alert(j.message);
                }
            });
        });
    }

    if (assignForm) {
        assignForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const cowId = formData.get('cowId');
            const collarId = formData.get('collarId');
            if (!cowId || !collarId) {
                alert('Select cow and collar');
                return;
            }
            const form = new FormData();
            form.append('action', 'attach');
            form.append('cowId', cowId);
            form.append('collarId', collarId);
            const res = await fetch('../ajax/assignment.php', { method: 'POST', body: form });
            const j = await res.json();
            if (j.success) {
                alert('Assigned');
                loadAssignments();
            } else {
                alert(j.message);
            }
        });
    }

    loadAssignments();

});