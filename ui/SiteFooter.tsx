import Image from 'next/image';
import Link from 'next/link';
import { footerLinks, site } from '@/content/site';
import { SectionLink } from './SectionLink';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="glass site-footer-inner">
        <div>
          <Image src="/logo.svg" alt="" width={32} height={32} unoptimized />
          <p className="mt-3 font-light">{site.name}</p>
          <p className="mt-1 text-sm text-white/85">{site.location}</p>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <nav key={group} aria-label={group}>
            <h2 className="hud-text text-white/80">{group}</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-link inline-block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="text-sm">
          <h2 className="hud-text text-white/80">Contact</h2>
          <p className="mt-3">
            <a className="text-link inline-block py-0.5" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="mt-1.5">
            <a className="text-link inline-block py-0.5" href={`tel:${site.phone.replace(/\s/g, '')}`}>
              {site.phone}
            </a>
          </p>
        </div>

        <div className="site-footer-base">
          <p className="hud-text text-white/80">© 2026 {site.name}</p>
          <SectionLink id="arrival" className="text-link hud-text inline-block py-1">
            Begin again ↑
          </SectionLink>
        </div>
      </div>
    </footer>
  );
}
