import { useEffect, useRef } from 'react';
import { NavTab } from '../components/BottomNav';

/**
 * Tracks visited bottom-navigation tabs and registers `window.__handleNihongoBack`
 * so Android hardware/gesture back closes open modals first, then walks back
 * through tab history before exiting the app.
 */
export function useAndroidBackNavigation(
  activeTab: NavTab,
  setActiveTab: (tab: NavTab) => void
) {
  const tabHistoryRef = useRef<NavTab[]>(['roadmap']);
  const isPoppingBackRef = useRef(false);
  const activeTabRef = useRef<NavTab>(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
    if (isPoppingBackRef.current) {
      isPoppingBackRef.current = false;
      return;
    }
    const hist = tabHistoryRef.current;
    if (hist[hist.length - 1] !== activeTab) {
      hist.push(activeTab);
      if (hist.length > 20) hist.shift();
    }
  }, [activeTab]);

  useEffect(() => {
    (window as unknown as { __handleNihongoBack?: () => boolean }).__handleNihongoBack = () => {
      const ev = new CustomEvent('nihongo-back', { cancelable: true });
      const notCancelled = window.dispatchEvent(ev);
      if (!notCancelled) {
        return true;
      }
      const hist = tabHistoryRef.current;
      if (hist.length > 1) {
        hist.pop();
        const prevTab = hist[hist.length - 1] || 'roadmap';
        isPoppingBackRef.current = true;
        setActiveTab(prevTab);
        return true;
      }
      if (activeTabRef.current !== 'roadmap') {
        tabHistoryRef.current = ['roadmap'];
        isPoppingBackRef.current = true;
        setActiveTab('roadmap');
        return true;
      }
      return false;
    };

    return () => {
      delete (window as unknown as { __handleNihongoBack?: () => boolean }).__handleNihongoBack;
    };
  }, [setActiveTab]);
}
