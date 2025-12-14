import React from 'react';
import TopBar from './TopBar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import DemoSectionInteractive from './DemoSectionInteractive';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
            animation: 'mesh-animation 20s ease infinite'
          }}
        />
      </div>

      {/* Subtle scanline effect */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)'
        }}
      />

      <TopBar />
      <HeroSection />
      <FeaturesSection />
      <DemoSectionInteractive />
      <Footer />
    </div>
  );
};

export default LandingPage;
