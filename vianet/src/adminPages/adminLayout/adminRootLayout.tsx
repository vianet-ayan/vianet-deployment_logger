import { Suspense, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminSidebar } from "./components/sidebar"
import { AdminToolbar } from "./components/toolbar"
import { adminPersistor } from "@/adminstore/adminstore"
import { logoutThunk } from "@/adminstore/slices/authSlice"
import type { RootState, AppDispatch } from "@/adminstore"


import { fetchInventory } from "@/adminstore/slices/inventorySlice"
import { getLedger } from "@/adminstore/slices/ledgerSlice"
import { fetchAccessGroups, fetchAccessGroupInventory } from "@/adminstore/slices/accessGroupSlice"
import { fetchDaybookThisMonth } from "@/adminstore/slices/daybookSlice"
import { fetchPnlMonthly } from "@/adminstore/slices/pnlSlice"
import { fetchBalanceSheets } from "@/adminstore/slices/balanceSheetSlice"

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
  const { token, tokenExpiry, isAuthenticated } = useSelector((state: RootState) => state.auth)
  // Ticked periodically so the render-time token-expiry check doesn't read the clock during render
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const timer = setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 30_000)
    return () => clearInterval(timer)
  }, [])

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
      dispatch(fetchInventory())
      dispatch(getLedger())
      dispatch(fetchDaybookThisMonth())
      dispatch(fetchPnlMonthly())
      dispatch(fetchBalanceSheets())

      // Groups first, then their inventory — the inventory reducer attaches
      // items onto a group, so the group list must exist before it resolves
      void dispatch(fetchAccessGroups())
        .unwrap()
        .then(() => dispatch(fetchAccessGroupInventory(1)))
        .catch(() => {})
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
    if (tokenExpiry < nowSeconds) {
      return null
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <AdminSidebar />
        
        <div className="flex-1 p-6">
          <Suspense fallback={<ContentFallback />}>
            <Outlet />
          </Suspense>
        </div>
        
        <AdminToolbar />
      </SidebarProvider>
    </TooltipProvider>
  )
}