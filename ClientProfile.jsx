import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  InboxIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Demo data for seeding
const demoJobs = [
  {
    id: 'job_1',
    clientId: 'client_123',
    title: 'Website Development',
    description: 'Develop a responsive website',
    category: 'Web Development',
    budget: 3000,
    deadline: '2025-07-01T00:00:00Z',
    skillsRequired: ['React', 'CSS', 'HTML'],
    status: 'open',
    postedAt: '2025-05-01T00:00:00Z',
    applicants: 5
  },
  {
    id: 'job_2',
    clientId: 'client_123',
    title: 'Mobile App Design',
    description: 'Design UI/UX for a mobile app',
    category: 'Design',
    budget: 1500,
    deadline: '2025-06-15T00:00:00Z',
    skillsRequired: ['Figma', 'Adobe XD'],
    status: 'in-progress',
    postedAt: '2025-04-15T00:00:00Z',
    applicants: 3
  }
];

const demoProposals = [
  {
    id: 'proposal_1',
    jobId: 'job_1',
    freelancerName: 'John Doe',
    jobTitle: 'Website Development',
    coverLetter: 'I have 5 years experience in React.',
    proposedBudget: 2800,
    timeline: 30,
    status: 'pending'
  },
  {
    id: 'proposal_2',
    jobId: 'job_2',
    freelancerName: 'Jane Smith',
    jobTitle: 'Mobile App Design',
    coverLetter: 'Expert in mobile UI/UX design.',
    proposedBudget: 1400,
    timeline: 20,
    status: 'accepted'
  }
];

const demoMessages = [
  {
    id: 'msg_1',
    participants: ['client_123', 'freelancer_1'],
    lastMessage: 'Looking forward to starting the project!',
    timestamp: '2025-05-20T10:00:00Z'
  },
  {
    id: 'msg_2',
    participants: ['client_123', 'freelancer_2'],
    lastMessage: 'Can you provide more details on the requirements?',
    timestamp: '2025-05-22T15:30:00Z'
  }
];

