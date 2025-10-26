// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          navigate("/auth");
          return;
        }

        const userType = user.user_metadata?.type;
        const tableName = userType === "blue" ? "blue_users" : "white_users";

        const { data, error: profileError } = await supabase
          .from(tableName)
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile({ ...data, type: userType });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p>{t("loading_profile")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>{t("no_profile_found")}</p>;

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
        {t("yalahire_title")}
      </h2>

      <div style={{ marginTop: "1rem" }}>
        <p>
          <strong>{t("name")}:</strong> {profile.username || t("not_provided")}
        </p>
        <p>
          <strong>{t("email")}:</strong> {profile.email}
        </p>
        <p>
          <strong>{t("phone")}:</strong>{" "}
          {profile.profile_data?.phone || t("not_provided")}
        </p>
        <p>
          <strong>{t("location")}:</strong>{" "}
          {profile.profile_data?.location || t("not_provided")}
        </p>
        {profile.type === "white" && (
          <p>
            <strong>{t("profession")}:</strong>{" "}
            {profile.profile_data?.profession || t("not_provided")}
          </p>
        )}
        {profile.type === "blue" && (
          <p>
            <strong>{t("skills")}:</strong>{" "}
            {profile.profile_data?.skills?.join(", ") || t("not_provided")}
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
        {t("edit_profile")}
      </button>
    </div>
  );
}
