import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ArrowLeft, 
  Upload, 
  RotateCcw, 
  Settings as SettingsIcon,
  Image,
  Navigation,
  Grid3X3,
  Palette,
  Plus,
  Trash2,
  GripVertical,
  Pill,
  Thermometer,
  Heart,
  Wind,
  Apple,
  Sparkles,
  Stethoscope,
  FlaskConical,
  Home,
  UserCheck,
  BedDouble,
  Tags,
  Activity,
  Syringe,
  TestTube,
  Bandage,
  Brain,
  Eye,
  Ear,
  Bone,
  Baby,
  Droplets,
  Zap,
  Shield,
  Leaf,
  Moon,
  Sun,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppSettings, NavButtonConfig } from '@/contexts/AppSettingsContext';
import { LocalBillingProvider, useLocalBilling } from '@/contexts/LocalBillingContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icon options for categories and nav buttons
const iconOptions = [
  { value: 'Pill', label: 'Pill', icon: Pill },
  { value: 'Thermometer', label: 'Thermometer', icon: Thermometer },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Wind', label: 'Wind', icon: Wind },
  { value: 'Apple', label: 'Apple', icon: Apple },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'Stethoscope', label: 'Stethoscope', icon: Stethoscope },
  { value: 'FlaskConical', label: 'FlaskConical', icon: FlaskConical },
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'UserCheck', label: 'UserCheck', icon: UserCheck },
  { value: 'BedDouble', label: 'BedDouble', icon: BedDouble },
  { value: 'Tags', label: 'Tags', icon: Tags },
  { value: 'Activity', label: 'Activity', icon: Activity },
  { value: 'Syringe', label: 'Syringe', icon: Syringe },
  { value: 'TestTube', label: 'TestTube', icon: TestTube },
  { value: 'Bandage', label: 'Bandage', icon: Bandage },
  { value: 'Brain', label: 'Brain', icon: Brain },
  { value: 'Eye', label: 'Eye', icon: Eye },
  { value: 'Ear', label: 'Ear', icon: Ear },
  { value: 'Bone', label: 'Bone', icon: Bone },
  { value: 'Baby', label: 'Baby', icon: Baby },
  { value: 'Droplets', label: 'Droplets', icon: Droplets },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Leaf', label: 'Leaf', icon: Leaf },
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(i => i.value === iconName);
  return found ? found.icon : Pill;
};

// Color picker with gradient sliders
const ColorSlider = ({ 
  label, 
  value, 
  onChange,
  colorPreview
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  colorPreview: string;
}) => {
  const parseHSL = (hsl: string) => {
    const parts = hsl.split(' ');
    return {
      h: parseFloat(parts[0]) || 0,
      s: parseFloat(parts[1]) || 0,
      l: parseFloat(parts[2]) || 0,
    };
  };

  const { h, s, l } = parseHSL(value);

  const handleChange = (component: 'h' | 's' | 'l', newValue: number) => {
    const current = parseHSL(value);
    current[component] = newValue;
    onChange(`${current.h} ${current.s}% ${current.l}%`);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <div 
          className="w-10 h-10 rounded-full border-2 border-border shadow-lg"
          style={{ backgroundColor: colorPreview }}
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Hue</span>
            <span>{Math.round(h)}°</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}>
            <Slider
              value={[h]}
              onValueChange={([v]) => handleChange('h', v)}
              max={360}
              step={1}
              className="absolute inset-0"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Saturation</span>
            <span>{Math.round(s)}%</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`
          }}>
            <Slider
              value={[s]}
              onValueChange={([v]) => handleChange('s', v)}
              max={100}
              step={1}
              className="absolute inset-0"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Lightness</span>
            <span>{Math.round(l)}%</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`
          }}>
            <Slider
              value={[l]}
              onValueChange={([v]) => handleChange('l', v)}
              max={100}
              step={1}
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Category type
interface CategoryConfig {
  name: string;
  icon: string;
  type: 'both' | 'outpatient' | 'inpatient';
  enabled: boolean;
}

// Theme preset type
interface ThemePreset {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    destructive: string;
  };
}