const ClientProfile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    budget: 0,
    deadline: '',
    skillsRequired: []
  });
  const [selectedProposal, setSelectedProposal] = useState(null);

  // New for payment confirmation
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);

  // Company Profile states
  const [companyEditMode, setCompanyEditMode] = useState(false);
  const [companyDraft, setCompanyDraft] = useState({
    company: '',
    industry: '',
    location: '',
    website: '',
    bio: '',
    avatar: ''
  });
  const [companySaveMsg, setCompanySaveMsg] = useState('');

  // Settings states
  const [settingsEditMode, setSettingsEditMode] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState({
    email: '',
    notifications: true,
    password: ''
  });
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');

  // Fetch client data and seed demo data if needed
  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        const userRef = doc(firestore, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);

          // Seed demo jobs if empty
          let jobsData = JSON.parse(localStorage.getItem('freelanceHub_jobs')) || [];
          if (!jobsData.length) {
            jobsData = demoJobs.map(j => ({ ...j, clientId: auth.currentUser.uid }));
            localStorage.setItem('freelanceHub_jobs', JSON.stringify(jobsData));
          }
          const myJobs = jobsData.filter(job => job.clientId === auth.currentUser.uid);
          setJobs(myJobs);

          // Seed demo proposals if empty
          let proposalsData = JSON.parse(localStorage.getItem('freelanceHub_proposals')) || [];
          if (!proposalsData.length) {
            proposalsData = demoProposals;
            localStorage.setItem('freelanceHub_proposals', JSON.stringify(proposalsData));
          }
          setProposals(proposalsData.filter(p => myJobs.some(j => j.id === p.jobId)));

          // Seed demo messages if empty
          let messagesData = JSON.parse(localStorage.getItem('freelanceHub_messages')) || [];
          if (!messagesData.length) {
            messagesData = demoMessages.map(m => ({
              ...m,
              participants: [auth.currentUser.uid, ...m.participants.filter(pid => pid !== 'client_123')]
            }));
            localStorage.setItem('freelanceHub_messages', JSON.stringify(messagesData));
          }
          setMessages(messagesData.filter(m => m.participants.includes(auth.currentUser.uid)));

          // Set company/profile drafts
          setCompanyDraft({
            company: userData.company || '',
            industry: userData.industry || '',
            location: userData.location || '',
            website: userData.website || '',
            bio: userData.bio || '',
            avatar: userData.avatar || 'https://via.placeholder.com/150'
          });
          setSettingsDraft({
            email: userData.email || '',
            notifications: true,
            password: ''
          });
        }
      }
    };
    fetchData();
  }, []);

  // Modified to use payment confirmation
  const handlePostJobClick = () => {
    setPendingJob(newJob);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    const jobId = uuidv4();
    const newJobEntry = {
      ...pendingJob,
      id: jobId,
      clientId: auth.currentUser.uid,
      status: 'open',
      postedAt: new Date().toISOString(),
      applicants: 0
    };

    setJobs([...jobs, newJobEntry]);
    localStorage.setItem('freelanceHub_jobs',
      JSON.stringify([...JSON.parse(localStorage.getItem('freelanceHub_jobs')), newJobEntry])
    );
    setShowJobModal(false);
    setShowPaymentModal(false);
    setPendingJob(null);
    setNewJob({
      title: '',
      description: '',
      category: 'Web Development',
      budget: 0,
      deadline: '',
      skillsRequired: []
    });
  };

  const handleProposalAction = (proposalId, action) => {
    const updatedProposals = proposals.map(proposal => {
      if (proposal.id === proposalId) {
        return { ...proposal, status: action };
      }
      return proposal;
    });
    setProposals(updatedProposals);
    localStorage.setItem('freelanceHub_proposals', JSON.stringify(updatedProposals));
  };

  // Save company profile changes (simulate Firestore update)
  const handleCompanySave = () => {
    setCompanySaveMsg('Saving...');
    setTimeout(() => {
      setCompanyEditMode(false);
      setCompanySaveMsg('Saved!');
      setTimeout(() => setCompanySaveMsg(''), 1500);
    }, 1000);
  };

  // Save settings changes (simulate Firestore update)
  const handleSettingsSave = () => {
    setSettingsSaveMsg('Saving...');
    setTimeout(() => {
      setSettingsEditMode(false);
      setSettingsSaveMsg('Saved!');
      setTimeout(() => setSettingsSaveMsg(''), 1500);
    }, 1000);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'jobs', label: 'My Jobs', icon: BriefcaseIcon, count: jobs.length },
    { id: 'proposals', label: 'Proposals', icon: DocumentTextIcon, count: proposals.length },
    { id: 'inbox', label: 'Inbox', icon: InboxIcon, count: messages.length },
    { id: 'company', label: 'Company Profile', icon: UserGroupIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon }
  ];

  if (!user) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt="Company Logo"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-lg font-bold">{user.company}</h2>
              <p className="text-sm text-gray-500">{user.industry}</p>
            </div>
          </div>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center w-full px-6 py-3 text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
              {item.count !== undefined && (
                <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Total Jobs Posted</h3>
                  <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {jobs.filter(job => job.status === 'in-progress').length}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
                  <div className="text-3xl font-bold text-purple-600">
                    ${jobs.reduce((sum, job) => sum + (job.budget || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {proposals.slice(0, 5).map(proposal => (
                    <div key={proposal.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{proposal.freelancerName}</h4>
                        <p className="text-sm text-gray-500">{proposal.jobTitle}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        proposal.status === 'accepted' 
                          ? 'bg-green-100 text-green-700'
                          : proposal.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Job Postings</h2>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Post New Job
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        job.status === 'open' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skillsRequired.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Budget: ${job.budget.toLocaleString()}</span>
                      <span>Applicants: {job.applicants}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Project Proposals</h2>
              <div className="space-y-4">
                {proposals.map(proposal => (
                  <div 
                    key={proposal.id}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{proposal.freelancerName}</h3>
                        <p className="text-gray-600">{proposal.jobTitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProposal(proposal)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View Details
                        </button>
                        {proposal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProposalAction(proposal.id, 'accepted')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleProposalAction(proposal.id, 'rejected')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedProposal?.id === proposal.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium mb-2">Proposal Details:</h4>
                        <p className="text-gray-600 mb-4">{proposal.coverLetter}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Proposed Budget</p>
                            <p className="font-medium">${proposal.proposedBudget}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Timeline</p>
                            <p className="font-medium">{proposal.timeline} days</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Inbox</h2>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-gray-500">No messages yet.</div>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-700">
                        {msg.participants.filter(pid => pid !== auth.currentUser.uid).join(', ')}
                      </div>
                      <div className="text-gray-500 text-sm">{msg.lastMessage}</div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Company Profile</h2>
                {!companyEditMode && (
                  <button
                    onClick={() => setCompanyEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </div>
              {companyEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyDraft.company}
                      onChange={e => setCompanyDraft({ ...companyDraft, company: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <input
                      type="text"
                      value={companyDraft.industry}
                      onChange={e => setCompanyDraft({ ...companyDraft, industry: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={companyDraft.location}
                      onChange={e => setCompanyDraft({ ...companyDraft, location: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <input
                      type="url"
                      value={companyDraft.website}
                      onChange={e => setCompanyDraft({ ...companyDraft, website: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">About Company</label>
                    <textarea
                      value={companyDraft.bio}
                      onChange={e => setCompanyDraft({ ...companyDraft, bio: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleCompanySave}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setCompanyEditMode(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                  {companySaveMsg && (
                    <div className="text-green-600 mt-2">{companySaveMsg}</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={companyDraft.avatar}
                      alt="Company Logo"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{companyDraft.company}</h3>
                      <span className="text-gray-500">{companyDraft.industry}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Location: </span>
                    {companyDraft.location || <span className="text-gray-400">Not set</span>}
                  </div>
                  <div>
                    <span className="font-medium">Website: </span>
                    {companyDraft.website ? (
                      <a
                        href={companyDraft.website}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {companyDraft.website}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">About: </span>
                    {companyDraft.bio || <span className="text-gray-400">No description</span>}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                {!settingsEditMode && (
                  <button
                    onClick={() => setSettingsEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </div>
              {settingsEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={settingsDraft.email}
                      onChange={e => setSettingsDraft({ ...settingsDraft, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Change password"
                      value={settingsDraft.password}
                      onChange={e => setSettingsDraft({ ...settingsDraft, password: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settingsDraft.notifications}
                      onChange={e => setSettingsDraft({ ...settingsDraft, notifications: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Enable email notifications</span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSettingsSave}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setSettingsEditMode(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                  {settingsSaveMsg && (
                    <div className="text-green-600 mt-2">{settingsSaveMsg}</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Email: </span>
                    {settingsDraft.email}
                  </div>
                  <div>
                    <span className="font-medium">Notifications: </span>
                    {settingsDraft.notifications ? (
                      <span className="text-green-600">Enabled</span>
                    ) : (
                      <span className="text-red-600">Disabled</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Password: </span>
                    <span className="text-gray-400">••••••••</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      {/* Job Posting Modal */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl relative">
              <h2 className="text-2xl font-bold mb-6">Post New Job</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Job Description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg h-32"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newJob.category}
                    onChange={(e) => setNewJob({...newJob, category: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option>Web Development</option>
                    <option>Mobile Development</option>
                    <option>Design</option>
                    <option>Writing</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Budget"
                    value={newJob.budget}
                    onChange={(e) => setNewJob({...newJob, budget: e.target.value})}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handlePostJobClick}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold shadow transition"
                  >
                    Post Job
                  </button>
                  <button
                    onClick={() => setShowJobModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {/* Payment Confirm Popup */}
              <AnimatePresence>
                {showPaymentModal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 flex items-center justify-center z-50"
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-auto flex flex-col items-center">
                      <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-bold mb-2 text-center">Payment Required</h3>
                      <p className="text-gray-700 text-center mb-6">
                        Payment of <span className="font-semibold text-blue-600">Rs 2999</span> should be done for each project.
                      </p>
                      <div className="flex gap-4 w-full">
                        <button
                          onClick={handleConfirmPayment}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold shadow transition"
                        >
                          Proceed
                        </button>
                        <button
                          onClick={() => setShowPaymentModal(false)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientProfile;