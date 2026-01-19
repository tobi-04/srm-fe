import { ReactNode, useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Button,
  Drawer,
  type MenuProps,
} from "antd";
import {
  MdDashboard,
  MdMenuBook,
  MdPerson,
  MdLogout,
  MdMenu,
  MdTrendingUp,
  MdShoppingCart,
  MdPlayCircleFilled,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getAvatarStyles } from "../utils/color";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface StudentDashboardLayoutProps {
  children: ReactNode;
}

export default function StudentDashboardLayout({
  children,
}: StudentDashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setDrawerVisible(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "/student/dashboard",
      icon: <MdDashboard size={20} />,
      label: "Trang chủ",
    },
    {
      key: "/student/courses",
      icon: <MdPlayCircleFilled size={20} />,
      label: "Khóa học của tôi",
    },
    {
      key: "/student/progress",
      icon: <MdTrendingUp size={20} />,
      label: "Tiến độ học tập",
    },
    {
      key: "/student/profile",
      icon: <MdPerson size={20} />,
      label: "Hồ sơ cá nhân",
    },
    {
      key: "/student/orders",
      icon: <MdShoppingCart size={20} />,
      label: "Lịch sử đơn hàng",
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <MdPerson />,
      label: "Hồ sơ cá nhân",
      onClick: () => navigate("/student/profile"),
    },
    {
      key: "logout",
      icon: <MdLogout />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const sidebarContent = (
    <>
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 12,
        }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}>
          <MdMenuBook color="white" size={20} />
        </div>
        {(!collapsed || isMobile) && (
          <div style={{ lineHeight: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#1e293b",
                display: "block",
              }}>
              Học viên Portal
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Nền tảng học trực tuyến
            </Text>
          </div>
        )}
      </div>
      <div style={{ padding: "0 12px 16px", flex: 1, overflowY: "auto" }}>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
            if (isMobile) setDrawerVisible(false);
          }}
          style={{ border: "none" }}
          className="modern-menu"
        />
      </div>
      <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
        <Button
          type="text"
          icon={<MdLogout size={20} />}
          block
          onClick={handleLogout}
          style={{
            color: "#64748b",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
          Đăng xuất
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          style={{
            background: "#ffffff",
            borderRight: "1px solid #f1f5f9",
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            zIndex: 100,
          }}>
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        styles={{
          body: { padding: 0, display: "flex", flexDirection: "column" },
        }}>
        {sidebarContent}
      </Drawer>

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 280,
          transition: "margin-left 0.2s",
        }}>
        <Header
          style={{
            padding: "0 24px",
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MdMenu size={24} />}
                onClick={() => setDrawerVisible(true)}
              />
            )}
            {!isMobile && (
              <Button
                type="text"
                icon={<MdMenu size={24} />}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
          </div>

          <Space size="middle">
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 12,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }>
                <Avatar
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    ...getAvatarStyles(user?.name || user?.email || "Student"),
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {user?.name ? (
                    user.name.substring(0, 2).toUpperCase()
                  ) : (
                    <MdPerson />
                  )}
                </Avatar>
                <div style={{ display: isMobile ? "none" : "block" }}>
                  <Text strong style={{ display: "block", fontSize: 14 }}>
                    {user?.name || "Học viên"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Student
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: isMobile ? "16px" : "24px" }}>
          {children}
        </Content>
      </Layout>

      <style>{`
        .modern-menu .ant-menu-item {
          border-radius: 8px;
          margin: 4px 0;
          height: 44px;
          line-height: 44px;
          transition: all 0.2s;
        }
        .modern-menu .ant-menu-item-selected {
          background: #eff6ff !important;
          color: #2563eb !important;
          font-weight: 600;
        }
        .modern-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
          background: #f8fafc;
        }
      `}</style>
    </Layout>
  );
}
