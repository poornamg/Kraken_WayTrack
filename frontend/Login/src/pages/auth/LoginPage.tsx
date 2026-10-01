import { ErrorBanner } from "../../components/ui/ErrorBanner.js"
import { PasswordField } from "../../components/ui/PasswordField.js"
import { IdIcon, LockIcon, EyeIcon, EyeOffIcon, AlertIcon } from "../../components/ui/Icons.js"
import { useAuthForm } from "../../hooks/useAuthForm.js"
import { AuthLayout } from "./AuthLayout"
import { PROTOTYPE_USERS } from "@/data/mockUsers"

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true"

interface LoginPageProps {
  navigate: (path: string) => void
}

export function LoginPage({ navigate }: LoginPageProps) {
    const {
    employeeId, setEmployeeId,
    email, setEmail,
    password, setPassword,
    showPw, setShowPw,
    loading, error,
    idRef, handleSubmit, fillRow
  } = useAuthForm()
  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <h1
          className="text-[28px] font-bold leading-9 mb-1"
          style={{ fontFamily: "var(--font-poppins)", color: "#0e3f78" }}
        >
          Sign in
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
          Enter your Employee ID, password, and recorded email.
        </p>

        {/* Employee ID */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }} htmlFor="emp-id">
            Employee ID
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <IdIcon />
            </span>
            <input
              ref={idRef}
              id="emp-id"
              type="text"
              autoComplete="username"
              autoFocus
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              placeholder="DSP-1001"
              className="w-full h-12 pl-10 pr-4 rounded-lg text-sm outline-none transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                border: "1.5px solid #d9dde8",
                fontSize: "14px",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#14549c"; e.target.style.boxShadow = "0 0 0 3px rgb(20 84 156 / 15%)" }}
              onBlur={(e) => { e.target.style.borderColor = "#d9dde8"; e.target.style.boxShadow = "none" }}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }} htmlFor="email">
            Recorded email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@waypoint.lk"
            className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all"
            style={{ border: "1.5px solid #d9dde8" }}
            required
          />
        </div>

        {/* Password */}
        <PasswordField value={password} onChange={setPassword} showPw={showPw} onToggleShow={() => setShowPw(v => !v)} />

        {/* Error */}
        <ErrorBanner error={error} />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-70"
          style={{ backgroundColor: "#14549c", fontFamily: "var(--font-inter)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* Prototype credentials box */}
        {isMock && (
          <div
            className="mt-6 p-4 rounded-xl bg-white"
            style={{ border: "1.5px dashed #8a91ab" }}
          >
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#374151" }}>
              This is for prototype
            </p>
            <p className="text-xs mb-3" style={{ color: "#6b7280" }}>
              Use one of these Employee ID and password pairs to sign in as that role.
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "#9ca3af" }}>
                  <th className="text-left pb-1.5 font-medium">Employee ID</th>
                  <th className="text-left pb-1.5 font-medium">Password</th>
                  <th className="text-left pb-1.5 font-medium">Signs in as</th>
                </tr>
              </thead>
              <tbody>
                {PROTOTYPE_USERS.map((u, i) => (
                  <tr
                    key={u.employeeId}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : undefined }}
                  onClick={() => fillRow(u.employeeId, u.password, u.email)}
                    tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fillRow(u.employeeId, u.password, u.email)}
                    aria-label={`Fill ${u.employeeId} credentials`}
                  >
                    <td className="py-1.5 pr-2" style={{ fontFamily: "var(--font-mono)", color: "#1f2937" }}>{u.employeeId}</td>
                    <td className="py-1.5 pr-2" style={{ fontFamily: "var(--font-mono)", color: "#1f2937" }}>{u.password}</td>
                    <td className="py-1.5" style={{ color: "#6b7280" }}>
                      {u.role === "store_manager" ? "Store manager" : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>
    </AuthLayout>
  )
}

