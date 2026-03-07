"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface DrawCardProps {
  isDrawing: boolean;
  result: string | number | string[] | null;
  onComplete?: () => void;
}

export function DrawCard({ isDrawing, result, onComplete }: DrawCardProps) {
  return (
    <div className="flex items-center justify-center perspective-1000">
      <AnimatePresence mode="wait">
        {isDrawing ? (
          <motion.div
            key="drawing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            <motion.div
              className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl flex items-center justify-center"
              animate={{
                rotateY: [0, 180, 360, 540, 720],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
              }}
              onAnimationComplete={onComplete}
            >
              <div className="text-white text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="h-12 w-12" />
                </motion.div>
                <p className="text-xl font-bold">抽签中...</p>
              </div>
            </motion.div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="relative"
          >
            <motion.div
              className="w-80 h-64 rounded-3xl bg-gradient-to-br from-black to-gray-800 shadow-2xl flex items-center justify-center p-8"
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-white text-center">
                <p className="text-sm mb-2 opacity-80">抽签结果</p>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold break-words"
                >
                  {Array.isArray(result)
                    ? result.join(", ")
                    : String(result)}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200/80 shadow-lg flex items-center justify-center border-2 border-dashed border-gray-400/30">
              <div className="text-center text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>点击开始抽签</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
