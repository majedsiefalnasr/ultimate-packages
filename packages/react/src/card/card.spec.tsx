import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UCard } from "./card";

describe("UCard", () => {
  it("renders children content", () => {
    render(
      <UCard>
        <div className="card-content">Custom Card Content</div>
      </UCard>
    );
    expect(screen.getByText("Custom Card Content")).toBeInTheDocument();
  });

  it("renders title and subTitle when provided", () => {
    render(<UCard title="Title" subTitle="Subtitle" />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
  });

  it("does not render title/subtitle nodes when unset", () => {
    render(<UCard />);
    expect(document.querySelector(".u-card-title")).toBeNull();
    expect(document.querySelector(".u-card-subtitle")).toBeNull();
  });

  it("renders header and footer nodes", () => {
    render(
      <UCard
        header={<div className="custom-header">Custom Header</div>}
        footer={<div className="custom-footer">Custom Footer</div>}
      >
        Content
      </UCard>
    );
    expect(screen.getByText("Custom Header")).toBeInTheDocument();
    expect(screen.getByText("Custom Footer")).toBeInTheDocument();
  });

  it("applies the root card class", () => {
    const { container } = render(<UCard />);
    expect(container.querySelector(".u-card")).not.toBeNull();
  });
});
