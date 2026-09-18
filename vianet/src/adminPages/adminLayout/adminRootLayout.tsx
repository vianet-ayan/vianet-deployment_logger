import { Suspense, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useDispatch } from "react-redux"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminSidebar } from "./components/sidebar"
import { fetchInventory } from "@/adminstore/slices/inventorySlice"
import { fetchDaybook } from "@/adminstore/slices/daybookSlice"

function ContentFallback() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function AdminRootLayout() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchInventory() as any)
    dispatch(fetchDaybook() as any)
  }, [dispatch])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex-1 p-6">
            <Suspense fallback={<ContentFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
