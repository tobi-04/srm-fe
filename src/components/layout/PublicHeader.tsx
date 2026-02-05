import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Space, Dropdown } from "antd";
import { MdSchool, MdMenu } from "react-icons/md";
import { useAuthStore } from "../../stores/authStore";

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Khóa học", path: "/courses" },
    { label: "Sách", path: "/books" },
    { label: "Indicator", path: "/indicators" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f78404, #fb9d14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(247, 132, 4, 0.25)",
            }}
          >
            <MdSchool style={{ color: "#fff", fontSize: 26 }} />
          </div>
          <div>
            {location.pathname === "/" ? (
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1e293b",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                SRM <span style={{ color: "#f78404" }}>FIN-EDU</span>
              </h1>
            ) : (
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1e293b",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                SRM <span style={{ color: "#f78404" }}>FIN-EDU</span>
              </h2>
            )}
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
              Financial Education Platform
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: "flex",
            gap: 8,
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: "8px 20px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 15,
                color: isActive(item.path) ? "#f78404" : "#475569",
                borderBottom: isActive(item.path)
                  ? "2px solid #f78404"
                  : "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.color = "#f78404";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              {item.label}
            </div>
          ))}
        </nav>

        {/* CTA Buttons */}
        <Space size="middle">
          {isAuthenticated ? (
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/admin/dashboard")}
              style={{
                background: "linear-gradient(135deg, #f78404, #fb9d14)",
                border: "none",
                fontWeight: 600,
                height: 44,
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(247, 132, 4, 0.25)",
              }}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                size="large"
                onClick={() => navigate("/login")}
                style={{
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/register")}
                style={{
                  background: "linear-gradient(135deg, #f78404, #fb9d14)",
                  border: "none",
                  fontWeight: 600,
                  height: 44,
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(247, 132, 4, 0.25)",
                }}
              >
                Đăng ký ngay
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Dropdown
            menu={{
              items: navItems.map((item) => ({
                key: item.path,
                label: item.label,
                onClick: () => navigate(item.path),
              })),
            }}
            trigger={["click"]}
          >
            <Button
              icon={<MdMenu style={{ fontSize: 20 }} />}
              size="large"
              className="mobile-menu-btn"
              style={{
                display: "none",
                height: 44,
                width: 44,
                borderRadius: 8,
              }}
            />
          </Dropdown>
        </Space>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default PublicHeader;
