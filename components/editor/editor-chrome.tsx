"use client"

import { useState } from "react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogsContext } from "./project-dialogs-context"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { CreateProjectDialog } from "./dialogs/create-project-dialog"
import { RenameProjectDialog } from "./dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "./dialogs/delete-project-dialog"

export function EditorChrome({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dialogs = useProjectDialogs()

  return (
    <ProjectDialogsContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <div className="flex h-screen flex-col bg-base overflow-hidden">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="relative flex-1 min-h-0">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenCreate={dialogs.openCreate}
            onOpenRename={dialogs.openRename}
            onOpenDelete={dialogs.openDelete}
          />
          {children}
        </div>
      </div>

      <CreateProjectDialog
        open={dialogs.openDialog === "create"}
        name={dialogs.formName}
        onNameChange={dialogs.setFormName}
        onClose={dialogs.close}
      />
      <RenameProjectDialog
        open={dialogs.openDialog === "rename"}
        currentName={dialogs.target?.name ?? ""}
        name={dialogs.formName}
        onNameChange={dialogs.setFormName}
        onClose={dialogs.close}
      />
      <DeleteProjectDialog
        open={dialogs.openDialog === "delete"}
        projectName={dialogs.target?.name ?? ""}
        onClose={dialogs.close}
      />
    </ProjectDialogsContext.Provider>
  )
}
