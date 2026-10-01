const fs = require('fs');
let content = fs.readFileSync('frontend/Login/src/pages/auth/LoginPage.tsx', 'utf-8');

// Replace Error
const errorStart = '{error && (\n          <div\n            role="alert"';
const errorEnd = '<span>{error}</span>\n          </div>\n        )}';
const errorIndex = content.indexOf(errorStart);
const errorEndIndex = content.indexOf(errorEnd) + errorEnd.length;
if (errorIndex !== -1 && errorEndIndex !== -1) {
  content = content.substring(0, errorIndex) + '<ErrorBanner error={error} />' + content.substring(errorEndIndex);
}

// Replace Password
const pwStart = '<div className="mb-6">\n          <div className="flex items-center justify-between mb-1.5">\n            <label className="text-sm font-medium" style={{ color: "#374151" }} htmlFor="password">';
const pwEnd = '{showPw ? <EyeOffIcon /> : <EyeIcon />}\n            </button>\n          </div>\n        </div>';
const pwIndex = content.indexOf(pwStart);
const pwEndIndex = content.indexOf(pwEnd) + pwEnd.length;
if (pwIndex !== -1 && pwEndIndex !== -1) {
  content = content.substring(0, pwIndex) + '<PasswordField value={password} onChange={setPassword} showPw={showPw} onToggleShow={() => setShowPw(v => !v)} />' + content.substring(pwEndIndex);
}

content = 'import { ErrorBanner } from "../../components/ui/ErrorBanner.js"\nimport { PasswordField } from "../../components/ui/PasswordField.js"\n' + content;
fs.writeFileSync('frontend/Login/src/pages/auth/LoginPage.tsx', content);
console.log("Patched 2 successfully");
