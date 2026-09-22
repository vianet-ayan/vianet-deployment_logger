import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  ChevronRight,
  ChevronsUpDown,
  FolderOpen,
  GalleryVerticalEnd,
  Inbox,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  Settings,
  SquareTerminal,
  TableProperties,
  Target,
  User,
  Megaphone,
  BookOpen,
  Book,
  TrendingUp,
  Scale,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { formatCompact, getRows, computePnlStats, sumAllRows } from "@/lib/reportData"
import { fetchUserById } from "@/adminstore"
import { logout } from "@/adminstore/slices/authSlice"
import type { RootState, AppDispatch } from "@/adminstore"

function VianetLogo({ className }: { className?: string }) {
  return <img src="/vianet.png" alt="Vianet" className={className} />
}

const data = {
  teams: [
    {
      name: "Vianet",
      logo: VianetLogo,
      plan: "Enterprise",
    },
    {
      name: "Vianet Corp.",
      logo: GalleryVerticalEnd,
      plan: "Startup",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Overview", url: "/admin/dashboard" },
        { title: "Analytics", url: "/admin/analytics" },
      ],
    },
    {
      title: "Management",
      url: "#",
      icon: Package,
      items: [
        { title: "Tally", url: "/admin/tally" },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: Package,
      items: [
        { title: "Inventory", url: "/admin/inventory" },
        { title: "Group", url: "/admin/inventory/group" },
        { title: "Brands", url: "/admin/inventory/brands" },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: TableProperties,
      items: [
        { title: "PnL", url: "/admin/reports/pnl" },
        { title: "Balance Sheet", url: "/admin/reports/balance-sheet" },
        { title: "Daybook", url: "/admin/reports/daybook" },
      ],
    },
    {
      title: "Group",
      url: "#",
      icon: FolderOpen,
      items: [
        { title: "Paused", url: "/admin/group/paused" },
        { title: "Access Groups", url: "/admin/group/access-groups" },
        { title: "Employ Group", url: "/admin/group/employ-group" },
      ],
    },
    {
      title: "AI Chat",
      url: "/admin/ai-chat",
      icon: MessageSquare,
      items: [
        { title: "Components", url: "/admin/ai-chat" },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      items: [
        { title: "General", url: "/admin/settings" },
        { title: "Login Page", url: "/admin/loginPage" },
      ],
    },
    {
      title: "Inbounds",
      url: "#",
      icon: Inbox,
      items: [
        { title: "All Inbounds", url: "/admin/inbounds" },
        { title: "Pending", url: "/admin/inbounds/pending" },
        { title: "Completed", url: "/admin/inbounds/completed" },
      ],
    },
    {
      title: "Tasks",
      url: "#",
      icon: Target,
      items: [
        { title: "All Tasks", url: "/admin/tasks" },
        { title: "My Tasks", url: "/admin/tasks/my-tasks" },
        { title: "Team Tasks", url: "/admin/tasks/team-tasks" },
      ],
    },
    {
      title: "Marketing",
      url: "#",
      icon: Megaphone,
      items: [
        { title: "Campaigns", url: "/admin/marketing/campaigns" },
        { title: "Leads", url: "/admin/marketing/leads" },
        { title: "Analytics", url: "/admin/marketing/analytics" },
      ],
    },
    {
      title: "Blogs",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "All Posts", url: "/admin/blogs" },
        { title: "Categories", url: "/admin/blogs/categories" },
        { title: "Drafts", url: "/admin/blogs/drafts" },
      ],
    },
    {
      title: "Ledgers",
      url: "#",
      icon: Book,
      items: [
        { title: "Ledger", url: "/admin/ledger" },
      ],
    },
  ],
}

function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <activeTeam.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add team
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger
                render={<SidebarMenuButton tooltip={item.title} />}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton render={<Link to={subItem.url} />}>
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function isLiabilityRowName(name: string): boolean {
  const n = name.toLowerCase()
  return (
    n.includes("liabilit") ||
    n.includes("loan") ||
    n.includes("payable") ||
    n.includes("duties") ||
    n.includes("provision") ||
    n.includes("capital")
  )
}

function FinancialSidebarData() {
  const monthly = useSelector((state: RootState) => state.pnl?.monthly ?? [])
  const records = useSelector((state: RootState) => state.balanceSheet?.records ?? [])

  const latestPnlMonthly = [...monthly].sort((a, b) => b.month.localeCompare(a.month))[0]
  const latestBs = [...records].sort((a, b) => b.date.localeCompare(a.date))[0]

  const pnlRows = getRows(latestPnlMonthly?.data)
  const stats = computePnlStats(pnlRows)
  const netProfit = pnlRows.length > 0 ? stats.netProfit : null

  const bsRows = getRows(latestBs?.data)
  const totalAssets = bsRows.length > 0 ? sumAllRows(bsRows.filter((r) => !isLiabilityRowName(r.name))) : null

  const monthLabel = latestPnlMonthly
    ? new Date(`${latestPnlMonthly.month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Financials</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={latestPnlMonthly ? `PnL · ${monthLabel}` : "PnL — no data"}>
            <Link to="/admin/reports/pnl">
              <TrendingUp className={netProfit != null && netProfit < 0 ? "text-red-500" : "text-green-600"} />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-xs text-muted-foreground">PnL {monthLabel ? `· ${monthLabel}` : ""}</span>
                <span className="truncate text-sm font-medium">
                  {netProfit != null ? formatCompact(netProfit) : "No data"}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={latestBs ? `Balance Sheet · ${latestBs.date}` : "Balance Sheet — no data"}>
            <Link to="/admin/reports/balance-sheet">
              <Scale />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-xs text-muted-foreground">Balance Sheet</span>
                <span className="truncate text-sm font-medium">
                  {totalAssets != null ? formatCompact(totalAssets) : "No data"}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/admin/login', { replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/admin/account" />}>
                <User />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/admin/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut onClick={handleLogout}/>
                Log outsdfasd
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch()
  const selectedUser = useSelector((state: RootState) => state.user?.selectedUser)
  const loading = useSelector((state: RootState) => state.user?.loading)
  const { setOpen } = useSidebar()

  React.useEffect(() => {
    dispatch(fetchUserById(24))
  }, [dispatch])

  const user = selectedUser
    ? { name: selectedUser.name, email: selectedUser.email, avatar: "" }
    : { name: "Admin", email: "admin@vianet.com", avatar: "" }

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <FinancialSidebarData />
      </SidebarContent>
      <SidebarFooter>
        {loading ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">...</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium animate-pulse">Loading...</span>
                  <span className="truncate text-xs animate-pulse">Please wait</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <NavUser user={user} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
