import React from 'react';

const PathDisplay = ({ pathData, onStartAssessment }) => {
  if (!pathData || !pathData.steps) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">Your Personalized Roadmap</h2>
        <p className="text-cyan-400">Topic: {pathData.topic}</p>
      </div>

      <div className="relative border-l-2 border-cyan-500/30 ml-4 md:ml-0 md:pl-0">
        {pathData.steps.map((step, index) => (
          <div key={index} className="mb-10 relative md:pl-10 pl-6">
            <div className="absolute w-4 h-4 bg-cyan-400 rounded-full -left-[9px] md:-left-[9px] top-1 shadow-[0_0_10px_rgba(34,211,238,0.8)] border-2 border-slate-900"></div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <h3 className="text-xl font-bold text-white">Step {index + 1}: {step.title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {step.difficulty || 'Intermediate'}
                </span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                {step.description}
              </p>
              
              {step.resources && step.resources.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Recommended Resources</h4>
                  <ul className="space-y-2">
                    {step.resources.map((resource, idx) => (
                      <li key={idx} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 group hover:border-cyan-500/50 transition-colors">
                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <a href={resource.url || '#'} target="_blank" rel="noopener noreferrer" className="text-slate-200 group-hover:text-cyan-400 transition-colors text-sm font-medium">
                          {resource.title}
                        </a>
                        <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{resource.type || 'Article'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12 pt-8 border-t border-white/10">
        <button
          onClick={onStartAssessment}
          className="px-8 py-4 rounded-xl font-bold text-lg text-slate-900 bg-cyan-400 hover:bg-cyan-300 focus:ring-4 focus:ring-cyan-400/50 transform transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          Test Your Knowledge
        </button>
      </div>
    </div>
  );
};

export default PathDisplay;
