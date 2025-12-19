import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { hero, priceTrack, inventory, chef } from '../assets/images';

const HomePage = () => {
  // Create refs for scrolling
  const aboutSectionRef = useRef(null);
  const featuresSectionRef = useRef(null);

  // Function to scroll to section
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src={chef} 
                alt="GruhMate Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">GruhMate</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Home
              </a>
              <a 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(aboutSectionRef);
                }}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                About Us
              </a>
              <a 
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(featuresSectionRef);
                }}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Features
              </a>
            </nav>

            {/* Get Started & Login */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Content */}
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Smart Kitchen Management
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Track your kitchen inventory, compare prices across platforms, and never run out of essentials. 
                GruhMate makes grocery management effortless for modern families.
              </p>
              <button 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                onClick={() => scrollToSection(featuresSectionRef)}
              >
                Explore Features
              </button>
            </div>

            {/* Right Image */}
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src={hero} 
                  alt="Smart Kitchen Management" 
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section 
          ref={aboutSectionRef}
          className="py-12 md:py-20 scroll-mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              GruhMate is your intelligent kitchen companion designed to simplify grocery shopping 
              and inventory tracking for modern families. We combine price comparison with smart 
              inventory management to help you save time and money.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                Make kitchen management effortless and cost-effective for every household.
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                Transform how families manage their kitchens with smart technology.
              </p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Values</h3>
              <p className="text-gray-600">
                Simplicity, efficiency, and savings for every family we serve.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresSectionRef}
          className="py-12 md:py-20 scroll-mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how GruhMate can transform your kitchen management experience
            </p>
          </div>

          {/* Price Tracking Section */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row items-center bg-gray-50 rounded-3xl px-6 md:px-12 py-12">
              {/* Left Image */}
              <div className="md:w-2/5 mb-12 md:mb-0">
                <div className="w-full max-w-xs mx-auto">
                  <img 
                    src={priceTrack} 
                    alt="Price Tracking Dashboard" 
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                </div>
              </div>

              {/* Right Content */}
              <div className="md:w-1/2 md:pl-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Price Tracking</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Compare food prices in real-time across all major platforms like BigBasket, 
                  Swiggy Instamart, Zepto, and more. Get alerts for price drops and save money 
                  on every grocery purchase.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-blue-600">✓</span>
                    </div>
                    <span>Real-time price comparison</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-blue-600">✓</span>
                    </div>
                    <span>Price drop alerts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-blue-600">✓</span>
                    </div>
                    <span>Best deal recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Management Section */}
          <div>
            <div className="flex flex-col md:flex-row items-center">
              {/* Left Content */}
              <div className="md:w-1/2 mb-12 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Inventory Management</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Keep track of everything in your kitchen. Monitor expiry dates, track consumption 
                  patterns, and automatically generate shopping lists when items run low.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span>Expiry date tracking</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span>Family sharing & sync</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span>Smart shopping lists</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-green-600">✓</span>
                    </div>
                    <span>Waste reduction tracking</span>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="md:w-2/5 md:pl-12">
                <div className="w-full max-w-xs mx-auto">
                  <img 
                    src={inventory} 
                    alt="Inventory Management Interface" 
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-20">
            <div className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Family Sync</h3>
              <p className="text-gray-600">
                Multiple family members can update inventory in real-time. Perfect for busy households.
              </p>
            </div>
            
            
            
            <div className="p-6 border border-gray-200 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Alerts</h3>
              <p className="text-gray-600">
                Get notified about expiring items, low stock, and price drops on your favorites.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-blue-600 rounded-3xl text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Simplify Your Kitchen Management?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of families saving time and money with GruhMate
            </p>
            <Link 
              to="/signup" 
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <img 
                  src={chef} 
                  alt="GruhMate Logo" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold">GruhMate</span>
              </div>
              <p className="text-gray-400 mt-2">Smart kitchen management for modern families</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2026 GruhMate. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-2">Made with ❤️ for smarter kitchens</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage