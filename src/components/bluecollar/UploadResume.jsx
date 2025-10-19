import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function UploadResumeStep({ formData, setFormData, onNext, onBack, labels }) {
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError(t('upload_pdf_only'));
      return;
    }
    setError('');
    setFormData({ ...formData, resume: file });
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">{labels?.title || t('upload_resume_optional')}</h2>
      <p className="text-gray-500 text-center mb-6">{labels?.description || t('upload_resume_description')}</p>

      <label htmlFor="resume" className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 text-center transition">
        <span className="text-gray-600 font-medium">{labels?.clickToUpload || t('click_to_upload')}</span>
        <input type="file" id="resume" accept=".pdf" onChange={handleFileChange} className="hidden" />
      </label>

      {formData.resume && <p className="mt-3 text-green-600 font-medium">{formData.resume.name} {t('uploaded_successfully')}</p>}
      {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}

      <div className="flex justify-between w-full mt-8">
        <button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-xl">{t('back')}</button>
        <div className="flex gap-3">
          <button onClick={onNext} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-xl">{t('next')}</button>
          <button onClick={onNext} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-xl">{t('skip')}</button>
        </div>
      </div>
    </div>
  );
}
