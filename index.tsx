import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Types & Interfaces ---

type Genre = "Thriller" | "Horror" | "Romance" | "Sci-Fi" | "Crime" | "Comedy" | "Drama" | "Action" | "Noir" | "Fantasy";
type Tone = "Cinematic" | "Dark & Gritty" | "Emotional" | "Suspenseful" | "Psychological" | "Inspirational" | "Satirical";
type Length = "Short Film" | "Medium Film" | "Feature Length";
type ModelType = "Gemini 3 Pro" | "Gemini 3 Flash" | "Llama 3.3 70B (Groq)";
type Language = "English" | "Spanish" | "French" | "German" | "Japanese" | "Korean" | "Chinese" | "Hindi" | "Italian" | "Portuguese";

interface User {
  name: string;
  email: string;
}

interface Project {
  id: string;
  timestamp: string;
  title: string;
  genre: Genre;
  tone: Tone;
  length: Length;
  model: ModelType;
  screenplay: string;
  characters: string;
  soundDesign: string;
  promptUsed: string;
}

interface SocialCampaign {
  instagram: { caption: string; hashtags: string; imageIdea: string };
  twitter: string[];
  linkedin: string;
  tiktok: string;
}

// --- Icons ---
const Icons = {
  Film: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>,
  Feather: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/></svg>,
  Rewrite: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 12h9"/><path d="M3 12l5-5"/></svg>,
  Archive: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Clapper: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.5-1.1.5-2.2 1.7-1.7l14.8 5.5c1.2.5 1.7 1.7 1.2 2.8l-1.9 4.8c-.5 1.1-1.7 1.7-2.8 1.2l-14.8-5.5"/><path d="m4 11 1-2.5"/><path d="m7.5 12.4 1-2.5"/><path d="m11 13.8 1-2.5"/><path d="m14.5 15.2 1-2.5"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  DownArrow: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Terminal: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Social: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  CineGenLogo: () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-cinema-gold" fill="none" stroke="currentColor" strokeWidth="3">
       {/* Film Reel / Lens Abstract */}
       <circle cx="50" cy="50" r="42" strokeOpacity="0.8" className="animate-spin-slow" strokeDasharray="5 5" />
       <circle cx="50" cy="50" r="30" strokeOpacity="0.4" />
       
       {/* Clapperboard Abstract 'C' */}
       <path d="M70 25 L30 25 L20 40 L30 55 L20 70 L30 85 L70 85" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="4" />
       
       {/* Play Triangle / Center Focus */}
       <path d="M45 40 L65 50 L45 60 Z" fill="currentColor" stroke="none" />
    </svg>
  )
};

// --- Mock Database Helper ---
const DB = {
  getUsers: (): Record<string, any> => JSON.parse(localStorage.getItem('cwc_users') || '{}'),
  setUsers: (users: any) => localStorage.setItem('cwc_users', JSON.stringify(users)),
  getProjects: (): Project[] => JSON.parse(localStorage.getItem('cwc_projects') || '[]'),
  setProjects: (projects: Project[]) => localStorage.setItem('cwc_projects', JSON.stringify(projects)),
  
  register: (name: string, email: string, pass: string) => {
    const users = DB.getUsers();
    if (users[email]) return { success: false, msg: "Email already registered." };
    users[email] = { name, email, pass };
    DB.setUsers(users);
    return { success: true, msg: "Welcome to the studio." };
  },
  
  login: (email: string, pass: string) => {
    const users = DB.getUsers();
    if (users[email] && users[email].pass === pass) return { success: true, user: users[email] };
    return { success: false, msg: "Invalid credentials." };
  },

  saveProject: (project: Project) => {
    const projects = DB.getProjects();
    projects.unshift(project);
    DB.setProjects(projects);
  }
};

// --- Cinematic Intro Component ---
const CinematicIntro = () => {
  return (
    <div className="intro-overlay">
      <div className="intro-bg-pulse"></div>
      <div className="intro-text-wrapper flex flex-col items-center">
        <div className="w-20 h-20 mb-6 intro-logo-anim vibration-effect">
           <Icons.CineGenLogo />
        </div>
        <div className="relative">
          <h1 className="intro-logo-anim text-4xl md:text-6xl font-serif font-bold tracking-widest text-white flex items-center gap-4">
            <span className="text-cinema-gold text-5xl md:text-7xl">C</span>ine
            <span className="text-cinema-accent font-light italic mx-2">&</span>
            <span className="text-cinema-gold text-5xl md:text-7xl">G</span>en
          </h1>
          <div className="intro-sweep-mask"></div>
        </div>
        <p className="mt-8 text-cinema-accent/50 text-[10px] tracking-[0.6em] font-mono animate-pulse uppercase intro-logo-anim" style={{animationDelay: '0.5s'}}>Initializing Cinematic Engine</p>
      </div>
    </div>
  );
};

