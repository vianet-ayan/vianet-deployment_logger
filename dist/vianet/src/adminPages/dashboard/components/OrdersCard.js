import { IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from "@/components/ui/card";
export function OrdersCard({ totalOrders, revenue, loading }) {
    return (<Card className="@container/card w-full">
      <CardHeader>
        <CardDescription>Total Orders</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {loading ? "..." : totalOrders}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            {loading ? "" : `${totalOrders} orders`}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Orders this period <IconTrendingUp className="size-4"/>
        </div>
        <div className="text-muted-foreground">
          {loading ? "Loading..." : `Revenue: $${revenue}`}
        </div>
      </CardFooter>
    </Card>);
}
