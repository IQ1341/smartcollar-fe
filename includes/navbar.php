<nav class="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm sticky-top">

    <div class="container-fluid px-4 d-flex align-items-center">

        <button id="sidebarToggle" class="navbar-toggle me-3" aria-label="Toggle sidebar">
            <i class="bi bi-list"></i>
        </button>

        <span class="navbar-brand mb-0 h1">

            🐄 Smart Collar

        </span>

        <div class="ms-auto">
        <?php if(isset($_SESSION["user"])) : ?>

            <div class="text-white d-flex align-items-center">

                <i class="bi bi-person-circle me-2"></i>

                <?= $_SESSION["user"]["name"] ?>

            </div>

        <?php endif; ?>
        </div>

    </div>

</nav>

<script>
    document.getElementById('sidebarToggle')?.addEventListener('click', function(){
        document.getElementById('sidebar')?.classList.toggle('active');
        document.getElementById('content')?.classList.toggle('active');
    });
</script>