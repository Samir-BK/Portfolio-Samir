'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { profile, sections, type SectionId } from '@/content/portfolio';
import { Icon } from '@/components/ui/icon';
import { ThemeSwitcher } from './theme-switcher';

type SitePage = 'home' | 'projects' | 'blog' | 'other';
const desktopNavigation = '(min-width: 52rem)';

export function SiteHeader({
  page = 'home',
  showBlog,
}: {
  page?: SitePage;
  showBlog: boolean;
}) {
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
    let frame = 0;

    function updateActiveSection() {
      frame = 0;
      const threshold = (header.current?.offsetHeight ?? 0) + 36;
      let current: SectionId = 'home';
      for (const { id, element } of targets) {
        if (element.getBoundingClientRect().top > threshold) break;
        current = id;
      }
      const root = document.documentElement;
      if (
        window.scrollY > 0 &&
        root.scrollHeight - window.innerHeight - window.scrollY <= 1
      )
        current = 'contact';
      setActiveSection(current);
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    }

    function syncFragment(behavior?: ScrollBehavior) {
      const target = targets.find(
        ({ id }) => window.location.hash === `#${id}`,
      );
      if (!target) return;
      target.element.focus({ preventScroll: true });
      if (behavior) target.element.scrollIntoView({ block: 'start', behavior });
      scheduleUpdate();
    }

    let fragmentFrame = 0;
    function scheduleFragment(behavior: ScrollBehavior) {
      window.cancelAnimationFrame(fragmentFrame);
      fragmentFrame = window.requestAnimationFrame(() =>
        syncFragment(behavior),
      );
    }

    function trackAnchor(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !(event.target instanceof Element)
      )
        return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (
        !link ||
        (link.target && link.target !== '_self') ||
        link.pathname !== window.location.pathname ||
        link.origin !== window.location.origin ||
        link.search !== window.location.search ||
        !targets.some(({ id }) => link.hash === `#${id}`)
      )
        return;
      event.preventDefault();
      if (link.hash !== window.location.hash)
        window.history.pushState(null, '', link.hash);
      scheduleFragment('auto');
    }

    function handleHashChange() {
      // History traversal aligns immediately so it cannot race a smooth click.
      scheduleFragment('instant');
    }

    if (document.activeElement === document.body) syncFragment();
    scheduleUpdate();
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    if (header.current) resizeObserver.observe(header.current);
    resizeObserver.observe(document.body);
    document.addEventListener('click', trackAnchor);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(fragmentFrame);
      resizeObserver.disconnect();
      document.removeEventListener('click', trackAnchor);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [page]);

  function closeMenu(restoreFocus: boolean) {
    if (!mobileMenu.current?.open) return;
    mobileMenu.current.open = false;
    if (restoreFocus) menuTrigger.current?.focus();
  }

  useEffect(() => {
    const desktop = window.matchMedia(desktopNavigation);
    function closeAtDesktop() {
      if (desktop.matches && mobileMenu.current)
        mobileMenu.current.open = false;
    }
    desktop.addEventListener('change', closeAtDesktop);
    return () => {
      desktop.removeEventListener('change', closeAtDesktop);
    };
  }, []);

  function navigationLinks(mobile = false) {
    const links = showBlog
      ? [...sections, { id: 'blog' as const, label: 'Blog' }]
      : sections;
    return links.map(({ id, label }) => {
      const href =
        id === 'blog'
          ? '/blog'
          : page === 'home'
            ? `#${id}`
            : id === 'projects'
              ? '/projects'
              : `/#${id}`;
      const current = page === 'home' ? activeSection === id : page === id;
      const ariaCurrent = current
        ? page === 'home'
          ? 'location'
          : 'page'
        : undefined;
      const labelWithPrefix = (
        <>
          <span className="path-prefix" aria-hidden="true">
            ~/
          </span>
          {label.toLowerCase()}
        </>
      );

      if (href.includes('#')) {
        return (
          <a
            key={id}
            href={href}
            aria-current={ariaCurrent}
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey
              )
                return;
              if (mobile) closeMenu(false);
            }}
          >
            {labelWithPrefix}
          </a>
        );
      }

      return (
        <Link
          key={id}
          href={href}
          prefetch={false}
          aria-current={ariaCurrent}
          onClick={() => {
            if (mobile) closeMenu(false);
          }}
        >
          {labelWithPrefix}
        </Link>
      );
    });
  }

  const BrandLink = page === 'home' ? 'a' : Link;

  return (
    <header className="site-header" ref={header}>
      <div className="site-width header-inner">
        <BrandLink
          className="brand"
          href={page === 'home' ? '#home' : '/'}
          aria-label={`${profile.name}, home`}
        >
          <span className="brand-symbol">
            <span aria-hidden="true">&gt;_</span>
          </span>
          <span>{profile.name}</span>
          <span className="status-dot" aria-hidden="true" />
        </BrandLink>
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
