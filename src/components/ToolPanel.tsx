// src/components/ToolPanel.tsx
"use client";

import React from "react";
import ActionsPanel from "./ActionsPanel";
import BrushPanel from "./BrushPanel";
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
  isEraserActive: boolean;
  onSelectEraser: () => void;
  quizId: string | null;
  isOwner: boolean;
  onNewQuizSaved: (quizId: string) => void;
}

const ToolPanel = (props: ToolPanelProps) => {
  return (
    <div className="space-y-6">
      <BrushPanel
        activeTool={props.activeTool}
        brushSize={props.brushSize}
        setBrushSize={props.setBrushSize}
        isEraserActive={props.isEraserActive}
        onSelectEraser={props.onSelectEraser}
        disabled={!props.isOwner}
      />
      {props.isOwner && (
        <ActionsPanel
          onClearGrid={props.onClearGrid}
          activityTitle={props.activityTitle}
          colorGroups={props.colorGroups}
          gridState={props.gridState}
          gridSize={props.gridSize}
          quizId={props.quizId}
          onNewQuizSaved={props.onNewQuizSaved}
          isOwner={props.isOwner}
        />
      )}
    </div>
  );
};

export default ToolPanel;
