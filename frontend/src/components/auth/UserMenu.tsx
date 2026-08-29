"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/" });
    } catch {
      setIsSigningOut(false);
    }
  };

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = (displayName[0] || "U").toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* User profile button */}
      <button
        type="button"
        id="user-profile-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-3.5 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:bg-slate-100 cursor-pointer"
      >
        {/* Avatar image or initial badge */}
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
            unoptimized
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-xs">
            {initials}
          </div>
        )}

        <span className="max-w-[130px] sm:max-w-[180px] truncate text-xs sm:text-sm font-semibold text-slate-800">
          {displayName}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-600" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="user-dropdown-menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 z-50"
        >
          {/* User profile summary */}
          <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
            <div className="flex items-center gap-2.5">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                  unoptimized
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 leading-tight">
                  {displayName}
                </p>
                {user.email && (
                  <p className="truncate text-xs text-slate-500 font-normal mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 w-fit">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Google Account Connected</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="space-y-0.5">
            <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Account
            </div>

            <button
              type="button"
              id="sign-out-button"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
