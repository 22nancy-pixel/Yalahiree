import React from 'react';
import { useTranslation } from 'react-i18next';

export default function WorkExperienceForm({ formData, setFormData, onNext, onBack, required, labels }) {
  const { t } = useTranslation();

  const handleChange = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = value;
    setFormData({ ...formData, experience: newExp });
  };

  const addExperience = () => {
    const newExp = [...formData.experience, { jobTitle: '', company: '', startDate: '', endDate: '', description: '' }];
    setFormData({ ...formData, experience: newExp });
  };

  const handleSubmit = () => {
    if (required && !formData.experience.some(exp => exp.jobTitle && exp.company)) {
      alert(t('please_add_experience'));
      return;
    }
    onNext();
  };

  return (
    <div>
      <h3>{labels?.title || t('work_experience')}</h3>
      <p>{labels?.description || t('add_previous_jobs')}</p>

      {formData.experience.map((exp, index) => (
        <div key={index} style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder={labels?.jobTitle || t('job_title')}
            value={exp.jobTitle}
            onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <input
            type="text"
            placeholder={labels?.company || t('company')}
            value={exp.company}
            onChange={(e) => handleChange(index, 'company', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="month"
              placeholder={labels?.startDate || t('start_date')}
              value={exp.startDate}
              onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <input
              type="month"
              placeholder={labels?.endDate || t('end_date')}
              value={exp.endDate}
              onChange={(e) => handleChange(index, 'endDate', e.target.value)}
              style={{ flex: 1, padding: '0.5rem' }}
            />
          </div>
          <textarea
            placeholder={labels?.description || t('description')}
            value={exp.description}
            onChange={(e) => handleChange(index, 'description', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', minHeight: '60px' }}
          />
        </div>
      ))}

      <button type="button" onClick={addExperience} style={{ background: '#007BFF', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        ➕ {t('add_experience')}
      </button>

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={onBack}>{t('back')}</button>
        <button onClick={handleSubmit} style={{ marginLeft: '1rem', backgroundColor: '#28a745', color: 'white' }}>
          {t('next')}
        </button>
      </div>
    </div>
  );
}
