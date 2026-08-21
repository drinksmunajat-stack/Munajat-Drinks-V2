import React, { useState, useRef, useEffect } from "react";
import { CARD, BORDER } from "../theme";
import { Send, Sparkles, RefreshCw, Coffee, TrendingUp, Package, Star, Mic, Smile, Loader2 } from "lucide-react";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { useTheme } from "../context/ThemeContext";
import { aiSettingsApi } from "../services/api";

interface Message {
  role: "user" | "ai";
  text: string;
  ts: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Top selling drinks today", color: "#8b5cf6" },
  { icon: Coffee,     label: "New menu recommendations", color: "#06b6d4" },
  { icon: Package,    label: "Check raw ingredients stock", color: "#f97316" },
  { icon: Star,       label: "Best customer reviews", color: "#10b981" },
];

const AI_RESPONSES: Record<string, string> = {
  "Top selling drinks today":
    "📊 **Today's Top 3 Beverages:**\n\n1. **Es Kopi Susu Aren** — 42 cups sold (+18% vs yesterday)\n2. **Matcha Latte Signature** — 35 cups sold (+7%)\n3. **Teh Tarik Munajat** — 28 cups sold (steady)\n\n💡 Tip: Es Kopi Susu stock is running low, consider preparing a fresh brew batch soon.",
  "New menu recommendations":
    "☕ **New Menu Recommendations for Munajat Drinks:**\n\n• **Brown Sugar Oat Latte** — Trending in urban hubs, great fit for ages 18–30\n• **Coconut Pandan Frappe** — Local heritage flavors, unique and photogenic\n• **Sparkling Lychee Tea** — Crisp and refreshing option for warm seasons\n\n💡 Fruit-based beverage sales increased by 32% this month.",
  "Check raw ingredients stock":
    "📦 **Ingredients & Raw Material Stock Status:**\n\n🟢 Good condition: Fresh Milk, Organic Palm Sugar, Premium Tea Leaves\n🟡 Low quantity: Uji Matcha Powder (3 days remaining), Caramel Syrup (2 days remaining)\n🔴 Urgent restock: Arabica Espresso Beans (1 day remaining)\n\n⚠️ Please place an order for coffee beans to prevent barista brewing delays tomorrow.",
  "Best customer reviews":
    "⭐ **Customer Review Highlights (Last 7 Days):**\n\n> \"Es Kopi Susu is outstanding! Perfect sweetness balance and rich aroma. Will come back for sure 🔥\" — Rizky P.\n\n> \"Super friendly staff, and the matcha latte is velvety smooth!\" — Dewi K.\n\n> \"Cozy ambience, fast ordering, and very affordable prices. Highly recommended!\" — Budi S.\n\n📈 Average satisfaction rating: **4.9/5** across 128 verified reviews.",
};

