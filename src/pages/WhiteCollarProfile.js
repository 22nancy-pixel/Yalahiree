// src/pages/WhiteCollarProfile.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { useSession } from '../useSession';

function Card({ title, children }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function WhiteCollarProfile() {
  const { t } = useTranslation();
  const session = useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    experience: [{ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    skills: [],
    otherSkill: '',
    resumeUrl: null
  });

  // Fetch all data once when user is loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Profile info
        const { data: profileData, error: profileError } = await supabase
          .from('white_collar_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116')
          console.error('Profile fetch error:', profileError);

        // Experience
        const { data: expData, error: expError } = await supabase
          .from('white_experience')
          .select('*')
          .eq('user_id', user.id);
        if (expError) console.error('Experience fetch error:', expError);

        // Education
        const { data: eduData, error: eduError } = await supabase
          .from('white_education')
          .select('*')
          .eq('user_id', user.id);
        if (eduError) console.error('Education fetch error:', eduError);

        setFormData({
          fullName: profileData?.full_name || '',
          email: profileData?.email || user.email || '',
          phone: profileData?.phone || '',
          location: profileData?.location || '',
          skills: profileData?.skills || [],
          otherSkill: profileData?.other_skill || '',
          resumeUrl: profileData?.resume_url || null,
          experience: expData && expData.length > 0
            ? expData.map(e => ({
                jobTitle: e.job_title || '',
                company: e.company || '',
                startDate: e.start_date || '',
                endDate: e.end_date || '',
                description: e.description || ''
              }))
            : [{ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }],
          education: eduData && eduData.length > 0
            ? eduData.map(e => ({
                degree: e.degree || '',
                institution: e.institution || '',
                year: e.year || ''
              }))
            : [{ degree: '', institution: '', year: '' }]
        });

      } catch (err) {
        console.error('Unexpected fetch error:', err);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // ✅ Save main profile
  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('white_collar_profiles')
        .upsert([{
          id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          skills: formData.skills,
          other_skill: formData.otherSkill,
          resume_url: formData.resumeUrl
        }]);
      if (error) console.error('Save profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Save experience manually
  const saveExperience = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('white_experience').delete().eq('user_id', user.id);
      const formatted = formData.experience.map(job => ({
        user_id: user.id,
        job_title: job.jobTitle,
        company: job.company,
        start_date: job.startDate || null,
        end_date: job.endDate || null,
        description: job.description
      }));
      const { error } = await supabase.from('white_experience').insert(formatted);
      if (error) console.error('Save experience error:', error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Save education manually
  const saveEducation = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('white_education').delete().eq('user_id', user.id);
      const formatted = formData.education.map(edu => ({
        user_id: user.id,
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year
      }));
      const { error } = await supabase.from('white_education').insert(formatted);
      if (error) console.error('Save education error:', error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Upload resume
  const handleFileUpload = async (file) => {
    if (!file || !user) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true });
    if (uploadError) return console.error('Upload error:', uploadError);

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    setFormData({ ...formData, resumeUrl: urlData.publicUrl });
    saveProfile();
  };

  if (loading) return <p>{t('loading_profile')}</p>;

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>💼 {t('whitecollar_profile')}</h2>

      {/* PERSONAL INFO */}
      <Card title={t('personal_info')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {['fullName', 'email', 'phone', 'location'].map(field => (
            <div key={field}>
              <label>{t(field)}</label>
              <input
                type="text"
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveProfile}
          style={{ marginTop: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {t('save_personal_info')}
        </button>
      </Card>

      {/* EXPERIENCE */}
      <Card title={t('experience')}>
        {formData.experience.map((job, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            {['jobTitle', 'company', 'startDate', 'endDate', 'description'].map(field => (
              <div key={field} style={{ marginBottom: '0.25rem' }}>
                <label>{t(field)}</label>
                <input
                  type="text"
                  value={job[field]}
                  onChange={(e) => {
                    const exp = [...formData.experience];
                    exp[idx][field] = e.target.value;
                    setFormData({ ...formData, experience: exp });
                  }}
                  style={{ width: '100%', padding: '4px' }}
                />
              </div>
            ))}
            {idx !== 0 && (
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    experience: formData.experience.filter((_, i) => i !== idx)
                  })
                }
                style={{
                  marginTop: '4px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                {t('remove')}
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() =>
            setFormData({
              ...formData,
              experience: [...formData.experience, { jobTitle: '', company: '', startDate: '', endDate: '', description: '' }]
            })
          }
          style={{ marginTop: '8px', backgroundColor: '#4CAF50', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {t('add_experience')}
        </button>

        <button
          onClick={saveExperience}
          style={{ marginTop: '8px', marginLeft: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {t('save_experience')}
        </button>
      </Card>

      {/* EDUCATION */}
<Card title={t('education')}>
  {formData.education.length === 0 && (
    <button
      onClick={() =>
        setFormData({
          ...formData,
          education: [{ degree: '', institution: '', year: '' }]
        })
      }
      style={{
        marginBottom: '8px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '4px'
      }}
    >
      {t('add_education')}
    </button>
  )}

  {formData.education.map((edu, idx) => (
    <div
      key={idx}
      style={{
        marginBottom: '0.5rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '0.5rem'
      }}
    >
      {['degree', 'institution', 'year'].map((field) => (
        <div key={field} style={{ marginBottom: '0.25rem' }}>
          <label>{t(field)}</label>
          <input
            type="text"
            value={edu[field]}
            onChange={(e) => {
              const ed = [...formData.education];
              ed[idx][field] = e.target.value;
              setFormData({ ...formData, education: ed });
            }}
            style={{ width: '100%', padding: '4px' }}
          />
        </div>
      ))}
      {formData.education.length > 1 && (
        <button
          onClick={() =>
            setFormData({
              ...formData,
              education: formData.education.filter((_, i) => i !== idx)
            })
          }
          style={{
            marginTop: '4px',
            backgroundColor: '#f44336',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          {t('remove')}
        </button>
      )}
    </div>
  ))}

  {formData.education.length > 0 && (
    <div>
      <button
        onClick={() =>
          setFormData({
            ...formData,
            education: [
              ...formData.education,
              { degree: '', institution: '', year: '' }
            ]
          })
        }
        style={{
          marginTop: '8px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '4px'
        }}
      >
        {t('add_education')}
      </button>

      <button
        onClick={saveEducation}
        style={{
          marginTop: '8px',
          marginLeft: '8px',
          backgroundColor: '#2196F3',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '4px'
        }}
      >
        {t('save_education')}
      </button>
    </div>
  )}
</Card>

      {/* SKILLS */}
      <Card title={t('skills')}>
        <input
          type="text"
          placeholder={t('skills')}
          value={formData.skills.join(', ')}
          onChange={(e) =>
            setFormData({
              ...formData,
              skills: e.target.value.split(',').map(s => s.trim())
            })
          }
          style={{ width: '100%', padding: '6px', marginBottom: '0.5rem' }}
        />
        <input
          type="text"
          placeholder={t('other')}
          value={formData.otherSkill}
          onChange={(e) =>
            setFormData({ ...formData, otherSkill: e.target.value })
          }
          style={{ width: '100%', padding: '6px' }}
        />
        <button
          onClick={saveProfile}
          style={{ marginTop: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {t('save_skills')}
        </button>
      </Card>

      {/* RESUME */}
      <Card title={t('upload_resume')}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        {formData.resumeUrl && (
          <div style={{ marginTop: '0.5rem' }}>
            <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">
              {t('view_uploaded_resume')}
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}


