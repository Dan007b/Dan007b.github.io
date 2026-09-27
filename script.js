// Show a neutral placeholder when a project photo is missing
document.querySelectorAll('.card-media img').forEach(img => {
  const media = img.parentElement;
  const markMissing = () => {
    img.remove();
    media.classList.add('missing');
  };
  img.addEventListener('error', markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();
});

// Project pages: turn the figures into a sticky gallery beside the write-up.
// A figure can hold an <img> or a <video> (optionally with a poster image).
function buildProjectGallery() {
  const section = document.querySelector('.project-page section');
  if (!section) return;

  const figures = Array.from(section.querySelectorAll('.project-image-figure'));
  let slides = figures.map(f => {
    const media = f.querySelector('img, video');
    const cap = f.querySelector('figcaption');
    const isVideo = media.tagName === 'VIDEO';
    return {
      type: isVideo ? 'video' : 'image',
      src: media.getAttribute('src') || media.querySelector('source')?.getAttribute('src'),
      poster: isVideo ? media.getAttribute('poster') : null,
      alt: media.getAttribute('alt') || media.getAttribute('aria-label') || '',
      caption: cap ? cap.textContent.trim() : ''
    };
  });

  const text = section.querySelector('.project-text');
  const back = section.querySelector('.back-link');
  section.querySelectorAll('.project-images').forEach(el => el.remove());
  figures.forEach(f => f.remove());

  const layout = document.createElement('div');
  layout.className = 'project-layout';

  const gallery = document.createElement('div');
  gallery.className = 'gallery';
  gallery.innerHTML = `
    <div class="gallery-stage">
      <div class="gallery-media"></div>
      <button class="gallery-nav prev" type="button" aria-label="Previous">&#8249;</button>
      <button class="gallery-nav next" type="button" aria-label="Next">&#8250;</button>
      <span class="gallery-count"></span>
    </div>
    <p class="gallery-caption"></p>
    <div class="gallery-thumbs"></div>`;

  const body = document.createElement('div');
  body.className = 'project-body';
  if (text) body.appendChild(text);
  if (back) body.appendChild(back);

  layout.append(gallery, body);
  section.appendChild(layout);

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
    <button class="gallery-nav prev" type="button" aria-label="Previous">&#8249;</button>
    <figure>
      <div class="lightbox-media"></div>
      <figcaption></figcaption>
    </figure>
    <button class="gallery-nav next" type="button" aria-label="Next">&#8250;</button>`;
  document.body.appendChild(lightbox);

  const stageMedia = gallery.querySelector('.gallery-media');
  const caption = gallery.querySelector('.gallery-caption');
  const count = gallery.querySelector('.gallery-count');
  const thumbs = gallery.querySelector('.gallery-thumbs');
  const lbMedia = lightbox.querySelector('.lightbox-media');
  const lbCaption = lightbox.querySelector('figcaption');
  let current = 0;

  function mediaElement(slide, inStage) {
    if (slide.type === 'video') {
      const video = document.createElement('video');
      // without a poster, start slightly in so the first frame shows instead of black
      video.src = slide.poster ? slide.src : slide.src + '#t=0.1';
      if (slide.poster) video.poster = slide.poster;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      if (slide.alt) video.setAttribute('aria-label', slide.alt);
      return video;
    }
    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = slide.alt;
    if (!inStage) return img;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-open';
    btn.setAttribute('aria-label', 'Enlarge image');
    btn.appendChild(img);
    btn.addEventListener('click', openLightbox);
    return btn;
  }

  function dropSlide(slide) {
    slides = slides.filter(s => s !== slide);
    current = Math.min(current, Math.max(slides.length - 1, 0));
    renderThumbs();
    show(current);
  }

  function renderThumbs() {
    thumbs.innerHTML = '';
    gallery.classList.toggle('single', slides.length <= 1);
    gallery.classList.toggle('empty', slides.length === 0);
    slides.forEach((slide, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-thumb' + (slide.type === 'video' ? ' is-video' : '');
      btn.setAttribute('aria-label', `Show item ${i + 1}`);
      let preview;
      if (slide.type === 'video' && !slide.poster) {
        preview = document.createElement('video');
        preview.src = slide.src + '#t=0.5';
        preview.muted = true;
        preview.preload = 'metadata';
      } else {
        preview = document.createElement('img');
        preview.src = slide.poster || slide.src;
        preview.alt = '';
      }
      preview.addEventListener('error', () => dropSlide(slide));
      btn.appendChild(preview);
      btn.addEventListener('click', () => show(i));
      thumbs.appendChild(btn);
    });
  }

  function show(i) {
    stageMedia.innerHTML = '';
    lbMedia.innerHTML = '';
    if (slides.length === 0) return;
    current = (i + slides.length) % slides.length;
    const slide = slides[current];
    stageMedia.appendChild(mediaElement(slide, true));
    caption.textContent = slide.caption;
    count.textContent = `${current + 1} / ${slides.length}`;
    if (!lightbox.hidden) lbMedia.appendChild(mediaElement(slide, false));
    lbCaption.textContent = slide.caption;
    thumbs.querySelectorAll('.gallery-thumb').forEach((t, n) => {
      t.classList.toggle('active', n === current);
      if (n === current) {
        thumbs.scrollTo({ left: t.offsetLeft - thumbs.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
      }
    });
  }

  function openLightbox() {
    if (slides.length === 0) return;
    stageMedia.querySelector('video')?.pause();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lbMedia.innerHTML = '';
    lbMedia.appendChild(mediaElement(slides[current], false));
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbMedia.innerHTML = '';
    document.body.classList.remove('lightbox-open');
  }

  gallery.querySelector('.prev').addEventListener('click', () => show(current - 1));
  gallery.querySelector('.next').addEventListener('click', () => show(current + 1));
  lightbox.querySelector('.prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.next').addEventListener('click', () => show(current + 1));
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // swipe on touch screens (not on videos, so their scrubber still works)
  [gallery.querySelector('.gallery-stage'), lightbox].forEach(el => {
    let startX = null;
    el.addEventListener('touchstart', e => {
      startX = e.target.closest('video') ? null : e.touches[0].clientX;
    }, { passive: true });
    el.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  });

  // missing media is detected (and removed) by the thumbnail loaders
  renderThumbs();
  show(0);
}

buildProjectGallery();
