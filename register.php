<?php

require_once __DIR__ . "/config/app.php";


?>


<!DOCTYPE html>
<html lang="id">

<script>

window.APP = {

    apiUrl: "<?= API_URL ?>",

    firebase: {

        apiKey: "<?= FIREBASE_API_KEY ?>",

        authDomain: "<?= FIREBASE_AUTH_DOMAIN ?>",

        databaseURL: "<?= FIREBASE_DATABASE_URL ?>",

        projectId: "<?= FIREBASE_PROJECT_ID ?>",

        storageBucket: "<?= FIREBASE_STORAGE_BUCKET ?>",

        messagingSenderId: "<?= FIREBASE_MESSAGING_SENDER_ID ?>",

        appId: "<?= FIREBASE_APP_ID ?>"

    }

};

console.log(window.APP);

</script>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar | Smart Collar System</title>

    <!-- Google Fonts & Bootstrap -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

    <script>
    window.addEventListener("load", () => {
        document.body.style.opacity = "1";
    });
    </script>

    <style>
    :root{
        --primary:#2563eb;
        --secondary:#38bdf8;
        --dark:#06142b;
    }

    *{box-sizing:border-box;}

    body{
        font-family:'Poppins',sans-serif;
        margin:0;
        overflow:hidden;
        opacity:0;
        transition:opacity .5s ease;
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:
            radial-gradient(circle at top left, rgba(59,130,246,0.35), transparent 30%),
            radial-gradient(circle at bottom right, rgba(56,189,248,0.25), transparent 30%),
            linear-gradient(135deg,#06142b,#0a2540,#0f3b68);
        background-size:400% 400%;
        animation:bgMove 15s ease infinite;
        position:relative;
    }

    @keyframes bgMove{
        0%{background-position:0% 50%;}
        50%{background-position:100% 50%;}
        100%{background-position:0% 50%;}
    }

    .bg-elements{position:absolute;width:100%;height:100%;overflow:hidden;z-index:1;}
    .floating-icon{position:absolute;color:rgba(255,255,255,0.08);animation:float 15s linear infinite;}
    @keyframes float{0%{transform:translateY(100vh) rotate(0deg);opacity:0;}20%{opacity:.5;}80%{opacity:.5;}100%{transform:translateY(-10vh) rotate(360deg);opacity:0;}}

    .card-register{position:relative;z-index:10;width:100%;max-width:460px;padding:35px 30px;border-radius:30px;background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);box-shadow:0 0 25px rgba(59,130,246,0.25),0 15px 40px rgba(0,0,0,0.35);animation:fadeUp .8s ease;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}

    .cow-logo-container{width:100px;height:100px;margin:-80px auto 20px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2563eb,#38bdf8);box-shadow:0 0 25px rgba(59,130,246,0.45),0 10px 25px rgba(0,0,0,0.3);}
    .cow-logo-container i{color:white;}
    .brand-name{font-weight:800;font-size:2rem;color:white;letter-spacing:1px;}
    .text-muted{color:#cbd5e1 !important;}
    .input-group{background: rgba(255,255,255,0.06);border-radius: 15px;overflow: hidden;border: 2px solid transparent;}
    .input-group:focus-within{border-color: var(--secondary);background: rgba(255,255,255,0.12);}
    .input-group-text{background: none;border: none;padding-left: 20px;color: #9fb3d1;}
    .form-control{background: none;border: none;padding: 12px;color: #fff;}
    .form-control::placeholder{color: rgba(255,255,255,0.4);}
    .form-control:focus{box-shadow: none;background: none;color: #fff;}
    .btn-register{background:linear-gradient(135deg,#2563eb,#38bdf8);border:none;border-radius:16px;padding:13px;color:white;font-weight:700;letter-spacing:.5px;transition:.3s ease;box-shadow:0 0 15px rgba(59,130,246,0.35);}
    .btn-register:hover{transform:translateY(-3px);box-shadow:0 0 25px rgba(96,165,250,0.45),0 10px 20px rgba(0,0,0,0.35);}
    .btn-register:disabled{opacity:.75;transform:none;}
    .register-link{color:#7dd3fc;text-decoration:none;font-weight:600;}
    .register-link:hover{color:white;}
    .form-text{color:#94a3b8;}

    @media(max-width:576px){
        body{padding:20px;}
        .card-register{padding:30px 22px;border-radius:24px;}
        .brand-name{font-size:1.7rem;}
        .cow-logo-container{width:85px;height:85px;margin:-65px auto 18px;}
        .cow-logo-container i{font-size:2rem;}
    }
    </style>
</head>
<body>

    <div class="bg-elements" id="floating-icons"></div>

    <div class="card-register shadow">
        <div class="cow-logo-container">
            <i class="fas fa-cow fa-3x"></i>
        </div>

        <div class="text-center mb-4">
            <h2 class="brand-name">SMART COLLAR</h2>
            <p class="text-muted small fw-medium">DAFTAR AKUN BARU</p>
        </div>

        <div id="alert-container"></div>

        <form id="registerForm" autocomplete="off">

            <div class="mb-3">
                <label class="form-label text-white fw-semibold mb-2">Nama Lengkap</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input type="text" id="name" class="form-control" placeholder="Nama Anda" required>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label text-white fw-semibold mb-2">Email</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input type="email" id="email" class="form-control" placeholder="email@domain.com" required>
                </div>
            </div>

            <div class="mb-3">
                <label class="form-label text-white fw-semibold mb-2">Nomor WA</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-phone"></i></span>
                    <input type="tel" id="phone" class="form-control" placeholder="+628123..." required>
                </div>
                <div class="form-text">Gunakan format +62, misal +6281234567890</div>
            </div>

            <div class="mb-3">
                <label class="form-label text-white fw-semibold mb-2">Alamat</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                    <input type="text" id="address" class="form-control" placeholder="Alamat lengkap" required>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label text-white fw-semibold mb-2">Password</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input type="password" id="password" class="form-control" placeholder="••••••••" required>
                </div>
            </div>

            <button type="submit" class="btn btn-register w-100 mb-3">DAFTAR SEKARANG</button>
        </form>

        <div class="text-center mt-3">
            <p class="small text-muted mb-0">
                Sudah punya akun?
                <a href="login.php" class="register-link">Masuk disini</a>
            </p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="/assets/js/register.js"></script>
</body>
</html>
