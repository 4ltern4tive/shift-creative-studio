/* ==========================================================================
   SHIFT STUDIO ® — interaction layer
   Preloader · reveals · cursor · works · modal · glyph fields
   ========================================================================== */

(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Reduced motion: pause the looped decorative wordmark video (CSS hides it) */
  if (reduceMotion.matches) {
    $$('.services__wordmark-video').forEach((video) => video.pause());
  }
  const finePointer = window.matchMedia('(pointer: fine)');
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /* ------------------------------------------------------------------------
     Preloader
     ------------------------------------------------------------------------ */

  const preloader = $('#preloader');
  const loadCount = $('#loadCount');
  const loadBar = $('#loadBar');
  let pageReady = false;

  function animateLoader() {
    if (!preloader || !loadCount) return;
    if (reduceMotion.matches) {
      loadCount.textContent = '100';
      if (loadBar) loadBar.style.width = '100%';
      return;
    }
    const duration = 1350;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(100, Math.round(((now - start) / duration) * 100));
      loadCount.textContent = String(progress).padStart(2, '0');
      if (loadBar) loadBar.style.width = progress + '%';
      if (progress < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function finishLoading() {
    if (pageReady) return;
    pageReady = true;
    if (loadCount) loadCount.textContent = '100';
    if (loadBar) loadBar.style.width = '100%';
    const delay = reduceMotion.matches ? 0 : 260;
    window.setTimeout(() => {
      document.body.classList.add('is-ready');
      if (preloader) {
        preloader.classList.add('is-done');
        window.setTimeout(() => preloader.remove(), 1100);
      }
      initAfterLoad();
      playHeroReveal();
    }, delay);
  }

  animateLoader();
  if (document.readyState === 'complete') {
    window.setTimeout(finishLoading, 450);
  } else {
    window.addEventListener('load', () => window.setTimeout(finishLoading, 450), { once: true });
  }
  // Safety net: never leave a visitor behind the loader.
  window.setTimeout(finishLoading, 4200);

  /* ------------------------------------------------------------------------
     Header
     ------------------------------------------------------------------------ */

  const header = $('#site-header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */

  const menu = $('#mobile-menu');
  const menuToggle = $('.menu-toggle');
  const menuLabel = menuToggle ? $('.menu-toggle__label', menuToggle) : null;
  const pageMain = $('#main');
  const pageFooter = $('.site-footer');

  function setMenu(open, restoreFocus = false) {
    if (!menu || !menuToggle) return;
    document.documentElement.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    if (pageMain) pageMain.inert = open;
    if (pageFooter) pageFooter.inert = open;
    menuToggle.setAttribute('aria-expanded', String(open));
    if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
    if (!open && restoreFocus) menuToggle.focus();
  }

  if (menu) menu.inert = true;
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      setMenu(open);
    });
  }
  if (menu) {
    $$('a', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu && menu.classList.contains('is-open')) {
      setMenu(false, true);
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && menu && menu.classList.contains('is-open')) setMenu(false);
  }, { passive: true });

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */

  const revealElements = $$('[data-reveal]');
  let revealObserver = null;

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // Contact highlight is triggered by the section itself.
  const contact = $('.contact');
  if (contact) {
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      contact.classList.add('is-visible');
    } else {
      const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            contact.classList.add('is-visible');
            contactObserver.disconnect();
          }
        });
      }, { threshold: 0.25 });
      contactObserver.observe(contact);
    }
  }

  /* ------------------------------------------------------------------------
     Project data
     ------------------------------------------------------------------------ */

  const PROJECTS = [
    {
      id: 'yendo',
      index: '01',
      name: 'YENDO',
      category: 'Brand Identity & Digital Experience',
      year: '2022',
      image: 'assets/img/yendo-1200.webp',
      thumb: 'assets/img/yendo-700.webp',
      alt: 'Yendo brand identity and digital experience',
      description: 'A sustainable urban mobility brand shaped around movement, clarity and a lighter footprint — from identity to digital experience.',
      alt_es: 'Identidad de marca y experiencia digital de Yendo',
      category_es: 'Identidad de Marca y Experiencia Digital',
      description_es: 'Una marca de movilidad urbana sostenible construida en torno al movimiento, la claridad y una huella más ligera — de la identidad a la experiencia digital.',
      link: 'https://www.behance.net/gallery/166866399/YENDO-Sustainable-Urban-Mobility',
      provisional: false
    },
    {
      id: 'puroarte',
      index: '02',
      name: 'PURO ARTE',
      category: 'Art Direction & Poster Design',
      year: '2023',
      image: 'assets/img/puroarte-1200.webp',
      thumb: 'assets/img/puroarte-700.webp',
      alt: 'Puro Arte poster design and art direction',
      description: 'Art direction and a poster system for Montevideo’s digital art expo, built to carry bold imagery across print and screen.',
      alt_es: 'Diseño de afiches y dirección de arte de Puro Arte',
      category_es: 'Dirección de Arte y Diseño de Afiches',
      description_es: 'Dirección de arte y un sistema de afiches para la expo de arte digital de Montevideo, pensado para llevar imágenes audaces del impreso a la pantalla.',
      link: 'https://www.behance.net/gallery/170773359/PURO-ARTE-Montevideo-Digital-Expo-Poster',
      provisional: false
    },
    {
      id: 'logofolio',
      index: '03',
      name: 'SHIFT LOGOFOLIO',
      category: 'Brand Identity Collection',
      year: '2024',
      image: 'assets/img/logofolio-1200.webp',
      thumb: 'assets/img/logofolio-700.webp',
      alt: 'Shift Studio logofolio, logotypes and marks',
      description: 'A collection of logotypes and marks exploring reduction, rhythm and recognition across different categories.',
      alt_es: 'Logofolio de Shift Studio, logotipos y marcas',
      category_es: 'Colección de Identidad de Marca',
      description_es: 'Una colección de logotipos y marcas que explora la reducción, el ritmo y el reconocimiento en distintas categorías.',
      link: 'https://www.behance.net/gallery/228968095/Logofolio-V1-SHIFT-STUDIO',
      provisional: false
    },
    {
      id: 'under',
      index: '04',
      name: 'UNDER STUDIO',
      category: 'Visual Identity & Motion Design',
      year: '2023',
      image: 'assets/img/under-800.webp',
      thumb: 'assets/img/under-640.webp',
      alt: 'Under Studio visual identity and logo reveal',
      description: 'A visual identity and logo reveal for a multidisciplinary studio, pairing a flexible mark with a restrained motion language.',
      alt_es: 'Identidad visual y revelación de logo de Under Studio',
      category_es: 'Identidad Visual y Diseño en Movimiento',
      description_es: 'Una identidad visual y revelación de logo para un estudio multidisciplinario, combinando una marca flexible con un lenguaje en movimiento contenido.',
      link: 'https://www.behance.net/gallery/173804805/Under-studio-Logo-Reveal',
      provisional: false
    },
    {
      id: 'guapa',
      index: '05',
      name: 'GUAPA',
      category: 'Fashion Campaigns & Visual Communication',
      year: '—',
      image: 'assets/img/guapa-900.webp',
      thumb: 'assets/img/guapa-600.webp',
      alt: 'Fashion campaign imagery in a red dress',
      description: 'Fashion campaigns and visual communication that balance editorial attitude with a direct, contemporary voice.',
      alt_es: 'Imágenes de campaña de moda con un vestido rojo',
      category_es: 'Campañas de Moda y Comunicación Visual',
      description_es: 'Campañas de moda y comunicación visual que equilibran la actitud editorial con una voz directa y contemporánea.',
      link: null,
      provisional: true
    },
    {
      id: 'paprika',
      index: '06',
      name: 'PAPRIKA',
      category: 'Packaging & Retail Design',
      year: '—',
      image: 'assets/img/paprika-1200.webp',
      thumb: 'assets/img/paprika-700.webp',
      alt: 'Packaging and retail design for a contemporary brand',
      description: 'A packaging and retail design system made to hold presence on the shelf and carry the brand through the store.',
      alt_es: 'Diseño de packaging y retail para una marca contemporánea',
      category_es: 'Diseño de Packaging y Retail',
      description_es: 'Un sistema de packaging y diseño retail pensado para tener presencia en la góndola y acompañar a la marca en la tienda.',
      link: null,
      provisional: true
    },
    {
      id: 'pappolino',
      index: '07',
      name: 'PAPPOLINO',
      category: 'Kidswear & Brand Communication',
      year: '—',
      image: 'assets/img/pappolino-900.webp',
      thumb: 'assets/img/pappolino-600.webp',
      alt: 'Kidswear campaign and brand communication',
      description: 'Kidswear identity and brand communication built for play — warm, clear and full of character.',
      alt_es: 'Campaña de ropa infantil y comunicación de marca',
      category_es: 'Ropa Infantil y Comunicación de Marca',
      description_es: 'Identidad y comunicación de marca para ropa infantil pensada para jugar — cálida, clara y llena de carácter.',
      link: null,
      provisional: true
    },
    {
      id: 'creative',
      index: '08',
      name: 'SHIFT CREATIVE',
      category: 'Digital Design & Creative Exploration',
      year: '—',
      image: 'assets/img/creative-1200.webp',
      thumb: 'assets/img/creative-700.webp',
      alt: 'Abstract digital design exploration in warm neutral, metallic and slate tones',
      description: 'A space for digital design experiments, creative coding and AI-assisted explorations that push the studio’s visual language.',
      alt_es: 'Exploración abstracta de diseño digital en tonos neutros cálidos, metálicos y pizarra',
      category_es: 'Diseño Digital y Exploración Creativa',
      description_es: 'Un espacio para experimentos de diseño digital, código creativo y exploraciones asistidas por IA que amplían el lenguaje visual del estudio.',
      link: null,
      provisional: true
    }
  ];

  const projectMap = new Map(PROJECTS.map((project, index) => [project.id, index]));

  /* ------------------------------------------------------------------------
     Works — floating preview + modal triggers
     ------------------------------------------------------------------------ */

  const workRows = $$('.work-row');
  const worksSection = $('.works');
  const preview = $('#work-preview');
  const previewImage = $('#work-preview-img');
  const previewCaption = $('#work-preview-caption');
  let activeRow = null;
  let previewFrame = null;
  let previewX = 0;
  let previewY = 0;

  const canPreview = () => finePointer.matches && window.innerWidth > 900 && !reduceMotion.matches;

  function setPreviewImage(row) {
    if (!preview || !previewImage || !activeRow) return;
    const image = row.dataset.image;
    if (image && previewImage.getAttribute('src') !== image) previewImage.src = image;
    const projectIndex = projectMap.get(row.dataset.project);
    const project = PROJECTS[projectIndex];
    if (previewCaption && project) {
      previewCaption.textContent = `(${project.index}) — ${project.name}`;
    }
  }

  function movePreview(event) {
    if (!preview || !activeRow) return;
    previewX = clamp(event.clientX, 170, window.innerWidth - 170);
    previewY = clamp(event.clientY, 200, window.innerHeight - 200);
    if (previewFrame) return;
    previewFrame = requestAnimationFrame(() => {
      preview.style.setProperty('--x', previewX + 'px');
      preview.style.setProperty('--y', previewY + 'px');
      previewFrame = null;
    });
  }

  function hidePreview() {
    if (!preview) return;
    preview.classList.remove('is-active');
    activeRow = null;
  }

  if (worksSection) {
    workRows.forEach((row) => {
      row.addEventListener('mouseenter', (event) => {
        if (!canPreview() || !preview) return;
        activeRow = row;
        setPreviewImage(row);
        movePreview(event);
        preview.classList.add('is-active');
      });
      row.addEventListener('mousemove', (event) => {
        if (!canPreview() || !activeRow) return;
        movePreview(event);
      });
      row.addEventListener('focus', () => {
        // Keyboard users get the modal directly; the floating image is pointer-only.
        if (preview) preview.classList.remove('is-active');
      });
    });
    worksSection.addEventListener('mouseleave', hidePreview);
    window.addEventListener('scroll', hidePreview, { passive: true });
  }

  // Preload thumbnails after load, when the browser is idle.
  const preloadThumbs = () => {
    PROJECTS.forEach((project) => {
      const image = new Image();
      image.src = project.thumb;
    });
  };
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadThumbs, { timeout: 3500 });
    } else {
      window.setTimeout(preloadThumbs, 1800);
    }
  }, { once: true });

  /* ------------------------------------------------------------------------
     Project modal
     ------------------------------------------------------------------------ */

  const dialog = $('#project-modal');
  const modalImage = $('#project-modal-image');
  const modalIndex = $('#project-modal-index');
  const modalTitle = $('#project-modal-title');
  const modalCategory = $('#project-modal-category');
  const modalYear = $('#project-modal-year');
  const modalDesc = $('#project-modal-desc');
  const modalLink = $('#project-modal-link');
  const modalLinkLabel = $('#project-modal-link-label');
  const modalPrev = $('#project-prev');
  const modalNext = $('#project-next');
  const modalClose = $('.project-modal__close');
  let currentProject = 0;
  let lastFocused = null;

  function updateModal(projectIndex) {
    const project = PROJECTS[projectIndex];
    if (!project || !dialog) return;
    const isSpanish = currentLang === 'es';
    currentProject = projectIndex;
    if (modalIndex) modalIndex.textContent = `(${project.index} / ${String(PROJECTS.length).padStart(2, '0')})`;
    if (modalTitle) modalTitle.textContent = project.name;
    if (modalCategory) modalCategory.textContent = (isSpanish && project.category_es) ? project.category_es : project.category;
    if (modalYear) modalYear.textContent = project.year;
    if (modalDesc) modalDesc.textContent = (isSpanish && project.description_es) ? project.description_es : project.description;
    if (modalImage) {
      modalImage.src = project.image;
      modalImage.alt = (isSpanish && project.alt_es) ? project.alt_es : project.alt;
    }
    if (modalLink && modalLinkLabel) {
      if (project.link) {
        modalLink.href = project.link;
        modalLink.target = '_blank';
        modalLink.rel = 'noopener noreferrer';
        modalLinkLabel.textContent = isSpanish ? 'Ver en Behance' : 'View on Behance';
      } else {
        const subjectPrefix = isSpanish ? 'Solicitud de caso de estudio — ' : 'Case study request — ';
        modalLink.href = `mailto:studiounderart@gmail.com?subject=${encodeURIComponent(subjectPrefix + project.name)}`;
        modalLink.removeAttribute('target');
        modalLink.removeAttribute('rel');
        modalLinkLabel.textContent = isSpanish ? 'Solicitar caso de estudio' : 'Request case study';
      }
    }
    dialog.dataset.provisional = project.provisional ? 'true' : 'false';
  }

  function openProject(projectId) {
    if (!dialog) return;
    const projectIndex = projectMap.get(projectId);
    if (typeof projectIndex !== 'number') return;
    lastFocused = document.activeElement;
    updateModal(projectIndex);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.documentElement.classList.add('modal-open');
  }

  function closeProject() {
    if (!dialog) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      document.documentElement.classList.remove('modal-open');
    }
  }

  workRows.forEach((row) => {
    row.addEventListener('click', (event) => {
      event.preventDefault();
      openProject(row.dataset.project);
    });
  });

  if (dialog) {
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('modal-open');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
    });
    dialog.addEventListener('cancel', () => {
      document.documentElement.classList.remove('modal-open');
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
                     event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) closeProject();
    });
    dialog.addEventListener('keydown', (event) => {
      if (!dialog.open) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateModal((currentProject - 1 + PROJECTS.length) % PROJECTS.length);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateModal((currentProject + 1) % PROJECTS.length);
      }
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeProject);
  if (modalPrev) modalPrev.addEventListener('click', () => updateModal((currentProject - 1 + PROJECTS.length) % PROJECTS.length));
  if (modalNext) modalNext.addEventListener('click', () => updateModal((currentProject + 1) % PROJECTS.length));

  /* ------------------------------------------------------------------------
     Custom cursor
     ------------------------------------------------------------------------ */

  const cursor = $('#cursor');
  let cursorEnabled = false;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetX = cursorX;
  let targetY = cursorY;
  let cursorRaf = null;

  function renderCursor() {
    if (!cursor) return;
    cursorX += (targetX - cursorX) * 0.24;
    cursorY += (targetY - cursorY) * 0.24;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    if (Math.abs(targetX - cursorX) > 0.2 || Math.abs(targetY - cursorY) > 0.2) {
      cursorRaf = requestAnimationFrame(renderCursor);
    } else {
      cursorRaf = null;
    }
  }

  function initCursor() {
    if (!cursor || cursorEnabled) return;
    if (!finePointer.matches || window.innerWidth <= 1024 || reduceMotion.matches) return;
    cursorEnabled = true;
    document.documentElement.classList.add('has-cursor');
    document.addEventListener('mousemove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.remove('is-hidden');
      if (!cursorRaf) cursorRaf = requestAnimationFrame(renderCursor);
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
    document.addEventListener('mouseover', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const row = target ? target.closest('.work-row') : null;
      const interactive = target ? target.closest('a, button') : null;
      cursor.classList.toggle('is-view', Boolean(row));
      cursor.classList.toggle('is-link', Boolean(interactive) && !row);
    });
  }

  /* ------------------------------------------------------------------------
     Canvas glyph fields
     ------------------------------------------------------------------------ */

  function createGlyphField(canvas, options) {
    if (!canvas) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const settings = Object.assign({
      cellW: 16,
      cellH: 18,
      fontSize: 12,
      chars: '*#+/\\{}[]<>=~^©™$%&',
      color: '210, 240, 138',
      alpha: 0.5,
      glow: 'rgba(210, 240, 138, 0.18)',
      mutate: 4,
      fps: 18
    }, options);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cells = [];
    let raf = null;
    let lastFrame = 0;
    let visible = false;
    let resizeFrame = null;

    function buildCells() {
      const cols = Math.ceil(width / settings.cellW) + 1;
      const rows = Math.ceil(height / settings.cellH) + 1;
      cells = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          cells.push({
            char: settings.chars[Math.floor(Math.random() * settings.chars.length)],
            x: col * settings.cellW,
            y: row * settings.cellH,
            alpha: 0.08 + Math.random() * settings.alpha,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.1
          });
        }
      }
    }

    function draw(time) {
      context.clearRect(0, 0, width, height);

      if (settings.glow) {
        const glow = context.createRadialGradient(
          width * 0.5, height * 0.48, 0,
          width * 0.5, height * 0.48, Math.max(width, height) * 0.7
        );
        glow.addColorStop(0, settings.glow);
        glow.addColorStop(1, 'rgba(17, 17, 17, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      context.font = `400 ${settings.fontSize}px "Inter", sans-serif`;
      context.textBaseline = 'middle';

      for (let i = 0; i < cells.length; i += 1) {
        const cell = cells[i];
        const pulse = 0.55 + 0.45 * Math.sin(time * 0.0008 * cell.speed + cell.phase);
        const alpha = cell.alpha * pulse;
        if (alpha < 0.006) continue;
        context.fillStyle = `rgba(${settings.color}, ${alpha.toFixed(3)})`;
        context.fillText(cell.char, cell.x, cell.y);
      }

      if (settings.mutate > 0 && Math.random() < 0.65) {
        for (let i = 0; i < settings.mutate; i += 1) {
          const cell = cells[Math.floor(Math.random() * cells.length)];
          if (cell) cell.char = settings.chars[Math.floor(Math.random() * settings.chars.length)];
        }
      }
    }

    function loop(time) {
      raf = null;
      if (!visible) return;
      if (time - lastFrame > 1000 / settings.fps) {
        draw(time);
        lastFrame = time;
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf || reduceMotion.matches) return;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildCells();
      draw(performance.now());
    }

    resize();

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(resize);
      });
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    if (reduceMotion.matches) {
      draw(performance.now());
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        });
      }, { rootMargin: '160px 0px' });
      observer.observe(canvas);
    } else {
      visible = true;
      start();
    }

    const onReducedChange = () => {
      if (reduceMotion.matches) {
        stop();
        draw(performance.now());
      } else if (visible) {
        start();
      }
    };
    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', onReducedChange);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (visible) start();
    });

    return { resize, start, stop };
  }

  function initGlyphFields() {
    createGlyphField($('#manifesto-canvas'), {
      cellW: 17,
      cellH: 19,
      fontSize: 12,
      color: '210, 240, 138',
      alpha: 0.52,
      glow: 'rgba(210, 240, 138, 0.22)',
      chars: '*#+/\\{}[]<>=~^©™%&',
      mutate: 12,
      fps: 24
    });
    createGlyphField($('#contact-canvas'), {
      cellW: 26,
      cellH: 27,
      fontSize: 11,
      color: '255, 255, 255',
      alpha: 0.22,
      glow: 'rgba(210, 240, 138, 0.08)',
      chars: '+#*/\\$%©',
      mutate: 2,
      fps: 12
    });
  }

  /* ------------------------------------------------------------------------
     Editorial motion
     Hero: masked line reveal · Manifesto: scrubbed word illumination
     ------------------------------------------------------------------------ */

  const heroTitleEl = $('#hero-title');
  const heroLineEls = heroTitleEl ? $$('.hero__line-inner', heroTitleEl) : [];
  let heroRevealPlayed = false;

  function prepareHeroReveal() {
    if (!window.gsap || !heroLineEls.length || reduceMotion.matches) return;
    window.gsap.set(heroLineEls, { y: 56, opacity: 0, filter: 'blur(5px)' });
  }

  function playHeroReveal() {
    if (heroRevealPlayed) return;
    heroRevealPlayed = true;
    if (!window.gsap || !heroLineEls.length) return;
    if (reduceMotion.matches) {
      window.gsap.set(heroLineEls, { clearProps: 'transform,opacity,filter' });
      return;
    }
    window.gsap.timeline({ delay: 0.55, defaults: { ease: 'power3.out' } })
      .to(heroLineEls, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        stagger: 0.15,
        onComplete: () => window.gsap.set(heroLineEls, { clearProps: 'transform,opacity,filter' })
      });
  }

  const manifestoSection = $('#about');
  const manifestoTitleEl = $('#manifesto-title');
  const manifestoLineEls = manifestoTitleEl ? $$('.manifesto__line', manifestoTitleEl) : [];
  const MANIFESTO_DIM = '#666666';
  const MANIFESTO_LIGHT = '#f2f2ef';
  const MANIFESTO_LIME = '#d2f08a';
  const MANIFESTO_SUP = 'rgba(255, 255, 255, 0.82)';
  let manifestoWordTargets = [];
  let manifestoMedia = null;
  let manifestoTimeline = null;
  let manifestoColorTween = null;
  let manifestoEnhanced = false;

  function splitManifestoWords() {
    const targets = [];
    manifestoLineEls.forEach((line) => {
      const textEl = $('[data-i18n]', line);
      if (!textEl) return;
      const raw = textEl.textContent;
      textEl.textContent = '';
      raw.split(/(\s+)/).forEach((chunk) => {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) {
          textEl.appendChild(document.createTextNode(chunk));
          return;
        }
        const word = document.createElement('span');
        word.className = 'manifesto__word';
        word.textContent = chunk;
        textEl.appendChild(word);
        targets.push(word);
      });
      const sup = $('sup', line);
      if (sup) targets.push(sup);
    });
    return targets;
  }

  function addManifestoColorTween() {
    if (!manifestoTimeline || !window.gsap) return;
    if (manifestoColorTween) manifestoColorTween.kill();
    const targets = manifestoWordTargets;
    if (!targets.length) return;
    manifestoColorTween = manifestoTimeline.fromTo(
      targets,
      { color: MANIFESTO_DIM },
      {
        color: (index, el) => {
          if (el.closest('.manifesto__line--accent')) return MANIFESTO_LIME;
          return el.tagName === 'SUP' ? MANIFESTO_SUP : MANIFESTO_LIGHT;
        },
        duration: 0.55,
        ease: 'none',
        stagger: 0.16
      },
      0
    );
  }

  function refreshManifestoReveal(dict) {
    if (!manifestoEnhanced) return;
    let mismatch = false;
    manifestoLineEls.forEach((line) => {
      const textEl = $('[data-i18n]', line);
      if (!textEl) return;
      const value = dict[textEl.getAttribute('data-i18n')];
      if (typeof value !== 'string') return;
      const spans = $$('.manifesto__word', textEl);
      const words = value.split(/\s+/).filter(Boolean);
      if (spans.length !== words.length) {
        mismatch = true;
        return;
      }
      spans.forEach((span, index) => { span.textContent = words[index]; });
    });
    if (!mismatch) return;

    // Different word rhythm: rebuild the split and keep the current scroll progress.
    const progress = manifestoTimeline && manifestoTimeline.scrollTrigger
      ? manifestoTimeline.scrollTrigger.progress
      : 0;
    manifestoLineEls.forEach((line) => {
      const textEl = $('[data-i18n]', line);
      if (!textEl) return;
      const value = dict[textEl.getAttribute('data-i18n')];
      if (typeof value === 'string') textEl.textContent = value;
    });
    manifestoWordTargets = splitManifestoWords();
    addManifestoColorTween();
    if (manifestoTimeline && progress) manifestoTimeline.progress(progress);
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function initManifestoReveal() {
    if (!manifestoSection || !manifestoLineEls.length) return;
    if (!window.gsap || !window.ScrollTrigger || reduceMotion.matches) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    manifestoEnhanced = true;
    manifestoWordTargets = splitManifestoWords();

    manifestoMedia = gsap.matchMedia();
    manifestoMedia.add(
      {
        desktop: '(min-width: 1024px) and (min-height: 700px)',
        compact: '(max-width: 1023.98px), (max-height: 699.98px)'
      },
      (context) => {
        const desktop = Boolean(context.conditions.desktop);
        manifestoTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: manifestoSection,
            start: desktop ? 'top 72px' : 'top 78%',
            end: desktop ? '+=65%' : 'center 42%',
            scrub: 0.5,
            pin: desktop,
            pinSpacing: desktop,
            anticipatePin: desktop ? 1 : 0,
            invalidateOnRefresh: true
          }
        });
        addManifestoColorTween();
        return () => {
          manifestoTimeline = null;
          manifestoColorTween = null;
        };
      }
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  /* ------------------------------------------------------------------------
     After preloader
     ------------------------------------------------------------------------ */

  function initAfterLoad() {
    initGlyphFields();
    initCursor();
  }

  /* ------------------------------------------------------------------------
     Language (EN / ES)
     ------------------------------------------------------------------------ */

  const DEFAULT_LANG = 'es';
  const SUPPORTED_LANGS = ['en', 'es'];
  const LANG_STORAGE_KEY = 'shift-studio-lang';
  let currentLang = DEFAULT_LANG;

  const TRANSLATIONS = {
    en: {
      page_title: 'SHIFT STUDIO® — Shift Creative Studio',
      meta_description: 'SHIFT STUDIO is an independent creative studio based in Montevideo, Uruguay, crafting brand identities, graphic design and digital experiences.',
      skip: 'Skip to content',
      descriptor: 'Shift Creative Studio',
      loading: 'Loading / 2026',
      brand_home: 'SHIFT STUDIO — back to home',
      nav_primary: 'Primary',
      nav_mobile: 'Mobile',
      menu_label: 'Menu',
      hero_eyebrow: '(Shift Creative Studio)',
      hero_caption: 'BRUNO PÉREZ · SENIOR GRAPHIC & VISUAL DESIGNER',
      hero_portrait_alt: 'Portrait of Bruno Pérez, founder of SHIFT STUDIO',
      hero_title_1: 'Creativity that evolves.',
      hero_title_2: 'Design that connects',
      scroll: 'Scroll down',
      start_project: 'Start a project',
      nav_home: 'Home',
      nav_about: 'About',
      nav_works: 'Works',
      nav_talk: 'Let’s Talk',
      mobile_nav_label: '(Navigation)',
      works_sub: '/Ideas made visual/',
      works_title_1: 'Our Recently',
      works_title_2: 'Selected ',
      works_title_3: 'Works',
      works_head_index: 'Index',
      works_head_project: 'Project',
      works_head_discipline: 'Discipline',
      works_head_year: 'Year',
      work_cat_yendo: 'Brand Identity & Digital Experience',
      work_cat_puroarte: 'Art Direction & Poster Design',
      work_cat_logofolio: 'Brand Identity Collection',
      work_cat_under: 'Visual Identity & Motion Design',
      work_cat_guapa: 'Fashion Campaigns & Visual Communication',
      work_cat_paprika: 'Packaging & Retail Design',
      work_cat_pappolino: 'Kidswear & Brand Communication',
      work_cat_creative: 'Digital Design & Creative Exploration',
      year_unspecified: 'Year not specified',
      manifesto_label: '(About — Manifesto)',
      manifesto_1: 'Creative thinking.',
      manifesto_2: 'Technology that powers.',
      manifesto_3: 'Design that solves.',
      manifesto_foot: '(Three principles — One practice)',
      skills_eyebrow: '(Skills)',
      skills_title_1: 'Experience',
      skills_title_2: '& capabilities',
      skills_title_aria: 'Experience & capabilities',
      skills_text: 'Over 10 years developing visual identities, packaging and brand communication, combining in-house experience across fashion, home and retail with independent creative projects.\n\nMy approach integrates creative thinking, visual execution and new technologies. I incorporate artificial intelligence and automation tools to optimize processes, explore new possibilities and develop design solutions with greater efficiency.',
      skill_g1: 'Brand Identity',
      skill_g1_1: 'Creative Direction',
      skill_g1_2: 'Brand Strategy',
      skill_g1_3: 'Logo Design',
      skill_g1_4: 'Visual Identity',
      skill_g1_5: 'Typography',
      skill_g1_6: 'Brand Guidelines',
      skill_g2: 'Graphic & Visual Design',
      skill_g2_1: 'Packaging Design',
      skill_g2_2: 'Art Direction',
      skill_g2_3: 'Campaign Design',
      skill_g2_4: 'Editorial Design',
      skill_g2_5: 'Motion Graphics',
      skill_g3: 'Digital & Creative Technology',
      skill_g3_1: 'UI/UX Design',
      skill_g3_2: 'Digital Experiences',
      skill_g3_3: 'Web Design',
      skill_g3_4: 'AI-Assisted Creativity',
      skill_g3_5: 'Creative Automation',
      philosophy_eyebrow: '(Philosophy)',
      phil_1: 'Great design is',
      phil_2: 'more than aesthetics.',
      phil_3: 'It’s about creating visual identities that communicate, connect and leave a',
      phil_4: 'lasting impression.',
      phil_img_alt: "A quiet artist's studio with sculptures, plants and an easel",
      services_topline_1: '(Services)',
      services_topline_2: 'From strategy to sensation',
      services_title_1: 'Design',
      services_title_2: 'services',
      services_title_aria: 'Design services',
      service_card_1: 'Brand Identity',
      service_card_2: 'Graphic & Packaging Design',
      service_card_3: 'Digital & Creative Experiences',
      service_kicker_1: '(Foundation)',
      service_kicker_2: '(Expression)',
      service_kicker_3: '(Interaction)',
      service_desc_1: 'Strategy, naming and visual systems that give a business a clear point of view — and the tools to keep it consistent.',
      service_desc_2: 'Print, packaging and campaigns made to be noticed in the real world, not just on a moodboard.',
      service_desc_3: 'Websites and interfaces that turn a brand into something you can feel, use and remember.',
      service_tag_1a: 'Strategy',
      service_tag_1b: 'Logo & identity',
      service_tag_1c: 'Guidelines',
      service_tag_2a: 'Packaging',
      service_tag_2b: 'Campaigns',
      service_tag_2c: 'Editorial',
      service_tag_3a: 'Web design',
      service_tag_3b: 'UI/UX',
      service_tag_3c: 'Motion',
      services_stmt_1: 'We turn ideas into compelling visual experiences.',
      services_stmt_2: 'From the first concept',
      services_stmt_3: 'to the final detail, we build brands and creative solutions designed to stand out and stay relevant.',
      services_approach: '(Approach)',
      contact_eyebrow: '(Let’s talk)',
      contact_1: 'Have a project in mind?',
      contact_2: 'Let’s make something',
      contact_3a: 'remarkable',
      contact_3b: 'together!',
      contact_title_aria: 'Have a project in mind? Let’s make something remarkable together!',
      contact_cta: 'Start the project',
      connect: 'Let’s connect',
      footer_work_1: 'WORKING',
      footer_work_2: 'GLOBALLY',
      footer_copy_1: '©2026 SHIFT STUDIO.',
      footer_copy_2: 'ALL RIGHTS RESERVED.',
      footer_connect: '(Connect)',
      footer_descriptor: 'Independent Creative Studio — Montevideo, Uruguay',
      footer_label: 'Footer',
      socials_label: 'Social links',
      connect_aria: 'Let’s connect — email SHIFT STUDIO',
      plaque_aria: 'Montevideo, Uruguay. Working globally. UY, GMT-3.',
      back_to_top: 'Back to top',
      modal_request: 'Request case study',
      modal_prev: 'Previous',
      modal_next: 'Next',
      modal_close: 'Close project'
    },
    es: {
      page_title: 'SHIFT STUDIO® — Estudio Creativo',
      meta_description: 'SHIFT STUDIO es un estudio creativo independiente con base en Montevideo, Uruguay, que crea identidades de marca, diseño gráfico y experiencias digitales.',
      skip: 'Saltar al contenido',
      descriptor: 'Estudio Creativo',
      loading: 'Cargando / 2026',
      brand_home: 'SHIFT STUDIO — volver al inicio',
      nav_primary: 'Principal',
      nav_mobile: 'Navegación móvil',
      menu_label: 'Menú',
      hero_eyebrow: '(Estudio Creativo)',
      hero_caption: 'BRUNO PÉREZ · DISEÑADOR GRÁFICO Y VISUAL SENIOR',
      hero_portrait_alt: 'Retrato de Bruno Pérez, fundador de SHIFT STUDIO',
      hero_title_1: 'Creatividad que evoluciona.',
      hero_title_2: 'Diseño que conecta',
      scroll: 'Desplázate',
      start_project: 'Iniciar un proyecto',
      nav_home: 'Inicio',
      nav_about: 'Nosotros',
      nav_works: 'Proyectos',
      nav_talk: 'Hablemos',
      mobile_nav_label: '(Navegación)',
      works_sub: '/Ideas hechas visuales/',
      works_title_1: 'Nuestros',
      works_title_2: 'Trabajos ',
      works_title_3: 'Seleccionados',
      works_head_index: 'Índice',
      works_head_project: 'Proyecto',
      works_head_discipline: 'Disciplina',
      works_head_year: 'Año',
      work_cat_yendo: 'Identidad de Marca y Experiencia Digital',
      work_cat_puroarte: 'Dirección de Arte y Diseño de Afiches',
      work_cat_logofolio: 'Colección de Identidad de Marca',
      work_cat_under: 'Identidad Visual y Diseño en Movimiento',
      work_cat_guapa: 'Campañas de Moda y Comunicación Visual',
      work_cat_paprika: 'Diseño de Packaging y Retail',
      work_cat_pappolino: 'Ropa Infantil y Comunicación de Marca',
      work_cat_creative: 'Diseño Digital y Exploración Creativa',
      year_unspecified: 'Año no especificado',
      manifesto_label: '(Nosotros — Manifiesto)',
      manifesto_1: 'Pensamiento creativo.',
      manifesto_2: 'Tecnología que potencia.',
      manifesto_3: 'Diseño que resuelve.',
      manifesto_foot: '(Tres principios — Una práctica)',
      skills_eyebrow: '(Habilidades)',
      skills_title_1: 'Experiencia',
      skills_title_2: 'y capacidades',
      skills_title_aria: 'Experiencia y capacidades',
      skills_text: 'Más de 10 años desarrollando identidades visuales, packaging y comunicación de marca, combinando experiencia in-house en los sectores de moda, hogar y retail con proyectos creativos independientes.\n\nMi enfoque integra pensamiento creativo, ejecución visual y nuevas tecnologías. Incorporo herramientas de inteligencia artificial y automatización para optimizar procesos, explorar nuevas posibilidades y desarrollar soluciones de diseño con mayor eficiencia.',
      skill_g1: 'Identidad de Marca',
      skill_g1_1: 'Dirección Creativa',
      skill_g1_2: 'Estrategia de Marca',
      skill_g1_3: 'Diseño de Logo',
      skill_g1_4: 'Identidad Visual',
      skill_g1_5: 'Tipografía',
      skill_g1_6: 'Manual de Marca',
      skill_g2: 'Diseño Gráfico y Visual',
      skill_g2_1: 'Diseño de Packaging',
      skill_g2_2: 'Dirección de Arte',
      skill_g2_3: 'Diseño de Campañas',
      skill_g2_4: 'Diseño Editorial',
      skill_g2_5: 'Motion Graphics',
      skill_g3: 'Tecnología Digital y Creativa',
      skill_g3_1: 'Diseño UI/UX',
      skill_g3_2: 'Experiencias Digitales',
      skill_g3_3: 'Diseño Web',
      skill_g3_4: 'Creatividad Asistida por IA',
      skill_g3_5: 'Automatización Creativa',
      philosophy_eyebrow: '(Filosofía)',
      phil_1: 'El buen diseño es',
      phil_2: 'más que estética.',
      phil_3: 'Se trata de crear identidades visuales que comunican, conectan y dejan una',
      phil_4: 'impresión duradera.',
      phil_img_alt: 'Un estudio de artista tranquilo con esculturas, plantas y un caballete',
      services_topline_1: '(Servicios)',
      services_topline_2: 'De la estrategia a la sensación',
      services_title_1: 'Diseño',
      services_title_2: 'de servicios',
      services_title_aria: 'Servicios de diseño',
      service_card_1: 'Identidad de Marca',
      service_card_2: 'Diseño Gráfico y de Packaging',
      service_card_3: 'Experiencias Digitales y Creativas',
      service_kicker_1: '(Fundamento)',
      service_kicker_2: '(Expresión)',
      service_kicker_3: '(Interacción)',
      service_desc_1: 'Estrategia, naming y sistemas visuales que le dan a un negocio un punto de vista claro — y las herramientas para mantenerlo coherente.',
      service_desc_2: 'Impresos, packaging y campañas hechos para destacarse en el mundo real, no solo en un moodboard.',
      service_desc_3: 'Sitios web e interfaces que convierten una marca en algo que se puede sentir, usar y recordar.',
      service_tag_1a: 'Estrategia',
      service_tag_1b: 'Logo e identidad',
      service_tag_1c: 'Manual',
      service_tag_2a: 'Packaging',
      service_tag_2b: 'Campañas',
      service_tag_2c: 'Editorial',
      service_tag_3a: 'Diseño web',
      service_tag_3b: 'UI/UX',
      service_tag_3c: 'Motion',
      services_stmt_1: 'Convertimos ideas en experiencias visuales atractivas.',
      services_stmt_2: 'Desde el primer concepto',
      services_stmt_3: 'hasta el detalle final, construimos marcas y soluciones creativas pensadas para destacarse y mantenerse relevantes.',
      services_approach: '(Enfoque)',
      contact_eyebrow: '(Hablemos)',
      contact_1: '¿Tenés un proyecto en mente?',
      contact_2: 'Hagamos algo',
      contact_3a: 'extraordinario',
      contact_3b: 'juntos!',
      contact_title_aria: '¿Tenés un proyecto en mente? ¡Hagamos algo extraordinario juntos!',
      contact_cta: 'Iniciar el proyecto',
      connect: 'Conectemos',
      footer_work_1: 'TRABAJANDO',
      footer_work_2: 'GLOBALMENTE',
      footer_copy_1: '©2026 SHIFT STUDIO.',
      footer_copy_2: 'TODOS LOS DERECHOS RESERVADOS.',
      footer_connect: '(Conectar)',
      footer_descriptor: 'Estudio Creativo — Montevideo, Uruguay',
      footer_label: 'Pie de página',
      socials_label: 'Redes sociales',
      connect_aria: 'Conectemos — escribir a SHIFT STUDIO',
      plaque_aria: 'Montevideo, Uruguay. Trabajando globalmente. UY, GMT-3.',
      back_to_top: 'Volver arriba',
      modal_request: 'Solicitar caso de estudio',
      modal_prev: 'Anterior',
      modal_next: 'Siguiente',
      modal_close: 'Cerrar proyecto'
    }
  };

  function getStoredLang() {
    try {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      return SUPPORTED_LANGS.indexOf(saved) !== -1 ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function storeLang(lang) {
    try { window.localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (error) {}
  }

  function applyTranslations() {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
    $$('[data-i18n]').forEach((el) => {
      const value = dict[el.getAttribute('data-i18n')];
      if (typeof value !== 'string') return;
      if (manifestoEnhanced && el.closest('.manifesto__line')) return;
      el.textContent = value;
    });
    $$('[data-i18n-aria]').forEach((el) => {
      const value = dict[el.getAttribute('data-i18n-aria')];
      if (typeof value === 'string') el.setAttribute('aria-label', value);
    });
    $$('[data-i18n-alt]').forEach((el) => {
      const value = dict[el.getAttribute('data-i18n-alt')];
      if (typeof value === 'string') el.setAttribute('alt', value);
    });
    if (dict.page_title) document.title = dict.page_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict.meta_description) metaDesc.setAttribute('content', dict.meta_description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && dict.page_title) ogTitle.setAttribute('content', dict.page_title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && dict.meta_description) ogDesc.setAttribute('content', dict.meta_description);
    refreshManifestoReveal(dict);
    if (dialog && dialog.open) updateModal(currentProject);
  }

  function setLanguage(lang, persist) {
    const next = SUPPORTED_LANGS.indexOf(lang) !== -1 ? lang : DEFAULT_LANG;
    currentLang = next;
    document.documentElement.setAttribute('lang', next);
    document.documentElement.setAttribute('data-lang', next);
    $$('.lang-switch__btn').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === next;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    applyTranslations();
    if (persist !== false) storeLang(next);
  }

  function initLanguage() {
    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const btn = target ? target.closest('.lang-switch__btn') : null;
      if (!btn) return;
      event.preventDefault();
      setLanguage(btn.getAttribute('data-lang'));
    });
    setLanguage(getStoredLang() || DEFAULT_LANG, false);
  }

  initLanguage();

  prepareHeroReveal();
  initManifestoReveal();

})();
