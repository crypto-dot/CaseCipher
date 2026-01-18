export function ThemeScript() {
  const code = `
(() => {
  try {
    const key = "casecipher:theme";
    const stored = localStorage.getItem(key); // "light" | "dark" | null
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = stored ? stored === "dark" : prefersDark;
    const root = document.documentElement;
    root.classList.toggle("dark", useDark);
    root.classList.toggle("light", !useDark);
  } catch {
    // ignore
  }
})();
`.trim();

  // biome-ignore lint/security/noDangerouslySetInnerHtml: Intentional for inline theme detection to prevent flash
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
