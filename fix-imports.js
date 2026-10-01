const fs = require('fs');

const pages = [
  'frontend/loader/src/pages/AvailableWorkPage.tsx',
  'frontend/loader/src/pages/ActiveLoadPage.tsx',
  'frontend/loader/src/pages/LoadConfirmedPage.tsx',
  'frontend/loader/src/pages/ReconciliationPage.tsx',
  'frontend/loader/src/App.tsx'
];

const newImports = `
import { Text } from "../components/ui/Text.js";
import { WayLinkMark } from "../components/ui/WayLinkMark.js";
import { Button } from "../components/ui/Button.js";
import { StatusPill } from "../components/ui/StatusPill.js";
import { ConnectivityIndicator } from "../components/ui/ConnectivityIndicator.js";
import { LoaderIdentity } from "../components/ui/LoaderIdentity.js";
import { Card } from "../components/ui/Card.js";
import { CompletionVarianceBadge } from "../components/available-work/CompletionVarianceBadge.js";
import { LoadDepartureTimer } from "../components/available-work/LoadDepartureTimer.js";
import { WorkCard } from "../components/available-work/WorkCard.js";
import { LoadItem } from "../components/active-load/LoadItem.js";
import { StopCard } from "../components/active-load/StopCard.js";
import { ExceptionSheet } from "../components/active-load/ExceptionSheet.js";
import { Progress } from "../components/active-load/Progress.js";
import { PageHeader } from "../components/layout/PageHeader.js";
import { SectionHeader } from "../components/layout/SectionHeader.js";
import { BottomActionBar } from "../components/layout/BottomActionBar.js";
import { LoaderShell } from "../components/layout/LoaderShell.js";
import type { ExceptionType, LoadItemData, LoadItemException } from "../components/active-load/LoadItem.js";
`;

for (const page of pages) {
  let content = fs.readFileSync(page, 'utf8');
  // Remove existing loader-ui imports
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*["']\.\.?\/?(?:components\/)?loader-ui(?:\.js)?["'];?/g, '');
  
  // Insert new imports after react/lucide imports
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\n', lastImportIndex);
    content = content.substring(0, endOfImport + 1) + newImports + content.substring(endOfImport + 1);
  } else {
    content = newImports + content;
  }
  
  fs.writeFileSync(page, content);
}
console.log("Imports fixed");
