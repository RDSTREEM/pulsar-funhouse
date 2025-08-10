"use client";
import InteractiveBackground from "./InteractiveBackground";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <InteractiveBackground>
      {children}
    </InteractiveBackground>
  );
}
