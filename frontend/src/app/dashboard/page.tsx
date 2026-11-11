"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useSettings,
  type Currency,
  type Language,
} from "@/components/SettingsProvider";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

type Project = {
  id: string;
  name: string;
  location?: string;
  status: string;
  budget: number;
  progress: number;
};

type Task = {
  id: string;
  title: string;
  project_id: string;
  status: string;
  created_at?: string;
};

type Expense = {
  id: string;
  project_id: string;
  amount: number;
};

type DashboardData = {
  projects: Project[];
  tasks: Task[];
  expenses: Expense[];
};

const translations = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    budget: "Budget",
    materials: "Materials",
    aiInsights: "AI Insights",
    projectIntelligence: "PROJECT INTELLIGENCE",
    assistant: "AI Project Assistant",
    assistantDescription:
      "Get intelligent insights about your construction projects.",
    exploreInsights: "Explore Insights →",
    backToWebsite: "← Back to Website",
    workspace: "Workspace / Overview",
    dashboardOverview: "Dashboard Overview",
    monitor: "Monitor your construction projects in one place.",
    notifications: "🔔 Notifications",
    welcomeLabel: "BUILDWISE AI WORKSPACE",
    welcome: "Welcome to Your Dashboard",
    welcomeDescription:
      "Stay informed about project progress, budgets, tasks and construction activities.",
    viewProjects: "View Projects →",
    totalProjects: "Total Projects",
    activeProjects: "Active Projects",
    completed: "Completed",
    totalBudget: "Total Budget",
    projectsDatabase: "Projects in database",
    currentlyRunning: "Currently running",
    successfullyDelivered: "Successfully delivered",
    acrossProjects: "Across all projects",
    recentProjects: "Recent Projects",
    projectProgress: "Current project progress",
    viewAll: "View All →",
    loadingProjects: "Loading projects...",
    noProjects: "No projects found. Create your first project.",
    locationNotSpecified: "Location not specified",
    budgetSummary: "Budget Summary",
    budgetUtilization: "Overall budget utilization",
    utilized: "Utilized",
    amountSpent: "Amount Spent",
    remaining: "Remaining",
    recentTasks: "Recent Tasks",
    latestActivities: "Latest project activities",
    loadingTasks: "Loading tasks...",
    noTasks: "No tasks found.",
    unknownProject: "Unknown Project",
    aiProjectInsights: "AI Project Insights",
    monitoringPreview: "Intelligent monitoring preview",
    scheduleRisk: "⚠️ Potential Schedule Risk",
    scheduleDescription:
      "A project task may require additional monitoring to avoid delays.",
    budgetRecommendation: "💡 Budget Recommendation",
    budgetDescription:
      "Review material expenses regularly to maintain budget control.",
    aiComingSoon:
      "AI-powered risk analysis will be connected in the next development step.",
    footer:
      "© 2026 BuildWise AI. Plan Smarter. Monitor Better. Build Efficiently.",
    language: "Language",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    currency: "Currency",
    loading: "Loading...",
    error: "Please check that the backend is running.",
  },

  ur: {
    dashboard: "ڈیش بورڈ",
    projects: "پروجیکٹس",
    tasks: "ٹاسکس",
    budget: "بجٹ",
    materials: "میٹیریلز",
    aiInsights: "AI بصیرت",
    projectIntelligence: "پروجیکٹ مینجمنٹ",
    assistant: "AI پروجیکٹ اسسٹنٹ",
    assistantDescription:
      "اپنے تعمیراتی پروجیکٹس کے لیے ذہین معلومات حاصل کریں۔",
    exploreInsights: "AI معلومات دیکھیں ←",
    backToWebsite: "← ویب سائٹ پر واپس",
    workspace: "ورک اسپیس / جائزہ",
    dashboardOverview: "ڈیش بورڈ کا جائزہ",
    monitor: "اپنے تعمیراتی پروجیکٹس کی نگرانی ایک جگہ کریں۔",
    notifications: "🔔 نوٹیفکیشنز",
    welcomeLabel: "BUILDWISE AI ورک اسپیس",
    welcome: "آپ کے ڈیش بورڈ میں خوش آمدید",
    welcomeDescription:
      "پروجیکٹ کی پیش رفت، بجٹ، ٹاسکس اور تعمیراتی سرگرمیوں سے باخبر رہیں۔",
    viewProjects: "پروجیکٹس دیکھیں ←",
    totalProjects: "کل پروجیکٹس",
    activeProjects: "فعال پروجیکٹس",
    completed: "مکمل شدہ",
    totalBudget: "کل بجٹ",
    projectsDatabase: "ڈیٹابیس میں پروجیکٹس",
    currentlyRunning: "فی الحال جاری",
    successfullyDelivered: "کامیابی سے مکمل",
    acrossProjects: "تمام پروجیکٹس کا مجموعہ",
    recentProjects: "حالیہ پروجیکٹس",
    projectProgress: "موجودہ پروجیکٹ کی پیش رفت",
    viewAll: "سب دیکھیں ←",
    loadingProjects: "پروجیکٹس لوڈ ہو رہے ہیں...",
    noProjects: "کوئی پروجیکٹ موجود نہیں۔ اپنا پہلا پروجیکٹ بنائیں۔",
    locationNotSpecified: "مقام درج نہیں",
    budgetSummary: "بجٹ کا خلاصہ",
    budgetUtilization: "مجموعی بجٹ کا استعمال",
    utilized: "استعمال شدہ",
    amountSpent: "خرچ شدہ رقم",
    remaining: "باقی رقم",
    recentTasks: "حالیہ ٹاسکس",
    latestActivities: "پروجیکٹ کی تازہ سرگرمیاں",
    loadingTasks: "ٹاسکس لوڈ ہو رہے ہیں...",
    noTasks: "کوئی ٹاسک موجود نہیں۔",
    unknownProject: "نامعلوم پروجیکٹ",
    aiProjectInsights: "AI پروجیکٹ معلومات",
    monitoringPreview: "ذہین نگرانی کا جائزہ",
    scheduleRisk: "⚠️ ممکنہ شیڈول کا خطرہ",
    scheduleDescription:
      "تاخیر سے بچنے کے لیے کسی پروجیکٹ ٹاسک کی اضافی نگرانی ضروری ہو سکتی ہے۔",
    budgetRecommendation: "💡 بجٹ کی تجویز",
    budgetDescription:
      "بجٹ کو کنٹرول میں رکھنے کے لیے میٹیریل کے اخراجات باقاعدگی سے چیک کریں۔",
    aiComingSoon:
      "AI پر مبنی رسک اینالیسس اگلے ڈیولپمنٹ مرحلے میں منسلک ہوگا۔",
    footer:
      "© 2026 BuildWise AI۔ بہتر منصوبہ بندی، بہتر نگرانی، مؤثر تعمیر۔",
    language: "زبان",
    lightMode: "لائٹ موڈ",
    darkMode: "ڈارک موڈ",
    currency: "کرنسی",
    loading: "لوڈ ہو رہا ہے...",
    error: "براہ کرم چیک کریں کہ بیک اینڈ چل رہا ہے۔",
  },

  ar: {
    dashboard: "لوحة التحكم",
    projects: "المشاريع",
    tasks: "المهام",
    budget: "الميزانية",
    materials: "المواد",
    aiInsights: "رؤى الذكاء الاصطناعي",
    projectIntelligence: "إدارة المشاريع",
    assistant: "مساعد المشاريع الذكي",
    assistantDescription:
      "احصل على رؤى ذكية حول مشاريع البناء الخاصة بك.",
    exploreInsights: "استكشاف الرؤى ←",
    backToWebsite: "← العودة إلى الموقع",
    workspace: "مساحة العمل / نظرة عامة",
    dashboardOverview: "نظرة عامة على لوحة التحكم",
    monitor: "راقب مشاريع البناء الخاصة بك في مكان واحد.",
    notifications: "🔔 الإشعارات",
    welcomeLabel: "مساحة عمل BUILDWISE AI",
    welcome: "مرحباً بك في لوحة التحكم",
    welcomeDescription:
      "تابع تقدم المشاريع والميزانيات والمهام وأنشطة البناء.",
    viewProjects: "عرض المشاريع ←",
    totalProjects: "إجمالي المشاريع",
    activeProjects: "المشاريع النشطة",
    completed: "مكتملة",
    totalBudget: "إجمالي الميزانية",
    projectsDatabase: "المشاريع في قاعدة البيانات",
    currentlyRunning: "قيد التنفيذ حالياً",
    successfullyDelivered: "تم إنجازها بنجاح",
    acrossProjects: "لجميع المشاريع",
    recentProjects: "المشاريع الأخيرة",
    projectProgress: "تقدم المشروع الحالي",
    viewAll: "عرض الكل ←",
    loadingProjects: "جارٍ تحميل المشاريع...",
    noProjects: "لا توجد مشاريع. أنشئ مشروعك الأول.",
    locationNotSpecified: "الموقع غير محدد",
    budgetSummary: "ملخص الميزانية",
    budgetUtilization: "إجمالي استخدام الميزانية",
    utilized: "المستخدم",
    amountSpent: "المبلغ المصروف",
    remaining: "المتبقي",
    recentTasks: "المهام الأخيرة",
    latestActivities: "أحدث أنشطة المشروع",
    loadingTasks: "جارٍ تحميل المهام...",
    noTasks: "لا توجد مهام.",
    unknownProject: "مشروع غير معروف",
    aiProjectInsights: "رؤى مشاريع الذكاء الاصطناعي",
    monitoringPreview: "معاينة المراقبة الذكية",
    scheduleRisk: "⚠️ مخاطر محتملة في الجدول الزمني",
    scheduleDescription:
      "قد تحتاج إحدى مهام المشروع إلى مراقبة إضافية لتجنب التأخير.",
    budgetRecommendation: "💡 توصية الميزانية",
    budgetDescription:
      "راجع نفقات المواد بانتظام للحفاظ على التحكم في الميزانية.",
    aiComingSoon:
      "سيتم ربط تحليل المخاطر المدعوم بالذكاء الاصطناعي في مرحلة التطوير القادمة.",
    footer:
      "© 2026 BuildWise AI. خطط بذكاء. راقب بشكل أفضل. ابنِ بكفاءة.",
    language: "اللغة",
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    currency: "العملة",
    loading: "جارٍ التحميل...",
    error: "يرجى التأكد من تشغيل الخادم الخلفي.",
  },

  zh: {
    dashboard: "仪表板",
    projects: "项目",
    tasks: "任务",
    budget: "预算",
    materials: "材料",
    aiInsights: "AI 洞察",
    projectIntelligence: "项目管理",
    assistant: "AI 项目助手",
    assistantDescription: "获取有关建筑项目的智能分析。",
    exploreInsights: "查看智能分析 →",
    backToWebsite: "← 返回网站",
    workspace: "工作区 / 概览",
    dashboardOverview: "仪表板概览",
    monitor: "在一个地方监控您的建筑项目。",
    notifications: "🔔 通知",
    welcomeLabel: "BUILDWISE AI 工作区",
    welcome: "欢迎使用您的仪表板",
    welcomeDescription:
      "随时了解项目进度、预算、任务和施工活动。",
    viewProjects: "查看项目 →",
    totalProjects: "项目总数",
    activeProjects: "进行中的项目",
    completed: "已完成",
    totalBudget: "总预算",
    projectsDatabase: "数据库中的项目",
    currentlyRunning: "当前正在进行",
    successfullyDelivered: "已成功交付",
    acrossProjects: "所有项目总计",
    recentProjects: "最近项目",
    projectProgress: "当前项目进度",
    viewAll: "查看全部 →",
    loadingProjects: "正在加载项目...",
    noProjects: "未找到项目。请创建您的第一个项目。",
    locationNotSpecified: "未指定地点",
    budgetSummary: "预算摘要",
    budgetUtilization: "总体预算使用率",
    utilized: "已使用",
    amountSpent: "已支出金额",
    remaining: "剩余金额",
    recentTasks: "最近任务",
    latestActivities: "最新项目活动",
    loadingTasks: "正在加载任务...",
    noTasks: "未找到任务。",
    unknownProject: "未知项目",
    aiProjectInsights: "AI 项目洞察",
    monitoringPreview: "智能监控预览",
    scheduleRisk: "⚠️ 潜在进度风险",
    scheduleDescription:
      "某项项目任务可能需要额外监控，以避免延误。",
    budgetRecommendation: "💡 预算建议",
    budgetDescription:
      "定期检查材料费用，以保持预算控制。",
    aiComingSoon: "AI 风险分析将在下一开发阶段接入。",
    footer:
      "© 2026 BuildWise AI。智能规划、更好监控、高效建设。",
    language: "语言",
    lightMode: "浅色模式",
    darkMode: "深色模式",
    currency: "货币",
    loading: "加载中...",
    error: "请检查后端服务是否正在运行。",
  },
};

