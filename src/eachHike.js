import { db } from "/src/firebaseConfig.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { onAuthReady } from "./authentication.js";

let currentUser = null;

onAuthReady(function (user) {
  if (!user) {
    location.href = "index.html";
  } else {
    currentUser = user;
  }
});

const params = new URL(window.location.href).searchParams;
const hikeId = params.get("docID");

async function displayHikeInfo() {
  try {
    if (!hikeId) {
      throw new Error("Missing hike ID");
    }

    const hikeRef = doc(db, "hikes", hikeId);
    const hikeSnap = await getDoc(hikeRef);

    if (!hikeSnap.exists()) {
      throw new Error("Hike not found");
    }

    const hike = hikeSnap.data();

    document.getElementById("hikeName").textContent = hike.name;

    const img = document.getElementById("hikeImage");
    img.src = `/images/${hike.code}.jpg`;
    img.alt = `${hike.name} image`;
    await updateDoc(hikeRef, { views: increment(1) });
    document.getElementById("viewCount").textContent = (hike.views || 0) + 1;
  } catch (error) {
    console.error("Error loading hike:", error);
    document.getElementById("hikeName").textContent = "Error loading hike.";
  }
}

displayHikeInfo();

async function displayReviews() {
  const container = document.getElementById("reviews-go-here");
  const template = document.getElementById("reviewTemplate");
  container.innerHTML = "";

  const q = query(
    collection(db, "reviews"),
    where("hikeDocID", "==", hikeId),
    orderBy("timestamp", "desc"),
    limit(5),
  );

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML =
        "<p class='text-muted'>No reviews yet. Be the first!</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const review = doc.data();
      const card = template.content.cloneNode(true);

      card.querySelector(".review-title").textContent =
        `${review.title} ${"★".repeat(review.rating)}`;
      const date = review.timestamp
        ? review.timestamp.toDate().toLocaleDateString()
        : "just now";
      card.querySelector(".review-meta").textContent =
        `${review.userName} · ${date}`;
      card.querySelector(".review-text").textContent = review.text;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
  }
}

displayReviews();

async function submitReview(event) {
  event.preventDefault();

  const newReview = {
    hikeDocID: hikeId,
    userID: currentUser.uid,
    userName: currentUser.displayName || currentUser.email,
    title: document.getElementById("reviewTitle").value,
    rating: Number(document.getElementById("reviewRating").value),
    text: document.getElementById("reviewText").value,
    timestamp: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "reviews"), newReview);
    event.target.reset();
    displayReviews();
  } catch (error) {
    alert(
      `Error saving review:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}

document.getElementById("reviewForm").addEventListener("submit", submitReview);
