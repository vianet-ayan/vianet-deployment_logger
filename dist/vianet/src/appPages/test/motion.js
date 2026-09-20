import { motion } from "framer-motion";
export default function MotionTest() {
    return (<div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-8">Motion Test</h1>
      <motion.div className="h-32 w-32 rounded-xl bg-primary cursor-pointer" whileHover={{ width: 556, backgroundColor: "#3b82f6", borderRadius: "200px" }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.051 }}/>
    </div>);
}