// --- Cinematic Generation Overlay (Netflix-Style Hyper Burst with Clapperboard) ---
const CinematicRevealOverlay = () => {
  const [text, setText] = useState("Initializing Neural Engine...");
  const messages = [
    "Deconstructing Narrative Arc...",
    "Analyzing Character Psychodynamics...",
    "Synthesizing Dialogue Patterns...",
    "Optimizing Pacing & Rhythm...",
    "Rendering Cinematic Texture...",
    "Forging Narrative...",
    "Polishing Final Draft..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(messages[i % messages.length]);
      i++;
    }, 1500); // Change message every 1.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-md">
      {/* Clapperboard Loader */}
      <div className="perspective-container mb-12 transform scale-75 md:scale-100">
         <div className="clapper-loader">
            <div className="clapper-top"></div>
            <div className="clapper-bottom"></div>
            <div className="clapper-hinge"></div>
         </div>
      </div>
      
      {/* Spectrum Ribbons */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
        <div className="ribbon-1 spectrum-ribbon"></div>
        <div className="ribbon-2 spectrum-ribbon"></div>
      </div>
      
      {/* Status Text */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-8">
        <h3 className="text-xl md:text-2xl font-serif text-white tracking-[0.2em] uppercase text-glow animate-pulse text-center">
          {text}
        </h3>
        <div className="mt-6 w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
           <div className="h-full bg-gradient-to-r from-transparent via-cinema-gold to-transparent animate-shimmer w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

// --- 3D Character Card Component ---

interface CharacterCardProps {
  name: string;
  description: string;
  delay: number;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ name, description, delay }) => {
  return (
    <div 
      className="character-card relative group w-full bg-[#15151a] border border-white/5 rounded-xl overflow-hidden card-rise-anim"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-32 bg-gradient-to-b from-cinema-gold/20 to-transparent relative flex items-center justify-center">
         <div className="w-16 h-16 rounded-full bg-black/50 border border-cinema-gold/30 flex items-center justify-center">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-cinema-gold/70"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
         </div>
      </div>
      <div className="p-6 relative">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cinema-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
         <h4 className="text-lg font-serif text-white mb-2 group-hover:text-cinema-gold transition-colors">{name}</h4>
         <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">{description}</p>
      </div>
    </div>
  );
};

// --- Typewriter Effect Hook ---
const useTypewriter = (text: string, speed = 10) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
};

