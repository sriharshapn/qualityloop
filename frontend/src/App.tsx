import React, { useState, useEffect } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { TopNavbar } from './components/TopNavbar';
import { SettingsModal } from './components/SettingsModal';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ReportInvestigatePage } from './pages/ReportInvestigatePage';
import { InvestigationDetailsPage } from './pages/InvestigationDetailsPage';
import { LearningDemoPage } from './pages/LearningDemoPage';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hindsightConnected, setHindsightConnected] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const status = await api.getMemoryStatus();
      setHindsightConnected(status.status === 'connected' || status.configured);
    } catch {
      setHindsightConnected(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleNavigate = (tab: string, incidentId?: string) => {
    if (incidentId) {
      setSelectedIncidentId(incidentId);
      setActiveTab('investigation-details');
    } else {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIncidentCreated = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('investigation-details');
    setNotification(`Incident ${incidentId} reported & investigated successfully!`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      setNotification('Demo scenario reset to baseline before-learning state.');
      setTimeout(() => setNotification(null), 4000);
      setActiveTab('learning-demo');
    } catch (e: any) {
      alert(`Reset failed: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex">
      {/* Fixed Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hindsightConnected={hindsightConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            if (term && activeTab !== 'incidents') {
              setActiveTab('incidents');
            }
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hindsightConnected={hindsightConnected}
          onResetDemo={handleResetDemo}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{notification}</span>
          </div>
        )}

        {/* Screen Content */}
        <main className="flex-1 pt-16">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onOpenReport={() => setActiveTab('report')}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsPage
              onNavigate={handleNavigate}
              onOpenReport={() => setActiveTab('report')}
              initialSearch={searchTerm}
            />
          )}

          {activeTab === 'report' && (
            <ReportInvestigatePage
              onIncidentCreated={handleIncidentCreated}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'investigation-details' && selectedIncidentId && (
            <InvestigationDetailsPage
              incidentId={selectedIncidentId}
              onBack={() => setActiveTab('incidents')}
              onNavigateToDemo={() => setActiveTab('learning-demo')}
            />
          )}

          {activeTab === 'learning-demo' && (
            <LearningDemoPage />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => {
          checkStatus();
          setNotification('Settings saved & verified.');
          setTimeout(() => setNotification(null), 3000);
        }}
      />
    </div>
  );
}

export default App;
