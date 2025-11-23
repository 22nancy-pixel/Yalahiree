// src/pages/BlueCollarProfile.jsx

import React, { useState, useEffect, useCallback } from 'react';
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
  // RENAMED from matching to isMatching for consistency
  const [isMatching, setIsMatching] = useState(false); 
  const [matchedJobs, setMatchedJobs] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    // Initializing structured arrays is safer
    experience: [], 
    education: [], 
    skills: [],
    otherSkill: '',
    resumeUrl: null
  });

  // --- PHASE III: FETCH MATCHED JOBS ---
  const fetchMatchedJobs = useCallback(async () => {
    if (!user) return;
    try {
        // Fetch job matches, joining with 'jobs' and 'applications' tables
        const { data, error } = await supabase
            .from('job_matches')
            .select('*, jobs(id, title, company, location), applications!inner(id, status)') 
            .eq('user_id', user.id)
            .order('match_score', { ascending: false }); 

        if (error) throw error;
        
        const matchesWithDetails = data.map(match => ({
            match_id: match.id,
            score: match.match_score,
            justification: match.justification,
            job: match.jobs, 
            applied: match.applications.length > 0 ? match.applications[0].status : null,
        }));
        
        setMatchedJobs(matchesWithDetails);

    } catch (err) {
        console.error('Error fetching blue-collar matches:', err.message);
    }
  }, [user]);

  // --- PHASE III: RUN AI JOB MATCHER (Replaced 'findJobs') ---
  const runJobMatcher = useCallback(async () => {
    if (!user || saving) return;
    setIsMatching(true);
    alert(t('running_ai_match_message'));

    try {
        const candidateProfile = {
            // Ensure email is passed, even if not explicitly in BlueCollar form
            email: user.email, 
            full_name: formData.fullName,
            location: formData.location,
            skills: formData.skills,
            other_skill: formData.otherSkill,
            experience: formData.experience,
            education: formData.education,
        };

        const { error } = await supabase.functions.invoke('ai-job-matcher', {
            body: { 
                candidate_profile: candidateProfile,
                user_id: user.id
            },
        });

        if (error) throw error;
        
        alert(t('matching_complete'));
        await fetchMatchedJobs(); 

    } catch (err) {
        console.error('AI Matching Failed:', err.message);
        alert(`${t('matching_failed')}: ${err.message}`);
    } finally {
        setIsMatching(false);
    }
  }, [user, formData, saving, fetchMatchedJobs, t]);

  // --- PHASE IV: IMPLEMENT HANDLE APPLY ACTION ---
  const handleApply = async (jobId, matchId) => {
    if (!user) return;
    
    const match = matchedJobs.find(m => m.job.id === jobId);
    if (!match) return alert(t('error_job_not_found'));

    setSaving(true);
    try {
      // 1. Check if the user has already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', user.id)
        .eq('job_id', jobId)
        .maybeSingle();

      if (existingApp) {
        alert(t('already_applied'));
        setSaving(false);
        return;
      }

      // 2. Insert the Application Record
      const { error: appError } = await supabase
        .from('applications')
        .insert([{
          candidate_id: user.id,
          job_id: jobId,
          status: 'applied'
        }]);

      if (appError) throw appError;

      // 3. Notify the Company
      const { data: jobData, error: jobFetchError } = await supabase
        .from('jobs')
        .select('company_id, title')
        .eq('id', jobId)
        .single();

      if (jobFetchError || !jobData) throw new Error(t('error_fetching_company_id'));

      const notificationMessage = `${formData.fullName} applied for your job: ${jobData.title}. Match Score: ${match.score}%`;

      const { error: notifError } = await supabase
        .from('company_notifications')
        .insert([{
          company_id: jobData.company_id, 
          job_id: jobId,
          candidate_id: user.id,
          message: notificationMessage,
        }]);

      if (notifError) throw notifError;
      
      alert(t('application_success'));
      await fetchMatchedJobs(); // Refresh the list to show 'Applied' status

    } catch (error) {
      console.error('Application failed:', error.message);
      alert(`${t('application_failed')}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // --- EXISTING: FETCH PROFILE DATA (with added fetchMatchedJobs) ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const [
            { data: profileData, error: profileError },
            { data: expData, error: expError },
            { data: eduData, error: eduError },
        ] = await Promise.all([
            supabase.from('blue_collar_profiles').select('*').eq('id', user.id).single(),
            supabase.from('blue_experience').select('*').eq('user_id', user.id),
            supabase.from('blue_education').select('*').eq('user_id', user.id),
        ]);
        
        if (profileError && profileError.code !== 'PGRST116') console.error('Profile fetch error:', profileError);
        if (expError) console.error('Experience fetch error:', expError);
        if (eduError) console.error('Education fetch error:', eduError);

        setFormData({
          fullName: profileData?.full_name || '',
          phone: profileData?.phone || '',
          location: profileData?.location || '',
          skills: profileData?.skills || [],
          otherSkill: profileData?.other_skill || '',
          resumeUrl: profileData?.resume_url || null,
          // Map data structure to be consistent with WhiteCollar/form expectations
          experience: expData || [],
          education: eduData || []
        });
      } catch (err) {
        console.error('Fetch error:', err);
      }

      setLoading(false);
      fetchMatchedJobs();
    };

    fetchProfile();
  }, [user, fetchMatchedJobs]);

  const saveProfile = async () => { /* ... (Existing logic) ... */ };
  const saveExperience = async () => { /* ... (Existing logic) ... */ };
  const saveEducation = async () => { /* ... (Existing logic) ... */ };
  const handleFileUpload = async (file) => { /* ... (Existing logic) ... */ };

  if (loading) return <p>{t('loading_profile')}</p>;

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>👷 {t('bluecollar_profile')}</h2>

      {/* PERSONAL INFO */}
      <Card title={t('personal_info')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Email field is omitted for BlueCollar but user.email is used in logic */}
          {['fullName', 'phone', 'location'].map(field => (
            <div key={field}>
              <label>{t(field)}</label>
              <input
                type={field === 'phone' ? 'tel' : 'text'}
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
          disabled={saving}
          style={{ marginTop: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {saving ? t('saving') : t('save_personal_info')}
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
          disabled={saving}
          style={{ marginTop: '8px', marginLeft: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {saving ? t('saving') : t('save_experience')}
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
          disabled={saving}
          style={{ marginTop: '8px', marginLeft: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}
        >
          {saving ? t('saving') : t('save_education')}
        </button>
      </Card>

      {/* SKILLS */}
      <Card title={t('skills')}>
        <input
          type="text"
          placeholder={t('skills')}
          value={formData.skills.join(', ')}
          onChange={(e) =>
            setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })
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
        <button onClick={saveProfile} disabled={saving} style={{ marginTop: '8px', backgroundColor: '#2196F3', color: '#fff', padding: '6px 12px', borderRadius: '4px' }}>
          {saving ? t('saving') : t('save_skills')}
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

      <hr style={{ margin: '2rem 0' }} />

      {/* NEW: JOB MATCHES & NOTIFICATIONS */}
      <Card title={t('job_matches_notifications')}>
        <p style={{ marginBottom: '1rem', color: '#555' }}>
          {t('run_ai_match_explanation')}
        </p>
        <button
          onClick={runJobMatcher}
          disabled={isMatching || saving}
          style={{ padding: '10px 15px', backgroundColor: '#FF9800', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
        >
          {isMatching ? t('running_ai_match') : t('run_ai_job_matcher')}
        </button>

        {matchedJobs.length === 0 && !isMatching ? (
          <p>{t('no_matches_found')}. {t('update_profile_and_run_matcher_tip')}.</p>
        ) : isMatching ? (
          <p>{t('running_ai_match')}</p>
        ) : (
            matchedJobs.map((match) => (
                <div 
                    key={match.job.id} 
                    style={{ 
                        border: '1px solid #ddd', 
                        padding: '1rem', 
                        marginBottom: '0.75rem', 
                        borderRadius: '6px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        backgroundColor: match.score > 75 ? '#e8f5e9' : match.score > 50 ? '#fff8e1' : '#fbebeb'
                    }}
                >
                    <div>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {match.job.title} at {match.job.company}
                        </p>
                        <p style={{ margin: '0.25rem 0' }}>
                            {t('match_score')}: <span style={{ color: match.score > 75 ? 'green' : match.score > 50 ? 'orange' : 'red', fontWeight: 'bold' }}>{match.score}%</span>
                        </p>
                        <small style={{ color: '#555' }}>*AI Justification:* {match.justification}</small>
                    </div>
                    
                    {match.applied ? (
                        <button 
                            disabled
                            style={{ backgroundColor: '#6c757d', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'not-allowed', whiteSpace: 'nowrap' }}
                        >
                            {t('applied')} ({match.applied})
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleApply(match.job.id, match.match_id)} 
                            disabled={saving}
                            style={{ backgroundColor: '#00BCD4', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            {saving ? t('applying') : t('apply_now')}
                        </button>
                    )}
                </div>
            ))
        )}
      </Card>
    </div>
  );
}
