
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Users, TrendingUp, Target, LogOut, Search, Filter, Edit2, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Download, MessageCircle, Shield } from 'lucide-react';
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

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = `Hi ${name}, this is ManaCLG LevelUp team. We received your SRM application. Let's connect.`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const exportToExcel = () => {
    // Simple CSV export functionality
    const headers = ['Name', 'Email', 'Phone', 'City', 'Working Hours', 'Weekly Availability', 'Status', 'Sales Completed', 'Application Date'];
    const csvContent = [
      headers.join(','),
      ...applicants.map(app => [
        app.fullName,
        app.email,
        app.phone,
        app.city,
        app.workingHours,
        app.weeklyAvailability,
        app.status,
        app.salesCompleted,
        app.submittedAt?.toDate().toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'srm_applicants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Applicants data has been exported to CSV file",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Contacted':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Hired':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthlyApplicants = applicants.filter(app => {
    const date = app.submittedAt?.toDate();
    return date && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;

  const qualifiedCandidates = applicants.filter(app => app.status === 'Hired').length;
  const totalSales = applicants.reduce((sum, app) => sum + app.salesCompleted, 0);
  const targetAchieved = Math.min((totalSales / (applicants.length * 4) * 100), 100);

  const uniqueCities = [...new Set(applicants.map(app => app.city))];

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
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SRM Admin Dashboard</h1>
                <p className="text-gray-600">ManaCLG LevelUp - Student Relationship Manager</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-300"
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
          <div className="professional-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applicants This Month</p>
                <p className="text-3xl font-bold text-gray-900">{monthlyApplicants}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="professional-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Qualified Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{qualifiedCandidates}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="professional-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">{totalSales}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="professional-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Target Achieved</p>
                <p className="text-3xl font-bold text-gray-900">{targetAchieved.toFixed(1)}%</p>
              </div>
              <Target className="w-10 h-10 text-purple-500" />
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${targetAchieved}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="professional-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:input-focus"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:input-focus"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:input-focus"
              >
                <option value="All">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <div className="flex items-center text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {filteredApplicants.length} of {applicants.length}
                </span>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToExcel}
              className="btn-secondary flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="professional-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{applicant.fullName}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {applicant.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleCallClick(applicant.phone)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Phone className="w-3 h-3 mr-2" />
                            {applicant.phone}
                          </button>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-2" />
                          {applicant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{applicant.workingHours}</div>
                        <div className="text-xs text-gray-600">{applicant.weeklyAvailability}</div>
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
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm focus:input-focus"
                              min="0"
                            />
                            <button
                              onClick={() => updateSalesCount(applicant.id, editingSales)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingApplicant(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{applicant.salesCompleted}</span>
                            <button
                              onClick={() => {
                                setEditingApplicant(applicant.id);
                                setEditingSales(applicant.salesCompleted);
                              }}
                              className="text-gray-400 hover:text-gray-600"
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
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(applicant.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleWhatsAppClick(applicant.phone, applicant.fullName)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Send WhatsApp message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <div className="text-xs text-gray-500">
                          {applicant.submittedAt?.toDate().toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplicants.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applicants found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
