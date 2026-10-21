import { db } from "/src/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

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
  } catch (error) {
    console.error("Error loading hike:", error);
    document.getElementById("hikeName").textContent = "Error loading hike.";
  }
}

displayHikeInfo();
