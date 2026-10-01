import { LockIcon, EyeIcon, EyeOffIcon } from "./Icons.js"

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  showPw: boolean;
  onToggleShow: () => void;
}

export function PasswordField({ value, onChange, showPw, onToggleShow }: PasswordFieldProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: "#374151" }} htmlFor="password">
          Password
        </label>
      </div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <LockIcon />
        </span>
        <input
          id="password"
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 pl-10 pr-12 rounded-lg text-sm outline-none transition-all"
          style={{ border: "1.5px solid #d9dde8" }}
          onFocus={(e) => { e.target.style.borderColor = "#14549c"; e.target.style.boxShadow = "0 0 0 3px rgb(20 84 156 / 15%)" }}
          onBlur={(e) => { e.target.style.borderColor = "#d9dde8"; e.target.style.boxShadow = "none" }}
        />
        <button
          type="button"
          aria-label={showPw ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onToggleShow}
        >
          {showPw ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}
