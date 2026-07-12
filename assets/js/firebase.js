import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

console.log("APP =", window.APP);
console.log("Firebase =", window.APP?.firebase);

const app = initializeApp(window.APP.firebase);

export const auth = getAuth(app);