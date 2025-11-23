import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import StartChoiceStep from '../components/resume/StartChoiceStep';
import PersonalInfoForm from '../components/resume/PersonalInfoForm';
import WorkExperienceForm from '../components/resume/WorkExperienceForm';
// New Component Needed:
import EducationForm from '../components/resume/EducationForm'; 
import UploadResumeStep from '../components/resume/UploadResumeStep';

function ResumeBuilder() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Use navigate for redirection

  // Step state: mode = build/upload, step = 1,2,...
  // We should also track the user's collar type if we are saving the data
  const [mode, setMode] = useState(null); // 'build' or 'upload'
  const [collarType, setCollarType] = useState(null); // 'white' or 'blue' (Needed for saving)
  const [step, setStep] = useState(1);

  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    // Structure updated to match database models
    experience: [], 
    education: [], 
    // Resume URL is handled by the Upload step
    resumeUrl: null, 
  });

  // Navigation functions
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
  const reset = () => {
    setMode(null);
    setCollarType(null);
    setStep(1);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      experience: [],
      education: [],
      resumeUrl: null,
    });
  };
  
  // Custom select handler to capture collar type alongside mode
  const handleStartSelect = (selectionMode, type) => {
      setMode(selectionMode);
      setCollarType(type);
      // For 'upload' mode, we go directly to the upload step (step 1)
      // For 'build' mode, we may want to ask for collar type first, but since 
      // the initial page (Original) already handles this, we skip to step 1.
  };


  // --- STEP RENDERING ---
  
  // Step 0: Initial Choice (Now asks for Type as well)
  if (!mode) {
    // NOTE: StartChoiceStep component needs updating to accept type selection
    return <StartChoiceStep onSelect={handleStartSelect} />;
  }

  // --- BUILD MODE STEPS ---
  if (mode === 'build') {
      return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>📝 {t('resume_builder')}</h2>
            <p>{t('build_profile_steps')}</p>

            {step === 1 && (
                <PersonalInfoForm
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
                />
            )}

            {step === 2 && (
                <WorkExperienceForm
                formData={formData}
                setFormData={setFormData}
                onNext={nextStep}
                onBack={prevStep}
                />
            )}
            
            {/* NEW: Step 3 for Education (Must be created) */}
            {step === 3 && (
                <EducationForm
                    formData={formData}
                    setFormData={setFormData}
                    // Final step completion
                    onNext={nextStep} 
                    onBack={prevStep}
                />
            )}

            {/* NEW: Final Step - Redirect to specific profile page for final review and save */}
            {step === 4 && (
                <div style={{ padding: '2rem', border: '1px solid #28a745', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>✅ {t('profile_data_collected')}</h3>
                    <p>{t('redirect_to_profile_msg', { type: t(collarType + '_collar') })}</p>
                    <button 
                        onClick={() => navigate(collarType === 'white' ? '/white-collar-profile' : '/blue-collar-profile')}
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
                    >
                        {t('go_to_profile')}
                    </button>
                    <button 
                        onClick={reset}
                        style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
                    >
                        {t('start_over')}
                    </button>
                </div>
            )}
        </div>
      );
  }

  // --- UPLOAD MODE STEP ---
  if (mode === 'upload') {
      return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>📄 {t('upload_resume')}</h2>
            <p>{t('upload_resume_description')}</p>
            <UploadResumeStep
                formData={formData}
                setFormData={setFormData}
                // On complete, redirect to the user's profile page where the resume URL is saved
                onNext={() => navigate(collarType === 'white' ? '/white-collar-profile' : '/blue-collar-profile')}
                onBack={reset}
            />
        </div>
      );
  }
}

export default ResumeBuilder;