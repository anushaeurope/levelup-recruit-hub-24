
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Users, TrendingUp, Target, LogOut, Search, Filter, Edit2, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  workingHours: string;
  weeklyAvailability: string;
  whyThisRole: string;
  status: 'New' | 'Contacted' | 'Hired';
  salesCompleted: number;
  submittedAt: Timestamp;
}

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [editingApplicant, setEditingApplicant] = useState<string | null>(null);
  const [editingSales, setEditingSales] = useState<number>(0);

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    filterApplicants();
  }, [applicants, searchTerm, statusFilter, cityFilter]);

  const fetchApplicants = async () => {
    try {
      const q = query(collection(db, 'applicants'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const applicantsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Applicant[];
      
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applicants data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplicants = () => {
    let filtered = applicants;

    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter);
    }

    if (cityFilter !== 'All') {
      filtered = filtered.filter(applicant => applicant.city === cityFilter);
    }

    setFilteredApplicants(filtered);
  };

  const updateApplicantStatus = async (id: string, newStatus: 'New' | 'Contacted' | 'Hired') => {
    try {
      await updateDoc(doc(db, 'applicants', id), { status: newStatus });
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      toast({
        title: "Status Updated",
        description: `Applicant status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const updateSalesCount = async (id: string, salesCount: number) => {
    try {
      await updateDoc(doc(db, 'applicants', id), { salesCompleted: salesCount });
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, salesCompleted: salesCount } : app
      ));
      setEditingApplicant(null);
      toast({
        title: "Sales Updated",
        description: `Sales count updated to ${salesCount}`,
      });
    } catch (error) {
      console.error('Error updating sales:', error);
      toast({
        title: "Error",
        description: "Failed to update sales count",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'Contacted':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Hired':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Contacted':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hired':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisWeek = Math.ceil(new Date().getDate() / 7);

  const monthlyApplicants = applicants.filter(app => {
    const date = app.submittedAt?.toDate();
    return date && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;

  const weeklyRegistrations = applicants.filter(app => app.salesCompleted > 0).length;
  const totalSales = applicants.reduce((sum, app) => sum + app.salesCompleted, 0);
  const targetAchieved = Math.min((totalSales / (applicants.length * 4) * 100), 100);

  const uniqueCities = [...new Set(applicants.map(app => app.city))];

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
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SRM Admin Dashboard</h1>
              <p className="text-gray-400">ManaCLG LevelUp - Student Relationship Manager</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-600/30 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applicants This Month</p>
                <p className="text-2xl font-bold text-white">{monthlyApplicants}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active SRMs</p>
                <p className="text-2xl font-bold text-white">{applicants.filter(app => app.status === 'Hired').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white">{totalSales}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Target Achieved</p>
                <p className="text-2xl font-bold text-white">{targetAchieved.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-3 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${targetAchieved}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Hired">Hired</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <div className="flex items-center text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Showing {filteredApplicants.length} of {applicants.length} applicants
              </span>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Applicant</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Availability</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Sales</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-700/30 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{applicant.fullName}</div>
                        <div className="text-sm text-gray-400 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {applicant.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-300">
                          <Phone className="w-3 h-3 mr-2" />
                          {applicant.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="w-3 h-3 mr-2" />
                          {applicant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-300">{applicant.workingHours}</div>
                        <div className="text-xs text-gray-400">{applicant.weeklyAvailability}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {editingApplicant === applicant.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editingSales}
                              onChange={(e) => setEditingSales(Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                              min="0"
                            />
                            <button
                              onClick={() => updateSalesCount(applicant.id, editingSales)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingApplicant(null)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{applicant.salesCompleted}</span>
                            <button
                              onClick={() => {
                                setEditingApplicant(applicant.id);
                                setEditingSales(applicant.salesCompleted);
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={applicant.status}
                        onChange={(e) => updateApplicantStatus(applicant.id, e.target.value as 'New' | 'Contacted' | 'Hired')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(applicant.status)} bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(applicant.status)}
                        <span className="text-xs text-gray-400">
                          {applicant.submittedAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplicants.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No applicants found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
