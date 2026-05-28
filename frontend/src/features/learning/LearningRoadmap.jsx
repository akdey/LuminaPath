import React, { useEffect, useState } from 'react';
import { ChevronRight, Check, PlayCircle, CheckCircle, BookOpen, Terminal, Lock, Sparkles, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getPath, completeTask, getDashboardData } from '../../services/api';

const LearningRoadmap = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [hasExistingAssessment, setHasExistingAssessment] = useState(false);

  useEffect(() => {
    if (id) {
      getPath(id)
        .then(data => {
          setRoadmap(data);
          if (data.tasks) {
            const completedCount = data.tasks.filter(t => t.completed_at).length;
            setCompletedTasks(completedCount);
          }
          setLoading(false);
          // Check if all tasks done, and if so fetch dashboard to check assessment status
          if (data.tasks && data.tasks.filter(t => t.completed_at).length >= data.tasks.length) {
            getDashboardData().then(dash => {
              const rm = dash.active_roadmaps.find(r => r.id === id);
              if (rm) setHasExistingAssessment(rm.has_completed_assessment);
            }).catch(() => {});
          }
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      // If no ID, fetch all roadmaps so user can pick one
      getDashboardData().then(data => {
        setUserRoadmaps(data.active_roadmaps || []);
        setLoading(false);
      }).catch(err => {
         console.error(err);
         setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-12 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </main>
    );
  }

  if (!roadmap && id) {
    return (
      <main className="flex-1 p-6 md:p-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="font-h2 text-h2 text-text-primary mb-4">Roadmap Not Found</h2>
          <p className="text-text-secondary mb-6">Could not find a learning path with that ID.</p>
          <Link to="/" className="text-primary hover:underline font-bold">Return Home</Link>
        </div>
      </main>
    );
  }

  if (!id) {
    const activeRoadmaps = userRoadmaps.filter(rm => rm.progress_percentage < 100);
    
    return (
      <main className="flex-1 p-6 md:p-12 max-w-[1200px] mx-auto pb-24">
        <h1 className="font-h1 text-h1 text-text-primary mb-2">Select a Learning Path</h1>
        <p className="text-body-lg text-text-secondary max-w-[600px] mb-8">Choose one of your active courses to continue your journey.</p>
        
        {activeRoadmaps.length === 0 ? (
           <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
             <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-text-primary mb-2">No active roadmaps</h3>
             <p className="text-text-secondary mb-4">You don't have any courses currently in the learning phase.</p>
             <Link to="/" className="bg-primary text-white px-6 py-2 rounded-xl inline-block font-bold">Start Learning</Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeRoadmaps.map((rm) => (
              <div 
                key={rm.id}
                onClick={() => navigate(`/roadmap?id=${rm.id}`)}
                className="bg-white border border-border-subtle rounded-2xl p-6 hover:border-primary transition-colors cursor-pointer flex flex-col shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-text-primary mb-2">{rm.topic_name}</h4>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-auto mb-2">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${rm.progress_percentage}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-text-secondary">
                  <span className="font-bold text-primary">{rm.progress_percentage}% COMPLETE</span>
                  <span>{rm.completed_tasks}/{rm.total_tasks} Tasks</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-12 max-w-[1200px] mx-auto pb-24">
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="flex items-center space-x-2 text-text-secondary font-label-sm mb-4">
              <span>Path</span>
              <ChevronRight className="w-4 h-4" />
              <span>{roadmap.topic_name}</span>
            </nav>
            <h1 className="font-h1 text-h1 text-text-primary mb-2">Learning Roadmap: {roadmap.topic_name}</h1>
            <p className="text-body-lg text-text-secondary max-w-[600px]">Your AI-generated personalized structured mastery path.</p>
          </div>
          {(() => {
        const progressPercentage = roadmap?.tasks ? Math.round((completedTasks / roadmap.tasks.length) * 100) : 0;
        return (
          <div className="bg-surface-card p-6 border border-border-subtle rounded-xl min-w-[240px]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-sm text-text-secondary">COURSE PROGRESS</span>
              <span className="font-h3 text-primary">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        );
      })()}
        </div>
      </section>

      {/* Roadmap Visualization */}
      <section className="relative roadmap-spine pb-12 pl-5 md:pl-0">
        
        {roadmap.tasks && roadmap.tasks.map((task, index) => {
          const isActive = index === completedTasks;
          const isCompleted = index < completedTasks;
          const isLocked = index > completedTasks;
          
          return (
            <div key={task.id} className={`relative pl-12 mb-12 ${isLocked ? 'opacity-80' : ''}`}>
              <div className={`absolute left-[-4px] md:left-[12px] top-2 w-4 h-4 rounded-full z-10 ${isActive ? 'bg-primary ring-4 ring-primary-fixed' : isCompleted ? 'bg-green-500' : 'bg-outline-variant'}`}></div>
              
              <div className={`bg-white border rounded-xl p-card-padding flex flex-col md:flex-row gap-6 shadow-sm transition-shadow ${isActive ? 'border-2 border-primary shadow-primary/5' : isCompleted ? 'border-green-500 border-2' : 'border-border-subtle'}`}>
                
                {/* Resources Thumbnail */}
                <div className="w-full md:w-64 shrink-0">
                  <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group">
                    {(() => {
                      const ytResource = task.resources?.find(r => r.type === 'video' && r.url?.includes('youtube.com'));
                      const videoId = ytResource ? ytResource.url.split('v=')[1]?.split('&')[0] : null;
                      const imgSrc = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : `https://picsum.photos/seed/${task.id}/400/225`;
                      return <img className="w-full h-full object-cover" alt="Task resource thumbnail" src={imgSrc} />;
                    })()}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="text-white w-10 h-10 fill-current" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-h3 text-h3 text-text-primary">{task.title}</h3>
                      {isActive ? (
                        <div className="flex items-center space-x-2 bg-primary/10 text-primary px-2 py-1 rounded text-[12px] font-bold uppercase tracking-wider">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          <span>In Progress</span>
                        </div>
                      ) : isCompleted ? (
                        <CheckCircle className="text-green-500 w-5 h-5" />
                      ) : (
                        <Lock className="text-slate-400 w-5 h-5" />
                      )}
                    </div>
                    <p className="text-text-secondary text-body-md mb-4">{task.description}</p>
                    
                    {/* Resources List */}
                    {task.resources && task.resources.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <span className="font-label-sm text-text-primary block">Recommended Resources:</span>
                        <ul className="list-disc list-inside text-sm text-primary">
                          {task.resources.map((res, idx) => (
                            <li key={idx}><a href={res.url} target="_blank" rel="noreferrer" className="hover:underline">{res.title} ({res.source})</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-label-sm text-text-secondary flex items-center gap-1">
                      {isActive ? <Terminal className="w-4 h-4" /> : isCompleted ? <Check className="w-4 h-4 text-green-500" /> : <BookOpen className="w-4 h-4" />}
                      {isActive ? 'Active Task' : isCompleted ? 'Completed' : 'Up Next'}
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        className={`form-checkbox h-5 w-5 rounded transition-all ${isActive ? 'text-primary border-outline-variant focus:ring-primary' : isCompleted ? 'text-green-500 border-green-500' : 'text-slate-300 border-border-subtle cursor-not-allowed'}`} 
                        type="checkbox"
                        checked={isCompleted}
                        disabled={!isActive}
                        onChange={async (e) => {
                          if (e.target.checked && isActive) {
                            try {
                              await completeTask(task.id);
                              setCompletedTasks(prev => prev + 1);
                            } catch (err) {
                              console.error("Failed to mark complete", err);
                            }
                          }
                        }}
                      />
                      <span className="ml-2 text-label-sm text-text-primary">{isActive ? 'Mark as Complete' : isCompleted ? 'Completed' : 'Locked'}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </section>

      {/* Bottom Navigation for Content */}
      <div className="flex justify-center gap-4 py-8">
        {(() => {
          const allCompleted = roadmap.tasks && completedTasks >= roadmap.tasks.length;
          const lastTaskId = allCompleted ? roadmap.tasks[roadmap.tasks.length - 1].id : null;
          const assessmentLink = allCompleted ? `/assessment?task_id=${lastTaskId}` : '#';
          
          return (
            <Link 
              to={assessmentLink} 
              className={`px-8 py-3 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 ${
                allCompleted
                  ? hasExistingAssessment
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                    : 'bg-primary text-on-primary shadow-primary/20 hover:bg-primary-container'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              {allCompleted
                ? hasExistingAssessment
                  ? '↺ Retake Assessment'
                  : '▶ Start Assessment'
                : 'Assessment (Locked)'}
            </Link>
          );
        })()}
      </div>

      {/* Contextual FAB */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40">
        <button className="h-14 w-14 bg-accent-ai text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <Sparkles className="w-6 h-6 fill-current" />
          <span className="absolute right-16 bg-white text-accent-ai font-bold px-3 py-1 rounded-lg text-sm border border-accent-ai opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-sm pointer-events-none transition-opacity">AI Assistant</span>
        </button>
      </div>
    </main>
  );
};

export default LearningRoadmap;
