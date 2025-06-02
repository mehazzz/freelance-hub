import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBarChart2, FiBriefcase, FiInbox, FiCalendar, FiUser, FiSearch, FiEdit2, FiMail
} from 'react-icons/fi';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';

const fetchData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const categories = ['All', 'Web Development', 'Design', 'Mobile Development', 'Writing'];
const FREE_PROJECT_LIMIT = 1;
const PREMIUM_PRICE = 500;

const FreelancerProfile = () => {
  // --- State ---
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);

  // Freemium model state
  const [plan, setPlan] = useState(null); // 'free' or 'premium'
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [freeProjectsDone, setFreeProjectsDone] = useState(0);

  // --- Chatbase AI Script Injection ---
  useEffect(() => {
    if (!document.getElementById("WG1z2CcdrOq8hbSy_EzHY")) {
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "WG1z2CcdrOq8hbSy_EzHY";
      script.domain = "www.chatbase.co";
      document.body.appendChild(script);
    }
  }, []);

  // --- Fetch user data ---
  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const ref = doc(firestore, "users", auth.currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const userData = { ...snap.data(), id: auth.currentUser.uid };
          setUser(userData);
          setProfileDraft(userData);
          if (userData.plan) {
            setPlan(userData.plan);
          } else {
            setShowPlanModal(true);
          }
        }
      }
    };
    fetchUser();
  }, []);

  // --- Load jobs, messages, notifications, and free project count ---
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setTimeout(() => {
      setJobs(fetchData('freelanceHub_jobs').filter(j => j.status === 'open'));
      setMessages(fetchData('freelanceHub_messages').filter(msg => msg.participants?.includes(user.id)));
      setNotifications(fetchData('freelanceHub_notifications').filter(n => n.userId === user.id));
      const done = parseInt(localStorage.getItem(`freeProjectsDone_${user.id}`) || '0', 10);
      setFreeProjectsDone(done);
      setIsLoading(false);
    }, 700);
  }, [user]);

  // --- Filter jobs ---
  useEffect(() => {
    let filtered = jobs;
    if (searchTerm)
      filtered = filtered.filter(
        job => job.title.toLowerCase().includes(searchTerm.toLowerCase())
          || job.description.toLowerCase().includes(searchTerm.toLowerCase())
          || job.skillsRequired.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    if (filterCategory !== 'All')
      filtered = filtered.filter(job => job.category === filterCategory);
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterCategory]);

  // --- Plan selection and upgrade handlers ---
  const handlePlanSelect = async (chosenPlan) => {
    setPlan(chosenPlan);
    setShowPlanModal(false);
    if (user) {
      await updateDoc(doc(firestore, "users", user.id), { plan: chosenPlan });
    }
  };

  const handleUpgradeToPremium = async () => {
    alert('Thank you for your payment! You are now a Premium Freelancer.');
    setPlan('premium');
    if (user) {
      await updateDoc(doc(firestore, "users", user.id), { plan: 'premium' });
    }
  };

  const handleCompleteFreeProject = () => {
    const done = freeProjectsDone + 1;
    setFreeProjectsDone(done);
    localStorage.setItem(`freeProjectsDone_${user.id}`, done);
  };

  // --- Sidebar nav ---
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'jobs', label: 'Browse Jobs', icon: FiBriefcase },
    { id: 'inbox', label: 'Inbox', icon: FiInbox, badge: messages.length },
    { id: 'calendar', label: 'Calendar', icon: FiCalendar },
    { id: 'insights', label: 'Insights', icon: FiBarChart2 },
    { id: 'profile', label: 'Profile', icon: FiUser }
  ];

  function StatCard({ label, value, color }) {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      yellow: 'bg-yellow-50 text-yellow-700',
      purple: 'bg-purple-50 text-purple-700'
    };
    return (
      <div className={`${colorMap[color]} rounded-xl p-6`}>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm opacity-75">{label}</div>
      </div>
    );
  }

  function JobCard({ job }) {
    const isFreeTierBlocked = plan === 'free' && freeProjectsDone >= FREE_PROJECT_LIMIT;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <span className="text-2xl font-bold text-green-600">${job.budget.toLocaleString()}</span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skillsRequired.map(skill => (
            <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          <span>👥 {job.applicants} applicants</span>
        </div>
        <button
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isFreeTierBlocked
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isFreeTierBlocked}
          onClick={() => {
            if (plan === 'free') {
              handleCompleteFreeProject();
            }
            alert('Proposal submitted! (simulate)');
          }}
        >
          {isFreeTierBlocked ? 'Upgrade to Premium to continue' : 'Submit Proposal'}
        </button>
      </motion.div>
    );
  }

  function EditProfileModal({ profileDraft, setProfileDraft, onClose, onSave }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={profileDraft.name}
              onChange={e => setProfileDraft({ ...profileDraft, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Full Name"
            />
            <input
              type="text"
              value={profileDraft.title}
              onChange={e => setProfileDraft({ ...profileDraft, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Title"
            />
            <input
              type="number"
              value={profileDraft.hourlyRate}
              onChange={e => setProfileDraft({ ...profileDraft, hourlyRate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Hourly Rate"
            />
            <input
              type="text"
              value={profileDraft.location}
              onChange={e => setProfileDraft({ ...profileDraft, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Location"
            />
            <textarea
              value={profileDraft.bio}
              onChange={e => setProfileDraft({ ...profileDraft, bio: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Bio"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                onClick={onSave}
              >
                Save
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Plan selection modal ---
  if (showPlanModal || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Choose Your Freelancer Plan
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Free Plan */}
            <div className="flex-1 border rounded-lg p-6 flex flex-col items-center">
              <h3 className="text-xl font-bold mb-2">Free Model</h3>
              <p className="text-gray-700 mb-4 text-center">
                <span className="font-semibold">1 Project</span> only<br />
                Basic features<br />
                Intro to freelancing<br />
                <span className="text-xs text-gray-500">Upgrade anytime</span>
              </p>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => handlePlanSelect('free')}
              >
                Choose Free
              </button>
            </div>
            {/* Premium Plan */}
            <div className="flex-1 border rounded-lg p-6 flex flex-col items-center border-blue-500">
              <h3 className="text-xl font-bold mb-2 text-blue-700">Premium</h3>
              <p className="text-gray-700 mb-4 text-center">
                <span className="font-semibold">Unlimited Projects</span><br />
                All features unlocked<br />
                Priority support<br />
                <span className="text-xs text-gray-500">Just ₹{PREMIUM_PRICE} one-time</span>
              </p>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                onClick={() => handlePlanSelect('premium')}
              >
                Go Premium
              </button>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              <b>Freelancing 101:</b> As a freelancer, you can build your portfolio, learn client communication,
              and get paid for your skills. Start with a free project, then unlock your full journey!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Free tier paywall ---
  if (plan === 'free' && freeProjectsDone >= FREE_PROJECT_LIMIT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8"
        >
          <h2 className="text-3xl font-bold mb-4 text-center text-red-600">
            Free Tier Limit Reached
          </h2>
          <p className="mb-6 text-center text-gray-700">
            You have completed your free project.<br />
            Upgrade to <span className="font-semibold text-blue-700">Premium</span> for unlimited access and all features.
          </p>
          <button
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
            onClick={handleUpgradeToPremium}
          >
            Upgrade for ₹{PREMIUM_PRICE}
          </button>
          <div className="mt-6 text-gray-500 text-sm">
            <b>Why upgrade?</b> <br />
            Unlimited projects, advanced analytics, priority support, and more!
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.title}</p>
            </div>
          </div>
        </div>
        <nav className="mt-6">
          {sidebarItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
                      <p className="text-blue-100 text-lg">
                        {plan === 'free'
                          ? 'You are on the Free plan. Upgrade for unlimited access!'
                          : 'Premium Freelancer: All features unlocked!'}
                      </p>
                    </div>
                    <div>
                      <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full shadow-lg border-4 border-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Open Jobs" value={jobs.length} color="blue" />
                    <StatCard label="Proposals" value={3} color="green" />
                    <StatCard label="Earnings (mo.)" value="$2,340" color="yellow" />
                    <StatCard label="Success Rate" value="94%" color="purple" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Jobs</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredJobs.slice(0, 4).map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                  </div>
                  {plan === 'free' && (
                    <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <h3 className="font-semibold text-blue-700 mb-1">Freelancing 101</h3>
                      <p className="text-blue-700 text-sm">
                        Welcome to the freelance world! Start with your free project, build your profile, and unlock more opportunities by upgrading to Premium.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
              {/* ...rest of your tabs unchanged... */}
              {activeTab === 'jobs' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Browse Jobs ({filteredJobs.length})</h2>
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80">
                        <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(cat => <option key={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-4"></div>
                          <div className="flex gap-2 mb-4">
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          </div>
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <AnimatePresence>
                        {filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
              {/* ...rest of your tabs unchanged... */}
              {activeTab === 'inbox' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-96">
                  <div className="p-6 border-b border-gray-100 flex items-center">
                    <FiMail className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold">Inbox</h2>
                  </div>
                  <div className="p-6 text-center text-gray-500">
                    <FiInbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start a conversation with clients!</p>
                  </div>
                </div>
              )}
              {activeTab === 'calendar' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-96">
                  <div className="p-6 border-b border-gray-100 flex items-center">
                    <FiCalendar className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold">Calendar</h2>
                  </div>
                  <div className="p-6 text-center text-gray-500">
                    <span role="img" aria-label="calendar" className="text-5xl">📅</span>
                    <p className="mt-4">Your schedule will appear here once you start working on projects.</p>
                  </div>
                </div>
              )}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Insights & Analytics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Earnings (Total)" value="$24,500" color="green" />
                    <StatCard label="Jobs Completed" value="42" color="blue" />
                    <StatCard label="Avg. Rating" value="4.9/5" color="yellow" />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-4">
                    <h3 className="font-semibold mb-4">Your Proposal Success Rate</h3>
                    <div className="w-full bg-gray-200 rounded h-6">
                      <div className="bg-blue-500 h-6 rounded" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-gray-600 mt-2">92% of your proposals have been accepted in the last 6 months.</p>
                  </div>
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-6">Profile</h2>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setShowEditModal(true)}
                    >
                      <FiEdit2 /> Edit Profile
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8">
                    <img src={user.avatar} alt="avatar" className="w-32 h-32 rounded-full border-4 border-blue-100" />
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold">{user.name}</h3>
                      <p className="text-blue-600 font-medium">{user.title}</p>
                      <p className="text-gray-700">{user.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.skills && user.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-gray-500">
                        <span className="mr-4">💰 ${user.hourlyRate}/hr</span>
                        <span>📍 {user.location}</span>
                      </div>
                    </div>
                  </div>
                  {showEditModal && profileDraft && (
                    <EditProfileModal
                      profileDraft={profileDraft}
                      setProfileDraft={setProfileDraft}
                      onClose={() => setShowEditModal(false)}
                      onSave={() => {
                        const users = fetchData('freelanceHub_users').map(u =>
                          u.id === user.id ? profileDraft : u
                        );
                        localStorage.setItem('freelanceHub_users', JSON.stringify(users));
                        setShowEditModal(false);
                        window.location.reload();
                      }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