export default function DashboardPage() {
  const {
    language,
    setLanguage,
    isDark,
    setTheme,
    isRTL,
    currency,
    setCurrency,
  } = useSettings();

  const t = translations[language];

  const [dashboard, setDashboard] = useState<DashboardData>({
    projects: [],
    tasks: [],
    expenses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [projects, tasks, expenses] = await Promise.all([
          fetchCollection<Project>("/projects", "projects"),
          fetchCollection<Task>("/tasks", "tasks"),
          fetchCollection<Expense>("/expenses", "expenses"),
        ]);

        setDashboard({ projects, tasks, expenses });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalProjects = dashboard.projects.length;

    const activeProjects = dashboard.projects.filter((project) => {
      const status = project.status?.toLowerCase();
      return (
        status === "in progress" || status === "near completion"
      );
    }).length;

    const completedProjects = dashboard.projects.filter(
      (project) => project.status?.toLowerCase() === "completed"
    ).length;

    const totalBudget = dashboard.projects.reduce(
      (total, project) => total + Number(project.budget || 0),
      0
    );

    return [
      {
        title: t.totalProjects,
        value: String(totalProjects).padStart(2, "0"),
        change: t.projectsDatabase,
        icon: "🏗️",
      },
      {
        title: t.activeProjects,
        value: String(activeProjects).padStart(2, "0"),
        change: t.currentlyRunning,
        icon: "📊",
      },
      {
        title: t.completed,
        value: String(completedProjects).padStart(2, "0"),
        change: t.successfullyDelivered,
        icon: "✅",
      },
      {
        title: t.totalBudget,
        value: formatCompactCurrency(totalBudget, currency),
        change: t.acrossProjects,
        icon: "💰",
      },
    ];
  }, [dashboard.projects, t, currency]);

  const totalBudget = useMemo(
    () =>
      dashboard.projects.reduce(
        (total, project) => total + Number(project.budget || 0),
        0
      ),
    [dashboard.projects]
  );

  const totalExpenses = useMemo(
    () =>
      dashboard.expenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
      ),
    [dashboard.expenses]
  );

  const remainingBudget = totalBudget - totalExpenses;

  const budgetUtilization =
    totalBudget > 0
      ? Math.min((totalExpenses / totalBudget) * 100, 100)
      : 0;

  const recentProjects = dashboard.projects.slice(0, 3);
  const recentTasks = dashboard.tasks.slice(0, 3);

  const projectNames = useMemo(
    () =>
      Object.fromEntries(
        dashboard.projects.map((project) => [
          project.id,
          project.name,
        ])
      ),
    [dashboard.projects]
  );

  const pageBg = isDark
    ? "bg-[#0B1629] text-slate-100"
    : "bg-[#F4F7FB] text-slate-800";

  const cardBg = isDark
    ? "border-slate-700 bg-[#14243B]"
    : "border-slate-200 bg-white";

  const headingColor = isDark
    ? "text-white"
    : "text-[#101E36]";

  const mutedColor = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const dividerColor = isDark
    ? "border-slate-700"
    : "border-slate-100";

  const navigation = [
    { icon: "▦", label: t.dashboard, href: "/dashboard" },
    { icon: "🏗️", label: t.projects, href: "/projects" },
    { icon: "✓", label: t.tasks, href: "/tasks" },
    { icon: "💰", label: t.budget, href: "/budget" },
    { icon: "📦", label: t.materials, href: "/materials" },
    { icon: "✦", label: t.aiInsights, href: "/ai-insights" },
  ];

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
      className={`min-h-screen transition-colors duration-300 md:flex ${pageBg}`}
    >
      {/* SIDEBAR */}
      <aside className="w-full shrink-0 bg-[#101E36] p-6 text-white md:min-h-screen md:w-64">
        <a href="/" className="text-2xl font-bold">
          BuildWise<span className="text-cyan-400"> AI</span>
        </a>

        <p className="mt-2 text-xs tracking-widest text-slate-400">
          {t.projectIntelligence}
        </p>

        <nav className="mt-10 space-y-2">
          {navigation.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                index === 0
                  ? "bg-cyan-400 font-semibold text-[#101E36]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">{t.assistant}</p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {t.assistantDescription}
          </p>

          <a
            href="/ai-insights"
            className="mt-4 inline-block text-sm font-semibold text-cyan-400"
          >
            {t.exploreInsights}
          </a>
        </div>

        <a
          href="/"
          className="mt-8 block text-sm text-slate-400 hover:text-cyan-400"
        >
          {t.backToWebsite}
        </a>
      </aside>

      {/* MAIN CONTENT */}
      <section className="min-w-0 flex-1 p-5 md:p-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-sm ${mutedColor}`}>
              {t.workspace}
            </p>

            <h1
              className={`mt-1 text-2xl font-bold md:text-3xl ${headingColor}`}
            >
              {t.dashboardOverview}
            </h1>

            <p className={`mt-2 text-sm ${mutedColor}`}>
              {t.monitor}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* LANGUAGE SELECTOR */}
            <select
              aria-label={t.language}
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as Language)
              }
              className={`rounded-xl border px-3 py-3 text-sm outline-none ${
                isDark
                  ? "border-slate-600 bg-[#14243B] text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>

            {/* CURRENCY SELECTOR */}
            <select
              aria-label={t.currency}
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value as Currency)
              }
              className={`rounded-xl border px-3 py-3 text-sm font-medium outline-none ${
                isDark
                  ? "border-slate-600 bg-[#14243B] text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="PKR">🇵🇰 PKR</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="AED">🇦🇪 AED</option>
              <option value="SAR">🇸🇦 SAR</option>
              <option value="GBP">🇬🇧 GBP</option>
              <option value="EUR">🇪🇺 EUR</option>
            </select>

            {/* THEME BUTTON */}
            <button
              type="button"
              onClick={() =>
                setTheme(isDark ? "light" : "dark")
              }
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                isDark
                  ? "border-slate-600 bg-[#14243B] text-white hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isDark
                ? `☀️ ${t.lightMode}`
                : `🌙 ${t.darkMode}`}
            </button>

            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                isDark
                  ? "border-slate-700 bg-[#14243B]"
                  : "border-slate-200 bg-white"
              }`}
            >
              {t.notifications}
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101E36] font-bold text-cyan-400">
              TN
            </div>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#101E36] p-6 text-white md:p-8">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              {t.welcomeLabel}
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {t.welcome}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              {t.welcomeDescription}
            </p>
          </div>

          <a
            href="/projects"
            className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#101E36] transition hover:bg-cyan-300"
          >
            {t.viewProjects}
          </a>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            className={`mt-6 rounded-xl border border-red-300 p-4 text-sm ${
              isDark
                ? "bg-red-950/40 text-red-300"
                : "bg-red-50 text-red-700"
            }`}
          >
            {error} {t.error}
          </div>
        )}

        {/* STATISTICS */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm ${mutedColor}`}>
                  {stat.title}
                </p>

                <span className="text-2xl">
                  {stat.icon}
                </span>
              </div>

              <h3
                className={`mt-4 text-3xl font-bold ${headingColor}`}
              >
                {loading ? "..." : stat.value}
              </h3>

              <p
                className={`mt-2 text-xs ${
                  isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                }`}
              >
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* PROJECTS AND BUDGET */}
        <div
          id="projects"
          className="mt-8 grid gap-6 xl:grid-cols-3"
        >
          <div
            className={`rounded-2xl border p-6 xl:col-span-2 ${cardBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  className={`text-lg font-bold ${headingColor}`}
                >
                  {t.recentProjects}
                </h2>

                <p className={`mt-1 text-sm ${mutedColor}`}>
                  {t.projectProgress}
                </p>
              </div>

              <a
                href="/projects"
                className={`rounded-lg border px-4 py-2 text-sm font-medium hover:border-cyan-400 ${
                  isDark
                    ? "border-slate-600"
                    : "border-slate-200"
                }`}
              >
                {t.viewAll}
              </a>
            </div>

            <div className="mt-6 space-y-6">
              {loading ? (
                <p className={`text-sm ${mutedColor}`}>
                  {t.loadingProjects}
                </p>
              ) : recentProjects.length === 0 ? (
                <p className={`text-sm ${mutedColor}`}>
                  {t.noProjects}
                </p>
              ) : (
                recentProjects.map((project) => (
                  <div key={project.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3
                          className={`font-semibold ${headingColor}`}
                        >
                          {project.name}
                        </h3>

                        <p
                          className={`mt-1 text-xs ${mutedColor}`}
                        >
                          {project.location ||
                            t.locationNotSpecified}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isDark
                            ? "bg-cyan-950 text-cyan-300"
                            : "bg-cyan-50 text-cyan-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className={`h-2 flex-1 overflow-hidden rounded-full ${
                          isDark
                            ? "bg-slate-700"
                            : "bg-slate-100"
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(
                                  project.progress || 0
                                ),
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <span
                        className={`text-sm font-semibold ${headingColor}`}
                      >
                        {project.progress || 0}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BUDGET SUMMARY */}
          <div
            className={`rounded-2xl border p-6 ${cardBg}`}
          >
            <h2
              className={`text-lg font-bold ${headingColor}`}
            >
              {t.budgetSummary}
            </h2>

            <p className={`mt-1 text-sm ${mutedColor}`}>
              {t.budgetUtilization}
            </p>

            <div
              className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#06b6d4 0% ${budgetUtilization}%, ${
                  isDark ? "#334155" : "#E8EEF5"
                } ${budgetUtilization}% 100%)`,
              }}
            >
              <div
                className={`flex h-32 w-32 flex-col items-center justify-center rounded-full ${
                  isDark
                    ? "bg-[#14243B]"
                    : "bg-white"
                }`}
              >
                <span
                  className={`text-3xl font-bold ${headingColor}`}
                >
                  {loading
                    ? "..."
                    : `${budgetUtilization.toFixed(0)}%`}
                </span>

                <span className={`text-xs ${mutedColor}`}>
                  {t.utilized}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between gap-2 text-sm">
                <span className={mutedColor}>
                  {t.totalBudget}
                </span>

                <span className="font-semibold">
                  {loading
                    ? "..."
                    : formatCurrency(
                        totalBudget,
                        currency
                      )}
                </span>
              </div>

              <div className="flex justify-between gap-2 text-sm">
                <span className={mutedColor}>
                  {t.amountSpent}
                </span>

                <span className="font-semibold text-cyan-500">
                  {loading
                    ? "..."
                    : formatCurrency(
                        totalExpenses,
                        currency
                      )}
                </span>
              </div>

              <div className="flex justify-between gap-2 text-sm">
                <span className={mutedColor}>
                  {t.remaining}
                </span>

                <span
                  className={`font-semibold ${
                    remainingBudget < 0
                      ? "text-red-500"
                      : "text-emerald-500"
                  }`}
                >
                  {loading
                    ? "..."
                    : formatCurrency(
                        remainingBudget,
                        currency
                      )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TASKS AND AI INSIGHTS */}
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div
            className={`rounded-2xl border p-6 ${cardBg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg font-bold ${headingColor}`}
                >
                  {t.recentTasks}
                </h2>

                <p className={`mt-1 text-sm ${mutedColor}`}>
                  {t.latestActivities}
                </p>
              </div>

              <span className="text-2xl">📋</span>
            </div>

            <div className="mt-5 space-y-4">
              {loading ? (
                <p className={`text-sm ${mutedColor}`}>
                  {t.loadingTasks}
                </p>
              ) : recentTasks.length === 0 ? (
                <p className={`text-sm ${mutedColor}`}>
                  {t.noTasks}
                </p>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-0 ${
                      isDark
                        ? "border-slate-700"
                        : "border-slate-100"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold ${headingColor}`}
                      >
                        {task.title}
                      </p>

                      <p
                        className={`mt-1 text-xs ${mutedColor}`}
                      >
                        {projectNames[
                          task.project_id
                        ] || t.unknownProject}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        task.status === "Completed"
                          ? isDark
                            ? "bg-emerald-950 text-emerald-300"
                            : "bg-emerald-50 text-emerald-700"
                          : task.status === "In Progress"
                          ? isDark
                            ? "bg-cyan-950 text-cyan-300"
                            : "bg-cyan-50 text-cyan-700"
                          : isDark
                          ? "bg-amber-950 text-amber-300"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div
            id="ai-insights"
            className={`rounded-2xl border p-6 ${
              isDark
                ? "border-cyan-900 bg-[#14243B]"
                : "border-cyan-100 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                  isDark
                    ? "bg-cyan-950"
                    : "bg-cyan-50"
                }`}
              >
                ✦
              </div>

              <div>
                <h2
                  className={`text-lg font-bold ${headingColor}`}
                >
                  {t.aiProjectInsights}
                </h2>

                <p
                  className={`text-xs ${
                    isDark
                      ? "text-cyan-300"
                      : "text-cyan-700"
                  }`}
                >
                  {t.monitoringPreview}
                </p>
              </div>
            </div>

            <div
              className={`mt-6 rounded-xl p-4 ${
                isDark
                  ? "bg-amber-950/40"
                  : "bg-amber-50"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  isDark
                    ? "text-amber-300"
                    : "text-amber-800"
                }`}
              >
                {t.scheduleRisk}
              </p>

              <p
                className={`mt-2 text-sm leading-6 ${
                  isDark
                    ? "text-amber-200"
                    : "text-amber-700"
                }`}
              >
                {t.scheduleDescription}
              </p>
            </div>

            <div
              className={`mt-4 rounded-xl p-4 ${
                isDark
                  ? "bg-cyan-950/50"
                  : "bg-cyan-50"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  isDark
                    ? "text-cyan-200"
                    : "text-cyan-900"
                }`}
              >
                {t.budgetRecommendation}
              </p>

              <p
                className={`mt-2 text-sm leading-6 ${
                  isDark
                    ? "text-cyan-100"
                    : "text-cyan-800"
                }`}
              >
                {t.budgetDescription}
              </p>
            </div>

            <p className={`mt-4 text-xs ${mutedColor}`}>
              {t.aiComingSoon}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer
          className={`mt-10 border-t py-6 text-center text-xs ${mutedColor} ${dividerColor}`}
        >
          {t.footer}
        </footer>
      </section>
    </main>
  );
}

