import React, { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, firestore } from './firebase';

const RoleSelection = () => {
  const location = useLocation();
  const { email, uid } = location.state;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      setIsLoading(true);
      await setDoc(doc(firestore, "users", uid), {
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
        // Default values
        name: email.split('@')[0] || 'New User',
        avatar: 'https://via.placeholder.com/150',
        ...(role === 'freelancer' && { 
          title: 'Freelancer',
          skills: [],
          hourlyRate: 25
        }),
        ...(role === 'client' && {
          company: 'My Company',
          location: 'Unknown'
        })
      });

      // Refresh auth token to trigger auth state change
      await auth.currentUser.getIdToken(true);
      
      navigate(role === 'client' ? '/client-profile' : '/freelancer-profile');
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Error saving role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleRoleSelect('freelancer')}
            disabled={isLoading}
            className={`px-6 py-3 text-white rounded-lg ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Freelancer'}
          </button>
          <button
            onClick={() => handleRoleSelect('client')}
            disabled={isLoading}
            className={`px-6 py-3 text-white rounded-lg ${
              isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Client'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
