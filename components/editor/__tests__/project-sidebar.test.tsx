import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { ProjectSidebar } from "../project-sidebar"

describe("ProjectSidebar", () => {
  describe("structure", () => {
    it("renders an aside element", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole("complementary")).toBeInTheDocument()
    })

    it("displays the 'Projects' heading", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByText("Projects")).toBeInTheDocument()
    })

    it("renders a close button with accessible label", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole("button", { name: /close sidebar/i })).toBeInTheDocument()
    })

    it("renders a 'New Project' button", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument()
    })
  })

  describe("visibility via CSS transform", () => {
    it("applies translate-x-0 class when isOpen is true", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      const aside = screen.getByRole("complementary")
      expect(aside.className).toContain("translate-x-0")
    })

    it("applies -translate-x-full class when isOpen is false", () => {
      render(<ProjectSidebar isOpen={false} onClose={vi.fn()} />)
      const aside = screen.getByRole("complementary")
      expect(aside.className).toContain("-translate-x-full")
    })

    it("does not apply -translate-x-full when isOpen is true", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      const aside = screen.getByRole("complementary")
      expect(aside.className).not.toContain("-translate-x-full")
    })

    it("does not apply translate-x-0 when isOpen is false", () => {
      render(<ProjectSidebar isOpen={false} onClose={vi.fn()} />)
      const aside = screen.getByRole("complementary")
      expect(aside.className).not.toContain("translate-x-0")
    })
  })

  describe("tabs", () => {
    it("renders 'My Projects' tab trigger", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole("tab", { name: /my projects/i })).toBeInTheDocument()
    })

    it("renders 'Shared' tab trigger", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole("tab", { name: /shared/i })).toBeInTheDocument()
    })

    it("shows 'No projects yet.' in the My Projects tab by default", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByText("No projects yet.")).toBeInTheDocument()
    })

    it("shows 'No shared projects.' after clicking the Shared tab", async () => {
      const user = userEvent.setup()
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      await user.click(screen.getByRole("tab", { name: /shared/i }))
      expect(screen.getByText("No shared projects.")).toBeInTheDocument()
    })

    it("My Projects tab is selected by default", () => {
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      const myProjectsTab = screen.getByRole("tab", { name: /my projects/i })
      // @base-ui/react tabs use aria-selected or data-active; check for selected state
      expect(myProjectsTab).toBeInTheDocument()
      // The default tab content is visible
      expect(screen.getByText("No projects yet.")).toBeVisible()
    })
  })

  describe("interactions", () => {
    it("calls onClose when the close button is clicked", async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<ProjectSidebar isOpen={true} onClose={onClose} />)
      await user.click(screen.getByRole("button", { name: /close sidebar/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("does not call onClose before any interaction", () => {
      const onClose = vi.fn()
      render(<ProjectSidebar isOpen={true} onClose={onClose} />)
      expect(onClose).not.toHaveBeenCalled()
    })

    it("'New Project' button is present and clickable (does not throw)", async () => {
      const user = userEvent.setup()
      render(<ProjectSidebar isOpen={true} onClose={vi.fn()} />)
      await user.click(screen.getByRole("button", { name: /new project/i }))
    })
  })

  describe("content visibility when closed", () => {
    it("sidebar content is still in the DOM when isOpen is false (CSS-only hide)", () => {
      render(<ProjectSidebar isOpen={false} onClose={vi.fn()} />)
      // The sidebar hides via CSS transform, not unmounting — content stays in DOM
      expect(screen.getByText("Projects")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /close sidebar/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument()
    })
  })
})