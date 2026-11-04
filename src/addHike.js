import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
let currentUser = null;

onAuthReady(function (user) {
  if (!user) {
    location.href = "index.html";
    return;
  }
  currentUser = user;
});

async function addHike(event) {
  event.preventDefault();
  if (!currentUser) {
    alert("You must be logged in to add a hike.");
    return;
  }

  const newHike = {
    name: document.getElementById("hikeNameInput").value,
    city: document.getElementById("cityInput").value,
    length: parseFloat(document.getElementById("lengthInput").value),
    level: document.getElementById("levelInput").value,
    details: document.getElementById("detailsInput").value,
    Owner: currentUser.uid,
    ownerName: currentUser.displayName || currentUser.email,
    last_updated: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "hikes"), newHike);

    location.href = "main.html";
  } catch (error) {
    alert("Error adding hike: " + error.message);
  }
}

document.getElementById("addHikeForm").addEventListener("submit", addHike);
