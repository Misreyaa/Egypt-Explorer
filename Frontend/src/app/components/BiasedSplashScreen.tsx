import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface BiasedSplashScreenProps {
  isVisible: boolean;
  onDismiss?: (navigateToBias: boolean) => void; // Standardized prop definition
}

export const BiasedSplashScreen: React.FC<BiasedSplashScreenProps> = ({ isVisible, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full max-w-2xl bg-[#f5e6ca] text-brown-dark p-8 md:p-12 rounded-sm shadow-2xl overflow-hidden"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")',
              boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 60px rgba(139, 69, 19, 0.1)',
              border: '1px solid #d4c5a5'
            }}
          >
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="bg-red-900/10 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-900" />
              </div>

              <div className="space-y-3">
                <blockquote className="font-serif text-base md:text-lg leading-relaxed italic text-brown-dark/90 border-l-3 border-red-900/30 pl-4 py-1">
                  "An Egyptian man jumped on the roof of my moving cab and tried to reach his hand through my cracked window. The driver was swearing and swerving trying to get him off the damn roof. So yeah Egypt is really as bad as they say it is in terms of safety and chaos."
                </blockquote>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-red-900 font-bold uppercase tracking-tighter text-xs">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Warning: Biased Content
                  </div>
                  <p className="text-xs text-stone-600 max-w-xs leading-tight">
                    This is a biased narrative. Don't let single stories define a culture.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2 w-full">
                <Button 
                  onClick={() => onDismiss && onDismiss(true)}
                  className="bg-red-900 hover:bg-red-900 text-white w-full py-4 rounded-md text-sm font-semibold shadow-md transition-transform active:scale-95"
                >
                  Try our Bias Detector
                </Button>
                <button 
                  onClick={() => onDismiss && onDismiss(false)}
                  className="text-stone-500 hover:text-stone-800 underline text-xs transition-colors"
                >
                  Continue to destination
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};