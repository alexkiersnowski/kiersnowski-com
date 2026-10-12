// Fine grain over the placeholder gradient so it reads as a photographic surface.
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")";

/** Grain + warm-grey gradient used wherever real media hasn't been added yet. */
export function placeholderBackground(seed: number) {
  return `${grain}, linear-gradient(${135 + seed * 40}deg, #e3e2dc 0%, #b4b3ac 55%, #7d7c76 100%)`;
}