// --- PDF Generator ---
const generatePDF = (project: Project) => {
  try {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - (margin * 2);
    let y = 0;

    const addTitlePage = () => {
      doc.setFillColor(12, 12, 15); 
      y = 80;
      doc.setFont("courier", "bold");
      doc.setFontSize(28);
      doc.text(project.title.toUpperCase(), pageWidth / 2, y, { align: "center" });
      y += 15;
      doc.setFontSize(12);
      doc.setFont("courier", "normal");
      doc.text("Written by", pageWidth / 2, y, { align: "center" });
      y += 10;
      doc.setFont("courier", "bold");
      doc.text("CineGen AI", pageWidth / 2, y, { align: "center" });
      y += 40;
      doc.setFont("courier", "italic");
      doc.setFontSize(10);
      doc.text(`Genre: ${project.genre}  |  Tone: ${project.tone}`, pageWidth / 2, y, { align: "center" });
      doc.text(`Model: ${project.model}`, pageWidth / 2, y + 6, { align: "center" });
      doc.text(`Generated on ${project.timestamp}`, pageWidth / 2, 270, { align: "center" });
      doc.addPage();
      y = margin;
    };

    addTitlePage();

    const addSection = (title: string, content: string) => {
      if (y > 250) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(100);
      doc.text(title, margin, y);
      y += 12;
      doc.setFont("courier", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0);
      const splitText = doc.splitTextToSize(content, textWidth);
      splitText.forEach((line: string) => {
        if (y > 280) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 15;
    };

    addSection("SCREENPLAY", project.screenplay);
    doc.addPage(); y = margin;
    addSection("CHARACTER PROFILES", project.characters);
    doc.addPage(); y = margin;
    addSection("SOUND DESIGN PLAN", project.soundDesign);
    doc.save(`${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.pdf`);
  } catch (e) {
    console.error(e);
    alert("PDF Generation Failed. Use a modern desktop browser.");
  }
};

// --- HERO SECTION ---
const HeroSection = () => (
  <section className="min-h-screen flex flex-col items-center justify-center relative p-8">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cinema-accent/10 via-transparent to-transparent pointer-events-none"></div>
    <div className="text-center z-10 animate-fade-in perspective-container">
      <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#1a1a20] to-[#0a0a0f] rounded-[2rem] mx-auto mb-10 flex items-center justify-center shadow-[0_0_80px_rgba(184,155,94,0.15)] rotate-3 border border-cinema-gold/20 hover:rotate-6 transition-transform duration-1000 group">
         <div className="w-16 h-16 md:w-20 md:h-20 text-cinema-gold group-hover:scale-110 transition-transform duration-500">
           <Icons.CineGenLogo />
         </div>
      </div>
      <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-widest mb-6 text-white text-glow mix-blend-screen">
        CINE <span className="text-cinema-gold italic font-light">&</span> GEN
      </h1>
      <p className="text-cinema-text/60 text-sm md:text-base uppercase tracking-[0.4em] mb-12 max-w-2xl mx-auto leading-relaxed">
        The World's Most Advanced AI Pre-Production Suite
      </p>
      <a href="#studio-start" className="inline-flex flex-col items-center gap-2 text-cinema-gold opacity-80 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-widest">Scroll to Begin</span>
        <div className="animate-bounce-slow"><Icons.DownArrow /></div>
      </a>
    </div>
  </section>
);

// --- FEATURES SECTION ---
const FeaturesSection = () => (
  <section className="min-h-[60vh] flex flex-col justify-center py-20 px-8 max-w-7xl mx-auto section-cube-reveal" id="studio-start">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { icon: <Icons.Feather />, title: "Industry Standard", desc: "Hollywood-formatted screenplays generated instantly." },
        { icon: <Icons.Film />, title: "Deep Psychology", desc: "Complex character profiles with hidden motivations." },
        { icon: <Icons.Rewrite />, title: "Script Doctor", desc: "Upload drafts for cinematic rewriting and elevation." }
      ].map((f, i) => (
        <div key={i} className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-cinema-gold/30 transition-all group hover:-translate-y-2 duration-500 hover:rotate-1">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-cinema-gold mb-4 group-hover:scale-110 transition-transform">
            {React.cloneElement(f.icon as any, { size: 24 })}
          </div>
          <h3 className="text-xl font-serif text-white mb-2">{f.title}</h3>
          <p className="text-sm text-cinema-text/50">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// --- Settings Modal for Keys ---
const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const [groqKey, setGroqKey] = useState(localStorage.getItem('cwc_groq_key') || "");

  const saveKeys = () => {
  if (!groqKey || !groqKey.startsWith("gsk_")) {
    alert("Enter a valid Groq API key.");
    return;
  }

  localStorage.setItem('cwc_groq_key', groqKey.trim());
  alert("Groq API key saved successfully.");
  onClose();
};


  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-fade-in backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-cinema-text/50 hover:text-white transition-colors">
          <Icons.Close />
        </button>
        <h2 className="text-xl font-serif text-white mb-6 tracking-widest flex items-center gap-3">
          <Icons.Settings /> STUDIO CONFIG
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cinema-text/40 uppercase tracking-widest">Groq API Key (Llama 3.3)</label>
            <input 
              type="password"
              value={groqKey} 
              onChange={(e) => setGroqKey(e.target.value)} 
              placeholder="gsk_..." 
              className="w-full bg-black/40 border border-cinema-border rounded-lg px-4 py-3 text-sm text-white focus:border-cinema-gold focus:outline-none transition-all"
            />
            <p className="text-[10px] text-cinema-text/30">Key is stored locally in your browser.</p>
          </div>
          <button onClick={saveKeys} className="w-full bg-cinema-gold hover:bg-[#d4bf88] text-black font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-xs">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// --- AI Helper & Components ---

const callAI = async (model: ModelType, prompt: string): Promise<any> => {

  // GROQ
  if (model === "Llama 3.3 70B (Groq)") {
    const groqKey = process.env.VITE_GROQ_API_KEY || localStorage.getItem('cwc_groq_key');

    if (!groqKey) throw new Error("Groq API Key missing. Check .env or settings.");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a professional cinematic screenplay writer and social media strategist. Return ONLY valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Groq Error");
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  // GEMINI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const targetModel =
    model === "Gemini 3 Flash"
      ? "gemini-3-flash-preview"
      : "gemini-3-pro-preview";

  const response = await ai.models.generateContent({
    model: targetModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) return {};
  return JSON.parse(text);
};

const SelectGroup = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: any) => void, options: string[] }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold text-cinema-text/40 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-cinema-border rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-cinema-gold focus:outline-none transition-colors hover:bg-white/5 cursor-pointer"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-gray-900 text-white">{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cinema-text/50">
        <Icons.DownArrow />
      </div>
    </div>
  </div>
);

const ArchiveView = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(DB.getProjects());
  }, []);

  if (selected) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelected(null)} className="mb-6 flex items-center gap-2 text-cinema-gold text-xs uppercase tracking-widest hover:text-white transition-colors">
           <Icons.ChevronLeft /> Back to Archive
        </button>
        <ResultDeck project={selected} onUpdateProject={(updated) => {
           const newProjects = projects.map(p => p.id === updated.id ? updated : p);
           setProjects(newProjects);
           DB.setProjects(newProjects);
           setSelected(updated);
        }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.length === 0 && (
        <div className="col-span-full text-center py-20 text-cinema-text/40 text-sm font-mono border border-dashed border-white/10 rounded-xl">
           No projects archived yet. Start creating in the Scene Generator.
        </div>
      )}
      {projects.map((p) => (
        <div key={p.id} onClick={() => setSelected(p)} className="glass-panel p-6 rounded-xl border border-white/5 cursor-pointer hover:border-cinema-gold/30 hover:-translate-y-1 transition-all group relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-cinema-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-cinema-gold uppercase tracking-widest border border-cinema-gold/20 px-2 py-1 rounded">{p.genre}</span>
                <span className="text-[10px] text-cinema-text/40 font-mono">{new Date(p.timestamp).toLocaleDateString()}</span>
             </div>
             <h3 className="text-xl font-serif text-white mb-2 group-hover:text-cinema-gold transition-colors truncate">{p.title}</h3>
             <p className="text-xs text-cinema-text/50 mb-4 line-clamp-2">{p.length} • {p.tone}</p>
             <div className="flex items-center gap-2 text-[10px] text-cinema-text/30 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                Open Project <Icons.ChevronRight />
             </div>
           </div>
        </div>
      ))}
    </div>
  );
};

