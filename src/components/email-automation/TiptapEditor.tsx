import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button, Dropdown } from "antd";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdLink,
  MdCode,
} from "react-icons/md";
import { useEffect } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  availableVariables?: string[];
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Nhập nội dung email...",
  availableVariables = [],
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] rounded-lg",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Nhập URL:", "https://");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertVariable = (variable: string) => {
    editor.chain().focus().insertContent(variable).run();
  };

  const variableMenuItems = availableVariables.map((variable) => ({
    key: variable,
    label: variable,
    onClick: () => insertVariable(variable),
  }));

  return (
    <div
      className="border-1 rounded-lg overflow-hidden p-4"
      style={{
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #ccc",
      }}>
      {/* Toolbar */}
      <div
        className="bg-gray-50 p-4 flex flex-wrap"
        style={{
          paddingBottom: "12px",
          borderBottom: "1px solid #ccc",
          gap: "2px",
        }}>
        <Button
          type={editor.isActive("bold") ? "primary" : "default"}
          size="small"
          icon={<MdFormatBold />}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Button
          type={editor.isActive("italic") ? "primary" : "default"}
          size="small"
          icon={<MdFormatItalic />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Button
          type={editor.isActive("code") ? "primary" : "default"}
          size="small"
          icon={<MdCode />}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type={
            editor.isActive("heading", { level: 1 }) ? "primary" : "default"
          }
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }>
          H1
        </Button>
        <Button
          type={
            editor.isActive("heading", { level: 2 }) ? "primary" : "default"
          }
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }>
          H2
        </Button>
        <Button
          type={
            editor.isActive("heading", { level: 3 }) ? "primary" : "default"
          }
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }>
          H3
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type={editor.isActive("bulletList") ? "primary" : "default"}
          size="small"
          icon={<MdFormatListBulleted />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Button
          type={editor.isActive("orderedList") ? "primary" : "default"}
          size="small"
          icon={<MdFormatListNumbered />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type={editor.isActive("link") ? "primary" : "default"}
          size="small"
          icon={<MdLink />}
          onClick={addLink}
        />
        {availableVariables.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Dropdown
              menu={{ items: variableMenuItems }}
              placement="bottomLeft">
              <Button size="small">Chèn biến</Button>
            </Dropdown>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        style={{ marginTop: "12px", border: "none" }}
      />

      <style>{`
        .ProseMirror {
          min-height: 300px;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .titap {
          border: none !important;
        }
      `}</style>
    </div>
  );
}
