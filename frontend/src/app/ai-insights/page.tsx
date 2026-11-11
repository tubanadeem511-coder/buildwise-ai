
"use client";

import { useEffect, useState } from "react";
import { useSettings, type Language } from "@/components/SettingsProvider";

type Risk = {
  id: number;
  title: string;
  project: string;
  category: string;
  level: "High" | "Medium" | "Low";
  description: string;
  recommendation: string;
};

type Project = {
  id: string;
  name: string;
};

type Analysis = {
  summary: string;
  risks: Omit<Risk, "id">[];
  recommendations: string[];
};

type DataSummary = {
  projects_analyzed: number;
  tasks_analyzed: number;
  expenses_analyzed: number;
  materials_analyzed: number;
};

type OrchestratorResult = {
  status: string;
  orchestrator: string;
  selected_agent: string;
  user_query: string;
  result: {
    status: string;
    agent: string;
    skill: string;
    project_id: string;
    analysis: string;
    message?: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

const riskStyle = {
  High: "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    intelligence: "INTELLIGENCE",
    title: "AI Insights & Risk Analysis",
    subtitle: "Identify construction risks and make smarter project decisions.",
    generate: "✦ Generate AI Report",
    analyzing: "✦ Analyzing...",
    assistantBanner: "BUILDWISE INTELLIGENCE ENGINE",
    assistantTitle: "Your Construction Risk Assistant",
    assistantDescription: "Analyze project conditions, identify potential problems and receive actionable recommendations to improve project performance.",
    multiAgent: "MULTI-AGENT INTELLIGENCE",
    multiTitle: "AI Multi-Agent Assistant",
    multiDescription: "Ask a construction project question. The AI Orchestrator automatically selects the most relevant specialist agent to analyze your project.",
    selectProject: "Select Project",
    chooseProject: "Choose a project",
    askAI: "Ask BuildWise AI",
    questionLabel: "Ask BuildWise AI",
    questionPlaceholder: "e.g. Analyze project progress, pending tasks and deadlines.",
    askButton: "✦ Ask BuildWise AI",
    agentAnalyzing: "✦ Analyzing with AI Agents...",
    specialist: "Selected Specialist Agent",
    complete: "Analysis Complete",
    selectedAgent: "Selected Agent",
    appliedSkill: "Applied Skill",
    yourQuestion: "Your Question",
    agentAnalysis: "AI Agent Analysis",
    totalRisks: "Total Risks",
    highRisk: "High Risk",
    mediumRisk: "Medium Risk",
    lowRisk: "Low Risk",
    reportTitle: "AI Risk Analysis Report",
    reportDescription: "Analysis successfully generated using your construction database.",
    recommendations: "AI Recommendations",
    projects: "Projects",
    tasks: "Tasks",
    expenses: "Expenses",
    materials: "Materials",
    riskDistribution: "Risk Distribution",
    riskDistributionDesc: "Overview of identified project risks",
    systemOverview: "AI System Overview",
    systemOverviewDesc: "Intelligence engine status",
    budgetAnalysis: "Budget Risk Analysis",
    scheduleAnalysis: "Schedule Risk Analysis",
    materialAnalysis: "Material Risk Analysis",
    aiRecommendations: "AI Recommendations",
    active: "Active",
    available: "Available",
    liveMode: "Live mode · Gemini AI + Supabase database",
    readyMode: "Ready · Generate a report to analyze live project data",
    detectedRisks: "Detected Project Risks",
    detectedRisksDesc: "Review identified risks and suggested actions.",
    allLevels: "All Risk Levels",
    allProjects: "All Projects",
    dismiss: "Dismiss",
    recommendedAction: "Recommended Action",
    noRisks: "No risks found for this filter.",
    analyzingData: "Analyzing your construction data...",
    generateFirst: "Click Generate AI Report to analyze your projects.",
    backDashboard: "← Back to Dashboard",
    unableProjects: "Unable to load projects.",
    projectRequired: "Please select a project.",
    questionRequired: "Please enter your construction-related question.",
    orchestratorFailed: "Orchestrator request failed.",
    noAgentResponse: "No agent response received.",
    agentFailed: "The selected AI agent could not complete the request.",
    reportFailed: "AI risk analysis could not be completed.",
    invalidResponse: "Invalid AI analysis response.",
    invalidFormat: "AI returned an invalid report format.",
    reportError: "Something went wrong while generating the report.",
    somethingWrong: "Something went wrong.",
    riskHigh: "High Risk",
    riskMedium: "Medium Risk",
    riskLow: "Low Risk",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ Light",
    dark: "🌙 Dark",
  },

  ur: {
    intelligence: "ذہانت",
    title: "AI بصیرت اور خطرات کا تجزیہ",
    subtitle: "تعمیراتی خطرات کی نشاندہی کریں اور بہتر فیصلے کریں۔",
    generate: "✦ AI رپورٹ بنائیں",
    analyzing: "✦ تجزیہ جاری ہے...",
    assistantBanner: "بلڈ وائز انٹیلیجنس انجن",
    assistantTitle: "تعمیراتی خطرات کا AI اسسٹنٹ",
    assistantDescription: "پروجیکٹ کی صورتحال کا تجزیہ کریں، ممکنہ مسائل کی نشاندہی کریں اور کارکردگی بہتر بنانے کے لیے تجاویز حاصل کریں۔",
    multiAgent: "ملٹی ایجنٹ انٹیلیجنس",
    multiTitle: "AI ملٹی ایجنٹ اسسٹنٹ",
    multiDescription: "تعمیراتی پروجیکٹ کے بارے میں سوال پوچھیں۔ AI Orchestrator خودکار طور پر متعلقہ ماہر ایجنٹ منتخب کرے گا۔",
    selectProject: "پروجیکٹ منتخب کریں",
    chooseProject: "پروجیکٹ منتخب کریں",
    askAI: "بلڈ وائز AI سے سوال کریں",
    questionLabel: "اپنا سوال لکھیں",
    questionPlaceholder: "مثال: پروجیکٹ کی پیش رفت، زیر التوا کاموں اور آخری تاریخوں کا تجزیہ کریں۔",
    askButton: "✦ بلڈ وائز AI سے پوچھیں",
    agentAnalyzing: "✦ AI ایجنٹس تجزیہ کر رہے ہیں...",
    specialist: "منتخب کردہ ماہر ایجنٹ",
    complete: "تجزیہ مکمل",
    selectedAgent: "منتخب ایجنٹ",
    appliedSkill: "استعمال شدہ اسکل",
    yourQuestion: "آپ کا سوال",
    agentAnalysis: "AI ایجنٹ کا تجزیہ",
    totalRisks: "کل خطرات",
    highRisk: "زیادہ خطرہ",
    mediumRisk: "درمیانہ خطرہ",
    lowRisk: "کم خطرہ",
    reportTitle: "AI خطرات کی تجزیاتی رپورٹ",
    reportDescription: "تعمیراتی ڈیٹا بیس کے ذریعے تجزیہ کامیابی سے مکمل ہو گیا۔",
    recommendations: "AI کی تجاویز",
    projects: "پروجیکٹس",
    tasks: "کام",
    expenses: "اخراجات",
    materials: "مواد",
    riskDistribution: "خطرات کی تقسیم",
    riskDistributionDesc: "شناخت شدہ پروجیکٹ خطرات کا جائزہ",
    systemOverview: "AI سسٹم کا جائزہ",
    systemOverviewDesc: "انٹیلیجنس انجن کی صورتحال",
    budgetAnalysis: "بجٹ کے خطرات کا تجزیہ",
    scheduleAnalysis: "شیڈول کے خطرات کا تجزیہ",
    materialAnalysis: "مواد کے خطرات کا تجزیہ",
    aiRecommendations: "AI تجاویز",
    active: "فعال",
    available: "دستیاب",
    liveMode: "لائیو موڈ · Gemini AI + Supabase ڈیٹا بیس",
    readyMode: "تیار ہے · پروجیکٹ ڈیٹا کے تجزیے کے لیے رپورٹ بنائیں",
    detectedRisks: "شناخت شدہ پروجیکٹ خطرات",
    detectedRisksDesc: "شناخت شدہ خطرات اور ان کے حل دیکھیں۔",
    allLevels: "تمام خطرات",
    allProjects: "تمام پروجیکٹس",
    dismiss: "خارج کریں",
    recommendedAction: "تجویز کردہ اقدام",
    noRisks: "اس فلٹر کے لیے کوئی خطرہ نہیں ملا۔",
    analyzingData: "تعمیراتی ڈیٹا کا تجزیہ ہو رہا ہے...",
    generateFirst: "پروجیکٹس کا تجزیہ کرنے کے لیے AI رپورٹ بنائیں۔",
    backDashboard: "← ڈیش بورڈ پر واپس جائیں",
    unableProjects: "پروجیکٹس لوڈ نہیں ہو سکے۔",
    projectRequired: "براہ کرم پروجیکٹ منتخب کریں۔",
    questionRequired: "براہ کرم تعمیرات سے متعلق سوال لکھیں۔",
    orchestratorFailed: "Orchestrator درخواست ناکام ہو گئی۔",
    noAgentResponse: "کسی AI ایجنٹ کا جواب موصول نہیں ہوا۔",
    agentFailed: "منتخب AI ایجنٹ درخواست مکمل نہیں کر سکا۔",
    reportFailed: "AI خطرات کا تجزیہ مکمل نہیں ہو سکا۔",
    invalidResponse: "AI تجزیے کا جواب درست نہیں ہے۔",
    invalidFormat: "AI نے رپورٹ کا درست فارمیٹ نہیں دیا۔",
    reportError: "رپورٹ بناتے وقت کوئی مسئلہ پیش آیا۔",
    somethingWrong: "کچھ غلط ہو گیا۔",
    riskHigh: "زیادہ خطرہ",
    riskMedium: "درمیانہ خطرہ",
    riskLow: "کم خطرہ",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ لائٹ",
    dark: "🌙 ڈارک",
  },

  ar: {
    intelligence: "الذكاء",
    title: "رؤى الذكاء الاصطناعي وتحليل المخاطر",
    subtitle: "حدد مخاطر البناء واتخذ قرارات أفضل للمشروع.",
    generate: "✦ إنشاء تقرير الذكاء الاصطناعي",
    analyzing: "✦ جارٍ التحليل...",
    assistantBanner: "محرك ذكاء بيلد وايز",
    assistantTitle: "مساعد مخاطر البناء",
    assistantDescription: "حلل حالة المشروع وحدد المشكلات المحتملة واحصل على توصيات عملية لتحسين الأداء.",
    multiAgent: "ذكاء متعدد الوكلاء",
    multiTitle: "مساعد الذكاء الاصطناعي متعدد الوكلاء",
    multiDescription: "اطرح سؤالاً حول مشروع البناء. يختار المنسق تلقائياً الوكيل المتخصص الأنسب لتحليل مشروعك.",
    selectProject: "اختر المشروع",
    chooseProject: "اختر مشروعاً",
    askAI: "اسأل بيلد وايز AI",
    questionLabel: "اكتب سؤالك",
    questionPlaceholder: "مثال: حلل تقدم المشروع والمهام المعلقة والمواعيد النهائية.",
    askButton: "✦ اسأل بيلد وايز AI",
    agentAnalyzing: "✦ جارٍ التحليل باستخدام وكلاء AI...",
    specialist: "الوكيل المتخصص المختار",
    complete: "اكتمل التحليل",
    selectedAgent: "الوكيل المختار",
    appliedSkill: "المهارة المستخدمة",
    yourQuestion: "سؤالك",
    agentAnalysis: "تحليل وكيل الذكاء الاصطناعي",
    totalRisks: "إجمالي المخاطر",
    highRisk: "مخاطر عالية",
    mediumRisk: "مخاطر متوسطة",
    lowRisk: "مخاطر منخفضة",
    reportTitle: "تقرير تحليل مخاطر AI",
    reportDescription: "تم إنشاء التحليل بنجاح باستخدام قاعدة بيانات البناء.",
    recommendations: "توصيات الذكاء الاصطناعي",
    projects: "المشاريع",
    tasks: "المهام",
    expenses: "المصروفات",
    materials: "المواد",
    riskDistribution: "توزيع المخاطر",
    riskDistributionDesc: "نظرة عامة على مخاطر المشروع المحددة",
    systemOverview: "نظرة عامة على نظام AI",
    systemOverviewDesc: "حالة محرك الذكاء",
    budgetAnalysis: "تحليل مخاطر الميزانية",
    scheduleAnalysis: "تحليل مخاطر الجدول الزمني",
    materialAnalysis: "تحليل مخاطر المواد",
    aiRecommendations: "توصيات AI",
    active: "نشط",
    available: "متاح",
    liveMode: "وضع مباشر · Gemini AI + قاعدة بيانات Supabase",
    readyMode: "جاهز · أنشئ تقريراً لتحليل بيانات المشروع",
    detectedRisks: "مخاطر المشروع المكتشفة",
    detectedRisksDesc: "راجع المخاطر المحددة والإجراءات المقترحة.",
    allLevels: "جميع مستويات المخاطر",
    allProjects: "جميع المشاريع",
    dismiss: "إزالة",
    recommendedAction: "الإجراء الموصى به",
    noRisks: "لم يتم العثور على مخاطر لهذا المرشح.",
    analyzingData: "جارٍ تحليل بيانات البناء...",
    generateFirst: "اضغط على إنشاء تقرير AI لتحليل مشاريعك.",
    backDashboard: "← العودة إلى لوحة التحكم",
    unableProjects: "تعذر تحميل المشاريع.",
    projectRequired: "يرجى اختيار مشروع.",
    questionRequired: "يرجى إدخال سؤالك المتعلق بالبناء.",
    orchestratorFailed: "فشل طلب المنسق.",
    noAgentResponse: "لم يتم تلقي رد من أي وكيل.",
    agentFailed: "لم يتمكن وكيل AI المختار من إكمال الطلب.",
    reportFailed: "تعذر إكمال تحليل المخاطر.",
    invalidResponse: "استجابة تحليل AI غير صالحة.",
    invalidFormat: "أعاد AI تنسيق تقرير غير صالح.",
    reportError: "حدث خطأ أثناء إنشاء التقرير.",
    somethingWrong: "حدث خطأ ما.",
    riskHigh: "مخاطر عالية",
    riskMedium: "مخاطر متوسطة",
    riskLow: "مخاطر منخفضة",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ فاتح",
    dark: "🌙 داكن",
  },

  zh: {
    intelligence: "智能分析",
    title: "AI 洞察与风险分析",
    subtitle: "识别建筑风险并做出更明智的项目决策。",
    generate: "✦ 生成 AI 报告",
    analyzing: "✦ 正在分析...",
    assistantBanner: "BUILDWISE 智能引擎",
    assistantTitle: "建筑风险助手",
    assistantDescription: "分析项目状况，识别潜在问题，并获取改善项目绩效的可执行建议。",
    multiAgent: "多智能体分析",
    multiTitle: "AI 多智能体助手",
    multiDescription: "提出建筑项目相关问题。AI 协调器会自动选择最合适的专业智能体分析项目。",
    selectProject: "选择项目",
    chooseProject: "请选择项目",
    askAI: "询问 BuildWise AI",
    questionLabel: "输入您的问题",
    questionPlaceholder: "例如：分析项目进度、待处理任务和截止日期。",
    askButton: "✦ 询问 BuildWise AI",
    agentAnalyzing: "✦ AI 智能体正在分析...",
    specialist: "已选择的专业智能体",
    complete: "分析完成",
    selectedAgent: "已选智能体",
    appliedSkill: "使用的技能",
    yourQuestion: "您的问题",
    agentAnalysis: "AI 智能体分析",
    totalRisks: "风险总数",
    highRisk: "高风险",
    mediumRisk: "中风险",
    lowRisk: "低风险",
    reportTitle: "AI 风险分析报告",
    reportDescription: "已成功使用建筑数据库生成分析。",
    recommendations: "AI 建议",
    projects: "项目",
    tasks: "任务",
    expenses: "支出",
    materials: "材料",
    riskDistribution: "风险分布",
    riskDistributionDesc: "已识别项目风险概览",
    systemOverview: "AI 系统概览",
    systemOverviewDesc: "智能引擎状态",
    budgetAnalysis: "预算风险分析",
    scheduleAnalysis: "进度风险分析",
    materialAnalysis: "材料风险分析",
    aiRecommendations: "AI 建议",
    active: "运行中",
    available: "可用",
    liveMode: "实时模式 · Gemini AI + Supabase 数据库",
    readyMode: "已就绪 · 生成报告以分析实时项目数据",
    detectedRisks: "已检测到的项目风险",
    detectedRisksDesc: "查看已识别的风险和建议措施。",
    allLevels: "所有风险级别",
    allProjects: "所有项目",
    dismiss: "移除",
    recommendedAction: "建议措施",
    noRisks: "此筛选条件下未发现风险。",
    analyzingData: "正在分析建筑项目数据...",
    generateFirst: "点击生成 AI 报告以分析项目。",
    backDashboard: "← 返回仪表板",
    unableProjects: "无法加载项目。",
    projectRequired: "请先选择项目。",
    questionRequired: "请输入与建筑相关的问题。",
    orchestratorFailed: "协调器请求失败。",
    noAgentResponse: "未收到智能体回复。",
    agentFailed: "所选 AI 智能体无法完成请求。",
    reportFailed: "无法完成 AI 风险分析。",
    invalidResponse: "AI 分析响应无效。",
    invalidFormat: "AI 返回了无效的报告格式。",
    reportError: "生成报告时发生错误。",
    somethingWrong: "发生错误。",
    riskHigh: "高风险",
    riskMedium: "中风险",
    riskLow: "低风险",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ 浅色",
    dark: "🌙 深色",
  },
};

export default function AIInsightsPage() {
  const { language, setLanguage, isDark, setTheme, isRTL } = useSettings();
  const t = translations[language];

  const [risks, setRisks] = useState<Risk[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);

  // Orchestrator states
  const [orchestratorQuery, setOrchestratorQuery] = useState("");
  const [orchestratorProjectId, setOrchestratorProjectId] = useState("");
  const [orchestratorLoading, setOrchestratorLoading] = useState(false);
  const [orchestratorError, setOrchestratorError] = useState("");
  const [orchestratorResult, setOrchestratorResult] =
    useState<OrchestratorResult | null>(null);

  // Theme classes
  const pageBg = isDark
    ? "bg-[#0B1425] text-white"
    : "bg-[#F4F7FB] text-slate-800";

  const panelBg = isDark
    ? "border-slate-700/60 bg-[#111F35]"
    : "border-slate-200 bg-white";

  const innerBg = isDark
    ? "border-slate-700 bg-[#0B1425] text-white"
    : "border-slate-300 bg-white text-slate-800";

  const heading = isDark ? "text-white" : "text-[#101E36]";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const bodyText = isDark ? "text-slate-300" : "text-slate-600";
  const borderColor = isDark ? "border-slate-700/60" : "border-slate-200";

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch(`${API_URL}/projects`);

        if (!response.ok) {
          throw new Error(t.unableProjects);
        }

        const data = await response.json();
        const loadedProjects = data.projects || [];

        setProjects(loadedProjects);

        if (loadedProjects.length > 0) {
          setOrchestratorProjectId(loadedProjects[0].id);
        }
      } catch (err) {
        console.error("Project loading error:", err);
      }
    }

    loadProjects();
  }, []);

  const highCount = risks.filter((r) => r.level === "High").length;
  const mediumCount = risks.filter((r) => r.level === "Medium").length;
  const lowCount = risks.filter((r) => r.level === "Low").length;

  const filteredRisks = risks.filter((risk) => {
    const matchesLevel = filter === "All" || risk.level === filter;
    const matchesProject =
      selectedProject === "All" || risk.project === selectedProject;

    return matchesLevel && matchesProject;
  });

  // Generate AI Risk Report
  async function generateReport() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/ai-risk-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || t.reportFailed);
      }

      if (result.status !== "success" || !result.analysis) {
        throw new Error(t.invalidResponse);
      }

      let parsedAnalysis: Analysis;

      if (typeof result.analysis === "string") {
        const cleanedResponse = result.analysis
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();

        parsedAnalysis = JSON.parse(cleanedResponse);
      } else {
        parsedAnalysis = result.analysis;
      }

      if (
        !parsedAnalysis ||
        !Array.isArray(parsedAnalysis.risks) ||
        typeof parsedAnalysis.summary !== "string"
      ) {
        throw new Error(t.invalidFormat);
      }

      const validLevels = ["High", "Medium", "Low"];

      const formattedRisks: Risk[] = parsedAnalysis.risks
        .filter(
          (risk) =>
            risk.title &&
            risk.project &&
            risk.category &&
            validLevels.includes(risk.level) &&
            risk.description &&
            risk.recommendation
        )
        .map((risk, index) => ({
          ...risk,
          id: index + 1,
        }));

      setRisks(formattedRisks);
      setSummary(parsedAnalysis.summary);

      setRecommendations(
        Array.isArray(parsedAnalysis.recommendations)
          ? parsedAnalysis.recommendations
          : []
      );

      setDataSummary(result.data_summary || null);
      setGenerated(true);
    } catch (err) {
      console.error("AI report error:", err);

      setError(
        err instanceof Error ? err.message : t.reportError
      );
    } finally {
      setLoading(false);
    }
  }

  // Run AI Multi-Agent Orchestrator
  async function runOrchestrator() {
    if (!orchestratorProjectId) {
      setOrchestratorError(t.projectRequired);
      return;
    }

    if (!orchestratorQuery.trim()) {
      setOrchestratorError(t.questionRequired);
      return;
    }

    setOrchestratorLoading(true);
    setOrchestratorError("");
    setOrchestratorResult(null);

    try {
      const response = await fetch(`${API_URL}/orchestrator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: orchestratorProjectId,
          user_query: orchestratorQuery.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || t.orchestratorFailed);
      }

      if (result.status !== "success" || !result.result) {
        throw new Error(
          result.result?.message ||
            result.message ||
            t.noAgentResponse
        );
      }

      if (result.result.status !== "success") {
        throw new Error(
          result.result.message || t.agentFailed
        );
      }

      setOrchestratorResult(result as OrchestratorResult);
    } catch (err) {
      console.error("Orchestrator error:", err);

      setOrchestratorError(
        err instanceof Error ? err.message : t.somethingWrong
      );
    } finally {
      setOrchestratorLoading(false);
    }
  }

  // Dismiss risk
  function dismissRisk(id: number) {
    setRisks((current) => current.filter((risk) => risk.id !== id));
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen p-5 transition-colors duration-300 md:p-8 ${pageBg}`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-cyan-500">
              BUILDWISE AI / {t.intelligence}
            </p>

            <h1 className={`text-3xl font-bold md:text-4xl ${heading}`}>
              {t.title}
            </h1>

            <p className={`mt-2 text-sm ${muted}`}>
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label="Select language"
              className={`rounded-xl border px-3 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                isDark
                  ? "border-slate-600 bg-[#111F35] text-white hover:bg-slate-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isDark ? t.light : t.dark}
            </button>

            <button
              onClick={generateReport}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.analyzing : t.generate}
            </button>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-[#142B49] to-[#102033] p-6 md:p-8">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">✦</span>

                <span className="text-sm font-semibold tracking-wider text-cyan-400">
                  {t.assistantBanner}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white">
                {t.assistantTitle}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {t.assistantDescription}
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-4xl text-cyan-400">
              ✧
            </div>
          </div>
        </section>

        {/* AI Multi-Agent Orchestrator */}
        <section className={`mb-8 rounded-2xl border border-cyan-400/30 p-6 md:p-8 ${panelBg}`}>

          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl text-cyan-500">✦</span>

              <span className="text-sm font-semibold tracking-wider text-cyan-500">
                {t.multiAgent}
              </span>
            </div>

            <h2 className={`text-2xl font-bold ${heading}`}>
              {t.multiTitle}
            </h2>

            <p className={`mt-2 text-sm leading-6 ${muted}`}>
              {t.multiDescription}
            </p>
          </div>

          {/* Project Selection */}
          <div className="mb-5">
            <label className={`mb-2 block text-sm font-medium ${bodyText}`}>
              {t.selectProject}
            </label>

            <select
              value={orchestratorProjectId}
              onChange={(e) => setOrchestratorProjectId(e.target.value)}
              disabled={orchestratorLoading}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-cyan-400 disabled:opacity-60 ${innerBg}`}
            >
              <option value="">{t.chooseProject}</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Question */}
          <div className="mb-5">
            <label className={`mb-2 block text-sm font-medium ${bodyText}`}>
              {t.questionLabel}
            </label>

            <textarea
              value={orchestratorQuery}
              onChange={(e) => setOrchestratorQuery(e.target.value)}
              disabled={orchestratorLoading}
              rows={4}
              placeholder={t.questionPlaceholder}
              className={`w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60 ${innerBg}`}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={runOrchestrator}
            disabled={
              orchestratorLoading ||
              !orchestratorProjectId ||
              !orchestratorQuery.trim()
            }
            className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {orchestratorLoading ? t.agentAnalyzing : t.askButton}
          </button>

          {/* Orchestrator Error */}
          {orchestratorError && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {orchestratorError}
            </div>
          )}

          {/* Orchestrator Result */}
          {orchestratorResult && (
            <div className={`mt-7 overflow-hidden rounded-xl border border-cyan-400/30 ${isDark ? "bg-[#0B1425]" : "bg-slate-50"}`}>

              <div className={`border-b p-5 ${borderColor}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-500">
                      {t.specialist}
                    </p>

                    <h3 className={`mt-2 text-xl font-bold ${heading}`}>
                      {orchestratorResult.result.agent}
                    </h3>
                  </div>

                  <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-500">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    {t.complete}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <div className={`rounded-lg border p-4 ${panelBg}`}>
                    <p className={`text-xs ${muted}`}>
                      {t.selectedAgent}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-cyan-500">
                      {orchestratorResult.selected_agent.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className={`rounded-lg border p-4 ${panelBg}`}>
                    <p className={`text-xs ${muted}`}>
                      {t.appliedSkill}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-cyan-500">
                      {orchestratorResult.result.skill}
                    </p>
                  </div>

                </div>

                <div className="mt-4">
                  <p className={`text-xs ${muted}`}>
                    {t.yourQuestion}
                  </p>

                  <p className={`mt-2 text-sm leading-6 ${bodyText}`}>
                    {orchestratorResult.user_query}
                  </p>
                </div>
              </div>

              {/* Agent Analysis */}
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xl text-cyan-500">✦</span>

                  <h3 className={`text-lg font-semibold ${heading}`}>
                    {t.agentAnalysis}
                  </h3>
                </div>

                <div className={`whitespace-pre-wrap break-words text-sm leading-7 ${bodyText}`}>
                  {orchestratorResult.result.analysis}
                </div>
              </div>

            </div>
          )}
        </section>

        {/* Existing AI Risk Analysis Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Risk Summary */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t.totalRisks, value: risks.length, icon: "◈" },
            { label: t.highRisk, value: highCount, icon: "⚠" },
            { label: t.mediumRisk, value: mediumCount, icon: "◷" },
            { label: t.lowRisk, value: lowCount, icon: "✓" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 ${panelBg}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm ${muted}`}>{item.label}</p>

                <span className="text-2xl text-cyan-500">
                  {item.icon}
                </span>
              </div>

              <p className={`mt-4 text-3xl font-bold ${heading}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Report Result */}
        {generated && (
          <>
            <section className="mb-8 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-cyan-500">✦</span>

                <div>
                  <h2 className="font-semibold text-cyan-500">
                    {t.reportTitle}
                  </h2>

                  <p className={`mt-1 text-sm ${bodyText}`}>
                    {t.reportDescription}
                  </p>
                </div>
              </div>

              <p className={`mt-5 text-sm leading-7 ${bodyText}`}>
                {summary}
              </p>

              {dataSummary && (
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-cyan-400/20 pt-5 md:grid-cols-4">
                  {[
                    [t.projects, dataSummary.projects_analyzed],
                    [t.tasks, dataSummary.tasks_analyzed],
                    [t.expenses, dataSummary.expenses_analyzed],
                    [t.materials, dataSummary.materials_analyzed],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className={`text-xs ${muted}`}>
                        {label}
                      </p>

                      <p className="mt-1 text-xl font-bold text-cyan-500">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <section className={`mb-8 rounded-2xl border p-6 ${panelBg}`}>
                <h2 className={`text-xl font-semibold ${heading}`}>
                  ✦ {t.recommendations}
                </h2>

                <div className="mt-5 space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 rounded-xl border p-4 ${
                        isDark
                          ? "border-slate-700/50 bg-[#0B1425]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-cyan-500">
                        {index + 1}.
                      </span>

                      <p className={`text-sm leading-6 ${bodyText}`}>
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Risk Distribution & System Overview */}
        <section className="mb-8 grid gap-5 lg:grid-cols-2">

          <div className={`rounded-2xl border p-6 ${panelBg}`}>
            <h2 className={`text-xl font-semibold ${heading}`}>
              {t.riskDistribution}
            </h2>

            <p className={`mt-1 text-sm ${muted}`}>
              {t.riskDistributionDesc}
            </p>

            <div className="mt-7 space-y-6">
              {[
                { label: t.highRisk, count: highCount, color: "bg-red-400" },
                { label: t.mediumRisk, count: mediumCount, color: "bg-amber-400" },
                { label: t.lowRisk, count: lowCount, color: "bg-emerald-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className={bodyText}>
                      {item.label}
                    </span>

                    <span className={`font-semibold ${heading}`}>
                      {item.count}
                    </span>
                  </div>

                  <div className={`h-3 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{
                        width: `${
                          risks.length > 0
                            ? (item.count / risks.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-6 ${panelBg}`}>
            <h2 className={`text-xl font-semibold ${heading}`}>
              {t.systemOverview}
            </h2>

            <p className={`mt-1 text-sm ${muted}`}>
              {t.systemOverviewDesc}
            </p>

            <div className="mt-6 space-y-5">
              {[
                [t.budgetAnalysis, t.active],
                [t.scheduleAnalysis, t.active],
                [t.materialAnalysis, t.active],
                [t.aiRecommendations, t.available],
              ].map(([label, status]) => (
                <div
                  key={label}
                  className={`flex items-center justify-between border-b pb-4 ${borderColor}`}
                >
                  <span className={`text-sm ${bodyText}`}>
                    {label}
                  </span>

                  <span className="flex items-center gap-2 text-xs text-emerald-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {status}
                  </span>
                </div>
              ))}
            </div>

            <p className={`mt-4 text-xs ${muted}`}>
              {generated ? t.liveMode : t.readyMode}
            </p>
          </div>
        </section>

        {/* Risk Analysis List */}
        <section className={`rounded-2xl border p-5 md:p-6 ${panelBg}`}>

          <div className="mb-6">
            <h2 className={`text-xl font-semibold ${heading}`}>
              {t.detectedRisks}
            </h2>

            <p className={`mt-1 text-sm ${muted}`}>
              {t.detectedRisksDesc}
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
            >
              <option value="All">{t.allLevels}</option>
              <option value="High">{t.highRisk}</option>
              <option value="Medium">{t.mediumRisk}</option>
              <option value="Low">{t.lowRisk}</option>
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
            >
              <option value="All">{t.allProjects}</option>

              {projects.map((project) => (
                <option key={project.id} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>

          </div>

          <div className="space-y-4">
            {filteredRisks.map((risk) => (
              <article
                key={risk.id}
                className={`rounded-xl border p-5 ${isDark ? "border-slate-700/60 bg-[#0B1425]" : "border-slate-200 bg-slate-50"}`}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyle[risk.level]}`}
                      >
                        {risk.level === "High"
                          ? t.riskHigh
                          : risk.level === "Medium"
                            ? t.riskMedium
                            : t.riskLow}
                      </span>

                      <span className={`text-xs ${muted}`}>
                        {risk.category}
                      </span>

                    </div>

                    <h3 className={`text-lg font-semibold ${heading}`}>
                      {risk.title}
                    </h3>

                    <p className="mt-1 text-sm text-cyan-500">
                      {risk.project}
                    </p>
                  </div>

                  <button
                    onClick={() => dismissRisk(risk.id)}
                    className={`self-start rounded-lg border px-3 py-2 text-xs transition ${
                      isDark
                        ? "border-slate-700 text-slate-400 hover:border-red-400 hover:text-red-400"
                        : "border-slate-300 text-slate-500 hover:border-red-400 hover:text-red-500"
                    }`}
                  >
                    {t.dismiss}
                  </button>

                </div>

                <p className={`mt-4 text-sm leading-6 ${bodyText}`}>
                  {risk.description}
                </p>

                <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-500">
                    ✦ {t.recommendedAction}
                  </p>

                  <p className={`text-sm leading-6 ${bodyText}`}>
                    {risk.recommendation}
                  </p>
                </div>
              </article>
            ))}

            {filteredRisks.length === 0 && (
              <div className={`py-12 text-center ${muted}`}>
                {loading
                  ? t.analyzingData
                  : generated
                    ? t.noRisks
                    : t.generateFirst}
              </div>
            )}
          </div>
        </section>

        {/* Back to Dashboard */}
        <div className="mt-6">
          <a
            href="/dashboard"
            className="text-sm text-cyan-500 hover:text-cyan-400"
          >
            {t.backDashboard}
          </a>
        </div>

      </div>
    </main>
  );
}
