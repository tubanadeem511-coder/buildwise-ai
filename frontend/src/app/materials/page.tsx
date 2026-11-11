
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
};

type Material = {
  id: string;
  project_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum_stock: number;
  unit_price: number;
  supplier: string | null;
};

const money = (amount: number, currency: Currency) => {
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

  const config = currencyConfig[currency];

  return `${config.symbol} ${amount.toLocaleString(config.locale, {
    maximumFractionDigits: 2,
  })}`;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    inventory: "INVENTORY",
    title: "Materials Management",
    subtitle: "Track construction materials, stock levels and suppliers.",
    closeForm: "Close Form",
    addMaterial: "+ Add Material",
    totalMaterials: "Total Materials",
    availableStock: "Available Stock",
    lowStockAlerts: "Low Stock Alerts",
    totalStockValue: "Total Stock Value",
    lowStockAlert: "Low Stock Alert",
    lowStockMessage:
      "material(s) have reached their minimum stock level. Restocking may be required.",
    editMaterial: "Edit Material",
    addNewMaterial: "Add New Material",
    selectProject: "Select Project",
    materialName: "Material name",
    currentQuantity: "Current quantity",
    minimumStock: "Minimum stock level",
    pricePerUnit: "Price per unit (PKR)",
    supplierName: "Supplier name",
    saveMaterial: "Save Material",
    updateMaterial: "Update Material",
    saving: "Saving...",
    cancel: "Cancel",
    inventoryOverview: "Inventory Overview",
    inventorySubtitle: "Manage your construction material stock.",
    search: "Search materials...",
    allCategories: "All Categories",
    material: "Material",
    category: "Category",
    stock: "Stock",
    unitPrice: "Unit Price",
    supplier: "Supplier",
    stockStatus: "Stock Status",
    actions: "Actions",
    minimum: "Minimum",
    notSpecified: "Not specified",
    lowStock: "Low Stock",
    inStock: "In Stock",
    decreaseStock: "Decrease stock",
    increaseStock: "Increase stock",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading inventory...",
    noMaterials: "No materials found.",
    backDashboard: "← Back to Dashboard",
    all: "All",
    cement: "Cement",
    steel: "Steel",
    bricks: "Bricks",
    sand: "Sand",
    aggregate: "Aggregate",
    electrical: "Electrical",
    other: "Other",
    bags: "Bags",
    tons: "Tons",
    pieces: "Pieces",
    cubicFt: "Cubic Ft",
    rolls: "Rolls",
    units: "Units",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ Light",
    dark: "🌙 Dark",
    currency: "Currency",
    unableLoad: "Unable to load inventory data.",
    somethingWrong: "Something went wrong.",
    selectProjectFirst: "Please select a project first.",
    unableSave: "Unable to save material.",
    materialUpdated: "Material updated successfully!",
    materialAdded: "Material added successfully!",
    stockUpdated: "Stock quantity updated successfully!",
    stockFailed: "Stock update failed.",
    confirmDelete: "Are you sure you want to delete this material?",
    unableDelete: "Unable to delete material.",
    materialDeleted: "Material deleted successfully!",
    deleteFailed: "Delete operation failed.",
  },

  ur: {
    inventory: "انوینٹری",
    title: "تعمیراتی مواد کا انتظام",
    subtitle: "تعمیراتی سامان، اسٹاک اور سپلائرز کا ریکارڈ رکھیں۔",
    closeForm: "فارم بند کریں",
    addMaterial: "+ مواد شامل کریں",
    totalMaterials: "کل مواد",
    availableStock: "دستیاب اسٹاک",
    lowStockAlerts: "کم اسٹاک الرٹس",
    totalStockValue: "کل اسٹاک کی مالیت",
    lowStockAlert: "کم اسٹاک کا الرٹ",
    lowStockMessage:
      "مواد اپنی کم از کم اسٹاک کی حد تک پہنچ چکا ہے۔ دوبارہ اسٹاک منگوانے کی ضرورت ہو سکتی ہے۔",
    editMaterial: "مواد میں ترمیم کریں",
    addNewMaterial: "نیا مواد شامل کریں",
    selectProject: "پروجیکٹ منتخب کریں",
    materialName: "مواد کا نام",
    currentQuantity: "موجودہ مقدار",
    minimumStock: "کم از کم اسٹاک",
    pricePerUnit: "فی یونٹ قیمت (PKR)",
    supplierName: "سپلائر کا نام",
    saveMaterial: "مواد محفوظ کریں",
    updateMaterial: "مواد اپ ڈیٹ کریں",
    saving: "محفوظ ہو رہا ہے...",
    cancel: "منسوخ کریں",
    inventoryOverview: "انوینٹری کا جائزہ",
    inventorySubtitle: "تعمیراتی مواد کے اسٹاک کا انتظام کریں۔",
    search: "مواد تلاش کریں...",
    allCategories: "تمام اقسام",
    material: "مواد",
    category: "قسم",
    stock: "اسٹاک",
    unitPrice: "فی یونٹ قیمت",
    supplier: "سپلائر",
    stockStatus: "اسٹاک کی صورتحال",
    actions: "ایکشنز",
    minimum: "کم از کم",
    notSpecified: "درج نہیں",
    lowStock: "کم اسٹاک",
    inStock: "اسٹاک موجود ہے",
    decreaseStock: "اسٹاک کم کریں",
    increaseStock: "اسٹاک بڑھائیں",
    edit: "ترمیم",
    delete: "حذف",
    loading: "انوینٹری لوڈ ہو رہی ہے...",
    noMaterials: "کوئی مواد نہیں ملا۔",
    backDashboard: "← ڈیش بورڈ پر واپس جائیں",
    all: "تمام",
    cement: "سیمنٹ",
    steel: "اسٹیل",
    bricks: "اینٹیں",
    sand: "ریت",
    aggregate: "بجری",
    electrical: "الیکٹریکل",
    other: "دیگر",
    bags: "بوریاں",
    tons: "ٹن",
    pieces: "عدد",
    cubicFt: "مکعب فٹ",
    rolls: "رولز",
    units: "یونٹس",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ لائٹ",
    dark: "🌙 ڈارک",
    currency: "کرنسی",
    unableLoad: "انوینٹری کا ڈیٹا لوڈ نہیں ہو سکا۔",
    somethingWrong: "کچھ غلط ہو گیا۔",
    selectProjectFirst: "براہ کرم پہلے پروجیکٹ منتخب کریں۔",
    unableSave: "مواد محفوظ نہیں ہو سکا۔",
    materialUpdated: "مواد کامیابی سے اپ ڈیٹ ہو گیا!",
    materialAdded: "مواد کامیابی سے شامل ہو گیا!",
    stockUpdated: "اسٹاک کی مقدار کامیابی سے اپ ڈیٹ ہو گئی!",
    stockFailed: "اسٹاک اپ ڈیٹ نہیں ہو سکا۔",
    confirmDelete: "کیا آپ واقعی یہ مواد حذف کرنا چاہتے ہیں؟",
    unableDelete: "مواد حذف نہیں ہو سکا۔",
    materialDeleted: "مواد کامیابی سے حذف ہو گیا!",
    deleteFailed: "حذف کرنے کا عمل ناکام ہو گیا۔",
  },

  ar: {
    inventory: "المخزون",
    title: "إدارة مواد البناء",
    subtitle: "تتبع مواد البناء ومستويات المخزون والموردين.",
    closeForm: "إغلاق النموذج",
    addMaterial: "+ إضافة مادة",
    totalMaterials: "إجمالي المواد",
    availableStock: "المخزون المتاح",
    lowStockAlerts: "تنبيهات انخفاض المخزون",
    totalStockValue: "القيمة الإجمالية للمخزون",
    lowStockAlert: "تنبيه انخفاض المخزون",
    lowStockMessage:
      "مادة وصلت إلى الحد الأدنى للمخزون. قد تكون هناك حاجة لإعادة التخزين.",
    editMaterial: "تعديل المادة",
    addNewMaterial: "إضافة مادة جديدة",
    selectProject: "اختر المشروع",
    materialName: "اسم المادة",
    currentQuantity: "الكمية الحالية",
    minimumStock: "الحد الأدنى للمخزون",
    pricePerUnit: "السعر لكل وحدة (PKR)",
    supplierName: "اسم المورد",
    saveMaterial: "حفظ المادة",
    updateMaterial: "تحديث المادة",
    saving: "جارٍ الحفظ...",
    cancel: "إلغاء",
    inventoryOverview: "نظرة عامة على المخزون",
    inventorySubtitle: "إدارة مخزون مواد البناء.",
    search: "البحث عن المواد...",
    allCategories: "جميع الفئات",
    material: "المادة",
    category: "الفئة",
    stock: "المخزون",
    unitPrice: "سعر الوحدة",
    supplier: "المورد",
    stockStatus: "حالة المخزون",
    actions: "الإجراءات",
    minimum: "الحد الأدنى",
    notSpecified: "غير محدد",
    lowStock: "مخزون منخفض",
    inStock: "متوفر",
    decreaseStock: "تقليل المخزون",
    increaseStock: "زيادة المخزون",
    edit: "تعديل",
    delete: "حذف",
    loading: "جارٍ تحميل المخزون...",
    noMaterials: "لم يتم العثور على مواد.",
    backDashboard: "العودة إلى لوحة التحكم ←",
    all: "الكل",
    cement: "أسمنت",
    steel: "حديد",
    bricks: "طوب",
    sand: "رمل",
    aggregate: "حصى",
    electrical: "كهرباء",
    other: "أخرى",
    bags: "أكياس",
    tons: "أطنان",
    pieces: "قطع",
    cubicFt: "قدم مكعب",
    rolls: "لفائف",
    units: "وحدات",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ فاتح",
    dark: "🌙 داكن",
    currency: "العملة",
    unableLoad: "تعذر تحميل بيانات المخزون.",
    somethingWrong: "حدث خطأ ما.",
    selectProjectFirst: "يرجى اختيار مشروع أولاً.",
    unableSave: "تعذر حفظ المادة.",
    materialUpdated: "تم تحديث المادة بنجاح!",
    materialAdded: "تمت إضافة المادة بنجاح!",
    stockUpdated: "تم تحديث كمية المخزون بنجاح!",
    stockFailed: "فشل تحديث المخزون.",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذه المادة؟",
    unableDelete: "تعذر حذف المادة.",
    materialDeleted: "تم حذف المادة بنجاح!",
    deleteFailed: "فشلت عملية الحذف.",
  },

  zh: {
    inventory: "库存管理",
    title: "建筑材料管理",
    subtitle: "跟踪建筑材料、库存水平和供应商。",
    closeForm: "关闭表单",
    addMaterial: "+ 添加材料",
    totalMaterials: "材料总数",
    availableStock: "可用库存",
    lowStockAlerts: "低库存提醒",
    totalStockValue: "库存总价值",
    lowStockAlert: "低库存提醒",
    lowStockMessage: "种材料已达到最低库存水平，可能需要补货。",
    editMaterial: "编辑材料",
    addNewMaterial: "添加新材料",
    selectProject: "选择项目",
    materialName: "材料名称",
    currentQuantity: "当前数量",
    minimumStock: "最低库存",
    pricePerUnit: "单位价格 (PKR)",
    supplierName: "供应商名称",
    saveMaterial: "保存材料",
    updateMaterial: "更新材料",
    saving: "正在保存...",
    cancel: "取消",
    inventoryOverview: "库存概览",
    inventorySubtitle: "管理建筑材料库存。",
    search: "搜索材料...",
    allCategories: "所有类别",
    material: "材料",
    category: "类别",
    stock: "库存",
    unitPrice: "单价",
    supplier: "供应商",
    stockStatus: "库存状态",
    actions: "操作",
    minimum: "最低",
    notSpecified: "未指定",
    lowStock: "库存不足",
    inStock: "库存充足",
    decreaseStock: "减少库存",
    increaseStock: "增加库存",
    edit: "编辑",
    delete: "删除",
    loading: "正在加载库存...",
    noMaterials: "未找到材料。",
    backDashboard: "← 返回仪表板",
    all: "全部",
    cement: "水泥",
    steel: "钢材",
    bricks: "砖块",
    sand: "沙子",
    aggregate: "骨料",
    electrical: "电气材料",
    other: "其他",
    bags: "袋",
    tons: "吨",
    pieces: "件",
    cubicFt: "立方英尺",
    rolls: "卷",
    units: "单位",
    english: "English",
    urdu: "اردو",
    arabic: "العربية",
    chinese: "中文",
    light: "☀️ 浅色",
    dark: "🌙 深色",
    currency: "货币",
    unableLoad: "无法加载库存数据。",
    somethingWrong: "发生错误。",
    selectProjectFirst: "请先选择一个项目。",
    unableSave: "无法保存材料。",
    materialUpdated: "材料更新成功！",
    materialAdded: "材料添加成功！",
    stockUpdated: "库存数量更新成功！",
    stockFailed: "库存更新失败。",
    confirmDelete: "确定要删除此材料吗？",
    unableDelete: "无法删除材料。",
    materialDeleted: "材料删除成功！",
    deleteFailed: "删除操作失败。",
  },
};

