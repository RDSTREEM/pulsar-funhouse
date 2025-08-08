"use client";

import React, { ReactNode, ReactElement, useState, useEffect, cloneElement, isValidElement } from "react";
import Navbar from "./Navbar";

interface ClientWrapperProps {
  children: ReactNode;
}

interface InjectedProps {
  streak: number;
  onPuzzleSolved: () => void;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("daily-streak") : null;
    setStreak(saved ? parseInt(saved) : 0);
  }, []);

  function onPuzzleSolved() {
    setStreak((prev) => {
      const next = prev + 1;
      localStorage.setItem("daily-streak", next.toString());
      return next;
    });
  }

  return (
    <>
      <Navbar streak={streak} />
      {React.Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement<InjectedProps>, { streak, onPuzzleSolved });
        }
        return child;
      })}
    </>
  );
}
