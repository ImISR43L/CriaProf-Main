// src/components/ToolPanel.tsx
"use client";

import React from "react";
import ActionsPanel from "./ActionsPanel";
import BrushPanel from "./BrushPanel";
import GridSizeSelector from "./GridSizeSelector";
import type { ColorGroup, ActiveTool } from "@/lib/types";

interface ToolPanelProps {
  onClearGrid: () => void;
  activityTitle: string;
  colorGroups: ColorGroup[];
  gridState: string[];
  gridSize: number;
  activeTool: ActiveTool | null;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraserActive: boolean; // Nova prop
  onSelectEraser: () => void; // Nova prop
}

const ToolPanel = (props: ToolPanelProps) => {
  // A prop handleGridSizeChange foi removida pois não é mais passada
  return (
    <div className="space-y-6">
      {/* O GridSizeSelector já não está aqui */}
      <BrushPanel
        activeTool={props.activeTool}
        brushSize={props.brushSize}
        setBrushSize={props.setBrushSize}
        isEraserActive={props.isEraserActive}
        onSelectEraser={props.onSelectEraser}
      />
      <ActionsPanel
        onClearGrid={props.onClearGrid}
        activityTitle={props.activityTitle}
        colorGroups={props.colorGroups}
        gridState={props.gridState}
        gridSize={props.gridSize}
      />
    </div>
  );
};

export default ToolPanel;