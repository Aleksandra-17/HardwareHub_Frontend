import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { statusLabels } from "@/lib/mock-data";

describe("StatusBadge", () => {
  it("renders in_use status", () => {
    render(<StatusBadge status="in_use" />);
    expect(screen.getByText(statusLabels.in_use)).toBeInTheDocument();
  });

  it("renders reserve status", () => {
    render(<StatusBadge status="reserve" />);
    expect(screen.getByText(statusLabels.reserve)).toBeInTheDocument();
  });

  it("renders decommissioned status", () => {
    render(<StatusBadge status="decommissioned" />);
    expect(screen.getByText(statusLabels.decommissioned)).toBeInTheDocument();
  });

  it("renders repair status", () => {
    render(<StatusBadge status="repair" />);
    expect(screen.getByText(statusLabels.repair)).toBeInTheDocument();
  });
});
