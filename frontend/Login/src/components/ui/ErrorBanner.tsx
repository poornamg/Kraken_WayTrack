import { AlertIcon } from "./Icons.js"

export function ErrorBanner({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-2 text-sm mb-4 px-3 py-2.5 rounded-lg"
      style={{ color: "#e5484d", backgroundColor: "#fff0f0", border: "1px solid #fecdd3" }}
    >
      <AlertIcon />
      <span>{error}</span>
    </div>
  )
}
