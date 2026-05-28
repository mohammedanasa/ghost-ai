import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { EditorChrome } from "../editor-chrome"

describe("EditorChrome", () => {
  describe("structure", () => {
    it("renders the navbar", () => {
      render(<EditorChrome><div>child</div></EditorChrome>)
      expect(screen.getByRole("banner")).toBeInTheDocument()
    })

    it("renders the sidebar", () => {
      render(<EditorChrome><div>child</div></EditorChrome>)
      expect(screen.getByRole("complementary")).toBeInTheDocument()
    })

    it("renders children", () => {
      render(<EditorChrome><div>child content</div></EditorChrome>)
      expect(screen.getByText("child content")).toBeInTheDocument()
    })

    it("renders null children without error", () => {
      render(<EditorChrome>{null}</EditorChrome>)
      expect(screen.getByRole("banner")).toBeInTheDocument()
    })

    it("renders multiple children", () => {
      render(
        <EditorChrome>
          <span>first</span>
          <span>second</span>
        </EditorChrome>
      )
      expect(screen.getByText("first")).toBeInTheDocument()
      expect(screen.getByText("second")).toBeInTheDocument()
    })
  })

  describe("sidebar initial state", () => {
    it("sidebar starts closed (has -translate-x-full class)", () => {
      render(<EditorChrome><div>child</div></EditorChrome>)
      const sidebar = screen.getByRole("complementary")
      expect(sidebar.className).toContain("-translate-x-full")
    })

    it("sidebar toggle button is present in the navbar", () => {
      render(<EditorChrome><div>child</div></EditorChrome>)
      expect(screen.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument()
    })
  })

  describe("sidebar open/close interaction", () => {
    it("opens the sidebar when the toggle button is clicked", async () => {
      const user = userEvent.setup()
      render(<EditorChrome><div>child</div></EditorChrome>)
      await user.click(screen.getByRole("button", { name: /toggle sidebar/i }))
      const sidebar = screen.getByRole("complementary")
      expect(sidebar.className).toContain("translate-x-0")
      expect(sidebar.className).not.toContain("-translate-x-full")
    })

    it("closes the sidebar when toggle button is clicked a second time", async () => {
      const user = userEvent.setup()
      render(<EditorChrome><div>child</div></EditorChrome>)
      const toggleButton = screen.getByRole("button", { name: /toggle sidebar/i })
      await user.click(toggleButton)
      await user.click(toggleButton)
      const sidebar = screen.getByRole("complementary")
      expect(sidebar.className).toContain("-translate-x-full")
    })

    it("closes the sidebar when the sidebar close button is clicked", async () => {
      const user = userEvent.setup()
      render(<EditorChrome><div>child</div></EditorChrome>)
      // Open first
      await user.click(screen.getByRole("button", { name: /toggle sidebar/i }))
      // Now close via the sidebar's own close button
      await user.click(screen.getByRole("button", { name: /close sidebar/i }))
      const sidebar = screen.getByRole("complementary")
      expect(sidebar.className).toContain("-translate-x-full")
    })

    it("toggles sidebar open and closed multiple times", async () => {
      const user = userEvent.setup()
      render(<EditorChrome><div>child</div></EditorChrome>)
      const toggleButton = screen.getByRole("button", { name: /toggle sidebar/i })
      const sidebar = screen.getByRole("complementary")

      await user.click(toggleButton)
      expect(sidebar.className).toContain("translate-x-0")

      await user.click(toggleButton)
      expect(sidebar.className).toContain("-translate-x-full")

      await user.click(toggleButton)
      expect(sidebar.className).toContain("translate-x-0")
    })

    it("sidebar is already closed when close button clicked from already-closed state", async () => {
      // Edge case: onClose called when sidebar is already closed keeps it closed
      const user = userEvent.setup()
      render(<EditorChrome><div>child</div></EditorChrome>)
      // Do NOT open sidebar first — directly click the close button
      await user.click(screen.getByRole("button", { name: /close sidebar/i }))
      const sidebar = screen.getByRole("complementary")
      expect(sidebar.className).toContain("-translate-x-full")
    })
  })

  describe("children rendering alongside sidebar state", () => {
    it("children are visible regardless of sidebar state", async () => {
      const user = userEvent.setup()
      render(<EditorChrome><main data-testid="editor-content">content</main></EditorChrome>)
      expect(screen.getByTestId("editor-content")).toBeInTheDocument()
      await user.click(screen.getByRole("button", { name: /toggle sidebar/i }))
      expect(screen.getByTestId("editor-content")).toBeInTheDocument()
    })
  })
})