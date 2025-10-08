import React from 'react';
import { useTranslation } from 'react-i18next';
function PersonalInfoForm({ formData, setFormData, onNext }) {
  const { t } = useTranslation();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <h3>{t('full_name')}</h3>
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder={t('full_name')}
      />
      <h3>{t('email')}</h3>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={t('email')}
      />
      <h3>{t('phone')}</h3>
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder={t('phone')}
      />
      <h3>{t('location')}</h3>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder={t('location')}
      />
      <button onClick={onNext}>{t('next')}</button>
    </div>
  );
}
export default PersonalInfoForm;
