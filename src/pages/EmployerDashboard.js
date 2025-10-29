// import React from 'react';
// import { useTranslation } from 'react-i18next';

// function EmployerDashboard() {
//   return <h2>📊 Employer Dashboard (Coming Soon)</h2>;
// }

// export default EmployerDashboard;
import React from 'react';
import { useTranslation } from 'react-i18next';

function EmployerDashboard() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📊 {t('dashboard')}</h2>
      <p>{t('dashboard_description') || "View analytics and manage your job postings."}</p>
    </div>
  );
}

export default EmployerDashboard;