const categories = [
  { value: "Cement", label: "cement" },
  { value: "Steel", label: "steel" },
  { value: "Bricks", label: "bricks" },
  { value: "Sand", label: "sand" },
  { value: "Aggregate", label: "aggregate" },
  { value: "Electrical", label: "electrical" },
  { value: "Other", label: "other" },
];

const units = [
  { value: "Bags", label: "bags" },
  { value: "Tons", label: "tons" },
  { value: "Pieces", label: "pieces" },
  { value: "Cubic Ft", label: "cubicFt" },
  { value: "Rolls", label: "rolls" },
  { value: "Units", label: "units" },
];

export default function MaterialsPage() {
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

  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cement");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Bags");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");

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

  const tableBorder = isDark
    ? "border-slate-700/50"
    : "border-slate-200";

  const tableText = isDark ? "text-slate-300" : "text-slate-600";

  // Load projects and materials
  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [projectResponse, materialResponse] = await Promise.all([
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/materials`),
      ]);

      if (!projectResponse.ok || !materialResponse.ok) {
        throw new Error(t.unableLoad);
      }

      const projectData = await projectResponse.json();
      const materialData = await materialResponse.json();

      setProjects(projectData.projects || []);
      setMaterials(materialData.materials || []);

      if (projectData.projects?.length > 0) {
        setProjectId((current) => current || projectData.projects[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.somethingWrong
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Summary calculations
  const totalItems = materials.length;

  const lowStockItems = materials.filter(
    (m) => m.quantity <= m.minimum_stock
  ).length;

  const availableItems = totalItems - lowStockItems;

  const totalStockValue = materials.reduce(
    (sum, m) => sum + m.quantity * m.unit_price,
    0
  );

  // Search and category filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.supplier || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || m.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [materials, search, categoryFilter]);

  // Reset form
  function resetForm() {
    setEditingId(null);
    setProjectId(projects[0]?.id || "");
    setName("");
    setCategory("Cement");
    setQuantity("");
    setUnit("Bags");
    setMinStock("");
    setPrice("");
    setSupplier("");
  }

  // Add or update material
  async function saveMaterial(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!projectId) {
      setError(t.selectProjectFirst);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const materialData = {
      project_id: projectId,
      name,
      category,
      quantity: Number(quantity),
      unit,
      minimum_stock: Number(minStock),
      unit_price: Number(price),
      supplier,
    };

    try {
      const url = editingId
        ? `${API_URL}/materials/${editingId}`
        : `${API_URL}/materials`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(materialData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.unableSave);
      }

      await loadData();

      setSuccess(
        editingId ? t.materialUpdated : t.materialAdded
      );

      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.unableSave
      );
    } finally {
      setSaving(false);
    }
  }

  // Edit material
  function editMaterial(material: Material) {
    setEditingId(material.id);
    setProjectId(material.project_id);
    setName(material.name);
    setCategory(material.category);
    setQuantity(String(material.quantity));
    setUnit(material.unit);
    setMinStock(String(material.minimum_stock));
    setPrice(String(material.unit_price));
    setSupplier(material.supplier || "");
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  // Update stock quantity
  async function updateStock(material: Material, change: number) {
    const newQuantity = Math.max(0, material.quantity + change);

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/materials/${material.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.stockFailed);
      }

      setMaterials((current) =>
        current.map((m) =>
          m.id === material.id ? data.material : m
        )
      );

      setSuccess(t.stockUpdated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.stockFailed
      );
    }
  }

  // Delete material
  async function deleteMaterial(id: string) {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/materials/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.unableDelete);
      }

      setMaterials((current) => current.filter((m) => m.id !== id));
      setSuccess(t.materialDeleted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.deleteFailed
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
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-cyan-500">
              BUILDWISE AI / {t.inventory}
            </p>

            <h1 className={`text-3xl font-bold md:text-4xl ${heading}`}>
              {t.title}
            </h1>

            <p className={`mt-2 text-sm ${muted}`}>
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as Language)
              }
              aria-label="Select language"
              className={`rounded-xl border px-3 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as Currency)
              }
              aria-label={t.currency}
              className={`rounded-xl border px-3 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
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
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                isDark
                  ? "border-slate-600 bg-[#111F35] text-white hover:bg-slate-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isDark ? t.light : t.dark}
            </button>

            {/* Add Material Button */}
            <button
              onClick={() => {
                if (showForm) {
                  resetForm();
                }
                setShowForm(!showForm);
                setError("");
              }}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#0B1425] transition hover:bg-cyan-300"
            >
              {showForm ? t.closeForm : t.addMaterial}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* Summary Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t.totalMaterials, value: totalItems, icon: "▦" },
            { label: t.availableStock, value: availableItems, icon: "✓" },
            { label: t.lowStockAlerts, value: lowStockItems, icon: "⚠" },
            {
              label: t.totalStockValue,
              value: money(totalStockValue, currency),
              icon: "◈",
            },
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

              <p className={`mt-4 break-words text-2xl font-bold ${heading}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <span className="text-2xl">⚠️</span>

            <div>
              <p className="font-semibold text-amber-500">
                {t.lowStockAlert}
              </p>

              <p className={`text-sm ${muted}`}>
                {lowStockItems} {t.lowStockMessage}
              </p>
            </div>
          </div>
        )}

        {/* Add / Edit Material Form */}
        {showForm && (
          <form
            onSubmit={saveMaterial}
            className={`mb-8 rounded-2xl border border-cyan-500/30 p-6 ${panelBg}`}
          >
            <h2 className={`mb-5 text-xl font-semibold ${heading}`}>
              {editingId ? t.editMaterial : t.addNewMaterial}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.materialName}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t[item.label]}
                  </option>
                ))}
              </select>

              <input
                required
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t.currentQuantity}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
              />

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
              >
                {units.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t[item.label]}
                  </option>
                ))}
              </select>

              <input
                required
                type="number"
                min="0"
                step="any"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder={t.minimumStock}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
              />

              <input
                required
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t.pricePerUnit}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 ${innerBg}`}
              />

              <input
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder={t.supplierName}
                className={`rounded-xl border p-3 outline-none focus:border-cyan-400 md:col-span-2 lg:col-span-3 ${innerBg}`}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || projects.length === 0}
                className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-[#0B1425] hover:bg-cyan-300 disabled:opacity-50"
              >
                {saving
                  ? t.saving
                  : editingId
                    ? t.updateMaterial
                    : t.saveMaterial}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className={`rounded-xl border px-6 py-3 transition ${
                  isDark
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        {/* Inventory Table */}
        <section
          className={`rounded-2xl border p-5 md:p-6 ${panelBg}`}
        >
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${heading}`}>
                {t.inventoryOverview}
              </h2>

              <p className={`mt-1 text-sm ${muted}`}>
                {t.inventorySubtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`rounded-xl border px-4 py-3 text-sm outline-none focus:border-cyan-400 ${innerBg}`}
              >
                <option value="All">{t.allCategories}</option>

                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t[item.label]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-cyan-500">
              {t.loading}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className={`w-full min-w-[950px] text-sm ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <thead>
                  <tr className={`border-b ${tableBorder} ${muted}`}>
                    <th className="px-3 py-4 font-medium">{t.material}</th>
                    <th className="px-3 py-4 font-medium">{t.category}</th>
                    <th className="px-3 py-4 font-medium">{t.stock}</th>
                    <th className="px-3 py-4 font-medium">{t.unitPrice}</th>
                    <th className="px-3 py-4 font-medium">{t.supplier}</th>
                    <th className="px-3 py-4 font-medium">{t.stockStatus}</th>
                    <th className="px-3 py-4 font-medium">{t.actions}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMaterials.map((material) => {
                    const isLow =
                      material.quantity <= material.minimum_stock;

                    return (
                      <tr
                        key={material.id}
                        className={`border-b ${tableBorder}`}
                      >
                        <td className={`px-3 py-4 font-medium ${heading}`}>
                          {material.name}
                        </td>

                        <td className={`px-3 py-4 ${muted}`}>
                          {material.category}
                        </td>

                        <td className={`px-3 py-4 ${tableText}`}>
                          {material.quantity.toLocaleString()} {material.unit}

                          <p className={`mt-1 text-xs ${muted}`}>
                            {t.minimum}: {material.minimum_stock}
                          </p>
                        </td>

                        <td className={`px-3 py-4 ${tableText}`}>
                          {money(material.unit_price, currency)}
                        </td>

                        <td className={`px-3 py-4 ${muted}`}>
                          {material.supplier || t.notSpecified}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              isLow
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {isLow ? t.lowStock : t.inStock}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateStock(material, -1)}
                              disabled={material.quantity === 0}
                              className={`rounded-lg border px-3 py-1 disabled:opacity-30 ${
                                isDark
                                  ? "border-slate-600 hover:bg-slate-700"
                                  : "border-slate-300 hover:bg-slate-100"
                              }`}
                              title={t.decreaseStock}
                            >
                              −
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStock(material, 1)}
                              className="rounded-lg border border-cyan-500/40 px-3 py-1 text-cyan-500 hover:bg-cyan-500/10"
                              title={t.increaseStock}
                            >
                              +
                            </button>

                            <button
                              type="button"
                              onClick={() => editMaterial(material)}
                              className="rounded-lg border border-blue-500/30 px-3 py-1 text-blue-500 hover:bg-blue-500/10"
                              title={t.edit}
                            >
                              {t.edit}
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteMaterial(material.id)}
                              className="rounded-lg border border-red-500/30 px-3 py-1 text-red-400 hover:bg-red-500/10"
                              title={t.delete}
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredMaterials.length === 0 && (
            <p className={`py-10 text-center ${muted}`}>
              {t.noMaterials}
            </p>
          )}
        </section>

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
