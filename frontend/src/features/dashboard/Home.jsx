import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Zap, ArrowRight, Clock, Layers, BrainCircuit, LineChart, BookOpen, CheckCircle } from 'lucide-react';
import { generatePath, getDashboardData } from '../../services/api';

const Home = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [dashboardData, setDashboardData] = useState({ active_roadmaps: [], weak_concepts: [] });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleGenerate = async (e, customTopic = null) => {
    if (e) e.preventDefault();
    const targetTopic = customTopic || topic;
    if (!targetTopic.trim()) return;
    setTopic(targetTopic);
    setGenerateError('');
    setLoading(true);
    try {
      const data = await generatePath(targetTopic);
      navigate(`/roadmap?id=${data.roadmap_id}`);
    } catch (err) {
      const message = err?.response?.data?.detail || 'Something went wrong. Please try again.';
      setGenerateError(message);
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-gutter py-12 md:py-16">
      <div className="max-w-[1000px] mx-auto w-full space-y-section-gap">
        {/* Search & Query Interface */}
        <section className="space-y-base text-center">
          <div className="space-y-4 mb-10">
            <h1 className="font-h1 text-h1 text-text-primary tracking-tight">What do you want to master today?</h1>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-lg mx-auto">Input a topic, skill, or academic concept and Lumina AI will architect a custom roadmap for you.</p>
          </div>

          <form onSubmit={handleGenerate} className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-primary-container/10 blur-3xl opacity-50 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
            <div className="relative flex items-center bg-white border border-border-subtle p-2 rounded-2xl shadow-xl shadow-slate-200/50 focus-within:border-primary transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-4" />
              <input 
                className="w-full border-none focus:ring-0 bg-transparent py-4 px-4 font-body-lg text-text-primary placeholder:text-slate-400" 
                placeholder="Input a topic or skill you wish to learn..." 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-primary hover:bg-primary-container text-on-primary font-bold px-8 py-4 rounded-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Wait...' : 'Generate'}
                <Zap className="w-5 h-5 fill-current" />
              </button>
            </div>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="mt-8 flex flex-col items-center gap-3 animate-pulse opacity-60">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                <div className="w-2 h-2 rounded-full bg-primary/40"></div>
              </div>
              <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Lumina AI is analyzing the curriculum...</p>
            </div>
          )}

          {/* Error Banner */}
          {generateError && !loading && (
            <div className="mt-6 max-w-2xl mx-auto flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium animate-fade-in">
              <span className="text-red-400 mt-0.5">⚠</span>
              <span>{generateError}</span>
            </div>
          )}
        </section>

        {/* Continue where you left off Carousel */}
        {!dashboardLoading && dashboardData.active_roadmaps.length > 0 && (
          <section className="space-y-4 mt-16">
            <h2 className="font-h2 text-h2 text-text-primary">Continue where you left off</h2>
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {dashboardData.active_roadmaps.map((rm) => (
                <div 
                  key={rm.id}
                  onClick={() => navigate(`/roadmap?id=${rm.id}`)}
                  className={`min-w-[280px] w-[280px] shrink-0 snap-start bg-white border-2 rounded-2xl p-6 transition-colors cursor-pointer flex flex-col shadow-sm
                    ${rm.progress_percentage === 100
                      ? 'border-green-400 hover:border-green-500'
                      : 'border-border-subtle hover:border-primary'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rm.progress_percentage === 100 ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                      {rm.progress_percentage === 100 ? <CheckCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    {rm.progress_percentage === 100 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {rm.has_completed_assessment ? '✓ Assessed' : '✓ Complete'}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-text-primary mb-1 line-clamp-2 h-10">{rm.topic_name}</h4>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden mt-4 ${rm.progress_percentage === 100 ? 'bg-green-100' : 'bg-surface-container'}`}>
                    <div className={`h-full rounded-full transition-all ${rm.progress_percentage === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${rm.progress_percentage}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${rm.progress_percentage === 100 ? 'text-green-600' : 'text-text-secondary'}`}>
                      {rm.progress_percentage}% COMPLETE
                    </p>
                    <p className="text-[10px] text-text-secondary">{rm.completed_tasks}/{rm.total_tasks} Tasks</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Paths Bento Grid */}
        <section className="space-y-8 mt-12">
          <div className="flex justify-between items-end">
            <h2 className="font-h2 text-h2 text-text-primary">Featured Paths</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Featured Card */}
            <div onClick={() => handleGenerate(null, 'React & Design Systems')} className="md:col-span-8 bg-white border border-border-subtle rounded-2xl overflow-hidden group cursor-pointer relative hover:border-primary transition-colors flex flex-col shadow-sm">
              <div className="h-48 overflow-hidden relative">
                <img alt="Web Development" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeIvA0BGtRZcYlM2rZkNkBsTit_WyVqZZWNEt868I9eo9LmCXRcgSDXTUWDy_kib0NFAfLAE_1jirhVS-SbUaU48RIcTNaMZn0WDtO718jgjtyuDaiHlrwYY_tgD42uE1PiW96xbCmWI46arOVtorl3Sa5Bm_typgZ3OxIvfBBci8yQ3UehN5vX7OLhbWpxcP1nJBcs9vvm0bzG6QS_-nkTOzwqOC94E1U2BAP9KzhsUrzzJEHr_NrCHQ7cDy6P_rxoADYAai7tdU"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Most Popular</span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-h3 text-h3 text-text-primary mb-2">React & Design Systems</h3>
                  <p className="text-text-secondary text-body-md line-clamp-2 mb-4">Master the architecture of scalable UIs using the atomic design methodology and modern React patterns.</p>
                </div>
                <div className="flex items-center gap-4 text-label-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    12 Weeks
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-4 h-4" />
                    Intermediate
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div onClick={() => handleGenerate(null, 'Deep Learning Basics')} className="flex-1 bg-white border border-border-subtle rounded-2xl p-6 hover:border-accent-ai transition-colors cursor-pointer flex flex-col justify-center shadow-sm">
                <div className="w-12 h-12 bg-accent-ai/10 rounded-xl flex items-center justify-center text-accent-ai mb-4">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-text-primary mb-1">Deep Learning Basics</h4>
                <p className="text-xs text-text-secondary">Explore the foundation of neural networks.</p>
              </div>

              <div onClick={() => handleGenerate(null, 'Quantitative Finance')} className="flex-1 bg-white border border-border-subtle rounded-2xl p-6 hover:border-secondary transition-colors cursor-pointer flex flex-col justify-center shadow-sm">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4">
                  <LineChart className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-text-primary mb-1">Quantitative Finance</h4>
                <p className="text-xs text-text-secondary">Predictive modeling and market analysis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Suggestions */}
        <section className="space-y-4 mt-16">
          <p className="text-[11px] font-bold text-text-secondary text-center uppercase tracking-[0.2em]">Suggested for your career profile</p>
          <div className="flex flex-wrap justify-center gap-3">
            {!dashboardLoading && dashboardData.weak_concepts.length > 0 ? (
              dashboardData.weak_concepts.map((concept) => (
                <button 
                  key={concept} 
                  onClick={() => handleGenerate(null, concept)}
                  className="px-6 py-2.5 rounded-full border border-border-subtle bg-white hover:bg-slate-50 text-sm text-text-primary font-semibold transition-all active:scale-95 shadow-sm"
                >
                  {concept}
                </button>
              ))
            ) : (
              ['Python for Data Science', 'Microservices Architecture', 'UX Psychology', 'Cloud Infrastructure', 'Spanish for Business'].map((placeholder) => (
                <button 
                  key={placeholder} 
                  onClick={() => handleGenerate(null, placeholder)}
                  className="px-6 py-2.5 rounded-full border border-border-subtle bg-white hover:bg-slate-50 text-sm text-text-primary font-semibold transition-all active:scale-95 shadow-sm"
                >
                  {placeholder}
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
