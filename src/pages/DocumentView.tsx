import RichTextEditor from "@/components/ui/RichTextEditor";
import { useState } from "react";

export default function DocumentView() {
  const [content, setContent] = useState("");
  return <RichTextEditor content={content} onChange={setContent} />;
}
