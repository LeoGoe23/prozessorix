import React from 'react';

const TopBar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      <div className="w-full px-[10%] py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Processorix
            </h1>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Features
            </a>
            <a 
              href="/?game=NEW" 
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300"
            >
              Spiel starten 🎮
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <a 
              href="/?game=NEW" 
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-full"
            >
              Start 🎮
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
