const fs = require('fs');
const nodes = JSON.parse(fs.readFileSync('nodes.json', 'utf8'));

const importsNode = nodes[0].code;

// Extract cx
const cxMatch = importsNode.match(/function cx\([^)]*\)\s*\{[^}]*\}/);
fs.writeFileSync('frontend/loader/src/utils/cx.ts', `export ${cxMatch[0]}`);

const commonImports = `import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, CloudOff,
  Flag, Hammer, Info, LoaderCircle, LogOut, MapPin, Minus, Package, PackageCheck, Plus,
  RefreshCw, Route, Scale, ShieldCheck, Store, Truck, UserRound, Warehouse, Waypoints, XCircle,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
`;

const fileMap = {
  Text: { dir: "components/ui", extra: `export type TextVariant = "display" | "h1" | "h2" | "h3" | "body" | "body-strong" | "label" | "caption" | "data";\nexport type TextTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "label";` },
  WayLinkMark: { dir: "components/ui", extraImports: `import wayTrackLogo from "../../assets/waytrack-logo.png";` },
  ButtonProps: { mergeTo: "Button" },
  Button: { dir: "components/ui" },
  StatusPill: { dir: "components/ui", extraImports: `import { Text } from "./Text.js";` },
  ConnectivityState: { mergeTo: "ConnectivityIndicator" },
  ConnectivityIndicator: { dir: "components/ui", extraImports: `import { Text } from "./Text.js";\nimport { StatusPill } from "./StatusPill.js";` },
  LoaderIdentity: { dir: "components/ui", extraImports: `import { Text } from "./Text.js";` },
  CardProps: { mergeTo: "Card" },
  Card: { dir: "components/ui" },
  WorkCardState: { mergeTo: "WorkCard" },
  WorkCardProps: { mergeTo: "WorkCard" },
  CompletionVarianceBadge: { dir: "components/available-work", extraImports: `import { StatusPill } from "../ui/StatusPill.js";\nimport { Text } from "../ui/Text.js";` },
  LoadDepartureTimer: { dir: "components/available-work", extraImports: `import { Text } from "../ui/Text.js";\nimport type { LoadTiming } from "../../data/mock-data.js";` },
  WorkCard: { dir: "components/available-work", extraImports: `import { Text } from "../ui/Text.js";\nimport { Card } from "../ui/Card.js";\nimport { StatusPill } from "../ui/StatusPill.js";\nimport { CompletionVarianceBadge } from "./CompletionVarianceBadge.js";\nimport { LoadDepartureTimer } from "./LoadDepartureTimer.js";\nimport type { LoadTiming } from "../../data/mock-data.js";` },
  LoadItemStatus: { mergeTo: "LoadItem" },
  ExceptionType: { mergeTo: "LoadItem" },
  LoadItemException: { mergeTo: "LoadItem" },
  LoadItemData: { mergeTo: "LoadItem" },
  LoadItem: { dir: "components/active-load", extraImports: `import { Text } from "../ui/Text.js";` },
  StopCard: { dir: "components/active-load", extraImports: `import { Text } from "../ui/Text.js";\nimport { Card } from "../ui/Card.js";\nimport { LoadItem } from "./LoadItem.js";\nimport type { LoadItemData, LoadItemException } from "./LoadItem.js";` },
  ExceptionSheet: { dir: "components/active-load", extraImports: `import { Text } from "../ui/Text.js";\nimport { Button } from "../ui/Button.js";\nimport type { ExceptionType, LoadItemData, LoadItemException } from "./LoadItem.js";` },
  Progress: { dir: "components/active-load" },
  PageHeader: { dir: "components/layout", extraImports: `import { Text } from "../ui/Text.js";` },
  SectionHeader: { dir: "components/layout", extraImports: `import { Text } from "../ui/Text.js";` },
  BottomActionBar: { dir: "components/layout" },
  LoaderShell: { dir: "components/layout" }
};

const grouped = {};
for (const node of nodes.slice(1)) {
  let target = node.name;
  if (fileMap[node.name]?.mergeTo) {
    target = fileMap[node.name].mergeTo;
  }
  if (!grouped[target]) grouped[target] = [];
  grouped[target].push(node.code);
}

for (const [name, codes] of Object.entries(grouped)) {
  const conf = fileMap[name];
  if (!conf) {
    console.error("Unknown component:", name);
    continue;
  }
  const path = `frontend/loader/src/${conf.dir}/${name}.tsx`;
  let fileContent = commonImports;
  if (conf.extraImports) fileContent += conf.extraImports + '\n\n';
  if (conf.extra) fileContent += conf.extra + '\n\n';
  fileContent += codes.join('\n\n');
  fs.writeFileSync(path, fileContent);
}

// Write an index for types/components if needed? No, we will update pages explicitly.
console.log("Files split successfully");
