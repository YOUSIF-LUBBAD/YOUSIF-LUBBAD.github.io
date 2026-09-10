/* Progressive enhancements: all portfolio content and links work without JavaScript. */
(() => {
  'use strict';

  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  if (themeButton) {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('theme'); } catch (_) { /* Storage is optional. */ }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const applyTheme = (isDark) => {
      root.classList.toggle('dark', isDark);
      themeButton.setAttribute('aria-pressed', String(isDark));
      themeButton.textContent = isDark ? 'Light mode' : 'Dark mode';
    };
    applyTheme(savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark));
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const isDark = !root.classList.contains('dark');
      applyTheme(isDark);
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (_) { /* Keep the toggle usable. */ }
    });
  }

  const copyButton = document.getElementById('copy-email');
  const emailLink = document.getElementById('email-link');
  const copyStatus = document.getElementById('copy-status');
  const emailField = document.getElementById('email-to-copy');
  if (copyButton && emailLink && copyStatus && emailField) {
    const email = emailLink.textContent.trim();
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      copyButton.disabled = true;
      copyStatus.textContent = '';
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(email);
        emailField.hidden = true;
        copyStatus.textContent = 'Email copied.';
      } catch (_) {
        // Local previews and browsers that block clipboard access can still select the address.
        emailField.value = email;
        emailField.hidden = false;
        emailField.focus();
        emailField.select();
        emailField.setSelectionRange(0, email.length);
        copyStatus.textContent = 'Address selected. Use your keyboard or touch menu to copy it.';
      } finally {
        copyButton.disabled = false;
      }
    });
  }

  const header = document.querySelector('.site-header');
  const navItems = Array.from(document.querySelectorAll('nav a[href^="#"]'))
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter((item) => item.section);
  if (header && navItems.length) {
    let scheduled = false;
    let currentSection = '';
    const updateNavigation = () => {
      scheduled = false;
      const headerHeight = header.getBoundingClientRect().height;
      root.style.setProperty('--header-offset', `${headerHeight + 16}px`);
      let active = navItems[0];
      for (const item of navItems) {
        if (item.section.getBoundingClientRect().top <= headerHeight + 40) active = item;
      }
      // The final section can be shorter than the viewport; still mark Contact at page end.
      if (window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 4) {
        active = navItems[navItems.length - 1];
      }
      if (active.section.id !== currentSection) {
        currentSection = active.section.id;
        for (const item of navItems) {
          if (item === active) item.link.setAttribute('aria-current', 'location');
          else item.link.removeAttribute('aria-current');
        }
      }
    };
    const scheduleUpdate = () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(updateNavigation);
      }
    };
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    document.querySelectorAll('.project-details').forEach((details) => {
      details.addEventListener('toggle', scheduleUpdate);
    });
    if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(header);
    updateNavigation();
  }
})();
