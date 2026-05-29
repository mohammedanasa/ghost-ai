import { NewProjectButton } from "@/components/editor/new-project-button"

export default function EditorPage() {
  return (
    <main className="h-full bg-base flex flex-col items-center justify-center gap-3">
      <h1 className="text-[1rem] font-medium text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <NewProjectButton />
    </main>
  )
}
