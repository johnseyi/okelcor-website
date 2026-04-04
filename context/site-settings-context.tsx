"use client";

/**
 * context/site-settings-context.tsx
 *
 * Passes server-fetched site settings into the client component tree.
 * The root layout fetches settings server-side and passes them as `settings`
 * prop to <SiteSettingsProvider>. Client components call useSiteSettings()
 * to read any setting by key, with fallback to "" when not set.
 */

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/site-settings";

const SiteSettingsContext = createContext<SiteSettings>({});

export function SiteSettingsProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: SiteSettings;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
