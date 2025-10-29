import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSession } from "../useSession"; // optional: hook to get current logged-in user

function CompanyProfile() {
  const session = useSession();
  const user = session?.user;

  const [companyData, setCompanyData] = useState({
    companyName: "",
    email: "",
    description: "",
    location: "",
  });

  const [jobs, setJobs] = useState([
    { title: "", type: "white", skills: "", experience: "", education: "", notes: "" },
  ]);

  // Fetch existing company info and jobs
  useEffect(() => {
    if (!user) return;
    const fetchCompany = async () => {
      const { data: company, error: companyError } = await supabase
        .from("company_users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!companyError && company) {
        setCompanyData({
          companyName: company.company_name,
          email: company.email,
          description: company.description,
          location: company.location,
        });

        const { data: jobsData } = await supabase
          .from("company_jobs")
          .select("*")
          .eq("company_id", user.id);

        if (jobsData && jobsData.length > 0) setJobs(jobsData);
      }
    };

    fetchCompany();
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      // 1️⃣ Save company info
      const { error: companyError } = await supabase
        .from("company_users")
        .upsert([
          {
            id: user.id,
            company_name: companyData.companyName,
            email: companyData.email,
            description: companyData.description,
            location: companyData.location,
          },
        ]);

      if (companyError) throw companyError;

      // 2️⃣ Save jobs
      // Delete old jobs first to prevent duplicates
      await supabase.from("company_jobs").delete().eq("company_id", user.id);

      const jobsToInsert = jobs.map((job) => ({
        company_id: user.id,
        title: job.title,
        type: job.type,
        skills: job.skills,
        experience: job.experience,
        education: job.education,
        notes: job.notes,
      }));

      const { error: jobsError } = await supabase.from("company_jobs").insert(jobsToInsert);
      if (jobsError) throw jobsError;

      alert("Company profile and jobs saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving company profile or jobs.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Company Profile</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label>Company Name</label>
          <input type="text" name="companyName" value={companyData.companyName} onChange={handleCompanyChange} required />
        </div>

        <div>
          <label>Email (Valid)</label>
          <input type="email" name="email" value={companyData.email} onChange={handleCompanyChange} required />
        </div>

        <div>
          <label>Company Description</label>
          <textarea name="description" value={companyData.description} onChange={handleCompanyChange} rows="3" required />
        </div>

        <div>
          <label>Location</label>
          <input type="text" name="location" value={companyData.location} onChange={handleCompanyChange} required />
        </div>

        <h3 style={{ marginTop: "2rem" }}>Open Job Positions</h3>

        {jobs.map((job, index) => (
          <div key={index} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", background: "#f9f9f9" }}>
            <div>
              <label>Job Title</label>
              <input type="text" name="title" value={job.title} onChange={(e) => handleJobChange(index, e)} required />
            </div>

            <div>
              <label>Job Type</label>
              <select name="type" value={job.type} onChange={(e) => handleJobChange(index, e)}>
                <option value="white">White Collar</option>
                <option value="blue">Blue Collar</option>
              </select>
            </div>

            <div>
              <label>Required Skills</label>
              <input type="text" name="skills" placeholder="e.g. Communication, Teamwork..." value={job.skills} onChange={(e) => handleJobChange(index, e)} />
            </div>

            <div>
              <label>Experience</label>
              <input type="text" name="experience" placeholder="e.g. 2+ years" value={job.experience} onChange={(e) => handleJobChange(index, e)} />
            </div>

            {job.type === "white" && (
              <div>
                <label>Education</label>
                <input type="text" name="education" placeholder="e.g. Bachelor's Degree" value={job.education} onChange={(e) => handleJobChange(index, e)} />
              </div>
            )}

            <div>
              <label>Additional Notes</label>
              <textarea name="notes" placeholder="Optional notes about the job" value={job.notes} onChange={(e) => handleJobChange(index, e)} rows="2" />
            </div>

            {jobs.length > 1 && (
              <button type="button" onClick={() => removeJob(index)} style={{ backgroundColor: "#dc3545", color: "#fff", marginTop: "0.5rem", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>
                Remove Job
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addJob} style={{ backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", padding: "0.6rem 1rem", marginTop: "1rem", cursor: "pointer" }}>
          + Add Another Job
        </button>

        <button type="submit" style={{ backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", padding: "0.8rem 1rem", marginTop: "1.5rem", cursor: "pointer", fontWeight: "bold" }}>
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default CompanyProfile;
