import { doc, getFirestore, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { app, auth } from "../firebase/firebase";

const db = getFirestore(app);

interface Document {
  id: string;
  name: string;
  content: string;
  ownerId: string;
  collaborators: Array<{ id: string; permission: string }>;
  lastModified: string;
}

export async function getDocuments(): Promise<Document[] | null> {
  try {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found.");
    }

    const userId = auth.currentUser.uid;

    // Query documents that the user owns
    const ownedDocsQuery = query(
      collection(db, "documents"),
      where("ownerId", "==", userId)
    );

    // Query for documents where the user is a collaborator
    const sharedDocsQuery = query(
      collection(db, "documents"),
      where("collaborators", "array-contains", userId )
    );

    const ownedDocsSnapshot = await getDocs(ownedDocsQuery);
    const sharedDocsSnapshot = await getDocs(sharedDocsQuery);

    const ownedDocuments = ownedDocsSnapshot.docs.map((doc) => {
      const data = doc.data() as Document;
      return { ...data, role: "Owner" };
    });

    const sharedDocuments = sharedDocsSnapshot.docs.map((doc) => {
      const data = doc.data() as Document;
      const collaborator = data.collaborators.find((c) => c.id === userId);
      return { ...data, role: collaborator?.permission || "Collaborator" };
    });

    return [...ownedDocuments, ...sharedDocuments];
  } catch (error) {
    console.error("Error fetching documents: ", error);
    return null;
  }
}

export async function createDocument(newDocument: Document): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  try {
    // Set the ownerId to the current user's ID
    newDocument.ownerId = auth.currentUser.uid;

    // Save the document in the global documents collection
    const docRef = doc(db, "documents", newDocument.id);
    await setDoc(docRef, newDocument);
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}