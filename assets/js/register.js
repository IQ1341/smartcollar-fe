import {
    auth
} from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const form = document.getElementById("registerForm");

if (form) {
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const rawPhone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const password = document.getElementById("password").value;
        const alertCont = document.getElementById("alert-container");

        const showError = (message) => {
            if (alertCont) {
                alertCont.innerHTML = `
                    <div class="alert alert-danger animate__animated animate__shakeX">
                        <i class="fas fa-circle-exclamation me-2"></i>${message}
                    </div>
                `;
            } else {
                alert(message);
            }
        };

        if (!name || !email || !rawPhone || !address || !password) {
            showError("Semua field user wajib diisi.");
            return;
        }

        const formatPhone = (value) => {
            if (!value) return "";
            if (value.startsWith("+62")) return value;
            if (value.startsWith("62")) return "+" + value;
            if (value.startsWith("08")) return "+62" + value.slice(1);
            return value;
        };

        const phone = formatPhone(rawPhone);

        if (!phone.startsWith("+62")) {
            alert("Nomor WA harus diawali dengan +62, misal +628123...");
            return;
        }

        try {
            const credential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const token = await credential.user.getIdToken();

            const response = await fetch("/session.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token,
                    uid: credential.user.uid,
                    email: credential.user.email,
                    name,
                    phone,
                    address
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || "Gagal menyimpan session");
            }

            const syncResponse = await fetch("/ajax/auth_sync.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    phone,
                    address,
                    photoUrl: ""
                })
            });

            const syncResult = await syncResponse.json();
            if (!syncResult.success) {
                throw new Error(syncResult.message || "Gagal sinkron user");
            }

            window.location = "/pages/dashboard.php";
        } catch (error) {
            let message = error.message || "Terjadi kesalahan, silakan coba lagi.";
            if (error.code) {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        message = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
                        break;
                    case "auth/weak-password":
                        message = "Password terlalu lemah. Gunakan minimal 6 karakter.";
                        break;
                    case "auth/invalid-email":
                        message = "Format email tidak valid.";
                        break;
                    case "auth/network-request-failed":
                        message = "Koneksi internet bermasalah. Coba lagi.";
                        break;
                }
            }

            showError(message);
        }
    });
}
