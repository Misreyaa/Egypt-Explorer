import React, { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface BiasPromoBubbleProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  userType: 'tourist' | 'local';
}

export const BiasPromoBubble: React.FC<BiasPromoBubbleProps> = ({ onNavigate, currentPage, userType }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show bubble after a delay, but only for tourists, not on bias page, and not if dismissed
  useEffect(() => {
    if (userType !== 'tourist' || currentPage === 'bias' || isDismissed) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [currentPage, isDismissed, userType]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-40 max-w-[280px] sm:max-w-xs"
        >
          <div 
            className="bg-card/95 backdrop-blur-sm border-2 border-primary/50 text-card-foreground p-4 rounded-2xl shadow-2xl cursor-pointer hover:shadow-primary/20 hover:scale-[1.02] transition-all group relative overflow-hidden"
            onClick={() => onNavigate('bias')}
          >
            {/* Abstract background decoration */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-background/50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-xl shrink-0">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight text-primary">Sans myths, sans bias</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Challenge your perceptions. Try our Bias Detector now!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};