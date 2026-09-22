import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/appSidebar"
import { appLogout } from "@/appstore/slices/appAuthSlice"
import type { RootState, AppDispatch } from "@/adminstore"

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { token, tokenExpiry, isAuthenticated } = useSelector(
    (state: RootState) => state.appAuth
  )
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const timer = setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 30_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!token || !isAuthenticated) {
      navigate("/app/login", { replace: true })
      return
    }
    if (tokenExpiry && tokenExpiry < Math.floor(Date.now() / 1000)) {
      dispatch(appLogout())
      navigate("/app/login", { replace: true })
    }
  }, [token, tokenExpiry, isAuthenticated, dispatch, navigate])

  if (!token || !isAuthenticated) {
    return null
  }

  if (tokenExpiry && tokenExpiry < nowSeconds) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex-1 p-6"><Outlet /></div>
      </SidebarInset>
    </SidebarProvider>
  )
}
