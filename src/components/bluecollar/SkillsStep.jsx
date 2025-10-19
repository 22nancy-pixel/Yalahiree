import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SkillsForm({ formData, setFormData, onNext, onBack, skillOptions, labels }) {
  const { t } = useTranslation();

  const handleSkillToggle = (skill) => {
    const skills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills });
  };

  return (
    <div>
      <h3>{labels?.title || t('skills')}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {skillOptions.map(skill => (
          <button
            key={skill}
            type="button"
            onClick={() => handleSkillToggle(skill)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: formData.skills.includes(skill) ? '2px solid #007BFF' : '1px solid #ccc',
              backgroundColor: formData.skills.includes(skill) ? '#E3F2FD' : 'white',
              cursor: 'pointer',
            }}
          >
            {skill}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>{labels?.other || t('other')}</label>
        <input
          type="text"
          placeholder={labels?.otherPlaceholder || t('enter_other_skill')}
          value={formData.otherSkill}
          onChange={(e) => setFormData({ ...formData, otherSkill: e.target.value })}
          style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack}>{t('back')}</button>
        <button onClick={onNext} style={{ marginLeft: '1rem' }}>{t('next')}</button>
      </div>
    </div>
  );
}
