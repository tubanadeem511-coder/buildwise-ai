
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSettings, type Language } from "@/components/SettingsProvider";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";

type Project = {
  id: string;
  name: string;
  location: string;
};

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

const translations = {
  en: {
    workspace: "BUILDWISE AI / TASKS",
    title: "Task Management",
    subtitle: "Organize, track and manage your construction tasks.",
    addTask: "+ Add New Task",
    closeForm: "✕ Close Form",
    total: "Total Tasks",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    createTitle: "Create New Task",
    taskTitle: "Task Title",
    selectProject: "Select Project",
    dueDate: "Due Date",
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
    save: "Save Task",
    saving: "Saving...",
    allTasks: "All Tasks",
    monitor: "Monitor your project activities.",
    search: "Search tasks...",
    allStatus: "All Status",
    priority: "Priority",
    due: "Due:",
    notSpecified: "Not specified",
    delete: "Delete",
    deleting: "Deleting...",
    noTasks: "No tasks found",
    noTasksHint: "Try another search or add a new task.",
    loading: "Loading tasks...",
    createFirst: "Please create a project before adding tasks.",
    back: "← Back to Dashboard",
    successCreate: "Task created successfully!",
    successUpdate: "Task status updated successfully!",
    successDelete: "Task deleted successfully!",
    errorLoad: "Unable to load projects or tasks.",
    errorCreate: "Failed to create task.",
    errorUpdate: "Failed to update task.",
    errorDelete: "Failed to delete task.",
    confirmDelete: "Are you sure you want to delete this task?",
    light: "Light Mode",
    dark: "Dark Mode",
    language: "Language",
  },
  ur: {
    workspace: "بلڈ وائز AI / ٹاسکس",
    title: "ٹاسک مینجمنٹ",
    subtitle: "اپنے تعمیراتی کاموں کو منظم کریں اور ان کی نگرانی کریں۔",
    addTask: "+ نیا ٹاسک شامل کریں",
    closeForm: "✕ فارم بند کریں",
    total: "کل ٹاسکس",
    pending: "زیر التواء",
    inProgress: "جاری",
    completed: "مکمل",
    createTitle: "نیا ٹاسک بنائیں",
    taskTitle: "ٹاسک کا نام",
    selectProject: "پروجیکٹ منتخب کریں",
    dueDate: "آخری تاریخ",
    low: "کم ترجیح",
    medium: "درمیانی ترجیح",
    high: "زیادہ ترجیح",
    save: "ٹاسک محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    allTasks: "تمام ٹاسکس",
    monitor: "اپنے پروجیکٹ کے کاموں کی نگرانی کریں۔",
    search: "ٹاسکس تلاش کریں...",
    allStatus: "تمام اسٹیٹس",
    priority: "ترجیح",
    due: "آخری تاریخ:",
    notSpecified: "مقرر نہیں",
    delete: "حذف کریں",
    deleting: "حذف ہو رہا ہے...",
    noTasks: "کوئی ٹاسک نہیں ملا",
    noTasksHint: "دوسری تلاش کریں یا نیا ٹاسک شامل کریں۔",
    loading: "ٹاسکس لوڈ ہو رہے ہیں...",
    createFirst: "ٹاسک شامل کرنے سے پہلے ایک پروجیکٹ بنائیں۔",
    back: "← ڈیش بورڈ پر واپس جائیں",
    successCreate: "ٹاسک کامیابی سے بن گیا!",
    successUpdate: "ٹاسک کا اسٹیٹس کامیابی سے اپ ڈیٹ ہوگیا!",
    successDelete: "ٹاسک کامیابی سے حذف ہوگیا!",
    errorLoad: "پروجیکٹس یا ٹاسکس لوڈ نہیں ہو سکے۔",
    errorCreate: "ٹاسک بنانے میں ناکامی۔",
    errorUpdate: "ٹاسک اپ ڈیٹ نہیں ہو سکا۔",
    errorDelete: "ٹاسک حذف نہیں ہو سکا۔",
    confirmDelete: "کیا آپ واقعی یہ ٹاسک حذف کرنا چاہتے ہیں؟",
    light: "لائٹ موڈ",
    dark: "ڈارک موڈ",
    language: "زبان",
  },
  ar: {
    workspace: "BUILDWISE AI / المهام",
    title: "إدارة المهام",
    subtitle: "نظّم مهام البناء وتابعها وأدرها.",
    addTask: "+ إضافة مهمة جديدة",
    closeForm: "✕ إغلاق النموذج",
    total: "إجمالي المهام",
    pending: "معلقة",
    inProgress: "قيد التنفيذ",
    completed: "مكتملة",
    createTitle: "إنشاء مهمة جديدة",
    taskTitle: "عنوان المهمة",
    selectProject: "اختر المشروع",
    dueDate: "تاريخ الاستحقاق",
    low: "أولوية منخفضة",
    medium: "أولوية متوسطة",
    high: "أولوية عالية",
    save: "حفظ المهمة",
    saving: "جارٍ الحفظ...",
    allTasks: "جميع المهام",
    monitor: "تابع أنشطة مشروعك.",
    search: "ابحث عن المهام...",
    allStatus: "جميع الحالات",
    priority: "الأولوية",
    due: "الاستحقاق:",
    notSpecified: "غير محدد",
    delete: "حذف",
    deleting: "جارٍ الحذف...",
    noTasks: "لم يتم العثور على مهام",
    noTasksHint: "جرّب بحثاً آخر أو أضف مهمة جديدة.",
    loading: "جارٍ تحميل المهام...",
    createFirst: "يرجى إنشاء مشروع قبل إضافة المهام.",
    back: "← العودة إلى لوحة التحكم",
    successCreate: "تم إنشاء المهمة بنجاح!",
    successUpdate: "تم تحديث حالة المهمة بنجاح!",
    successDelete: "تم حذف المهمة بنجاح!",
    errorLoad: "تعذر تحميل المشاريع أو المهام.",
    errorCreate: "فشل إنشاء المهمة.",
    errorUpdate: "فشل تحديث المهمة.",
    errorDelete: "فشل حذف المهمة.",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذه المهمة؟",
    light: "الوضع الفاتح",
    dark: "الوضع الداكن",
    language: "اللغة",
  },
  zh: {
    workspace: "BUILDWISE AI / 任务",
    title: "任务管理",
    subtitle: "组织、跟踪和管理您的建筑任务。",
    addTask: "+ 添加新任务",
    closeForm: "✕ 关闭表单",
    total: "任务总数",
    pending: "待处理",
    inProgress: "进行中",
    completed: "已完成",
    createTitle: "创建新任务",
    taskTitle: "任务名称",
    selectProject: "选择项目",
    dueDate: "截止日期",
    low: "低优先级",
    medium: "中优先级",
    high: "高优先级",
    save: "保存任务",
    saving: "保存中...",
    allTasks: "所有任务",
    monitor: "监控您的项目活动。",
    search: "搜索任务...",
    allStatus: "所有状态",
    priority: "优先级",
    due: "截止日期：",
    notSpecified: "未指定",
    delete: "删除",
    deleting: "删除中...",
    noTasks: "未找到任务",
    noTasksHint: "请尝试其他搜索或添加新任务。",
    loading: "正在加载任务...",
    createFirst: "请先创建项目，然后再添加任务。",
    back: "← 返回仪表板",
    successCreate: "任务创建成功！",
    successUpdate: "任务状态更新成功！",
    successDelete: "任务删除成功！",
    errorLoad: "无法加载项目或任务。",
    errorCreate: "创建任务失败。",
    errorUpdate: "更新任务失败。",
    errorDelete: "删除任务失败。",
    confirmDelete: "确定要删除此任务吗？",
    light: "浅色模式",
    dark: "深色模式",
    language: "语言",
  },
};

