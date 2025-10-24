import React from 'react';

function PersonalInfoForm({ formData, setFormData, onNext, fields, labels }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {fields.includes('fullName') && (
        <div>
          <label>{labels.fullName}</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {/* ✅ Add Email Field Support */}
      {fields.includes('email') && (
        <div>
          <label>{labels.email}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {fields.includes('phone') && (
        <div>
          <label>{labels.phone}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      )}

      {fields.includes('location') && (
        <div>
          <label>{labels.location}</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <button
        type="submit"
        style={{
            marginTop: '1rem',
            alignSelf: 'flex-start', // ✅ prevents full width
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
        }}
        >
        Next
        </button>

    </form>
  );
}

export default PersonalInfoForm;
