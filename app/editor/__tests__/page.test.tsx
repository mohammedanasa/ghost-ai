import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import EditorPage from "../page"

describe("EditorPage", () => {
  it("renders a main element", () => {
    render(<EditorPage />)
    expect(screen.getByRole("main")).toBeInTheDocument()
  })

  it("applies h-full class to the main element", () => {
    render(<EditorPage />)
    expect(screen.getByRole("main")).toHaveClass("h-full")
  })

  it("applies bg-base class to the main element", () => {
    render(<EditorPage />)
    expect(screen.getByRole("main")).toHaveClass("bg-base")
  })

  it("renders an empty main element (no children)", () => {
    render(<EditorPage />)
    expect(screen.getByRole("main")).toBeEmptyDOMElement()
  })
})