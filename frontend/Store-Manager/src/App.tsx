import { StoreProvider } from "./context/StoreContext"
import { AppShell } from "./components/layout/AppShell"

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}
