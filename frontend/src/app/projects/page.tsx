
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  useSettings,
  type Currency,
  type Language,
} from "@/components/SettingsProvider";

type ProjectStatus =
  | "Planning"
  | "In Progress"
  | "Near Completion"
  | "Completed";

type Project = {
  id: string;
  name: string;
  location: string;
  budget: number;
  progress: number;
  status: ProjectStatus;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

const statusStyles: Record<ProjectStatus, string> = {
  Planning: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "In Progress": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  "Near Completion": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const currencyConfig: Record<
  Currency,
  { symbol: string; locale: string }
> = {
  PKR: { symbol: "Rs.", locale: "en-PK" },
  USD: { symbol: "$", locale: "en-US" },
  AED: { symbol: "AED", locale: "en-AE" },
  SAR: { symbol: "SAR", locale: "en-SA" },
  GBP: { symbol: "£", locale: "en-GB" },
  EUR: { symbol: "€", locale: "en-IE" },
};

function money(amount: number, currency: Currency) {
  const selected = currencyConfig[currency];

  return `${selected.symbol} ${Number(amount || 0).toLocaleString(
    selected.locale,
    { maximumFractionDigits: 2 }
  )}`;
}

const translations = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    budget: "Budget",
    materials: "Materials",
    aiInsights: "AI Insights",
    backWebsite: "← Back to Website",
    projectIntelligence: "PROJECT INTELLIGENCE",
    workspace: "Workspace / Projects",
    pageTitle: "Project Management",
    pageDescription: "Manage and monitor all your construction projects.",
    closeForm: "Close Form",
    addProject: "Add New Project",
    totalProjects: "Total Projects",
    activeProjects: "Active Projects",
    completed: "Completed",
    totalBudget: "Total Budget",
    createProject: "Create New Project",
    createDescription: "Enter the details of your construction project.",
    projectName: "Project Name",
    location: "Location",
    budgetPKR: "Budget (PKR)",
    progress: "Progress (%)",
    projectStatus: "Project Status",
    saveProject: "Save Project",
    saving: "Saving...",
    cancel: "Cancel",
    allProjects: "All Projects",
    projectsFound: "project(s) found",
    search: "Search projects...",
    allStatus: "All Status",
    planning: "Planning",
    inProgress: "In Progress",
    nearCompletion: "Near Completion",
    statusCompleted: "Completed",
    loading: "Loading projects...",
    fetching: "Fetching data from BuildWise AI database.",
    projectProgress: "Project Progress",
    projectBudget: "Project Budget",
    delete: "Delete",
    deleting: "Deleting...",
    noProjects: "No Projects Found",
    noProjectsDescription: "Try another search or add a new project.",
    deleteConfirm: "Are you sure you want to delete this project?",
    created: "Project created successfully!",
    updated: "Project status updated successfully!",
    deleted: "Project deleted successfully!",
    unableLoad: "Unable to load projects.",
    unableCreate: "Unable to create project.",
    unableUpdate: "Unable to update project.",
    unableDelete: "Unable to delete project.",
    somethingWrong: "Something went wrong. Please try again.",
    namePlaceholder: "e.g. New Residential Building",
    locationPlaceholder: "e.g. Karachi, Pakistan",
    budgetPlaceholder: "Enter project budget",
    footer: "© 2026 BuildWise AI. Plan Smarter. Monitor Better. Build Efficiently.",
    language: "Language",
    currency: "Currency",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
  },

  ur: {
    dashboard: "ڈیش بورڈ",
    projects: "پروجیکٹس",
    tasks: "ٹاسکس",
    budget: "بجٹ",
    materials: "میٹریلز",
    aiInsights: "AI بصیرت",
    backWebsite: "← ویب سائٹ پر واپس جائیں",
    projectIntelligence: "پروجیکٹ مینجمنٹ سسٹم",
    workspace: "ورک اسپیس / پروجیکٹس",
    pageTitle: "پروجیکٹ مینجمنٹ",
    pageDescription: "اپنے تمام تعمیراتی پروجیکٹس کو منظم اور مانیٹر کریں۔",
    closeForm: "فارم بند کریں",
    addProject: "نیا پروجیکٹ شامل کریں",
    totalProjects: "کل پروجیکٹس",
    activeProjects: "فعال پروجیکٹس",
    completed: "مکمل شدہ",
    totalBudget: "کل بجٹ",
    createProject: "نیا پروجیکٹ بنائیں",
    createDescription: "اپنے تعمیراتی پروجیکٹ کی تفصیلات درج کریں۔",
    projectName: "پروجیکٹ کا نام",
    location: "مقام",
    budgetPKR: "بجٹ (PKR)",
    progress: "پیش رفت (%)",
    projectStatus: "پروجیکٹ کی صورتحال",
    saveProject: "پروجیکٹ محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ کریں",
    allProjects: "تمام پروجیکٹس",
    projectsFound: "پروجیکٹس ملے",
    search: "پروجیکٹس تلاش کریں...",
    allStatus: "تمام اسٹیٹس",
    planning: "منصوبہ بندی",
    inProgress: "کام جاری ہے",
    nearCompletion: "تکمیل کے قریب",
    statusCompleted: "مکمل",
    loading: "پروجیکٹس لوڈ ہو رہے ہیں...",
    fetching: "BuildWise AI ڈیٹا بیس سے معلومات حاصل کی جا رہی ہیں۔",
    projectProgress: "پروجیکٹ کی پیش رفت",
    projectBudget: "پروجیکٹ بجٹ",
    delete: "حذف کریں",
    deleting: "حذف ہو رہا ہے...",
    noProjects: "کوئی پروجیکٹ نہیں ملا",
    noProjectsDescription: "دوسری تلاش کریں یا نیا پروجیکٹ شامل کریں۔",
    deleteConfirm: "کیا آپ واقعی اس پروجیکٹ کو حذف کرنا چاہتے ہیں؟",
    created: "پروجیکٹ کامیابی سے بنا دیا گیا!",
    updated: "پروجیکٹ کی صورتحال اپ ڈیٹ ہو گئی!",
    deleted: "پروجیکٹ کامیابی سے حذف ہو گیا!",
    unableLoad: "پروجیکٹس لوڈ نہیں ہو سکے۔",
    unableCreate: "پروجیکٹ نہیں بنایا جا سکا۔",
    unableUpdate: "پروجیکٹ اپ ڈیٹ نہیں ہو سکا۔",
    unableDelete: "پروجیکٹ حذف نہیں ہو سکا۔",
    somethingWrong: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
    namePlaceholder: "مثلاً نیا رہائشی منصوبہ",
    locationPlaceholder: "مثلاً کراچی، پاکستان",
    budgetPlaceholder: "پروجیکٹ کا بجٹ درج کریں",
    footer: "© 2026 BuildWise AI۔ بہتر منصوبہ بندی، بہتر نگرانی، مؤثر تعمیرات۔",
    language: "زبان",
    currency: "کرنسی",
    darkMode: "ڈارک موڈ",
    lightMode: "لائٹ موڈ",
  },

  ar: {
    dashboard: "لوحة التحكم",
    projects: "المشاريع",
    tasks: "المهام",
    budget: "الميزانية",
    materials: "المواد",
    aiInsights: "رؤى الذكاء الاصطناعي",
    backWebsite: "← العودة إلى الموقع",
    projectIntelligence: "إدارة المشاريع",
    workspace: "مساحة العمل / المشاريع",
    pageTitle: "إدارة المشاريع",
    pageDescription: "إدارة ومراقبة جميع مشاريع البناء الخاصة بك.",
    closeForm: "إغلاق النموذج",
    addProject: "إضافة مشروع جديد",
    totalProjects: "إجمالي المشاريع",
    activeProjects: "المشاريع النشطة",
    completed: "مكتمل",
    totalBudget: "إجمالي الميزانية",
    createProject: "إنشاء مشروع جديد",
    createDescription: "أدخل تفاصيل مشروع البناء الخاص بك.",
    projectName: "اسم المشروع",
    location: "الموقع",
    budgetPKR: "الميزانية (PKR)",
    progress: "التقدم (%)",
    projectStatus: "حالة المشروع",
    saveProject: "حفظ المشروع",
    saving: "جارٍ الحفظ...",
    cancel: "إلغاء",
    allProjects: "جميع المشاريع",
    projectsFound: "مشروع تم العثور عليه",
    search: "ابحث عن المشاريع...",
    allStatus: "جميع الحالات",
    planning: "التخطيط",
    inProgress: "قيد التنفيذ",
    nearCompletion: "قارب على الانتهاء",
    statusCompleted: "مكتمل",
    loading: "جارٍ تحميل المشاريع...",
    fetching: "جارٍ جلب البيانات من قاعدة بيانات BuildWise AI.",
    projectProgress: "تقدم المشروع",
    projectBudget: "ميزانية المشروع",
    delete: "حذف",
    deleting: "جارٍ الحذف...",
    noProjects: "لم يتم العثور على مشاريع",
    noProjectsDescription: "جرّب بحثاً آخر أو أضف مشروعاً جديداً.",
    deleteConfirm: "هل أنت متأكد أنك تريد حذف هذا المشروع؟",
    created: "تم إنشاء المشروع بنجاح!",
    updated: "تم تحديث حالة المشروع بنجاح!",
    deleted: "تم حذف المشروع بنجاح!",
    unableLoad: "تعذر تحميل المشاريع.",
    unableCreate: "تعذر إنشاء المشروع.",
    unableUpdate: "تعذر تحديث المشروع.",
    unableDelete: "تعذر حذف المشروع.",
    somethingWrong: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    namePlaceholder: "مثال: مبنى سكني جديد",
    locationPlaceholder: "مثال: كراتشي، باكستان",
    budgetPlaceholder: "أدخل ميزانية المشروع",
    footer: "© 2026 BuildWise AI. خطط بذكاء. راقب بشكل أفضل. ابنِ بكفاءة.",
    language: "اللغة",
    currency: "العملة",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
  },

  zh: {
    dashboard: "仪表板",
    projects: "项目",
    tasks: "任务",
    budget: "预算",
    materials: "材料",
    aiInsights: "AI 洞察",
    backWebsite: "← 返回网站",
    projectIntelligence: "项目管理系统",
    workspace: "工作区 / 项目",
    pageTitle: "项目管理",
    pageDescription: "管理和监控您的所有建筑项目。",
    closeForm: "关闭表单",
    addProject: "添加新项目",
    totalProjects: "项目总数",
    activeProjects: "进行中的项目",
    completed: "已完成",
    totalBudget: "总预算",
    createProject: "创建新项目",
    createDescription: "输入您的建筑项目信息。",
    projectName: "项目名称",
    location: "位置",
    budgetPKR: "预算 (PKR)",
    progress: "进度 (%)",
    projectStatus: "项目状态",
    saveProject: "保存项目",
    saving: "正在保存...",
    cancel: "取消",
    allProjects: "所有项目",
    projectsFound: "个项目",
    search: "搜索项目...",
    allStatus: "所有状态",
    planning: "规划中",
    inProgress: "进行中",
    nearCompletion: "即将完成",
    statusCompleted: "已完成",
    loading: "正在加载项目...",
    fetching: "正在从 BuildWise AI 数据库获取数据。",
    projectProgress: "项目进度",
    projectBudget: "项目预算",
    delete: "删除",
    deleting: "正在删除...",
    noProjects: "未找到项目",
    noProjectsDescription: "请尝试其他搜索或添加新项目。",
    deleteConfirm: "确定要删除此项目吗？",
    created: "项目创建成功！",
    updated: "项目状态更新成功！",
    deleted: "项目删除成功！",
    unableLoad: "无法加载项目。",
    unableCreate: "无法创建项目。",
    unableUpdate: "无法更新项目。",
    unableDelete: "无法删除项目。",
    somethingWrong: "出现错误，请重试。",
    namePlaceholder: "例如：新住宅楼",
    locationPlaceholder: "例如：卡拉奇，巴基斯坦",
    budgetPlaceholder: "输入项目预算",
    footer: "© 2026 BuildWise AI。智能规划，高效监控，卓越建设。",
    language: "语言",
    currency: "货币",
    darkMode: "深色模式",
    lightMode: "浅色模式",
  },
} satisfies Record<Language, Record<string, string>>;

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data.detail || data.message || "Something went wrong.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export default function ProjectsPage() {
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [progress, setProgress] = useState("0");
  const [status, setStatus] = useState<ProjectStatus>("Planning");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Shared theme classes
  const pageBg = isDark
    ? "bg-[#0B1629] text-slate-100"
    : "bg-[#F4F7FB] text-slate-800";

  const cardBg = isDark
    ? "border-slate-700 bg-[#14243B]"
    : "border-slate-200 bg-white";

  const headingColor = isDark ? "text-white" : "text-[#101E36]";
  const mutedColor = isDark ? "text-slate-400" : "text-slate-500";

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-cyan-500 ${
    isDark
      ? "border-slate-600 bg-[#0B1629] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
  }`;

  const selectClass = `rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-500 ${
    isDark
      ? "border-slate-600 bg-[#0B1629] text-white"
      : "border-slate-200 bg-white text-slate-800"
  }`;

  const getStatusLabel = (value: ProjectStatus) => {
    const labels: Record<ProjectStatus, string> = {
      Planning: t.planning,
      "In Progress": t.inProgress,
      "Near Completion": t.nearCompletion,
      Completed: t.statusCompleted,
    };

    return labels[value];
  };

  // Load projects from Supabase through FastAPI
  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/projects`);

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t.unableLoad
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.location.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || project.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const completed = projects.filter(
    (p) => p.status === "Completed"
  ).length;

  const active = projects.filter(
    (p) => p.status === "In Progress"
  ).length;

  const totalBudget = projects.reduce(
    (sum, p) => sum + Number(p.budget || 0),
    0
  );

  // Create project in Supabase
  async function handleAddProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          budget: Number(budget),
          progress: Number(progress),
          status,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();

      setProjects((current) => [data.project, ...current]);

      setName("");
      setLocation("");
      setBudget("");
      setProgress("0");
      setStatus("Planning");
      setShowForm(false);

      setSuccess(t.created);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unableCreate
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Update project status in Supabase
  async function updateStatus(
    id: string,
    newStatus: ProjectStatus
  ) {
    const currentProject = projects.find((p) => p.id === id);

    if (!currentProject) return;

    const newProgress =
      newStatus === "Completed" ? 100 : currentProject.progress;

    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          progress: newProgress,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();
      const updatedProject = data.projects?.[0];

      if (updatedProject) {
        setProjects((current) =>
          current.map((project) =>
            project.id === id ? updatedProject : project
          )
        );
      }

      setSuccess(t.updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unableUpdate
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Delete project from Supabase
  async function deleteProject(id: string) {
    const confirmed = window.confirm(t.deleteConfirm);

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setProjects((current) =>
        current.filter((project) => project.id !== id)
      );

      setSuccess(t.deleted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unableDelete
      );
    } finally {
      setDeletingId(null);
    }
  }

  const navigation = [
    ["▦", t.dashboard, "/dashboard"],
    ["🏗️", t.projects, "/projects"],
    ["✓", t.tasks, "/tasks"],
    ["💰", t.budget, "/budget"],
    ["📦", t.materials, "/materials"],
    ["✦", t.aiInsights, "/ai-insights"],
  ];

  const statistics = [
    {
      title: t.totalProjects,
      value: projects.length,
      icon: "🏗️",
    },
    {
      title: t.activeProjects,
      value: active,
      icon: "📊",
    },
    {
      title: t.completed,
      value: completed,
      icon: "✅",
    },
    {
      title: t.totalBudget,
      value: `${money(totalBudget / 1000000, currency)}M`,
      icon: "💰",
    },
  ];

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen md:flex ${pageBg}`}
    >
      {/* Sidebar */}
      <aside className="w-full shrink-0 bg-[#101E36] p-6 text-white md:min-h-screen md:w-64">
        <a href="/" className="text-2xl font-bold">
          BuildWise<span className="text-cyan-400"> AI</span>
        </a>

        <p className="mt-2 text-xs tracking-widest text-slate-400">
          {t.projectIntelligence}
        </p>

        <nav className="mt-10 space-y-2">
          {navigation.map(([icon, label, href]) => (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                href === "/projects"
                  ? "bg-cyan-400 font-semibold text-[#101E36]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              {label}
            </a>
          ))}
        </nav>

        <a
          href="/"
          className="mt-12 block text-sm text-slate-400 hover:text-cyan-400"
        >
          {t.backWebsite}
        </a>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1 p-5 md:p-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={`text-sm ${mutedColor}`}>
              {t.workspace}
            </p>

            <h1 className={`mt-1 text-3xl font-bold ${headingColor}`}>
              {t.pageTitle}
            </h1>

            <p className={`mt-2 text-sm ${mutedColor}`}>
              {t.pageDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Selector */}
            <select
              aria-label={t.language}
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as Language)
              }
              className={selectClass}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>

            {/* Currency Selector */}
            <select
              aria-label={t.currency}
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as Currency)
              }
              className={selectClass}
            >
              <option value="PKR">🇵🇰 PKR</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="AED">🇦🇪 AED</option>
              <option value="SAR">🇸🇦 SAR</option>
              <option value="GBP">🇬🇧 GBP</option>
              <option value="EUR">🇪🇺 EUR</option>
            </select>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() =>
                setTheme(isDark ? "light" : "dark")
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition hover:border-cyan-500 hover:text-cyan-500 dark:border-slate-600"
            >
              {isDark ? `☀️ ${t.lightMode}` : `🌙 ${t.darkMode}`}
            </button>

            {/* Add Project Button */}
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-[#101E36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              {showForm ? `✕ ${t.closeForm}` : `+ ${t.addProject}`}
            </button>
          </div>
        </header>

        {/* API Messages */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            {success}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm ${mutedColor}`}>
                  {stat.title}
                </p>
                <span className="text-2xl">{stat.icon}</span>
              </div>

              <h2 className={`mt-4 text-2xl font-bold ${headingColor}`}>
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Add Project Form */}
        {showForm && (
          <form
            onSubmit={handleAddProject}
            className={`mt-8 rounded-2xl border border-cyan-200 p-6 shadow-sm dark:border-cyan-500/30 ${cardBg}`}
          >
            <h2 className={`text-xl font-bold ${headingColor}`}>
              {t.createProject}
            </h2>

            <p className={`mt-1 text-sm ${mutedColor}`}>
              {t.createDescription}
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-medium ${headingColor}`}>
                  {t.projectName}
                </label>

                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${headingColor}`}>
                  {t.location}
                </label>

                <input
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.locationPlaceholder}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${headingColor}`}>
                  {t.budgetPKR}
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={t.budgetPlaceholder}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${headingColor}`}>
                  {t.progress}
                </label>

                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${headingColor}`}>
                  {t.projectStatus}
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ProjectStatus)
                  }
                  className={selectClass + " w-full"}
                >
                  <option value="Planning">{t.planning}</option>
                  <option value="In Progress">{t.inProgress}</option>
                  <option value="Near Completion">{t.nearCompletion}</option>
                  <option value="Completed">{t.statusCompleted}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-[#101E36] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? t.saving : t.saveProject}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`rounded-xl border px-6 py-3 text-sm font-semibold transition ${
                  isDark
                    ? "border-slate-600 hover:bg-white/10"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        {/* Search and Filter */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold ${headingColor}`}>
              {t.allProjects}
            </h2>

            <p className={`mt-1 text-sm ${mutedColor}`}>
              {filteredProjects.length} {t.projectsFound}
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className={`${inputClass} min-w-0 flex-1 md:w-56`}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={selectClass}
            >
              <option value="All">{t.allStatus}</option>
              <option value="Planning">{t.planning}</option>
              <option value="In Progress">{t.inProgress}</option>
              <option value="Near Completion">{t.nearCompletion}</option>
              <option value="Completed">{t.statusCompleted}</option>
            </select>
          </div>
        </div>

        {/* Project Cards */}
        {isLoading ? (
          <div className={`mt-6 rounded-2xl border p-12 text-center ${cardBg}`}>
            <p className={`font-semibold ${headingColor}`}>
              {t.loading}
            </p>

            <p className={`mt-2 text-sm ${mutedColor}`}>
              {t.fetching}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${cardBg}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-lg font-bold ${headingColor}`}>
                      {project.name}
                    </h3>

                    <p className={`mt-1 text-sm ${mutedColor}`}>
                      📍 {project.location}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[project.status]
                    }`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm">
                    <span className={mutedColor}>
                      {t.projectProgress}
                    </span>

                    <span className={`font-bold ${headingColor}`}>
                      {project.progress}%
                    </span>
                  </div>

                  <div
                    className={`mt-3 h-2 overflow-hidden rounded-full ${
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all"
                      style={{
                        width: `${project.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Budget and Actions */}
                <div
                  className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${
                    isDark ? "border-slate-700" : "border-slate-100"
                  }`}
                >
                  <div>
                    <p className={`text-xs ${mutedColor}`}>
                      {t.projectBudget}
                    </p>

                    <p className={`mt-1 font-bold ${headingColor}`}>
                      {money(Number(project.budget), currency)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      aria-label={`Update status for ${project.name}`}
                      value={project.status}
                      disabled={updatingId === project.id}
                      onChange={(e) =>
                        updateStatus(
                          project.id,
                          e.target.value as ProjectStatus
                        )
                      }
                      className={`max-w-40 rounded-lg border px-2 py-2 text-xs outline-none focus:border-cyan-500 disabled:opacity-50 ${
                        isDark
                          ? "border-slate-600 bg-[#0B1629] text-white"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      <option value="Planning">{t.planning}</option>
                      <option value="In Progress">{t.inProgress}</option>
                      <option value="Near Completion">{t.nearCompletion}</option>
                      <option value="Completed">{t.statusCompleted}</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => deleteProject(project.id)}
                      disabled={deletingId === project.id}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      {deletingId === project.id ? t.deleting : t.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && (
          <div className={`mt-6 rounded-2xl border border-dashed p-12 text-center ${cardBg}`}>
            <p className="text-3xl">🔍</p>

            <h3 className={`mt-3 font-bold ${headingColor}`}>
              {t.noProjects}
            </h3>

            <p className={`mt-2 text-sm ${mutedColor}`}>
              {t.noProjectsDescription}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer
          className={`mt-10 border-t py-6 text-center text-xs ${
            isDark
              ? "border-slate-700 text-slate-500"
              : "border-slate-200 text-slate-400"
          }`}
        >
          {t.footer}
        </footer>
      </section>
    </main>
  );
}
