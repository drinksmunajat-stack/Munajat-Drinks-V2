import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Mic, MicOff, PhoneOff, Volume2, VolumeX,
  RefreshCw, ShoppingCart, Trash2, Plus, Minus,
  CheckCircle, Receipt, TrendingUp, Users, Coffee,
  Package, Star, Zap, Clock, ShieldCheck, Maximize2, Sparkles,
  Layers, Snowflake, Flame, ArrowRight, ArrowLeft, Check, QrCode,
  Activity, Radio, PhoneCall, Volume1, Waves, UserCheck, User, Store, MapPin, Loader2,
  Printer, MessageSquare, Send, Share2, ExternalLink, FileText, CheckCheck
} from "lucide-react";
import { useBreakpoint } from "../hooks/use-breakpoint";
import DuoMascot from "../components/DuoMascot";
import { productsApi, orderCodesApi, cabangsApi, iceLevelsApi, toppingsApi } from "../services/api";

/* ═══════════════════ TYPES ═════════════════════ */
type CallState = "idle" | "connecting" | "active" | "ai-speaking" | "user-speaking" | "ended";
type OrderStep = "welcome" | "branch" | "name" | "menu" | "ice" | "sugar" | "topping" | "confirm" | "completed";

export interface MenuItem {
  no: number;
  id: number;
  emoji: string;
  name: string;
  price: number;
  sold: number;
  tag?: string;
  cat?: string;
}

export interface CabangOption {
  no: number;
  id: number;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  emoji: string;
}

export interface IceOption {
  no: number;
  id: string;
  label: string;
  desc: string;
  percentage: number;
  emoji: string;
}

export interface ToppingOption {
  no: number;
  id: string;
  label: string;
  price: number;
  emoji: string;
}

export interface CustomOrderItem {
  id: string;
  menu: MenuItem;
  qty: number;
  iceLevel: string;
  sugarLevel: string;
  topping: string;
  toppingPrice: number;
  totalItemPrice: number;
}

const SUGAR_OPTIONS = [
  { no: 1, id: "Normal Sugar (100%)", label: "Normal Sugar", desc: "Standard Sweetness (100%)", emoji: "🍬" },
  { no: 2, id: "Less Sugar (50%)", label: "Less Sugar", desc: "Medium Sweetness (50%)", emoji: "🍯" },
  { no: 3, id: "Low Sugar (25%)", label: "Low Sugar", desc: "Slightly Sweet (25%)", emoji: "🌱" },
  { no: 4, id: "No Sugar (0%)", label: "No Sugar", desc: "Unsweetened (0%)", emoji: "🍃" },
];

const fmt = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const ts = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

// Authentic Voice Interaction Chime Generator using Web Audio API
function playVoiceChime(type: "start" | "done" | "tap" | "mic-open" = "start") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "mic-open") {
      // Crisp pleasant double-beep signaling User's Turn to speak (F#5 740Hz -> A5 880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(739.99, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.08);
      osc2.start(ctx.currentTime + 0.07);
      osc2.stop(ctx.currentTime + 0.22);
    } else if (type === "start") {
      // Dual ascending chime (C5 523Hz -> E5 659Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.12);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.28);
    } else if (type === "done") {
      // Completion chime (E5 659Hz -> C5 523Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.12);
      osc2.start(ctx.currentTime + 0.09);
      osc2.stop(ctx.currentTime + 0.32);
    } else {
      // Crisp subtle tap feedback
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) { }
}

