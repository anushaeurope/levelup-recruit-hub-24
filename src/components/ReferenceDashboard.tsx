
import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Filter, Download, Phone, MessageSquare, Edit, Users, TrendingUp, Calendar } from 'lucide-react';
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

interface ReferenceData {
  name: string;
  email: string;
}

const ReferenceDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'New', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'Contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'In Review', label: 'In Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'Follow-Up', label: 'Follow-Up', color: 'bg-orange-100 text-orange-800' },
    { value: 'Hired', label: 'Hired', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    fetchReferenceData();
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchReferenceData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const referenceDoc = await getDoc(doc(db, 'references', user.uid));
        if (referenceDoc.exists()) {
          setReferenceData(referenceDoc.data() as ReferenceData);
        }
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, 'applications'),
          where('referenceId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const apps: Application[] = [];
        
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() } as Application);
        });
        
        // Sort by submission date (newest first)
        apps.sort((a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate());
        setApplications(apps);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
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
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateNote = async (appId: string, note: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        notes: note,
        updatedAt: new Date()
      });
      
      setApplications(prev =>
        prev.map(app =>
          app.id === appId ? { ...app, notes: note } : app
        )
      );
      
      setEditingNote(null);
      setNewNote('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredApplications.map(app => ({
      Name: app.name,
      Email: app.email,
      Phone: app.phone,
      City: app.city,
      Status: app.status,
      'Application Date': app.submittedAt?.toDate().toLocaleDateString(),
      Notes: app.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    
    const filename = `mana-reference-${referenceData?.name?.replace(/\s+/g, '-')?.toLowerCase()}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const sendWhatsApp = (phone: string, name: string) => {
    const message = `Hi ${name}, this is ${referenceData?.name} from ManaCLG LevelUp. Thank you for your application. Let's proceed with the next steps. Please let me know when you're available for a quick discussion.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/reference');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
              <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                Welcome, {referenceData?.name}
              </h1>
              <p className="text-gray-600">Manage your referred applications</p>
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

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none"
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
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

          {/* Applications Table/Cards */}
          <div className="overflow-x-auto">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found</p>
              </div>
            ) : (
              <div className="hidden lg:block">
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
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)} border-none focus:ring-2 focus:ring-orange-500`}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {app.submittedAt?.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => sendWhatsApp(app.phone, app.name)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => makeCall(app.phone)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(app.id);
                              setNewNote(app.notes || '');
                            }}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded"
                            title="Add Note"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredApplications.map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-600">{app.city}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">{app.email}</p>
                    <p className="text-sm text-gray-600">{app.phone}</p>
                    <p className="text-xs text-gray-500">
                      Applied: {app.submittedAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => sendWhatsApp(app.phone, app.name)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => makeCall(app.phone)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingNote(app.id);
                        setNewNote(app.notes || '');
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Note</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add/Edit Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="Add your notes here..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setEditingNote(null);
                  setNewNote('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateNote(editingNote, newNote)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceDashboard;
