import React from 'react';
import TopBar from './TopBar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import DemoSectionInteractive from './DemoSectionInteractive';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
      <TopBar />
      <HeroSection />
      <FeaturesSection />
      <DemoSectionInteractive />
      <Footer />
    </div>
  );
};

export default LandingPage;
