import React, { useState, useEffect } from 'react';
import { auth, googleProvider, firestore } from './firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(firestore, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const role = docSnap.data().role;
            // Only navigate if role exists
            if (role) {
              navigate(role === 'client' ? '/client-profile' : '/freelancer-profile');
            }
          } else {
            // New user without document - redirect to role selection
            navigate('/role-selection', {
              state: {
                email: user.email,
                uid: user.uid,
                ...(user.providerData[0]?.providerId === 'google.com' && {
                  displayName: user.displayName,
                  photoURL: user.photoURL
                })
              }
            });
          }
        } catch (error) {
          console.error("Auth state error:", error);
          setError("Error verifying user account");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleEmailPasswordAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = isLogin 
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      // For new email/password users, DON'T create document here
      if (!isLogin) {
        navigate('/role-selection', {
          state: {
            email: result.user.email,
            uid: result.user.uid
          }
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        navigate('/role-selection', { 
          state: { 
            email: user.email, 
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL 
          } 
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-8"
      >
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {/* Email/Password Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleEmailPasswordAuth}
            disabled={!email || !password || isLoading}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${
              !email || !password || isLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`w-full py-3 rounded-md border border-gray-300 flex items-center justify-center space-x-3 font-semibold transition text-gray-700 hover:bg-gray-100 ${
            isLoading ? 'cursor-not-allowed opacity-60' : ''
          }`}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M533.5 278.4c0-18.3-1.5-36-4.4-53.2H272v100.8h146.9c-6.3 34.1-25.2 62.9-53.7 82.3v68h86.7c50.8-46.8 80.6-115.7 80.6-197.9z"
            />
            <path
              fill="#34A853"
              d="M272 544.3c72.6 0 133.6-24 178.1-65.1l-86.7-68c-24.1 16.2-54.9 25.7-91.4 25.7-70.3 0-130-47.5-151.4-111.4h-89.4v69.9c44.3 87.1 135.3 149.9 240.8 149.9z"
            />
            <path
              fill="#FBBC05"
              d="M120.6 323.5c-10.5-31.1-10.5-64.8 0-95.9v-69.9h-89.4c-38.9 75.9-38.9 166.6 0 242.5l89.4-69.9z"
            />
            <path
              fill="#EA4335"
              d="M272 107.7c39.5 0 75 13.6 102.9 40.4l77.1-77.1C405.4 24.8 345.3 0 272 0 166.5 0 75.5 62.8 31.2 149.9l89.4 69.9c21.4-63.9 81.1-111.4 151.4-111.4z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Login/Signup */}
        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 font-semibold hover:underline"
            disabled={isLoading}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
