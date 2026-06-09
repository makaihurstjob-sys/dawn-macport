export type WebsiteThemeMode = "light" | "dark" | "system";

export const WEBSITE_THEME_SETTING_KEY = "website_theme_mode";
export const DASHBOARD_THEME_SETTING_KEY = "dashboard_theme_mode";

export function normalizeWebsiteThemeMode(value?: string | null): WebsiteThemeMode {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

export function getThemeSettingKeyForPath(pathname: string) {
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dawn-gate-9vK2mQ7p") ||
    pathname.startsWith("/dev-gate-n9Qk4Lw8")
  ) {
    return DASHBOARD_THEME_SETTING_KEY;
  }
  return WEBSITE_THEME_SETTING_KEY;
}

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function applyWebsiteThemeMode(mode: WebsiteThemeMode) {
  if (typeof document === "undefined") return;

  const shouldUseDark = mode === "dark" || (mode === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.dataset.themeMode = mode;
}

export function watchWebsiteThemeMode(mode: WebsiteThemeMode) {
  applyWebsiteThemeMode(mode);

  if (typeof window === "undefined" || mode !== "system") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => applyWebsiteThemeMode("system");
  mediaQuery.addEventListener("change", handleSystemChange);

  return () => mediaQuery.removeEventListener("change", handleSystemChange);
}
