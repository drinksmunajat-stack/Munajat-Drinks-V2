import React, { useState, useEffect } from "react";

interface DuoMascotProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  mood?: "happy" | "talking" | "thinking" | "excited";
  className?: string;
  onClick?: () => void;
}

export default function DuoMascot({
  size = 140,
  isSpeaking = false,
  isListening = false,
  mood = "happy",
  className = "",
  onClick,
}: DuoMascotProps) {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Random natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Talking mouth animation loop when AI speaks
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false);
      return;
    }
    const talkInterval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 140);

    return () => clearInterval(talkInterval);
  }, [isSpeaking]);

  return (
    <div
      onClick={onClick}
      className={`duo-mascot-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        filter: isListening
          ? "drop-shadow(0 10px 25px rgba(16, 185, 129, 0.55))"
          : isSpeaking
          ? "drop-shadow(0 10px 25px rgba(6, 182, 212, 0.55))"
          : "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.25))",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isSpeaking ? "scale(1.04) translateY(-3px)" : "scale(1)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: "visible",
          animation: isListening
            ? "duo-listening-bounce 1.6s ease-in-out infinite"
            : isSpeaking
            ? "duo-talking-wiggle 0.8s ease-in-out infinite"
            : "duo-idle-float 3.5s ease-in-out infinite",
        }}
      >
        <defs>
          {/* Gradients ala Duolingo vibrant 3D look */}
          <linearGradient id="duoBody" x1="20" y1="20" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="duoBelly" x1="45" y1="70" x2="115" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>

          <linearGradient id="duoBeak" x1="65" y1="70" x2="95" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="duoCap" x1="50" y1="10" x2="110" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft shadow under mascot */}
        <ellipse cx="80" cy="152" rx="42" ry="7" fill="rgba(0,0,0,0.22)" />

        {/* Small Feet */}
        <ellipse cx="62" cy="144" rx="14" ry="7" fill="#f59e0b" />
        <ellipse cx="98" cy="144" rx="14" ry="7" fill="#f59e0b" />
        <ellipse cx="62" cy="142" rx="11" ry="5" fill="#fbbf24" />
        <ellipse cx="98" cy="142" rx="11" ry="5" fill="#fbbf24" />

        {/* Wings (Left & Right) */}
        {/* Left Wing */}
        <path
          d={
            isListening
              ? "M28 85 C14 75 12 110 32 112 C38 112 40 98 28 85 Z"
              : "M28 78 C12 85 16 115 34 110 C38 108 36 90 28 78 Z"
          }
          fill="#15803d"
        />
        {/* Right Wing */}
        <path
          d={
            isListening
              ? "M132 85 C146 75 148 110 128 112 C122 112 120 98 132 85 Z"
              : "M132 78 C148 85 144 115 126 110 C122 108 124 90 132 78 Z"
          }
          fill="#15803d"
        />

        {/* Main Body (Curved Oval/Pear shape ala Duo owl) */}
        <path
          d="M80 24 C45 24 30 52 30 92 C30 130 52 144 80 144 C108 144 130 130 130 92 C130 52 115 24 80 24 Z"
          fill="url(#duoBody)"
        />

        {/* Highlight on head */}
        <ellipse cx="78" cy="38" rx="34" ry="12" fill="rgba(255,255,255,0.18)" />

        {/* Cute Feather Tuft on Top */}
        <path d="M72 26 C68 12 76 8 80 14 C84 8 92 12 88 26 Z" fill="#16a34a" />

        {/* Belly Patch (Lighter green with subtle texture) */}
        <path
          d="M80 75 C60 75 50 92 50 114 C50 134 62 142 80 142 C98 142 110 134 110 114 C110 92 100 75 80 75 Z"
          fill="url(#duoBelly)"
        />

        {/* Belly Pattern Feathers */}
        <path d="M72 95 Q80 102 88 95" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />
        <path d="M68 112 Q80 120 92 112" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />
        <path d="M74 126 Q80 132 86 126" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />

        {/* BIG EYES (Duolingo signature look) */}
        {/* Left Eye Socket */}
        <circle cx="56" cy="64" r="22" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))" />
        {/* Right Eye Socket */}
        <circle cx="104" cy="64" r="22" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))" />

        {/* Eye Pupils / Iris */}
        {blink ? (
          // Closed eye happy arcs when blinking
          <>
            <path d="M42 66 Q56 76 70 66" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M90 66 Q104 76 118 66" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            {/* Left Pupil */}
            <circle cx="60" cy="63" r="12" fill="#1e293b" />
            {/* Left Glint 1 & 2 */}
            <circle cx="57" cy="59" r="4.5" fill="#ffffff" />
            <circle cx="64" cy="66" r="2" fill="#ffffff" />

            {/* Right Pupil */}
            <circle cx="100" cy="63" r="12" fill="#1e293b" />
            {/* Right Glint 1 & 2 */}
            <circle cx="97" cy="59" r="4.5" fill="#ffffff" />
            <circle cx="104" cy="66" r="2" fill="#ffffff" />
          </>
        )}

        {/* Cute Pink Cheeks */}
        <ellipse cx="40" cy="78" rx="7" ry="4" fill="#f43f5e" opacity="0.4" />
        <ellipse cx="120" cy="78" rx="7" ry="4" fill="#f43f5e" opacity="0.4" />

        {/* BEAK / MOUTH */}
        {mouthOpen ? (
          // Open talking beak
          <g>
            <path d="M68 73 Q80 62 92 73 L88 92 Q80 98 72 92 Z" fill="url(#duoBeak)" />
            {/* Open mouth inside */}
            <ellipse cx="80" cy="84" rx="7" ry="6" fill="#be123c" />
            {/* Tongue */}
            <ellipse cx="80" cy="87" rx="5" ry="3" fill="#fb7185" />
          </g>
        ) : (
          // Closed cute beak
          <path
            d="M68 73 Q80 64 92 73 Q80 91 68 73 Z"
            fill="url(#duoBeak)"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
          />
        )}

        {/* Barista / Kasir Headset */}
        {/* Headband */}
        <path
          d="M34 50 C38 18 122 18 126 50"
          stroke="#38bdf8"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          filter="url(#softGlow)"
        />
        {/* Left Ear Cushion */}
        <rect x="25" y="44" width="12" height="20" rx="6" fill="#0284c7" />
        {/* Right Ear Cushion */}
        <rect x="123" y="44" width="12" height="20" rx="6" fill="#0284c7" />
        {/* Headset Mic Boom extending to mouth */}
        <path
          d="M128 58 Q130 84 102 88"
          stroke="#0284c7"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mic Tip with glowing LED */}
        <circle cx="100" cy="88" r="4.5" fill={isListening || isSpeaking ? "#10b981" : "#f59e0b"} />
        {(isListening || isSpeaking) && (
          <circle cx="100" cy="88" r="7" fill="#10b981" opacity="0.4" className="animate-ping" />
        )}

        {/* Mini Coffee Cup in Wing when Idle */}
        {!isSpeaking && !isListening && (
          <g transform="translate(112, 94) rotate(12) scale(0.65)">
            <rect x="0" y="4" width="22" height="28" rx="4" fill="#ffffff" />
            <rect x="0" y="0" width="22" height="6" rx="2" fill="#10b981" />
            <circle cx="11" cy="18" r="6" fill="#10b981" />
            {/* Steam lines */}
            <path d="M6 -6 Q8 -12 6 -16" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M14 -4 Q16 -10 14 -14" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}
