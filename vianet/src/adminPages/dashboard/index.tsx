import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchSalesThisMonth } from "@/adminstore/slices/dashboardSlice"
import { SectionCards } from "./components/sectionCards"

export default function Dashboard() {
  const dispatch = useDispatch()
  const { test } = useSelector((state: { user: { test: string } }) => state.user);
  const { salesThisMonth, loading, error } = useSelector((state: { dashboard: { salesThisMonth: { total_sales: string; total_orders: string } | null; loading: boolean; error: string | null } }) => state.dashboard);

  useEffect(() => {
    if (!salesThisMonth && !loading) {
      dispatch(fetchSalesThisMonth());
    }
  }, [salesThisMonth, loading, dispatch]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {error && <p className="text-red-500">Error: {error}</p>}
      <SectionCards data={salesThisMonth} loading={loading} />
    </div>
  )
}