"use client";
import { useState, useCallback } from "react";

export const useHistory = <T>(initialState: T) => {
  const [state, setStateInternal] = useState({
    history: [initialState],
    index: 0,
  });

  // useCallback com array de dependências vazio torna estas funções estáveis, quebrando o loop.
  const setState = useCallback(
    (action: T | ((prevState: T) => T), overwrite = false) => {
      setStateInternal((currentState) => {
        const currentHistoryState = currentState.history[currentState.index];
        const newState =
          typeof action === "function"
            ? (action as (prevState: T) => T)(currentHistoryState)
            : action;

        if (
          !overwrite &&
          JSON.stringify(newState) === JSON.stringify(currentHistoryState)
        ) {
          return currentState;
        }

        const newHistory = overwrite
          ? [newState]
          : currentState.history.slice(0, currentState.index + 1);
        newHistory.push(newState);

        return {
          history: newHistory,
          index: newHistory.length - 1,
        };
      });
    },
    []
  );

  const undo = useCallback(() => {
    setStateInternal((currentState) => {
      if (currentState.index > 0) {
        return { ...currentState, index: currentState.index - 1 };
      }
      return currentState;
    });
  }, []);

  const redo = useCallback(() => {
    setStateInternal((currentState) => {
      if (currentState.index < currentState.history.length - 1) {
        return { ...currentState, index: currentState.index + 1 };
      }
      return currentState;
    });
  }, []);

  return {
    state: state.history[state.index],
    setState,
    undo,
    redo,
  };
};
