
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center">
          {/* Company info */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Start Your SRM Career?
            </h3>
            <p className="text-gray-600 mb-6">
              Join ManaCLG LevelUp and make a difference in students' educational journey
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-orange-50 border border-orange-200 rounded-full">
              <span className="text-orange-700 font-medium">
                ⚠️ Limited positions available • First come, first serve basis
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-500 mb-2">
              ManaCLG LevelUp © 2025. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Empowering students through innovative career opportunities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
