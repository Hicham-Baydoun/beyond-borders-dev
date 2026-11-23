// Applies the saved or system colour theme before the page paints (no flash). Kept as a file, not inline,
// because the server's Content-Security-Policy blocks inline scripts. lib/theme.jsx takes over after load.
(function () {
  var pref = null;
  try { pref = localStorage.getItem('bb-theme'); } catch (e) { /* private mode */ }
  var dark = pref === 'dark' || (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
