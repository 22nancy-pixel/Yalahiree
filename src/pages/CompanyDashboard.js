import React, { useState, useEffect, useCallback } from 'react';
// يتم افتراض أن هذه المكونات/الخطافات متاحة من بيئة التشغيل
// Mocking the imports to make the single file runnable
const useTranslation = () => ({ 
    // mock function to return the key as the translation
    t: (key) => key, 
    i18n: { changeLanguage: () => console.log('Mock: Language change requested') } 
});
const supabase = { 
    from: () => ({ 
        select: () => ({ 
            eq: () => ({ 
                order: () => ({ 
                    data: [], 
                    error: null 
                }) 
            }),
            data: [],
            error: null
        }),
        update: () => ({
            eq: () => ({ 
                data: [], 
                error: null 
            })
        }),
    }),
    auth: {
        // We assume user is signed in for dashboard to load
        signOut: async () => console.log("Mock Sign Out executed.")
    }
};
// Mocking useSession to provide a fixed company user
const useSession = () => ({
    user: { 
        id: "company-user-123", 
        email: "company_rep@mock.com", 
        user_metadata: { type: "company" }, 
        uid: "user-abc-123"
    } 
});

// Mock for a custom alert/confirm dialog
function CustomModal({ message, onConfirm, onCancel, showConfirm = true }) {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                <p className="text-gray-800 mb-4">{message}</p>
                <div className="flex justify-end space-x-3">
                    {showConfirm && (
                        <button 
                            onClick={onConfirm}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                        >
                            Confirm
                        </button>
                    )}
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                    >
                        {showConfirm ? 'Cancel' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Global API constants
const API_CONSTANTS = {
    apiKey: "", // Left empty for Canvas runtime
    apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`,
};


export default function CompanyDashboard() {
  const { t } = useTranslation();
  const session = useSession();
  const user = session?.user;

  // State for Supabase data
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);

  // State for AI generator
  const [jobTitle, setJobTitle] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // State for Custom Modal
  const [modal, setModal] = useState({
    message: '',
    show: false,
    onConfirm: null,
    onCancel: () => setModal({ show: false, message: '' }),
    showConfirm: true,
  });


  // --- 1. Fetch Company Notifications (Mocked) ---
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      // Mock Data structure for testing UI
      const mockData = [
        { id: 1, created_at: new Date().toISOString(), message: "New application received for 'Marketing Manager'.", is_read: false },
        { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), message: "Your job 'Engineer' was approved.", is_read: true },
      ];
      setNotifications(mockData);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  }, [user]);

  // --- 2. Fetch Posted Jobs and Applications (Mocked) ---
  const fetchPostedJobs = useCallback(async () => {
    if (!user) return;
    try {
      // Mock Data structure for testing UI
      const mockJobData = [
        {
          id: 101, title: 'Senior Developer', type: 'white',
          applications: [
            { id: 501, status: 'applied', application_date: new Date().toISOString(), candidate_profile: { full_name: 'Ahmed Youssef', phone: '123456789', location: 'Cairo' } },
            { id: 502, status: 'reviewed', application_date: new Date().toISOString(), candidate_profile: { full_name: 'Sara Ali', phone: '987654321', location: 'Dubai' } },
          ]
        },
        {
            id: 102, title: 'Logistics Driver', type: 'blue',
            applications: [
              { id: 503, status: 'interview', application_date: new Date().toISOString(), candidate_profile: { full_name: 'Khalid Hassan', phone: '555111222', location: 'Riyadh' } },
            ]
        }
      ];

      setPostedJobs(mockJobData);
    } catch (err) {
      console.error('Error fetching jobs and applications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPostedJobs();
    } else {
        setLoading(false);
    }
  }, [user, fetchNotifications, fetchPostedJobs]);
  
  // --- 3. Handle Notification Read Status (Mocked) ---
  const markNotificationAsRead = async (id) => {
      // Mock update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      console.log(`Mock: Notification ${id} marked as read.`);
  };

  // --- 4. Handle Application Status Update (Uses Custom Modal) ---
  const updateApplicationStatus = async (applicationId, newStatus) => {
      const handleConfirm = async () => {
          setModal({ show: false, message: '' });
          try {
              // Mock status update
              console.log(`Mock: Updating application ${applicationId} status to ${newStatus}`);
              
              // Simulate success and re-fetch (mocked)
              await fetchPostedJobs(); 
              
              setModal({
                  message: t(`Status updated to ${newStatus}`),
                  show: true,
                  onCancel: () => setModal({ show: false, message: '' }),
                  showConfirm: false // Show an alert-style message
              });
          } catch (err) {
              console.error('Error updating status:', err.message);
              setModal({
                  message: t(`Error updating status: ${err.message}`),
                  show: true,
                  onCancel: () => setModal({ show: false, message: '' }),
                  showConfirm: false
              });
          }
      };

      setModal({
          message: t(`Change status of application ${applicationId} to ${newStatus}?`),
          show: true,
          onConfirm: handleConfirm,
          onCancel: () => setModal({ show: false, message: '' }),
          showConfirm: true,
      });
  };

  // --- 5. AI Job Description Generator Logic ---
  const generateJobDescription = useCallback(async () => {
    if (!jobTitle.trim()) {
        setAiError(t("Please enter a job title."));
        return;
    }

    setAiLoading(true);
    setGeneratedText("");
    setAiError(null);

    const systemPrompt = "You are a recruitment specialist. Generate a professional and comprehensive job description (including requirements, responsibilities, and benefits) for the following job title. Format the output using Markdown lists for readability.";
    const userQuery = `Job Title: ${jobTitle}`;
    const maxRetries = 5;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
        attempt++;
        try {
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                // Add Google Search grounding for fresh data if relevant
                tools: [{ "google_search": {} }],
            };

            const url = API_CONSTANTS.apiUrl + API_CONSTANTS.apiKey;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API response status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                setGeneratedText(text);
                setAiLoading(false);
                return; // Success
            } else {
                throw new Error("Received empty response from the AI model.");
            }

        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // Failed after all retries
    setAiLoading(false);
    setAiError(t("Failed to generate description after multiple attempts. Error: ") + lastError.message);

  }, [jobTitle, t]);


  if (loading) return <div className="p-4 text-center text-lg">{t('loading_dashboard')}</div>;
  if (!user) return <div className="p-4 text-center text-lg text-red-500">{t('please_log_in')}</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const applicationStatuses = ['applied', 'reviewed', 'interview', 'rejected', 'hired'];

  const Card = ({ title, children }) => (
    <div className="border border-gray-200 rounded-xl p-6 mb-6 shadow-md bg-white">
      <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-indigo-700">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto font-inter">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 {t('company_dashboard')}</h2>
      
      {/* Custom Modal for Confirmation/Alerts */}
      <CustomModal 
          message={modal.message} 
          onConfirm={modal.onConfirm} 
          onCancel={modal.onCancel} 
          showConfirm={modal.showConfirm}
      />


      {/* AI JOB GENERATOR SECTION */}
      <Card title={t('AI Job Description Generator')}>
            <p className="mt-2 text-gray-500 mb-6">
                {t("Use AI to instantly draft a complete job description. Enter a title below.")}
            </p>

            <div className="space-y-4">
                {/* Input Field */}
                <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                        {t("Job Title")}
                    </label>
                    <input
                        type="text"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder={t("e.g., Senior Data Scientist")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={aiLoading}
                    />
                </div>

                {/* Action Button */}
                <button
                    onClick={generateJobDescription}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 disabled:opacity-50"
                    disabled={aiLoading}
                >
                    {aiLoading ? t("Generating...") : t("Generate Description")}
                </button>
            </div>

            {/* Error Message */}
            {aiError && (
                <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                    <p className="font-medium">{t("Error")}: {aiError}</p>
                </div>
            )}

            {/* Generated Output */}
            {generatedText && (
                <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner">
                    <h3 className="text-xl font-bold mb-3 text-indigo-800">{t("Generated Job Description")}</h3>
                    {/* Render the markdown text directly */}
                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                        {generatedText}
                    </pre>
                </div>
            )}
      </Card>


      {/* NOTIFICATION CENTER */}
      <Card title={`🔔 ${t('Notifications')} (${unreadCount} ${t('unread')})`}>
        {notifications.length === 0 ? (
          <p className="text-gray-500">{t('no_notifications')}</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-3 border rounded-lg flex justify-between items-center transition ${n.is_read ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}
              >
                <p className={`m-0 text-sm ${n.is_read ? 'text-gray-600 font-normal' : 'text-gray-900 font-medium'}`}>
                  {new Date(n.created_at).toLocaleDateString()} - {n.message}
                </p>
                {!n.is_read && (
                  <button 
                    onClick={() => markNotificationAsRead(n.id)}
                    className="px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full hover:bg-cyan-600 transition"
                  >
                    {t('mark_read')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* JOB & APPLICATION MANAGEMENT */}
      <Card title={t('posted_jobs_and_applications')}>
        {postedJobs.length === 0 ? (
          <p className="text-gray-600">
            {t('no_jobs_posted')}. {t('go_to_profile_to_post_job')}.
            <Link to="/company-profile" className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold">{t('manage_profile')}</Link>
          </p>
        ) : (
          postedJobs.map(job => (
            <div key={job.id} className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                {job.title} <span className="text-sm text-gray-500">({job.type === 'white' ? t('White Collar') : t('Blue Collar')})</span>
              </h4>
              <p className="text-sm text-gray-700 mb-3">Applications Received: <span className="font-bold">{job.applications.length}</span></p>

              {/* APPLICATIONS LIST */}
              {job.applications.length > 0 ? (
                <div className="mt-3 border-t pt-3 border-gray-200 space-y-3">
                  <h5 className="text-base font-semibold text-gray-700">Candidate Applications:</h5>
                  {job.applications.map(app => (
                    <div 
                      key={app.id} 
                      className={`p-3 border rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition ${app.status === 'applied' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}
                    >
                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 m-0 truncate">
                              {app.candidate_profile?.full_name || t('Candidate (Profile Missing)')} 
                              <span className="font-normal text-gray-500 text-xs ml-2">({new Date(app.application_date).toLocaleDateString()})</span>
                          </p>
                          <p className="m-0 text-xs text-gray-600">
                              {t('Location')}: {app.candidate_profile?.location || t('N/A')} | {t('Phone')}: {app.candidate_profile?.phone || t('N/A')}
                          </p>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${app.status === 'hired' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {t('Status')}: {app.status.toUpperCase()}
                          </span>

                          {/* Status Update Dropdown */}
                          <div>
                              <label className="sr-only">{t('Update Status')}</label>
                              <select 
                                  value={app.status} 
                                  onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                  className="p-1.5 border border-gray-300 rounded-md text-sm cursor-pointer focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                  {applicationStatuses.map(status => (
                                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-400">{t('no_applications_yet')}</p>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}