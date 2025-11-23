import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

function StartChoiceStep({ onSelect }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [collarType, setCollarType] = useState(null);

  useEffect(() => {
    // Get the 'type' (white or blue) from the URL query parameters
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    setCollarType(type);
  }, [location.search]);

  // The parent component (ResumeBuilder.jsx) expects two arguments: (mode, type)
  const handleSelect = (mode) => {
    if (collarType) {
      onSelect(mode, collarType); // Passing both mode AND type
    } else {
      // Fallback if type is missing
      console.error(t('error_missing_collar_type'));
    }
  };

  if (!collarType) {
    return <div style={{ padding: '1rem' }}>{t('loading_type')}...</div>;
  }
  
  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <h3>{t('how_to_start_profile', { type: t(collarType + '_collar') })}</h3>
      <p style={{ marginBottom: '1.5rem' }}>{t('choose_how_to_resume')}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <button 
          onClick={() => handleSelect('build')} 
          style={{ 
            padding: '15px 30px', 
            fontSize: '1.1rem', 
            borderRadius: '8px', 
            border: '2px solid #007bff', 
            backgroundColor: '#e6f7ff', 
            cursor: 'pointer' 
          }}
        >
          🔨 {t('build_resume')}
        </button>
        <button 
          onClick={() => handleSelect('upload')}
          style={{ 
            padding: '15px 30px', 
            fontSize: '1.1rem', 
            borderRadius: '8px', 
            border: '2px solid #4CAF50', 
            backgroundColor: '#e6ffe6', 
            cursor: 'pointer' 
          }}
        >
          📎 {t('upload_resume_option')}
        </button>
      </div>
    </div>
  );
}

export default StartChoiceStep;