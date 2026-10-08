import { useEffect, useState } from 'react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed it recently
      if (localStorage.getItem('pwa_prompt_dismissed') !== 'true') {
        setIsVisible(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'var(--olive-deep)', color: 'white', padding: '15px', borderRadius: '8px', zIndex: 9999, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div>
        <h4 style={{ margin: '0 0 5px 0' }}>Install FormaDesk</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Install on your phone for faster access.</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.8 }}>Not Now</button>
        <button onClick={handleInstall} style={{ backgroundColor: 'white', color: 'var(--olive-deep)', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>Install App</button>
      </div>
    </div>
  );
};
