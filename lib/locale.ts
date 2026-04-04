import { cookies } from "next/headers";
import { type Locale } from "./translations";

const VALID_LOCALES = new Set<string>(["en", "de", "fr"]);

/**
 * Reads the user's chosen locale from the `okelcor_locale` cookie.
 * Falls back to "en" if the cookie is absent or invalid.
 * Calling this in a server component opts the route into dynamic rendering.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("okelcor_locale")?.value ?? "en";
  return (VALID_LOCALES.has(value) ? value : "en") as Locale;
}
