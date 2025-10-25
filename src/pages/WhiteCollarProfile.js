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

function WhiteCollarProfile() {
  const { t } = useTranslation();
  const session = useSession();
  const userId = session?.user?.id;

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

  // Fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('white_collar_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) console.error('Fetch profile error:', error);
      else if (data) {
        setFormData({
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          experience: data.experience || [{ jobTitle: '', company: '', startDate: '', endDate: '', description: '' }],
          education: data.education || [{ degree: '', institution: '', year: '' }],
          skills: data.skills || [],
          otherSkill: data.other_skill || '',
          resumeUrl: data.resume_url || null
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  // Save section data
  const saveProfile = async (updatedData) => {
    if (!userId) return;
    setSaving(true);

    const newData = { ...formData, ...updatedData };
    setFormData(newData);

    const { error } = await supabase
      .from('white_collar_profiles')
      .upsert([
        {
          id: userId,
          full_name: newData.fullName,
          email: newData.email,
          phone: newData.phone,
          location: newData.location,
          experience: newData.experience,
          education: newData.education,
          skills: newData.skills,
          other_skill: newData.otherSkill,
          resume_url: newData.resumeUrl
        }
      ]);

    if (error) console.error('Save profile error:', error);
    setSaving(false);
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file || !userId) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    // Get public URL for opening PDF
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Save the public URL in the table
    saveProfile({ resumeUrl: urlData.publicUrl });
  };

  if (loading) return <p>{t('loading_profile')}</p>;

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>💼 {t('whitecollar_profile')}</h2>

      {/* Personal Info */}
      <Card title={t('personal_info')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {['fullName', 'email', 'phone', 'location'].map((field) => (
            <div key={field}>
              <label>{t(field)}</label>
              <input
                type="text"
                value={formData[field]}
                onChange={(e) => saveProfile({ [field]: e.target.value })}
                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
              />
            </div>
          ))}
        </div>
        {saving && <p>{t('saving')}...</p>}
      </Card>

      {/* Experience */}
      <Card title={t('experience')}>
        {formData.experience.map((job, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            {['jobTitle', 'company', 'startDate', 'endDate', 'description'].map((field) => (
              <div key={field} style={{ marginBottom: '0.25rem' }}>
                <label>{t(field)}</label>
                <input
                  type="text"
                  value={job[field]}
                  onChange={(e) => {
                    const exp = [...formData.experience];
                    exp[idx][field] = e.target.value;
                    saveProfile({ experience: exp });
                  }}
                  style={{ width: '100%', padding: '4px' }}
                />
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* Education */}
      <Card title={t('education')}>
        {formData.education.map((edu, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            {['degree', 'institution', 'year'].map((field) => (
              <div key={field} style={{ marginBottom: '0.25rem' }}>
                <label>{t(field)}</label>
                <input
                  type="text"
                  value={edu[field]}
                  onChange={(e) => {
                    const ed = [...formData.education];
                    ed[idx][field] = e.target.value;
                    saveProfile({ education: ed });
                  }}
                  style={{ width: '100%', padding: '4px' }}
                />
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* Skills */}
      <Card title={t('skills')}>
        <input
          type="text"
          placeholder={t('skills')}
          value={formData.skills.join(', ')}
          onChange={(e) => saveProfile({ skills: e.target.value.split(',').map(s => s.trim()) })}
          style={{ width: '100%', padding: '6px', marginBottom: '0.5rem' }}
        />
        <input
          type="text"
          placeholder={t('other')}
          value={formData.otherSkill}
          onChange={(e) => saveProfile({ otherSkill: e.target.value })}
          style={{ width: '100%', padding: '6px' }}
        />
      </Card>

      {/* Resume */}
      <Card title={t('upload_resume')}>
        <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e.target.files[0])} />
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

export default WhiteCollarProfile;






