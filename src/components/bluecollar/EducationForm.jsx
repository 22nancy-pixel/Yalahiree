import React from 'react';
import { useTranslation } from 'react-i18next';

export default function EducationForm({ formData, setFormData, onNext, onBack, optional, labels }) {
  const { t } = useTranslation();

  const handleChange = (index, field, value) => {
    const newEdu = [...formData.education];
    newEdu[index][field] = value;
    setFormData({ ...formData, education: newEdu });
  };

  const addEducation = () => {
    setFormData({ ...formData, education: [...formData.education, { degree: '', institution: '', year: '' }] });
  };

  return (
    <div>
      <h3>{labels?.title || t('education')}</h3>
      <p>{labels?.description || t('education_optional')}</p>

      {formData.education.map((edu, index) => (
        <div key={index} style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
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
        </div>
      ))}

      <button type="button" onClick={addEducation} style={{ background: '#007BFF', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        ➕ {t('add_education')}
      </button>

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={onBack}>{t('back')}</button>
        <button onClick={onNext} style={{ marginLeft: '1rem', backgroundColor: '#28a745', color: 'white' }}>
          {t('next')}
        </button>
      </div>
    </div>
  );
}
