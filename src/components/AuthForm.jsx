// src/components/AuthForm.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AuthForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const userTypeParam = queryParams.get("type") || "white"; // from URL
  const userTypeLower = userTypeParam.toLowerCase();

  const [identifier, setIdentifier] = useState(""); // email
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (loginError) throw loginError;

      const type = data.user?.user_metadata?.type;
      if (type === "white" || type === "blue" || type === "company") navigate("/profile");
      else navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  // --- SIGN UP ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: { data: { type: userTypeLower } },
      });
      if (signUpError) throw signUpError;

      // 2️⃣ Insert into the correct custom table
      if (signUpData.user) {
        const tableName =
          userTypeLower === "white"
            ? "white_users"
            : userTypeLower === "blue"
            ? "blue_users"
            : "company_users";

        const { error: insertError } = await supabase
          .from(tableName)
          .insert([
            {
              id: signUpData.user.id,
              email: signUpData.user.email,
              username: signUpData.user.email, // FIX: add username so it's not null
              profile_data: {},
            },
          ]);
        if (insertError) throw insertError;
      }

      setMessage(t("check_email_confirmation"));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier);
      if (resetError) throw resetError;
      setMessage(t("password_reset_sent"));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "2rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "350px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {isResetting ? t("reset_password") : isSignUp ? t("sign_up") : t("login")}
      </h2>

      <form
        onSubmit={
          isResetting
            ? handleResetPassword
            : isSignUp
            ? handleSignUp
            : handleLogin
        }
      >
        <div style={{ marginBottom: "1rem" }}>
          <label>{t("email")}</label>
          <input
            type="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {!isResetting && (
          <div style={{ marginBottom: "1rem" }}>
            <label>{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}

        <button
          type="submit"
          style={{
            width: "100%",
            background: "#007bff",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {isResetting
            ? t("send_reset_link")
            : isSignUp
            ? t("sign_up")
            : t("login")}
        </button>
      </form>

      <div
        style={{
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#555",
          marginTop: "10px",
        }}
      >
        {!isResetting && (
          <p
            onClick={() => setIsResetting(true)}
            style={{
              cursor: "pointer",
              color: "#007bff",
              textDecoration: "underline",
            }}
          >
            {t("forgot_password")}
          </p>
        )}

        {isResetting ? (
          <p
            onClick={() => setIsResetting(false)}
            style={{
              cursor: "pointer",
              color: "#007bff",
              textDecoration: "underline",
            }}
          >
            {t("back_to_login")}
          </p>
        ) : (
          <p>
            {isSignUp ? t("already_have_account") : t("dont_have_account")}{" "}
            <span
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setMessage("");
              }}
              style={{
                cursor: "pointer",
                color: "#007bff",
                textDecoration: "underline",
              }}
            >
              {isSignUp ? t("login") : t("sign_up")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
