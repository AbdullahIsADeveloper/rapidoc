import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { app, auth } from "../firebase/firebase";

const db = getFirestore(app);

export async function getDocuments() {
  try {
    const docRef = doc(db, "users", `${auth.currentUser!.uid}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().documents as Array<{
        id: string;
        name: string;
        content: string;
        collaborators: Array<{ id: string; permission: string }>;
        lastModified: string;
      }>;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
    return null;
  }
}

export async function setDocuments(documents: Array<{ id: string; name: string; content: string; collaborators: Array<{ id: string; permission: string }>; lastModified: string }>) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  const userUid = auth.currentUser.uid;

  try {
    const userDocRef = doc(db, "users", userUid);
    await setDoc(userDocRef, { documents }, { merge: true });
    console.log("Documents have been successfully stored as a field!");
  } catch (error) {
    console.error("Error writing documents:", error);
  }
}


export async function createUserFirestore(userUid: string) {
  const userDocRef = doc(db, "users", userUid);
  try {
    await setDoc(userDocRef, { documents: [] }, { merge: true });
    console.log("User has been successfully created!");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}


export async function createDocument(newDocument: { id: string; name: string; content: string; collaborators: Array<{ id: string; permission: string }>; lastModified: string }) {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  // const userUid = auth.currentUser.uid;

  try {
    const existingDocuments = await getDocuments();
    if (!existingDocuments) {
      throw new Error("Failed to fetch existing documents.");
    }
    const updatedDocuments = [...existingDocuments, newDocument];

    await setDocuments(updatedDocuments);
    console.log("New document has been successfully created!");
  } catch (error) {
    console.error("Error creating document:", error);
  }
}