import React from 'react';

export const PharaohAnimation: React.FC = () => {
  return (
    <div className="w-full flex justify-center mb-8">
      <div className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/10 bg-black">
        
        {/* The Google Drive Embed Player */}
        <video
          src="src/app/Cartoon_Pharaoh_Meets_Tourists_Animation.mp4"
          className="w-full h-full absolute top-0 left-0"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Optional: Overlay Text/Badge */}
        <div className="absolute bottom-4 right-16 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-900/20 shadow-lg pointer-events-none">
           <p className="text-xs font-bold text-amber-900">Welcome to Egypt 🇪🇬</p>
        </div>

      </div>
    </div>
  );
};