"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import CharacterCount from "@tiptap/extension-character-count"
import { useEffect, useCallback } from "react"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Link2, AlignLeft, AlignCenter,
  AlignRight, Heading2, Heading3, Minus, Eraser,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Redacta el contenido de la noticia…",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-4" },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] px-4 py-3 focus:outline-none prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary",
      },
    },
  })

  // Sync external value changes (e.g. on edit load)
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string
    const url = window.prompt("URL del enlace (https://...)", prev)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      title={title}
      className="h-7 w-7"
    >
      {children}
    </Button>
  )

  const chars = editor.storage.characterCount?.characters?.() ?? 0
  const words = editor.storage.characterCount?.words?.() ?? 0

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/40">
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Título H2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Título H3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrita">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Cursiva">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Subrayado">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Cita">
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Alinear izquierda">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrar">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Alinear derecha">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Insertar enlace">
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Separador">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} active={false} title="Limpiar formato">
          <Eraser className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Content */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex justify-end gap-3 text-xs text-muted-foreground">
        <span>{words} palabras</span>
        <span>{chars} caracteres</span>
      </div>
    </div>
  )
}
