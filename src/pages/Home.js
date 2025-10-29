import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaHardHat, FaBriefcase } from "react-icons/fa";
import { useSession } from "../useSession";

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSession();

  if (session) return <div></div>;

  const handleSelectType = (type) => {
    navigate(`/auth?type=${type}`);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "#F0F4F8",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ color: "#004080" }}>{t("choose_type_title")}</h1>
      <p style={{ marginBottom: "2rem" }}>{t("choose_type_msg")}</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
        <button
          onClick={() => handleSelectType("blue")}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <FaHardHat size={60} color="#004080" />
          <p style={{ marginTop: "0.5rem", fontWeight: "bold", color: "#004080" }}>
            {t("blue_collar")}
          </p>
        </button>

        <button
          onClick={() => handleSelectType("white")}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <FaBriefcase size={60} color="#B3C5DD" />
          <p style={{ marginTop: "0.5rem", fontWeight: "bold", color: "#B3C5DD" }}>
            {t("white_collar")}
          </p>
        </button>
      </div>
    </div>
  );
}

export default Home;