// --- MAIN STUDIO ---
const Studio = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>("Llama 3.3 70B (Groq)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-cube-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex bg-transparent font-sans min-h-screen">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      {/* Sidebar - Collapsible with Smooth Transition */}
      <aside 
        className={`fixed h-full z-40 backdrop-blur-xl flex flex-col bg-cinema-glass border-r border-cinema-border sidebar-transition ${isSidebarOpen ? 'w-72' : 'w-20'}`}
      >
        <div className="p-8 border-b border-cinema-border flex items-center gap-4 justify-center lg:justify-start relative">
          <div className="text-cinema-gold w-8 h-8 flex-shrink-0"><Icons.CineGenLogo /></div>
          <span className={`font-serif font-bold text-white tracking-widest text-sm whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 delay-100' : 'opacity-0 w-0'}`}>
            CINEGEN
          </span>
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="absolute -right-3 top-9 bg-cinema-bg border border-cinema-border w-6 h-6 rounded-full flex items-center justify-center text-cinema-gold hover:text-white hover:border-cinema-gold transition-colors z-50 shadow-lg"
          >
            {isSidebarOpen ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-3 mt-4 overflow-y-auto overflow-x-hidden">
          {isSidebarOpen && <p className="text-[10px] text-cinema-text/30 font-bold uppercase tracking-widest mb-2 pl-4 animate-fade-in">Navigation</p>}
          <NavAnchor href="#write" icon={<Icons.Feather />} label="Fresh Screenplay" collapsed={!isSidebarOpen} />
          <NavAnchor href="#rewrite" icon={<Icons.Rewrite />} label="Script Doctor" collapsed={!isSidebarOpen} />
          <NavAnchor href="#social" icon={<Icons.Social />} label="Social Campaign" collapsed={!isSidebarOpen} />
          <NavAnchor href="#archive" icon={<Icons.Archive />} label="Project Archive" collapsed={!isSidebarOpen} />
          
          <button 
             onClick={() => setShowSettings(true)}
             className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group duration-300 text-cinema-text/60 hover:text-white hover:bg-white/5 hover:text-cinema-gold ${!isSidebarOpen ? 'justify-center' : 'justify-start hover:pl-5'}`}
          >
             <div className="group-hover:rotate-45 transition-transform duration-500 flex-shrink-0"><Icons.Settings /></div>
             <span className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Settings</span>
          </button>
          
          <div className="h-4"></div>
        </nav>
        
        <div className="p-6 border-t border-cinema-border bg-black/20 overflow-hidden">
          <div className={`flex items-center gap-3 mb-4 px-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="w-8 h-8 rounded-full bg-cinema-gold text-black font-bold flex items-center justify-center text-xs shadow-lg flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{user.name}</p>
              <p className="text-[10px] text-cinema-text/40 truncate">Executive Producer</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className={`w-full flex items-center gap-3 text-cinema-text/50 hover:text-red-400 px-3 py-2 rounded-lg transition-colors text-xs uppercase tracking-widest hover:bg-white/5 ${!isSidebarOpen ? 'justify-center' : 'justify-start'}`}
          >
            <Icons.Logout /> <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Scroll Container - Dynamic Margin */}
      <main className={`flex-1 relative perspective-container content-transition ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <HeroSection />
        
        <FeaturesSection />

        <div className="px-8 lg:px-20 pb-40 space-y-40">
           {/* WRITER SECTION */}
           <section id="write" className="section-cube-reveal min-h-screen pt-20">
              <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                <h2 className="text-4xl font-serif text-white tracking-widest">SCENE GENERATOR</h2>
                <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
              </div>
              <WriterEngine model={selectedModel} />
           </section>

           {/* REWRITE SECTION */}
           <section id="rewrite" className="section-cube-reveal min-h-screen pt-20">
              <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl font-serif text-white tracking-widest">SCRIPT REWRITE ENGINE</h2>
                 <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
              </div>
              <RewriteEngine model={selectedModel} />
           </section>

           {/* SOCIAL MEDIA SECTION */}
           <section id="social" className="section-cube-reveal min-h-screen pt-20">
              <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl font-serif text-white tracking-widest">SOCIAL CAMPAIGN GENERATOR</h2>
                 <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
              </div>
              <SocialMediaEngine model={selectedModel} />
           </section>

           {/* ARCHIVE SECTION */}
           <section id="archive" className="section-cube-reveal min-h-screen pt-20">
              <h2 className="text-4xl font-serif text-white tracking-widest mb-12 border-b border-white/10 pb-6">PROJECT ARCHIVES</h2>
              <ArchiveView />
           </section>
        </div>
      </main>
    </div>
  );
};

const NavAnchor = ({ href, icon, label, collapsed }: any) => (
  <a href={href} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group duration-300 text-cinema-text/60 hover:text-white hover:bg-white/5 hover:text-cinema-gold ${collapsed ? 'justify-center' : 'justify-start hover:pl-5'}`}>
    <div className="group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <span className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{label}</span>
  </a>
);

