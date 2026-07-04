import { SiteHeader } from "@/components/public/SiteHeader"
import { SiteFooter } from "@/components/public/SiteFooter"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
