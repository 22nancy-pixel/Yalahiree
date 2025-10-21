import React from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fr, ar } from 'date-fns/locale';
import { useEffect, useState } from 'react';

registerLocale('fr', fr);
registerLocale('ar', ar);

function WorkExperienceForm({ formData, setFormData, onNext, onBack }) {
  const { t, i18n } = useTranslation();

  const handleChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData({ ...formData, experience: updatedExperience });
  };

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { jobTitle: '', company: '', startDate: null, endDate: null, description: '' }
      ]
    });
  };

  const handleRemoveExperience = (index) => {
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: updatedExperience });
  };

  const getLocale = () => {
    if (i18n.language === 'fr') return 'fr';
    if (i18n.language === 'ar') return 'ar';
    return 'en';
  };

  return (
    <div>
      <h3>{t('work_experience')}</h3>
      {formData.experience.map((exp, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '6px' }}>
          <label>{t('job_title')}</label>
          <input
            type="text"
            value={exp.jobTitle}
            onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
          />
          <br />
          <label>{t('company')}</label>
          <input
            type="text"
            value={exp.company}
            onChange={(e) => handleChange(index, 'company', e.target.value)}
          />
          <br />
          <label>{t('start_date')}</label>
          <DatePicker
            selected={exp.startDate ? new Date(exp.startDate) : null}
            onChange={(date) => handleChange(index, 'startDate', date)}
            placeholderText={t('start_date')}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            locale={getLocale()}
          />
          <br />
          <label>{t('end_date')}</label>
          <DatePicker
            selected={exp.endDate ? new Date(exp.endDate) : null}
            onChange={(date) => handleChange(index, 'endDate', date)}
            placeholderText={t('end_date')}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            locale={getLocale()}
          />
          <br />
          <label>{t('description')}</label>
          <textarea
            value={exp.description}
            onChange={(e) => handleChange(index, 'description', e.target.value)}
          />
          <br />
          {formData.experience.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveExperience(index)}
              style={{ marginTop: '0.5rem', backgroundColor: '#F44336', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px' }}
            >
              {t('remove_experience')}
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddExperience}
        style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}
      >
        {t('add_experience')}
      </button>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack} style={{ marginRight: '1rem' }}>
          {t('back')}
        </button>
        <button onClick={onNext}>
          {t('next')}
        </button>
      </div>
    </div>
  );
}

export default WorkExperienceForm;
