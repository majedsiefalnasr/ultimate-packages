import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UCard } from "./card";

describe("UCard", () => {
  describe("pt", () => {
    const pt = {
      root: { id: "card-root", className: "extra-root" },
      header: { "data-test": "header" },
      body: "extra-body",
      title: { "data-test": "title" },
      subTitle: { "data-test": "subTitle" },
      content: { "data-test": "content" },
      footer: { "data-test": "footer" },
    };

    it("applies root pt attributes and keeps the root class and className prop", () => {
      const { container } = render(
        <UCard pt={pt} className="own">
          Body
        </UCard>
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.id).toBe("card-root");
      expect(root.classList.contains("u-card")).toBe(true);
      expect(root.classList.contains("own")).toBe(true);
      expect(root.classList.contains("extra-root")).toBe(true);
      expect(root.getAttribute("data-pc-name")).toBe("card");
      expect(root.getAttribute("data-pc-section")).toBe("root");
    });

    it("applies pt attributes and section datasets to each part", () => {
      const { container } = render(
        <UCard pt={pt} header="H" title="T" subTitle="S" footer="F">
          Body
        </UCard>
      );
      const parts: Record<string, string> = {
        header: ".u-card-header",
        title: ".u-card-title",
        subTitle: ".u-card-subtitle",
        content: ".u-card-content",
        footer: ".u-card-footer",
      };
      for (const [section, selector] of Object.entries(parts)) {
        const element = container.querySelector(selector) as HTMLElement;
        expect(element.getAttribute("data-test")).toBe(section);
        expect(element.getAttribute("data-pc-section")).toBe(section.toLowerCase());
      }
      const body = container.querySelector(".u-card-body") as HTMLElement;
      expect(body.classList.contains("extra-body")).toBe(true);
      expect(body.getAttribute("data-pc-section")).toBe("body");
    });

    it("passes props to pt functions", () => {
      const { container } = render(
        <UCard
          title="T"
          pt={{
            root: ({ props }: { props: { title: string } }) => ({ "data-title": props.title }),
          }}
        />
      );
      expect((container.firstElementChild as HTMLElement).getAttribute("data-title")).toBe("T");
    });
  });

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
