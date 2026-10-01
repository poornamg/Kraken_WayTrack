import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "../ui/Text.js";

export function SectionHeader({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="section-header">
      <Text as="h2" variant="h2">
        {title}
      </Text>
      <Text variant="body">{description}</Text>
    </div>
  )
}
