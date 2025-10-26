import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom"
import { useTranslation } from "react-i18next"
import { supabase } from "./supabaseClient"
import { useSession } from "./useSession"

import Home from "./pages/Home"
import EmployerDashboard from "./pages/EmployerDashboard"
import AuthForm from "./components/AuthForm"
import Original from "./pages/Original"
import BlueCollarProfile from "./pages/BlueCollarProfile"
import WhiteCollarProfile from "./pages/WhiteCollarProfile"
import CompanyProfile from "./pages/CompanyProfile"
import LanguageSelector from "./components/LanguageSelector"
import ProfilePage from "./pages/ProfilePage"

function App() {
  const { t } = useTranslation()
  const session = useSession()
  const userType = session?.user?.user_metadata?.type // 'white', 'blue', 'company'

  return (
    <Router>
      <div>
        <NavBar t={t} session={session} userType={userType} />
        <div style={{ padding: "2rem" }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Original />} />
            <Route path="/home" element={<Home />} />

            {/* Auth route */}
            <Route
              path="/auth"
              element={
                session ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 50,
                    }}
                  >
                    <AuthForm />
                  </div>
                )
              }
            />

            {/* Profile page (all users after login) */}
            <Route
              path="/profile"
              element={session ? <ProfilePage /> : <Navigate to="/auth" replace />}
            />

            {/* Profile builder/edit pages */}
            <Route
              path="/edit-blue-profile"
              element={session && userType === "blue" ? <BlueProfileBuilder /> : <Navigate to="/home" replace />}
            />
            <Route
              path="/edit-white-profile"
              element={session && userType === "white" ? <WhiteProfileBuilder /> : <Navigate to="/home" replace />}
            />

            {/* Existing protected routes */}
            <Route
              path="/whitecollar"
              element={session && userType === "white" ? <WhiteCollarProfile /> : <Navigate to="/home" replace />}
            />
            <Route
              path="/bluecollar"
              element={session && userType === "blue" ? <BlueCollarProfile /> : <Navigate to="/home" replace />}
            />
            <Route
              path="/dashboard"
              element={session && userType === "company" ? <EmployerDashboard /> : <Navigate to="/home" replace />}
            />
            <Route
              path="/company-profile"
              element={session && userType === "company" ? <CompanyProfile /> : <Navigate to="/home" replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

function NavBar({ t, session, userType }) {
  const navigate = useNavigate()

  const onLogout = async () => {
    await supabase.auth.signOut()
    navigate("/", { replace: true })
  }

  const links = [
    { name: t("home"), path: "/home", roles: ["white", "blue", "company"] },
    { name: t("whitecollar"), path: "/whitecollar", roles: ["white"] },
    { name: t("bluecollar"), path: "/bluecollar", roles: ["blue"] },
    { name: t("dashboard"), path: "/dashboard", roles: ["company"] },
    { name: t("company_profile"), path: "/company-profile", roles: ["company"] },
    { name: t("profile"), path: "/profile", roles: ["white", "blue", "company"] },
  ]

  return (
    <nav
      style={{
        padding: "1rem",
        background: "#f8f8f8",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        {links
          .filter((link) => session && link.roles.includes(userType))
          .map((link) => (
            <Link key={link.path} to={link.path} style={{ marginRight: "1rem" }}>
              {link.name}
            </Link>
          ))}
        {!session && <Link to="/auth">{t("login")}</Link>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <LanguageSelector />
        {session && (
          <>
            <span style={{ fontSize: 12, color: "#555" }}>
              {session.user?.email}
            </span>
            <button onClick={onLogout} style={{ padding: "6px 10px", cursor: "pointer" }}>
              {t("logout")}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default App
