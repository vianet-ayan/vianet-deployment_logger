import { motion } from "framer-motion"
import { useSidebar } from "@/components/ui/sidebar"

export function AdminHeader() {
  const { state } = useSidebar()
  const isExpanded = state === "expanded"

  return (
    <motion.header
      initial={false}
      animate={{ width: isExpanded ? "calc(100vw - var(--sidebar-width))" : "calc(100vw - var(--sidebar-width-icon))" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 z-40 flex h-12 shrink-0 items-center justify-start gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex items-center gap-2 px-4 bg-white h-[40px]">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="h-6 w-24 rounded bg-muted"
        />
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="h-6 w-16 rounded bg-muted"
        />
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="h-6 w-32 rounded bg-muted"
        />
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="h-6 w-20 rounded bg-muted"
        />
      </div>
    </motion.header>
  )
}
