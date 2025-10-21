import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import StartChoiceStep from '../components/resume/StartChoiceStep';
import PersonalInfoForm from '../components/bluecollar/PersonalInfo';
import EducationForm from '../components/bluecollar/EducationForm';
import SkillsForm from '../components/bluecollar/SkillsStep';
import WorkExperienceForm from '../components/resume/WorkExperienceForm';
import UploadResumeStep from '../components/bluecollar/UploadResume';

function ResumeBuilderBlueCollar() {
  const { t } = useTranslation();

  const [mode, setMode] = useState('build'); // always build for blue collar
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: '',
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
  const reset = () => {
    setStep(1);
    setFormData({
      fullName: '',
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
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>👷 {t('build_profile')}</h2>
      <p>{t('bluecollar_profile_description')}</p>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <PersonalInfoForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          fields={['fullName', 'phone', 'location']}
          labels={{
            fullName: t('full_name'),
            phone: t('phone_number'),
            location: t('location')
          }}
        />
      )}

      {/* Step 2: Work Experience (mandatory) */}
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
            description: t('description')
          }}
        />
      )}

      {/* Step 3: Education (optional) */}
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
            year: t('year')
          }}
        />
      )}

      {/* Step 4: Skills (with selectable options + other) */}
      {step === 4 && (
        <SkillsForm
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
          skillOptions={[
            t('Plumbing'),
            t('Electrician'),
            t('Carpentry'),
            t('Construction'),
            t('Mechanic'),
            t('Painting'),
            t('Cleaning'),
            t('other')
          ]}
          labels={{ skills: t('skills'), other: t('other') }}
        />
      )}

      {/* Step 5: Upload Resume (optional) */}
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

export default ResumeBuilderBlueCollar;
