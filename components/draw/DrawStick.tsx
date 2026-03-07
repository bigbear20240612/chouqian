"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scroll } from "lucide-react";

interface DrawStickProps {
  isDrawing: boolean;
  result: string | number | string[] | null;
  onComplete?: () => void;
}

export function DrawStick({ isDrawing, result, onComplete }: DrawStickProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {isDrawing ? (
          <motion.div
            key="drawing"
            className="relative"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            {/* 签筒 */}
            <div className="relative w-32 h-48">
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-3xl rounded-t-lg shadow-2xl"
                animate={{
                  rotate: [-5, 5, -5, 5, -5, 5, 0],
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  onComplete,
                }}
              >
                {/* 签筒装饰 */}
                <div className="absolute inset-2 border-2 border-amber-600/50 rounded-b-2xl rounded-t-md" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-amber-600/30 rounded-full" />
              </motion.div>

              {/* 竹签 */}
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                animate={{
                  y: [-50, -100, -80],
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                }}
              >
                <div className="w-3 h-32 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full shadow-md" />
              </motion.div>
            </div>

            <motion.p
              className="text-center mt-8 text-lg font-medium text-amber-800"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              摇签中...
            </motion.p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 max-w-md">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Scroll className="h-8 w-8 text-white" />
                </div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <p className="text-sm text-amber-700 mb-3 font-medium">抽签结果</p>
                <div className="bg-white/80 rounded-2xl p-6 shadow-inner">
                  <p className="text-2xl font-bold text-amber-900 break-words">
                    {Array.isArray(result)
                      ? result.join(", ")
                      : String(result)}
                  </p>
                </div>
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
            <div className="w-32 h-48 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-3xl rounded-t-lg shadow-lg flex items-center justify-center">
              <Scroll className="h-12 w-12 text-amber-300" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
