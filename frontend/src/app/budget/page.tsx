"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  budget: number;
};

type Expense = {
  id: string;
  project_id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  description?: string | null;
};

const today = new Date().toLocaleDateString("en-CA");

const translations = {
  en: {
    workspace: "BUILDWISE AI / FINANCE",
    title: "Budget Management",
    subtitle: "Monitor project budgets, expenses and financial performance.",
    add: "+ Add Expense",
    close: "✕ Close Form",
    totalBudget: "Total Budget",
    totalExpenses: "Total Expenses",
    remaining: "Remaining Budget",
    used: "Budget Used",
    editExpense: "Edit Expense",
    newExpense: "Record New Expense",
    expenseTitle: "Expense Title",
    selectProject: "Select Project",
    amount: "Amount",
    date: "Expense Date",
    description: "Description (optional)",
    materials: "Materials",
    labor: "Labor",
    equipment: "Equipment",
    transportation: "Transportation",
    other: "Other",
    save: "Save Expense",
    update: "Update Expense",
    saving: "Saving...",
    cancel: "Cancel",
    createFirst: "Create a project before adding expenses.",
    utilization: "Budget Utilization",
    overall: "Overall spending across all projects",
    spent: "Spent",
    allocated: "Allocated",
    projectBudgets: "Project Budgets",
    noProjects: "No projects available. Add a project first.",
    history: "Expense History",
    historyDesc: "Review and manage recorded expenses.",
    search: "Search expenses...",
    allProjects: "All Projects",
    edit: "Edit",
    delete: "Delete",
    noExpenses: "No expenses found.",
    loading: "Loading budget data...",
    loadError: "Unable to load budget data.",
    saveError: "Unable to save expense.",
    deleteError: "Unable to delete expense.",
    selectFirst: "Please select a project first.",
    confirmDelete: "Are you sure you want to delete this expense?",
    added: "Expense added successfully!",
    updated: "Expense updated successfully!",
    deleted: "Expense deleted successfully!",
    back: "← Back to Dashboard",
    language: "Language",
    currency: "Currency",
    light: "Light Mode",
    dark: "Dark Mode",
    usedPercent: "% used",
  },

  ur: {
    workspace: "بلڈ وائز AI / فنانس",
    title: "بجٹ مینجمنٹ",
    subtitle: "پروجیکٹ کے بجٹ، اخراجات اور مالی کارکردگی کی نگرانی کریں۔",
    add: "+ خرچہ شامل کریں",
    close: "✕ فارم بند کریں",
    totalBudget: "کل بجٹ",
    totalExpenses: "کل اخراجات",
    remaining: "باقی بجٹ",
    used: "استعمال شدہ بجٹ",
    editExpense: "خرچے میں ترمیم",
    newExpense: "نیا خرچہ درج کریں",
    expenseTitle: "خرچے کا نام",
    selectProject: "پروجیکٹ منتخب کریں",
    amount: "رقم",
    date: "خرچے کی تاریخ",
    description: "تفصیل (اختیاری)",
    materials: "تعمیراتی سامان",
    labor: "مزدوری",
    equipment: "آلات",
    transportation: "ٹرانسپورٹ",
    other: "دیگر",
    save: "خرچہ محفوظ کریں",
    update: "خرچہ اپ ڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ کریں",
    createFirst: "خرچہ شامل کرنے سے پہلے پروجیکٹ بنائیں۔",
    utilization: "بجٹ کا استعمال",
    overall: "تمام پروجیکٹس کے مجموعی اخراجات",
    spent: "خرچ شدہ",
    allocated: "مختص بجٹ",
    projectBudgets: "پروجیکٹس کے بجٹ",
    noProjects: "کوئی پروجیکٹ موجود نہیں۔ پہلے پروجیکٹ بنائیں۔",
    history: "اخراجات کی تفصیل",
    historyDesc: "درج شدہ اخراجات دیکھیں اور منظم کریں۔",
    search: "اخراجات تلاش کریں...",
    allProjects: "تمام پروجیکٹس",
    edit: "ترمیم",
    delete: "حذف کریں",
    noExpenses: "کوئی خرچہ نہیں ملا۔",
    loading: "بجٹ کا ڈیٹا لوڈ ہو رہا ہے...",
    loadError: "بجٹ کا ڈیٹا لوڈ نہیں ہو سکا۔",
    saveError: "خرچہ محفوظ نہیں ہو سکا۔",
    deleteError: "خرچہ حذف نہیں ہو سکا۔",
    selectFirst: "پہلے ایک پروجیکٹ منتخب کریں۔",
    confirmDelete: "کیا آپ واقعی یہ خرچہ حذف کرنا چاہتے ہیں؟",
    added: "خرچہ کامیابی سے شامل ہوگیا!",
    updated: "خرچہ کامیابی سے اپ ڈیٹ ہوگیا!",
    deleted: "خرچہ کامیابی سے حذف ہوگیا!",
    back: "← ڈیش بورڈ پر واپس جائیں",
    language: "زبان",
    currency: "کرنسی",
    light: "لائٹ موڈ",
    dark: "ڈارک موڈ",
    usedPercent: "% استعمال",
  },

  ar: {
    workspace: "BUILDWISE AI / المالية",
    title: "إدارة الميزانية",
    subtitle: "تابع ميزانيات المشاريع والنفقات والأداء المالي.",
    add: "+ إضافة مصروف",
    close: "✕ إغلاق النموذج",
    totalBudget: "إجمالي الميزانية",
    totalExpenses: "إجمالي النفقات",
    remaining: "الميزانية المتبقية",
    used: "الميزانية المستخدمة",
    editExpense: "تعديل المصروف",
    newExpense: "تسجيل مصروف جديد",
    expenseTitle: "عنوان المصروف",
    selectProject: "اختر المشروع",
    amount: "المبلغ",
    date: "تاريخ المصروف",
    description: "الوصف (اختياري)",
    materials: "المواد",
    labor: "العمالة",
    equipment: "المعدات",
    transportation: "النقل",
    other: "أخرى",
    save: "حفظ المصروف",
    update: "تحديث المصروف",
    saving: "جارٍ الحفظ...",
    cancel: "إلغاء",
    createFirst: "أنشئ مشروعاً قبل إضافة المصروفات.",
    utilization: "استخدام الميزانية",
    overall: "إجمالي الإنفاق عبر جميع المشاريع",
    spent: "المصروف",
    allocated: "المخصص",
    projectBudgets: "ميزانيات المشاريع",
    noProjects: "لا توجد مشاريع. أضف مشروعاً أولاً.",
    history: "سجل المصروفات",
    historyDesc: "راجع المصروفات المسجلة وأدرها.",
    search: "ابحث عن المصروفات...",
    allProjects: "جميع المشاريع",
    edit: "تعديل",
    delete: "حذف",
    noExpenses: "لم يتم العثور على مصروفات.",
    loading: "جارٍ تحميل بيانات الميزانية...",
    loadError: "تعذر تحميل بيانات الميزانية.",
    saveError: "تعذر حفظ المصروف.",
    deleteError: "تعذر حذف المصروف.",
    selectFirst: "يرجى اختيار مشروع أولاً.",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا المصروف؟",
    added: "تمت إضافة المصروف بنجاح!",
    updated: "تم تحديث المصروف بنجاح!",
    deleted: "تم حذف المصروف بنجاح!",
    back: "← العودة إلى لوحة التحكم",
    language: "اللغة",
    currency: "العملة",
    light: "الوضع الفاتح",
    dark: "الوضع الداكن",
    usedPercent: "% مستخدم",
  },

  zh: {
    workspace: "BUILDWISE AI / 财务",
    title: "预算管理",
    subtitle: "监控项目预算、支出和财务表现。",
    add: "+ 添加支出",
    close: "✕ 关闭表单",
    totalBudget: "总预算",
    totalExpenses: "总支出",
    remaining: "剩余预算",
    used: "预算使用率",
    editExpense: "编辑支出",
    newExpense: "记录新支出",
    expenseTitle: "支出名称",
    selectProject: "选择项目",
    amount: "金额",
    date: "支出日期",
    description: "描述（可选）",
    materials: "材料",
    labor: "人工",
    equipment: "设备",
    transportation: "运输",
    other: "其他",
    save: "保存支出",
    update: "更新支出",
    saving: "保存中...",
    cancel: "取消",
    createFirst: "请先创建项目，然后再添加支出。",
    utilization: "预算使用情况",
    overall: "所有项目的总体支出",
    spent: "已支出",
    allocated: "已分配",
    projectBudgets: "项目预算",
    noProjects: "没有可用项目。请先添加项目。",
    history: "支出记录",
    historyDesc: "查看和管理已记录的支出。",
    search: "搜索支出...",
    allProjects: "所有项目",
    edit: "编辑",
    delete: "删除",
    noExpenses: "未找到支出。",
    loading: "正在加载预算数据...",
    loadError: "无法加载预算数据。",
    saveError: "无法保存支出。",
    deleteError: "无法删除支出。",
    selectFirst: "请先选择一个项目。",
    confirmDelete: "确定要删除此支出吗？",
    added: "支出添加成功！",
    updated: "支出更新成功！",
    deleted: "支出删除成功！",
    back: "← 返回仪表板",
    language: "语言",
    currency: "货币",
    light: "浅色模式",
    dark: "深色模式",
    usedPercent: "% 已使用",
  },
};

