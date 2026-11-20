'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { sections, type SectionId } from '@/content/portfolio';
import { Icon } from '@/components/ui/icon';
import { ThemeSwitcher } from './theme-switcher';

type SitePage = 'home' | 'projects' | 'blog' | 'other';

export function SiteHeader({ page = 'home' }: { page?: SitePage }) {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const header = useRef<HTMLElement>(null);
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const menuTrigger = useRef<HTMLElement>(null);

  useEffect(() => {
    if (page !== 'home') return;
    const targets = sections.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [{ id, element }] : [];
    });
    let frame: number | undefined;

    function updateActiveSection() {
      frame = undefined;
      const threshold = (header.current?.offsetHeight ?? 0) + 36;
      let current: SectionId = 'home';
      for (const { id, element } of targets) {
        if (element.getBoundingClientRect().top > threshold) break;
        current = id;
      }
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        current = 'contact';
      }
      setActiveSection(current);
    }

    function scheduleUpdate() {
      if (frame === undefined)
        frame = window.requestAnimationFrame(updateActiveSection);
    }

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [page]);

  function closeMenu(restoreFocus: boolean) {
    if (!mobileMenu.current?.open) return;
    mobileMenu.current.open = false;
    if (restoreFocus) menuTrigger.current?.focus();
  }

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 52rem)');
    function closeAtDesktop() {
      if (desktop.matches && mobileMenu.current)
        mobileMenu.current.open = false;
    }
    desktop.addEventListener('change', closeAtDesktop);
    return () => desktop.removeEventListener('change', closeAtDesktop);
  }, []);

  function navigationLinks(mobile = false) {
    return [...sections, { id: 'blog', label: 'Blog' }].map(({ id, label }) => {
      const href =
        id === 'blog'
          ? '/blog'
          : page === 'home'
            ? `#${id}`
            : id === 'projects'
              ? '/projects'
              : `/#${id}`;
      const current = page === 'home' ? activeSection === id : page === id;
      return (
        <Link
          key={id}
          href={href}
          prefetch={false}
          aria-current={
            current ? (page === 'home' ? 'location' : 'page') : undefined
          }
          onClick={() => {
            if (mobile) closeMenu(false);
          }}
        >
          <span className="path-prefix" aria-hidden="true">
            ~/
          </span>
          {label.toLowerCase()}
        </Link>
      );
    });
  }

  return (
    <header className="site-header" ref={header}>
      <div className="site-width header-inner">
        <Link
          className="brand"
          href={page === 'home' ? '#home' : '/'}
          aria-label="Portfolio home"
        >
          <span className="brand-symbol">
            <span aria-hidden="true">&gt;_</span>
          </span>
          <span>dev.workspace</span>
          <span className="status-dot" aria-hidden="true" />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigationLinks()}
        </nav>
        <div className="header-controls">
          <ThemeSwitcher />
          <details
            className="mobile-menu"
            ref={mobileMenu}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && mobileMenu.current?.open) {
                event.preventDefault();
                closeMenu(true);
              }
            }}
          >
            <summary
              className="icon-button menu-trigger"
              ref={menuTrigger}
              aria-label="Navigation menu"
            >
              <Icon name="menu" className="menu-open-icon" />
              <Icon name="close" className="menu-close-icon" />
            </summary>
            <nav aria-label="Mobile navigation" className="mobile-nav">
              {navigationLinks(true)}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
