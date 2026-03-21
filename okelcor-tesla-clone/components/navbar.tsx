"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  CircleHelp,
  UserCircle2,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Quote", href: "/quote" },
];

const languageGroups = [
  { title: "North America", items: ["United States", "Canada"] },
  { title: "Asia Pacific", items: ["China", "India"] },
  { title: "Europe", items: ["Germany", "Belgium"] },
  { title: "Africa", items: ["Nigeria", "Uganda"] },
];

export default function Navbar() {
  const pathname = usePathname();

  const { totalItems, openCart } = useCart();

  const [openMenu, setOpenMenu] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [openMobileLang, setOpenMobileLang] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("United States");

  useEffect(() => {
    setOpenMenu(false);
    setOpenLang(false);
    setOpenMobileLang(false);
  }, [pathname]);

  useEffect(() => {
    // Only lock scroll for mobile overlays; the desktop lang dropdown doesn't need it
    const shouldLock = openMenu || openMobileLang;
    document.body.style.overflow = shouldLock ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [openMenu, openMobileLang]);

  const closeAll = () => {
    setOpenMenu(false);
    setOpenLang(false);
    setOpenMobileLang(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 z-50 w-full"
      >
        <div className="border-b border-black/[0.04] bg-white/96 backdrop-blur-xl">
          <div className="tesla-shell grid h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:h-20 lg:grid-cols-[1fr_auto_1fr]">
            <Link href="/" className="flex min-w-0 flex-col items-center">
              <img
                src="/logo/okelcor-logo.png"
                alt="Okelcor"
                style={{ height: "22px", width: "auto", display: "block" }}
                className="object-contain"
              />
              <span className="mt-0.5 text-[7.5px] font-bold tracking-[0.28em] text-[var(--primary)] uppercase">
                Growing Together
              </span>
            </Link>

            <nav className="hidden items-center justify-center lg:flex">
              <div className="flex items-center rounded-2xl px-2 py-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`tesla-nav-link ${isActive ? "tesla-nav-link-active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex items-center justify-end gap-1 text-black">
              <div className="hidden items-center gap-1 lg:flex">
                <Link
                  href="/contact"
                  className="tesla-icon-btn"
                  aria-label="Help"
                >
                  <CircleHelp size={20} strokeWidth={1.9} />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setOpenLang((prev) => !prev);
                    setOpenMenu(false);
                    setOpenMobileLang(false);
                  }}
                  className={`tesla-icon-btn ${openLang ? "tesla-icon-btn-active" : ""}`}
                  aria-label="Language"
                >
                  <Globe size={20} strokeWidth={1.9} />
                </button>

                <Link
                  href="/auth"
                  className="tesla-icon-btn"
                  aria-label="Account"
                >
                  <UserCircle2 size={21} strokeWidth={1.9} />
                </Link>
              </div>

              {/* Cart button — always visible */}
              <button
                type="button"
                onClick={() => {
                  openCart();
                  setOpenMenu(false);
                  setOpenLang(false);
                }}
                className="tesla-icon-btn relative"
                aria-label="Open cart"
              >
                <ShoppingCart size={20} strokeWidth={1.9} />
                {totalItems > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-0.5 text-[9px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu((prev) => !prev);
                    setOpenLang(false);
                    setOpenMobileLang(false);
                  }}
                  className={`tesla-icon-btn ${openMenu ? "tesla-icon-btn-active" : ""}`}
                  aria-label={openMenu ? "Close menu" : "Open menu"}
                >
                  {openMenu ? (
                    <X size={22} strokeWidth={2} />
                  ) : (
                    <Menu size={22} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {openLang && (
            <>
              <motion.button
                type="button"
                aria-label="Close language panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-40 hidden bg-transparent lg:block"
                onClick={() => setOpenLang(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="absolute left-0 top-full z-50 hidden w-full border-t border-black/5 bg-white/95 shadow-[0_18px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:block"
              >
                <div className="tesla-shell grid grid-cols-4 gap-x-10 gap-y-8 py-10 text-black">
                  {languageGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="mb-4 text-[1.05rem] font-semibold">
                        {group.title}
                      </h3>
                      <div className="space-y-1 text-[0.95rem]">
                        {group.items.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSelectedRegion(item);
                              setOpenLang(false);
                            }}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left transition hover:bg-black/[0.05] ${
                              selectedRegion === item
                                ? "font-semibold text-black"
                                : "text-black/60"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {openMenu && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/18 backdrop-blur-[2px] lg:hidden"
              onClick={closeAll}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[60] flex h-screen w-full max-w-[420px] flex-col bg-white shadow-[-14px_0_40px_rgba(0,0,0,0.12)] lg:hidden"
            >
              <div className="flex h-[76px] items-center justify-end px-5 sm:px-6">
                <button
                  type="button"
                  onClick={closeAll}
                  className="tesla-icon-btn"
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-2 sm:px-6">
                {!openMobileLang ? (
                  <>
                    <div className="flex flex-col gap-1">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={closeAll}
                            className={`tesla-mobile-link ${isActive ? "tesla-mobile-link-active" : ""}`}
                          >
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-7 border-t border-black/[0.06] pt-6">
                      <button
                        type="button"
                        className="tesla-mobile-meta-link"
                        onClick={() => setOpenMobileLang(true)}
                      >
                        <div className="flex items-start gap-4">
                          <Globe size={22} strokeWidth={1.9} className="mt-0.5" />
                          <div className="text-left">
                            <div className="text-[1rem] font-semibold text-black">
                              {selectedRegion}
                            </div>
                            <div className="mt-1 text-[0.94rem] text-black/55">
                              English
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} strokeWidth={2} />
                      </button>

                      <button type="button" className="tesla-mobile-meta-link">
                        <div className="flex items-center gap-4">
                          <UserCircle2 size={23} strokeWidth={1.9} />
                          <span className="text-[1rem] font-semibold text-black">
                            Account
                          </span>
                        </div>
                      </button>

                      <Link
                        href="/contact"
                        onClick={closeAll}
                        className="tesla-mobile-meta-link"
                      >
                        <div className="flex items-center gap-4">
                          <CircleHelp size={22} strokeWidth={1.9} />
                          <span className="text-[1rem] font-semibold text-black">
                            Help
                          </span>
                        </div>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="pb-8">
                    <button
                      type="button"
                      onClick={() => setOpenMobileLang(false)}
                      className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[0.95rem] font-semibold text-black/70 transition hover:bg-black/[0.04] hover:text-black"
                    >
                      <ChevronLeft size={18} strokeWidth={2} />
                      <span>Back</span>
                    </button>

                    <div className="space-y-6">
                      {languageGroups.map((group) => (
                        <div key={group.title}>
                          <h3 className="mb-3 px-3 text-[1rem] font-semibold text-black">
                            {group.title}
                          </h3>

                          <div className="flex flex-col gap-1">
                            {group.items.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setSelectedRegion(item);
                                  setOpenMobileLang(false);
                                }}
                                className={`tesla-mobile-link text-left ${
                                  selectedRegion === item
                                    ? "tesla-mobile-link-active"
                                    : ""
                                }`}
                              >
                                <span>{item}</span>
                                {selectedRegion === item && (
                                  <span className="h-2 w-2 rounded-full bg-black/40" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}