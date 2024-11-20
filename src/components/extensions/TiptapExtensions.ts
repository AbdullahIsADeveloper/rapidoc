// Third-party imports
import ListItem from "@tiptap/extension-list-item";
import Subscript from "@tiptap/extension-subscript";

// Editor styles
import "reactjs-tiptap-editor/style.css";

// Editor components
import {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  Emoji,
  ExportPdf,
  FontFamily,
  FontSize,
  FormatPainter,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  Indent,
  Italic,
  LineHeight,
  Link,
  MoreMark,
  Strike,
  Table,
  TextAlign,
} from "reactjs-tiptap-editor";

export const extensions = [
  BaseKit.configure({
    placeholder: {
      showOnlyCurrent: true,
    },
  }),
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  Emoji,
  ExportPdf,
  FontFamily,
  FontSize,
  FormatPainter,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  Indent,
  Italic,
  LineHeight,
  Link,
  ListItem,
  MoreMark,
  Strike,
  Subscript,
  Table,
  TextAlign,
];