export default function TasksPage() {
  const { language, setLanguage, isDark, setTheme, isRTL } = useSettings();
  const t = translations[language];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");

  const pageBg = isDark
    ? "bg-[#0B1425] text-slate-100"
    : "bg-[#F4F7FB] text-slate-800";

  const cardBg = isDark
    ? "border-slate-700/60 bg-[#111F35]"
    : "border-slate-200 bg-white";

  const fieldBg = isDark
    ? "border-slate-700 bg-[#0B1425] text-white"
    : "border-slate-200 bg-white text-slate-800";

  const taskBg = isDark
    ? "border-slate-700/50 bg-[#0B1425]"
    : "border-slate-200 bg-slate-50";

  const headingColor = isDark ? "text-white" : "text-[#101E36]";
  const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
  const borderColor = isDark ? "border-slate-700" : "border-slate-200";

  const statusLabels: Record<TaskStatus, string> = {
    Pending: t.pending,
    "In Progress": t.inProgress,
    Completed: t.completed,
  };

  const priorityLabels: Record<TaskPriority, string> = {
    Low: t.low,
    Medium: t.medium,
    High: t.high,
  };

  // Load projects and tasks from backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [projectsResponse, tasksResponse] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/tasks`),
        ]);

        if (!projectsResponse.ok || !tasksResponse.ok) {
          throw new Error("Unable to load projects or tasks.");
        }

        const projectsData = await projectsResponse.json();
        const tasksData = await tasksResponse.json();

        setProjects(projectsData.projects || []);
        setTasks(tasksData.tasks || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t.errorLoad
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getProjectName(id: string) {
    return (
      projects.find((project) => project.id === id)?.name ||
      "Unknown Project"
    );
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const projectName = getProjectName(task.project_id);

      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        projectName.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, projects, search, filter]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          title,
          description: null,
          due_date: dueDate,
          priority,
          status: "Pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.errorCreate);
      }

      setTasks((current) => [data.task, ...current]);

      setTitle("");
      setProjectId("");
      setDueDate("");
      setPriority("Medium");
      setShowForm(false);

      setSuccess(t.successCreate);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorCreate);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: TaskStatus) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.errorUpdate);
      }

      setTasks((current) =>
        current.map((task) => (task.id === id ? data.task : task))
      );

      setSuccess(t.successUpdate);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorUpdate);
    }
  }

  async function deleteTask(id: string) {
    const confirmed = window.confirm(t.confirmDelete);

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.errorDelete);
      }

      setTasks((current) => current.filter((task) => task.id !== id));

      setSuccess(t.successDelete);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorDelete);
    }
  }

  function priorityStyle(value: TaskPriority) {
    if (value === "High") {
      return "bg-red-500/10 text-red-500";
    }
    if (value === "Medium") {
      return "bg-amber-500/10 text-amber-500";
    }
    return "bg-cyan-500/10 text-cyan-500";
  }

  function statusStyle(value: TaskStatus) {
    if (value === "Completed") {
      return "bg-emerald-500/10 text-emerald-500";
    }
    if (value === "In Progress") {
      return "bg-cyan-500/10 text-cyan-500";
    }
    return "bg-amber-500/10 text-amber-500";
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
            {/* Language Selector */}
            <select
              aria-label={t.language}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={`rounded-xl border px-3 py-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
            >
              <option value="en">🇬🇧 English</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="zh">🇨🇳 中文</option>
            </select>

            {/* Theme Toggle */}
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

            {/* Add Task */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-400"
            >
              {showForm ? t.closeForm : t.addTask}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">
            {success}
          </div>
        )}

        {/* Task Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t.total, value: totalTasks, icon: "▤" },
            { label: t.pending, value: pendingTasks, icon: "◷" },
            { label: t.inProgress, value: inProgressTasks, icon: "↻" },
            { label: t.completed, value: completedTasks, icon: "✓" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm ${mutedColor}`}>{item.label}</p>
                <span className="text-2xl text-cyan-500">{item.icon}</span>
              </div>
              <p className={`mt-4 text-3xl font-bold ${headingColor}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Create Task Form */}
        {showForm && (
          <form
            onSubmit={addTask}
            className={`mb-8 rounded-2xl border border-cyan-500/30 p-6 shadow-sm ${cardBg}`}
          >
            <h2 className={`mb-5 text-xl font-semibold ${headingColor}`}>
              {t.createTitle}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.taskTitle}
                className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
              />

              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
              >
                <option value="">{t.selectProject}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <input
                required
                type="date"
                aria-label={t.dueDate}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
              />

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskPriority)
                }
                className={`rounded-xl border p-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
              >
                <option value="Low">{t.low}</option>
                <option value="Medium">{t.medium}</option>
                <option value="High">{t.high}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving || projects.length === 0}
              className="mt-5 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>

            {projects.length === 0 && (
              <p className="mt-3 text-sm text-amber-500">
                {t.createFirst}
              </p>
            )}
          </form>
        )}

        {/* All Tasks */}
        <section className={`rounded-2xl border p-5 shadow-sm md:p-6 ${cardBg}`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${headingColor}`}>
                {t.allTasks}
              </h2>
              <p className={`mt-1 text-sm ${mutedColor}`}>
                {t.monitor}
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
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
              >
                <option value="All">{t.allStatus}</option>
                <option value="Pending">{t.pending}</option>
                <option value="In Progress">{t.inProgress}</option>
                <option value="Completed">{t.completed}</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className={`py-12 text-center ${mutedColor}`}>
                {t.loading}
              </div>
            ) : (
              <>
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between ${taskBg}`}
                  >
                    <div className="min-w-0">
                      <h3 className={`font-semibold ${headingColor}`}>
                        {task.title}
                      </h3>

                      <p className={`mt-1 text-sm ${mutedColor}`}>
                        {getProjectName(task.project_id)} · {t.due}{" "}
                        {task.due_date || t.notSpecified}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyle(task.priority)}`}
                        >
                          {priorityLabels[task.priority] || task.priority}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(task.status)}`}
                        >
                          {statusLabels[task.status] || task.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Update status for ${task.title}`}
                        value={task.status}
                        onChange={(e) =>
                          updateStatus(
                            task.id,
                            e.target.value as TaskStatus
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm outline-none focus:border-cyan-500 ${fieldBg}`}
                      >
                        <option value="Pending">{t.pending}</option>
                        <option value="In Progress">{t.inProgress}</option>
                        <option value="Completed">{t.completed}</option>
                      </select>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="py-12 text-center">
                    <p className={`text-lg font-medium ${headingColor}`}>
                      {t.noTasks}
                    </p>
                    <p className={`mt-2 text-sm ${mutedColor}`}>
                      {t.noTasksHint}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

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
        <footer className={`mt-8 border-t py-5 text-center text-xs ${borderColor} ${mutedColor}`}>
          © 2026 BuildWise AI. Plan Smarter. Monitor Better. Build Efficiently.
        </footer>
      </div>
    </main>
  );
}
