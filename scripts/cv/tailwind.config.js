// Tailwind v3 config for the standalone CV page (public/cv/index.html).
// v3 on purpose: the page was authored against the v3 Play CDN, and v4 changes default
// borders, rings and shadows. Rebuild with `npm run cv:css` after editing the CV markup.
const path = require("node:path");

module.exports = {
  content: [path.join(__dirname, "../../public/cv/index.html")],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
