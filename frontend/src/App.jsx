import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import { organizeFolder, scanFolder, undoFolder } from './services/api';
import { ToastProvider, useToast } from './components/Toast';

function AppShell() {
  const [page, setPage] = useState('landing');
  const [folderPath, setFolderPath] = useState('');
  const [scanData, setScanData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const { pushToast } = useToast();

  const stopProgress = (finalValue = 100) => {
    if (progressRef.current) {
      window.clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setProgress(finalValue);
  };

  const startProgress = () => {
    if (progressRef.current) {
      window.clearInterval(progressRef.current);
    }
    setProgress(8);
    progressRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          window.clearInterval(progressRef.current);
          progressRef.current = null;
          return 92;
        }
        return Math.min(current + Math.random() * 10 + 4, 92);
      });
    }, 260);
  };

  useEffect(() => {
    return () => {
      if (progressRef.current) {
        window.clearInterval(progressRef.current);
      }
    };
  }, []);

  const withLoading = async (action, work) => {
    setIsLoading(true);
    setLoadingAction(action);
    startProgress();
    try {
      const result = await work();
      stopProgress(100);
      window.setTimeout(() => setProgress(0), 700);
      return result;
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  };

  const handleScan = async () => {
    if (!folderPath.trim()) {
      pushToast({
        tone: 'error',
        title: 'Enter a folder path',
        message: 'The backend needs an absolute folder path on this machine.',
      });
      return;
    }

    try {
      const result = await withLoading('scan', () => scanFolder(folderPath.trim()));
      setScanData(result);
      setPage('dashboard');
      pushToast({
        tone: 'success',
        title: 'Scan complete',
        message: `${result.stats.totalFiles} files scanned with ${result.stats.duplicateCount} duplicates flagged.`,
      });
    } catch (error) {
      stopProgress(0);
      pushToast({
        tone: 'error',
        title: 'Scan failed',
        message: error.message,
      });
    }
  };

  const handleOrganize = async () => {
    if (!folderPath.trim()) {
      pushToast({
        tone: 'error',
        title: 'Enter a folder path',
        message: 'Scan a folder first so the organizer knows what to move.',
      });
      return;
    }

    try {
      const result = await withLoading('organize', () => organizeFolder(folderPath.trim()));
      pushToast({
        tone: 'success',
        title: 'Files organized',
        message: `${result.movedCount} files moved into category folders.`,
      });
      const refreshed = await scanFolder(folderPath.trim());
      setScanData({ ...refreshed, organizedResult: result });
      setPage('dashboard');
    } catch (error) {
      stopProgress(0);
      pushToast({
        tone: 'error',
        title: 'Organization failed',
        message: error.message,
      });
    }
  };

  const handleUndo = async () => {
    if (!folderPath.trim()) {
      pushToast({
        tone: 'error',
        title: 'Enter a folder path',
        message: 'Undo works best after a successful organization session.',
      });
      return;
    }

    try {
      const result = await withLoading('undo', () => undoFolder(folderPath.trim()));
      pushToast({
        tone: 'success',
        title: 'Undo complete',
        message: `${result.restoredCount} files restored to their original locations.`,
      });
      const refreshed = await scanFolder(folderPath.trim());
      setScanData({ ...refreshed, undoResult: result });
      setPage('dashboard');
    } catch (error) {
      stopProgress(0);
      pushToast({
        tone: 'error',
        title: 'Undo failed',
        message: error.message,
      });
    }
  };

  const handleNavigate = (sectionId) => {
    setPage('dashboard');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <AnimatePresence mode="wait">
      {page === 'landing' ? (
        <LandingPage key="landing" onEnterDashboard={() => setPage('dashboard')} />
      ) : (
        <DashboardPage
          key="dashboard"
          folderPath={folderPath}
          setFolderPath={setFolderPath}
          onNavigate={handleNavigate}
          onScan={handleScan}
          onOrganize={handleOrganize}
          onUndo={handleUndo}
          isLoading={isLoading}
          loadingAction={loadingAction}
          progress={progress}
          scanData={scanData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
