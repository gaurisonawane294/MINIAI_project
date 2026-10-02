import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <p>© 2026 MiniStore Demo. Built with MERN Stack + Vite + Tailwind CSS.</p>
        <p className="mt-1 text-xs text-slate-400">
          Clean architecture demonstration — Auth, Catalog, Cart, & Orders.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