const ModelSelector = ({ selected, onSelect }: { selected: ModelType, onSelect: (m: ModelType) => void }) => (
  <div className="flex items-center gap-4">
    <span className="hidden md:block text-[10px] font-bold text-cinema-text/40 uppercase tracking-widest:">AI Model:</span>
    <div className="flex bg-black/40 rounded-lg p-1 border border-cinema-border">
       <button onClick={() => onSelect("Gemini 3 Pro")} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${selected === "Gemini 3 Pro" ? 'bg-cinema-accent text-white shadow-lg' : 'text-cinema-text/50 hover:text-white'}`}>Gemini Pro</button>
       <button onClick={() => onSelect("Gemini 3 Flash")} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${selected === "Gemini 3 Flash" ? 'bg-cyan-600 text-white shadow-lg' : 'text-cinema-text/50 hover:text-white'}`}>Gemini Flash</button>
       <button onClick={() => onSelect("Llama 3.3 70B (Groq)")} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${selected === "Llama 3.3 70B (Groq)" ? 'bg-cinema-gold text-black shadow-lg' : 'text-cinema-text/50 hover:text-white'}`}>Llama 3.3</button>
    </div>
  </div>
);

// --- 3. Social Media Engine (NEW) ---
const SocialMediaEngine = ({ model }: { model: ModelType }) => {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<SocialCampaign | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic) { setError("Topic is required."); return; }
    setError("");
    setLoading(true);
    setCampaign(null);

    const prompt = `
      You are an expert Social Media Strategist and Content Creator.
      Create a comprehensive social media campaign about: "${topic}".
      Language: ${language}.

      Requirements:
      1. INSTAGRAM: A catchy caption, 15+ relevant hashtags, and a detailed description for an image to generate.
      2. TWITTER (X): A thread of 3-5 engaging tweets.
      3. LINKEDIN: A professional, value-driven post suitable for a business network.
      4. TIKTOK / REELS: A creative 30-second video script with visual cues and dialogue/narration.

      Output strictly valid JSON with this structure:
      {
        "instagram": { "caption": "string", "hashtags": "string", "imageIdea": "string" },
        "twitter": ["string", "string", ...],
        "linkedin": "string",
        "tiktok": "string"
      }
    `;

    try {
      const [data] = await Promise.all([
        callAI(model, prompt),
        new Promise(resolve => setTimeout(resolve, 2000)) // Cinematic pause
      ]);
      setCampaign(data);
    } catch (e: any) {
      setError("Campaign Generation Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {loading && <CinematicRevealOverlay />}

      {/* Input Section */}
      <div className="glass-panel p-8 rounded-2xl border-t border-white/10 relative overflow-hidden group hover:border-cinema-gold/20 transition-all duration-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="md:col-span-2 space-y-4">
             <h3 className="text-xs font-bold text-cinema-gold uppercase tracking-widest mb-2 flex items-center gap-2"><Icons.Social /> Topic / Core Idea</h3>
             <textarea 
               value={topic} 
               onChange={e => setTopic(e.target.value)} 
               placeholder="e.g. The launch of our new sci-fi movie, 'Starfall'..." 
               className="w-full h-32 bg-black/40 border border-cinema-border rounded-xl p-5 text-white text-sm font-sans focus:border-cinema-gold focus:outline-none transition-all resize-none leading-relaxed" 
             />
          </div>
          <div className="space-y-6 flex flex-col justify-end">
             <SelectGroup 
               label="Target Language" 
               value={language} 
               onChange={setLanguage} 
               options={["English", "Spanish", "French", "German", "Japanese", "Korean", "Chinese", "Hindi", "Italian", "Portuguese"]} 
             />
             <button 
               onClick={handleGenerate} 
               disabled={loading} 
               className="w-full py-4 bg-gradient-to-r from-cinema-accent to-[#6040d0] rounded-xl text-white font-bold text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50"
             >
               Generate Campaign
             </button>
          </div>
        </div>
        {error && <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-xs font-mono rounded-lg">{error}</div>}
      </div>

      {/* Results Section */}
      {campaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
          
          {/* Instagram */}
          <div className="glass-panel p-0 rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/30 transition-colors">
             <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-pink-300">Instagram</span>
             </div>
             <div className="p-6 space-y-4">
                <div>
                   <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Caption</label>
                   <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{campaign.instagram.caption}</p>
                </div>
                <div>
                   <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Hashtags</label>
                   <p className="text-xs text-cinema-accent mt-1">{campaign.instagram.hashtags}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                   <label className="text-[10px] text-cinema-gold uppercase tracking-widest font-bold flex items-center gap-2"><Icons.Film /> Image Concept</label>
                   <p className="text-xs text-gray-400 mt-1 italic">{campaign.instagram.imageIdea}</p>
                </div>
             </div>
          </div>

          {/* Twitter Thread */}
          <div className="glass-panel p-0 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/30 transition-colors">
             <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Twitter / X Thread</span>
             </div>
             <div className="p-6 space-y-6">
                {campaign.twitter.map((tweet, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{i+1}</div>
                        {i < campaign.twitter.length - 1 && <div className="w-0.5 flex-1 bg-white/10 my-1"></div>}
                     </div>
                     <p className="text-sm text-gray-300 pt-0.5">{tweet}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* LinkedIn */}
          <div className="glass-panel p-0 rounded-xl overflow-hidden border border-white/10 hover:border-blue-700/30 transition-colors">
             <div className="bg-gradient-to-r from-blue-950/40 to-indigo-900/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">LinkedIn Professional</span>
             </div>
             <div className="p-6">
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{campaign.linkedin}</p>
             </div>
          </div>

           {/* TikTok */}
           <div className="glass-panel p-0 rounded-xl overflow-hidden border border-white/10 hover:border-teal-500/30 transition-colors">
             <div className="bg-gradient-to-r from-teal-900/40 to-emerald-900/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-300">TikTok / Reels Script</span>
             </div>
             <div className="p-6">
                <div className="font-mono text-xs text-gray-400 whitespace-pre-wrap leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                  {campaign.tiktok}
                </div>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

// --- 1. Fresh Writer Engine ---
const WriterEngine = ({ model }: { model: ModelType }) => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<Genre>("Thriller");
  const [tone, setTone] = useState<Tone>("Cinematic");
  const [length, setLength] = useState<Length>("Short Film");
  const [language, setLanguage] = useState<Language>("English");
  
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!title) { setError("Story Concept is required."); return; }
    setError("");
    setLoading(true);
    setProject(null);

    const prompt = `
      You are an award-winning Hollywood Screenwriter and Sound Designer.
      Generate a ${length} ${genre} film in ${tone} tone.
      Language: ${language}.
      Concept: "${title}"
      Requirements:
      1. INDUSTRY SCREENPLAY: Standard formatting (INT./EXT.). Cinematic action. Natural dialogue.
      2. CHARACTER PROFILES: 3-5 layered characters. Psychology, Conflict, Arc.
      3. SOUND DESIGN: Scene-by-scene breakdown. Music style, Ambient texture, SFX, Audio emotion.
      Insert "--- PAGE BREAK ---" markers every ~500 words in the screenplay.
      Output strictly JSON: { "screenplay": "string", "characters": "string", "soundDesign": "string" }
    `;

    try {
      // THEATRICAL PAUSE: Enforce minimum 2.5s wait for cinematic effect
      const [data] = await Promise.all([
        callAI(model, prompt),
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);
      
      const newProj: Project = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        title, genre, tone, length, model,
        screenplay: data.screenplay,
        characters: data.characters,
        soundDesign: data.soundDesign,
        promptUsed: prompt
      };
      setProject(newProj);
      DB.saveProject(newProj);
    } catch (e: any) {
      setError("Production Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {loading && <CinematicRevealOverlay />}
      
      <div className="glass-panel p-8 rounded-2xl border-t border-white/10 relative overflow-hidden group hover:border-cinema-gold/20 transition-all duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cinema-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-cinema-gold uppercase tracking-widest mb-4 flex items-center gap-2"><Icons.Sparkles /> Core Concept</h3>
            <textarea value={title} onChange={e => setTitle(e.target.value)} placeholder="Logline..." className="w-full h-40 bg-black/40 border border-cinema-border rounded-xl p-5 text-white text-lg font-sans focus:border-cinema-gold focus:outline-none transition-all resize-none leading-relaxed" />
          </div>
          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <SelectGroup label="Genre" value={genre} onChange={setGenre} options={["Thriller", "Comedy", "Horror", "Romance", "Sci-Fi", "Crime", "Drama", "Action", "Noir", "Fantasy"]} />
                <SelectGroup label="Length" value={length} onChange={setLength} options={["Short Film", "Medium Film", "Feature Length"]} />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <SelectGroup 
                   label="Language" 
                   value={language} 
                   onChange={setLanguage} 
                   options={["English", "Spanish", "French", "German", "Japanese", "Korean", "Chinese", "Hindi", "Italian", "Portuguese"]} 
                 />
                <div>
                   <label className="block text-[10px] font-bold text-cinema-text/40 uppercase tracking-widest mb-3">Tone</label>
                   <select value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full bg-black/40 border border-cinema-border rounded-xl px-4 py-3 text-sm text-white appearance-none focus:border-cinema-gold focus:outline-none">
                     {["Cinematic", "Dark & Gritty", "Emotional", "Suspenseful", "Psychological", "Inspirational", "Satirical"].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
             </div>
             <button onClick={handleGenerate} disabled={loading} className="w-full py-5 bg-gradient-to-r from-cinema-accent to-[#6040d0] rounded-xl text-white font-bold text-sm uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50">Generate Blueprint</button>
          </div>
        </div>
        {error && <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-xs font-mono rounded-lg">{error}</div>}
      </div>

      {project && <ResultDeck project={project} onUpdateProject={setProject} />}
    </div>
  );
};

// --- 2. Rewrite Engine ---
const RewriteEngine = ({ model }: { model: ModelType }) => {
  const [script, setScript] = useState("");
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler for .docx and .pdf
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      let extractedText = "";

      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }
        extractedText = fullText;
      } else {
        // Assume text file
        extractedText = await file.text();
      }

      setScript(extractedText);
    } catch (err: any) {
      setError("File Parsing Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!script || !instructions) { setError("Script and Instructions are required."); return; }
    setError("");
    setLoading(true);
    setProject(null);

    const prompt = `
      You are an expert Script Doctor.
      Rewrite the following screenplay segment based on these instructions: "${instructions}"
      Output Language: ${language}.
      
      ORIGINAL SCRIPT:
      ${script}

      Requirements:
      1. REWRITTEN SCREENPLAY: Apply the changes. Maintain standard formatting.
      2. CHARACTER PROFILES: Update profiles if characters changed, otherwise summarize current ones.
      3. SOUND DESIGN: Update sound design plan for the new scene.
      Insert "--- PAGE BREAK ---" markers every ~500 words in the screenplay.
      Output strictly JSON: { "screenplay": "string", "characters": "string", "soundDesign": "string" }
    `;

    try {
      // THEATRICAL PAUSE
      const [data] = await Promise.all([
        callAI(model, prompt),
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);

      const newProj: Project = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        title: "Rewrite Project",
        genre: "Drama",
        tone: "Cinematic",
        length: "Medium Film",
        model,
        screenplay: data.screenplay,
        characters: data.characters,
        soundDesign: data.soundDesign,
        promptUsed: prompt
      };
      setProject(newProj);
      DB.saveProject(newProj);
    } catch (e: any) {
      setError("Rewrite Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {loading && <CinematicRevealOverlay />}
      
      <div className="glass-panel p-8 rounded-2xl border-t border-white/10 relative overflow-hidden group hover:border-cinema-gold/20 transition-all duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cinema-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xs font-bold text-cinema-gold uppercase tracking-widest"><Icons.Film /> Original Script</h3>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white font-bold uppercase tracking-wider transition-colors border border-white/10 flex items-center gap-2"
               >
                 <Icons.Upload /> Upload .DOCX / .PDF
               </button>
               <input 
                 type="file" 
                 accept=".docx, .pdf, .txt" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileUpload} 
               />
            </div>
            <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Paste screenplay here or upload a file..." className="w-full h-64 bg-black/40 border border-cinema-border rounded-xl p-5 text-white text-xs font-mono focus:border-cinema-gold focus:outline-none transition-all resize-none leading-relaxed custom-scrollbar" />
          </div>
          <div className="space-y-8 flex flex-col h-full">
             <div className="flex-1 space-y-4">
               <div>
                  <h3 className="text-xs font-bold text-cinema-gold uppercase tracking-widest mb-3"><Icons.Rewrite /> Doctor's Notes</h3>
                  <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Instructions: e.g. 'Make the dialogue snappier', 'Change setting to 1980s Miami'..." className="w-full h-32 bg-black/40 border border-cinema-border rounded-xl p-5 text-white text-sm font-sans focus:border-cinema-gold focus:outline-none transition-all resize-none leading-relaxed" />
               </div>
               <SelectGroup 
                   label="Output Language" 
                   value={language} 
                   onChange={setLanguage} 
                   options={["English", "Spanish", "French", "German", "Japanese", "Korean", "Chinese", "Hindi", "Italian", "Portuguese"]} 
               />
             </div>
             <button onClick={handleRewrite} disabled={loading} className="w-full py-5 bg-gradient-to-r from-cinema-accent to-[#6040d0] rounded-xl text-white font-bold text-sm uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50">Rewrite Script</button>
          </div>
        </div>
        {error && <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-xs font-mono rounded-lg">{error}</div>}
      </div>

      {project && <ResultDeck project={project} onUpdateProject={setProject} />}
    </div>
  );
};

// --- Shared: Result Display with Character Renaming ---
const ResultDeck = ({ project, onUpdateProject }: { project: Project, onUpdateProject: (p: Project) => void }) => {
  const [chars, setChars] = useState<string[]>([]);
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Helper to Title Case a name (e.g. JASON -> Jason)
  const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

  useEffect(() => {
    // Improved regex to handle indentation and multiple names
    // Matches lines that are all uppercase (allowing for spaces/indentation)
    // Excludes generic headers like EXT. INT. CUT TO.
    const regex = /(?:^|\n)\s*([A-Z][A-Z\s\(\)\d]+)(?=\n)/g;
    const matches = project.screenplay.match(regex);
    
    if (matches) {
      const unique = [...new Set(matches.map(m => {
        return m.trim().replace(/\s*\(.*?\)/g, ""); // Remove parentheticals for the ID
      }))];
      
      const filtered = unique.filter(n => {
        const clean = n.trim();
        return (
          clean.length > 2 &&
          !clean.includes('EXT.') && 
          !clean.includes('INT.') && 
          !clean.includes('CUT TO') &&
          !clean.includes('FADE') &&
          !clean.includes('DISSOLVE') &&
          /^[A-Z\s\d]+$/.test(clean) // Ensure strictly uppercase/numbers
        );
      });
      setChars(filtered);
    }
  }, [project.screenplay]);

  const handleRename = (oldName: string, newName: string) => {
    if (!newName) return;
    const upperOld = oldName;
    const upperNew = newName.toUpperCase();
    const titleOld = toTitleCase(oldName);
    const titleNew = toTitleCase(newName);
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    
    let updated = project.screenplay.replace(new RegExp(`\\b${escapeRegExp(upperOld)}\\b`, 'g'), upperNew);
    updated = updated.replace(new RegExp(`\\b${escapeRegExp(titleOld)}\\b`, 'g'), titleNew);
    
    onUpdateProject({ ...project, screenplay: updated });
    setHighlightWord(upperNew);
    setTimeout(() => setHighlightWord(null), 2000);
  };

  const renderScreenplay = () => {
    if (!highlightWord) return project.screenplay;
    const upper = highlightWord;
    const title = toTitleCase(highlightWord);
    const regex = new RegExp(`(${upper}|${title})`, 'g');
    const parts = project.screenplay.split(regex);
    
    return parts.map((part, i) => (
      <span key={i}>
        {part === upper || part === title ? <span className="animate-text-flash font-bold inline-block">{part}</span> : part}
      </span>
    ));
  };

  // Parse Characters for cards if they are in JSON format (heuristic) or text block
  const charList = project.characters.split('\n').filter(l => l.length > 5).slice(0, 4);

  return (
    <div className="space-y-8 pb-20 relative animate-impact">
      <div className="flex items-center justify-between card-rise-anim" style={{animationDelay: '0.1s'}}>
         <h3 className="text-2xl font-serif text-white tracking-widest">PRODUCTION ASSETS</h3>
         <button onClick={() => generatePDF(project)} className="flex items-center gap-2 bg-cinema-glass hover:bg-white/10 border border-white/20 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"><Icons.Download /> Export PDF</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Holographic Script */}
        <div className={`col-span-2 glass-panel rounded-xl overflow-hidden hologram-script transition-colors duration-500`}>
          <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
             <h4 className="text-cinema-gold font-bold tracking-[0.2em] text-xs flex items-center gap-2"><Icons.Feather /> SCREENPLAY</h4>
          </div>
          <div className="p-8 max-h-[700px] overflow-y-auto custom-scrollbar bg-white/[0.02]">
             <div className="font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{renderScreenplay()}</div>
          </div>
        </div>

        {/* Curtain-Slide Sound Panel (Right Side) */}
        <div className="curtain-slide-anim" style={{animationDelay: '2.5s'}}>
           <div className="glass-panel rounded-xl overflow-hidden h-full border border-white/10">
              <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                 <h4 className="text-pink-500 font-bold tracking-[0.2em] text-xs flex items-center gap-2"><Icons.Upload /> SOUND DESIGN</h4>
              </div>
              <div className="p-6 max-h-[700px] overflow-y-auto custom-scrollbar bg-white/[0.02] text-xs font-mono text-gray-400 leading-7">
                 {project.soundDesign}
              </div>
           </div>
        </div>
      </div>

      {/* 3D Character Cards */}
      <div className="pt-8">
         <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 card-rise-anim" style={{animationDelay: '1.0s'}}>Cast & Character Psychology</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-container">
            {chars.slice(0, 4).map((char, i) => (
               <CharacterCard 
                  key={i} 
                  name={char} 
                  description="A complex figure driven by hidden motivations. [Detailed psychological profile generated by neural engine]" 
                  delay={1.2 + (i * 0.2)}
               />
            ))}
         </div>
      </div>

      {/* Renaming Tools - Always Visible */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 card-rise-anim" style={{animationDelay: '2.0s'}}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-cinema-gold animate-pulse"></div>
             <h4 className="text-xs font-bold text-white uppercase tracking-widest">Character Renaming Studio</h4>
          </div>
          
          {chars.length === 0 ? (
             <div className="text-cinema-text/40 text-xs font-mono p-4 border border-dashed border-white/10 rounded-lg">
                No characters detected automatically. Script formatting may vary.
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {chars.map((char, i) => (
                 <div key={i} className="flex flex-col gap-1 group">
                   <label className="text-[10px] text-cinema-text/50 uppercase group-hover:text-cinema-gold transition-colors">{char}</label>
                   <input 
                      type="text" 
                      placeholder={`Rename ${char}...`} 
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cinema-gold focus:outline-none focus:bg-white/10 transition-all placeholder-white/20" 
                      onBlur={(e) => handleRename(char, e.target.value)} 
                   />
                 </div>
               ))}
            </div>
          )}
      </div>

      {/* Prompt Log */}
      <div className="glass-panel p-0 rounded-xl border border-white/5 overflow-hidden card-rise-anim" style={{animationDelay: '3.0s'}}>
         <button onClick={() => setShowPrompt(!showPrompt)} className="w-full px-6 py-4 bg-black/40 text-left text-[10px] font-bold uppercase tracking-widest text-cinema-text/60 hover:text-white flex items-center gap-2 transition-colors">
            <Icons.Terminal /> {showPrompt ? "Hide Neural Log" : "View Neural Log"}
         </button>
         {showPrompt && (
           <div className="bg-black/80 p-6 font-mono text-xs text-green-500/80 border-t border-white/5 animate-fade-in shadow-inner">
             <div className="mb-2 opacity-50 border-b border-green-900/30 pb-2"> // LOG: PROMPT_SENT_TIMESTAMP_{Date.now()}</div>
             <pre className="whitespace-pre-wrap">{project.promptUsed}</pre>
           </div>
         )}
      </div>
    </div>
  );
};

// --- Auth Component (Handles persistent credentials) ---
const Auth = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Credentials check against stored user data
      const res = DB.login(email, pass);
      if (res.success) onLogin(res.user); else setError(res.msg || "Error");
    } else {
      if (pass.length < 8) { setError("Password must be at least 8 characters."); return; }
      const res = DB.register(name, email, pass);
      if (res.success) { setIsLogin(true); setError("Account created. Please login."); } else setError(res.msg || "Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cinema-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="text-center mb-12 z-10 animate-slide-up perspective-container">
        <div className="w-20 h-20 bg-gradient-to-br from-cinema-gold to-yellow-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(184,155,94,0.3)] rotate-3 hover:rotate-6 transition-transform duration-700 hover:scale-110"><Icons.CineGenLogo /></div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-widest mb-3 text-white text-glow">CINE <span className="text-cinema-gold italic font-light">&</span> GEN</h1>
        <p className="text-cinema-text/50 text-xs uppercase tracking-[0.4em]">Hollywood AI Creative Suite</p>
      </div>
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl z-10 animate-fade-in delay-100 relative overflow-hidden group hover:border-cinema-gold/30 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
        <div className="flex gap-4 mb-8 border-b border-cinema-border pb-1">
          <button onClick={() => setIsLogin(true)} className={`flex-1 pb-4 text-xs font-bold tracking-widest uppercase transition-colors ${isLogin ? 'text-cinema-gold border-b-2 border-cinema-gold' : 'text-cinema-text/40'}`}>Studio Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 pb-4 text-xs font-bold tracking-widest uppercase transition-colors ${!isLogin ? 'text-cinema-gold border-b-2 border-cinema-gold' : 'text-cinema-text/40'}`}>Register Director</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && <input required placeholder="Director Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-cinema-border rounded-lg px-4 py-3.5 text-sm focus:border-cinema-gold focus:outline-none transition-all text-white placeholder-gray-600" />}
          <input required type="email" placeholder="Studio Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-cinema-border rounded-lg px-4 py-3.5 text-sm focus:border-cinema-gold focus:outline-none transition-all text-white placeholder-gray-600" />
          <input required type="password" placeholder="Passcode (Min 8 chars)" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-black/40 border border-cinema-border rounded-lg px-4 py-3.5 text-sm focus:border-cinema-gold focus:outline-none transition-all text-white placeholder-gray-600" />
          {error && <p className="text-red-400 text-xs text-center border border-red-900/30 bg-red-900/10 p-3 rounded font-mono">{error}</p>}
          <button type="submit" className="w-full bg-cinema-gold hover:bg-[#d4bf88] text-black font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(184,155,94,0.3)] transition-all transform hover:scale-[1.02] uppercase tracking-widest text-xs flex items-center justify-center gap-2">{isLogin ? "Enter Studio" : "Initialize Access"} <span className="text-lg">→</span></button>
        </form>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<React.StrictMode><App /></React.StrictMode>);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Session persistence check
    const saved = localStorage.getItem('cwc_session');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: User) => { 
    setShowIntro(true);
    setUser(u); 
    localStorage.setItem('cwc_session', JSON.stringify(u));
    setTimeout(() => {
       setShowIntro(false);
    }, 3500); 
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('cwc_session'); };

  return (
    <>
      {showIntro && <CinematicIntro />}
      {user ? <Studio user={user} onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />}
    </>
  );
}
