import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 py-16 px-[10%] border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Processorix
            </h3>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 text-sm">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
              Features
            </a>
            <a href="/?game=NEW" className="text-gray-300 hover:text-white transition-colors font-medium">
              Jetzt starten
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} Processorix</p>
            <p className="text-gray-500">Prozessvisualisierung neu gedacht</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
