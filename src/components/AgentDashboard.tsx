
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from 'firebase/auth';
import * as XLSX from 'xlsx';

interface Submission {
  id: string;
  name: string;
  phone: string;
  city: string;
  age: number;
  gender: string;
  education: string;
  currentPosition: string;
  reference: string;
  createdAt: any;
  status?: string;
}

interface AgentDashboardProps {
  user: User;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // For demo purposes, we'll assume the agent's email matches their reference name
      // In production, you'd have a proper mapping in Firestore
      const agentReference = user.email?.split('@')[0] || '';
      
      const q = query(
        collection(db, 'users'),
        where('reference', '==', agentReference),
        orderBy('createdAt', 'desc')
      );
      
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
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
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

  const exportToExcel = () => {
    const filteredData = getFilteredSubmissions();
    const exportData = filteredData.map(submission => ({
      Name: submission.name,
      Phone: submission.phone,
      City: submission.city,
      Age: submission.age,
      Gender: submission.gender,
      Education: submission.education,
      'Current Position': submission.currentPosition,
      Reference: submission.reference,
      'Registration Date': submission.createdAt?.toDate().toLocaleDateString(),
      Status: submission.status || 'New'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Referrals');
    XLSX.writeFile(wb, `referrals-${user.email?.split('@')[0]}-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(submission => {
      const dateMatch = !filterDate || 
        submission.createdAt?.toDate().toISOString().split('T')[0] === filterDate;
      const statusMatch = !filterStatus || 
        (submission.status || 'New') === filterStatus;
      return dateMatch && statusMatch;
    });
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = `Hi ${name}, thank you for applying as SRM at ManaCLG LevelUp. Our team will be in touch shortly.`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredSubmissions = getFilteredSubmissions();
  const conversionRate = submissions.length > 0 ? 
    ((submissions.filter(s => s.status === 'Converted').length / submissions.length) * 100).toFixed(1) : '0';

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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
              alt="ManaCLG LevelUp Logo"
              className="h-10 w-auto mr-4"
            />
            <h1 className="text-xl font-bold text-gray-900 font-montserrat">Agent Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Referrals</h3>
            <p className="text-3xl font-bold text-orange-500">{submissions.length}</p>
          </div>
          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Converted</h3>
            <p className="text-3xl font-bold text-green-500">
              {submissions.filter(s => s.status === 'Converted').length}
            </p>
          </div>
          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-blue-500">{conversionRate}%</p>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="professional-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="premium-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="premium-input"
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="premium-cta-button"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="professional-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{submission.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.phone}</div>
                      <div className="text-sm text-gray-500">{submission.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Age: {submission.age}</div>
                      <div className="text-sm text-gray-500">{submission.education}</div>
                      <div className="text-sm text-gray-500">{submission.currentPosition}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.createdAt?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (submission.status || 'New') === 'New' ? 'bg-blue-100 text-blue-800' :
                        (submission.status || 'New') === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {submission.status || 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => openWhatsApp(submission.phone, submission.name)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-300"
                        >
                          💬 WhatsApp
                        </button>
                        <a
                          href={`tel:+91${submission.phone}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-300 text-center"
                        >
                          📞 Call
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No referrals found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
