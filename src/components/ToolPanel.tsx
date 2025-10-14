// src/components/ToolPanel.tsx
"use client";

import React from "react";
import ActionsPanel from "./ActionsPanel";
import BrushPanel from "./BrushPanel";
import type { Question, ActiveTool } from "@/lib/types"; // Importa Question

interface ToolPanelProps {
  onClearGrid: () => void;
  activityTitle: string;
  questions: Question[]; // Alterado de colorGroups para questions
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
  categoryId: string | undefined;
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

      <ActionsPanel
        onClearGrid={props.onClearGrid}
        activityTitle={props.activityTitle}
        questions={props.questions} // Passa a nova prop 'questions'
        gridState={props.gridState}
        gridSize={props.gridSize}
        quizId={props.quizId}
        onNewQuizSaved={props.onNewQuizSaved}
        isOwner={props.isOwner}
        categoryId={props.categoryId}
      />
    </div>
  );
};

export default ToolPanel;
