import { IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from "@/components/ui/card"

interface SalesCardProps {
  totalSales: string;
  ordersCount: string;
  loading: boolean;
}

export function SalesCard({ totalSales, ordersCount, loading }: SalesCardProps) {
  return (
    <Card className="@container/card w-full">
      <CardHeader>
        <CardDescription>Total Sales This Month</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {loading ? "..." : totalSales}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            {totalSales}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Sales this month <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          {loading ? "Loading..." : `${ordersCount} orders this month`}
        </div>
      </CardFooter>
    </Card>
  )
}
