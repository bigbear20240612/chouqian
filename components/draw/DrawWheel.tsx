"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

interface DrawWheelProps {
  isDrawing: boolean;
  result: string | number | string[] | null;
  onComplete?: () => void;
}

const WHEEL_SEGMENTS = 8;
const SEGMENT_COLORS = [
  "from-red-400 to-red-500",
  "from-orange-400 to-orange-500",
  "from-amber-400 to-amber-500",
  "from-green-400 to-green-500",
  "from-teal-400 to-teal-500",
  "from-blue-400 to-blue-500",
  "from-indigo-400 to-indigo-500",
  "from-purple-400 to-purple-500",
];

export function DrawWheel({ isDrawing, result, onComplete }: DrawWheelProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <AnimatePresence mode="wait">
        {isDrawing ? (
          <motion.div
            key="drawing"
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* 指针 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-primary drop-shadow-lg" />
            </div>

            {/* 转盘 */}
            <motion.div
              className="w-72 h-72 rounded-full shadow-2xl relative overflow-hidden border-8 border-white"
              animate={{
                rotate: [0, 360 * 5 + Math.random() * 360],
              }}
              transition={{
                duration: 4,
                ease: [0.25, 0.1, 0.25, 1], // cubic-bezier easing for deceleration
                onComplete,
              }}
            >
              {SEGMENT_COLORS.map((color, i) => {
                const angle = (360 / WHEEL_SEGMENTS) * i;
                return (
                  <motion.div
                    key={i}
                    className={`absolute inset-0 bg-gradient-to-br ${color}`}
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle * Math.PI) / 180)}% ${50 + 50 * Math.sin((angle * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((angle + 360 / WHEEL_SEGMENTS) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle + 360 / WHEEL_SEGMENTS) * Math.PI) / 180)}%)`,
                    }}
                  />
                );
              })}

              {/* 中心装饰 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Activity className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
            </motion.div>

            <motion.p
              className="text-center mt-8 text-lg font-medium text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              旋转中...
            </motion.p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-md"
          >
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 shadow-2xl border-4 border-primary/20 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-6 flex items-center justify-center shadow-lg"
              >
                <Activity className="h-10 w-10 text-white" />
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground mb-3 font-medium"
              >
                🎉 抽签结果
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <p className="text-3xl font-bold text-gradient break-words">
                  {Array.isArray(result)
                    ? result.join(", ")
                    : String(result)}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <p className="text-4xl">🎊</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="w-72 h-72 rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-lg flex items-center justify-center border-8 border-white/50">
              <div className="text-center text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>点击开始抽签</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
