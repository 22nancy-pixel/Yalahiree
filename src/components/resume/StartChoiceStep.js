import React from 'react';
import { useTranslation } from 'react-i18next';
function StartChoiceStep({ onSelect }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '1rem' }}>
      <h3>{t('how_to_start')}</h3>
      <p>{t('choose_how_to_resume')}</p>
      <button onClick={() => onSelect('build')} style={{ marginRight: '1rem' }}>
        :hammer_and_wrench: {t('build_resume')}
      </button>
      <button onClick={() => onSelect('upload')}>
        :paperclip: {t('upload_resume_option')}
      </button>
    </div>
  );
}
export default StartChoiceStep;