import { onAuthReady } from "/src/authentication.js";
import { db } from "/src/firebaseConfig.js";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
let currentUser = null;
let favourites = [];
// Read quote from Firestore
function readQuote(day) {
  const quoteRef = doc(db, "quotes", day);

  onSnapshot(
    quoteRef,
    (docSnap) => {
      if (docSnap.exists()) {
        document.getElementById("quote-goes-here").textContent =
          docSnap.data().quote;
      } else {
        console.log("No such document!");
      }
    },
    (error) => {
      console.error("Firestore error:", error);
    },
  );
}
async function addHikeData() {
  const hikesRef = collection(db, "hikes");

  await addDoc(hikesRef, {
    code: "BBY01",
    name: "Burnaby Lake Park Trail",
    city: "Burnaby",
    level: "easy",
    details: "A lovely place for a lunch walk.",
    length: 10,
    hike_time: 60,
    lat: 49.2467097082573,
    lng: -122.9187029619698,
    last_updated: serverTimestamp(),
  });

  await addDoc(hikesRef, {
    code: "AM01",
    name: "Buntzen Like Trail",
    city: "Anmore",
    level: "moderate",
    details: "Close to town, and relaxing.",
    length: 10.5,
    hike_time: 80,
    lat: 49.3399431028579,
    lng: -122.85908496766939,
    last_updated: serverTimestamp(),
  });

  await addDoc(hikesRef, {
    code: "NV01",
    name: "Mount Seymour Trail",
    city: "North Vancouver",
    level: "hard",
    details: "Amazing ski slope views.",
    length: 8.2,
    hike_time: 120,
    lat: 49.38847101455571,
    lng: -122.94092543551031,
    last_updated: serverTimestamp(),
  });
}

async function seedHikes() {
  const hikesRef = collection(db, "hikes");
  const snapshot = await getDocs(hikesRef);

  if (snapshot.empty) {
    await addHikeData();
  }
}

async function displayCardsDynamically() {
  const template = document.getElementById("hikeCardTemplate");
  const container = document.getElementById("hikes-go-here");
  const hikesRef = collection(db, "hikes");
  const snapshot = await getDocs(hikesRef);
  container.replaceChildren();
  snapshot.forEach((docSnap) => {
    const hike = docSnap.data();
    const newCard = template.content.cloneNode(true);

    newCard.querySelector(".card-title").textContent = hike.name;
    newCard.querySelector(".card-text").textContent = hike.details;
    newCard.querySelector(".card-length").textContent = hike.length;
    newCard.querySelector(".card-image").src = `/images/${hike.code}.jpg`;
    newCard.querySelector(".read-more").href =
      `eachHike.html?docID=${docSnap.id}`;
    setupHeart(newCard, docSnap.id);
    container.appendChild(newCard);
    container.appendChild(newCard);
  });
}
function setupHeart(card, hikeID) {
  const heart = card.querySelector(".fav-btn");

  if (favourites.includes(hikeID)) {
    heart.classList.replace("bi-heart", "bi-heart-fill");
  }

  heart.addEventListener("click", function () {
    toggleFavourite(heart, hikeID);
  });
}

async function toggleFavourite(heart, hikeID) {
  const userRef = doc(db, "users", currentUser.uid);

  try {
    if (heart.classList.contains("bi-heart-fill")) {
      await setDoc(
        userRef,
        { favourites: arrayRemove(hikeID) },
        { merge: true },
      );

      heart.classList.replace("bi-heart-fill", "bi-heart");
    } else {
      await setDoc(
        userRef,
        { favourites: arrayUnion(hikeID) },
        { merge: true },
      );

      heart.classList.replace("bi-heart", "bi-heart-fill");
    }
  } catch (error) {
    alert("Error saving favourite: " + error.message);
  }
}
// Check login
onAuthReady(async function (user) {
  if (user) {
    const name = user.displayName || user.email;
    document.getElementById("name-goes-here").textContent = name + "!";

    readQuote("tuesday");
    try {
      currentUser = user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      favourites = [];

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.favourites) {
          favourites = userData.favourites;
        }
      }
      await seedHikes();
      await displayCardsDynamically();
    } catch (error) {
      console.error("Error loading hikes:", error);
    }
  } else {
    window.location.href = "/login.html";
  }
});
