// Shared clock for page intros, so they line up with the page-in view transition.
let navigated = false;
let armed = false;

/** True on the initial page load; false after a client-side navigation. */
export function isFirstLoad() {
  return !navigated;
}

/**
 * Delay for a page's intro timeline. First load starts almost immediately; after a client
 * navigation it waits for the page-in fade (globals.css) so the content rises as it appears.
 * The flag flips shortly after the first intro, so Strict Mode's double effect run in dev
 * still reads as a first load.
 */
export function introDelay() {
  const delay = navigated ? 0.22 : 0.05;
  if (!armed) {
    armed = true;
    window.setTimeout(() => {
      navigated = true;
      // Lets CSS drop first-load-only hidden states (the nav fade in globals.css).
      document.documentElement.dataset.navigated = "";
    }, 500);
  }
  return delay;
}
