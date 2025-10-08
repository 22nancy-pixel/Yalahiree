// src/components/resume/ResumeReview.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
function ResumeReview({ formData, onBack, onSubmit }) {
  const { t } = useTranslation();
  return (
    <div>
      <h3>{t('review_resume')}</h3>
      <div>
        <strong>{t('full_name')}:</strong> {formData.fullName}
      </div>
      <div>
        <strong>{t('email')}:</strong> {formData.email}
      </div>
      <div>
        <strong>{t('phone')}:</strong> {formData.phone}
      </div>
      <div>
        <strong>{t('location')}:</strong> {formData.location}
      </div>
      {formData.experience?.jobTitle && (
        <>
          <h4>{t('work_experience')}</h4>
          <div>
            <strong>{t('job_title')}:</strong> {formData.experience.jobTitle}
          </div>
          <div>
            <strong>{t('company')}:</strong> {formData.experience.company}
          </div>
          <div>
            <strong>{t('start_date')}:</strong> {formData.experience.startDate}
          </div>
          <div>
            <strong>{t('end_date')}:</strong> {formData.experience.endDate}
          </div>
          <div>
            <strong>{t('description')}:</strong> {formData.experience.description}
          </div>
        </>
      )}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack}>{t('back')}</button>
        <button onClick={onSubmit} style={{ marginLeft: '1rem' }}>{t('submit_resume')}</button>
      </div>
    </div>
  );
}
export default ResumeReview;