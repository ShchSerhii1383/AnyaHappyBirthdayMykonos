/* =========================================================================
   THE SECRET JOURNAL — passport-style stamp drawings
   -------------------------------------------------------------------------
   Each icon is SVG markup drawn on a 24×24 grid with strokes only, so it
   inherits the ink colour from CSS (`currentColor`). buildStampSVG() wraps
   an icon in the round, slightly uneven "rubber stamp" ring.
   ========================================================================= */

const STAMP_ICONS = {
  airplane:
    '<path d="M3 13.5l7-1.8L14.8 4c.6-.9 2-.6 2 .5l-1.6 6.8 5 1.4c.8.2.8 1.3 0 1.5l-5 1.3 1.6 5c.2.8-.8 1.3-1.3.7L10.8 16 3 14.8z"/>',
  bag:
    '<path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path d="M10 13.5c1 1.2 3 1.2 4 0"/>',
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  compass:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 5.5l2 6.5-2 6.5-2-6.5z"/><path d="M5.5 12h2.5M16 12h2.5"/>',
  heart:
    '<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  heel:
    '<path d="M3.5 16.5c3.5 0 6-1 8.5-4.5l2.5-4c.8-1.2 2.6-1.2 3.3.1l2.2 4.4v3.5"/><path d="M3.5 16.5h16.5"/><path d="M17.6 16.5l.4 4"/>',
  wave:
    '<path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  crown:
    '<path d="M4 17.5l-1-9 5 4 4-6.5 4 6.5 5-4-1 9z"/><path d="M4.5 20h15"/>'
};

/**
 * Returns the full SVG string for one small progress stamp.
 * The ring is two circles with a tiny offset so it reads as hand-inked
 * rather than a perfect vector outline.
 */
function buildStampSVG(iconName) {
  const icon = STAMP_ICONS[iconName] || STAMP_ICONS.sun;
  return (
    '<svg viewBox="0 0 40 40" aria-hidden="true">' +
      '<circle class="stamp-fill" cx="20" cy="20" r="18"/>' +
      '<circle class="stamp-ring" cx="20" cy="20" r="17.2"/>' +
      '<circle class="stamp-ring thin" cx="20.3" cy="19.8" r="14.4"/>' +
      '<g class="stamp-icon" transform="translate(9 9) scale(0.92)">' + icon + '</g>' +
    '</svg>'
  );
}
