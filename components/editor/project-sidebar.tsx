"use client"

import { useRouter } from "next/navigation"
import { Plus, X, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { DialogTarget } from "@/hooks/use-project-actions"
import type { ProjectData } from "@/lib/projects"

interface ProjectItemProps {
  project: ProjectData
  isOwned: boolean
  isActive: boolean
  onRename: (target: DialogTarget) => void
  onDelete: (target: DialogTarget) => void
}

function ProjectItem({ project, isOwned, isActive, onRename, onDelete }: ProjectItemProps) {
  const router = useRouter()

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-subtle cursor-pointer",
        isActive && "bg-brand-dim",
      )}
      onClick={() => router.push(`/editor/${project.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.key === " ") e.preventDefault()
          router.push(`/editor/${project.id}`)
        }
      }}
    >
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isActive ? "text-copy-primary" : "text-copy-secondary",
        )}
      >
        {project.name}
      </span>
      {isOwned && (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Rename project"
            onClick={(e) => {
              e.stopPropagation()
              onRename({ id: project.id, name: project.name })
            }}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
              }
            }}
          >
            <Pencil className="h-3 w-3 text-copy-muted" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Delete project"
            onClick={(e) => {
              e.stopPropagation()
              onDelete({ id: project.id, name: project.name })
            }}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
              }
            }}
          >
            <Trash2 className="h-3 w-3 text-copy-muted" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpenCreate: () => void
  onOpenRename: (target: DialogTarget) => void
  onOpenDelete: (target: DialogTarget) => void
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
  activeProjectId?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onOpenCreate,
  onOpenRename,
  onOpenDelete,
  ownedProjects,
  sharedProjects,
  activeProjectId,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          "fixed top-0 left-0 z-50 h-full w-72",
          "flex flex-col",
          "bg-elevated border-r border-border-default",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border-default shrink-0">
          <span className="text-sm font-medium text-copy-primary">Projects</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close sidebar">
            <X className="h-4 w-4 text-copy-muted" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 min-h-0 px-3 pt-3">
          <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="flex flex-col flex-1 min-h-0 mt-2">
              {ownedProjects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-copy-muted">No projects yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isOwned={true}
                      isActive={project.id === activeProjectId}
                      onRename={onOpenRename}
                      onDelete={onOpenDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="flex flex-col flex-1 min-h-0 mt-2">
              {sharedProjects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-copy-muted">No shared projects.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isOwned={false}
                      isActive={project.id === activeProjectId}
                      onRename={onOpenRename}
                      onDelete={onOpenDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-3 pb-4 shrink-0">
          <Button className="w-full gap-2" onClick={onOpenCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
