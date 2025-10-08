import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
function UploadResumeStep({ formData, setFormData, onNext, onBack }) {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError(t('invalid_file'));
        return;
      }
      setError(null);
      setFormData({ ...formData, uploadedResume: file });
    }
  };
  return (
    <div>
      <h3>{t('upload_resume')}</h3>
      <p>{t('upload_instructions')}</p>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      {formData.uploadedResume && <p>{t('file_uploaded')}: {formData.uploadedResume.name}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack}>{t('back')}</button>
        <button onClick={() => onNext()} disabled={!formData.uploadedResume}>{t('next')}</button>
      </div>
    </div>
  );
}
export default UploadResumeStep;