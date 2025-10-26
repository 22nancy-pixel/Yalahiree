import React, { useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      const userType = data.user?.user_metadata?.type
      if (userType === "white") navigate("/whitecollar")
      else if (userType === "blue") navigate("/bluecollar")
      else if (userType === "company") navigate("/dashboard")
      else navigate("/home")
    }
  }

  // --- SIGN UP ---
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { type: "white" }, // default type — change after signup if needed
      },
    })

    if (error) setError(error.message)
    else setMessage("Check your email for confirmation link.")
  }

  // --- RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) setError(error.message)
    else setMessage("Password reset email sent. Please check your inbox.")
  }

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
          ? "Reset Password"
          : isSignUp
          ? "Sign Up"
          : "Login"}
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
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            <label>Password</label>
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

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}
        {message && (
          <p style={{ color: "green", textAlign: "center" }}>{message}</p>
        )}

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
            ? "Send Reset Link"
            : isSignUp
            ? "Sign Up"
            : "Login"}
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
            Forgot your password?
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
            Back to login
          </p>
        ) : (
          <p>
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
            <span
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
                setMessage("")
              }}
              style={{
                cursor: "pointer",
                color: "#007bff",
                textDecoration: "underline",
              }}
            >
              {isSignUp ? "Login" : "Sign Up"}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
