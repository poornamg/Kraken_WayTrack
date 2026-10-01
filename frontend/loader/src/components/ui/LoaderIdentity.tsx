import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "./Text.js";

export function LoaderIdentity() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="loader-identity" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="loader-identity__trigger"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className="loader-identity__avatar" aria-hidden="true">
          KK
        </span>
        <span className="loader-identity__summary">
          <Text as="span" variant="label">
            Kasun Perera
          </Text>
          <Text as="span" variant="caption">
            Loader
          </Text>
        </span>
        <ChevronDown aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="identity-menu" role="menu">
          <div className="identity-menu__header">
            <span className="identity-menu__avatar" aria-hidden="true">
              KK
            </span>
            <div>
              <Text variant="body-strong">Kasun Perera</Text>
              <Text variant="caption">Loader · Bay 03</Text>
            </div>
          </div>
          <div className="identity-menu__device">
            <UserRound aria-hidden="true" />
            <div>
              <Text variant="label">Shared warehouse tablet</Text>
              <Text variant="caption">Keep your session secure</Text>
            </div>
          </div>
          <button
            className="identity-menu__action"
            role="menuitem"
            type="button"
            onClick={() => {
              if (isLoggingOut) return;
              setIsLoggingOut(true);
              try { sessionStorage.removeItem("waylink.role.session"); } catch {}
              const loginUrl = import.meta.env.VITE_LOGIN_URL || "https://kraken-hack-login.vercel.app/";
              const urlObj = new URL(loginUrl, window.location.origin);
              urlObj.searchParams.set("logged_out", "1");
              window.location.replace(urlObj.toString());
            }}
          >
            <LogOut aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

type CardVariant = "standard" | "information" | "exception" | "work"
