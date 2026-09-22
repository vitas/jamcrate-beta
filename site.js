/* JamCrate landing — the two small behaviours every page shares.
 *
 * 1. Funnel counting. The marketing plan sets a numeric threshold per
 *    experiment ("10 qualified replies, 5 installs, 3 activations") and nothing
 *    on the page could produce a number. Events go to the notify Worker, which
 *    stores them in Analytics Engine.
 *
 *    What leaves the browser: an event name, the page path, and the referrer.
 *    What does not: cookies, a visitor id, the user agent, or anything that
 *    survives a page load. With no identifier there is nothing to correlate and
 *    nothing to consent to, which is why this site needs no cookie banner. If
 *    the browser sends Do Not Track or Global Privacy Control, this file sends
 *    nothing at all.
 *
 * 2. Click-to-copy for the Homebrew command. Delegated from the document, not
 *    bound per element, because the language switcher replaces those elements'
 *    innerHTML wholesale — a listener attached to the <code> would be thrown
 *    away the moment someone switched to Russian.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://notify.jamcrate.app/e';

  /* ---------------------------------------------------------------- counting */

  var optedOut = navigator.doNotTrack === '1' ||
                 window.doNotTrack === '1' ||
                 navigator.globalPrivacyControl === true;

  function send(event, ver) {
    if (optedOut) return;
    // owner's/testing escape hatch: open the page as …/?jc-test and this
    // pageview (and every click on it) is not counted at all. Deliberate
    // traffic stays out of the funnel without faking a DNT header.
    // URLSearchParams: exact name only — ?jc-testfoo must NOT silence it.
    if (new URLSearchParams(location.search).has('jc-test')) return;
    // text/plain keeps this a CORS-simple request. sendBeacon cannot perform a
    // preflight, so an application/json body would never leave the browser.
    var body = new Blob([JSON.stringify({
      e: event,
      p: location.pathname,
      r: document.referrer || '',
      v: typeof ver === 'string' ? ver.slice(0, 24) : ''
    })], { type: 'text/plain' });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, body);
      } else {
        fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'cors' })
          .catch(function () { /* counting is best effort, never a page error */ });
      }
    } catch (err) {
      /* A blocked beacon must not break the page it was measuring. */
    }
  }

  send('pageview');

  // One delegated listener covers the hero CTA and every guide page's CTA
  // without editing five files in step.
  document.addEventListener('click', function (ev) {
    var el = ev.target;
    var a = el && el.closest ? el.closest('a[href]') : null;

    if (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('JamCrate.dmg') !== -1) {
        // the published page carries a PINNED release url (push-site.sh), so
        // the tag names the exact version this click offered
        var m = /\/releases\/download\/([^/]+)\//.exec(href);
        send('download_click', m ? m[1].replace(/^v/, '').replace(/-beta$/, '') : 'latest');
      }
      else if (href.indexOf('play.jamcrate.app') !== -1) send('player_click');
      return;
    }

    // Homebrew command. Matched on content rather than a class so it works in
    // both places the command appears, including the one inside a translated
    // paragraph.
    var code = el && el.closest ? el.closest('code') : null;
    if (code && /^\s*brew\s/.test(code.textContent)) {
      copyCommand(code);
      send('brew_copy');
    }
  }, true);

  /* ------------------------------------------------------------ click-to-copy */

  function copyCommand(code) {
    var text = code.textContent.trim();
    var done = function () {
      var previous = code.getAttribute('data-copied');
      if (previous) return;                       // already showing feedback
      code.setAttribute('data-copied', text);
      code.textContent = '✓ copied';
      setTimeout(function () {
        code.textContent = text;
        code.removeAttribute('data-copied');
      }, 1100);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { /* selection still works */ });
    } else {
      // No clipboard API (older browser, or a non-secure context): select the
      // text so ⌘C still does the obvious thing.
      try {
        var range = document.createRange();
        range.selectNodeContents(code);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) { /* nothing more we can do */ }
    }
  }
})();
