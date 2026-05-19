import { AppProvider } from "@/lib/store"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </AppProvider>
  )
}