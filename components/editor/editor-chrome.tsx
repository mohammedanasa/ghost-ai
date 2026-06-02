"use client"

import { useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogsContext } from "./project-dialogs-context"
import { WorkspaceContext } from "./workspace-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { CreateProjectDialog } from "./dialogs/create-project-dialog"
import { RenameProjectDialog } from "./dialogs/rename-project-dialog"
import { DeleteProjectDialog } from "./dialogs/delete-project-dialog"
import { ShareDialog } from "./share-dialog"
import { StarterTemplatesModal } from "./starter-templates-modal"
import type { WorkspaceProject, TemplatePayload, SaveStatus } from "./workspace-context"
import type { ProjectData } from "@/lib/projects"

interface EditorChromeProps {
  children: React.ReactNode
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
}

export function EditorChrome({ children, ownedProjects, sharedProjects }: EditorChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [workspaceTitle, setWorkspaceTitle] = useState<string | null>(null)
  const [workspaceProject, setWorkspaceProject] = useState<WorkspaceProject | null>(null)
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [pendingTemplateImport, setPendingTemplateImport] = useState<TemplatePayload | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const triggerSaveRef = useRef<(() => void) | null>(null)
  const setTriggerSave = useCallback((fn: (() => void) | null) => {
    triggerSaveRef.current = fn
  }, [])
  const handleSave = useCallback(() => { triggerSaveRef.current?.() }, [])
  const [localOwnedProjects, setLocalOwnedProjects] = useState(ownedProjects)
  const pathname = usePathname()
  const segments = pathname.split('/')
  const activeProjectId = segments.length >= 3 && segments[2] ? segments[2] : undefined

  const onCreated = useCallback((project: ProjectData) => {
    setLocalOwnedProjects((prev) => [project, ...prev])
  }, [])
  const onRenamed = useCallback((id: string, name: string) => {
    setLocalOwnedProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }, [])
  const onDeleted = useCallback((id: string) => {
    setLocalOwnedProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const actions = useProjectActions(activeProjectId, { onCreated, onRenamed, onDeleted })

  return (
    <WorkspaceContext.Provider
      value={{
        setWorkspaceTitle,
        setWorkspaceProject,
        isAISidebarOpen,
        toggleAISidebar: () => setIsAISidebarOpen((prev) => !prev),
        pendingTemplateImport,
        setPendingTemplateImport,
        saveStatus,
        setSaveStatus,
        workspaceProject,
        setTriggerSave,
      }}
    >
    <ProjectDialogsContext.Provider value={{ openCreate: actions.openCreate }}>
      <div className="flex h-screen flex-col bg-base overflow-hidden">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
          workspaceTitle={workspaceTitle}
          isAISidebarOpen={isAISidebarOpen}
          onToggleAISidebar={() => setIsAISidebarOpen((prev) => !prev)}
          onShare={() => setIsShareOpen(true)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          saveStatus={saveStatus}
          onSave={handleSave}
        />
        <div className="relative flex-1 min-h-0">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onOpenCreate={actions.openCreate}
            onOpenRename={actions.openRename}
            onOpenDelete={actions.openDelete}
            ownedProjects={localOwnedProjects}
            sharedProjects={sharedProjects}
            activeProjectId={activeProjectId}
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
      {workspaceProject && (
        <ShareDialog
          projectId={workspaceProject.id}
          isOwner={workspaceProject.isOwner}
          open={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onImport={(template) => setPendingTemplateImport({ nodes: template.nodes, edges: template.edges })}
      />
    </ProjectDialogsContext.Provider>
    </WorkspaceContext.Provider>
  )
}
