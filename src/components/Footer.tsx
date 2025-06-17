
import React from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-gray-900 to-gray-800 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Ready to Start Your SRM Career?
            </h3>
            <a
              href="https://t.me/ManaClg_LevelUp_Jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Join our official jobs channel
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>

          {/* Warning notice */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/20 rounded-full mb-8">
            <span className="text-yellow-300 font-medium">
              ⚠️ Limited positions available • First come, first serve basis
            </span>
          </div>

          {/* Company info */}
          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-400 mb-4">
              ManaCLG LevelUp © 2025. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Empowering students through innovative career opportunities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
