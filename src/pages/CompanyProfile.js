import React, { useState } from "react";

function CompanyProfile() {
  const [companyData, setCompanyData] = useState({
    companyName: "",
    email: "",
    description: "",
    location: "",
  });

  const [jobs, setJobs] = useState([
    { title: "", type: "white", skills: "", experience: "", education: "", notes: "" },
  ]);

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({ ...companyData, [name]: value });
  };

  const handleJobChange = (index, e) => {
    const { name, value } = e.target;
    const updatedJobs = [...jobs];
    updatedJobs[index][name] = value;
    setJobs(updatedJobs);
  };

  const addJob = () => {
    setJobs([
      ...jobs,
      { title: "", type: "white", skills: "", experience: "", education: "", notes: "" },
    ]);
  };

  const removeJob = (index) => {
    const updatedJobs = [...jobs];
    updatedJobs.splice(index, 1);
    setJobs(updatedJobs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Company Data:", companyData);
    console.log("Jobs:", jobs);
    alert("Company profile saved successfully!");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Company Profile</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={companyData.companyName}
            onChange={handleCompanyChange}
            required
          />
        </div>

        <div>
          <label>Email (Valid)</label>
          <input
            type="email"
            name="email"
            value={companyData.email}
            onChange={handleCompanyChange}
            required
          />
        </div>

        <div>
          <label>Company Description</label>
          <textarea
            name="description"
            value={companyData.description}
            onChange={handleCompanyChange}
            rows="3"
            required
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={companyData.location}
            onChange={handleCompanyChange}
            required
          />
        </div>

        <h3 style={{ marginTop: "2rem" }}>Open Job Positions</h3>

        {jobs.map((job, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "1rem",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <div>
              <label>Job Title</label>
              <input
                type="text"
                name="title"
                value={job.title}
                onChange={(e) => handleJobChange(index, e)}
                required
              />
            </div>

            <div>
              <label>Job Type</label>
              <select
                name="type"
                value={job.type}
                onChange={(e) => handleJobChange(index, e)}
              >
                <option value="white">White Collar</option>
                <option value="blue">Blue Collar</option>
              </select>
            </div>

            <div>
              <label>Required Skills</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g. Communication, Teamwork..."
                value={job.skills}
                onChange={(e) => handleJobChange(index, e)}
              />
            </div>

            <div>
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                placeholder="e.g. 2+ years"
                value={job.experience}
                onChange={(e) => handleJobChange(index, e)}
              />
            </div>

            {job.type === "white" && (
              <div>
                <label>Education</label>
                <input
                  type="text"
                  name="education"
                  placeholder="e.g. Bachelor's Degree"
                  value={job.education}
                  onChange={(e) => handleJobChange(index, e)}
                />
              </div>
            )}

            <div>
              <label>Additional Notes</label>
              <textarea
                name="notes"
                placeholder="Optional notes about the job"
                value={job.notes}
                onChange={(e) => handleJobChange(index, e)}
                rows="2"
              />
            </div>

            {jobs.length > 1 && (
              <button
                type="button"
                onClick={() => removeJob(index)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  marginTop: "0.5rem",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Remove Job
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addJob}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0.6rem 1rem",
            marginTop: "1rem",
            cursor: "pointer",
          }}
        >
          + Add Another Job
        </button>

        <button
          type="submit"
          style={{
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0.8rem 1rem",
            marginTop: "1.5rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default CompanyProfile;
