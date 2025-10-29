import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function EducationForm({ formData, setFormData, onNext, onBack, optional, labels }) {
  const { t } = useTranslation();

  // Ensure education is always an array, but never auto-add new rows
  const [educationList, setEducationList] = useState(() =>
    Array.isArray(formData.education) ? formData.education : []
  );

  // Sync parent data only if it changes (prevents duplication)
  useEffect(() => {
    if (Array.isArray(formData.education) && formData.education.length !== educationList.length) {
      setEducationList(formData.education);
    }
  }, [formData.education]);

  const handleChange = (index, field, value) => {
    const newEdu = educationList.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducationList(newEdu);
    setFormData({ ...formData, education: newEdu });
  };

  const addEducation = () => {
    const newEdu = [...educationList, { degree: '', institution: '', year: '' }];
    setEducationList(newEdu);
    setFormData({ ...formData, education: newEdu });
  };

  const removeEducation = (index) => {
    const newEdu = educationList.filter((_, i) => i !== index);
    setEducationList(newEdu);
    setFormData({ ...formData, education: newEdu });
  };

  return (
    <div>
      <h3>{labels?.title || t('education')}</h3>
      <p>{labels?.description || t('education_optional')}</p>

      {educationList.length === 0 && (
        <p style={{ color: '#777' }}>{t('no_education_added')}</p>
      )}

      {educationList.map((edu, index) => (
        <div
          key={index}
          style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <input
            type="text"
            placeholder={labels?.degree || t('degree')}
            value={edu.degree}
            onChange={(e) => handleChange(index, 'degree', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <input
            type="text"
            placeholder={labels?.institution || t('institution')}
            value={edu.institution}
            onChange={(e) => handleChange(index, 'institution', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <input
            type="text"
            placeholder={labels?.year || t('year')}
            value={edu.year}
            onChange={(e) => handleChange(index, 'year', e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />

          {educationList.length > 1 && (
            <button
              type="button"
              onClick={() => removeEducation(index)}
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#F44336',
                color: 'white',
                border: 'none',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
              }}
            >
              {t('remove_education')}
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        style={{
          background: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        ➕ {t('add_education')}
      </button>

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={onBack}>{t('back')}</button>
        <button
          onClick={onNext}
          style={{
            marginLeft: '1rem',
            backgroundColor: '#28a745',
            color: 'white',
          }}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}
