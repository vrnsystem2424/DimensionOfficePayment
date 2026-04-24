
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

import Summary   from '../summary/page';
import Approve1  from '../Office/Approve1/page';
import Approve2  from '../Office/Approvel2/page';
import BillEntry from '../Office/BillEntry/page';
import Payment   from '../Office/Payment/page';

// reconciliation
import Reconciliation from '../reconciliation/Reconciliation/Reconciliation';
import Form from '../reconciliation/Form/Form';
import ActualPaymentIn from '../reconciliation/ActualPyamentIN/ActualPaymentIn';
import TransferBank from '../reconciliation/transferBank/transferbank';

const USER_TABS = {
  ADMIN: ['summary', 'approve1', 'approve2', 'billentry', 'payment', 'reconciliation', 'form', 'actualpayment', 'transferbank'],
  VIJAY: ['approve1', 'billentry', 'payment', 'reconciliation', 'form'],
  RICHA: ['approve1'],
};

const OFFICE_TABS = ['approve1', 'approve2', 'billentry', 'payment'];
const PAYMENT_TABS = ['reconciliation', 'form', 'actualpayment', 'transferbank'];

const TAB_LABELS = {
  summary: 'Summary',
  approve1: 'Approve 1',
  approve2: 'Approve 2',
  billentry: 'Bill Entry',
  payment: 'Payment',
  reconciliation: 'Reconciliation',
  form: 'Form',
  actualpayment: 'Actual Payment In',
  transferbank: 'Transfer Bank',
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allowedTabs, setAllowedTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [officeDropdownOpen, setOfficeDropdownOpen] = useState(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');

    if (!token) { router.push('/login'); return; }

    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      const key = (parsed?.userType || '').toUpperCase().replace(/\s+/g, '');
      const tabs = USER_TABS[key] || ['summary'];
      setAllowedTabs(tabs);
      setActiveTab(tabs[0]);
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/login');
  };

  const closeDropdowns = () => {
    setOfficeDropdownOpen(false);
    setPaymentDropdownOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':        return <Summary user={user} />;
      case 'approve1':       return <Approve1 user={user} />;
      case 'approve2':       return <Approve2 user={user} />;
      case 'billentry':      return <BillEntry user={user} />;
      case 'payment':        return <Payment user={user} />;
      case 'reconciliation': return <Reconciliation user={user} />;
      case 'form':           return <Form user={user} />;
      case 'actualpayment':  return <ActualPaymentIn user={user} />;
      case 'transferbank':   return <TransferBank user={user} />;
      default:               return <Summary user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const visibleOfficeTabs = OFFICE_TABS.filter(t => allowedTabs.includes(t));
  const visiblePaymentTabs = PAYMENT_TABS.filter(t => allowedTabs.includes(t));
  const showSummary = allowedTabs.includes('summary');
  const showOffice = visibleOfficeTabs.length > 0;
  const showPayment = visiblePaymentTabs.length > 0;

  // reconciliation group के tabs को full width में दिखाना
  const isReconciliationTab = ['reconciliation', 'form', 'actualpayment', 'transferbank'].includes(activeTab);

  return (
    <div className="min-h-screen bg-gray-50" onClick={closeDropdowns}>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 mr-3">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-800 hidden sm:block">Dimension</span>
            </div>

            {/* Center tabs */}
            <div className="hidden lg:flex flex-1 justify-center items-center space-x-6">
              {showSummary && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTab('summary'); closeDropdowns(); }}
                  className={`px-5 py-2 rounded-lg font-medium text-base transition-colors ${
                    activeTab === 'summary' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Summary
                </button>
              )}

              {showOffice && (
                <div className="relative">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOfficeDropdownOpen(!officeDropdownOpen); 
                      setPaymentDropdownOpen(false); 
                    }}
                    className={`flex items-center space-x-1.5 px-5 py-2 rounded-lg font-medium text-base transition-colors ${
                      OFFICE_TABS.includes(activeTab) ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>Office</span>
                    {officeDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {officeDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      {visibleOfficeTabs.map(tab => (
                        <button
                          key={tab}
                          onClick={(e) => { e.stopPropagation(); setActiveTab(tab); setOfficeDropdownOpen(false); }}
                          className={`w-full px-5 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                            activeTab === tab ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {TAB_LABELS[tab]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showPayment && (
                <div className="relative">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setPaymentDropdownOpen(!paymentDropdownOpen); 
                      setOfficeDropdownOpen(false); 
                    }}
                    className={`flex items-center space-x-1.5 px-5 py-2 rounded-lg font-medium text-base transition-colors ${
                      PAYMENT_TABS.includes(activeTab) ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>Payment</span>
                    {paymentDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {paymentDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                      {visiblePaymentTabs.map(tab => (
                        <button
                          key={tab}
                          onClick={(e) => { e.stopPropagation(); setActiveTab(tab); setPaymentDropdownOpen(false); }}
                          className={`w-full px-5 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                            activeTab === tab ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {TAB_LABELS[tab]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right - user info + logout */}
            <div className="flex items-center space-x-3">
              {user?.name && (
                <span className="hidden md:block text-sm text-gray-600">{user.name}</span>
              )}
              {user?.userType && (
                <span className="hidden sm:block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {user.userType}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-64 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <span className="font-bold text-gray-800">Dimension</span>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {visibleOfficeTabs.length > 0 && (
                <div className="mb-4">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Office</p>
                  {visibleOfficeTabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
                      className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                        activeTab === tab ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>
              )}

              {visiblePaymentTabs.length > 0 && (
                <div className="mb-4">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Payment</p>
                  {visiblePaymentTabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
                      className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                        activeTab === tab ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {TAB_LABELS[tab]}
                    </button>
                  ))}
                </div>
              )}

              {showSummary && (
                <button
                  onClick={() => { setActiveTab('summary'); setSidebarOpen(false); }}
                  className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                    activeTab === 'summary' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Summary
                </button>
              )}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - reconciliation tabs को complete full-width */}
      <div className="pt-16 lg:pt-20">  {/* header height adjust */}
        {isReconciliationTab ? (
          // Full width for reconciliation tabs - no container, no padding restriction
          <div className="w-screen min-h-[calc(100vh-4rem)]">
            {renderContent()}
          </div>
        ) : (
          // Other tabs - keep centered
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[calc(100vh-9rem)]">
              <h2 className="text-lg font-bold text-gray-800 mb-5">
                {TAB_LABELS[activeTab]}
              </h2>
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}