"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogsContext } from "./project-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { CreateProjectDialog } from "./dialogs/create-project-dialog"
import { RenameProjectDialog } from "./dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "./dialogs/delete-project-dialog"
import type { ProjectData } from "@/lib/projects"

interface EditorChromeProps {
  children: React.ReactNode
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
}

export function EditorChrome({ children, ownedProjects, sharedProjects }: EditorChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const segments = pathname.split('/')
  const activeProjectId = segments.length >= 3 && segments[2] ? segments[2] : undefined
  const actions = useProjectActions(activeProjectId)

  return (
    <ProjectDialogsContext.Provider value={{ openCreate: actions.openCreate }}>
      <div className="flex h-screen flex-col bg-base overflow-hidden">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="relative flex-1 min-h-0">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenCreate={actions.openCreate}
            onOpenRename={actions.openRename}
            onOpenDelete={actions.openDelete}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
          />
          {children}
        </div>
      </div>

      <CreateProjectDialog
        open={actions.openDialog === "create"}
        name={actions.formName}
        roomIdPreview={actions.roomIdPreview}
        onNameChange={actions.setFormName}
        onClose={actions.close}
        onSubmit={actions.submitCreate}
        isLoading={actions.isLoading}
      />
      <RenameProjectDialog
        open={actions.openDialog === "rename"}
        currentName={actions.target?.name ?? ""}
        name={actions.formName}
        onNameChange={actions.setFormName}
        onClose={actions.close}
        onSubmit={actions.submitRename}
        isLoading={actions.isLoading}
      />
      <DeleteProjectDialog
        open={actions.openDialog === "delete"}
        projectName={actions.target?.name ?? ""}
        onClose={actions.close}
        onSubmit={actions.submitDelete}
        isLoading={actions.isLoading}
      />
    </ProjectDialogsContext.Provider>
  )
}
