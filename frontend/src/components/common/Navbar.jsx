import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LayoutDashboard, LogOut } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('proofnexa_auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          setIsAuthenticated(!!(parsed && (parsed.token || parsed.accessToken)));
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('proofnexa_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-brand-light/10 rounded-lg group-hover:bg-brand-light/20 transition-colors">
              <Shield className="w-7 h-7 text-brand-light" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Proof<span className="text-brand-light">Nexa</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" className="!py-2 !px-4 text-sm flex items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth?mode=login">
                  <Button variant="ghost" className="!py-2 !px-4 text-sm">Log in</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="primary" className="!py-2 !px-6 text-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-brand-dark border-b border-white/10 transition-all duration-300 origin-top overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[400px] opacity-100 py-4 shadow-xl' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="px-4 flex flex-col space-y-2">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          
          <div className="pt-4 mt-2 border-t border-white/10 flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full flex justify-center items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex justify-center items-center space-x-2 px-4 py-3 rounded-lg font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">Log in</Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
