import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Check, 
  Send,
  Building,
  Users,
  Compass,
  Cpu
} from 'lucide-react';

const AboutPricingContact = ({ mode = 'about' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Contact Form States
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-[15%] h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[5%] h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[150px]"></div>
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
            <Link to="/about" className={`transition ${mode === 'about' ? 'text-brand-400' : 'hover:text-brand-400'}`}>About Us</Link>
            <Link to="/pricing" className={`transition ${mode === 'pricing' ? 'text-brand-400' : 'hover:text-brand-400'}`}>Pricing Plans</Link>
            <Link to="/contact" className={`transition ${mode === 'contact' ? 'text-brand-400' : 'hover:text-brand-400'}`}>Contact Support</Link>
          </nav>

          {/* Action Call */}
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'Admin' ? '/dashboard' : (user.role === 'Staff' ? '/inventory' : '/portal/customer'))}
                className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition duration-200 shadow-md flex items-center gap-1.5"
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

      {/* Main Page Area */}
      <main className="flex-grow z-10 py-16 px-6 max-w-7xl mx-auto w-full">
        {mode === 'about' && (
          <section className="space-y-16 animate-fadeIn">
            {/* Header section */}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                We Synchronize <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-400 bg-clip-text text-transparent">
                  Wholesale Logistics & Sales
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed font-medium">
                StockSync was born out of a simple need: to provide local retail chains, warehouses, and gourmet suppliers with robust databases to avoid order discrepancies, double-selling, and manual stock updates.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid gap-8 md:grid-cols-3 pt-4">
              <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10">
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-2xl w-fit mb-5">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Wholesale Ready</h3>
                <p className="text-xs text-slate-455 mt-2 leading-relaxed">
                  Engineered specifically for B2B supplier desks, bulk checkout portals, and multi-user dashboard layouts.
                </p>
              </div>

              <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl w-fit mb-5">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Transactional Accuracy</h3>
                <p className="text-xs text-slate-455 mt-2 leading-relaxed">
                  Database constraints, row locking, and status state mappings ensure warehouse logs sync in real time.
                </p>
              </div>

              <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl w-fit mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Collaborative Workspaces</h3>
                <p className="text-xs text-slate-455 mt-2 leading-relaxed">
                  Explicit Admin, Staff, and Customer routing permissions ensure team security and customer isolation.
                </p>
              </div>
            </div>

            {/* Our Story timeline */}
            <div className="glass p-8 sm:p-12 rounded-3xl border border-slate-800/60 bg-slate-900/5 mt-10">
              <h2 className="text-2xl font-bold text-slate-200 mb-8 text-center sm:text-left">Company Milestones</h2>
              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1.5 h-6 w-6 rounded-full bg-slate-950 border border-brand-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                  </div>
                  <span className="text-[10px] font-black text-brand-400 tracking-widest uppercase">2024 - Foundation</span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">First release in bread shops</h4>
                  <p className="text-xs text-slate-450 mt-1.5 max-w-3xl leading-relaxed">
                    Designed as a custom inventory logger for a single regional bakery chain, optimizing flour usage and preventing pastry double-selling.
                  </p>
                </div>

                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1.5 h-6 w-6 rounded-full bg-slate-950 border border-brand-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                  </div>
                  <span className="text-[10px] font-black text-brand-400 tracking-widest uppercase">2025 - AWS Migration</span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">Dockerized and deployed on ECS</h4>
                  <p className="text-xs text-slate-450 mt-1.5 max-w-3xl leading-relaxed">
                    Transitioned from legacy server builds into cloud containerization, incorporating automatic staging pipelines and high-availability RDS database clusters.
                  </p>
                </div>

                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1.5 h-6 w-6 rounded-full bg-slate-950 border border-brand-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                  </div>
                  <span className="text-[10px] font-black text-brand-400 tracking-widest uppercase">2026 - Platform SaaS</span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">Portal desks & checkout rollouts</h4>
                  <p className="text-xs text-slate-450 mt-1.5 max-w-3xl leading-relaxed">
                    Rolled out direct customer portal views, wishlist and cart caching, stateless password recoveries, and role-based path protections globally.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {mode === 'pricing' && (
          <section className="space-y-16 animate-fadeIn">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Pricing Plans</h1>
              <p className="text-slate-400 text-sm mt-3">Simple pricing to help B2B operators scale and sync inventory.</p>
            </div>

            {/* Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Starter */}
              <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-350">Starter</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-white">$29</span>
                    <span className="text-xs text-slate-500 ml-1">/ month</span>
                  </div>
                  <p className="text-xs text-slate-450 mt-3">Perfect for single locations and boutique suppliers.</p>
                  
                  <ul className="space-y-3 mt-6 border-t border-slate-850 pt-6">
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Up to 500 orders/month
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Unlimited SKUs & categories
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Inline stock adjustment
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Email support
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl mt-8 transition text-slate-200 block">
                  Get Started
                </Link>
              </div>

              {/* Growth Pro */}
              <div className="glass p-8 rounded-3xl border border-brand-500/50 bg-brand-500/5 shadow-brand-500/5 flex flex-col justify-between relative scale-[1.03]">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-600 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow">
                  Most Popular
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-350">Growth Pro</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-white">$79</span>
                    <span className="text-xs text-slate-500 ml-1">/ month</span>
                  </div>
                  <p className="text-xs text-slate-450 mt-3">Best for multi-location retail chains and active distributors.</p>

                  <ul className="space-y-3 mt-6 border-t border-brand-500/20 pt-6">
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Unlimited monthly orders
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Real-time stock subtraction
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Stateless recovery auth
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Recharts dashboard metrics
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Priority developer response
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="w-full text-center py-2.5 bg-brand-600 hover:bg-brand-500 text-xs font-bold rounded-xl mt-8 transition text-white block shadow-lg shadow-brand-500/20">
                  Deploy Now
                </Link>
              </div>

              {/* Enterprise */}
              <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-350">Enterprise</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-white">Custom</span>
                    <span className="text-xs text-slate-500 ml-1">/ quote</span>
                  </div>
                  <p className="text-xs text-slate-450 mt-3">High-volume distribution centers needing custom cloud setups.</p>

                  <ul className="space-y-3 mt-6 border-t border-slate-850 pt-6">
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Private AWS ECS deployments
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Dedicated RDS + Read Replicas
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      Multi-tenant custom roles
                    </li>
                    <li className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-brand-500" />
                      24/7 dedicated system engineer
                    </li>
                  </ul>
                </div>
                <Link to="/contact" className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl mt-8 transition text-slate-200 block">
                  Contact Team
                </Link>
              </div>
            </div>
          </section>
        )}

        {mode === 'contact' && (
          <section className="grid gap-12 lg:grid-cols-5 animate-fadeIn">
            {/* Info panel */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Contact Architecture</h1>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Have questions about our cloud scaling, PostgreSQL transaction levels, or integrating custom API clients? Drop us a line.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Sales & Architecture</span>
                    <span className="text-xs text-slate-300 font-medium">architecture@stocksync.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Direct Line</span>
                    <span className="text-xs text-slate-300 font-medium">+1 (555) 309-8098</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Cloud Headquarters</span>
                    <span className="text-xs text-slate-300 font-medium">Suite 404, Tech District, SF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="lg:col-span-3">
              <div className="glass p-8 rounded-3xl border border-slate-800/80 bg-slate-900/5">
                {submitted ? (
                  <div className="text-center py-10 space-y-4 animate-scaleUp">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <Check className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-200">Message Dispatched!</h3>
                    <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting StockSync. A systems architect will review your integration parameters and email you back within 2 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Elena Rostova"
                          className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="elena@breadco.com"
                          className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Bulk Ordering Integration & API Keys"
                        className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Message</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Detail your warehouse constraints, monthly dispatch count, or SLA needs..."
                        className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 focus:border-brand-500 rounded-xl text-xs text-slate-350 outline-none transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-brand-650 hover:bg-brand-500 disabled:bg-brand-850 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow shadow-brand-500/10"
                    >
                      {loading ? (
                        <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Send Systems Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Website Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-500" />
            <span className="font-bold text-slate-350">StockSync Inc.</span>
          </div>
          <p>© 2026 StockSync - B2B Inventory Solutions. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-slate-350">About</Link>
            <Link to="/pricing" className="hover:text-slate-350">Pricing</Link>
            <Link to="/contact" className="hover:text-slate-350">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPricingContact;
