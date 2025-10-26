// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          navigate("/auth")
          return
        }

        const userType = user.user_metadata?.type
        const tableName = userType === "blue" ? "blue_users" : "white_users"

        const { data, error: profileError } = await supabase
          .from(tableName)
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError
        setProfile({ ...data, type: userType })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  if (loading) return <p>Loading profile...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>
  if (!profile) return <p>No profile found.</p>

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2rem",
        borderRadius: "10px",
        background: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#004080" }}>
        {profile.type === "blue" ? "Blue Collar Profile" : "White Collar Profile"}
      </h2>

      <div style={{ marginTop: "1rem" }}>
        <p><strong>Name:</strong> {profile.username || "Not provided"}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p>
          <strong>Phone:</strong>{" "}
          {profile.profile_data?.phone || "Not provided"}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {profile.profile_data?.location || "Not provided"}
        </p>
        {profile.type === "white" && (
          <p>
            <strong>Profession:</strong>{" "}
            {profile.profile_data?.profession || "Not provided"}
          </p>
        )}
        {profile.type === "blue" && (
          <p>
            <strong>Skills:</strong>{" "}
            {profile.profile_data?.skills?.join(", ") || "Not provided"}
          </p>
        )}
      </div>

      <button
        onClick={() =>
          navigate(
            profile.type === "blue"
              ? "/edit-blue-profile"
              : "/edit-white-profile"
          )
        }
        style={{
          marginTop: "1.5rem",
          width: "100%",
          padding: "10px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Edit Profile
      </button>
    </div>
  )
}
