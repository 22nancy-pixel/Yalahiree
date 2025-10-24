// src/pages/WhiteCollarProfile.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EducationForm from '../components/bluecollar/EducationForm';
import SkillsForm from '../components/bluecollar/SkillsStep';
import WorkExperienceForm from '../components/resume/WorkExperienceForm';
import UploadResumeStep from '../components/bluecollar/UploadResume';
import PersonalInfoForm from '../components/whitecollar/PersonalInfo';

function ResumeBuilderWhiteCollar() {
  const { t } = useTranslation();

  const [step, setStep] = useState(1);

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
    education: [
      {
        degree: '',
        institution: '',
        year: '',
      },
    ],
    skills: [],
    otherSkill: '',
    uploadedResume: null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>💼 {t('build_profile')}</h2>
      <p>{t('whitecollar_profile_description') || 'Complete your professional profile for employers to find you.'}</p>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <PersonalInfoForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          fields={['fullName', 'email', 'phone', 'location']}
          labels={{
            fullName: t('full_name'),
            email: t('email'),
            phone: t('phone_number'),
            location: t('location'),
          }}
        />
      )}

      {/* Step 2: Work Experience */}
      {step === 2 && (
        <WorkExperienceForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
          required
          labels={{
            jobTitle: t('job_title'),
            company: t('company'),
            startDate: t('start_date'),
            endDate: t('end_date'),
            description: t('description'),
          }}
        />
      )}

      {/* Step 3: Education */}
      {step === 3 && (
        <EducationForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
          optional
          labels={{
            degree: t('degree'),
            institution: t('institution'),
            year: t('year'),
          }}
        />
      )}

      {/* Step 4: Skills */}
      {step === 4 && (
        <SkillsForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
          skillOptions={[
            t('Communication'),
            t('Management'),
            t('Customer Service'),
            t('Sales'),
            t('Marketing'),
            t('Accounting'),
            t('Data Entry'),
            t('Design'),
            t('Programming'),
            t('other'),
          ]}
          labels={{ skills: t('skills'), other: t('other') }}
        />
      )}

      {/* Step 5: Upload Resume */}
      {step === 5 && (
        <UploadResumeStep
          formData={formData}
          setFormData={setFormData}
          onNext={() => alert(t('thanks_uploaded'))}
          onBack={prevStep}
          optional
          labels={{ uploadResume: t('upload_resume') }}
        />
      )}
    </div>
  );
}

export default ResumeBuilderWhiteCollar;
