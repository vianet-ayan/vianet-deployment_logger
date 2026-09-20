import { Suspense, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useDispatch } from "react-redux"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminSidebar } from "./components/sidebar"
import { AdminHeader } from "./components/header"
import { AdminToolbar } from "./components/toolbar"
import { adminPersistor } from "@/adminstore/adminstore"
import { fetchInventory } from "@/adminstore/slices/inventorySlice"

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
    const dispatchFetches = () => {
      dispatch(fetchInventory() as any)
    }

    if (adminPersistor.getState().bootstrapped) {
      dispatchFetches()
      return
    }

    const unsubscribe = adminPersistor.subscribe(() => {
      const state = adminPersistor.getState()
      if (state.bootstrapped) {
        dispatchFetches()
        unsubscribe()
      }
    })

    return () => { unsubscribe() }
  }, [dispatch])

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AdminSidebar />
        
        <div className="flex-1 p-6 pt-16">
          <AdminHeader />
          <Suspense fallback={<ContentFallback />}>
            <Outlet />
          </Suspense>
        </div>
        
        <AdminToolbar />
      </SidebarProvider>
    </TooltipProvider>
  )
}