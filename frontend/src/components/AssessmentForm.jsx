import React, { useState } from 'react';

const AssessmentForm = ({ assessmentData, onSubmit, isLoading }) => {
  const [answers, setAnswers] = useState({});

  if (!assessmentData || !assessmentData.questions) return null;

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < assessmentData.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    onSubmit(answers);
  };

  const isComplete = Object.keys(answers).length === assessmentData.questions.length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 border-b border-white/10 pb-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Knowledge Check</h2>
          <p className="text-slate-400">Answer these questions to identify your learning gaps.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {assessmentData.questions.map((q, qIndex) => (
            <div key={q.id} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <p className="text-lg text-white font-medium mb-4">
                <span className="text-cyan-400 mr-2">{qIndex + 1}.</span>
                {q.text}
              </p>
              <div className="space-y-3">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(q.id, opt.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-purple-400' : 'border-slate-500'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />}
                      </div>
                      <span className={`text-sm md:text-base ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={!isComplete || isLoading}
            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:ring-4 focus:ring-purple-500/50 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/30 mt-8"
          >
            {isLoading ? 'Analyzing Results...' : 'Submit Assessment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssessmentForm;
