// src/pages/BlueCollarProfile.jsx
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabaseClient'

import PersonalInfoForm from '../components/bluecollar/PersonalInfo'
import WorkExperienceForm from '../components/resume/WorkExperienceForm'
import EducationForm from '../components/bluecollar/EducationForm'
import SkillsForm from '../components/bluecollar/SkillsStep'
import UploadResumeStep from '../components/bluecollar/UploadResume'

export default function BlueCollarProfile() {
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    experience: [
      { jobTitle: '', company: '', startDate: '', endDate: '', description: '' },
    ],
    education: [
      { degree: '', institution: '', year: '' },
    ],
    skills: [],
    otherSkill: '',
    resume_url: '',
  })

  const [step, setStep] = useState(1)

  // Fetch logged-in user and profile
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Fetch profile data
      const { data: profile } = await supabase
        .from('blue_collar_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          phone: profile.phone || '',
          location: profile.location || '',
          experience: profile.experience || [{ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }],
          education: profile.education || [{ degree: '', institution: '', year: '' }],
          skills: profile.skills || [],
          otherSkill: profile.other_skill || '',
          resume_url: profile.resume_url || '',
        })
      }

      setLoading(false)
    }

    fetchUserAndProfile()
  }, [])

  const saveSection = async (sectionData) => {
    if (!user) return

    const updatedData = { ...formData, ...sectionData }
    setFormData(updatedData)

    // Upsert: create row if not exists
    const { error } = await supabase
      .from('blue_collar_profiles')
      .upsert([{
        id: user.id,
        full_name: updatedData.fullName,
        phone: updatedData.phone,
        location: updatedData.location,
        experience: updatedData.experience,
        education: updatedData.education,
        skills: updatedData.skills,
        other_skill: updatedData.otherSkill,
        resume_url: updatedData.resume_url,
      }])
    if (error) console.error('Failed to save:', error)
  }

  if (loading) return <p>{t('Loading...')}</p>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
      <h2>👷 {t('build_profile')}</h2>
      <p>{t('bluecollar_profile_description')}</p>

      {/* Step 1: Personal Info */}
      <PersonalInfoForm
        formData={formData}
        setFormData={(data) => { setFormData(data); saveSection(data) }}
        onNext={() => setStep(2)}
        fields={['fullName', 'phone', 'location']}
        labels={{
          fullName: t('full_name'),
          phone: t('phone_number'),
          location: t('location'),
        }}
      />

      {/* Step 2: Work Experience */}
      <WorkExperienceForm
        formData={formData}
        setFormData={(data) => { setFormData(data); saveSection(data) }}
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
        required
        labels={{
          jobTitle: t('job_title'),
          company: t('company'),
          startDate: t('start_date'),
          endDate: t('end_date'),
          description: t('description'),
        }}
      />

      {/* Step 3: Education */}
      <EducationForm
        formData={formData}
        setFormData={(data) => { setFormData(data); saveSection(data) }}
        onNext={() => setStep(4)}
        onBack={() => setStep(2)}
        optional
        labels={{
          degree: t('degree'),
          institution: t('institution'),
          year: t('year'),
        }}
      />

      {/* Step 4: Skills */}
      <SkillsForm
        formData={formData}
        setFormData={(data) => { setFormData(data); saveSection(data) }}
        onNext={() => setStep(5)}
        onBack={() => setStep(3)}
        skillOptions={[
          t('Plumbing'),
          t('Electrician'),
          t('Carpentry'),
          t('Construction'),
          t('Mechanic'),
          t('Painting'),
          t('Cleaning'),
          t('other'),
        ]}
        labels={{ skills: t('skills'), other: t('other') }}
      />

      {/* Step 5: Upload Resume */}
      <UploadResumeStep
        formData={formData}
        setFormData={(data) => { setFormData(data); saveSection(data) }}
        onNext={() => alert(t('Resume saved!'))}
        onBack={() => setStep(4)}
        optional
        labels={{ uploadResume: t('upload_resume') }}
      />
    </div>
  )
}


