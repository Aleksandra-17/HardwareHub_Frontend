import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";
import { BarChart3 } from "lucide-react";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(
      <StatCard title="Total Devices" value={42} icon={BarChart3} />
    );
    expect(screen.getByText("Total Devices")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(
      <StatCard title="Status" value="Active" icon={BarChart3} />
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <StatCard
        title="Stats"
        value={10}
        icon={BarChart3}
        description="Last 30 days"
      />
    );
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(
      <StatCard title="Stats" value={10} icon={BarChart3} />
    );
    expect(screen.queryByText("Last 30 days")).not.toBeInTheDocument();
  });

  it("renders icon", () => {
    const { container } = render(
      <StatCard title="Stats" value={10} icon={BarChart3} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
