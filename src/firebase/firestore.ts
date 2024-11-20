import { doc, getDoc, getFirestore, setDoc, onSnapshot } from "firebase/firestore";
import { app, auth } from "../firebase/firebase";

const db = getFirestore(app);

interface Document {
  id: string;
  name: string;
  content: string;
  collaborators: Array<{ id: string; permission: string }>;
  lastModified: string;
}

export async function getDocuments(): Promise<Document[] | null> {
  try {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found.");
    }

    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().documents as Document[];
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
    return null;
  }
}

export async function setDocuments(documents: Document[]): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  try {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userDocRef, { documents }, { merge: true });
  } catch (error) {
    console.error("Error writing documents:", error);
    throw error;
  }
}

export async function createUserFirestore(userUid: string): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userUid);
    await setDoc(userDocRef, { documents: [] }, { merge: true });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function createDocument(newDocument: Document): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  try {
    const existingDocuments = await getDocuments();
    if (!existingDocuments) {
      throw new Error("Failed to fetch existing documents.");
    }

    const updatedDocuments = [...existingDocuments, newDocument];
    await setDocuments(updatedDocuments);
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}

export function subscribeToDocument(
  documentId: string,
  onUpdate: (document: Document | null) => void
): () => void {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  const userDocRef = doc(db, "users", auth.currentUser.uid);
  
  return onSnapshot(userDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const documents = docSnapshot.data().documents as Document[];
      const document = documents.find(doc => doc.id === documentId) || null;
      onUpdate(document);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    console.error("Error listening to document changes:", error);
    onUpdate(null);
  });
}