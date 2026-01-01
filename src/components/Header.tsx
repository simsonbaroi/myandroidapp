import { useNavigate, useSearchParams } from 'react-router-dom';
import { Microscope, Settings, Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { useState } from 'react';

export const Header = () => {
  const time = useClock();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings, updateSettings } = useAppSettings();
  const { user, role, signOut } = useLocalAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if in preview mode (embedded in settings page)
  const isPreviewMode = searchParams.get('preview') === 'true';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'billing_clerk':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" onClick={() => window.location.reload()}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          ) : (
            <Microscope className="w-7 h-7 sm:w-8 sm:h-8 text-primary drop-shadow-lg" />
          )}
          <h1 className="text-base sm:text-xl font-bold truncate">
            {settings.appName} <span className="hidden xs:inline font-light text-muted-foreground">{settings.appSubtitle}</span>
          </h1>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
            title={settings.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Settings Button - hidden in preview mode */}
          {!isPreviewMode && (
            <button
              onClick={() => navigate('/settings')}
              className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <div className="text-primary font-mono font-bold text-lg">
            {time}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-surface-light border border-border w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground touch-target touch-feedback"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full screen slide-in */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Panel - Slide from right */}
          <div className="md:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-card border-l border-border p-4 pt-safe animate-slide-in-right z-50 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground touch-target touch-feedback"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-12 space-y-6">
              {/* User Info */}
              {user && (
                <div className="bg-surface-light border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.fullName || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {role && (
                    <span className={`inline-block text-xs font-bold uppercase px-3 py-1.5 rounded-lg border ${getRoleBadgeColor()}`}>
                      {role.replace('_', ' ')}
                    </span>
                  )}
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    updateSettings({ isDarkMode: !settings.isDarkMode });
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="w-full bg-surface-light border border-border py-4 px-4 rounded-xl flex items-center gap-4 text-foreground touch-target touch-feedback"
                >
                  {settings.isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                  <span className="font-medium">{settings.isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                {/* Settings button - hidden in preview mode */}
                {!isPreviewMode && (
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsMobileMenuOpen(false);
                      if (navigator.vibrate) navigator.vibrate(10);
                    }}
                    className="w-full bg-surface-light border border-border py-4 px-4 rounded-xl flex items-center gap-4 text-foreground touch-target touch-feedback"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Settings</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-destructive/10 border border-destructive/20 py-4 px-4 rounded-xl flex items-center gap-4 text-destructive touch-target touch-feedback"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
