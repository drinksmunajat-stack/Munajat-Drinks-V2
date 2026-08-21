import React, { createContext, useContext, useState, useEffect } from "react";

export type BgMode = "animated" | "static";
export type ColorMode = "dark" | "light";

interface ThemeCtx {
  bgMode: BgMode;
  setBgMode: (m: BgMode) => void;
  transparency: boolean;
  setTransparency: (v: boolean) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  bgMode: "animated",
  setBgMode: () => {},
  transparency: true,
  setTransparency: () => {},
  colorMode: "dark",
  setColorMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function buildCss(colorMode: ColorMode, transparency: boolean): string {
  const dark = colorMode === "dark";

  const cardOpacity = dark
    ? transparency ? "0.40" : "0.90"
    : transparency ? "0.50" : "0.92";

  const sidebarOpacity = dark
    ? transparency ? "0.45" : "0.96"
    : transparency ? "0.55" : "0.97";

  const vars = dark
    ? `
      --ph-bg: #070d1f;
      --ph-card: rgba(13,19,44,${cardOpacity});
      --ph-border: rgba(255,255,255,0.08);
      --ph-sidebar: rgba(10,15,35,${sidebarOpacity});
      --ph-text: #ffffff;
      --ph-text-secondary: #e2e8f0;
      --ph-text-muted: #94a3b8;
      --ph-text-dim: #64748b;
      --ph-input-bg: rgba(0,0,0,0.30);
      --ph-scrollbar-thumb: rgba(255,255,255,0.12);
    `
    : `
      --ph-bg: #f1f5f9;
      --ph-card: rgba(255,255,255,${cardOpacity});
      --ph-border: rgba(0,0,0,0.08);
      --ph-sidebar: rgba(255,255,255,${sidebarOpacity});
      --ph-text: #0f172a;
      --ph-text-secondary: #1e293b;
      --ph-text-muted: #64748b;
      --ph-text-dim: #94a3b8;
      --ph-input-bg: rgba(0,0,0,0.05);
      --ph-scrollbar-thumb: rgba(0,0,0,0.14);
    `;

  const glass = transparency
    ? `backdrop-filter: blur(28px) saturate(1.8); -webkit-backdrop-filter: blur(28px) saturate(1.8);`
    : `backdrop-filter: none; -webkit-backdrop-filter: none;`;

  const optionBg = dark ? "#0f172a" : "#ffffff";
  const optionColor = dark ? "#ffffff" : "#0f172a";

  return `
    :root {
      ${vars}
      color-scheme: ${dark ? "dark" : "light"};
    }
    .ph-glass { ${glass} }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--ph-scrollbar-thumb); border-radius: 3px; }
    select {
      color-scheme: ${dark ? "dark" : "light"};
    }
    select option, select optgroup {
      background-color: ${optionBg} !important;
      color: ${optionColor} !important;
    }
  `;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [bgMode, setBgModeState] = useState<BgMode>(() =>
    (localStorage.getItem("ph-bg-mode") as BgMode) ?? "animated"
  );
  const [transparency, setTransparencyState] = useState<boolean>(() =>
    localStorage.getItem("ph-transparency") !== "false"
  );
  const [colorMode, setColorModeState] = useState<ColorMode>(() =>
    (localStorage.getItem("ph-color-mode") as ColorMode) ?? "dark"
  );

  const setBgMode = (m: BgMode) => { setBgModeState(m); localStorage.setItem("ph-bg-mode", m); };
  const setTransparency = (v: boolean) => { setTransparencyState(v); localStorage.setItem("ph-transparency", String(v)); };
  const setColorMode = (m: ColorMode) => { setColorModeState(m); localStorage.setItem("ph-color-mode", m); };

  const css = buildCss(colorMode, transparency);

  return (
    <ThemeContext.Provider value={{ bgMode, setBgMode, transparency, setTransparency, colorMode, setColorMode }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </ThemeContext.Provider>
  );
}
