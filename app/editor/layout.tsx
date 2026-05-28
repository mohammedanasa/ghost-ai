import { EditorChrome } from "@/components/editor/editor-chrome"

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <EditorChrome>{children}</EditorChrome>
}
