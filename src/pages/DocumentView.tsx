import { useState, useEffect } from "react";
import RichTextEditor from "reactjs-tiptap-editor";
import { extensions } from "@/components/extensions/TiptapExtensions";
import { getDocuments } from "@/firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { app, auth } from "@/firebase/firebase";

interface Document {
  id: string;
  name: string;
  content: string;
  collaborators: Array<{ id: string; permission: string }>;
  lastModified: string;
}

export default function DocumentView() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await getDocuments();
        if (!docs) {
          navigate("/");
          return;
        }

        setDocuments(docs);
        const currentDoc = docs.find((d) => d.id === documentId);
        if (!currentDoc) {
          navigate("/");
          return;
        }

        setCurrentDocument(currentDoc);
        setContent(currentDoc.content || "");
      } catch (error) {
        console.error("Error fetching documents:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();

    // Set up real-time listener
    if (documentId && auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const docs = (data?.documents as Document[]) || [];
          const updatedDoc = docs.find((d) => d.id === documentId);

          if (
            updatedDoc &&
            updatedDoc.lastModified !== currentDocument?.lastModified
          ) {
            setContent(updatedDoc.content);
            setCurrentDocument(updatedDoc);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [documentId, navigate, db, currentDocument?.lastModified]);

  const onChangeContent = async (value: string) => {
    if (!currentDocument || !auth.currentUser) return;

    setContent(value);
    const updatedDocs = documents.map((doc) =>
      doc.id === documentId
        ? { ...doc, content: value, lastModified: new Date().toISOString() }
        : doc
    );

    try {
      await setDocuments(updatedDocs);
      setDocuments(updatedDocs);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentDocument) {
    return <div>Document not found</div>;
  }

  return (
    <RichTextEditor
      output="html"
      content={content}
      onChangeContent={onChangeContent}
      hideToolbar={false}
      extensions={extensions}
    />
  );
}
