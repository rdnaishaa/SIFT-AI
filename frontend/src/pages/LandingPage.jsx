import React from 'react';
import { ArrowRight, FileText, Database, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Marquee } from '../ui/marquee';
import { cn } from '../lib/utils';

const ReviewCard = ({ img, name, username, body }) => {
  return (
    <figure
      className={cn(
        "relative w-96 cursor-pointer overflow-hidden rounded-xl border p-6 mb-6",
        "border-gray-800 bg-[#393D41] hover:bg-[#393D41]/90",
        "backdrop-blur-sm shadow-lg"
      )}
    >
      <blockquote className="text-sm text-gray-300 leading-relaxed mb-4">{body}</blockquote>
      <div className="flex flex-row items-center gap-3">
        <img className="rounded-full w-10 h-10" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-gray-400">{username}</p>
        </div>
      </div>
    </figure>
  );
};

export default function LandingPage() {
  const reviews = [
  {
    name: "Risa Kurnia",
    username: "@risakur",
    body: "We managed to close two major deals last month that were previously stalled. The secret? SIFT provided the exact buying signals and key contacts. This real-time information drastically shortened our sales cycle. 'Data into Deals' is not just a slogan—it's reality.",
    img: "https://avatar.vercel.sh/risa"
  },
  {
    name: "Citra Ayu",
    username: "@cityou",
    body: "Before SIFT, my team spent hours on basic research. Now, all the AI-generated client profiles are automated and comprehensive within minutes. We've saved over 60% of our prospecting time. This isn't just an app, it's a direct shortcut to a more efficient pipeline",
    img: "https://avatar.vercel.sh/citra"
  },
  {
    name: "Maya Larasati",
    username: "@maylars",
    body: "The data SIFT generates is incredibly deep. We don't just know who our clients are, but the specific technologies they use. This tech stack insight makes our pitches 100% more relevant and allows us to hit their pain points directly. A true game-changer",
    img: "https://avatar.vercel.sh/maya"
  },
  {
    name: "Esun",
    username: "@esuuun",
    body: "SIFT allowed my marketing team to move from mass campaigns to a high level of personalization. With rich data, we can create signals and key contacts. This real-time information drastically shortened our sales cycle. Much higher response and engagement rates",
    img: "https://avatar.vercel.sh/esun"
  },
  {
    name: "Firman",
    username: "@pearman",
    body: "We use SIFT to validate and expand our target market across Indonesia. Its powerful search and filter capabilities help us pinpoint companies with the exact risk profile and budget we need. A truly valuable investment for our long-term strategy",
    img: "https://avatar.vercel.sh/firman"
  },
  {
    name: "Santi Dewi",
    username: "@sntidw",
    body: "SIFT's interface is so clean and intuitive. All the AI-generated client profiles are automated and comprehensive within minutes. Everything I need is right on the dashboard.",
    img: "https://avatar.vercel.sh/santi"
  }];

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Gradient */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Gradient Image */}
        <div className="absolute inset-0 bg-[#1a2332]">
          <img 
            src="/src/assets/gradient.png" 
            alt="background" 
            className="w-full h-full object-fill  opacity-100"
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex justify-between items-center px-8 py-6">
          <img src='/SIFT no BG.png' alt="SIFT Logo" className='h-20'/>
          <div className="flex gap-8 text-xl items-center">
            <a href="#about" className="text-white hover:text-[#73B2FF] transition">About</a>
            <a href="#features" className="text-white hover:text-[#73B2FF] transition">Features</a>
            <a href="#contact" className="text-white hover:text-[#73B2FF] transition">Contact</a>
            <button 
              onClick={handleLoginClick}
              className="bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 container mx-auto px-8  pb-32 text-center flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="max-w-4xl">
            <h1 className="text-7xl font-bold mb-3 tracking-tight text-white">
              The Easiest Way<br />
              to Turn Data<br />
              into Deals.
            </h1>
            <p className="text-gray-300 text-lg mb-3 mx-auto max-w-xl">
              Stop doing manual research. SIFT leverages agentic AI to instantly generate rich, actionable client profiles—turning hours of work into personalized sales strategies
            </p>
            <button 
              onClick={handleLoginClick}
              className="bg-white hover:bg-[#73B2FF] text-black hover:text-white px-8 py-3 rounded-lg inline-flex items-center gap-2 transition"
            >
              Start Now! <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="bg-[#1B201A] container mx-auto px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Everything You Need to Close Deals Faster
        </h2>
        <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
          The SIFT platform eliminates manual research and delivers the precise intelligence your sales team needs to personalize pitches and accelerate client acquisition
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#393D41] border border-gray-800 p-8 rounded-xl shadow-lg">
            <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <FileText size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Automate Insight Generation</h3>
            <p className="text-gray-400 leading-relaxed">
              Instantly generate comprehensive client profiles powered by an Agentic AI. Get deep insights into tech stacks, buying signals, and recent activities.
            </p>
          </div>

          <div className="bg-[#393D41] border border-gray-800 p-8 rounded-xl shadow-lg">
            <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Database size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Unified Prospect Dashboard</h3>
            <p className="text-gray-400 leading-relaxed">
              Manage all your high-potential leads in one central hub. Utilize powerful Search and Filter tools to quickly organize, track, and bookmark your most valuable prospects.
            </p>
          </div>

          <div className="bg-[#393D41] border border-gray-800 p-8 rounded-xl shadow-lg">
            <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Secure data & Access</h3>
            <p className="text-gray-400 leading-relaxed">
              Ensure that all your sensitive client data and competitive intelligence remain protected. SIFT provides secure User Authentication and keeps your saved profiles private.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-transparent border border-gray-700 hover:border-[#73B2FF] hover:text-[#73B2FF] px-8 py-3 rounded-lg transition duration-300">
            View Demo
          </button> 
        </div>
      </section>

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
      
                <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden">
                  <div className="flex gap-4">
                    <Marquee pauseOnHover vertical className="[--duration:20s]">
                      {reviews.slice(0, 3).map((review) => (
                        <ReviewCard key={review.username} {...review} />
                      ))}
                    </Marquee>
                    <Marquee reverse pauseOnHover vertical className="[--duration:20s]">
                      {reviews.slice(3).map((review) => (
                        <ReviewCard key={review.username} {...review} />
                      ))}
                    </Marquee>
                  </div>
      
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-[#1B201A]"></div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-[#1B201A]"></div>
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