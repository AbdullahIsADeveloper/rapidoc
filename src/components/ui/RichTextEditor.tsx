import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const fonts = [
  "Arial",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Source Sans Pro",
];

const fontSizes = [
  "8px",
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
];

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setMounted(true);
    // Load Google Fonts
    fonts.forEach((font) => {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css?family=${font.replace(
        " ",
        "+"
      )}`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    });
  }, []);

  if (!mounted) return null;

  const modules = {
    toolbar: {
      container: "#toolbar",
      handlers: {
        bold: () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("bold", !format.bold);
          }
        },
        italic: () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("italic", !format.italic);
          }
        },
        underline: () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("underline", !format.underline);
          }
        },
        list: () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("list", !format.list ? "bullet" : false);
          }
        },
        "ordered-list": () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("list", !format.list ? "ordered" : false);
          }
        },
        blockquote: () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("blockquote", !format.blockquote);
          }
        },
        code: () => {
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const format = editor.getFormat();
            editor.format("code-block", !format["code-block"]);
          }
        },
      },
    },
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
    "code-block",
    "blockquote",
  ];

  return (
    <div className="border rounded-lg">
      <div
        id="toolbar"
        className="flex items-center gap-2 p-2 border-b bg-background"
      >
        <Select
          onValueChange={(value) => {
            const editor = quillRef.current?.getEditor();
            if (editor) {
              editor.format("font", value);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Font Family" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            const editor = quillRef.current?.getEditor();
            if (editor) {
              editor.format("size", value);
            }
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 border-l pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers.bold()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers.italic()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers.underline()}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-l pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers.list()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers["ordered-list"]()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-l pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers.blockquote()}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => modules.toolbar.handlers.code()}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="[&_.ql-container]:h-[200px]"
      />
    </div>
  );
}
