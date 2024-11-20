import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutGrid, List, Plus, Settings, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createDocument, getDocuments } from "@/firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  name: string;
  content: string;
  ownerId: string;
  collaborators: Array<{ id: string; permission: string }>;
  lastModified: string;
}

interface DocumentCardProps {
  document: Document;
}

export default function Home() {
  const firebaseAuth = getAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewDocumentForm, setShowNewDocumentForm] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");

  const currentUser = firebaseAuth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setIsAuthenticated(false);
      navigate("/", { replace: true });
      return;
    }

    const fetchDocuments = async () => {
      try {
        const fetchedDocuments = await getDocuments();
        setDocuments(fetchedDocuments || []);
        setError(null);
      } catch (error) {
        setError("Error fetching documents. Please try again.");
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentUser, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(firebaseAuth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing out: ", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  const handleCreateDocument = () => {
    setShowNewDocumentForm(true);
  };

  const handleSubmitNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocumentName.trim()) return;

    try {
      const newDocument: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDocumentName.trim(),
        content: "",
        ownerId: currentUser?.uid || "", // Assign the current user as the owner
        collaborators: [], // Start with no collaborators
        lastModified: new Date().toISOString(),
      };

      await createDocument(newDocument);
      setDocuments([...documents, newDocument]);
      setNewDocumentName("");
      setShowNewDocumentForm(false);
      setError(null);
    } catch (error) {
      console.error("Error creating document:", error);
      setError("Failed to create document. Please try again.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery) ||
      doc.content.toLowerCase().includes(searchQuery)
  );

  const handleSettingsClick = () => {
    console.log("Opening settings");
  };

  const getFirstLine = (content: string): string => {
    const firstLine = content.split("\n")[0];
    return firstLine.length > 100 ? `${firstLine.slice(0, 100)}...` : firstLine;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onClick={() => navigate(`/document/${document.id}`)}
        className={cn(
          "group relative cursor-pointer rounded-lg border p-4 transition-all hover:border-foreground/50",
          viewMode === "list" ? "flex items-center justify-between" : ""
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium truncate">{document.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(document.lastModified)}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4 line-clamp-1">
          {getFirstLine(document.content)}
        </p>
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="/rapidocLogo.png"
              alt="Rapidoc Logo"
              className="w-8 h-8"
            />
            <Input
              type="search"
              placeholder="Search documents..."
              className="w-[300px]"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSettingsClick}>
              <Settings className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {currentUser?.displayName?.[0].toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back, {currentUser?.displayName?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and collaborate on your documents
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", viewMode === "grid" && "bg-secondary")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", viewMode === "list" && "bg-secondary")}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button className="gap-2" onClick={handleCreateDocument}>
              <Plus className="w-4 h-4" />
              New Document
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No documents found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </main>

      {/* New Document Form */}
      <AnimatePresence>
        {showNewDocumentForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Document</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewDocumentForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmitNewDocument}>
                <div className="mb-4">
                  <label
                    htmlFor="documentName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Document Name
                  </label>
                  <Input
                    id="documentName"
                    type="text"
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                    placeholder="Enter document name"
                    className="w-full"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewDocumentForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Document</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
