import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useSession } from "../useSession";

function CompanyProfile() {
  const session = useSession();
  const user = session?.user;

  const [companyData, setCompanyData] = useState({
    companyName: "",
    email: "",
    description: "",
    location: "",
  });
  
  // Jobs state now includes 'id' for tracking existing jobs
  const [jobs, setJobs] = useState([
    { id: null, title: "", type: "white", skills: "", experience: "", education: "", notes: "" },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing company info and jobs
  useEffect(() => {
    if (!user) return;
    const fetchCompany = async () => {
      // 1. Fetch Company Profile Info
      const { data: company, error: companyError } = await supabase
        .from("company_users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!companyError && company) {
        setCompanyData({
          companyName: company.company_name || '',
          email: company.email || user.email, // Use user email as fallback
          description: company.description || '',
          location: company.location || '',
        });
      }

      // 2. Fetch Jobs posted by this company (using the correct 'jobs' table)
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        // Select all fields, crucially including the database-generated 'id'
        .select("id, title, type, skills, experience, education, notes")
        .eq("company_id", user.id);
        
      if (jobsError) console.error("Error fetching jobs:", jobsError);

      if (jobsData && jobsData.length > 0) {
          // Map database keys to state keys
          const formattedJobs = jobsData.map(job => ({
              id: job.id, // Keep the DB ID for update/delete logic
              title: job.title,
              type: job.type,
              skills: job.skills,
              experience: job.experience,
              education: job.education,
              notes: job.notes,
          }));
          setJobs(formattedJobs);
      } else {
          // If no jobs exist, initialize with one empty job
          setJobs([{ id: null, title: "", type: "white", skills: "", experience: "", education: "", notes: "" }]);
      }
      setLoading(false);
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
    
    // Convert skills string to array for consistency with candidate profile data structure
    if (name === 'skills') {
        updatedJobs[index][name] = value.split(',').map(s => s.trim()).filter(s => s !== '');
    } else {
        updatedJobs[index][name] = value;
    }

    // Reset education field if type changes to 'blue'
    if (name === 'type' && value === 'blue') {
        updatedJobs[index].education = '';
    }

    setJobs(updatedJobs);
  };

  const addJob = () => {
    setJobs([
      ...jobs,
      { id: null, title: "", type: "white", skills: "", experience: "", education: "", notes: "" },
    ]);
  };

  const removeJob = (index) => {
    const jobToRemove = jobs[index];
    
    // Optimistically remove from state
    const updatedJobs = jobs.filter((_, i) => i !== index);
    setJobs(updatedJobs);

    // If the job had an ID, try to delete it from the database immediately
    if (jobToRemove.id) {
        supabase.from("jobs").delete().eq("id", jobToRemove.id).then(({ error }) => {
            if (error) console.error("Database deletion error:", error);
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // 1️⃣ Save/Update company info in 'company_users'
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

      // 2️⃣ Save/Update jobs in the 'jobs' table
      const jobsToInsert = jobs
          .filter(job => job.title.trim() !== "") // Only save jobs with a title
          .map((job) => ({
              // Use existing ID for update, or null for new job (DB will generate one)
              id: job.id, 
              company_id: user.id,
              title: job.title,
              type: job.type,
              // Skills are stored as an array in the DB (PostgreSQL text array)
              skills: Array.isArray(job.skills) ? job.skills : job.skills.split(',').map(s => s.trim()).filter(s => s !== ''), 
              experience: job.experience,
              education: job.education,
              notes: job.notes,
          }));

      // Use upsert to handle both new (id=null) and existing (id=uuid) jobs
      const { data: savedJobs, error: jobsError } = await supabase
        .from("jobs")
        .upsert(jobsToInsert)
        .select();

      if (jobsError) throw jobsError;
      
      // Update state with newly saved jobs (including their new DB IDs)
      if (savedJobs) {
          const updatedJobsInState = savedJobs.map(job => ({
              id: job.id,
              title: job.title,
              type: job.type,
              skills: Array.isArray(job.skills) ? job.skills : job.skills.join(', '), // Convert back to string for input display
              experience: job.experience,
              education: job.education,
              notes: job.notes,
          }));
          setJobs(updatedJobsInState);
      }

      alert("Company profile and jobs saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving company profile or jobs.");
    } finally {
        setSaving(false);
    }
  };
  
  if (!user) return <p>Please log in to manage your company profile.</p>;
  if (loading) return <p>Loading company profile...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>🏢 Company Profile & Job Posting</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* --- COMPANY INFO --- */}
        <h3 style={{ marginTop: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Company Information</h3>
        <div>
          <label>Company Name</label>
          <input type="text" name="companyName" value={companyData.companyName} onChange={handleCompanyChange} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div>
          <label>Email (Used for notifications)</label>
          <input type="email" name="email" value={companyData.email} onChange={handleCompanyChange} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div>
          <label>Company Description</label>
          <textarea name="description" value={companyData.description} onChange={handleCompanyChange} rows="3" required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div>
          <label>Location</label>
          <input type="text" name="location" value={companyData.location} onChange={handleCompanyChange} required style={{ width: "100%", padding: "8px" }} />
        </div>

        {/* --- JOB POSTING --- */}
        <h3 style={{ marginTop: "2rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Open Job Positions</h3>

        {jobs.map((job, index) => (
          <div key={index} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", background: "#f9f9f9" }}>
            <p style={{ fontWeight: 'bold', borderBottom: '1px dotted #ccc', marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>Job #{index + 1}: {job.title || 'New Position'}</p>

            <div>
              <label>Job Title</label>
              <input type="text" name="title" value={job.title} onChange={(e) => handleJobChange(index, e)} required style={{ width: "100%", padding: "8px" }} />
            </div>

            <div>
              <label>Job Type</label>
              <select name="type" value={job.type} onChange={(e) => handleJobChange(index, e)} style={{ width: "100%", padding: "8px" }}>
                <option value="white">White Collar (Professional/Office)</option>
                <option value="blue">Blue Collar (Skilled Trades/Manual)</option>
              </select>
            </div>

            <div>
              <label>Required Skills (Comma Separated)</label>
              {/* If skills is an array, join it for display */}
              <input 
                type="text" 
                name="skills" 
                placeholder="e.g. welding, forklift certification, CAD, Python" 
                value={Array.isArray(job.skills) ? job.skills.join(', ') : job.skills} 
                onChange={(e) => handleJobChange(index, e)} 
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label>Experience (e.g. 2+ years)</label>
              <input type="text" name="experience" placeholder="e.g. 2+ years in field" value={job.experience} onChange={(e) => handleJobChange(index, e)} style={{ width: "100%", padding: "8px" }} />
            </div>

            {job.type === "white" && (
              <div>
                <label>Education (e.g. Bachelor's Degree in CS)</label>
                <input type="text" name="education" placeholder="e.g. Bachelor's Degree" value={job.education} onChange={(e) => handleJobChange(index, e)} style={{ width: "100%", padding: "8px" }} />
              </div>
            )}

            <div>
              <label>Additional Notes (Job Description Summary)</label>
              <textarea name="notes" placeholder="Detailed job description summary for AI matching" value={job.notes} onChange={(e) => handleJobChange(index, e)} rows="2" style={{ width: "100%", padding: "8px" }} />
            </div>

            {jobs.length > 1 && (
              <button type="button" onClick={() => removeJob(index)} style={{ backgroundColor: "#dc3545", color: "#fff", marginTop: "0.5rem", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>
                Remove Job
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addJob} style={{ backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", padding: "0.6rem 1rem", marginTop: "1rem", cursor: "pointer" }}>
          + Add Another Job Position
        </button>

        <button type="submit" disabled={saving} style={{ backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", padding: "0.8rem 1rem", marginTop: "1.5rem", cursor: "pointer", fontWeight: "bold" }}>
          {saving ? 'Saving...' : 'Save Profile & Update Job Listings'}
        </button>
      </form>
    </div>
  );
}

export default CompanyProfile;