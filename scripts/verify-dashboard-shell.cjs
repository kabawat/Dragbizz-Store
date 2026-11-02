// Prevent route pages/loading states from mounting a second navigation shell.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const project = path.resolve(__dirname, '..');
function files(directory) {
 return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? files(file) : /\.[jt]sx?$/.test(file) ? [file] : [];
 });
}
const roots = ['src/page/dashboard', 'src/app/(routes)/dashboard'];
let checked = 0;
for (const root of roots) for (const file of files(path.join(project, root))) {
 if (file === path.join(project, 'src/app/(routes)/dashboard/layout.jsx')) continue;
 const source = fs.readFileSync(file, 'utf8');
 assert.doesNotMatch(source, /from\s+["']@\/components\/dashboard\/(sidebar|header)["']/, `Nested dashboard chrome: ${file}`);
 assert.doesNotMatch(source, /<DashboardShell\b/, `Nested dashboard shell: ${file}`);
 checked++;
}
for (const file of files(path.join(project, 'src/components'))) {
 if (!/Loading|ErrorState|PermissionGuard/.test(path.basename(file))) continue;
 assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /<Sidebar\b|<Header\b|<DashboardShell\b/, `Nested shell in UI state: ${file}`);
 checked++;
}
console.log(`Dashboard shell boundary checks passed (${checked} files).`);
