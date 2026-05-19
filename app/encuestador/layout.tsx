import { AppProvider } from "@/lib/store"

export default function EncuestadorLayout({
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