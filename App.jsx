import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile from './pages/ClientProfile';
import Auth from './pages/Auth';
import About from './pages/about';
import RoleSelection from './pages/RoleSelection';
import { initializeData } from './utils/datamanager';
import { auth } from './pages/firebase'; // Make sure the path is correct!
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    // Optionally, add a nice loading spinner here
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        
        {/* Freelancer Route */}
        <Route
          path="/freelancer-profile"
          element={
            currentUser ? (
              <FreelancerProfile />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        
        {/* Client Route */}
        <Route
          path="/client-profile"
          element={
            currentUser ? (
              <ClientProfile />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
