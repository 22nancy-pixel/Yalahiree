// src/components/AuthForm.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AuthForm({ userType = "white" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isBlue = userType === "blue";

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      let loginEmail = identifier;

      if (isBlue) {
        // Fetch email by phone
        const { data, error: fetchError } = await supabase
          .from("blue_users")
          .select("email")
          .eq("phone", identifier)
          .single();
        if (fetchError || !data?.email) throw new Error(t("invalid_phone"));
        loginEmail = data.email;
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (loginError) throw loginError;

      const type = data.user?.user_metadata?.type;
      if (type === "white") navigate("/whitecollar");
      else if (type === "blue") navigate("/bluecollar");
      else if (type === "company") navigate("/dashboard");
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: { data: { type: "white" } }, // default, adjust later
      });
      if (signUpError) throw signUpError;

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
        {isResetting
          ? t("reset_password")
          : isSignUp
          ? t("sign_up")
          : t("login")}
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
          <label>{isBlue && !isSignUp ? t("phone_number") : t("email")}</label>
          <input
            type={isBlue && !isSignUp ? "text" : "email"}
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
            style={{
              cursor: "pointer",
              color: "#007bff",
              textDecoration: "underline",
            }}
            onClick={() => setIsResetting(true)}
          >
            {t("forgot_password")}
          </p>
        )}

        {isResetting ? (
          <p
            style={{
              cursor: "pointer",
              color: "#007bff",
              textDecoration: "underline",
            }}
            onClick={() => setIsResetting(false)}
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