async function fetchCollection<T>(
  endpoint: string,
  collectionName: string
): Promise<T[]> {
  const response = await fetch(
    `${API_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load ${collectionName}.`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return data[collectionName] || [];
}

function formatCurrency(
  amount: number,
  currency: Currency
) {
  const currencyConfig: Record<
    Currency,
    {
      symbol: string;
      locale: string;
    }
  > = {
    PKR: {
      symbol: "Rs.",
      locale: "en-PK",
    },
    USD: {
      symbol: "$",
      locale: "en-US",
    },
    AED: {
      symbol: "AED",
      locale: "en-AE",
    },
    SAR: {
      symbol: "SAR",
      locale: "en-SA",
    },
    GBP: {
      symbol: "£",
      locale: "en-GB",
    },
    EUR: {
      symbol: "€",
      locale: "en-IE",
    },
  };

  const config = currencyConfig[currency];

  return `${config.symbol} ${amount.toLocaleString(
    config.locale
  )}`;
}

function formatCompactCurrency(
  amount: number,
  currency: Currency
) {
  const symbols: Record<Currency, string> = {
    PKR: "Rs.",
    USD: "$",
    AED: "AED",
    SAR: "SAR",
    GBP: "£",
    EUR: "€",
  };

  const symbol = symbols[currency];

  if (amount >= 1000000000) {
    return `${symbol} ${(amount / 1000000000).toFixed(2)}B`;
  }

  if (amount >= 1000000) {
    return `${symbol} ${(amount / 1000000).toFixed(2)}M`;
  }

  if (amount >= 1000) {
    return `${symbol} ${(amount / 1000).toFixed(1)}K`;
  }

  return formatCurrency(amount, currency);
}