function formatText(text: string) {
  return text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
    return <p key={i} style={{ margin: "4px 0", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

function getAIReply(input: string, botName: string): string {
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (input.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return `🤖 I'm here to assist with your beverage business questions! You can ask about:\n• Beverage sales volume & ingredients stock\n• New menu suggestions\n• Verified customer reviews & ratings\n\n${botName} is continuously learning to help Munajat Drinks grow! ☕`;
}

const now = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export default function AIPage() {
  const [botName, setBotName] = useState("Munajat AI");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hello! I am **Munajat AI**, your intelligent assistant for Munajat Drinks ☕\n\nI can help you monitor live sales, analyze ingredients stock, suggest trending beverage ideas, and summarize customer feedback. Ask me anything!", ts: now() },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const { isMobile } = useBreakpoint();
  const { colorMode, transparency } = useTheme();
  const dark = colorMode === "dark";

  useEffect(() => {
    aiSettingsApi.get().then(res => {
      if (res.success && res.data) {
        if (res.data.assistant_name) setBotName(res.data.assistant_name);
        if (res.data.greeting_message) {
          setMessages([
            { role: "ai", text: res.data.greeting_message, ts: now() }
          ]);
        }
      }
    }).catch(err => console.error("Failed to load AI settings in AIPage", err));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim(), ts: now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply = getAIReply(text.trim(), botName);
      setMessages(m => [...m, { role: "ai", text: reply, ts: now() }]);
      setLoading(false);
    }, 1200 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", maxHeight: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}>
              <Sparkles size={16} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: isMobile ? "22px" : "26px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--ph-text)" }}>Munajat AI</h1>
          </div>
          <p style={{ margin: 0, color: "var(--ph-text-muted)", fontSize: "14px" }}>Intelligent conversational assistant for your beverage store</p>
        </div>
        <button
          onClick={() => setMessages([{ role: "ai", text: "Chat reset. Hello again! What would you like to explore today? ☕", ts: now() }])}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: CARD, border: `1px solid ${BORDER}`, color: "var(--ph-text-muted)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
        >
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
        {QUICK_PROMPTS.map(q => (
          <button key={q.label} onClick={() => send(q.label)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "100px", border: `1px solid ${q.color}30`, background: `${q.color}10`, color: q.color, fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = `${q.color}20`; e.currentTarget.style.borderColor = `${q.color}60`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${q.color}10`; e.currentTarget.style.borderColor = `${q.color}30`; }}>
            <q.icon size={14} /> {q.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "4px", minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: "12px", alignItems: "flex-end" }}>
            {/* Avatar */}
            {msg.role === "ai" && (
              <div style={{ width: "36px", height: "36px", flexShrink: 0, borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
                <Sparkles size={16} color="white" />
              </div>
            )}

            {/* Bubble */}
            <div style={{
              maxWidth: "70%", padding: "14px 18px", borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
                : CARD,
              border: msg.role === "ai" ? `1px solid ${BORDER}` : "none",
              color: "var(--ph-text)", fontSize: "14px", lineHeight: 1.6,
              boxShadow: msg.role === "user" ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
            }}>
              <div style={{ marginBottom: "6px" }}>{formatText(msg.text)}</div>
              <div style={{ fontSize: "11px", color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "var(--ph-text-dim)", textAlign: "right" }}>{msg.ts}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <div style={{ width: "36px", height: "36px", flexShrink: 0, borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} color="white" />
            </div>
            <div style={{ padding: "14px 18px", borderRadius: "20px 20px 20px 6px", background: CARD, border: `1px solid ${BORDER}` }}>
              <style>{`@keyframes typing-dot { 0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)} }`}</style>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#8b5cf6", animation: `typing-dot 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────────── */}
      <style>{`
        @keyframes ai-border-glow {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        .ai-send-btn:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 6px 22px rgba(124,58,237,0.55) !important;
        }
        .ai-send-btn:active:not(:disabled) { transform: scale(0.97); }
        .ai-toolbar-btn:hover { background: var(--ai-toolbar-hover) !important; }
        ::placeholder { color: var(--ph-text-muted); opacity: 1; }
      `}</style>

      {/* CSS var for toolbar hover */}
      <style>{`:root { --ai-toolbar-hover: ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}; }`}</style>

      {/* Outer glow wrapper (gradient border trick) */}
      <div style={{
        flexShrink: 0,
        borderRadius: "22px",
        padding: "1.5px",
        background: focused
          ? "linear-gradient(135deg, rgba(124,58,237,0.85) 0%, rgba(6,182,212,0.70) 50%, rgba(79,70,229,0.85) 100%)"
          : dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.10)",
        boxShadow: focused
          ? "0 0 28px rgba(124,58,237,0.22), 0 8px 32px rgba(0,0,0,0.18)"
          : "0 4px 20px rgba(0,0,0,0.08)",
        transition: "background 0.35s ease, box-shadow 0.35s ease",
        animation: focused ? "ai-border-glow 2.5s ease-in-out infinite" : "none",
      }}>
        {/* Inner card */}
        <div style={{
          borderRadius: "21px",
          background: dark
            ? transparency ? "rgba(10,15,35,0.82)" : "rgba(10,15,35,0.97)"
            : transparency ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.99)",
          backdropFilter: transparency ? "blur(32px) saturate(1.8)" : "none",
          WebkitBackdropFilter: transparency ? "blur(32px) saturate(1.8)" : "none",
          overflow: "hidden",
        }}>

          {/* Text row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px 18px 12px" }}>
            {/* AI avatar spark */}
            <div style={{
              width: "32px", height: "32px", flexShrink: 0, marginTop: "2px",
              borderRadius: "10px",
              background: focused
                ? "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)"
                : dark ? "rgba(139,92,246,0.18)" : "rgba(124,58,237,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.35s ease",
              boxShadow: focused ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
            }}>
              <Sparkles size={15} color={focused ? "white" : "#8b5cf6"} />
            </div>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // auto-grow
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask Munajat AI anything..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none",
                color: "var(--ph-text)", fontSize: "15px", outline: "none",
                resize: "none", fontFamily: "inherit", lineHeight: 1.6,
                maxHeight: "160px", overflowY: "auto", paddingTop: "4px",
              }}
            />
          </div>

          {/* Toolbar row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px 12px",
            borderTop: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
          }}>
            {/* Left — secondary actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <button className="ai-toolbar-btn" title="Emoji" style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                <Smile size={16} />
              </button>
              <button className="ai-toolbar-btn" title="Voice" style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", color: "var(--ph-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                <Mic size={16} />
              </button>
              {/* char counter */}
              {input.length > 0 && (
                <span style={{ fontSize: "11px", color: input.length > 400 ? "#f97316" : "var(--ph-text-dim)", marginLeft: "6px", transition: "color 0.2s" }}>
                  {input.length}
                </span>
              )}
            </div>

            {/* Right — hint + send */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {!isMobile && (
                <span style={{ fontSize: "11px", color: "var(--ph-text-dim)", whiteSpace: "nowrap" }}>
                  Shift+Enter for new line
                </span>
              )}
              <button
                className="ai-send-btn"
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: input.trim() ? "9px 18px" : "9px 14px",
                  borderRadius: "12px", border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
                    : dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                  color: input.trim() && !loading ? "white" : "var(--ph-text-dim)",
                  fontSize: "13px", fontWeight: 700,
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: input.trim() && !loading ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
                  overflow: "hidden", whiteSpace: "nowrap",
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                    {!isMobile && "Processing..."}
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    {input.trim() && !isMobile && "Send"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
