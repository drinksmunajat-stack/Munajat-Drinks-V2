import React, { useEffect, useRef, useState } from "react";

interface Props {
  locationKey: string;
  children: React.ReactNode;
}

export default function PageTransition({ locationKey, children }: Props) {
  const [displayKey, setDisplayKey] = useState(locationKey);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (locationKey === displayKey) return;
    // start exit
    setPhase("exit");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayKey(locationKey);
      setPhase("enter");
      timerRef.current = setTimeout(() => setPhase("idle"), 320);
    }, 180);
    return () => clearTimeout(timerRef.current);
  }, [locationKey]);

  const style: React.CSSProperties =
    phase === "exit"
      ? { opacity: 0, transform: "translateY(-8px) scale(0.99)", transition: "opacity 0.18s ease, transform 0.18s ease", pointerEvents: "none" }
      : phase === "enter"
      ? { opacity: 0, transform: "translateY(12px)", animation: "ph-page-enter 0.32s cubic-bezier(0.22,1,0.36,1) forwards" }
      : { opacity: 1, transform: "none" };

  return (
    <>
      <style>{`
        @keyframes ph-page-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div key={displayKey} style={{ height: "100%", ...style }}>
        {children}
      </div>
    </>
  );
}
