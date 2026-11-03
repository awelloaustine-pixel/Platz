'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav } from '@/content/site';
import { SoundToggle } from './SoundToggle';

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center gap-5">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`text-sm transition-colors hover:text-gold ${pathname === item.href ? 'text-gold' : 'text-white/85'}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
        className="hud-text glass min-h-11 rounded-full px-4 text-white lg:hidden"
      >
        {open ? 'Close' : 'Menu'}
      </button>

      {open && (
        <div id="mobile-menu" className="menu-panel fixed inset-x-3 top-16 z-50 rounded-2xl p-5 lg:hidden">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={`block py-3 text-2xl font-light tracking-tight ${pathname === item.href ? 'text-gold' : 'text-white'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 border-t border-white/15 pt-4">
            <SoundToggle />
          </div>
        </div>
      )}
    </>
  );
}
