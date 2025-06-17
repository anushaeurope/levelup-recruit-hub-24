
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { Star, StarOff, MessageCircle, Phone, Download, Filter, User as UserIcon, LogOut } from 'lucide-react';

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
  notes?: string;
  starred?: boolean;
}

interface AgentDashboardProps {
  user: User;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [agentName, setAgentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    setAgentName(user.email?.split('@')[0] || 'Agent');
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Get agent's reference name from email prefix or stored data
      const agentReference = user.email?.split('@')[0] || '';
      
      const q = query(
        collection(db, 'applicants'),
        where('reference', '==', agentReference),
        orderBy('submittedAt', 'desc')
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
      toast.error('Failed to load applications');
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

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applicants', submissionId), {
        status: newStatus
      });
      
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      );
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleStar = async (submissionId: string, currentStarred: boolean) => {
    try {
      await updateDoc(doc(db, 'applicants', submissionId), {
        starred: !currentStarred
      });
      
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId ? { ...sub, starred: !currentStarred } : sub
        )
      );
      
      toast.success(currentStarred ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating star:', error);
      toast.error('Failed to update favorite');
    }
  };

  const exportToExcel = () => {
    const filteredData = getFilteredSubmissions();
    const exportData = filteredData.map(submission => ({
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
      Notes: submission.notes || '',
      Starred: submission.starred ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, `mana-levelup-${agentName}-submissions.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  const getFilteredSubmissions = () => {
    return submissions.filter(submission => {
      const dateMatch = !filterDate || 
        submission.submittedAt?.toDate().toISOString().split('T')[0] === filterDate;
      const statusMatch = !filterStatus || 
        (submission.status || 'New') === filterStatus;
      return dateMatch && statusMatch;
    });
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = `Hi ${name}, this is ${agentName} from ManaCLG LevelUp. Thank you for applying as SRM. Our team will be in touch shortly to proceed with your application.`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredSubmissions = getFilteredSubmissions();
  const totalApplications = submissions.length;
  const convertedCount = submissions.filter(s => s.status === 'Hired').length;
  const conversionRate = totalApplications > 0 ? 
    ((convertedCount / totalApplications) * 100).toFixed(1) : '0';

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
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-montserrat">Agent Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {agentName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="professional-card p-6">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Applications</h3>
                <p className="text-3xl font-bold text-orange-500">{totalApplications}</p>
              </div>
            </div>
          </div>
          <div className="professional-card p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Hired</h3>
                <p className="text-3xl font-bold text-green-500">{convertedCount}</p>
              </div>
            </div>
          </div>
          <div className="professional-card p-6">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Success Rate</h3>
                <p className="text-3xl font-bold text-blue-500">{conversionRate}%</p>
              </div>
            </div>
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
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center premium-cta-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="professional-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
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
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleStar(submission.id, submission.starred || false)}
                          className="mr-2 text-yellow-400 hover:text-yellow-500"
                        >
                          {submission.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <div className="font-medium text-gray-900">{submission.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.phone}</div>
                      <div className="text-sm text-gray-500">{submission.email}</div>
                      <div className="text-sm text-gray-500">{submission.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Age: {submission.age}</div>
                      <div className="text-sm text-gray-500">{submission.education}</div>
                      <div className="text-sm text-gray-500">{submission.currentPosition}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submittedAt?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={submission.status || 'New'}
                        onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                        className="text-xs font-semibold rounded-full px-2 py-1 border-0 bg-gray-100 focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Follow-Up">Follow-Up</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => openWhatsApp(submission.phone, submission.fullName)}
                          className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-300"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          WhatsApp
                        </button>
                        <a
                          href={`tel:+91${submission.phone}`}
                          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold transition-colors duration-300 text-center"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
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
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
