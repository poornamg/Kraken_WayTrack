import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import wayTrackLogo from "../../assets/waytrack-logo.png";

export function WayLinkMark() {
  return (
    <div className="waylink-mark" aria-label="WayTrack">
      <img alt="" className="brand__mark" src={wayTrackLogo} />
      <Text as="span" variant="h3" className="waylink-mark__word">
        WayTrack
      </Text>
    </div>
  )
}

type ButtonVariant = "primary" | "secondary" | "success" | "critical"
