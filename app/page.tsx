import { AppProvider } from "@/lib/store"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default function Page() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  )
}
