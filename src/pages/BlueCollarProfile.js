// src/pages/BlueCollarProfile.jsx
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

export default function BlueCollarProfile() {
  const { t } = useTranslation();
  const session = useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    experience: [],
    education: [],
    skills: [],
    otherSkill: '',
    resumeUrl: null
  });

  // Fetch all data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Profile
        const { data: profileData, error: profileError } = await supabase
          .from('blue_collar_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') console.error(profileError);

        // Experience
        const { data: expData, error: expError } = await supabase
          .from('blue_experience')
          .select('*')
          .eq('user_id', user.id);
        if (expError) console.error(expError);

        // Education
        const { data: eduData, error: eduError } = await supabase
          .from('blue_education')
          .select('*')
          .eq('user_id', user.id);
        if (eduError) console.error(eduError);

        setFormData({
          fullName: profileData?.full_name || '',
          phone: profileData?.phone || '',
          location: profileData?.location || '',
          skills: profileData?.skills || [],
          otherSkill: profileData?.other_skill || '',
          resumeUrl: profileData?.resume_url || null,
          experience: expData || [],
          education: eduData || []
        });
      } catch (err) {
        console.error('Fetch error:', err);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Save main profile
  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('blue_collar_profiles')
        .upsert([{
          id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          skills: formData.skills,
          other_skill: formData.otherSkill,
          resume_url: formData.resumeUrl
        }]);
      if (error) console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Save experience
  const saveExperience = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('blue_experience').delete().eq('user_id', user.id);
      const formatted = formData.experience.map(job => ({
        user_id: user.id,
        job_title: job.jobTitle,
        company: job.company,
        start_date: job.startDate || null,
        end_date: job.endDate || null,
        description: job.description
      }));
      const { error } = await supabase.from('blue_experience').insert(formatted);
      if (error) console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Save education
  const saveEducation = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('blue_education').delete().eq('user_id', user.id);
      const formatted = formData.education.map(edu => ({
        user_id: user.id,
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year
      }));
      const { error } = await supabase.from('blue_education').insert(formatted);
      if (error) console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Resume upload
  const handleFileUpload = async (file) => {
    if (!file || !user) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true });
    if (uploadError) return console.error(uploadError);

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    setFormData({ ...formData, resumeUrl: urlData.publicUrl });
    saveProfile();
  };

  if (loading) return <p>{t('loading_profile')}</p>;

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>👷 {t('bluecollar_profile')}</h2>

      {/* PERSONAL INFO */}
      <Card title={t('personal_info')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {['fullName', 'phone', 'location'].map(field => (
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
        <button onClick={saveProfile} style={{ marginTop: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}>
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
                style={{ marginTop: '4px', backgroundColor: '#f44336', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}
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
        {formData.education.map((edu, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            {['degree', 'institution', 'year'].map(field => (
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
                style={{ marginTop: '4px', backgroundColor: '#f44336', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}
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
              education: [...formData.education, { degree: '', institution: '', year: '' }]
            })
          }
          style={{ marginTop: '8px', backgroundColor: '#4CAF50', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {t('add_education')}
        </button>

        <button
          onClick={saveEducation}
          style={{ marginTop: '8px', marginLeft: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {t('save_education')}
        </button>
      </Card>

      {/* SKILLS */}
      <Card title={t('skills')}>
        <input
          type="text"
          placeholder={t('skills')}
          value={formData.skills.join(', ')}
          onChange={(e) =>
            setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })
          }
          style={{ width: '100%', padding: '6px', marginBottom: '0.5rem' }}
        />
        <input
          type="text"
          placeholder={t('other')}
          value={formData.otherSkill}
          onChange={(e) => setFormData({ ...formData, otherSkill: e.target.value })}
          style={{ width: '100%', padding: '6px' }}
        />
        <button onClick={saveProfile} style={{ marginTop: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}>
          {t('save_skills')}
        </button>
      </Card>

      {/* RESUME */}
      <Card title={t('upload_resume')}>
        <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e.target.files[0])} />
        {formData.resumeUrl && (
          <div style={{ marginTop: '0.5rem' }}>
            <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">{t('view_uploaded_resume')}</a>
          </div>
        )}
      </Card>
    </div>
  );
}
