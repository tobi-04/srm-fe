import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Divider } from "antd";
import {
  MdSchool,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdFacebook,
} from "react-icons/md";
import { FaTwitter, FaLinkedin, FaYoutube, FaTelegram } from "react-icons/fa";

const PublicFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { label: "Khóa học", path: "/courses" },
      { label: "Sách", path: "/books" },
      { label: "Indicator", path: "/indicators" },
    ],
    company: [
      { label: "Về chúng tôi", path: "/about" },
      { label: "Liên hệ", path: "/contact" },
      { label: "Blog", path: "/blog" },
    ],
    legal: [
      { label: "Điều khoản sử dụng", path: "/terms" },
      { label: "Chính sách bảo mật", path: "/privacy" },
      { label: "Chính sách hoàn tiền", path: "/refund" },
    ],
  };

  const socialLinks = [
    { icon: <MdFacebook />, url: "#", color: "#1877f2" },
    { icon: <FaTwitter />, url: "#", color: "#1da1f2" },
    { icon: <FaLinkedin />, url: "#", color: "#0a66c2" },
    { icon: <FaYoutube />, url: "#", color: "#ff0000" },
    { icon: <FaTelegram />, url: "#", color: "#0088cc" },
  ];

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "#e2e8f0",
        marginTop: "auto",
      }}
    >
      {/* Main Footer Content */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "60px 24px 32px",
        }}
      >
        <Row gutter={[48, 48]}>
          {/* Brand Column */}
          <Col xs={24} sm={24} md={8} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #f78404, #fb9d14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(247, 132, 4, 0.25)",
                  }}
                >
                  <MdSchool style={{ color: "#fff", fontSize: 28 }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    SRM <span style={{ color: "#f78404" }}>FIN-EDU</span>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}
                  >
                    Financial Education Platform
                  </div>
                </div>
              </div>

              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>
                Nền tảng giáo dục tài chính hàng đầu Việt Nam. Cung cấp khóa
                học, sách và công cụ phân tích chuyên nghiệp cho nhà đầu tư.
              </p>

              {/* Social Links */}
              <Space size="middle">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 18,
                      transition: "all 0.3s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = social.color;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </Space>
            </Space>
          </Col>

          {/* Products Column */}
          <Col xs={12} sm={8} md={5} lg={5}>
            <h3
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Sản phẩm
            </h3>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              {footerLinks.products.map((link) => (
                <div
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    color: "#cbd5e1",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f78404";
                    e.currentTarget.style.paddingLeft = "8px";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#cbd5e1";
                    e.currentTarget.style.paddingLeft = "0";
                  }}
                >
                  {link.label}
                </div>
              ))}
            </Space>
          </Col>

          {/* Company Column */}
          <Col xs={12} sm={8} md={5} lg={5}>
            <h3
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Công ty
            </h3>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              {footerLinks.company.map((link) => (
                <div
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    color: "#cbd5e1",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f78404";
                    e.currentTarget.style.paddingLeft = "8px";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#cbd5e1";
                    e.currentTarget.style.paddingLeft = "0";
                  }}
                >
                  {link.label}
                </div>
              ))}
            </Space>
          </Col>

          {/* Contact Column */}
          <Col xs={24} sm={8} md={6} lg={6}>
            <h3
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              Liên hệ
            </h3>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                <MdEmail
                  style={{ fontSize: 20, color: "#f78404", marginTop: 2 }}
                />
                <div>
                  <div style={{ color: "#cbd5e1", fontSize: 14 }}>
                    support@srmfinedu.vn
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                <MdPhone
                  style={{ fontSize: 20, color: "#f78404", marginTop: 2 }}
                />
                <div>
                  <div style={{ color: "#cbd5e1", fontSize: 14 }}>
                    +84 123 456 789
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                <MdLocationOn
                  style={{ fontSize: 20, color: "#f78404", marginTop: 2 }}
                />
                <div>
                  <div style={{ color: "#cbd5e1", fontSize: 14 }}>
                    Hà Nội, Việt Nam
                  </div>
                </div>
              </div>
            </Space>
          </Col>
        </Row>

        <Divider
          style={{
            borderColor: "rgba(255, 255, 255, 0.1)",
            margin: "40px 0 24px",
          }}
        />

        {/* Bottom Bar */}
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}
            >
              © {currentYear} SRM FIN-EDU. All rights reserved.
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space
              size="large"
              style={{
                width: "100%",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {footerLinks.legal.map((link) => (
                <div
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f78404";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  {link.label}
                </div>
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default PublicFooter;