const categoryLabels = {
  en: {
    Materials: "Materials",
    Labor: "Labor",
    Equipment: "Equipment",
    Transportation: "Transportation",
    Other: "Other",
  },
  ur: {
    Materials: "تعمیراتی سامان",
    Labor: "مزدوری",
    Equipment: "آلات",
    Transportation: "ٹرانسپورٹ",
    Other: "دیگر",
  },
  ar: {
    Materials: "المواد",
    Labor: "العمالة",
    Equipment: "المعدات",
    Transportation: "النقل",
    Other: "أخرى",
  },
  zh: {
    Materials: "材料",
    Labor: "人工",
    Equipment: "设备",
    Transportation: "运输",
    Other: "其他",
  },
};

function money(amount: number, currency: Currency) {
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

  return `${config.symbol} ${amount.toLocaleString(config.locale)}`;
}

export default function BudgetPage() {
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
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("All");

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Materials");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const pageBg = isDark
    ? "bg-[#0B1425] text-slate-100"
    : "bg-[#F4F7FB] text-slate-800";

  const cardBg = isDark
    ? "border-slate-700/60 bg-[#111F35]"
    : "border-slate-200 bg-white";

  const fieldBg = isDark
    ? "border-slate-700 bg-[#0B1425] text-white"
    : "border-slate-200 bg-white text-slate-800";

  const innerBg = isDark
    ? "border-slate-700/50 bg-[#0B1425]"
    : "border-slate-200 bg-slate-50";

  const headingColor = isDark ? "text-white" : "text-[#101E36]";
  const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
  const borderColor = isDark ? "border-slate-700" : "border-slate-200";

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [projectsResponse, expensesResponse] = await Promise.all([
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/expenses`),
      ]);

      if (!projectsResponse.ok || !expensesResponse.ok) {
        throw new Error(t.loadError);
      }

      const projectsData = await projectsResponse.json();
      const expensesData = await expensesResponse.json();

      setProjects(projectsData.projects || []);
      setExpenses(expensesData.expenses || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.loadError
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const totalBudget = projects.reduce(
    (sum, project) => sum + Number(project.budget || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const remainingBudget = totalBudget - totalExpenses;

  const utilization =
    totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  function getProjectName(id: string) {
    return (
      projects.find((project) => project.id === id)?.name ||
      "Unknown Project"
    );
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const projectName = getProjectName(expense.project_id);

      const matchesSearch =
        expense.title.toLowerCase().includes(search.toLowerCase()) ||
        projectName.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase());

      const matchesProject =
        selectedProject === "All" ||
        expense.project_id === selectedProject;

      return matchesSearch && matchesProject;
    });
  }, [expenses, search, selectedProject, projects]);

  function resetForm() {
    setTitle("");
    setAmount("");
    setCategory("Materials");
    setDate(today);
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  }

  function openNewExpenseForm() {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setCategory("Materials");
    setDate(today);
    setDescription("");
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function saveExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectId) {
      setError(t.selectFirst);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const expenseData = {
      project_id: projectId,
      title: title.trim(),
      category,
      amount: Number(amount),
      expense_date: date,
      description: description.trim() || null,
    };

    try {
      const response = await fetch(
        editingId
          ? `${API_URL}/expenses/${editingId}`
          : `${API_URL}/expenses`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.saveError);
      }

      await loadData();

      setMessage(editingId ? t.updated : t.added);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  function editExpense(expense: Expense) {
    setEditingId(expense.id);
    setTitle(expense.title);
    setProjectId(expense.project_id);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(expense.expense_date);
    setDescription(expense.description || "");
    setShowForm(true);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteExpense(id: string) {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.deleteError);
      }

      setExpenses((current) =>
        current.filter((expense) => expense.id !== id)
      );

      setMessage(t.deleted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.deleteError
      );
    }
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen p-5 transition-colors duration-300 md:p-8 ${pageBg}`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-wider text-cyan-500">
              {t.workspace}
            </p>

            <h1 className={`text-3xl font-bold md:text-4xl ${headingColor}`}>
              {t.title}
            </h1>

            <p className={`mt-2 text-sm ${mutedColor}`}>
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* Language */}
            <select
              aria-label={t.language}
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as Language)
              }
              className={`rounded-xl border px-3 py-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
            >
              <option value="en">🇬🇧 English</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="zh">🇨🇳 中文</option>
            </select>

            {/* Currency */}
            <select
              aria-label={t.currency}
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as Currency)
              }
              className={`rounded-xl border px-3 py-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
            >
              <option value="PKR">🇵🇰 PKR</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="AED">🇦🇪 AED</option>
              <option value="SAR">🇸🇦 SAR</option>
              <option value="GBP">🇬🇧 GBP</option>
              <option value="EUR">🇪🇺 EUR</option>
            </select>

            {/* Theme */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                isDark
                  ? "border-slate-700 bg-[#111F35] text-yellow-300 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-[#101E36] hover:bg-slate-100"
              }`}
            >
              {isDark ? `☀️ ${t.light}` : `🌙 ${t.dark}`}
            </button>

            {/* Add Expense */}
            <button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  openNewExpenseForm();
                }
              }}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-400"
            >
              {showForm ? t.close : t.add}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            className={`rounded-2xl border py-16 text-center text-cyan-500 ${cardBg}`}
          >
            {t.loading}
          </div>
        ) : (
          <>
            {/* Financial Overview */}
            <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: t.totalBudget,
                  value: money(totalBudget, currency),
                  icon: "▣",
                },
                {
                  label: t.totalExpenses,
                  value: money(totalExpenses, currency),
                  icon: "↗",
                },
                {
                  label: t.remaining,
                  value: money(remainingBudget, currency),
                  icon: "◈",
                },
                {
                  label: t.used,
                  value: `${utilization.toFixed(1)}%`,
                  icon: "◉",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${mutedColor}`}>
                      {item.label}
                    </p>

                    <span className="text-2xl text-cyan-500">
                      {item.icon}
                    </span>
                  </div>

                  <p
                    className={`mt-4 break-words text-2xl font-bold ${headingColor}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </section>

            {/* Add / Edit Expense Form */}
            {showForm && (
              <form
                onSubmit={saveExpense}
                className={`mb-8 rounded-2xl border border-cyan-500/30 p-6 shadow-sm ${cardBg}`}
              >
                <h2 className={`mb-5 text-xl font-semibold ${headingColor}`}>
                  {editingId ? t.editExpense : t.newExpense}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.expenseTitle}
                    className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  />

                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  >
                    <option value="" disabled>
                      {t.selectProject}
                    </option>

                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    required
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t.amount}
                    className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  />

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  >
                    <option value="Materials">{t.materials}</option>
                    <option value="Labor">{t.labor}</option>
                    <option value="Equipment">{t.equipment}</option>
                    <option value="Transportation">
                      {t.transportation}
                    </option>
                    <option value="Other">{t.other}</option>
                  </select>

                  <input
                    required
                    type="date"
                    aria-label={t.date}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  />

                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.description}
                    className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving || projects.length === 0}
                    className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? t.saving
                      : editingId
                      ? t.update
                      : t.save}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className={`rounded-xl border px-6 py-3 text-sm font-semibold transition hover:opacity-80 ${borderColor} ${mutedColor}`}
                  >
                    {t.cancel}
                  </button>
                </div>

                {projects.length === 0 && (
                  <p className="mt-3 text-sm text-amber-500">
                    {t.createFirst}
                  </p>
                )}
              </form>
            )}

            {/* Budget Utilization */}
            <section
              className={`mb-8 rounded-2xl border p-6 shadow-sm ${cardBg}`}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className={`text-xl font-semibold ${headingColor}`}>
                    {t.utilization}
                  </h2>

                  <p className={`mt-1 text-sm ${mutedColor}`}>
                    {t.overall}
                  </p>
                </div>

                <span className="text-xl font-bold text-cyan-500">
                  {utilization.toFixed(1)}%
                </span>
              </div>

              <div
                className={`h-4 overflow-hidden rounded-full ${
                  isDark ? "bg-slate-700" : "bg-slate-200"
                }`}
              >
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(utilization, 100)}%`,
                  }}
                />
              </div>

              <div
                className={`mt-3 flex justify-between gap-3 text-sm ${mutedColor}`}
              >
                <span>
                  {t.spent}: {money(totalExpenses, currency)}
                </span>

                <span>
                  {t.allocated}: {money(totalBudget, currency)}
                </span>
              </div>
            </section>

            {/* Project Budgets */}
            <section className="mb-8">
              <h2 className={`mb-4 text-xl font-semibold ${headingColor}`}>
                {t.projectBudgets}
              </h2>

              {projects.length === 0 ? (
                <p
                  className={`rounded-xl border p-6 ${cardBg} ${mutedColor}`}
                >
                  {t.noProjects}
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  {projects.map((p) => {
                    const spent = expenses
                      .filter((e) => e.project_id === p.id)
                      .reduce(
                        (sum, e) => sum + Number(e.amount),
                        0
                      );

                    const percentage =
                      p.budget > 0
                        ? (spent / p.budget) * 100
                        : 0;

                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}
                      >
                        <h3 className={`font-semibold ${headingColor}`}>
                          {p.name}
                        </h3>

                        <div className="mt-5 flex justify-between gap-3 text-sm">
                          <span className={mutedColor}>
                            {t.spent}
                          </span>

                          <span className={headingColor}>
                            {money(spent, currency)}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between gap-3 text-sm">
                          <span className={mutedColor}>
                            {t.allocated}
                          </span>

                          <span className={headingColor}>
                            {money(p.budget, currency)}
                          </span>
                        </div>

                        <div
                          className={`mt-4 h-2 overflow-hidden rounded-full ${
                            isDark
                              ? "bg-slate-700"
                              : "bg-slate-200"
                          }`}
                        >
                          <div
                            className="h-full rounded-full bg-cyan-500 transition-all"
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-right text-sm text-cyan-500">
                          {percentage.toFixed(1)}
                          {t.usedPercent}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Expense History */}
            <section
              className={`rounded-2xl border p-5 shadow-sm md:p-6 ${cardBg}`}
            >
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2
                    className={`text-xl font-semibold ${headingColor}`}
                  >
                    {t.history}
                  </h2>

                  <p className={`mt-1 text-sm ${mutedColor}`}>
                    {t.historyDesc}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.search}
                    className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  />

                  <select
                    value={selectedProject}
                    onChange={(e) =>
                      setSelectedProject(e.target.value)
                    }
                    className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                  >
                    <option value="All">
                      {t.allProjects}
                    </option>

                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${innerBg}`}
                  >
                    <div>
                      <h3
                        className={`font-semibold ${headingColor}`}
                      >
                        {expense.title}
                      </h3>

                      <p className={`mt-1 text-sm ${mutedColor}`}>
                        {getProjectName(expense.project_id)} ·{" "}
                        {expense.expense_date}
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-500">
                        {
                          categoryLabels[language][
                            expense.category as keyof typeof categoryLabels.en
                          ] || expense.category
                        }
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <p
                        className={`font-semibold ${headingColor}`}
                      >
                        {money(
                          Number(expense.amount),
                          currency
                        )}
                      </p>

                      <button
                        onClick={() => editExpense(expense)}
                        className="rounded-lg border border-cyan-500/30 px-3 py-2 text-sm text-cyan-500 transition hover:bg-cyan-500/10"
                      >
                        {t.edit}
                      </button>

                      <button
                        onClick={() =>
                          deleteExpense(expense.id)
                        }
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}

                {filteredExpenses.length === 0 && (
                  <div
                    className={`py-12 text-center ${mutedColor}`}
                  >
                    {t.noExpenses}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Back to Dashboard */}
        <div className="mt-6">
          <a
            href="/dashboard"
            className="text-sm font-medium text-cyan-500 transition hover:text-cyan-400"
          >
            {t.back}
          </a>
        </div>

        {/* Footer */}
        <footer
          className={`mt-8 border-t py-5 text-center text-xs ${borderColor} ${mutedColor}`}
        >
          © 2026 BuildWise AI. Plan Smarter. Monitor Better. Build Efficiently.
        </footer>
      </div>
    </main>
  );
}