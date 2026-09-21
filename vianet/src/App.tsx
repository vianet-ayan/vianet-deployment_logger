import { lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import AdminRootLayout from "./adminPages/adminLayout/adminRootLayout"
import AppLayout from "./appPages/layout/appLayout"

const Landing = lazy(() =>
  import('./landing/landing').then((module) => ({
    default: module.Landing,
  }))
);
const Analytics = lazy(() => import("./adminPages/analytics"))
const Dashboard = lazy(() => import("./adminPages/dashboard"))
const Inventory = lazy(() => import("./adminPages/inventory"))
const InventoryGroup = lazy(() => import("./adminPages/inventory/group"))
const Brands = lazy(() => import("./adminPages/inventory/brands"))
const LoginPage = lazy(() => import("./adminPages/loginPage"))
const Reports = lazy(() => import("./adminPages/reports"))
const PnL = lazy(() => import("./adminPages/reports/pnl"))
const BalanceSheet = lazy(() => import("./adminPages/reports/balanceSheet"))
const Daybook = lazy(() => import("./adminPages/reports/dayBook"))
const Paused = lazy(() => import("./adminPages/group/paused"))
const AccessGroups = lazy(() => import("./adminPages/group/accessGroups"))
const EmployGroup = lazy(() => import("./adminPages/group/employGroup"))
const AIChatComponents = lazy(() => import("./adminPages/ai-chat"))
const Tally = lazy(() => import("./adminPages/tally"))
const Ledger = lazy(() => import("./adminPages/ledger"))
const Settings = lazy(() => import("./adminPages/settings"))
const TestPage = lazy(() => import("./appPages/test"))
const AdminTestPage = lazy(() => import("./adminPages/test"))
const SentryTest = lazy(() => import("./adminPages/test/sentry"))
const StockPage = lazy(() => import("./appPages/stock"))
const MotionTest = lazy(() => import("./appPages/test/motion"))
const AppLoginPage = lazy(() => import("./appPages/loginPage"))
const Docs = lazy(() => import("./extrapages/docs").then((module) => ({ default: module.Docs })));
const Privacy = lazy(() => import("./extrapages/privacy").then((module) => ({ default: module.PrivacyPolicy })));
const Terms = lazy(() => import("./extrapages/tos").then((module) => ({ default: module.TermsOfService })));



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
    path: "/docs",
    element: (
      <Suspense fallback={<PageFallback />}>
        <Docs />
      </Suspense>
    ),
  },
  {
    path: "/privacy",
    element: (
      <Suspense fallback={<PageFallback />}>
        <Privacy />
      </Suspense>
    ),
  },
  {
    path: "/terms",
    element: (
      <Suspense fallback={<PageFallback />}>
        <Terms />
      </Suspense>
    ),
  },
  {
    path: "/app",
    element: (
      <Suspense fallback={<PageFallback />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: <Appm /> },
      { path: "stock", element: <StockPage /> },
      { path: "test", element: <TestPage /> },
      { path: "login", element: <AppLoginPage /> },
    ],
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
      { path: "inventory/group", element: <InventoryGroup /> },
      { path: "inventory/brands", element: <Brands /> },
      { path: "reports", element: <Reports /> },
      { path: "reports/pnl", element: <PnL /> },
      { path: "reports/balance-sheet", element: <BalanceSheet /> },
      { path: "reports/daybook", element: <Daybook /> },
      { path: "group/paused", element: <Paused /> },
      { path: "group/access-groups", element: <AccessGroups /> },
      { path: "group/employ-group", element: <EmployGroup /> },
      { path: "ai-chat", element: <AIChatComponents /> },
      { path: "tally", element: <Tally /> },
      { path: "ledger", element: <Ledger /> },
      { path: "settings", element: <Settings /> },
      { path: "test", element: <AdminTestPage /> },
      { path: "test/sentry", element: <SentryTest /> },
    ],
  },
 
  {
    path: "/test/motion",
    element: (
      <Suspense fallback={<PageFallback />}>
        <MotionTest />
      </Suspense>
    ),
  },
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<PageFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
])

export function App() {
  return <RouterProvider router={router} />
}

export default App
