</main>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {

    /*
    |--------------------------------------------------------------------------
    | Sidebar Toggle (Hamburger + Overlay Mobile)
    |--------------------------------------------------------------------------
    */

    const toggleBtn = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const overlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        content.classList.toggle('active');
        if (overlay) overlay.classList.toggle('show');
    }

    if (toggleBtn && sidebar && content) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            content.classList.remove('active');
            overlay.classList.remove('show');
        });
    }

    /*
    |--------------------------------------------------------------------------
    | FIX: Modal ketutup backdrop-filter #content
    | Pindahkan semua modal ke <body> supaya lolos dari stacking context
    | yang dibuat oleh backdrop-filter di #content.
    |--------------------------------------------------------------------------
    */

    document.querySelectorAll('.modal').forEach(modal => {
        document.body.appendChild(modal);
    });

});
</script>

<script type="module" src="/assets/js/app.js"></script>

<?php if (isset($pageScript)) : ?>

<script <?= isset($pageScriptModule) && $pageScriptModule ? 'type="module"' : '' ?> src="/assets/js/<?= $pageScript ?>"></script>

<?php endif; ?>

</body>

</html>