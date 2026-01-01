import { ShieldCheck, UserCheck, BedDouble } from 'lucide-react';
import { useLocalBilling } from '@/contexts/LocalBillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export const HomeView = () => {
  const { setCurrentView } = useLocalBilling();
  const { settings } = useAppSettings();

  const handleButtonClick = (view: 'outpatient' | 'inpatient') => {
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    setCurrentView(view);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-4 animate-fade-in">
      <div className="mb-6 sm:mb-8 inline-block p-6 sm:p-8 rounded-3xl bg-primary/10 border-2 border-dashed border-primary shadow-primary-glow">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        ) : (
          <ShieldCheck className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
        )}
      </div>
      
      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2 text-center">
        {settings.appName} <span className="text-primary block sm:inline">{settings.appSubtitle}.</span>
      </h2>
      
      <p className="text-base sm:text-lg text-muted-foreground max-w-md text-center font-semibold mb-8 sm:mb-10 px-4">
        Centralized Hospital Revenue Cycle Management Terminal.
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0">
        <button
          onClick={() => handleButtonClick('outpatient')}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl px-6 py-4 text-sm uppercase tracking-wide transition-all duration-200 touch-feedback hover:shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-3 touch-target"
        >
          <UserCheck className="w-5 h-5" />
          {settings.navButtons.find(b => b.id === 'outpatient')?.label || 'OUTPATIENT TERMINAL'}
        </button>
        
        <button
          onClick={() => handleButtonClick('inpatient')}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-extrabold rounded-xl px-6 py-4 text-sm uppercase tracking-wide transition-all duration-200 touch-feedback hover:shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-3 touch-target"
        >
          <BedDouble className="w-5 h-5" />
          {settings.navButtons.find(b => b.id === 'inpatient')?.label || 'INPATIENT CARE'}
        </button>
      </div>

      {/* Mobile tip */}
      <p className="sm:hidden mt-8 text-xs text-muted-foreground/60 text-center">
        💡 Pull down to refresh • Swipe tabs to navigate
      </p>
    </div>
  );
};
