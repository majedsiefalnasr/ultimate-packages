import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import type { SelectionMode } from "@ultimate/uix-data";
import { organizationChartStyleModule } from "./organization-chart-style";

export interface OrganizationChartNodeData {
  label?: string;
  className?: string;
  expanded?: boolean;
  selectable?: boolean;
  children?: OrganizationChartNodeData[];
}

export interface UOrganizationChartProps {
  value: OrganizationChartNodeData[];
  selectionMode?: SelectionMode;
  selection?: OrganizationChartNodeData | OrganizationChartNodeData[] | null;
  onSelectionChange?: (
    selection: OrganizationChartNodeData | OrganizationChartNodeData[] | null
  ) => void;
  className?: string;
}

function OrganizationChartNode({
  node,
  selectionMode,
  selection,
  onSelectionChange,
  cx,
}: {
  node: OrganizationChartNodeData;
  selectionMode?: SelectionMode;
  selection?: UOrganizationChartProps["selection"];
  onSelectionChange?: UOrganizationChartProps["onSelectionChange"];
  cx: (key: string) => string | undefined;
}): React.ReactElement {
  const [expanded, setExpanded] = React.useState(node.expanded ?? false);
  const isSelected =
    selectionMode === "single"
      ? selection === node
      : Array.isArray(selection) && selection.includes(node);

  const handleSelect = (): void => {
    if (!selectionMode || !onSelectionChange || node.selectable === false) return;
    if (selectionMode === "single") {
      onSelectionChange(selection === node ? null : node);
    } else {
      const current = Array.isArray(selection) ? selection : [];
      onSelectionChange(
        current.includes(node) ? current.filter((n) => n !== node) : [...current, node]
      );
    }
  };

  return (
    <div
      className={[cx("node"), node.className].filter(Boolean).join(" ")}
      role="treeitem"
      aria-expanded={node.children?.length ? expanded : undefined}
      aria-selected={selectionMode ? isSelected : undefined}
    >
      <div
        className={cx("nodeContent")}
        data-selected={isSelected || undefined}
        tabIndex={selectionMode ? 0 : undefined}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
          }
        }}
      >
        {node.label}
        {node.children && node.children.length > 0 && (
          <button
            type="button"
            aria-label={"Toggle " + (node.label ?? "node")}
            aria-expanded={expanded}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((e) => !e);
            }}
          >
            {expanded ? "-" : "+"}
          </button>
        )}
      </div>
      {expanded && node.children && node.children.length > 0 && (
        <div className={cx("children")} role="group">
          {node.children.map((child, index) => (
            <OrganizationChartNode
              key={index}
              node={child}
              selectionMode={selectionMode}
              selection={selection}
              onSelectionChange={onSelectionChange}
              cx={cx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function UOrganizationChart({
  value,
  selectionMode,
  selection,
  onSelectionChange,
  className,
}: UOrganizationChartProps): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "organization-chart",
    styleModule: organizationChartStyleModule,
  });
  return (
    <div
      className={cx("root") + (className ? ` ${className}` : "")}
      role="tree"
      aria-label="Organization chart"
      aria-multiselectable={selectionMode === "multiple"}
    >
      {value.map((node, index) => (
        <OrganizationChartNode
          key={index}
          node={node}
          selectionMode={selectionMode}
          selection={selection}
          onSelectionChange={onSelectionChange}
          cx={cx}
        />
      ))}
    </div>
  );
}
