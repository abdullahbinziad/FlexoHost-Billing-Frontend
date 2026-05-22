import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";
import { Package } from "lucide-react";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState icon={Package} title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        icon={Package}
        title="Empty"
        description="Add your first item to get started"
      />
    );
    expect(screen.getByText("Add your first item to get started")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        icon={Package}
        title="Empty"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState icon={Package} title="Empty" />);
    expect(screen.queryByText("Add your first item")).not.toBeInTheDocument();
  });
});
