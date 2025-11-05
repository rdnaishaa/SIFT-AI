import React from 'react';
import { ArrowRight, FileText, Database, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-b from-[#1B201A] via-[#73B2FF] to-[#1B201A]">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6">
        <img src='public\SIFT no BG.png' className='h-20'/>
        <div className="flex gap-8 text-xl items-center">
          <a href="#" className="hover:text-blue-400 transition">About</a>
          <a href="#" className="hover:text-blue-400 transition">Features</a>
          <a href="#" className="hover:text-blue-400 transition">Contact</a>
          <button 
            onClick={handleLoginClick}
            className="bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-8 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          The Easiest Way<br />
          to Turn Data<br />
          into Deals.
        </h1>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Stop doing manual research. SIFT leverages agentic AI to instantly generate rich, actionable client profiles—turning hours of work into personalized sales strategies
        </p>
        <button 
          onClick={handleLoginClick}
          className="bg-white hover:bg-[#73B2FF] text-black hover:text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto transition border border-gray-300"
        >
          Get Started <ArrowRight size={20} />
        </button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Everything You Need to Close Deals Faster
        </h2>
        <p className="text-center text-gray-300 mb-12">
          The SIFT platform eliminates manual research and delivers the precise intelligence your sales team needs to personalize pitches and accelerate client acquisition
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#1B201A]/80 backdrop-blur p-8 rounded-xl hover:bg-[#1B201A]/90 transition">
            <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-4">Automate Insight Generation</h3>
            <p className="text-gray-400">
              Instantly generate comprehensive client profiles powered by an Agentic AI. Get deep insights into tech stacks, buying signals, and recent activities.
            </p>
          </div>

          <div className="bg-[#1B201A]/80 backdrop-blur p-8 rounded-xl hover:bg-[#1B201A]/90 transition">
            <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <Database size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-4">Unified Prospect Dashboard</h3>
            <p className="text-gray-400">
              Manage all your high-potential leads in one central hub. Utilize powerful Search and Filter tools to quickly organize, track, and bookmark your most valuable prospects.
            </p>
          </div>

          <div className="bg-[#1B201A]/80 backdrop-blur p-8 rounded-xl hover:bg-[#1B201A]/90 transition">
            <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-4">Secure data & Access</h3>
            <p className="text-gray-400">
              Ensure that all your sensitive client data and competitive intelligence remain protected. SIFT provides secure User Authentication and keeps your saved profiles private.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="border border-gray-600 hover:border-gray-400 px-6 py-2 rounded-lg transition">
            View Demo
          </button>
        </div>
      </section>
      </div>

      {/* Find Client Section - Black Background */}
      <section className="bg-[#1B201A] py-20">
        <div className="container mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#73B2FF]">
          Find Your Next Client in Seconds.
        </h2>
        
        <div className="flex items-center justify-center gap-12">
          <div className="bg-gray-800/50 backdrop-blur p-8 rounded-xl max-w-md">
            <div className="bg-gray-900 p-4 rounded-lg">
             
              <img src="public\inputCompany.png" alt="Dashboard Screenshot" className="rounded-lg" />
              <div className='fixed translate-x-20 translate-y-10'>
              <img src="src\assets\arrow.svg" alt="Arrow" className="rounded-lg" />
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <div className="bg-[#73B2FF] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-2xl font-bold mb-4">Input the Company</h3>
            <p className="text-gray-300">
              Simply input the name of any potential client
              company & prospects it on-demand. Our system
              processes thousands of data points—from recent
              news, financials, competitors, tech stacks—to
              give instant in-person, eliminating hours of manual
              research.
            </p>
          </div>
        </div>

        <div className="text-center mt-32">
          <button className="border border-gray-600 hover:border-gray-400 px-6 py-2 rounded-lg transition">
            See More
          </button>
        </div>
        </div>
      </section>

      {/* Testimonials Section - Black Background */}
      <section className="bg-[#1B201A] py-20">
        <div className="container mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-16 text-[#73B2FF]">
          Don't Take Our Word for It
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white text-gray-900 p-6 rounded-xl">
              <p className="mb-4 text-sm">
                "SIFT has been a game changer for our sales team. 
                We're able to research prospects way faster and 
                close deals in half the time. The AI-powered insights 
                are spot on, and the interface is super easy to use. 
                Highly recommend for any sales team."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#73B2FF] rounded-full"></div>
                <div>
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-gray-600">Sales Director</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* CTA Section - Black Background */}
      <section className="relative bg-[#1B201A] py-32 overflow-hidden">
        {/* Gradient Overlay from Right */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#73B2FF]/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Transform</h2>
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Your Prospecting.</h2>

       <div className="flex flex-col  justify-baseline w-full mb-12">
        <div className="text-5xl md:text-6xl font-bold mb-6">
          Try
        </div>
          <img src='/SIFT no BG.png' alt='SIFT Logo' className='h-24 md:h-28 mx-auto' />
           <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">User Profiling Agents.AI</p>
          </div>

       {/* Tombol CTA */}
       <button 
        onClick={handleLoginClick}
        className="bg-[#73B2FF] hover:bg-[#5A9DE6] px-10 py-4 rounded-lg flex items-center gap-2 mx-auto text-lg transition text-white"
       >
        Start Now! <ArrowRight size={24} />
       </button>

       </div>
    </section>

      {/* Footer - Black Background */}
      <footer className="bg-[#1B201A] border-t border-gray-800 py-12">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src='public\SIFT no BG.png' className='h-16'/>
              <p className="text-sm text-gray-400">
                © 2025 Company, Inc.<br />
                Under Company Pty.<br />
                All rights reserved
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4 text-gray-400">
            <a href="#" className="hover:text-white">X</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">GitHub</a>
            <a href="#" className="hover:text-white">YouTube</a>
            <a href="#" className="hover:text-white">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}