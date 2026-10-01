const fs = require('fs');
let content = fs.readFileSync('frontend/Login/src/pages/auth/LoginPage.tsx', 'utf-8');

const start = '{/* Prototype credentials box */}\n        {isMock && (';
const end = '          </div>\n        )}';

const startIndex = content.indexOf(start);
const endIndex = content.indexOf(end) + end.length;
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + '{isMock && <PrototypeUsersBox fillRow={fillRow} />}' + content.substring(endIndex);
}

content = 'import { PrototypeUsersBox } from "../../components/ui/PrototypeUsersBox.js"\n' + content;
fs.writeFileSync('frontend/Login/src/pages/auth/LoginPage.tsx', content);
console.log("Patched 3 successfully");