// Clean user input name
function extractNameFromSpeech(speech: string): string {
  let cleaned = speech.trim();
  cleaned = cleaned.replace(/^(hello|hi|my name is|i am|this is|call me|name is|i'm|halo|hai|nama saya|nama aku|saya|aku|dengan|atas nama|panggil saya)\s+/gi, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Parse spoken numbers (Digits 1-20, English words, Indonesian words, prefixes)
function parseSpokenNumber(text: string): number | null {
  const clean = text.toLowerCase().trim();

  // 1. Explicit prefixes: "number 1", "nomor 2", "no 3", "option 4", "pilih 2", "angka 1", "#1"
  const prefixMatch = clean.match(/(?:number|nomor|no|option|pilihan|pilih|item|angka|menu|cabang|toping|topping|es|gula|sugar|ice|#)\s*([0-9]+)/i);
  if (prefixMatch && prefixMatch[1]) {
    const n = parseInt(prefixMatch[1], 10);
    if (!isNaN(n) && n > 0 && n <= 30) return n;
  }

  // 2. Direct digits 1-30
  const digitMatch = clean.match(/\b([0-9]{1,2})\b/);
  if (digitMatch && digitMatch[1]) {
    const n = parseInt(digitMatch[1], 10);
    if (!isNaN(n) && n > 0 && n <= 30) return n;
  }

  // 3. Word mapping for English & Indonesian
  const wordMap: Record<string, number> = {
    "one": 1, "first": 1, "satu": 1, "kesatu": 1, "pertama": 1, "uno": 1, "won": 1, "wan": 1,
    "two": 2, "second": 2, "dua": 2, "kedua": 2, "to": 2, "too": 2, "tu": 2,
    "three": 3, "third": 3, "tiga": 3, "ketiga": 3, "tree": 3, "tri": 3,
    "four": 4, "fourth": 4, "empat": 4, "keempat": 4, "for": 4, "fore": 4,
    "five": 5, "fifth": 5, "lima": 5, "kelima": 5, "faiv": 5,
    "six": 6, "sixth": 6, "enam": 6, "keenam": 6, "siks": 6,
    "seven": 7, "seventh": 7, "tujuh": 7, "ketujuh": 7,
    "eight": 8, "eighth": 8, "delapan": 8, "kedelapan": 8, "ate": 8, "eit": 8,
    "nine": 9, "ninth": 9, "sembilan": 9, "kesembilan": 9, "nain": 9,
    "ten": 10, "tenth": 10, "sepuluh": 10, "kesepuluh": 10,
    "eleven": 11, "sebelas": 11,
    "twelve": 12, "duabelas": 12,
  };

  const words = clean.split(/[\s,.-]+/);
  for (const w of words) {
    if (wordMap[w] !== undefined) {
      return wordMap[w];
    }
  }

  return null;
}

export default function VoiceKasirPage({ standalone = true }: { standalone?: boolean }) {
  const { isMobile } = useBreakpoint();

  // Entities loaded from backend
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [cabangList, setCabangList] = useState<CabangOption[]>([]);
  const [iceList, setIceList] = useState<IceOption[]>([]);
  const [toppingList, setToppingList] = useState<ToppingOption[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Active 6 Parameters
  const [selectedCabangId, setSelectedCabangId] = useState<number | undefined>(undefined);
  const [selectedCabangName, setSelectedCabangName] = useState<string>("");
  const [selectedCabangPhone, setSelectedCabangPhone] = useState<string>("+62 811 868 3080");
  const [selectedCabangAddress, setSelectedCabangAddress] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [selectedIce, setSelectedIce] = useState<string>("");
  const [selectedSugar, setSelectedSugar] = useState<string>("");
  const [selectedTopping, setSelectedTopping] = useState<string>("");

  const [currentStep, setCurrentStep] = useState<OrderStep>("welcome");
  const [callState, setCallState] = useState<CallState>("idle");
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [textInputSpeech, setTextInputSpeech] = useState<string>("");

  // Real-time Conversation Subtitles
  const [aiSpokenText, setAiSpokenText] = useState<string>("Hello! I am your AI Voice Cashier for Munajat Drinks. Tap the microphone or mascot to start ordering your favorite drink.");
  const [userSpokenText, setUserSpokenText] = useState<string>("");

  // Cart, Order Tracking & Receipt
  const [cartItems, setCartItems] = useState<CustomOrderItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>("");
  const [orderTimestamp, setOrderTimestamp] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isCallActiveRef = useRef<boolean>(false);
  const isAiSpeakingRef = useRef<boolean>(false);
  const lastProcessedTextRef = useRef<string>("");
  const silenceTimerRef = useRef<any>(null);

  // Set Page Title
  useEffect(() => {
    document.title = "AI Voice Cashier | Munajat Drinks";
  }, []);

  // Sync active status
  useEffect(() => {
    isCallActiveRef.current = (callState === "active" || callState === "ai-speaking" || callState === "user-speaking");
  }, [callState]);

  // Load all authentic database entities (Products, Cabangs, Ice Levels, Toppings)
  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      productsApi.getAll(),
      cabangsApi.getAll(),
      iceLevelsApi.getAll(),
      toppingsApi.getAll(),
    ]).then(([prodRes, cabRes, iceRes, topRes]) => {
      // 1. Map Products from Database
      if (prodRes.success && Array.isArray(prodRes.data)) {
        const dynamicMenus: MenuItem[] = prodRes.data.map((p, idx) => ({
          no: idx + 1,
          id: p.id,
          emoji: p.category === "Kopi" || p.category === "Coffee" ? "☕" : p.category === "Non-Kopi" || p.category === "Non-Coffee" ? "🍵" : p.category === "Frappe" ? "🥥" : "🍹",
          name: p.name,
          price: Number(p.price || 0),
          sold: Number(p.stock) > 0 ? 25 + (idx * 5) : 0,
          tag: p.badge || (idx === 0 ? "Best Seller" : idx === 1 ? "Favorite" : undefined),
          cat: p.category || "Coffee",
        }));
        setMenuList(dynamicMenus);
      }

      // 2. Map Cabangs from Database
      if (cabRes.success && Array.isArray(cabRes.data)) {
        const dynamicCabangs: CabangOption[] = cabRes.data.map((c, idx) => ({
          no: idx + 1,
          id: c.id,
          name: c.name,
          city: c.city || "Indonesia",
          address: c.address || "Official Munajat Drinks Outlet",
          phone: (c.phone && c.phone.trim().length >= 8) ? c.phone.trim() : "+62 811 868 3080",
          emoji: idx === 0 ? "🏪" : idx === 1 ? "🏬" : idx === 2 ? "🏢" : "🌇"
        }));
        setCabangList(dynamicCabangs);
      }

      // 3. Map Ice Levels from Database
      if (iceRes.success && Array.isArray(iceRes.data) && iceRes.data.length > 0) {
        const dynamicIces: IceOption[] = iceRes.data.map((i, idx) => ({
          no: idx + 1,
          id: `${i.name} (${i.percentage}%)`,
          label: i.name,
          desc: i.description || `${i.percentage}% Ice Ratio`,
          percentage: Number(i.percentage),
          emoji: Number(i.percentage) === 0 ? "🥤" : Number(i.percentage) <= 30 ? "❄️" : Number(i.percentage) <= 70 ? "🧊" : "🧊🧊"
        }));
        setIceList(dynamicIces);
      } else {
        const defaultIces: IceOption[] = [
          { no: 1, id: "Normal Ice (70%)", label: "Normal Ice", desc: "Standard (70%)", percentage: 70, emoji: "🧊" },
          { no: 2, id: "Less Ice (30%)", label: "Less Ice", desc: "Light Ice (30%)", percentage: 30, emoji: "❄️" },
          { no: 3, id: "No Ice (0%)", label: "No Ice", desc: "Unchilled (0%)", percentage: 0, emoji: "🥤" },
          { no: 4, id: "Extra Ice (100%)", label: "Extra Ice", desc: "Max Chill (100%)", percentage: 100, emoji: "🧊🧊" },
        ];
        setIceList(defaultIces);
      }

      // 4. Map Toppings from Database
      if (topRes.success && Array.isArray(topRes.data) && topRes.data.length > 0) {
        const dynamicTops: ToppingOption[] = topRes.data.map((t, idx) => ({
          no: idx + 1,
          id: t.name,
          label: t.name,
          price: Number(t.price || 0),
          emoji: t.emoji || (idx === 0 ? "🟤" : idx === 1 ? "🧀" : idx === 2 ? "🍮" : "⬛")
        }));
        dynamicTops.push({
          no: dynamicTops.length + 1,
          id: "No Topping",
          label: "No Topping",
          price: 0,
          emoji: "🚫"
        });
        setToppingList(dynamicTops);
      } else {
        const defaultTops: ToppingOption[] = [
          { no: 1, id: "Golden Boba Pearl", label: "Golden Boba", price: 5000, emoji: "🟤" },
          { no: 2, id: "Cheese Cream Foam", label: "Cheese Foam", price: 7000, emoji: "🧀" },
          { no: 3, id: "Egg Pudding Lembut", label: "Egg Pudding", price: 6000, emoji: "🍮" },
          { no: 4, id: "Grass Jelly (Cincau)", label: "Grass Jelly", price: 4000, emoji: "⬛" },
          { no: 5, id: "No Topping", label: "No Topping", price: 0, emoji: "🚫" },
        ];
        setToppingList(defaultTops);
      }
    }).catch(err => {
      console.error("Error loading database records for Voice Kasir", err);
    }).finally(() => {
      setLoadingData(false);
    });
  }, []);

  // Explicitly activate User's Turn to speak with audio cue and mic ignition
  const activateUserListeningTurn = useCallback(() => {
    isAiSpeakingRef.current = false;
    setCallState("user-speaking");
    playVoiceChime("mic-open");

    setTimeout(() => {
      if (isCallActiveRef.current && !muted && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) { }
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) { }
        }, 100);
      }
    }, 150);
  }, [muted]);

  // Text-to-Speech Output Function (Natural voice call interaction)
  const speakAiVoice = useCallback((textToSpeak: string) => {
    if (speakerOff) {
      activateUserListeningTurn();
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();

        const cleanText = textToSpeak.replace(/[^\w\s.,?!Rp$]/gi, " ").replace(/\s+/g, " ").trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => (v.lang === "en-US" || v.lang === "en_US") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Jenny")))
          || voices.find(v => v.lang.startsWith("en") || v.lang.startsWith("EN"))
          || voices[0];

        if (engVoice) {
          utterance.voice = engVoice;
        }

        utterance.onstart = () => {
          isAiSpeakingRef.current = true;
          setCallState("ai-speaking");
          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
          }
        };

        utterance.onend = () => {
          // Switch turn immediately to User with cue and mic activation
          activateUserListeningTurn();
        };

        utterance.onerror = () => {
          activateUserListeningTurn();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis notice:", err);
        activateUserListeningTurn();
      }
    } else {
      activateUserListeningTurn();
    }
  }, [speakerOff, activateUserListeningTurn]);

  // Setup Real Hardware Mic Metering via Web Audio API
  const setupAudioMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!isCallActiveRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn("Microphone stream notice:", err);
    }
  };

  // Helper to ask the next logical missing parameter (Rule 1 & 2: Short 1-2 sentences, voice-first)
  const askNextMissingParameter = useCallback((
    branchIdVal?: number,
    branchNameVal?: string,
    nameVal?: string,
    menuVal?: MenuItem | null,
    iceVal?: string,
    sugarVal?: string,
    toppingVal?: string
  ) => {
    // 1. Missing Branch?
    if (!branchIdVal && !branchNameVal) {
      setCurrentStep("branch");
      const msg = "Hello! Welcome to Munajat Drinks. Say the branch number 1 to 4, or mention your branch and name.";
      setAiSpokenText(msg);
      speakAiVoice(msg);
      return;
    }

    // 2. Missing Name?
    if (!nameVal) {
      setCurrentStep("name");
      const msg = `Great, at ${branchNameVal || 'our store'}. What name may I have for your order?`;
      setAiSpokenText(msg);
      speakAiVoice(msg);
      return;
    }

    // 3. Missing Menu?
    if (!menuVal) {
      setCurrentStep("menu");
      const count = menuList.length > 0 ? menuList.length : 8;
      const msg = `Hi ${nameVal}! Which drink would you like? Say drink number 1 to ${count}, or mention the drink name.`;
      setAiSpokenText(msg);
      speakAiVoice(msg);
      return;
    }

    // 4. Missing Ice?
    if (!iceVal) {
      setCurrentStep("ice");
      const msg = `Sure, 1 ${menuVal.name}. What ice level? Say 1 for Normal Ice, 2 for Less Ice, 3 for No Ice, or 4 for Extra Ice.`;
      setAiSpokenText(msg);
      speakAiVoice(msg);
      return;
    }

    // 5. Missing Sugar?
    if (!sugarVal) {
      setCurrentStep("sugar");
      const msg = `Got it ${nameVal}. What sweetness level? Say 1 for Normal Sugar 100%, 2 for Less Sugar 50%, 3 for Low Sugar 25%, or 4 for No Sugar.`;
      setAiSpokenText(msg);
      speakAiVoice(msg);
      return;
    }

    // 6. Missing Topping?
    if (!toppingVal) {
      setCurrentStep("topping");
      const msg = `Great ${nameVal}. What topping? Say 1 for Boba, 2 for Cheese Foam, 3 for Egg Pudding, 4 for Grass Jelly, or 5 for No Topping.`;
      setAiSpokenText(msg);
      speakAiVoice(msg);
      return;
    }

    // Rule 5: Konfirmasi Akhir (All 6 parameters filled for current beverage)
    const toppingObj = toppingList.find(t => t.id === toppingVal) || { price: 0, label: toppingVal };
    const totalItem = menuVal.price + toppingObj.price;
    const finalItem: CustomOrderItem = {
      id: `${menuVal.name}-${Date.now()}`,
      menu: menuVal,
      qty: 1,
      iceLevel: iceVal,
      sugarLevel: sugarVal,
      topping: toppingVal,
      toppingPrice: toppingObj.price,
      totalItemPrice: totalItem,
    };

    const updatedCart = [...cartItems, finalItem];
    setCartItems(updatedCart);
    setCurrentStep("confirm");

    const totalCart = updatedCart.reduce((sum, item) => sum + item.totalItemPrice * item.qty, 0);
    const countDrinks = updatedCart.length;

    let finalMsg = "";
    if (countDrinks === 1) {
      finalMsg = `Great ${nameVal}, 1 ${menuVal.name} with ${iceVal}, ${sugarVal}, and ${toppingVal} at ${branchNameVal}, total ${fmt(totalCart)}. Say 1 to confirm payment via WhatsApp, or 2 to add another drink.`;
    } else {
      const summaryList = updatedCart.map(i => i.menu.name).join(", ");
      finalMsg = `Awesome ${nameVal}! You have ${countDrinks} drinks in your order: ${summaryList}, grand total ${fmt(totalCart)}. Say 1 to confirm payment via WhatsApp, or 2 to add another drink.`;
    }

    setAiSpokenText(finalMsg);
    speakAiVoice(finalMsg);
  }, [toppingList, menuList, cartItems, speakAiVoice]);

  // Handler to add another drink to order
  const handleAddAnotherDrink = () => {
    playVoiceChime("tap");
    setSelectedMenu(null);
    setSelectedIce("");
    setSelectedSugar("");
    setSelectedTopping("");
    setCurrentStep("menu");
    const count = menuList.length > 0 ? menuList.length : 8;
    const nextNum = cartItems.length + 1;
    const msg = `Sure ${customerName || ''}! Let's customize drink #${nextNum}. Say drink number 1 to ${count} or mention the beverage name.`;
    setAiSpokenText(msg);
    speakAiVoice(msg);
  };

  // UI Sync Triggers: when user clicks on screen, accept state and ask next question
  const handleSelectBranch = (cabang: CabangOption) => {
    setSelectedCabangId(cabang.id);
    setSelectedCabangName(cabang.name);
    const validPhone = (cabang.phone && cabang.phone.trim().length >= 8) ? cabang.phone.trim() : "+62 811 868 3080";
    setSelectedCabangPhone(validPhone);
    if (cabang.address) setSelectedCabangAddress(cabang.address);
    setUserSpokenText(`Branch: [${cabang.no}] ${cabang.name}`);
    askNextMissingParameter(cabang.id, cabang.name, customerName, selectedMenu, selectedIce, selectedSugar, selectedTopping);
  };

  const handleSetCustomerName = (nameInput: string) => {
    const valid = extractNameFromSpeech(nameInput);
    setCustomerName(valid);
    setUserSpokenText(`Name: ${valid}`);
    askNextMissingParameter(selectedCabangId, selectedCabangName, valid, selectedMenu, selectedIce, selectedSugar, selectedTopping);
  };

  const handleSelectMenu = (item: MenuItem) => {
    setSelectedMenu(item);
    setUserSpokenText(`Drink: [${item.no}] ${item.name}`);
    askNextMissingParameter(selectedCabangId, selectedCabangName, customerName, item, selectedIce, selectedSugar, selectedTopping);
  };

  const handleSelectIce = (iceObj: IceOption) => {
    setSelectedIce(iceObj.id);
    setUserSpokenText(`Ice: [${iceObj.no}] ${iceObj.label}`);
    askNextMissingParameter(selectedCabangId, selectedCabangName, customerName, selectedMenu, iceObj.id, selectedSugar, selectedTopping);
  };

  const handleSelectSugar = (sugarObj: typeof SUGAR_OPTIONS[0]) => {
    setSelectedSugar(sugarObj.id);
    setUserSpokenText(`Sugar: [${sugarObj.no}] ${sugarObj.label}`);
    askNextMissingParameter(selectedCabangId, selectedCabangName, customerName, selectedMenu, selectedIce, sugarObj.id, selectedTopping);
  };

  const handleSelectTopping = (toppingObj: ToppingOption) => {
    setSelectedTopping(toppingObj.id);
    setUserSpokenText(`Topping: [${toppingObj.no}] ${toppingObj.label}`);
    askNextMissingParameter(selectedCabangId, selectedCabangName, customerName, selectedMenu, selectedIce, selectedSugar, toppingObj.id);
  };

  // Rule 3: Multi-Parameter Voice Extraction (English + Number-First support)
  const processMultiParameterSpeech = useCallback((speech: string) => {
    const text = speech.toLowerCase().trim();
    if (!text || isAiSpeakingRef.current) return;

    const spokenNum = parseSpokenNumber(text);

    // Fast-track: Payment confirmation (Rule 5)
    if (currentStep === "confirm" || currentStep === "completed") {
      if (spokenNum === 1 || text.includes("yes") || text.includes("pay") || text.includes("checkout") || text.includes("ok") || text.includes("sure") || text.includes("whatsapp") || text.includes("wa") || text.includes("transfer") || text.includes("bayar") || text.includes("iya") || text.includes("ya") || text.includes("pesan") || text.includes("proceed")) {
        handleProcessCheckout(true);
        return;
      }
      if (spokenNum === 2 || text.includes("add") || text.includes("another") || text.includes("more") || text.includes("tambah") || text.includes("lagi")) {
        handleAddAnotherDrink();
        return;
      }
      if (text.includes("print") || text.includes("cetak") || text.includes("struk") || text.includes("receipt")) {
        handlePrintReceipt();
        return;
      }
    }

    // Fast-track: Add more drinks in any stage
    if (text.includes("add drink") || text.includes("another drink") || text.includes("tambah minuman")) {
      handleAddAnotherDrink();
      return;
    }

    let nextBranchId = selectedCabangId;
    let nextBranchName = selectedCabangName;
    let nextName = customerName;
    let nextMenu = selectedMenu;
    let nextIce = selectedIce;
    let nextSugar = selectedSugar;
    let nextTopping = selectedTopping;

    // 1. Extract Branch (by Number or Name)
    if (currentStep === "branch" && spokenNum !== null && spokenNum >= 1 && spokenNum <= cabangList.length) {
      const c = cabangList[spokenNum - 1];
      nextBranchId = c.id;
      nextBranchName = c.name;
    } else {
      for (const c of cabangList) {
        if (text.includes(c.name.toLowerCase()) || text.includes(c.city.toLowerCase())) {
          nextBranchId = c.id;
          nextBranchName = c.name;
          break;
        }
      }
    }

    // 2. Extract Name
    const nameMatch = text.match(/(?:my name is|i am|this is|call me|name is|i'm|nama saya|nama aku|saya|aku|dengan|atas nama)\s+([a-zA-Z]+)/i);
    if (nameMatch && nameMatch[1]) {
      nextName = extractNameFromSpeech(nameMatch[1]);
    } else if (currentStep === "name" && !nextName && spokenNum === null) {
      nextName = extractNameFromSpeech(speech);
    }

    // 3. Extract Menu (by Number or Name)
    if (currentStep === "menu" && spokenNum !== null && spokenNum >= 1 && spokenNum <= menuList.length) {
      nextMenu = menuList[spokenNum - 1];
    } else {
      for (const m of menuList) {
        const mName = m.name.toLowerCase();
        if (text.includes(mName) || (mName.includes("kopi susu") && text.includes("kopi susu")) || (mName.includes("matcha") && text.includes("matcha")) || (mName.includes("brown sugar") && text.includes("brown sugar")) || (mName.includes("teh tarik") && text.includes("teh tarik")) || (mName.includes("chocolate") && text.includes("chocolate")) || (mName.includes("latte") && text.includes("latte")) || (mName.includes("americano") && text.includes("americano")) || (mName.includes("mocha") && text.includes("mocha"))) {
          nextMenu = m;
          break;
        }
      }
    }

    // 4. Extract Ice Level (by Number or Keyword)
    if (currentStep === "ice" && spokenNum !== null && spokenNum >= 1 && spokenNum <= iceList.length) {
      nextIce = iceList[spokenNum - 1].id;
    } else if (text.includes("no ice") || text.includes("without ice") || text.includes("unchilled") || text.includes("tanpa es") || text.includes("zero ice")) {
      nextIce = "No Ice (0%)";
    } else if (text.includes("less ice") || text.includes("light ice") || text.includes("30%")) {
      nextIce = "Less Ice (30%)";
    } else if (text.includes("extra ice") || text.includes("lot of ice") || text.includes("100%")) {
      nextIce = "Extra Ice (100%)";
    } else if (text.includes("normal ice") || text.includes("standard ice") || text.includes("70%")) {
      nextIce = "Normal Ice (70%)";
    }

    // 5. Extract Sugar Level (by Number or Keyword)
    if (currentStep === "sugar" && spokenNum !== null && spokenNum >= 1 && spokenNum <= SUGAR_OPTIONS.length) {
      nextSugar = SUGAR_OPTIONS[spokenNum - 1].id;
    } else if (text.includes("no sugar") || text.includes("without sugar") || text.includes("unsweetened") || text.includes("0%")) {
      nextSugar = "No Sugar (0%)";
    } else if (text.includes("low sugar") || text.includes("little sugar") || text.includes("25%")) {
      nextSugar = "Low Sugar (25%)";
    } else if (text.includes("less sugar") || text.includes("half sugar") || text.includes("50%")) {
      nextSugar = "Less Sugar (50%)";
    } else if (text.includes("normal sugar") || text.includes("standard sugar") || text.includes("100%")) {
      nextSugar = "Normal Sugar (100%)";
    }

    // 6. Extract Topping (by Number or Keyword)
    if (currentStep === "topping" && spokenNum !== null && spokenNum >= 1 && spokenNum <= toppingList.length) {
      nextTopping = toppingList[spokenNum - 1].id;
    } else if (text.includes("boba") || text.includes("pearl")) {
      nextTopping = "Golden Boba Pearl";
    } else if (text.includes("cheese") || text.includes("foam")) {
      nextTopping = "Cheese Cream Foam";
    } else if (text.includes("pudding") || text.includes("egg")) {
      nextTopping = "Egg Pudding Lembut";
    } else if (text.includes("jelly") || text.includes("grass jelly") || text.includes("cincau")) {
      nextTopping = "Grass Jelly (Cincau)";
    } else if (text.includes("no topping") || text.includes("without topping") || text.includes("tanpa topping") || text.includes("plain") || text.includes("none")) {
      nextTopping = "No Topping";
    }

    // Update States
    if (nextBranchId) setSelectedCabangId(nextBranchId);
    if (nextBranchName) setSelectedCabangName(nextBranchName);
    if (nextName) setCustomerName(nextName);
    if (nextMenu) setSelectedMenu(nextMenu);
    if (nextIce) setSelectedIce(nextIce);
    if (nextSugar) setSelectedSugar(nextSugar);
    if (nextTopping) setSelectedTopping(nextTopping);

    // Ask next parameter or conclude final confirmation
    askNextMissingParameter(nextBranchId, nextBranchName, nextName, nextMenu, nextIce, nextSugar, nextTopping);
  }, [currentStep, selectedCabangId, selectedCabangName, customerName, selectedMenu, selectedIce, selectedSugar, selectedTopping, cabangList, menuList, iceList, toppingList, askNextMissingParameter]);

  // Web Speech Recognition Initialization with Robust Lifecycle & Reconnection
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onspeechstart = () => {
        if (!isAiSpeakingRef.current && isCallActiveRef.current) {
          setCallState("user-speaking");
        }
      };

      rec.onsoundstart = () => {
        if (!isAiSpeakingRef.current && isCallActiveRef.current) {
          setCallState("user-speaking");
        }
      };

      rec.onresult = (event: any) => {
        if (isAiSpeakingRef.current) return; // Prevent AI from transcribing its own voice

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const fullSpoken = (finalTranscript || interimTranscript).trim();

        if (fullSpoken) {
          setUserSpokenText(fullSpoken);
          setCallState("user-speaking");

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          silenceTimerRef.current = setTimeout(() => {
            if (isCallActiveRef.current && !isAiSpeakingRef.current && fullSpoken !== lastProcessedTextRef.current) {
              lastProcessedTextRef.current = fullSpoken;
              processMultiParameterSpeech(fullSpoken);
            }
          }, 650);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition event:", event.error);
        if (event.error === "no-speech" || event.error === "network") {
          // Restart gracefully
          if (isCallActiveRef.current && !muted && !isAiSpeakingRef.current) {
            setTimeout(() => {
              try { rec.start(); } catch (e) { }
            }, 300);
          }
        }
      };

      rec.onend = () => {
        // Auto-reconnect if call is still active and not currently AI speaking
        if (isCallActiveRef.current && !muted && !isAiSpeakingRef.current) {
          setTimeout(() => {
            try {
              rec.start();
            } catch (e) { }
          }, 150);
        }
      };

      recognitionRef.current = rec;
    }
  }, [processMultiParameterSpeech, muted]);

  // Start Live Conversation Call (Voice Call Connect Flow)
  const startCall = async () => {
    playVoiceChime("start");

    // Unlock browser audio context & speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) { }
    }

    setCallState("connecting");
    setCurrentStep("branch");
    setSelectedMenu(null);
    setSelectedIce("");
    setSelectedSugar("");
    setSelectedTopping("");
    setUserSpokenText("");
    setCustomerName("");
    lastProcessedTextRef.current = "";

    await setupAudioMeter();

    // Start speech recognition immediately
    if (recognitionRef.current && !muted) {
      try {
        recognitionRef.current.start();
      } catch (e) { }
    }

    setTimeout(() => {
      setCallState("active");
      const askMsg = "Hello! Welcome to Munajat Drinks. Which branch would you like to order from, and what is your name?";
      setAiSpokenText(askMsg);
      speakAiVoice(askMsg);
    }, 500);
  };

  // End Call
  const endCall = () => {
    playVoiceChime("done");
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
    }
    setCallState("ended");
    const endMsg = `Session ended. Thank you so much ${customerName || ''} for ordering at Munajat Drinks! Have a wonderful day!`;
    setAiSpokenText(endMsg);
    speakAiVoice(endMsg);
  };

  // Reset Session
  const resetCall = () => {
    playVoiceChime("tap");
    window.speechSynthesis?.cancel();
    setCallState("idle");
    setCurrentStep("welcome");
    setSelectedMenu(null);
    setSelectedIce("");
    setSelectedSugar("");
    setSelectedTopping("");
    setCartItems([]);
    setCustomerName("");
    setUserSpokenText("");
    setAiSpokenText("Hello! I am your AI Voice Cashier for Munajat Drinks. Tap the microphone or mascot to start ordering your favorite drink.");
  };

  // Generate WhatsApp Order Confirmation Message Link
  const generateWhatsAppUrl = (orderCode: string, itemsList: CustomOrderItem[] = cartItems) => {
    const rawPhone = selectedCabangPhone || "+62 811 868 3080";
    const numeric = rawPhone.replace(/[^0-9]/g, "");
    const cleanPhone = numeric.startsWith("0") ? "62" + numeric.slice(1) : numeric.startsWith("62") ? numeric : "628118683080";
    const totalAmount = itemsList.reduce((sum, item) => sum + item.totalItemPrice * item.qty, 0);

    const itemsText = itemsList.map((c, idx) =>
      `${idx + 1}. *${c.menu.name}* (x${c.qty})\n` +
      `   • Ice: ${c.iceLevel}\n` +
      `   • Sugar: ${c.sugarLevel}\n` +
      `   • Topping: ${c.topping}\n` +
      `   • Subtotal: ${fmt(c.totalItemPrice * c.qty)}`
    ).join("\n\n");

    const message =
      `*NEW ORDER - MUNAJAT DRINKS ☕*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*Order No.:* #${orderCode}\n` +
      `*Customer:* ${customerName.trim() || 'Voice Cashier Customer'}\n` +
      `*Branch:* ${selectedCabangName || 'Munajat Drinks Outlet'}\n` +
      `*Date/Time:* ${new Date().toLocaleString('en-US')}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*BEVERAGE DETAILS (${itemsList.length} Items):*\n${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*TOTAL AMOUNT:* *${fmt(totalAmount)}*\n` +
      `*Payment Method:* Transfer via WhatsApp\n` +
      `*Status:* Awaiting Payment Proof\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Hello Munajat Drinks Admin, I would like to confirm my payment transfer for the order above. Please share your bank account / QRIS transfer details. Thank you! 🙏`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Handle Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Process Checkout & Save to Database
  const handleProcessCheckout = async (openWaDirect: boolean = true) => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce((sum, item) => sum + item.totalItemPrice * item.qty, 0);
    const dateStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    setOrderTimestamp(dateStr);

    // Generate unique order code
    const generatedCode = `MNJ-${Math.floor(100000 + Math.random() * 900000)}`;
    setCreatedOrderCode(generatedCode);
    setShowReceipt(true);

    try {
      const itemsPayload = cartItems.map(c => ({
        name: c.menu.name,
        qty: c.qty,
        price: c.totalItemPrice,
        ice: c.iceLevel,
        sugar: c.sugarLevel,
        topping: c.topping,
      }));

      const res = await orderCodesApi.create({
        order_code: generatedCode,
        cabang_id: selectedCabangId,
        customer_name: customerName.trim() || "Voice Cashier Customer",
        total_amount: total,
        payment_method: "Transfer WhatsApp",
        payment_status: "paid",
        order_status: "preparing",
        items_data: itemsPayload,
      });

      if (res.success && res.data) {
        if (res.data.order_code) setCreatedOrderCode(res.data.order_code);
        window.dispatchEvent(new CustomEvent("munajat_new_order", { detail: res.data }));
      }
    } catch (err) {
      console.error("Failed to store order in database", err);
    }

    if (openWaDirect) {
      const waUrl = generateWhatsAppUrl(generatedCode);
      window.open(waUrl, "_blank");
    }

    const finishMsg = `Order for ${customerName || 'Customer'} totaling ${fmt(total)} has been successfully saved. WhatsApp transfer payment and receipt are ready. Thank you!`;
    setAiSpokenText(finishMsg);
    speakAiVoice(finishMsg);
    setCurrentStep("completed");
  };

  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.totalItemPrice * item.qty, 0);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#ffffff",
      backgroundImage: `
        radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 90%, rgba(6, 182, 212, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.8) 0%, #ffffff 100%)
      `,
      color: "#0f172a",
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: isMobile ? "12px 10px" : "20px 28px",
      gap: "16px",
      overflowX: "hidden"
    }}>

      {/* ── Top Bar Header ── */}
      {standalone && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: isMobile ? "12px 14px" : "14px 24px",
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "14px", minWidth: 0 }}>
            <img
              src="/Logo Munajat Mocha.png"
              alt="Munajat Drinks Logo"
              style={{
                width: isMobile ? "40px" : "48px",
                height: isMobile ? "40px" : "48px",
                borderRadius: "12px",
                objectFit: "contain",
                background: "rgba(255, 255, 255, 0.9)",
                padding: "2px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.25)",
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: isMobile ? "17px" : "20px", fontWeight: 800, letterSpacing: "-0.6px", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
                  Munajat Drinks
                </span>
                <span style={{
                  fontSize: isMobile ? "10.5px" : "11.5px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "100px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#059669",
                  border: "1px solid rgba(16, 185, 129, 0.25)"
                }}>
                  🎙️ AI Voice Cashier
                </span>
                {customerName && (
                  <span style={{
                    fontSize: isMobile ? "10.5px" : "11.5px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "100px",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    color: "#0284c7",
                    border: "1px solid rgba(6, 182, 212, 0.25)"
                  }}>
                    👤 {customerName}
                  </span>
                )}
                {selectedCabangName && (
                  <span style={{
                    fontSize: isMobile ? "10.5px" : "11.5px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "100px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    color: "#b45309",
                    border: "1px solid rgba(245, 158, 11, 0.25)"
                  }}>
                    🏪 {selectedCabangName}
                  </span>
                )}
              </div>
              <span style={{ fontSize: isMobile ? "11.5px" : "12.5px", fontWeight: 500, color: "#64748b" }}>
                Two-way interactive voice ordering system
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: isMobile ? "7px 12px" : "9px 18px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                color: "#ffffff",
                fontSize: isMobile ? "12px" : "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(16, 185, 129, 0.28)",
                transition: "all 0.2s ease"
              }}>
                <ShieldCheck size={15} />
                <span>Admin Portal</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Workspace: Two-Way Conversation Talk Interface ── */}
      <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0, flexDirection: isMobile ? "column" : "row" }}>

        {/* ══════ LEFT: MASCOT VISUAL VOICE INTERACTION PANEL ══════ */}
        <div style={{
          width: isMobile ? "100%" : "340px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "18px 14px" : "24px 20px",
          borderRadius: "24px",
          backgroundColor: "#ffffff",
          border: "1.5px solid #e2e8f0",
          boxShadow: callState === "ai-speaking" || callState === "active" || callState === "user-speaking"
            ? "0 20px 50px -10px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.2)"
            : "0 16px 40px -10px rgba(15, 23, 42, 0.06)",
          position: "relative",
          gap: "14px",
          transition: "all 0.3s ease",
          background: callState === "ai-speaking"
            ? "radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.08) 0%, #ffffff 70%)"
            : callState === "active" || callState === "user-speaking"
              ? "radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.08) 0%, #ffffff 70%)"
              : "#ffffff"
        }}>

          {/* Top Status Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            {/* Status Chip */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 18px",
              borderRadius: "100px",
              border: `1.5px solid ${callState === "ai-speaking" ? "rgba(6, 182, 212, 0.5)" : (callState === "active" || callState === "user-speaking") ? "#10b981" : "#e2e8f0"}`,
              backgroundColor: callState === "ai-speaking" ? "rgba(6, 182, 212, 0.1)" : (callState === "active" || callState === "user-speaking") ? "rgba(16, 185, 129, 0.12)" : "#f8fafc",
              boxShadow: (callState === "active" || callState === "user-speaking") ? "0 0 16px rgba(16, 185, 129, 0.3)" : "none",
              transition: "all 0.25s ease"
            }}>
              <div style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: callState === "connecting" ? "#f59e0b" : callState === "ai-speaking" ? "#06b6d4" : (callState === "active" || callState === "user-speaking") ? "#10b981" : "#94a3b8",
                boxShadow: (callState === "active" || callState === "ai-speaking" || callState === "user-speaking") ? "0 0 10px #10b981" : "none",
              }} />
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: callState === "ai-speaking" ? "#0284c7" : (callState === "active" || callState === "user-speaking") ? "#047857" : "#64748b" }}>
                {callState === "idle" ? "AI Cashier Ready" : callState === "connecting" ? "Connecting…" : callState === "ai-speaking" ? "🔊 AI Cashier Speaking..." : "🎙️ YOUR TURN TO SPEAK — MIC ACTIVE"}
              </span>
            </div>
          </div>

          {/* Center Visualizer: Duo Mascot */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0", minHeight: "170px" }}>
            <DuoMascot
              size={isMobile ? 140 : 165}
              isSpeaking={callState === "ai-speaking" || (micVolume > 8 && callState !== "idle" && callState !== "ended")}
              isListening={callState === "active" || callState === "ai-speaking" || callState === "user-speaking" || micVolume > 5}
              mood={callState === "ai-speaking" ? "talking" : (micVolume > 8 || callState === "user-speaking") ? "excited" : "happy"}
              onClick={callState === "idle" ? startCall : undefined}
            />
          </div>

          {/* Name & Waveform */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
            <div style={{ fontWeight: 800, fontSize: "17px", color: "#0f172a", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "6px" }}>
              AI Cashier Munajat Drinks
              <Sparkles size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: "11.5px", color: "#059669", fontWeight: 700 }}>
              Munajat Drinks Voice Engine
            </div>

            {/* Audio Waveform Metering */}
            <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "26px", marginTop: "2px" }}>
              {[8, 14, 24, 30, 22, 16, 28, 20, 12, 26, 32, 18, 10, 22, 14, 8].map((v, i) => {
                const dynamicH = Math.max(4, Math.round((v * (micVolume > 5 ? (micVolume / 35) : 0.35))));
                return (
                  <div
                    key={i}
                    style={{
                      width: "3.5px",
                      borderRadius: "999px",
                      background: callState === "ai-speaking"
                        ? "linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%)"
                        : "linear-gradient(180deg, #10b981 0%, #06b6d4 100%)",
                      height: (callState === "ai-speaking" || callState === "active" || callState === "user-speaking") ? `${dynamicH}px` : "4px",
                      opacity: (callState === "ai-speaking" || callState === "active" || callState === "user-speaking") ? 0.9 : 0.25,
                      transition: "height 0.09s ease, opacity 0.2s ease",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Turn Feedback Dynamic Pill */}
          {callState === "ai-speaking" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              borderRadius: "100px",
              backgroundColor: "rgba(6, 182, 212, 0.1)",
              border: "1.5px solid rgba(6, 182, 212, 0.4)",
              color: "#0284c7",
              fontSize: "11.5px",
              fontWeight: 800
            }}>
              <Volume2 size={14} />
              <span>AI is speaking... Please listen</span>
            </div>
          ) : micVolume > 8 ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "100px",
              backgroundColor: "#10b981",
              border: "1.5px solid #059669",
              color: "#ffffff",
              fontSize: "11.5px",
              fontWeight: 800,
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)"
            }}>
              <Mic size={14} color="#ffffff" />
              <span>🎙️ YOU ARE SPEAKING ({micVolume}%)</span>
            </div>
          ) : (callState === "active" || callState === "user-speaking") ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "100px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1.5px solid #10b981",
              color: "#047857",
              fontSize: "11.5px",
              fontWeight: 800,
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.3)"
            }}>
              <Mic size={14} color="#059669" />
              <span>🎙️ YOUR TURN TO SPEAK — MIC IS LIVE</span>
            </div>
          ) : null}

          {/* Voice Call Main Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {(callState === "active" || callState === "ai-speaking" || callState === "user-speaking") && (
              <button
                onClick={() => { playVoiceChime("tap"); setMuted(!muted); }}
                title={muted ? "Unmute Microphone" : "Mute Microphone"}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1.5px solid #e2e8f0",
                  backgroundColor: muted ? "#fee2e2" : "#f8fafc",
                  color: muted ? "#ef4444" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            {callState === "idle" || callState === "ended" ? (
              <button
                onClick={() => { playVoiceChime("tap"); callState === "ended" ? resetCall() : startCall(); }}
                style={{
                  width: "66px",
                  height: "66px",
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 10px 28px rgba(16, 185, 129, 0.4)",
                  transition: "transform 0.2s ease"
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {callState === "ended" ? <RefreshCw size={26} /> : <Mic size={28} />}
              </button>
            ) : callState === "connecting" ? (
              <div style={{
                width: "66px",
                height: "66px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 28px rgba(245, 158, 11, 0.4)"
              }}>
                <Mic size={26} />
              </div>
            ) : (
              <button
                onClick={endCall}
                style={{
                  width: "66px",
                  height: "66px",
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 10px 28px rgba(239, 68, 68, 0.4)",
                  transition: "transform 0.2s ease"
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                <PhoneOff size={24} />
              </button>
            )}

            {(callState === "active" || callState === "ai-speaking" || callState === "user-speaking") && (
              <button
                onClick={() => { playVoiceChime("tap"); setSpeakerOff(!speakerOff); }}
                title={speakerOff ? "Turn Speaker On" : "Mute Speaker"}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1.5px solid #e2e8f0",
                  backgroundColor: speakerOff ? "#fee2e2" : "#f8fafc",
                  color: speakerOff ? "#ef4444" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {speakerOff ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            {callState === "idle" ? "Tap mic button or mascot to start ordering" : micVolume > 8 ? "🎙️ Microphone is actively receiving your voice" : (callState === "active" || callState === "user-speaking") ? "🎙️ Your microphone is active — speak clearly" : "🔊 AI Cashier is talking"}
          </div>

        </div>

        {/* ══════ RIGHT: LIVE CONVERSATION & HYBRID VISUAL SCREEN ══════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>

          {/* Glassmorphic Live Subtitle Dialogue Bar */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "22px",
            border: "1.5px solid #e2e8f0",
            padding: "18px 22px",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            backdropFilter: "blur(10px)"
          }}>
            {/* AI Kasir Message */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 4px 10px rgba(16,185,129,0.3)" }}>
                <Sparkles size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  AI Cashier Munajat Drinks
                </div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", lineHeight: 1.5, marginTop: "2px" }}>
                  {aiSpokenText}
                </div>
              </div>
            </div>

            {/* User Speech Transcription or Turn Prompt */}
            {(callState === "active" || callState === "user-speaking") && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: micVolume > 8 ? "linear-gradient(135deg, #10b981 0%, #047857 100%)" : "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: micVolume > 8 ? "0 0 12px rgba(16,185,129,0.6)" : "none",
                  transition: "all 0.2s ease"
                }}>
                  <User size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Customer (You)
                    </div>
                    {micVolume > 8 && (
                      <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "100px", backgroundColor: "#dcfce7", color: "#15803d", fontWeight: 800 }}>
                        ● Speaking now ({micVolume}%)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: userSpokenText ? 700 : 500, color: userSpokenText ? "#0f172a" : "#64748b", marginTop: "2px", fontStyle: userSpokenText ? "normal" : "italic" }}>
                    {userSpokenText ? `"${userSpokenText}"` : "🎙️ Speak to answer, or click one of the quick chips / type below..."}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Voice Suggestion Chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px dashed #e2e8f0", paddingTop: "10px", marginTop: "2px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                💡 Voice commands:
              </span>
              {[
                "1",
                "2",
                "3",
                "4",
                "My name is David",
                "Pay via WhatsApp"
              ].map((hint, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playVoiceChime("tap");
                    setUserSpokenText(hint);
                    processMultiParameterSpeech(hint);
                  }}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "100px",
                    border: "1.5px solid #10b981",
                    backgroundColor: "#ecfdf5",
                    color: "#047857",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#d1fae5";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "#ecfdf5";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Say "{hint}"
                </button>
              ))}
            </div>
          </div>

          {/* ── 1. WELCOME SCREEN ── */}
          {currentStep === "welcome" && (
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "28px",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 16px 40px -10px rgba(15, 23, 42, 0.05)",
              padding: isMobile ? "28px 20px" : "40px 36px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}>
              <div style={{
                width: "74px",
                height: "74px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 28px rgba(16, 185, 129, 0.3)",
              }}>
                <Sparkles size={36} color="#ffffff" />
              </div>

              <div>
                <h2 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: 800, margin: "0 0 8px 0", color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
                  Munajat Drinks AI Voice Cashier
                </h2>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "540px", lineHeight: 1.6 }}>
                  Order hands-free by voice! You can simply <strong>say the option numbers (e.g. "1", "2", "3")</strong> at any step to customize and confirm your drink instantly.
                </p>
              </div>

              <button
                onClick={startCall}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  borderRadius: "16px",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontSize: "14.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
                }}
              >
                <Mic size={18} />
                <span>Start Voice Call Ordering</span>
              </button>
            </div>
          )}

          {/* ── 2. BRANCH SELECTION ── */}
          {currentStep === "branch" && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>
                  <Store size={18} color="#10b981" />
                  <span>Step 1: Choose Store Branch</span>
                </div>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>🎙️ Say number 1 to {cabangList.length}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "12px" }}>
                {cabangList.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectBranch(c)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor: selectedCabangId === c.id ? "rgba(16, 185, 129, 0.08)" : "#f8fafc",
                      border: selectedCabangId === c.id ? "2px solid #10b981" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "15px", flexShrink: 0, boxShadow: "0 4px 10px rgba(16,185,129,0.3)" }}>
                      {c.no}
                    </div>
                    <span style={{ fontSize: "24px" }}>{c.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{c.city} · {c.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 3. CUSTOMER NAME ── */}
          {currentStep === "name" && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "18px", backgroundColor: "rgba(6, 182, 212, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
                <UserCheck size={28} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: 800 }}>What is your name?</h3>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#059669", fontWeight: 600 }}>🎙️ Speak your name directly into the microphone (e.g. "David", "Sarah", "Alex")</p>
              </div>
            </div>
          )}

          {/* ── 4. MENU SELECTION ── */}
          {currentStep === "menu" && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>
                  <Coffee size={18} color="#10b981" />
                  <span>Step 3: Select Drink Menu</span>
                </div>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>🎙️ Say number 1 to {menuList.length}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
                {menuList.map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMenu(m)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor: selectedMenu?.id === m.id ? "rgba(16, 185, 129, 0.08)" : "#f8fafc",
                      border: selectedMenu?.id === m.id ? "2px solid #10b981" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      position: "relative",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "8px", backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", boxShadow: "0 2px 6px rgba(16,185,129,0.3)" }}>
                          {m.no}
                        </div>
                        <span style={{ fontSize: "22px" }}>{m.emoji}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: "#10b981", fontSize: "13px" }}>{fmt(m.price)}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>{m.name}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{m.cat}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 5. ICE LEVEL ── */}
          {currentStep === "ice" && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>
                  <Snowflake size={18} color="#06b6d4" />
                  <span>Step 4: Ice Ratio Level</span>
                </div>
                <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700 }}>🎙️ Say number 1 to {iceList.length}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "12px" }}>
                {iceList.map(i => (
                  <div
                    key={i.id}
                    onClick={() => handleSelectIce(i)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor: selectedIce === i.id ? "rgba(6, 182, 212, 0.08)" : "#f8fafc",
                      border: selectedIce === i.id ? "2px solid #06b6d4" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#06b6d4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px", flexShrink: 0, boxShadow: "0 2px 6px rgba(6,182,212,0.3)" }}>
                      {i.no}
                    </div>
                    <span style={{ fontSize: "24px" }}>{i.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>{i.label}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{i.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 6. SUGAR LEVEL ── */}
          {currentStep === "sugar" && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>
                  <Flame size={18} color="#f59e0b" />
                  <span>Step 5: Sugar Sweetness</span>
                </div>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 700 }}>🎙️ Say number 1 to {SUGAR_OPTIONS.length}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "12px" }}>
                {SUGAR_OPTIONS.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSugar(s)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor: selectedSugar === s.id ? "rgba(245, 158, 11, 0.08)" : "#f8fafc",
                      border: selectedSugar === s.id ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px", flexShrink: 0, boxShadow: "0 2px 6px rgba(245,158,11,0.3)" }}>
                      {s.no}
                    </div>
                    <span style={{ fontSize: "24px" }}>{s.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>{s.label}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 7. TOPPING SELECTION ── */}
          {currentStep === "topping" && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>
                  <Layers size={18} color="#8b5cf6" />
                  <span>Step 6: Add-on Toppings</span>
                </div>
                <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 700 }}>🎙️ Say number 1 to {toppingList.length}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "12px" }}>
                {toppingList.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTopping(t)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      backgroundColor: selectedTopping === t.id ? "rgba(139, 92, 246, 0.08)" : "#f8fafc",
                      border: selectedTopping === t.id ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "8px", backgroundColor: "#8b5cf6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                          {t.no}
                        </div>
                        <span style={{ fontSize: "22px" }}>{t.emoji}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: t.price > 0 ? "#8b5cf6" : "#64748b", fontSize: "12px" }}>
                        {t.price > 0 ? `+${fmt(t.price)}` : "Free"}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 8. CONFIRMATION & CHECKOUT ── */}
          {(currentStep === "confirm" || currentStep === "completed") && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", border: "1.5px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                  <ShoppingCart size={20} color="#10b981" />
                  <span>Order Summary & Settlement</span>
                </div>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 700 }}>
                  {currentStep === "completed" ? "✓ Paid" : "🎙️ Say [1] to Pay or [2] to Add More"}
                </span>
              </div>

              {cartItems.map((item, idx) => (
                <div key={idx} style={{ padding: "16px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "28px" }}>{item.menu.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>{item.menu.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {item.iceLevel} · {item.sugarLevel} · {item.topping}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#10b981", fontSize: "15px" }}>{fmt(item.totalItemPrice)}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>1 Cup</div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>Total Amount:</div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#10b981" }}>{fmt(totalCartAmount)}</div>
              </div>

              {currentStep === "confirm" && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleProcessCheckout(true)}
                    style={{
                      flex: 2,
                      minWidth: "220px",
                      padding: "13px 18px",
                      borderRadius: "14px",
                      border: "none",
                      background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 6px 18px rgba(37, 211, 102, 0.35)"
                    }}
                  >
                    <span style={{ backgroundColor: "#ffffff", color: "#128C7E", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 900 }}>1</span>
                    <Send size={18} />
                    <span>Pay & Confirm via WhatsApp</span>
                  </button>

                  <button
                    onClick={handleAddAnotherDrink}
                    style={{
                      flex: 1,
                      minWidth: "160px",
                      padding: "13px",
                      borderRadius: "14px",
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#334155",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <span style={{ backgroundColor: "#e2e8f0", color: "#0f172a", padding: "2px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 900 }}>2</span>
                    <span>+ Add Another Drink</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ── PRINTABLE STYLES ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-pos-receipt, #printable-pos-receipt * {
            visibility: visible !important;
          }
          #printable-pos-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 12px !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            font-family: monospace, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── DIGITAL RECEIPT & WHATSAPP TRANSFER MODAL ── */}
      {showReceipt && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "12px 8px" : "20px"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "440px",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            border: "1.5px solid #e2e8f0",
            padding: isMobile ? "18px 14px" : "26px",
            textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            maxHeight: "92vh",
            overflowY: "auto"
          }}>
            {/* Header Icon */}
            <div className="no-print" style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(37, 211, 102, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", color: "#25D366" }}>
              <Receipt size={28} />
            </div>
            <h3 className="no-print" style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 800, color: "#0f172a", fontFamily: "'Outfit', sans-serif" }}>
              Official Receipt & WhatsApp Payment
            </h3>
            <p className="no-print" style={{ margin: "0 0 16px 0", fontSize: "12.5px", color: "#64748b" }}>
              Your order has been recorded. Please proceed with payment transfer and print your receipt below.
            </p>

            {/* ── AUTHENTIC THERMAL PRINTABLE RECEIPT ── */}
            <div
              id="printable-pos-receipt"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "16px",
                padding: "20px 18px",
                textAlign: "left",
                fontSize: "12.5px",
                color: "#0f172a",
                lineHeight: 1.5,
                marginBottom: "18px"
              }}
            >
              {/* Receipt Header */}
              <div style={{ textAlign: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "12px", marginBottom: "12px" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "0.5px", color: "#0f172a" }}>MUNAJAT DRINKS</div>
                <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>{selectedCabangName || 'Main Store - Grand Indonesia'}</div>
                {selectedCabangAddress && <div style={{ fontSize: "11px", color: "#64748b" }}>{selectedCabangAddress}</div>}
                <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>WA/Phone: {(selectedCabangPhone && selectedCabangPhone.trim().length >= 8) ? selectedCabangPhone : '+62 811 868 3080'}</div>
              </div>

              {/* Order Metadata */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                <span style={{ color: "#64748b" }}>Order No.:</span>
                <strong>#{createdOrderCode || `MNJ-${Date.now().toString().slice(-6)}`}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                <span style={{ color: "#64748b" }}>Date/Time:</span>
                <span>{orderTimestamp || new Date().toLocaleString("en-US")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "12px" }}>
                <span style={{ color: "#64748b" }}>Customer:</span>
                <strong>{customerName || "Customer"}</strong>
              </div>

              {/* Itemized List */}
              <div style={{ borderTop: "1px dashed #cbd5e1", borderBottom: "1px dashed #cbd5e1", padding: "10px 0", margin: "10px 0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "6px" }}>Beverage Details:</div>
                {cartItems.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13px" }}>
                      <span>{item.qty}x {item.menu.name}</span>
                      <span>{fmt(item.totalItemPrice * item.qty)}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", paddingLeft: "14px" }}>
                      {item.iceLevel} · {item.sugarLevel}
                      {item.topping && item.topping !== "No Topping" && item.topping !== "Without Topping" && ` · ${item.topping}`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Payment Method */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "14px" }}>
                <strong>TOTAL AMOUNT:</strong>
                <strong style={{ fontSize: "17px", color: "#059669" }}>{fmt(totalCartAmount)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569" }}>
                <span>Payment Method:</span>
                <strong style={{ color: "#128C7E" }}>Transfer WhatsApp</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                <span>Status:</span>
                <span style={{ color: "#059669", fontWeight: 700 }}>✓ Awaiting Payment Proof</span>
              </div>

              {/* Receipt Footer */}
              <div style={{ textAlign: "center", borderTop: "1px dashed #cbd5e1", paddingTop: "12px", marginTop: "12px", fontSize: "11px", color: "#64748b" }}>
                <div>Thank you for ordering at Munajat Drinks!</div>
                <div style={{ fontWeight: 600, color: "#128C7E", marginTop: "2px" }}>Please send your payment transfer proof to outlet WhatsApp.</div>
                <div style={{ marginTop: "4px" }}>Keep this receipt as your official proof of order.</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={generateWhatsAppUrl(createdOrderCode)}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(37, 211, 102, 0.35)",
                  boxSizing: "border-box"
                }}
              >
                <Send size={16} />
                <span>Send Proof / Chat WhatsApp</span>
              </a>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handlePrintReceipt}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "12px",
                    border: "1.5px solid #0f172a",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setShowReceipt(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    background: "transparent",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

