import { useState, useEffect } from 'react';

export const IosInstallGuide = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIos() && !isStandalone && localStorage.getItem('ios_prompt_dismissed') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'var(--olive-deep)', color: 'white', padding: '15px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 10px 0' }}>Install FormaDesk</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem' }}>
            <li>Tap Share</li>
            <li>Select "Add to Home Screen"</li>
            <li>Tap Add</li>
          </ol>
        </div>
        <button onClick={() => { setIsVisible(false); localStorage.setItem('ios_prompt_dismissed', 'true'); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
      </div>
    </div>
  );
};
