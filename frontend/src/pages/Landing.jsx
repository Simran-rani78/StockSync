import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  Minus,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Accordion FAQ states
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the real-time stock subtraction work?",
      a: "Every time a customer places an order at checkout, our backend database runs a transaction that immediately deducts the quantity from the warehouse inventory. If stock falls below your threshold, low stock alarms trigger instantly."
    },
    {
      q: "Is there a limit to the number of SKUs I can add?",
      a: "No! Even on our Starter Plan, you can catalog unlimited SKUs and Categories. The plans scale based on monthly order volumes and advanced analytics requirements."
    },
    {
      q: "Can I host this on my own AWS cloud infrastructure?",
      a: "Yes! StockSync is containerized via Docker and comes with pre-configured buildspec.yml files for AWS CodePipeline and CodeBuild, allowing automated deployments to ECS Fargate and RDS."
    },
    {
      q: "What is the difference between Admin and Staff roles?",
      a: "Admins have full ownership: they can edit pricing, delete products, manage users, and view financial stats. Staff members are restricted to operational tasks: placing orders, editing order statuses, and logging stock adjustments."
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "month",
      desc: "Perfect for single-location shops and local bakeries.",
      features: ["Up to 500 orders/month", "Unlimited SKUs & Categories", "Inline Stock Adjuster", "Email Support"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Growth Pro",
      price: "$79",
      period: "month",
      desc: "For growing retail chains and multi-location stores.",
      features: ["Unlimited orders", "Real-time stock subtraction", "Stateless Password Recovery", "Analytics Dashboard", "Priority Support"],
      cta: "Deploy Now",
      popular: true
    },
    {
      name: "Enterprise Cloud",
      price: "Custom",
      period: "quote",
      desc: "Dockerized cloud deployments for large distributors.",
      features: ["Private AWS ECS Cluster", "Route53 + CloudFront CDN CDN Setup", "Dedicated RDS Database", "SLA & 24/7 Phone Support"],
      cta: "Contact Architecture Team",
      popular: false
    }
  ];

  const testimonials = [
    {
      quote: "StockSync completely solved our double-selling issues. Before, we would accept orders online for items that were out of stock in our bakery. Now, the transaction system blocks it automatically.",
      author: "Elena Rostova",
      role: "Founder, Bread & Butter Co."
    },
    {
      quote: "The AWS ECS cloud deployment was a breeze. We pushed the Docker images, mapped our Route53 domain, and had a load-balanced, high-availability system running in hours.",
      author: "Marcus Chen",
      role: "CTO, ElectroMax Distributors"
    },
    {
      quote: "Our warehouse crew uses the inline quantity adjusters on their tablets every day. It keeps our inventory registry perfectly synced without forcing them to log into the main office computer.",
      author: "Sarah Jenkins",
      role: "Operations Manager, HikeOut Retail"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-[10%] h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[5%] h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[150px]"></div>
      </div>

      {/* Floating Website Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              StockSync
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <Link to="/catalog" className="hover:text-brand-400 transition">Catalog Explorer</Link>
            <Link to="/about" className="hover:text-brand-400 transition">About Us</Link>
            <Link to="/pricing" className="hover:text-brand-400 transition">Pricing Plans</Link>
            <Link to="/contact" className="hover:text-brand-400 transition">Contact Support</Link>
          </nav>

          {/* Call to action */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => navigate(user.role === 'Admin' ? '/dashboard' : (user.role === 'Staff' ? '/inventory' : '/portal/customer'))}
                className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-md shadow-brand-500/20 flex items-center gap-1.5"
              >
                Go to Portal
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-6 animate-pulse">
          <ShieldCheck className="h-3.5 w-3.5" />
          Enterprise Grade B2B Cloud Platform
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Automate Your Inventory, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-400 bg-clip-text text-transparent">
            Streamline Your Sales Dispatch
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-6 max-w-2xl mx-auto font-medium leading-relaxed">
          The ultimate SaaS solution for bakeries, electronics stores, and retail wholesalers to synchronize stock levels, prevent double-selling, and automate orders.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto py-3.5 px-6 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition duration-200 shadow-xl shadow-brand-500/10 flex items-center justify-center gap-2 group"
          >
            Deploy StockSync Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/catalog"
            className="w-full sm:w-auto py-3.5 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2"
          >
            Explore Public Catalog
          </Link>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Full-Stack Operational Safeguards</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Engineered to eliminate stock sync delays and secure supply logs.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10 flex flex-col items-start hover:border-slate-700 transition duration-300">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-2xl mb-5">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Pessimistic Row Locks</h3>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              When checkouts occur, SQL transactions lock stock items to prevent double-selling on simultaneous purchases.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10 flex flex-col items-start hover:border-slate-700 transition duration-300">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl mb-5">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Price Snapshots</h3>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              B2B pricing fluctuates. StockSync locks the sales price at the second of checkout, securing financial audit trails.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10 flex flex-col items-start hover:border-slate-700 transition duration-300">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Time-Series Analytics</h3>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Consolidated sales and order telemetry grouped chronologically to feed live Recharts dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SAAS PRICING TABLE */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Transparent SaaS Pricing</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Pick a plan that fits your business scale. No hidden fees.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`glass p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-2xl relative ${
                plan.popular 
                  ? 'border-brand-500/50 bg-brand-500/5 shadow-brand-500/5' 
                  : 'border-slate-800/80 bg-slate-900/10'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-200">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-2">{plan.desc}</p>
                <div className="my-6 flex items-baseline">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 ml-1">/ {plan.period}</span>
                </div>
                <ul className="space-y-3.5 border-t border-slate-800/60 pt-6">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <CheckCircle className="h-4.5 w-4.5 text-brand-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={user ? (user.role === 'Admin' ? '/dashboard' : (user.role === 'Staff' ? '/inventory' : '/portal/customer')) : '/register'}
                className={`w-full py-3 text-center text-xs font-bold rounded-xl mt-8 transition duration-200 block ${
                  plan.popular
                    ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Loved by Small Businesses</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">See how StockSync helps local operators manage wholesale supply chains.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/5 relative flex flex-col justify-between">
              <MessageSquare className="absolute right-6 top-6 h-8 w-8 text-slate-800/40" />
              <p className="text-xs text-slate-300 leading-relaxed italic">"{test.quote}"</p>
              <div className="mt-6 pt-4 border-t border-slate-800/40">
                <h4 className="text-xs font-bold text-slate-200">{test.author}</h4>
                <span className="text-[10px] text-slate-500 block font-semibold mt-0.5">{test.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-900/60 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
            <HelpCircle className="h-6.5 w-6.5 text-brand-500" />
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Got questions? We have answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="glass rounded-2xl border border-slate-800/80 bg-slate-900/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-200">{faq.q}</span>
                  <span className={`h-5 w-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 transition-transform duration-305 ${isOpen ? 'rotate-180 text-brand-400' : ''}`}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-4 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="max-w-7xl mx-auto px-6 py-16 mb-16 text-center z-10 relative">
        <div className="glass p-8 sm:p-12 rounded-3xl border border-brand-500/10 bg-gradient-to-tr from-brand-600/10 to-slate-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/5 blur-[80px] pointer-events-none"></div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Ready to Sync Your Inventory?</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-4 max-w-xl mx-auto">
            Get started in 5 minutes. Seed a database, run a test checkout, and build your own B2B digital sales desk.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="py-3 px-6 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-lg shadow-brand-500/10 flex items-center gap-1.5"
            >
              Get Started for Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Website Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-500" />
            <span className="font-bold text-slate-350">StockSync Inc.</span>
          </div>
          <p>© 2026 StockSync - B2B Inventory Solutions. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-slate-300">About</Link>
            <Link to="/pricing" className="hover:text-slate-300">Pricing</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Minor Chevron Right icon locally since it is handy
const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export default Landing;
