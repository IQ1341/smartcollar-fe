import { auth } from "./firebase.js";

const refreshSessionToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const token = await user.getIdToken(true);
    await fetch("/session.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, uid: user.uid, email: user.email }),
    });
  } catch (error) {
    console.error("[AUTH] Failed to refresh token:", error);
  }
};

const scheduleTokenRefresh = () => {
  setInterval(() => {
    refreshSessionToken();
  }, 1000 * 60 * 4); // refresh setiap 4 menit
};

window.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      refreshSessionToken();
      scheduleTokenRefresh();
    }
  });

  window.addEventListener("focus", () => {
    refreshSessionToken();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshSessionToken();
    }
  });
});
