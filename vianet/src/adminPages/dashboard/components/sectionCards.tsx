import type { SalesData } from "@/adminstore/slices/dashboardSlice"
import { SalesCard } from "./SalesCard"
import { OrdersCard } from "./OrdersCard"
import { AccountsCard } from "./AccountsCard"
import { GrowthCard } from "./GrowthCard"

interface SectionCardsProps {
  data: SalesData | null;
  loading: boolean;
}

export function SectionCards({ data, loading }: SectionCardsProps) {
  const totalSales = data ? Number(data.total_sales).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00";
  const totalOrders = data ? Number(data.total_orders).toLocaleString() : "0";
  const revenue = data?.total_sales ?? "0";

  return (
    <div className="flex flex-row flex-wrap items-stretch gap-4 justify-evenly px-4 lg:px-6 dark:*:data-[slot=card]:bg-card">
      <div className="flex-1 min-w-[250px]">
        <SalesCard totalSales={totalSales} ordersCount={totalOrders} loading={loading} />
      </div>
      <div className="flex-1 min-w-[250px]">
        <OrdersCard totalOrders={totalOrders} revenue={revenue} loading={loading} />
      </div>
      <div className="flex-1 min-w-[250px]">
        <AccountsCard />
      </div>
      <div className="flex-1 min-w-[250px]">
        <GrowthCard />
      </div>
    </div>
  )
}