import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-6">
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Content */}
        <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                  ⚙️
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Processorix
                </h3>
              </div>
              <p className="text-gray-400 text-center md:text-left">Prozessvisualisierung neu gedacht</p>
            </div>

            {/* Links */}
            <div className="flex flex-col md:flex-row gap-6">
              <a href="#features" className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-center">
                Features
              </a>
              <a href="/?game=NEW" className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-purple-400/50 transition-all text-center">
                Jetzt starten 🚀
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">© {currentYear} Processorix. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
