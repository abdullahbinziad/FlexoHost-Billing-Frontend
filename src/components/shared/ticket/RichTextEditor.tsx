"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { FileHandler } from "@tiptap/extension-file-handler";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ImageIcon,
} from "lucide-react";
import { uploadFile } from "@/store/api/uploadApi";
import { devLog } from "@/lib/devLog";
import { toast } from "sonner";

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string, text: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Type your reply here...",
  minHeight = "140px",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only images are allowed");
    }
    return uploadFile(file);
  }, []);

  const handlePaste = useCallback(
    async (editor: any, files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      const pos = editor.state.selection.from;
      const fragments: { type: string; attrs: { src: string; alt: string } }[] = [];
      for (const file of imageFiles) {
        try {
          const url = await uploadImage(file);
          fragments.push({ type: "image", attrs: { src: url, alt: file.name } });
        } catch (e) {
          devLog(e);
          toast.error("Failed to upload image");
        }
      }
      if (fragments.length > 0) {
        editor.chain().focus().insertContentAt(pos, fragments).run();
      }
    },
    [uploadImage]
  );

  const handleDrop = useCallback(
    async (editor: any, files: File[], pos: number) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      const insertAt = pos ?? editor.state.selection.from;
      const fragments: { type: string; attrs: { src: string; alt: string } }[] = [];
      for (const file of imageFiles) {
        try {
          const url = await uploadImage(file);
          fragments.push({ type: "image", attrs: { src: url, alt: file.name } });
        } catch (e) {
          devLog(e);
          toast.error("Failed to upload image");
        }
      }
      if (fragments.length > 0) {
        editor.chain().focus().insertContentAt(insertAt, fragments).run();
      }
    },
    [uploadImage]
  );

  const editor = useEditor({
    // Avoid SSR hydration issues in Next.js / React 18
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      FileHandler.configure({
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        onPaste: handlePaste,
        onDrop: handleDrop,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] p-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML(), editor.getText());
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      devLog(err);
      toast.error("Failed to upload image");
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/40">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleImageClick}
          title="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      {/* Editor */}
      <div style={{ minHeight }} className="max-h-[300px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
