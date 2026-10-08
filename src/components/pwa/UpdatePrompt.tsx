import { useRegisterSW } from 'virtual:pwa-register/react';

export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--olive)', color: 'white', padding: '15px 20px', borderRadius: '8px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div>A new version of FormaDesk is available.</div>
      <button 
        onClick={() => updateServiceWorker(true)}
        style={{ backgroundColor: 'white', color: 'var(--olive)', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Update Now
      </button>
      <button 
        onClick={() => setNeedRefresh(false)}
        style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
      >
        &times;
      </button>
    </div>
  );
};
