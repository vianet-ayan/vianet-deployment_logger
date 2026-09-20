import { motion } from "framer-motion"

export function AdminToolbar() {
  return (
    <motion.div 
     whileHover={{ scale: 1.1 }}
    className="fixed right-[10px] w-[60px] top-1/2 -translate-y-1/2 z-50 h-[30vh] bg-background/95 backdrop-blur border rounded-lg p-2 shadow-lg 
    flex justify-items-center items-center justify-center">
      <div className="text-xs font-medium text-muted-foreground px-2 py-1">Toolbar</div>
    </motion.div>
  )
}
