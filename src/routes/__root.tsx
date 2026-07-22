import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import appCss from "../styles.css?url";
import {
  getThemeSettingKeyForPath,
  normalizeWebsiteThemeMode,
  WEBSITE_THEME_SETTING_KEY,
  watchWebsiteThemeMode,
} from "@/lib/site-theme";
import { supabase } from "@/integrations/supabase/client";
import pipettonScriptFont from "@/assets/fonts/Pipetton Script Regular.otf?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light" },
      { title: "A'New Dawn Coaching" },
      {
        name: "description",
        content: "Faith-centered life coaching for clarity, confidence, consistency, and purpose.",
      },
      { name: "author", content: "A'New Dawn Coaching" },
      { property: "og:title", content: "A'New Dawn Coaching" },
      {
        property: "og:description",
        content: "Faith-centered life coaching for young adults and women navigating transition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@anewdawncoaching" },
    ],
    links: [
      {
        rel: "preload",
        href: pipettonScriptFont,
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      {
        rel: "icon",
        href: "/favicon.ico?v=4",
        sizes: "any",
      },
      {
        rel: "shortcut icon",
        href: "/favicon.ico?v=4",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png?v=4",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32.png?v=4",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16.png?v=4",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png?v=4",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest?v=4",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    let cleanupThemeWatcher = () => {};
    let mounted = true;
    const themeSettingKey = getThemeSettingKeyForPath(pathname);

    if (themeSettingKey === WEBSITE_THEME_SETTING_KEY) {
      cleanupThemeWatcher = watchWebsiteThemeMode("light");
      return () => cleanupThemeWatcher();
    }

    const loadThemeMode = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", themeSettingKey)
        .maybeSingle();

      if (!mounted) return;
      cleanupThemeWatcher();
      cleanupThemeWatcher = watchWebsiteThemeMode(normalizeWebsiteThemeMode(data?.value));
    };

    void loadThemeMode();

    return () => {
      mounted = false;
      cleanupThemeWatcher();
    };
  }, [pathname]);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!pointerQuery.matches) return;

    let frame = 0;
    let x = "50%";
    let y = "50%";
    const paintCursorShade = () => {
      document.documentElement.style.setProperty("--dawn-cursor-x", x);
      document.documentElement.style.setProperty("--dawn-cursor-y", y);
      frame = 0;
    };
    const followPointer = (event: PointerEvent) => {
      x = `${event.clientX}px`;
      y = `${event.clientY}px`;
      if (!frame) frame = window.requestAnimationFrame(paintCursorShade);
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", followPointer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <div className="cursor-dawn-shade" aria-hidden="true" />
    </QueryClientProvider>
  );
}
