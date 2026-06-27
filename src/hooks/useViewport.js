import React from 'react';

/** True on wide screens — drives the landscape-pitch layout. */
export function useWide(bp = 1080) {
  const [wide, setWide] = React.useState(() => typeof window !== 'undefined' && window.innerWidth >= bp);
  React.useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= bp);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [bp]);
  return wide;
}

/** True on phone-width screens — single-column, page-scrolling layout. */
export function usePhone(bp = 720) {
  const [phone, setPhone] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const onResize = () => setPhone(window.innerWidth < bp);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [bp]);
  return phone;
}
