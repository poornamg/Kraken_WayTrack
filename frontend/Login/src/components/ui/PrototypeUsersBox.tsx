import { PROTOTYPE_USERS } from "../../data/mockUsers.js"

interface PrototypeUsersBoxProps {
  fillRow: (id: string, pw: string, recordedEmail: string) => void;
}

export function PrototypeUsersBox({ fillRow }: PrototypeUsersBoxProps) {
  return (
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
  )
}
