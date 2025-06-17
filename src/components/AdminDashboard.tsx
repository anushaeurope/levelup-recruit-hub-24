
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Plus, Trash2, Download, Filter, Users, UserPlus, LogOut, Star } from 'lucide-react';

interface Submission {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  age: number;
  gender: string;
  education: string;
  currentPosition: string;
  reference: string;
  createdAt: any;
  submittedAt: any;
  status?: string;
  starred?: boolean;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  referenceLabel: string;
  createdAt: any;
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [filterReference, setFilterReference] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    referenceLabel: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    fetchAgents();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'applicants'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const submissionsData: Submission[] = [];
      
      querySnapshot.forEach((doc) => {
        submissionsData.push({
          id: doc.id,
          ...doc.data()
        } as Submission);
      });
      
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'agents'));
      const agentsData: Agent[] = [];
      
      querySnapshot.forEach((doc) => {
        agentsData.push({
          id: doc.id,
          ...doc.data()
        } as Agent);
      });
      
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgent.name || !newAgent.email || !newAgent.password || !newAgent.referenceLabel) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, newAgent.email, newAgent.password);
      
      // Add agent to Firestore
      await addDoc(collection(db, 'agents'), {
        name: newAgent.name,
        email: newAgent.email,
        referenceLabel: newAgent.referenceLabel,
        createdAt: new Date(),
        uid: userCredential.user.uid
      });

      // Add reference to references collection for dropdown
      await addDoc(collection(db, 'references'), {
        name: newAgent.referenceLabel
      });

      toast.success('Agent created successfully');
      setNewAgent({ name: '', email: '', password: '', referenceLabel: '' });
      setShowAddAgent(false);
      fetchAgents();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error.message || 'Failed to create agent');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteDoc(doc(db, 'agents', agentId));
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(submission => {
      const referenceMatch = !filterReference || submission.reference === filterReference;
      const statusMatch = !filterStatus || (submission.status || 'New') === filterStatus;
      const dateMatch = !filterDate || 
        submission.submittedAt?.toDate().toISOString().split('T')[0] === filterDate;
      return referenceMatch && statusMatch && dateMatch;
    });
  };

  const exportToExcel = (referenceFilter?: string) => {
    const dataToExport = referenceFilter 
      ? submissions.filter(s => s.reference === referenceFilter)
      : getFilteredSubmissions();
      
    const exportData = dataToExport.map(submission => ({
      Name: submission.fullName,
      Phone: submission.phone,
      Email: submission.email,
      City: submission.city,
      Age: submission.age,
      Gender: submission.gender,
      Education: submission.education,
      'Current Position': submission.currentPosition,
      Reference: submission.reference,
      'Application Date': submission.submittedAt?.toDate().toLocaleDateString(),
      Status: submission.status || 'New',
      Starred: submission.starred ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    
    const fileName = referenceFilter 
      ? `mana-levelup-${referenceFilter}-applications.xlsx`
      : 'mana-levelup-all-applications.xlsx';
      
    XLSX.writeFile(wb, fileName);
    toast.success('Excel file downloaded successfully');
  };

  const filteredSubmissions = getFilteredSubmissions();
  const uniqueReferences = [...new Set(submissions.map(s => s.reference))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
              alt="ManaCLG LevelUp Logo"
              className="h-10 w-auto mr-4"
            />
            <h1 className="text-2xl font-bold text-white font-montserrat">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Applications
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
              activeTab === 'agents'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Agents
          </button>
        </div>

        {activeTab === 'applications' && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Total Applications</h3>
                <p className="text-3xl font-bold text-blue-400">{submissions.length}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">New</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {submissions.filter(s => (s.status || 'New') === 'New').length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Hired</h3>
                <p className="text-3xl font-bold text-green-400">
                  {submissions.filter(s => s.status === 'Hired').length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Active Agents</h3>
                <p className="text-3xl font-bold text-purple-400">{agents.length}</p>
              </div>
            </div>

            {/* Filters and Export */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Reference</label>
                    <select
                      value={filterReference}
                      onChange={(e) => setFilterReference(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All References</option>
                      {uniqueReferences.map(ref => (
                        <option key={ref} value={ref}>{ref}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Follow-Up">Follow-Up</option>
                      <option value="Hired">Hired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Date</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToExcel()}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </button>
                </div>
              </div>
            </div>

            {/* Export by Reference */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Export by Reference</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {uniqueReferences.map(ref => (
                  <button
                    key={ref}
                    onClick={() => exportToExcel(ref)}
                    className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                  >
                    <span className="truncate">{ref}</span>
                    <Download className="w-4 h-4 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {submission.starred && <Star className="w-4 h-4 text-yellow-400 mr-2 fill-current" />}
                            <div className="font-medium text-white">{submission.fullName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{submission.phone}</div>
                          <div className="text-sm text-gray-400">{submission.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {submission.reference}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.submittedAt?.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (submission.status || 'New') === 'New' ? 'bg-blue-100 text-blue-800' :
                            (submission.status || 'New') === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                            (submission.status || 'New') === 'Follow-Up' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {submission.status || 'New'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredSubmissions.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No applications found.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'agents' && (
          <>
            {/* Add Agent Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Agent Management</h2>
              <button
                onClick={() => setShowAddAgent(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </button>
            </div>

            {/* Add Agent Form */}
            {showAddAgent && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Agent</h3>
                <form onSubmit={handleAddAgent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={newAgent.password}
                      onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Reference Label</label>
                    <input
                      type="text"
                      value={newAgent.referenceLabel}
                      onChange={(e) => setNewAgent({...newAgent, referenceLabel: e.target.value})}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                    >
                      Create Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAgent(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Agents Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reference Label</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">{agent.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{agent.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {agent.referenceLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {agent.createdAt?.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {agents.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No agents found. Create your first agent.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
