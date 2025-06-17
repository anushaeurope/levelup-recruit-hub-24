import React, { useState, useEffect } from 'react';
import { auth, db, createUserWithEmail } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Download, Users, TrendingUp, Calendar, Trash2, Eye, Phone, MessageSquare, Filter, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  submittedAt: any;
  notes?: string;
  referenceId: string;
  referenceName: string;
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);
  const [showCreateReference, setShowCreateReference] = useState(false);
  const [newReference, setNewReference] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [references, setReferences] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchReferences();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'applications'));
      const apps: Application[] = [];
      
      querySnapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() } as Application);
      });
      
      // Sort by submission date (newest first)
      apps.sort((a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate());
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'references'));
      const refs: any[] = [];
      querySnapshot.forEach((doc) => {
        refs.push({ id: doc.id, ...doc.data() });
      });
      setReferences(refs);
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  const handleCreateReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmail(
        newReference.email,
        newReference.password
      );

      // Store reference data in Firestore
      await setDoc(doc(db, 'references', userCredential.user.uid), {
        name: newReference.name,
        email: newReference.email,
        createdAt: new Date(),
        role: 'reference'
      });

      setNewReference({ name: '', email: '', password: '' });
      setShowCreateReference(false);
      fetchReferences();
      
      toast({
        title: "Success",
        description: "Reference account created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setApplications(prev =>
        prev.map(app =>
          app.id === appId ? { ...app, status: newStatus } : app
        )
      );
      
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const deleteApplication = async (appId: string) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'applications', appId));
        setApplications(prev => prev.filter(app => app.id !== appId));
        
        toast({
          title: "Application Deleted",
          description: "The application has been deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting application:', error);
        toast({
          title: "Error",
          description: "Failed to delete application",
          variant: "destructive",
        });
      }
    }
  };

  const exportToExcel = () => {
    const exportData = filteredApplications.map(app => ({
      Name: app.name,
      Email: app.email,
      Phone: app.phone,
      City: app.city,
      Status: app.status,
      Reference: app.referenceName,
      'Application Date': app.submittedAt?.toDate().toLocaleDateString(),
      Notes: app.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    
    const filename = `manaclg-applications-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'In Review': return 'bg-purple-100 text-purple-800';
      case 'Follow-Up': return 'bg-orange-100 text-orange-800';
      case 'Hired': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: applications.length,
    new: applications.filter(app => app.status === 'New').length,
    contacted: applications.filter(app => app.status === 'Contacted').length,
    hired: applications.filter(app => app.status === 'Hired').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage applications and references</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Phone className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Reference Management Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Reference Management</h2>
              <button
                onClick={() => setShowCreateReference(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Reference
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {references.map((ref) => (
                <div key={ref.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{ref.name}</h3>
                  <p className="text-sm text-gray-600">{ref.email}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {ref.createdAt?.toDate?.()?.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Review">In Review</option>
                    <option value="Follow-Up">Follow-Up</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
                <button
                  onClick={exportToExcel}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.name}</div>
                          <div className="text-sm text-gray-500">{app.city}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.email}</div>
                        <div className="text-sm text-gray-500">{app.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.referenceName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)} border-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Review">In Review</option>
                          <option value="Follow-Up">Follow-Up</option>
                          <option value="Hired">Hired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.submittedAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setViewingApplication(app)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const message = `Hi ${app.name}, this is the admin from ManaCLG LevelUp. Thank you for your application. Let's proceed with the next steps.`;
                            window.open(`https://wa.me/${app.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${app.phone}`, '_self')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create Reference Modal */}
      {showCreateReference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Reference</h3>
            <form onSubmit={handleCreateReference} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newReference.name}
                  onChange={(e) => setNewReference(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newReference.email}
                  onChange={(e) => setNewReference(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={newReference.password}
                  onChange={(e) => setNewReference(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateReference(false);
                    setNewReference({ name: '', email: '', password: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Application Modal */}
      {viewingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <button
                onClick={() => setViewingApplication(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base font-medium">{viewingApplication.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{viewingApplication.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-base">{viewingApplication.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">City</p>
                <p className="text-base">{viewingApplication.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Reference</p>
                <p className="text-base">{viewingApplication.referenceName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-base">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingApplication.status)}`}>
                    {viewingApplication.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Applied Date</p>
                <p className="text-base">{viewingApplication.submittedAt?.toDate().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="text-base">{viewingApplication.notes || 'No notes available'}</p>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setViewingApplication(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
