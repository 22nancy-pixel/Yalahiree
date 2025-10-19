import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PersonalInfoForm({ formData, setFormData, onNext, labels }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3>{t('personal_info')}</h3>
      <input
        type="text"
        placeholder={labels?.fullName || t('full_name')}
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        style={{ display: 'block', width: '100%', margin: '0.5rem 0', padding: '8px' }}
      />
      <input
        type="tel"
        placeholder={labels?.phone || t('phone_number')}
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        style={{ display: 'block', width: '100%', margin: '0.5rem 0', padding: '8px' }}
      />
      <input
        type="text"
        placeholder={labels?.location || t('location')}
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        style={{ display: 'block', width: '100%', margin: '0.5rem 0', padding: '8px' }}
      />

      <button onClick={onNext} style={{ marginTop: '1rem' }}>
        {t('next')}
      </button>
    </div>
  );
}
