import { lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import AdminRootLayout from "./adminPages/adminLayout/adminRootLayout"
import AppLayout from "./appPages/layout/appLayout"

const Landing = lazy(() =>
  import('./landing/landing').then((module) => ({
    default: module.Landing, // Replace 'Landing' with whatever named export you used
  }))
);
const Analytics = lazy(() => import("./adminPages/analytics"))
const Dashboard = lazy(() => import("./adminPages/dashboard"))
const Inventory = lazy(() => import("./adminPages/inventory"))
const LoginPage = lazy(() => import("./adminPages/loginPage"))
const Reports = lazy(() => import("./adminPages/reports"))
const Tally = lazy(() => import("./adminPages/tally"))
const Settings = lazy(() => import("./adminPages/settings"))
const TestPage = lazy(() => import("./appPages/test"))
const AdminTestPage = lazy(() => import("./adminPages/test"))
const StockPage = lazy(() => import("./appPages/stock"))



function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function Appm() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <h1 className="font-medium">App Dashboard</h1>
        <Button className="mt-2">Action</Button>
      </div>
    </div>
  )
}

function HomeRoute() {
  const isAuthenticated = false

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return <Landing />
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageFallback />}>
        <HomeRoute />
      </Suspense>
    ),
  },
  {
    path: "/app",
    element: (
      <Suspense fallback={<PageFallback />}>
        <AppLayout>
          <Appm />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: "/app/stock",
    element: (
      <Suspense fallback={<PageFallback />}>
        <AppLayout>
          <StockPage />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: "/app/test",
    element: (
      <Suspense fallback={<PageFallback />}>
        <TestPage />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: (
      <Suspense fallback={<PageFallback />}>
        <AdminRootLayout />
      </Suspense>
    ),
    children: [
      { path: "analytics", element: <Analytics /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "inventory", element: <Inventory /> },
      { path: "loginPage", element: <LoginPage /> },
      { path: "reports", element: <Reports /> },
      { path: "tally", element: <Tally /> },
      { path: "settings", element: <Settings /> },
      { path: "test", element: <AdminTestPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

export default App