// Built-in presets
const builtInPresets: ThemePreset[] = [
  {
    id: 'mch-green',
    name: 'MCH Green (Default)',
    isBuiltIn: true,
    colors: {
      primary: '160 84% 39%',
      secondary: '240 5% 12%',
      accent: '199 89% 48%',
      background: '240 10% 4%',
      foreground: '0 0% 100%',
      muted: '240 5% 12%',
      destructive: '0 62% 31%',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    isBuiltIn: true,
    colors: {
      primary: '210 90% 50%',
      secondary: '220 15% 15%',
      accent: '180 70% 45%',
      background: '220 15% 6%',
      foreground: '0 0% 100%',
      muted: '220 10% 15%',
      destructive: '0 72% 51%',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    isBuiltIn: true,
    colors: {
      primary: '270 70% 55%',
      secondary: '260 15% 15%',
      accent: '320 70% 60%',
      background: '260 20% 6%',
      foreground: '0 0% 100%',
      muted: '260 10% 15%',
      destructive: '0 72% 51%',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    isBuiltIn: true,
    colors: {
      primary: '25 90% 55%',
      secondary: '20 15% 12%',
      accent: '45 90% 55%',
      background: '20 15% 5%',
      foreground: '0 0% 100%',
      muted: '20 10% 15%',
      destructive: '0 72% 51%',
    },
  },
];

const CUSTOM_PRESETS_KEY = 'mch_custom_theme_presets';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, updateNavButton, resetSettings } = useAppSettings();
  const { inventory } = useLocalBilling();
  const { user, isLoading } = useLocalAuthContext();
  const isMobile = useIsMobile();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Mobile section navigation
  const sections = ['info', 'navigation', 'categories', 'theme'] as const;
  type Section = typeof sections[number];
  const [activeSection, setActiveSection] = useState<Section>('info');
  
  const sectionLabels: Record<Section, string> = {
    info: 'App Info',
    navigation: 'Navigation',
    categories: 'Categories',
    theme: 'Theme',
  };

  // Track swipe direction for animation
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const navigateSection = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = sections.indexOf(activeSection);
    if (direction === 'next' && currentIndex < sections.length - 1) {
      setSwipeDirection('left');
      setActiveSection(sections[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSwipeDirection('right');
      setActiveSection(sections[currentIndex - 1]);
    }
  }, [activeSection]);

  // Reset swipe direction after animation completes
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => setSwipeDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection, activeSection]);

  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: () => navigateSection('next'),
    onSwipeRight: () => navigateSection('prev'),
    threshold: 50,
  });

  // Animation classes for section transitions
  const getSectionAnimationClass = (sectionName: Section) => {
    if (!isMobile) return '';
    if (activeSection !== sectionName) return 'hidden';
    if (!swipeDirection) return 'animate-fade-in';
    return swipeDirection === 'left' 
      ? 'animate-slide-in-from-right' 
      : 'animate-slide-in-from-left';
  };
  
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'outpatient' | 'inpatient'>('all');
  const [previewKey, setPreviewKey] = useState(0);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  
  // Load custom presets from localStorage
  const [customPresets, setCustomPresets] = useState<ThemePreset[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save custom presets to localStorage when changed
  useEffect(() => {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
  }, [customPresets]);

  const allPresets = [...builtInPresets, ...customPresets];
  
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    const cats = Object.keys(inventory);
    return cats.map(name => ({
      name,
      icon: 'Pill',
      type: 'both' as const,
      enabled: true
    }));
  });

  // Theme colors (stored in app settings) - MUST be before early returns
  const [colorSettings, setColorSettings] = useState({
    primary: settings.primaryColor,
    secondary: settings.secondaryColor,
    accent: settings.accentColor,
    background: settings.backgroundColor,
    foreground: settings.foregroundColor,
    muted: settings.mutedColor,
    destructive: settings.destructiveColor,
  });

  // Sync settings to iframe preview via postMessage (instant update, no reload)
  const syncToPreview = useCallback((settingsUpdate: Partial<typeof settings>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SETTINGS_SYNC', settings: settingsUpdate },
        '*'
      );
    }
  }, []);

  // Keep for manual refresh button (fallback)
  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1);
  }, []);

  // Keep local sliders in sync if theme changes elsewhere (e.g. toggle dark mode)
  useEffect(() => {
    setColorSettings({
      primary: settings.primaryColor,
      secondary: settings.secondaryColor,
      accent: settings.accentColor,
      background: settings.backgroundColor,
      foreground: settings.foregroundColor,
      muted: settings.mutedColor,
      destructive: settings.destructiveColor,
    });
  }, [
    settings.primaryColor,
    settings.secondaryColor,
    settings.accentColor,
    settings.backgroundColor,
    settings.foregroundColor,
    settings.mutedColor,
    settings.destructiveColor,
  ]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleFileUpload = (type: 'logo' | 'favicon', file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'logo') {
        updateSettings({ logoUrl: dataUrl });
        toast.success('Logo updated');
      } else {
        updateSettings({ faviconUrl: dataUrl });
        toast.success('Favicon updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNavButton = () => {
    const newButton: NavButtonConfig = {
      id: `nav-${Date.now()}`,
      label: 'NEW BUTTON',
      icon: 'Home',
      visible: true
    };
    updateSettings({
      navButtons: [...settings.navButtons, newButton]
    });
    toast.success('Button added');
  };

  const handleDeleteNavButton = (id: string) => {
    updateSettings({
      navButtons: settings.navButtons.filter(btn => btn.id !== id)
    });
    toast.success('Button removed');
  };

  const handleAddCategory = () => {
    const newCat: CategoryConfig = {
      name: 'New Category',
      icon: 'Pill',
      type: 'both',
      enabled: true
    };
    setCategories([...categories, newCat]);
    toast.success('Category added (local only - add items via Price List to persist)');
  };

  const handleUpdateCategory = (index: number, updates: Partial<CategoryConfig>) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], ...updates };
    setCategories(newCats);
  };

  const handleDeleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
    toast.success('Category removed from view');
  };

  const handleColorChange = (key: keyof typeof colorSettings, value: string) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));

    // Build the settings update object
    const settingsUpdate: Partial<typeof settings> = {};
    if (key === 'primary') settingsUpdate.primaryColor = value;
    if (key === 'secondary') settingsUpdate.secondaryColor = value;
    if (key === 'accent') settingsUpdate.accentColor = value;
    if (key === 'background') settingsUpdate.backgroundColor = value;
    if (key === 'foreground') settingsUpdate.foregroundColor = value;
    if (key === 'muted') settingsUpdate.mutedColor = value;
    if (key === 'destructive') settingsUpdate.destructiveColor = value;

    // Apply to app settings (updates CSS variables globally)
    updateSettings(settingsUpdate);

    // Instantly sync to iframe preview
    syncToPreview(settingsUpdate);
  };

  const resetColors = () => {
    // Apply MCH Green (default) preset
    applyPreset(builtInPresets[0]);
  };

  // Apply a theme preset
  const applyPreset = (preset: ThemePreset) => {
    const { colors } = preset;
    setColorSettings(colors);

    const settingsUpdate = {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      backgroundColor: colors.background,
      foregroundColor: colors.foreground,
      mutedColor: colors.muted,
      destructiveColor: colors.destructive,
    };

    updateSettings(settingsUpdate);
    syncToPreview(settingsUpdate);
    toast.success(`Applied "${preset.name}" theme`);
  };

  // Save current colors as a new preset
  const saveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    const newPreset: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      isBuiltIn: false,
      colors: { ...colorSettings },
    };
    setCustomPresets(prev => [...prev, newPreset]);
    setNewPresetName('');
    setShowSavePreset(false);
    toast.success(`Saved "${newPreset.name}" preset`);
  };

  // Delete a custom preset
  const deleteCustomPreset = (id: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== id));
    toast.success('Preset deleted');
  };

  const filteredCategories = categories.filter(cat => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'outpatient') return cat.type === 'outpatient' || cat.type === 'both';
    if (categoryFilter === 'inpatient') return cat.type === 'inpatient' || cat.type === 'both';
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Settings</span>
            </div>
          </button>
        </div>
      </header>

      {/* 2-Column Layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left: Mobile Preview */}
        <div className="hidden lg:flex w-[400px] flex-shrink-0 bg-surface border-r border-border flex-col items-center justify-center p-6 gap-4 sticky top-[65px]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Live Mobile Preview</span>
            <button
              onClick={refreshPreview}
              className="p-1.5 rounded-lg bg-surface-light border border-border hover:border-primary hover:text-primary transition-all"
              title="Refresh Preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            {/* Phone Frame */}
            <div className="w-[375px] h-[667px] bg-background rounded-[40px] border-4 border-muted overflow-hidden shadow-2xl relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-muted rounded-b-2xl z-10" />
              {/* Screen */}
              <iframe
                ref={iframeRef}
                key={previewKey}
                src="/?preview=true"
                className="w-full h-full border-0"
                title="Mobile Preview"
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">iPhone 8 (375×667)</span>
        </div>

        {/* Right: Settings Content */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8"
          {...(isMobile ? touchHandlers : {})}
        >
        
        {/* Mobile Section Navigator */}
        {isMobile && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2 sticky top-0 z-40">
            <button
              onClick={() => navigateSection('prev')}
              disabled={sections.indexOf(activeSection) === 0}
              className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeSection === section
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sectionLabels[section]}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigateSection('next')}
              disabled={sections.indexOf(activeSection) === sections.length - 1}
              className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* App Information */}
        <section className={`bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 ${getSectionAnimationClass('info')}`}>
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Image className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            App Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">App Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => updateSettings({ appName: e.target.value })}
                className="bg-surface border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">App Subtitle</label>
              <input
                type="text"
                value={settings.appSubtitle}
                onChange={(e) => updateSettings({ appSubtitle: e.target.value })}
                className="bg-surface border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Logo (PNG/JPG)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface border border-border rounded-xl flex items-center justify-center overflow-hidden">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">Favicon (PNG/JPG)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface border border-border rounded-xl flex items-center justify-center overflow-hidden">
                  {settings.faviconUrl ? (
                    <img src={settings.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <section className={`bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 ${getSectionAnimationClass('navigation')}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Navigation Buttons
            </h2>
            <button
              onClick={handleAddNavButton}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Button</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {settings.navButtons.map((btn) => {
              const IconComp = getIconComponent(btn.icon);
              return (
                <div key={btn.id} className="bg-surface border border-border rounded-xl p-3 space-y-3">
                  {/* Mobile: Stack vertically */}
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground cursor-grab flex-shrink-0" />
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => updateNavButton(btn.id, { label: e.target.value })}
                      className="flex-1 bg-surface-light border border-border text-foreground px-3 py-2 rounded-lg outline-none font-medium text-sm transition-all focus:border-primary min-w-0"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select
                      value={btn.icon}
                      onValueChange={(value) => updateNavButton(btn.id, { icon: value })}
                    >
                      <SelectTrigger className="w-full sm:w-36 bg-surface-light border-border text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {iconOptions.slice(8, 12).map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="w-4 h-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch
                        checked={btn.visible}
                        onCheckedChange={(checked) => updateNavButton(btn.id, { visible: checked })}
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">Visible</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Categories */}
        <section className={`bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 ${getSectionAnimationClass('categories')}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Categories
            </h2>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <TabsList className="bg-surface border border-border p-1 rounded-xl w-full">
              <TabsTrigger value="all" className="flex-1 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="outpatient" className="flex-1 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="hidden sm:inline">Outpatient</span>
                <span className="sm:hidden">Out</span>
              </TabsTrigger>
              <TabsTrigger value="inpatient" className="flex-1 rounded-lg text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <span className="hidden sm:inline">Inpatient</span>
                <span className="sm:hidden">In</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-3">
            {filteredCategories.map((cat, idx) => {
              const IconComp = getIconComponent(cat.icon);
              const realIdx = categories.findIndex(c => c.name === cat.name);
              return (
                <div key={cat.name} className="bg-surface border border-border rounded-xl p-3 space-y-3">
                  {/* Row 1: Icon + Name */}
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </button>
                    
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(realIdx, { name: e.target.value })}
                      className="flex-1 bg-surface-light border border-border text-foreground px-3 py-2 rounded-lg outline-none font-medium text-sm transition-all focus:border-primary min-w-0"
                    />
                    
                    <button
                      onClick={() => handleDeleteCategory(realIdx)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  
                  {/* Row 2: Icon selector + Type + Toggle */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select
                      value={cat.icon}
                      onValueChange={(value) => handleUpdateCategory(realIdx, { icon: value })}
                    >
                      <SelectTrigger className="w-[calc(50%-4px)] sm:w-32 bg-surface-light border-border text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-60">
                        {iconOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="w-4 h-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={cat.type}
                      onValueChange={(value) => handleUpdateCategory(realIdx, { type: value as any })}
                    >
                      <SelectTrigger className="w-[calc(50%-4px)] sm:w-28 bg-surface-light border-border text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="outpatient">Outpatient</SelectItem>
                        <SelectItem value="inpatient">Inpatient</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch
                        checked={cat.enabled}
                        onCheckedChange={(checked) => handleUpdateCategory(realIdx, { enabled: checked })}
                      />
                      <span className="text-xs text-muted-foreground hidden sm:inline">Enabled</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Color Theme */}
        <section className={`bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 ${getSectionAnimationClass('theme')}`}>
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Color Theme
            </h2>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowSavePreset(!showSavePreset)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Save Preset</span>
                <span className="sm:hidden">Save</span>
              </button>
              <button
                onClick={resetColors}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Theme Presets */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Quick Presets</span>
            <div className="flex flex-wrap gap-2">
              {allPresets.map((preset) => (
                <div key={preset.id} className="relative group">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl hover:border-primary transition-all"
                  >
                    {/* Color preview dots */}
                    <div className="flex -space-x-1">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-background"
                        style={{ backgroundColor: `hsl(${preset.colors.primary})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-background"
                        style={{ backgroundColor: `hsl(${preset.colors.accent})` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 border-background"
                        style={{ backgroundColor: `hsl(${preset.colors.background})` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    {preset.id === 'mch-green' && (
                      <Sparkles className="w-3 h-3 text-primary" />
                    )}
                  </button>
                  {/* Delete button for custom presets */}
                  {!preset.isBuiltIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(preset.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Save new preset form */}
            {showSavePreset && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 p-3 bg-surface-light border border-border rounded-xl">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter preset name..."
                  className="flex-1 bg-surface border border-border text-foreground px-3 py-2 rounded-lg outline-none text-sm focus:border-primary"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveCurrentAsPreset}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSavePreset(false);
                      setNewPresetName('');
                    }}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-border" />

          {/* Color Sliders */}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSlider
              label="Primary (Main Brand)"
              value={colorSettings.primary}
              onChange={(v) => handleColorChange('primary', v)}
              colorPreview={`hsl(${colorSettings.primary})`}
            />
            <ColorSlider
              label="Secondary"
              value={colorSettings.secondary}
              onChange={(v) => handleColorChange('secondary', v)}
              colorPreview={`hsl(${colorSettings.secondary})`}
            />
            <ColorSlider
              label="Accent"
              value={colorSettings.accent}
              onChange={(v) => handleColorChange('accent', v)}
              colorPreview={`hsl(${colorSettings.accent})`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSlider
              label="Background"
              value={colorSettings.background}
              onChange={(v) => handleColorChange('background', v)}
              colorPreview={`hsl(${colorSettings.background})`}
            />
            <ColorSlider
              label="Text/Foreground"
              value={colorSettings.foreground}
              onChange={(v) => handleColorChange('foreground', v)}
              colorPreview={`hsl(${colorSettings.foreground})`}
            />
            <ColorSlider
              label="Muted/Subtle"
              value={colorSettings.muted}
              onChange={(v) => handleColorChange('muted', v)}
              colorPreview={`hsl(${colorSettings.muted})`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorSlider
              label="Destructive/Error"
              value={colorSettings.destructive}
              onChange={(v) => handleColorChange('destructive', v)}
              colorPreview={`hsl(${colorSettings.destructive})`}
            />
          </div>

          {/* Preview */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <span className="text-sm font-bold text-foreground">Preview</span>
            <div className="flex flex-wrap gap-3">
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.primary})`, color: 'white' }}
              >
                Primary Button
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm border"
                style={{ 
                  backgroundColor: `hsl(${colorSettings.secondary})`,
                  borderColor: `hsl(${colorSettings.secondary})`,
                  color: 'white'
                }}
              >
                Secondary
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.accent})`, color: 'white' }}
              >
                Accent
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.muted})`, color: `hsl(${colorSettings.foreground})` }}
              >
                Muted
              </button>
              <button 
                className="px-5 py-2 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: `hsl(${colorSettings.destructive})`, color: 'white' }}
              >
                Destructive
              </button>
            </div>
          </div>
        </section>

        </main>
      </div>
    </div>
  );
};

// Wrap with LocalBillingProvider so useLocalBilling hook works
export default function Settings() {
  return (
    <LocalBillingProvider>
      <SettingsPage />
    </LocalBillingProvider>
  );
}
