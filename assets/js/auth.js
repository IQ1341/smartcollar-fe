import {
    auth
} from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const form =
    document.getElementById("loginForm");

if (form) {

    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            try {

                const credential =
                    await signInWithEmailAndPassword(

                        auth,

                        email,

                        password

                    );

                const token =
                    await credential.user.getIdToken();

                const response =
                    await fetch(
                        "/session.php",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                token,

                                uid:
                                    credential.user.uid,

                                email:
                                    credential.user.email

                            })

                        }
                    );

                const result =
                    await response.json();

                if (result.success) {

                    window.location =
                        "/pages/dashboard.php";

                }

            }

            catch (error) {

                alert(error.message);

            }

        }
    );

}