import { useState, useRef, type FormEvent } from "react"
import { authApi } from "../auth"

export function useAuthForm() {
  const [employeeId, setEmployeeId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const idRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await authApi.login(employeeId.toUpperCase(), password, email)
      window.location.replace(result.redirectUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function fillRow(id: string, pw: string, recordedEmail: string) {
    setEmployeeId(id)
    setPassword(pw)
    setEmail(recordedEmail)
    idRef.current?.focus()
  }

  return {
    employeeId,
    setEmployeeId,
    email,
    setEmail,
    password,
    setPassword,
    showPw,
    setShowPw,
    loading,
    error,
    idRef,
    handleSubmit,
    fillRow,
  }
}
