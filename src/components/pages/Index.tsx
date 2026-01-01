import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LocalBillingProvider, useLocalBilling } from '@/contexts/LocalBillingContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { HomeView } from '@/components/views/HomeView';
import { OutpatientView } from '@/components/views/OutpatientView';
import { InpatientView } from '@/components/views/InpatientView';
import { PricingView } from '@/components/views/PricingView';
import { PatientsView } from '@/components/views/PatientsView';
import { PullToRefreshIndicator } from '@/components/mobile/PullToRefreshIndicator';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const MainContent = () => {
  const { currentView, isLoading, refreshData } = useLocalBilling();
  const { settings } = useAppSettings();

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    await refreshData?.();
    toast.success('Data refreshed');
  }, [refreshData]);

  const { pullDistance, isRefreshing, pullProgress, handlers } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Check if the view is visible in settings
  const isViewVisible = (viewId: string) => {
    const btn = settings.navButtons.find(b => b.id === viewId);
    return btn?.visible !== false;
  };

  return (
    <div {...handlers} className="relative scroll-touch">
      {/* Pull to refresh indicator - mobile only */}
      <div className="sm:hidden">
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          pullProgress={pullProgress}
        />
      </div>
      
      <div 
        className="transition-transform duration-100"
        style={{ transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : undefined }}
      >
        {currentView === 'home' && <HomeView />}
        {currentView === 'outpatient' && isViewVisible('outpatient') && <OutpatientView />}
        {currentView === 'inpatient' && isViewVisible('inpatient') && <InpatientView />}
        {currentView === 'pricing' && isViewVisible('pricing') && <PricingView />}
        {currentView === 'patients' && isViewVisible('patients') && <PatientsView />}
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useLocalAuthContext();
  
  // Check if this is a preview mode (embedded iframe in settings)
  const isPreviewMode = searchParams.get('preview') === 'true';

  // Redirect to auth if not authenticated (skip in preview mode)
  useEffect(() => {
    if (!isPreviewMode && !isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate, isPreviewMode]);

  // Prevent bounce scroll on iOS
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user && !isPreviewMode) {
    return null; // Will redirect to auth
  }

  return (
    <LocalBillingProvider>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 pb-safe">
          <MainContent />
        </main>
      </div>
    </LocalBillingProvider>
  );
};

export default Index;
