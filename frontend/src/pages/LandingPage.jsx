import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  FileText,
  Database,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Marquee } from "../ui/marquee";
import { cn } from "../lib/utils";
import GlareHover from "../ui/GlareHover";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const ReviewCard = ({ img, name, username, body }) => {
  return (
    <figure
      className={cn(
        "relative w-full max-w-[350px] md:w-96 cursor-pointer overflow-hidden rounded-xl border p-6 mb-6 mx-auto",
        "border-gray-800 bg-[#393D41] hover:bg-[#393D41]/90",
        "backdrop-blur-sm shadow-lg"
      )}
    >
      <blockquote className="text-sm text-gray-300 leading-relaxed mb-4">
        {body}
      </blockquote>
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Input the Company",
      description:
        "Simply input the name of any potential client company & prospects it on-demand. Our system processes thousands of data points—from recent news, financials, competitors, tech stacks—to give instant in-person, eliminating hours of manual research.",
      image: "/inputCompany.png",
      showArrow: true,
    },
    {
      number: 2,
      title: "Get your profile",
      description:
        "Instantly access a detailed, AI-generated profile of your target company. View key decision-makers, technology stacks, recent news, and financial data all in one place. Make data-driven decisions without the manual legwork.",
      image: "/GetYourProfiling.png",
      showArrow: false,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const reviews = [
    {
      name: "Risa Kurnia",
      username: "@risakur",
      body: "We managed to close two major deals last month that were previously stalled. The secret? SIFT provided the exact buying signals and key contacts. This real-time information drastically shortened our sales cycle. 'Data into Deals' is not just a slogan—it's reality.",
      img: "https://avatar.vercel.sh/risa",
    },
    {
      name: "Citra Ayu",
      username: "@cityou",
      body: "Before SIFT, my team spent hours on basic research. Now, all the AI-generated client profiles are automated and comprehensive within minutes. We've saved over 60% of our prospecting time. This isn't just an app, it's a direct shortcut to a more efficient pipeline",
      img: "https://avatar.vercel.sh/citra",
    },
    {
      name: "Maya Larasati",
      username: "@maylars",
      body: "The data SIFT generates is incredibly deep. We don't just know who our clients are, but the specific technologies they use. This tech stack insight makes our pitches 100% more relevant and allows us to hit their pain points directly. A true game-changer",
      img: "https://avatar.vercel.sh/maya",
    },
    {
      name: "Esun",
      username: "@esuuun",
      body: "SIFT allowed my marketing team to move from mass campaigns to a high level of personalization. With rich data, we can create signals and key contacts. This real-time information drastically shortened our sales cycle. Much higher response and engagement rates",
      img: "https://avatar.vercel.sh/esun",
    },
    {
      name: "Firman",
      username: "@pearman",
      body: "We use SIFT to validate and expand our target market across Indonesia. Its powerful search and filter capabilities help us pinpoint companies with the exact risk profile and budget we need. A truly valuable investment for our long-term strategy",
      img: "https://avatar.vercel.sh/firman",
    },
    {
      name: "Santi Dewi",
      username: "@sntidw",
      body: "SIFT's interface is so clean and intuitive. All the AI-generated client profiles are automated and comprehensive within minutes. Everything I need is right on the dashboard.",
      img: "https://avatar.vercel.sh/santi",
    },
  ];

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Gradient */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Gradient Image */}
        <div className="absolute inset-0 bg-[#1a2332]">
          <img
            src="gradient.png"
            alt="background"
            className="w-full h-full object-fill  opacity-100"
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-20 flex justify-between items-center px-4 md:px-8 py-6">
          <img src="/SIFT no BG.png" alt="SIFT Logo" className="h-12 md:h-20" />

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-base items-center">
            <a
              href="#about"
              className="text-white hover:text-[#73B2FF] transition"
            >
              About
            </a>
            <a
              href="#features"
              className="text-white hover:text-[#73B2FF] transition"
            >
              Features
            </a>
            <a
              href="#contact"
              className="text-white hover:text-[#73B2FF] transition"
            >
              Contact
            </a>
            <button
              onClick={handleLoginClick}
              className="bg-white text-gray-900 px-6 py-2 rounded-lg hover:bg-[#73B2FF] hover:text-white transition"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 right-0 z-20 bg-[#1a2332] border-b border-gray-800 p-4 md:hidden shadow-xl"
            >
              <div className="flex flex-col gap-4">
                <a
                  href="#about"
                  className="text-white hover:text-[#73B2FF] transition py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#features"
                  className="text-white hover:text-[#73B2FF] transition py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#contact"
                  className="text-white hover:text-[#73B2FF] transition py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <button
                  onClick={() => {
                    handleLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-[#73B2FF] hover:text-white transition w-full font-medium"
                >
                  Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative z-10 container mx-auto px-4 md:px-8 pb-20 md:pb-32 text-center flex items-center justify-center min-h-[calc(100vh-120px)]">
          <motion.div
            className="max-w-4xl w-full"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="relative">
              {/* Decorative Shapes Container - Hidden on mobile for cleaner look */}
              <motion.div
                className="absolute inset-0 w-full hidden md:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {/* Triangle SVG on the right */}
                <div className="absolute -right-20 -top-20 z-0">
                  <GlareHover
                    width="200px"
                    height="200px"
                    background="transparent"
                    borderRadius="0"
                    borderColor="transparent"
                    glareColor="#73B2FF"
                    glareOpacity={0.3}
                    glareAngle={-30}
                    glareSize={300}
                    transitionDuration={800}
                  >
                    <img
                      src="triangle.svg"
                      alt="decorative"
                      className="w-full h-full opacity-50"
                    />
                  </GlareHover>
                </div>

                {/* Equal SVG on the left */}
                <div className="absolute -left-32 -top-16 z-0">
                  <GlareHover
                    width="180px"
                    height="180px"
                    background="transparent"
                    borderRadius="0"
                    borderColor="transparent"
                    glareColor="#73B2FF"
                    glareOpacity={0.3}
                    glareAngle={30}
                    glareSize={300}
                    transitionDuration={800}
                  >
                    <img
                      src="equal.svg"
                      alt="decorative"
                      className="w-full h-full opacity-50"
                    />
                  </GlareHover>
                </div>
              </motion.div>

              <div className="max-w-4xl mx-auto">
                <motion.h1
                  className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight text-white"
                  variants={fadeInUp}
                >
                  The Easiest Way
                  <br />
                  to Turn Data
                  <br />
                  into Deals.
                </motion.h1>
                <motion.p
                  className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 mx-auto max-w-xl px-4"
                  variants={fadeInUp}
                >
                  Stop doing manual research. SIFT leverages agentic AI to
                  instantly generate rich, actionable client profiles—turning
                  hours of work into personalized sales strategies
                </motion.p>
                <motion.button
                  onClick={handleLoginClick}
                  className="bg-white hover:bg-[#73B2FF] text-black hover:text-white px-6 md:px-8 py-3 rounded-lg inline-flex items-center gap-2 transition relative text-sm md:text-base"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Now! <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Features Section */}
      <section className="bg-[#1B201A] container mx-auto px-4 md:px-8 py-16 md:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16"
            variants={fadeInUp}
          >
            Everything You Need to Close Deals Faster
          </motion.h2>
          <motion.p
            className="text-center text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto text-sm md:text-base"
            variants={fadeInUp}
          >
            The SIFT platform eliminates manual research and delivers the
            precise intelligence your sales team needs to personalize pitches
            and accelerate client acquisition
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              className="bg-[#393D41] border border-gray-800 p-6 md:p-8 rounded-xl shadow-lg"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FileText size={32} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Automate Insight Generation
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                Instantly generate comprehensive client profiles powered by an
                Agentic AI. Get deep insights into tech stacks, buying signals,
                and recent activities.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#393D41] border border-gray-800 p-6 md:p-8 rounded-xl shadow-lg"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Database size={32} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Unified Prospect Dashboard
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                Manage all your high-potential leads in one central hub. Utilize
                powerful Search and Filter tools to quickly organize, track, and
                bookmark your most valuable prospects.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#393D41] border border-gray-800 p-6 md:p-8 rounded-xl shadow-lg"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="bg-[#CE3381] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Secure data & Access
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                Ensure that all your sensitive client data and competitive
                intelligence remain protected. SIFT provides secure User
                Authentication and keeps your saved profiles private.
              </p>
            </motion.div>
          </div>

          <motion.div className="text-center mt-8 md:mt-12" variants={fadeInUp}>
            <button className="bg-transparent border border-gray-700 hover:border-[#73B2FF] hover:text-[#73B2FF] px-6 md:px-8 py-3 rounded-lg transition duration-300 text-sm md:text-base">
              View Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Find Client Section - Black Background */}
      <section className="bg-[#1B201A] py-16 md:py-20">
        <motion.div
          className="container mx-auto px-4 md:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-[#73B2FF]"
            variants={fadeInUp}
          >
            Find Your Next Client in Seconds.
          </motion.h2>

          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 min-h-[400px]"
            variants={fadeInUp}
          >
            <div className="bg-gray-800/50 backdrop-blur p-2 rounded-xl max-w-2xl w-full transition-all duration-500 ease-in-out">
              <div className="bg-gray-900 rounded-lg relative aspect-video md:aspect-auto">
                <img
                  src={steps[currentStep].image}
                  alt="Dashboard Screenshot"
                  className="rounded-lg w-full h-full object-cover"
                />
                {steps[currentStep].showArrow && (
                  <div className="absolute bottom-0 right-0 translate-x-4 md:translate-x-10 translate-y-12 md:translate-y-24 z-10 hidden md:block">
                    <img src="arrow.svg" alt="Arrow" className="rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            <div className="max-w-md w-full transition-all duration-500 ease-in-out">
              <div className="bg-[#73B2FF] w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                {steps[currentStep].number}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {steps[currentStep].description}
              </p>

              {/* Carousel Indicators */}
              <div className="flex gap-2 mt-6 md:mt-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentStep === index
                        ? "w-8 bg-[#73B2FF]"
                        : "w-2 bg-gray-600"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-16 md:mt-32"
            variants={fadeInUp}
          >
            <button className="border border-gray-600 hover:border-gray-400 px-6 py-2 rounded-lg transition text-sm md:text-base">
              See More
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section - Black Background */}
      <section className="bg-[#1B201A] py-16 md:py-20">
        <motion.div
          className="container mx-auto px-4 md:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-[#73B2FF]"
            variants={fadeInUp}
          >
            Don't Take Our Word for It
          </motion.h2>

          <motion.div
            className="relative flex h-[400px] md:h-[500px] w-full flex-row items-center justify-center overflow-hidden"
            variants={fadeInUp}
          >
            <div className="flex gap-4">
              <Marquee pauseOnHover vertical className="[--duration:20s]">
                {reviews.slice(0, 3).map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
              <Marquee
                reverse
                pauseOnHover
                vertical
                className="[--duration:20s]"
              >
                {reviews.slice(3).map((review) => (
                  <ReviewCard key={review.username} {...review} />
                ))}
              </Marquee>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-[#1B201A]"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-[#1B201A]"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section - Black Background */}
      <section className="relative bg-[#1B201A] py-20 md:py-32 overflow-hidden">
        {/* Gradient Overlay from Right */}
        <div className="absolute inset-0 bg-linear-to-l from-[#73B2FF]/20 via-transparent to-transparent"></div>
        <motion.div
          className="container mx-auto px-4 md:px-8 text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-2 md:mb-4"
            variants={fadeInUp}
          >
            Transform
          </motion.h2>
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6 md:mb-8"
            variants={fadeInUp}
          >
            Your Prospecting.
          </motion.h2>

          <motion.div
            className="flex flex-col justify-baseline w-full mb-8 md:mb-12"
            variants={fadeInUp}
          >
            <div className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
              Try
            </div>
            <img
              src="/SIFT no BG.png"
              alt="SIFT Logo"
              className="h-20 md:h-28 mx-auto"
            />
            <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">
              User Profiling Agents.AI
            </p>
          </motion.div>

          <motion.button
            onClick={handleLoginClick}
            className="bg-[#73B2FF] hover:bg-[#5A9DE6] px-8 md:px-10 py-3 md:py-4 rounded-lg flex items-center gap-2 mx-auto text-base md:text-lg transition text-white"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Now! <ArrowRight size={24} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer - Black Background */}
      <footer className="bg-[#1B201A] border-t border-gray-800 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="public\SIFT no BG.png" className="h-12 md:h-16 mb-4" />
              <p className="text-sm text-gray-400">
                © 2025 Company, Inc.
                <br />
                Under Company Pty.
                <br />
                All rights reserved
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4 text-gray-400">
            <a href="#" className="hover:text-white">
              X
            </a>
            <a href="#" className="hover:text-white">
              LinkedIn
            </a>
            <a href="#" className="hover:text-white">
              GitHub
            </a>
            <a href="#" className="hover:text-white">
              YouTube
            </a>
            <a href="#" className="hover:text-white">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
