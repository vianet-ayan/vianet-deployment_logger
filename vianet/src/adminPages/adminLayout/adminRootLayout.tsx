import { Suspense, useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminSidebar } from "./components/sidebar"
import { AdminHeader } from "./components/header"
import { AdminToolbar } from "./components/toolbar"
import { adminPersistor } from "@/adminstore/adminstore"
import { logoutThunk } from "@/adminstore/slices/authSlice"
import type { RootState, AppDispatch } from "@/adminstore"


import { fetchInventory } from "@/adminstore/slices/inventorySlice"
import { getLedger } from "@/adminstore/slices/ledgerSlice"
import { fetchAccessGroups } from "@/adminstore/slices/accessGroupSlice"
import { fetchDaybookThisMonth } from "@/adminstore/slices/daybookSlice"

function ContentFallback() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function AdminRootLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, tokenExpiry, isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const checkAuth = () => {
      if (!token || !isAuthenticated) {
        navigate('/admin/login', { replace: true })
        return
      }
      
      if (tokenExpiry) {
        const now = Math.floor(Date.now() / 1000)
        if (tokenExpiry < now) {
          dispatch(logoutThunk())
          navigate('/admin/login', { replace: true })
          return
        }
      }
    }

    checkAuth()
  }, [token, tokenExpiry, isAuthenticated, dispatch, navigate])

  useEffect(() => {
    const dispatchFetches = () => {
      dispatch(fetchInventory() as any)
      dispatch(getLedger() as any)
      dispatch(fetchAccessGroups() as any)
      dispatch(fetchDaybookThisMonth() as any)
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

  if (!token || !isAuthenticated) {
    return null
  }

  if (tokenExpiry) {
    const now = Math.floor(Date.now() / 1000)
    if (tokenExpiry < now) {
      return null
    }
  }

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