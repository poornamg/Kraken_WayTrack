const fs = require('fs');
let content = fs.readFileSync('frontend/Login/src/pages/auth/LoginPage.tsx', 'utf-8');

// Replace state and methods with hook call
const startText = 'const [employeeId, setEmployeeId] = useState("")';
const endText = '    idRef.current?.focus()\n  }\n';

const hookCall = `  const {
    employeeId, setEmployeeId,
    email, setEmail,
    password, setPassword,
    showPw, setShowPw,
    loading, error,
    idRef, handleSubmit, fillRow
  } = useAuthForm()`;

const startIndex = content.indexOf(startText);
const endIndex = content.indexOf(endText) + endText.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + hookCall + content.substring(endIndex);
  
  // Update imports
  content = content.replace(
    'import { useState, useRef, type FormEvent } from "react"',
    'import { useAuthForm } from "../../hooks/useAuthForm.js"'
  );
  
  // Remove unused import
  content = content.replace('import { authApi } from "@/auth"\n', '');
  
  fs.writeFileSync('frontend/Login/src/pages/auth/LoginPage.tsx', content);
  console.log("Patched successfully");
} else {
  console.error("Could not find blocks to replace");
  process.exit(1);
}
