import { onAuthReady } from "/src/authentication.js";

onAuthReady(function (user) {
  if (user) {
    const name = user.displayName || user.email;
    document.getElementById("name-goes-here").textContent = name + "!";
  } else {
    window.location.href = "/login.html";
  }
});
