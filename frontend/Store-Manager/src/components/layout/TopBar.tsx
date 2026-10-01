import { useEffect, useState, useRef, useMemo, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react"
import { Bell, ChevronDown, Home, LogOut } from "lucide-react"
import wayTrackLogo from "../../assets/waytrack-logo"
import { IconButton } from "../ui/Button"
import { navigation } from ".//navigation"
import { GlobalCutoff } from ".//GlobalCutoff"

export function TopBar({
  current,
  onNavigate,
  business,
  afterCutoff = false,
}: {
  current: string
  onNavigate: (label: string) => void
  business: "fresh" | "style" | "tech"
  afterCutoff?: boolean
}) {
  const [showNotifs, setShowNotifs] = useState(false)
  const [showCutoff, setShowCutoff] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const cutoffRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (showCutoff && cutoffRef.current && !cutoffRef.current.contains(target)) {
        setShowCutoff(false)
      }
      if (showNotifs && notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifs(false)
      }
      if (showProfile && profileRef.current && !profileRef.current.contains(target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("pointerdown", handleOutsidePointer)
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer)
    }
  }, [showCutoff, showNotifs, showProfile])

  useEffect(() => {
    setShowCutoff(false)
    setShowNotifs(false)
    setShowProfile(false)
  }, [current])

  return (
        <header className="topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div className="store-brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate("Home")}>
          <img alt="" src={wayTrackLogo} className="store-brand__logo" />
          <span className="store-brand__wordmark">WayTrack</span>
          <span className="store-brand__context">
            {business === "fresh" ? "Fresh" : business === "style" ? "Style" : "Tech"} &middot; Kandy
          </span>
        </div>
        <div className="topbar-desktop-nav">
          <nav className="top-nav" aria-label="Primary navigation">
            {["Home", "Orders", "Deliveries"].map((label) => (
              <button
                className={"top-nav-item " + (current === label ? "active" : "")}
                key={label}
                onClick={() => onNavigate(label)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-cutoff-wrapper" ref={cutoffRef}>
          <GlobalCutoff closed={afterCutoff} open={showCutoff} setOpen={(val) => {
            setShowCutoff(val)
            if (val) {
              setShowNotifs(false)
              setShowProfile(false)
            }
          }} />
        </div>

        <div style={{ position: "relative" }} ref={notifRef}>
          <IconButton label="Notifications" onClick={() => {
            const val = !showNotifs
            setShowNotifs(val)
            if (val) {
              setShowCutoff(false)
              setShowProfile(false)
            }
          }}>
            <Bell />
          </IconButton>
          <AnimatePresence>
          {showNotifs && (
            <motion.div className="notif-dropdown" 
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              style={{ position: "absolute", top: 48, right: 0, width: 320, background: "white", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-dropdown)", zIndex: 100, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Notifications</div>
              <div onClick={() => { setShowNotifs(false); onNavigate("Deliveries"); }} style={{ padding: 12, background: "var(--navy-50)", borderRadius: 6, marginBottom: 8, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                <strong>ORD-1045</strong> awaits receipt confirmation
              </div>
              <div onClick={() => { setShowNotifs(false); onNavigate("Orders"); }} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
                <strong>ORD-1065</strong> delivery rescheduled
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        <div style={{ position: "relative" }} ref={profileRef}>
          <button 
            className="desktop-only-flex" 
            style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--white)', padding: '0 4px', margin: 0 }} 
            type="button"
            onClick={() => {
              const val = !showProfile
              setShowProfile(val)
              if (val) {
                setShowCutoff(false)
                setShowNotifs(false)
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--sunburst-500)', color: 'var(--navy-900)', fontWeight: 700, fontSize: '13px' }}>DF</span>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>Dilini F.</span>
            <ChevronDown size={16} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div className="profile-dropdown" 
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                style={{ position: "absolute", top: 48, right: 0, width: 200, background: "white", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-dropdown)", zIndex: 100, padding: 8 }}>
                <div 
                  onClick={() => {
                    if (isLoggingOut) return;
                    setIsLoggingOut(true);
                    try { sessionStorage.removeItem("waylink.role.session"); } catch {}
                    const loginUrl = import.meta.env.VITE_LOGIN_URL || "https://kraken-hack-login.vercel.app/";
                    const urlObj = new URL(loginUrl, window.location.origin);
                    urlObj.searchParams.set("logged_out", "1");
                    window.location.replace(urlObj.toString());
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--navy-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={18} />
                  Sign out
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}



