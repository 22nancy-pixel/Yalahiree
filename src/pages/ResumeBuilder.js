import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import StartChoiceStep from '../components/resume/StartChoiceStep';
import PersonalInfoForm from '../components/resume/PersonalInfoForm';
import WorkExperienceForm from '../components/resume/WorkExperienceForm';
import UploadResumeStep from '../components/resume/UploadResumeStep';

function ResumeBuilder() {
  const { t } = useTranslation();

  // Step state: mode = build/upload, step = 1,2,...
  const [mode, setMode] = useState(null); // 'build' or 'upload'
  const [step, setStep] = useState(1);

  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    experience: [
      {
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ],
    uploadedResume: null,
  });

  // Navigation functions
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const reset = () => {
    setMode(null);
    setStep(1);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      experience: [
        {
          jobTitle: '',
          company: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
      uploadedResume: null,
    });
  };

  // Step 0: Let user choose to build or upload
  if (!mode) {
    return <StartChoiceStep onSelect={setMode} />;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>📝 {t('resume')}</h2>
      <p>{t('resume_description')}</p>

      {/* Build Resume Steps */}
      {mode === 'build' && step === 1 && (
        <PersonalInfoForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
        />
      )}

      {mode === 'build' && step === 2 && (
        <WorkExperienceForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {/* Upload Resume Step */}
      {mode === 'upload' && step === 1 && (
        <UploadResumeStep
          formData={formData}
          setFormData={setFormData}
          onNext={() => alert(t('thanks_uploaded'))}
          onBack={reset}
        />
      )}
    </div>
  );
}

export default ResumeBuilder;
