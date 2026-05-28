import React from 'react';

const GapAnalysisReport = ({ reportData, onRestart }) => {
  if (!reportData) return null;

  const scorePercentage = Math.round((reportData.score / reportData.totalQuestions) * 100) || 0;
  
  let scoreColor = 'text-green-400';
  if (scorePercentage < 50) scoreColor = 'text-red-400';
  else if (scorePercentage < 80) scoreColor = 'text-yellow-400';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Gap Analysis Report</h2>
        
        <div className="inline-block relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              className="text-slate-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="50"
              cx="64"
              cy="64"
            />
            <circle
              className={`${scoreColor.replace('text-', 'text-')} transition-all duration-1000 ease-out`}
              strokeWidth="10"
              strokeDasharray={50 * 2 * Math.PI}
              strokeDashoffset={50 * 2 * Math.PI - (scorePercentage / 100) * 50 * 2 * Math.PI}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="50"
              cx="64"
              cy="64"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-white">{scorePercentage}%</span>
          </div>
        </div>
        <p className="mt-4 text-slate-300 text-lg">
          You scored <span className="font-bold text-white">{reportData.score}</span> out of {reportData.totalQuestions}
        </p>
      </div>

      {reportData.weakConcepts && reportData.weakConcepts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Concepts to Review
          </h3>
          <div className="space-y-6">
            {reportData.weakConcepts.map((concept, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-xl font-semibold text-red-300 mb-2">{concept.name}</h4>
                <p className="text-slate-300 mb-4">{concept.explanation}</p>
                
                {concept.recommendedResources && (
                  <div>
                    <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Targeted Resources</h5>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {concept.recommendedResources.map((res, rIdx) => (
                        <li key={rIdx} className="bg-slate-800 rounded-lg p-3 hover:bg-slate-700 transition-colors border border-slate-700">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                            <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-sm text-cyan-100 group-hover:text-cyan-400 truncate">{res.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!reportData.weakConcepts || reportData.weakConcepts.length === 0) && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8 text-center backdrop-blur-md">
          <h3 className="text-2xl font-bold text-green-400 mb-2">Excellent Work!</h3>
          <p className="text-green-100">You have a solid grasp of these concepts. Ready for the next challenge?</p>
        </div>
      )}

      <div className="flex justify-center pt-6">
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-xl font-bold text-lg text-white bg-slate-700 hover:bg-slate-600 focus:ring-4 focus:ring-slate-500/50 transition-colors shadow-lg border border-slate-600"
        >
          Explore Another Topic
        </button>
      </div>
    </div>
  );
};

export default GapAnalysisReport;
