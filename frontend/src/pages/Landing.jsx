import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import StatsSection from '../components/landing/StatsSection';
import ParticleBackground from '../components/ParticleBackground';

const Landing = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-brand-dark">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground />
      </div>

      {/* Existing Content (UNCHANGED) */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="min-h-screen flex flex-col bg-transparent">
          <Navbar />
          <main className="flex-grow">
            <HeroSection />
            <FeaturesSection />
            <HowItWorks />
            <StatsSection />
            {/* Testimonials section could go here */}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Landing;
