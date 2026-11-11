
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useSettings,
  type Language,
} from "@/components/SettingsProvider";

const translations = {
  en: {
    features: "Features",
    about: "About",
    solutions: "Solutions",
    dashboard: "Dashboard",
    getStarted: "Get Started",
    badge: "AI-Powered Construction Intelligence",
    title1: "Build Smarter.",
    title2: "Manage Better.",
    heroDescription:
      "Transform construction project management with intelligent insights, smart budget tracking, material monitoring and AI-powered risk analysis.",
    explore: "Explore Features",
    tagline: "One platform. Smarter construction decisions.",
    heroLabel: "THE FUTURE OF CONSTRUCTION",
    heroSmall: "SMARTER PROJECTS START HERE",
    capabilities: "OUR CAPABILITIES",
    sectionTitle: "Everything Your Project Needs",
    sectionDescription:
      "Smart tools designed to improve construction project visibility and decision-making.",
    feature1: "Smart Project Management",
    feature1Desc: "Organize projects, tasks, milestones and deadlines.",
    feature2: "Budget Intelligence",
    feature2Desc:
      "Monitor expenses, budget utilization and cost variations.",
    feature3: "Material Management",
    feature3Desc:
      "Track inventory and identify potential material shortages.",
    feature4: "Progress Monitoring",
    feature4Desc:
      "Identify delayed tasks and schedule-related risks.",
    feature5: "AI Risk Detection",
    feature5Desc:
      "Discover potential project risks with specialist AI agents.",
    feature6: "AI Project Assistant",
    feature6Desc:
      "Generate project insights, summaries and recommendations.",
    why: "WHY BUILDWISE AI?",
    aboutTitle: "A Smarter Way to Manage Construction.",
    aboutDescription:
      "BuildWise AI brings essential construction project information into one workspace, helping project teams monitor performance, understand risks and make informed decisions.",
    aboutPoint1: "Centralized project information",
    aboutPoint2: "AI-powered project insights",
    aboutPoint3: "Smarter resource and budget monitoring",
    aboutImageLabel: "BUILT FOR BETTER PROJECT CONTROL",
    ctaTitle: "Ready to Build Smarter?",
    ctaDescription:
      "Bring your construction project management into one intelligent platform.",
    openDashboard: "Open Dashboard",
    footer: "All rights reserved.",
    footerTagline: "Plan Smarter. Monitor Better. Build Efficiently.",
  },

  ur: {
    features: "خصوصیات",
    about: "تعارف",
    solutions: "سہولیات",
    dashboard: "ڈیش بورڈ",
    getStarted: "شروع کریں",
    badge: "مصنوعی ذہانت پر مبنی تعمیراتی نظام",
    title1: "بہتر تعمیر کریں۔",
    title2: "بہتر انتظام کریں۔",
    heroDescription:
      "ذہین معلومات، بجٹ ٹریکنگ، میٹریل مانیٹرنگ اور AI رسک اینالیسس کے ذریعے تعمیراتی منصوبوں کا انتظام بہتر بنائیں۔",
    explore: "خصوصیات دیکھیں",
    tagline: "ایک پلیٹ فارم، بہتر تعمیراتی فیصلے۔",
    heroLabel: "تعمیرات کا مستقبل",
    heroSmall: "بہتر منصوبوں کا آغاز یہاں سے",
    capabilities: "ہماری خصوصیات",
    sectionTitle: "آپ کے منصوبے کے لیے مکمل سہولیات",
    sectionDescription:
      "تعمیراتی منصوبوں کی نگرانی اور بہتر فیصلوں کے لیے اسمارٹ ٹولز۔",
    feature1: "اسمارٹ پروجیکٹ مینجمنٹ",
    feature1Desc: "منصوبوں، کاموں اور ڈیڈ لائنز کا انتظام کریں۔",
    feature2: "بجٹ انٹیلیجنس",
    feature2Desc: "اخراجات اور بجٹ کی نگرانی کریں۔",
    feature3: "میٹریل مینجمنٹ",
    feature3Desc: "میٹریل کا ریکارڈ رکھیں اور کمی کی نشاندہی کریں۔",
    feature4: "پیش رفت کی نگرانی",
    feature4Desc: "تاخیر اور شیڈول کے مسائل کی نشاندہی کریں۔",
    feature5: "AI رسک ڈیٹیکشن",
    feature5Desc: "AI ایجنٹس کے ذریعے ممکنہ خطرات معلوم کریں۔",
    feature6: "AI پروجیکٹ اسسٹنٹ",
    feature6Desc: "منصوبے کی رپورٹس اور تجاویز حاصل کریں۔",
    why: "بلڈ وائز AI کیوں؟",
    aboutTitle: "تعمیراتی منصوبوں کا بہتر انتظام۔",
    aboutDescription:
      "BuildWise AI تعمیراتی منصوبوں کی اہم معلومات ایک جگہ فراہم کرتا ہے تاکہ ٹیمیں کارکردگی اور خطرات کی نگرانی کر سکیں اور بہتر فیصلے لے سکیں۔",
    aboutPoint1: "منصوبے کی تمام معلومات ایک جگہ",
    aboutPoint2: "AI کی مدد سے منصوبے کا تجزیہ",
    aboutPoint3: "وسائل اور بجٹ کی بہتر نگرانی",
    aboutImageLabel: "بہتر منصوبہ بندی کے لیے بنایا گیا",
    ctaTitle: "کیا آپ بہتر تعمیر کے لیے تیار ہیں؟",
    ctaDescription:
      "اپنے تعمیراتی منصوبے کو ایک ذہین پلیٹ فارم کے ذریعے منظم کریں۔",
    openDashboard: "ڈیش بورڈ کھولیں",
    footer: "تمام حقوق محفوظ ہیں۔",
    footerTagline: "بہتر منصوبہ بندی۔ بہتر نگرانی۔ بہتر تعمیر۔",
  },

  ar: {
    features: "المميزات",
    about: "من نحن",
    solutions: "الحلول",
    dashboard: "لوحة التحكم",
    getStarted: "ابدأ الآن",
    badge: "ذكاء اصطناعي لإدارة مشاريع البناء",
    title1: "ابنِ بذكاء.",
    title2: "أدر بشكل أفضل.",
    heroDescription:
      "حسّن إدارة مشاريع البناء من خلال التحليلات الذكية ومتابعة الميزانية والمواد وتحليل المخاطر باستخدام الذكاء الاصطناعي.",
    explore: "استكشف المميزات",
    tagline: "منصة واحدة لقرارات بناء أكثر ذكاءً.",
    heroLabel: "مستقبل البناء",
    heroSmall: "المشاريع الذكية تبدأ من هنا",
    capabilities: "قدراتنا",
    sectionTitle: "كل ما يحتاجه مشروعك",
    sectionDescription:
      "أدوات ذكية لتحسين متابعة مشاريع البناء واتخاذ القرارات.",
    feature1: "إدارة المشاريع الذكية",
    feature1Desc: "نظم المشاريع والمهام والمواعيد النهائية.",
    feature2: "ذكاء الميزانية",
    feature2Desc: "راقب المصروفات واستخدام الميزانية.",
    feature3: "إدارة المواد",
    feature3Desc: "تتبع المخزون واكتشف نقص المواد.",
    feature4: "متابعة التقدم",
    feature4Desc: "اكتشف تأخير المهام ومخاطر الجدول الزمني.",
    feature5: "اكتشاف المخاطر بالذكاء الاصطناعي",
    feature5Desc: "اكتشف المخاطر المحتملة باستخدام وكلاء AI.",
    feature6: "مساعد المشروع الذكي",
    feature6Desc: "أنشئ ملخصات وتوصيات للمشاريع.",
    why: "لماذا BuildWise AI؟",
    aboutTitle: "طريقة أكثر ذكاءً لإدارة البناء.",
    aboutDescription:
      "يجمع BuildWise AI معلومات مشاريع البناء في مساحة عمل واحدة لمساعدة الفرق على متابعة الأداء وفهم المخاطر واتخاذ قرارات أفضل.",
    aboutPoint1: "معلومات المشروع في مكان واحد",
    aboutPoint2: "تحليلات المشاريع بالذكاء الاصطناعي",
    aboutPoint3: "متابعة أفضل للموارد والميزانية",
    aboutImageLabel: "لتحكم أفضل بالمشاريع",
    ctaTitle: "هل أنت مستعد للبناء بذكاء؟",
    ctaDescription:
      "أدر مشروع البناء الخاص بك من خلال منصة ذكية واحدة.",
    openDashboard: "افتح لوحة التحكم",
    footer: "جميع الحقوق محفوظة.",
    footerTagline: "خطط بذكاء. راقب بشكل أفضل. ابنِ بكفاءة.",
  },

  zh: {
    features: "功能",
    about: "关于我们",
    solutions: "解决方案",
    dashboard: "控制面板",
    getStarted: "立即开始",
    badge: "人工智能建筑管理平台",
    title1: "智能建造。",
    title2: "高效管理。",
    heroDescription:
      "通过智能分析、预算跟踪、材料监控和人工智能风险分析，提升建筑项目管理效率。",
    explore: "探索功能",
    tagline: "一个平台，让建筑决策更智能。",
    heroLabel: "建筑行业的未来",
    heroSmall: "智能项目，从这里开始",
    capabilities: "我们的功能",
    sectionTitle: "项目所需的一切功能",
    sectionDescription:
      "帮助提升建筑项目可视性和决策能力的智能工具。",
    feature1: "智能项目管理",
    feature1Desc: "组织项目、任务、里程碑和截止日期。",
    feature2: "预算智能分析",
    feature2Desc: "监控支出、预算使用情况和成本变化。",
    feature3: "材料管理",
    feature3Desc: "跟踪库存并识别材料短缺。",
    feature4: "进度监控",
    feature4Desc: "识别任务延迟和进度风险。",
    feature5: "AI 风险检测",
    feature5Desc: "通过专业 AI 智能体发现潜在项目风险。",
    feature6: "AI 项目助手",
    feature6Desc: "生成项目分析、摘要和建议。",
    why: "为什么选择 BuildWise AI？",
    aboutTitle: "更智能的建筑项目管理方式。",
    aboutDescription:
      "BuildWise AI 将重要的建筑项目信息集中在一个工作空间，帮助团队监控绩效、了解风险并做出明智决策。",
    aboutPoint1: "集中管理项目信息",
    aboutPoint2: "AI 智能项目分析",
    aboutPoint3: "更高效的资源和预算监控",
    aboutImageLabel: "助力更好的项目管理",
    ctaTitle: "准备好开启智能建造了吗？",
    ctaDescription:
      "通过一个智能平台管理您的建筑项目。",
    openDashboard: "打开控制面板",
    footer: "版权所有。",
    footerTagline: "智能规划。高效监控。卓越建造。",
  },
};

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  const {
    language,
    setLanguage,
    setTheme,
    isDark,
    isRTL,
  } = useSettings();

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundPlayedRef = useRef(false);

  const t = translations[language];

  const heroImage =
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2200&q=90";

  const aboutImage =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=90";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, []);

  /* WHOOSH SOUND */
  function playWhoosh(
    context: AudioContext,
    master: GainNode,
    start: number
  ) {
    const duration = 1;
    const size = Math.floor(context.sampleRate * duration);

    const buffer = context.createBuffer(1, size, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < size; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / size);
    }

    const noise = context.createBufferSource();
    noise.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, start);
    filter.frequency.exponentialRampToValueAtTime(2800, start + 0.45);
    filter.frequency.exponentialRampToValueAtTime(400, start + duration);

    const volume = context.createGain();
    volume.gain.setValueAtTime(0.001, start);
    volume.gain.linearRampToValueAtTime(0.15, start + 0.25);
    volume.gain.exponentialRampToValueAtTime(0.001, start + duration);

    noise.connect(filter);
    filter.connect(volume);
    volume.connect(master);

    noise.start(start);
    noise.stop(start + duration);

    const bass = context.createOscillator();
    const bassGain = context.createGain();

    bass.type = "sine";
    bass.frequency.setValueAtTime(90, start);
    bass.frequency.exponentialRampToValueAtTime(190, start + 0.65);

    bassGain.gain.setValueAtTime(0.001, start);
    bassGain.gain.linearRampToValueAtTime(0.07, start + 0.3);
    bassGain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);

    bass.connect(bassGain);
    bassGain.connect(master);

    bass.start(start);
    bass.stop(start + 0.9);
  }

  /* LOGO RISE SOUND */
  function playLogoRise(
    context: AudioContext,
    master: GainNode,
    start: number
  ) {
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(240, start);
    oscillator.frequency.exponentialRampToValueAtTime(850, start + 0.85);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, start);
    filter.frequency.linearRampToValueAtTime(2600, start + 0.85);

    volume.gain.setValueAtTime(0.001, start);
    volume.gain.linearRampToValueAtTime(0.065, start + 0.3);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.9);

    oscillator.connect(filter);
    filter.connect(volume);
    volume.connect(master);

    oscillator.start(start);
    oscillator.stop(start + 0.95);
  }

  /* CHIME */
  function playChime(
    context: AudioContext,
    master: GainNode,
    start: number
  ) {
    [740, 988, 1174, 1480].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      const noteStart = start + index * 0.12;

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      volume.gain.setValueAtTime(0.001, noteStart);
      volume.gain.linearRampToValueAtTime(0.055, noteStart + 0.04);
      volume.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.9);

      oscillator.connect(volume);
      volume.connect(master);

      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.95);
    });
  }

  /* CONFIRMATION SOUND */
  function playConfirmation(
    context: AudioContext,
    master: GainNode,
    start: number
  ) {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const volume = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      volume.gain.setValueAtTime(0.001, start);
      volume.gain.linearRampToValueAtTime(0.045, start + 0.08);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.95);

      oscillator.connect(volume);
      volume.connect(master);

      oscillator.start(start + index * 0.035);
      oscillator.stop(start + 1);
    });
  }

  /* START SPLASH SOUND */
  const startSplashSound = useCallback(async () => {
    if (soundPlayedRef.current) return;

    try {
      let context = audioContextRef.current;

      if (!context) {
        context = new AudioContext();
        audioContextRef.current = context;
      }

      if (context.state !== "running") {
        await context.resume();
      }

      if (context.state !== "running") return;

      soundPlayedRef.current = true;

      const master = context.createGain();
      master.gain.value = 0.65;
      master.connect(context.destination);

      const start = context.currentTime + 0.05;

      playWhoosh(context, master, start);
      playLogoRise(context, master, start + 0.45);
      playChime(context, master, start + 1.15);
      playConfirmation(context, master, start + 2.05);
    } catch (error) {
      console.info("Automatic audio playback was blocked.", error);
    }
  }, []);

  /* AUDIO FALLBACK */
  useEffect(() => {
    const audioTimer = window.setTimeout(() => {
      void startSplashSound();
    }, 100);

    const handleInteraction = () => {
      if (!soundPlayedRef.current) {
        void startSplashSound();
      }
    };

    window.addEventListener("pointerdown", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.clearTimeout(audioTimer);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [startSplashSound]);

  /* AUDIO CLEANUP */
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const features = [
    {
      number: "01",
      icon: "🏗️",
      title: t.feature1,
      description: t.feature1Desc,
    },
    {
      number: "02",
      icon: "📊",
      title: t.feature2,
      description: t.feature2Desc,
    },
    {
      number: "03",
      icon: "📦",
      title: t.feature3,
      description: t.feature3Desc,
    },
    {
      number: "04",
      icon: "📈",
      title: t.feature4,
      description: t.feature4Desc,
    },
    {
      number: "05",
      icon: "🛡️",
      title: t.feature5,
      description: t.feature5Desc,
    },
    {
      number: "06",
      icon: "✦",
      title: t.feature6,
      description: t.feature6Desc,
    },
  ];

  const themeButton = isDark
    ? "border-slate-600 bg-slate-800 text-cyan-300 hover:bg-slate-700"
    : "border-slate-200 bg-white text-[#101E36] hover:bg-cyan-50";

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDark ? "bg-[#0B1629] text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#101E36]">
          <div className="absolute h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />

          <div className="logo-animation relative flex h-28 w-28 items-center justify-center">
            <div className="absolute h-20 w-20 rotate-45 rounded-2xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.45)] animate-logo-glow" />
            <div className="absolute h-24 w-24 rounded-full border border-cyan-400/20 animate-logo-ring" />
            <div className="relative text-6xl font-black tracking-tighter text-white">
              B<span className="text-cyan-400">W</span>
            </div>
          </div>

          <h1 className="mt-9 splash-title text-4xl font-bold tracking-tight text-white">
            BuildWise<span className="text-cyan-400"> AI</span>
          </h1>

          <p className="mt-3 splash-subtitle text-sm tracking-[0.25em] text-slate-300">
            PLAN SMARTER. BUILD BETTER.
          </p>

          <div className="mt-12 h-1 w-44 overflow-hidden rounded-full bg-slate-700">
            <div className="loading-bar h-full rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          </div>

          <p className="mt-5 text-[10px] tracking-[0.3em] text-slate-500">
            INITIALIZING INTELLIGENCE
          </p>
        </div>
      )}

      {/* HERO + NAVIGATION */}
      <section
        className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-[#101E36] text-white md:min-h-[680px]"
        style={{
          backgroundImage: `url("${heroImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 -z-10 bg-[#071629]/40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071629]/75 via-[#101E36]/55 to-[#101E36]/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071629]/65 via-transparent to-[#071629]/20" />

        <nav className="relative z-20 mx-auto flex w-full max-w-[1500px] flex-col items-center justify-between gap-5 border-b border-white/15 bg-[#071629]/25 px-5 py-5 backdrop-blur-sm sm:px-8 md:flex-row md:px-12 lg:px-16">
          <a href="#" className="shrink-0 text-2xl font-bold tracking-tight text-white">
            BuildWise<span className="text-cyan-400"> AI</span>
          </a>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-white">
            <a href="#features" className="transition hover:text-cyan-300">{t.features}</a>
            <a href="#about" className="transition hover:text-cyan-300">{t.about}</a>
            <a href="#solutions" className="transition hover:text-cyan-300">{t.solutions}</a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <select
              aria-label="Select language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-cyan-400 ${themeButton}`}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="ar">العربية</option>
              <option value="zh">简体中文</option>
            </select>

            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle color theme"
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${themeButton}`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <a
              href="/dashboard"
              className="rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              {t.dashboard}
            </a>
          </div>
        </nav>

        {/* TWO-COLUMN HERO */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] flex-1 items-center gap-10 px-6 py-12 sm:px-10 md:px-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-16 lg:py-14">
          {/* LEFT SIDE */}
          <div className={`max-w-2xl ${isRTL ? "text-right" : "text-left"}`}>
            <p className="mb-6 inline-flex max-w-full items-center gap-3 rounded-full border border-cyan-300/40 bg-[#071629]/60 px-5 py-3 text-xs font-bold text-cyan-200 backdrop-blur-md md:text-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
              {t.badge}
            </p>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300 md:text-sm">
              {t.heroLabel}
            </p>

            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-[58px]">
              <span className="block">{t.title1}</span>
              <span className="mt-2 block text-cyan-400">{t.title2}</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 md:text-lg">
              {t.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap justify-start gap-4">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-[#101E36] shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:bg-cyan-300 sm:px-8"
              >
                {t.getStarted}
                <span className="text-xl">→</span>
              </a>

              <a
                href="#features"
                className="inline-flex items-center gap-3 rounded-xl border border-white/50 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-md transition duration-300 hover:border-cyan-300 hover:bg-white/20 sm:px-8"
              >
                {t.explore}
              </a>
            </div>

            <p className="mt-7 text-sm font-medium tracking-wide text-slate-300">
              {t.tagline}
            </p>
          </div>

          {/* RIGHT SIDE - AI AGENT NETWORK */}
          <div className="relative mx-auto w-full max-w-[430px] lg:ml-auto">
            <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative mx-auto h-[360px] w-full max-w-[420px]">
              {/* CONNECTION LINES */}
              <svg
                className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                viewBox="0 0 420 360"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="agentLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                <path
                  d="M210 120 L105 220"
                  stroke="url(#agentLine)"
                  strokeWidth="2"
                  strokeDasharray="7 7"
                  className="agent-line"
                />
                <path
                  d="M210 120 L315 220"
                  stroke="url(#agentLine)"
                  strokeWidth="2"
                  strokeDasharray="7 7"
                  className="agent-line agent-line-delay"
                />
                <path
                  d="M210 120 L210 235"
                  stroke="url(#agentLine)"
                  strokeWidth="2"
                  strokeDasharray="7 7"
                  className="agent-line agent-line-delay-2"
                />
              </svg>

              {/* TOP LABEL */}
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-center">
                <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300/80">
                  BUILDWISE AI
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Multi-Agent Intelligence
                </p>
              </div>

              {/* CENTRAL ORCHESTRATOR */}
              <div className="absolute left-1/2 top-[58px] z-20 -translate-x-1/2">
                <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-cyan-300/50 bg-[#0B1B31]/95 shadow-[0_0_35px_rgba(34,211,238,0.28)] backdrop-blur-xl">
                  <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-network-ring" />
                  <div className="text-center">
                    <div className="text-2xl">✦</div>
                    <p className="mt-1 text-[9px] font-bold tracking-wider text-white">AI</p>
                    <p className="text-[8px] text-cyan-300">ORCHESTRATOR</p>
                  </div>
                </div>
              </div>

              {/* FINANCE AGENT */}
              <div className="absolute bottom-[38px] left-[6px] z-20 w-[126px]">
                <div className="agent-card rounded-2xl border border-white/15 bg-[#0B1B31]/90 p-4 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">💰</div>
                    <div>
                      <p className="text-xs font-bold text-white">Finance Agent</p>
                      <p className="mt-1 text-[9px] text-slate-400">Budget Analysis</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[9px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    Active
                  </div>
                </div>
              </div>

              {/* RISK AGENT */}
              <div className="absolute bottom-[38px] right-[6px] z-20 w-[126px]">
                <div className="agent-card rounded-2xl border border-white/15 bg-[#0B1B31]/90 p-4 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">🛡️</div>
                    <div>
                      <p className="text-xs font-bold text-white">Risk Agent</p>
                      <p className="mt-1 text-[9px] text-slate-400">Risk Detection</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[9px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    Active
                  </div>
                </div>
              </div>

              {/* MATERIAL AGENT */}
              <div className="absolute bottom-[0px] left-1/2 z-20 w-[150px] -translate-x-1/2">
                <div className="agent-card rounded-2xl border border-cyan-400/25 bg-[#0B1B31]/95 p-4 shadow-xl shadow-cyan-950/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/60">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">📦</div>
                    <div>
                      <p className="text-xs font-bold text-white">Material Agent</p>
                      <p className="mt-1 text-[9px] text-slate-400">Inventory Monitoring</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    Active
                  </div>
                </div>
              </div>

              {/* NETWORK NODES */}
              <span className="absolute left-[88px] top-[188px] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_#22d3ee] animate-node-pulse" />
              <span className="absolute right-[88px] top-[188px] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_#22d3ee] animate-node-pulse animation-delay-1" />
              <span className="absolute left-1/2 top-[205px] h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9] animate-node-pulse animation-delay-2" />

              {/* BOTTOM STATUS */}
              <div className="absolute bottom-[-34px] left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#071629]/70 px-4 py-2 text-[9px] font-medium text-slate-400 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                3 AI Agents Connected
              </div>
            </div>
          </div>
        </div>

        {/* HERO BOTTOM FADE */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-[#0B1629] to-transparent" />
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className={`px-6 py-20 transition-colors duration-300 sm:px-10 md:px-16 md:py-24 ${
          isDark ? "bg-[#0B1629]" : "bg-[#F7FAFC]"
        }`}
      >
        <div id="solutions" className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="font-bold tracking-[0.2em] text-cyan-600">{t.capabilities}</p>

            <h2 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl ${
              isDark ? "text-white" : "text-[#101E36]"
            }`}>
              {t.sectionTitle}
            </h2>

            <p className={`mt-5 leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t.sectionDescription}
            </p>
          </div>

          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className={`group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-2xl border p-7 transition duration-300 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-xl ${
                  isDark
                    ? "border-slate-700 bg-[#14243B] hover:shadow-cyan-950/30"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-cyan-900/10"
                }`}
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition group-hover:bg-cyan-400/15" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl transition duration-300 group-hover:bg-cyan-400/20">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-bold tracking-widest text-cyan-600/70">{feature.number}</span>
                </div>

                <h3 className={`relative mt-7 text-xl font-bold ${
                  isDark ? "text-white" : "text-[#101E36]"
                }`}>
                  {feature.title}
                </h3>

                <p className={`relative mt-3 flex-1 text-sm leading-7 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  {feature.description}
                </p>

                <div className="mt-7 h-1 w-12 rounded-full bg-cyan-400 transition-all duration-300 group-hover:w-20" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className={`px-6 py-20 transition-colors duration-300 sm:px-10 md:px-16 md:py-24 ${
          isDark ? "bg-[#101E36]" : "bg-white"
        }`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ABOUT TEXT */}
          <div className={`order-2 lg:order-1 ${isRTL ? "text-right" : "text-left"}`}>
            <p className="font-bold tracking-[0.2em] text-cyan-500">{t.why}</p>

            <h2 className={`mt-5 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl ${
              isDark ? "text-white" : "text-[#101E36]"
            }`}>
              {t.aboutTitle}
            </h2>

            <p className={`mt-6 leading-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              {t.aboutDescription}
            </p>

            <div className="mt-8 space-y-5">
              {[t.aboutPoint1, t.aboutPoint2, t.aboutPoint3].map((point, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-bold text-cyan-500">
                    ✓
                  </span>

                  <p className={`font-medium ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}>
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="/dashboard"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-cyan-500 px-7 py-4 font-bold text-[#101E36] transition hover:-translate-y-1 hover:bg-cyan-400"
            >
              {t.openDashboard} →
            </a>
          </div>

          {/* ABOUT IMAGE */}
          <div className="order-1 lg:order-2">
            <div
              className="group relative min-h-[320px] overflow-hidden rounded-3xl border border-cyan-400/20 bg-cover bg-center shadow-2xl sm:min-h-[420px] lg:min-h-[500px]"
              style={{ backgroundImage: `url("${aboutImage}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#071629]/85 via-[#071629]/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
                <div className="inline-flex rounded-full border border-cyan-300/40 bg-[#071629]/50 px-4 py-2 text-xs font-bold tracking-widest text-cyan-200 backdrop-blur-md">
                  BUILDWISE AI
                </div>

                <h3 className="mt-4 max-w-sm text-2xl font-bold leading-snug text-white sm:text-3xl">
                  {t.aboutImageLabel}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative overflow-hidden bg-[#101E36] px-6 py-20 text-center text-white sm:px-10 md:px-16 md:py-24">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <p className="font-bold tracking-[0.25em] text-cyan-400">BUILDWISE AI</p>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {t.ctaTitle}
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-8 text-slate-300">
            {t.ctaDescription}
          </p>

          <a
            href="/dashboard"
            className="mt-9 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 font-bold text-[#101E36] shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:bg-cyan-300"
          >
            {t.openDashboard} →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-700 bg-[#0B1629] px-6 py-10 text-center text-sm text-slate-400">
        <a href="#" className="text-2xl font-extrabold text-white">
          BuildWise<span className="text-cyan-400"> AI</span>
        </a>

        <p className="mt-4">
          © 2026 BuildWise AI. {t.footer}
        </p>

        <p className="mt-2 text-slate-500">
          {t.footerTagline}
        </p>
      </footer>

      {/* ANIMATIONS */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .logo-animation {
          animation: logoReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .splash-title {
          animation: textReveal 0.9s ease-out 0.45s both;
        }

        .splash-subtitle {
          animation: textReveal 0.9s ease-out 0.7s both;
        }

        .animate-logo-glow {
          animation: logoGlow 1.8s ease-in-out infinite alternate;
        }

        .animate-logo-ring {
          animation: ringPulse 2s ease-out infinite;
        }

        .agent-line {
          animation: flowLine 2.8s linear infinite;
        }

        .agent-line-delay {
          animation-delay: 0.7s;
        }

        .agent-line-delay-2 {
          animation-delay: 1.4s;
        }

        .animate-network-ring {
          animation: networkRing 2.5s ease-in-out infinite;
        }

        .animate-node-pulse {
          animation: nodePulse 1.8s ease-in-out infinite;
        }

        .animation-delay-1 {
          animation-delay: 0.5s;
        }

        .animation-delay-2 {
          animation-delay: 1s;
        }

        .agent-card {
          animation: agentFloat 4s ease-in-out infinite;
        }

        .agent-card:nth-of-type(2) {
          animation-delay: 0.8s;
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-35deg);
            filter: blur(12px);
          }
          65% {
            opacity: 1;
            transform: scale(1.12) rotate(7deg);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
            filter: blur(0);
          }
        }

        @keyframes logoGlow {
          from {
            box-shadow: 0 0 8px rgba(34, 211, 238, 0.2);
          }
          to {
            box-shadow:
              0 0 28px rgba(34, 211, 238, 0.7),
              0 0 55px rgba(34, 211, 238, 0.2);
          }
        }

        @keyframes ringPulse {
          0% {
            opacity: 0.8;
            transform: scale(0.8);
          }
          100% {
            opacity: 0;
            transform: scale(1.65);
          }
        }

        @keyframes textReveal {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes flowLine {
          0% {
            stroke-dashoffset: 40;
            opacity: 0.25;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -40;
            opacity: 0.25;
          }
        }

        @keyframes networkRing {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.04);
          }
        }

        @keyframes nodePulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes agentFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
