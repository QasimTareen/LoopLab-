@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Plus Jakarta Sans', 'Inter', sans-serif;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  --color-studio-bg: #090414;
  --color-studio-card: #12091f;
  --color-studio-border: rgba(157, 78, 221, 0.15);
  --color-studio-text: #f3f0ff;
  --color-studio-muted: #9a8fbd;
  --color-studio-accent: #b2905f;
  --color-studio-purple: #9d4edd;
}

body {
  background-color: #090414;
  color: #f3f0ff;
  font-family: var(--font-sans);
  min-height: 100vh;
}

/* Custom input field dark aesthetics */
input, select, textarea {
  background-color: #10071d !important;
  color: #ffffff !important;
  border: 1px solid rgba(157, 78, 221, 0.2) !important;
}

input:focus, select:focus, textarea:focus {
  border-color: #9d4edd !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(157, 78, 221, 0.25) !important;
}

select option {
  background-color: #12091f !important;
  color: #ffffff !important;
}

/* Custom scrollbars matching glowing purple aesthetic */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #090412;
}

::-webkit-scrollbar-thumb {
  background: rgba(157, 78, 221, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(157, 78, 221, 0.5);
}
