import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import EditorLayout from "../layout"

describe("EditorLayout", () => {
  it("renders children within the layout", () => {
    render(<EditorLayout><div>page content</div></EditorLayout>)
    expect(screen.getByText("page content")).toBeInTheDocument()
  })

  it("renders the editor navbar (from EditorChrome)", () => {
    render(<EditorLayout><div>content</div></EditorLayout>)
    expect(screen.getByRole("banner")).toBeInTheDocument()
  })

  it("renders the project sidebar (from EditorChrome)", () => {
    render(<EditorLayout><div>content</div></EditorLayout>)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
  })

  it("passes multiple children through to EditorChrome", () => {
    render(
      <EditorLayout>
        <span>child one</span>
        <span>child two</span>
      </EditorLayout>
    )
    expect(screen.getByText("child one")).toBeInTheDocument()
    expect(screen.getByText("child two")).toBeInTheDocument()
  })
})