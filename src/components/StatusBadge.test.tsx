import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { statusLabels } from "@/lib/labels";

describe("StatusBadge", () => {
  it("renders in_use status", () => {
    render(<StatusBadge status="in_use" />);
    expect(screen.getByText(statusLabels.in_use)).toBeInTheDocument();
  });

  it("renders repair status", () => {
    render(<StatusBadge status="repair" />);
    expect(screen.getByText(statusLabels.repair)).toBeInTheDocument();
  });

  it("renders scrapped status", () => {
    render(<StatusBadge status="scrapped" />);
    expect(screen.getByText(statusLabels.scrapped)).toBeInTheDocument();
  });

  it("renders archived status", () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText(statusLabels.archived)).toBeInTheDocument();
  });

  it("shows raw status key for unknown statuses", () => {
    render(<StatusBadge status="legacy_unknown" />);
    expect(screen.getByText("legacy_unknown")).toBeInTheDocument();
  });
});
