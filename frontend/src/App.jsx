import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import ConsistentNavLayout from './layouts/ConsistentNavLayout';
import Home from './features/dashboard/Home';
import LearningRoadmap from './features/learning/LearningRoadmap';
import KnowledgeValidation from './features/assessment/KnowledgeValidation';
import GapAnalysisReport from './features/assessment/GapAnalysisReport';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route without consistent nav */}
        <Route path="/login" element={<Login />} />
        
        {/* Main Routes with Consistent Nav Layout */}
        <Route element={<ProtectedRoute><ConsistentNavLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/roadmap" element={<LearningRoadmap />} />
          <Route path="/assessment" element={<KnowledgeValidation />} />
          <Route path="/gap-analysis" element={<GapAnalysisReport />} />
          
          {/* Default redirect to Home if authenticated context */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
