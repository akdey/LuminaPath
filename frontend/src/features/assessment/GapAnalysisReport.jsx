import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { analyzeGaps } from '../../services/api';
import { Loader2 } from 'lucide-react';

const GapAnalysisReport = () => {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessment_id');
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assessmentId) return;

    const fetchReport = async () => {
      try {
        // Just call analyzeGaps with no answers; it will fetch the already generated report from the backend
        const data = await analyzeGaps(assessmentId);
        setReport(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to generate gap analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [assessmentId]);

  if (!assessmentId) {
    return (
      <main className="flex-1 overflow-y-auto px-gutter py-12 md:py-16">
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <h2 className="text-2xl font-bold mb-4">No Assessment Found</h2>
          <p className="text-slate-500 mb-8">Please take an assessment first to see your gap analysis.</p>
          <button onClick={() => navigate('/')} className="bg-primary text-white px-6 py-3 rounded-lg font-bold">
            Go to Roadmap
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto px-gutter py-12 md:py-16">
        <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-pulse">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-bold font-lexend mb-2">Analyzing your neural pathways...</h2>
          <p className="text-slate-500">The Digital Tutor is generating your personalized learning strategy.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto px-gutter py-12 md:py-16">
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="text-red-500 mb-4"><span className="material-symbols-outlined text-4xl">error</span></div>
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </main>
    );
  }

  const score = report?.score || 0;
  const circumference = 552.92;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  try {
    return (
    <main className="flex-1 overflow-y-auto px-gutter py-12 md:py-16">
      {/* Breadcrumbs */}
      <div className="max-w-[1000px] mx-auto w-full space-y-section-gap">
      <div className="mb-section-gap">
        <nav className="flex mb-4 text-[13px] text-slate-500 font-medium">
          <span className="hover:text-primary cursor-pointer">Assessments</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-blue-700 font-semibold">Gap Analysis Report</span>
        </nav>
        <h1 className="font-h1 text-h1 text-text-primary mb-2">Knowledge Check Results</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl">
          We've analyzed your performance. Here is your personalized path to mastery.
        </p>
      </div>

      {/* Bento Grid Layout for Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Score Summary Card */}
        <div className="lg:col-span-5 bg-white border border-border-subtle rounded-xl p-card-padding flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-slate-100" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
              <circle 
                className={score >= 7 ? "text-secondary" : score >= 4 ? "text-primary" : "text-error-gap"} 
                cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" 
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeWidth="12"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-extrabold font-h1 ${score >= 7 ? "text-secondary" : score >= 4 ? "text-primary" : "text-error-gap"}`}>
                {score}/10
              </span>
              <span className="text-sm font-label-sm text-slate-400 uppercase tracking-widest">Score</span>
            </div>
          </div>
          <h3 className="font-h3 text-h3 mb-2 text-on-background">
            {score >= 8 ? "Excellent!" : score >= 5 ? "Good effort!" : "Needs Review"}
          </h3>
          <p className="text-body-md text-text-secondary">
            {score >= 8 ? "You have a solid mastery of these concepts." : "You have a foundation, but there's room for mastery in specific areas."}
          </p>
        </div>

        {/* Topic Performance Breakdown */}
        <div className="lg:col-span-7 bg-white border border-border-subtle rounded-xl p-card-padding">
          <h3 className="font-h3 text-h3 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Performance by Topic
          </h3>
          <div className="space-y-6">
            {report?.topic_performance?.map((topic, i) => {
              const colorClass = topic.percentage >= 80 ? 'bg-secondary text-secondary' : topic.percentage >= 50 ? 'bg-primary text-primary' : 'bg-error-gap text-error-gap';
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-text-primary">{topic.topic}</span>
                    <span className={`font-bold ${colorClass.split(' ')[1]}`}>{topic.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass.split(' ')[0]}`} style={{ width: `${topic.percentage}%`, transition: 'width 1s ease-in-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      {report?.detailed_review?.length > 0 && (
        <div className="mb-section-gap">
          <h2 className="font-h2 text-h2 mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
            Detailed Review
          </h2>
          <div className="space-y-8 max-w-[800px]">
            {report.detailed_review.map((review, i) => (
              <div key={i} className="bg-white border border-border-subtle rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {review.is_correct ? (
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Correct</span>
                    ) : (
                      <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Incorrect</span>
                    )}
                    <span className="text-sm font-label-sm text-slate-400">Question {i + 1}</span>
                  </div>
                  <h4 className="font-h3 text-xl mb-6 text-on-background">{review.question}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg border ${review.is_correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className={`text-xs font-bold uppercase mb-1 ${review.is_correct ? 'text-green-600' : 'text-red-600'}`}>Your Answer</div>
                      <div className="text-on-background font-medium">{review.user_answer}</div>
                    </div>
                    {!review.is_correct && (
                      <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                        <div className="text-xs font-bold text-green-600 uppercase mb-1">Correct Answer</div>
                        <div className="text-on-background font-medium">{review.correct_answer}</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-accent-ai flex gap-4">
                    <span className="material-symbols-outlined text-accent-ai" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <div>
                      <span className="block font-bold text-accent-ai mb-1 text-sm uppercase tracking-wide">AI Insight</span>
                      <p className="text-body-md text-text-secondary italic">"{review.ai_insight}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {report?.recommendations?.length > 0 && (
        <div className="mb-section-gap">
          <h2 className="font-h2 text-h2 mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
            Bridge the Gap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {report.recommendations.map((rec, i) => {
              // extract youtube id
              let videoId = null;
              if (rec.url && rec.url.includes("youtube.com/watch?v=")) {
                videoId = rec.url.split("v=")[1].split("&")[0];
              } else if (rec.url && rec.url.includes("youtu.be/")) {
                videoId = rec.url.split("youtu.be/")[1].split("?")[0];
              }
              const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

              return (
                <div key={i} className="bg-white border border-border-subtle rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {rec.type?.includes("VIDEO") || videoId ? (
                    <img src={thumbnailUrl} alt={rec.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-slate-900 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-5xl">article</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold text-accent-ai uppercase tracking-widest mb-2 block">{rec.type || 'RECOMMENDATION'}</span>
                    <h5 className="font-bold text-text-primary mb-3">{rec.title}</h5>
                    <p className="text-sm text-text-secondary mb-4 flex-grow">{rec.description}</p>
                    {rec.url && (
                      <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline mt-auto">
                        {rec.type?.includes("VIDEO") || videoId ? 'Watch Video' : 'Read Article'} 
                        <span className="material-symbols-outlined text-sm">{rec.type?.includes("VIDEO") || videoId ? 'play_circle' : 'open_in_new'}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-12 border-t border-slate-100">
        <button onClick={() => navigate('/')} className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-md shadow-blue-200">
          <span className="material-symbols-outlined">keyboard_return</span>
          Return to Roadmap
        </button>
      </div>
      </div>
    </main>
    );
  } catch (renderError) {
    return (
      <main className="flex-1 overflow-y-auto px-gutter py-12 md:py-16">
        <div className="p-10 text-red-500">
          <h2 className="text-2xl font-bold mb-4">Render Error</h2>
          <pre className="whitespace-pre-wrap">{renderError.toString()}</pre>
          <pre className="whitespace-pre-wrap">{renderError.stack}</pre>
        </div>
      </main>
    );
  }
};

export default GapAnalysisReport;
