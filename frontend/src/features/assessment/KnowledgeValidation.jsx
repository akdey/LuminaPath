import React, { useEffect, useState } from 'react';
import { ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { generateAssessment, analyzeGaps, getDashboardData } from '../../services/api';

const KnowledgeValidation = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('task_id');
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userRoadmaps, setUserRoadmaps] = useState([]);

  useEffect(() => {
    if (taskId) {
      generateAssessment(taskId)
        .then(data => {
          setAssessment(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to generate assessment", err);
          setLoading(false);
        });
    } else {
      getDashboardData().then(data => {
        setUserRoadmaps(data.active_roadmaps || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [taskId]);

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-12 bg-surface-background flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-10 h-10 text-primary mb-4" />
        <p className="text-text-secondary">Generating AI Assessment...</p>
      </main>
    );
  }

  if (!assessment || !assessment.mcqs || assessment.mcqs.length === 0) {
    if (taskId) {
      return (
        <main className="flex-1 p-6 md:p-12 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="font-h2 text-h2 text-text-primary mb-4">Assessment Not Found</h2>
            <Link to="/" className="text-primary hover:underline font-bold">Return Home</Link>
          </div>
        </main>
      );
    }
    
    // No task ID provided, show selection screen
    const completedRoadmaps = userRoadmaps.filter(rm => rm.progress_percentage === 100);
    
    return (
      <main className="flex-1 p-6 md:p-12 max-w-[1200px] mx-auto pb-24">
        <h1 className="font-h1 text-h1 text-text-primary mb-2">Select a Course to Evaluate</h1>
        <p className="text-body-lg text-text-secondary max-w-[600px] mb-8">Choose one of your completed courses to go to its roadmap and take the final assessment.</p>
        
        {completedRoadmaps.length === 0 ? (
           <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
             <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-text-primary mb-2">No completed courses yet</h3>
             <p className="text-text-secondary mb-4">You need to complete all tasks in a roadmap before taking its assessment.</p>
             <Link to="/roadmap" className="bg-primary text-white px-6 py-2 rounded-xl inline-block font-bold">View Roadmaps</Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedRoadmaps.map((rm) => (
              <div 
                key={rm.id}
                onClick={() => navigate(`/roadmap?id=${rm.id}`)}
                className="bg-white border border-border-subtle rounded-2xl p-6 hover:border-primary transition-colors cursor-pointer flex flex-col shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <Lightbulb className="w-6 h-6" />
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

  const mcqs = assessment.mcqs;
  const currentMcq = mcqs[currentQuestionIndex];
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / mcqs.length) * 100);

  const handleSelectAnswer = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = async () => {
    if (currentQuestionIndex < mcqs.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished quiz, generate gap analysis then go to gap analysis
      setIsAnalyzing(true);
      try {
        await analyzeGaps(assessment.assessment_id, selectedAnswers);
        navigate(`/gap-analysis?assessment_id=${assessment.assessment_id}`);
      } catch (err) {
        console.error("Failed to submit assessment", err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isLastQuestion = currentQuestionIndex === mcqs.length - 1;

  return (
    <main className="flex-1 p-6 md:p-12 bg-surface-background">
      <div className="max-w-[800px] mx-auto space-y-8">
        {/* Assessment Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-label-sm font-lexend">Module Validation</span>
              <h1 className="font-h1 text-h1 text-text-primary tracking-tight">Knowledge Check</h1>
            </div>
            <div className="text-right">
              <span className="font-lexend font-bold text-primary">0{currentQuestionIndex + 1}/0{mcqs.length}</span>
              <p className="text-label-sm text-slate-400 uppercase tracking-widest">Questions</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Quiz Card Container */}
        <section className="bg-surface-card border border-border-subtle rounded-xl p-8 md:p-12 shadow-sm space-y-8">
          <div className="space-y-6">
            <span className="font-lexend text-blue-600 font-semibold tracking-widest uppercase text-xs">Question {currentQuestionIndex + 1}</span>
            <h2 className="font-h2 text-h2 text-text-primary leading-tight">{currentMcq.question}</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {currentMcq.options.map((optionText, idx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                
                return (
                  <label key={idx} className={`group relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'border-primary bg-primary/5' : 'border-border-subtle hover:border-primary/30'}`}>
                    <input 
                      className="hidden" 
                      name="quiz_option" 
                      type="radio"
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(idx)}
                    />
                    <div className={`w-12 h-12 flex items-center justify-center border-2 rounded-full font-lexend font-bold transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-border-subtle text-slate-400 group-hover:border-primary/50'}`}>
                      {letter}
                    </div>
                    <span className={`ml-6 font-body-lg text-text-primary ${isSelected ? 'font-semibold' : ''}`}>{optionText}</span>
                    <div className={`absolute inset-0 rounded-xl transition-colors -z-10 ${isSelected ? 'bg-primary/5' : 'peer-checked:bg-primary/5'}`}></div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-8 border-t border-border-subtle flex items-center justify-between gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0 || isAnalyzing}
              className={`px-8 py-4 font-lexend font-bold rounded-xl transition-colors active:scale-95 ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-primary hover:bg-primary/5'}`}
            >
              Previous Question
            </button>
            <button 
              onClick={handleNext}
              className={`px-12 py-4 font-lexend font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${selectedAnswers[currentQuestionIndex] !== undefined ? 'bg-primary text-on-primary hover:bg-primary-container shadow-primary/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <span>{isLastQuestion ? 'Submit & Analyze' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* AI Insight Sidebar */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <Lightbulb className="text-blue-600 w-5 h-5 fill-current" />
          </div>
          <div className="space-y-1">
            <h4 className="font-lexend font-bold text-blue-900">Digital Tutor Tip</h4>
            <p className="text-blue-800/80 font-body-md text-sm leading-relaxed">Take your time. These questions are uniquely generated based on the materials from your learning path.</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default KnowledgeValidation;
