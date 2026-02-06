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
  MdPerson,
  MdDescription,
  MdPeople,
  MdLogout,
  MdApps,
  MdMenuOpen,
  MdMenu,
  MdKeyboardArrowDown,
  MdMenuBook,
  MdWebAsset,
  MdMail,
  MdTrendingUp,
  MdAccountBalanceWallet,
  MdHistory,
  MdTableChart,
  MdConfirmationNumber,
  MdShowChart,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getAvatarStyles } from "../utils/color";
import ProfileDialog from "./ProfileDialog";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

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
      key: "/admin/dashboard",
      icon: <MdDashboard size={20} />,
      label: "Bảng điều khiển",
    },
    {
      key: "course-mgmt",
      label: "QUẢN LÝ KHÓA HỌC",
      type: "group",
      children: [
        {
          key: "/admin/courses",
          icon: <MdDescription size={20} />,
          label: "Danh sách bài học",
        },
        {
          key: "/admin/landing-pages",
          icon: <MdWebAsset size={20} />,
          label: "Landing Page Builder",
        },
        {
          key: "/admin/progress",
          icon: <MdApps size={20} />,
          label: "Tiến độ học tập",
        },
        {
          key: "/admin/books",
          icon: <MdMenuBook size={20} />,
          label: "Quản lý Sách",
        },
        {
          key: "/admin/books/coupons",
          icon: <MdConfirmationNumber size={20} />,
          label: "Quản lý Coupon",
        },
        {
          key: "/admin/indicators",
          icon: <MdShowChart size={20} />,
          label: "Quản lý Indicator",
        },
      ],
    },
    {
      key: "student-mgmt",
      label: "HỌC VIÊN & CRM",
      type: "group",
      children: [
        {
          key: "/admin/students",
          icon: <MdPeople size={20} />,
          label: "Quản lý Học viên",
        },
        {
          key: "/admin/salers",
          icon: <MdPerson size={20} />,
          label: "Quản lý Saler",
        },
        {
          key: "/admin/google-sheet",
          icon: <MdTableChart size={20} />,
          label: "Google Sheet",
        },
        {
          key: "/admin/email-automation",
          icon: <MdMail size={20} />,
          label: "Email Automation",
        },
        {
          key: "/admin/reports",
          icon: <MdDescription size={20} />,
          label: "Báo cáo kinh doanh",
        },
      ],
    },
    {
      key: "finance-mgmt",
      label: "TÀI CHÍNH",
      type: "group",
      children: [
        {
          key: "/admin/orders",
          icon: <MdHistory size={20} />,
          label: "Lịch sử giao dịch",
        },
        {
          key: "/admin/withdrawals",
          icon: <MdAccountBalanceWallet size={20} />,
          label: "Yêu cầu rút tiền",
        },
        {
          key: "/admin/withdrawal-config",
          icon: <MdDescription size={20} />,
          label: "Cấu hình rút tiền",
        },
      ],
    },
  ];

  const salerMenuItems: MenuProps["items"] = [
    {
      key: "/saler/dashboard",
      icon: <MdDashboard size={20} />,
      label: "Bảng điều khiển",
    },
    {
      key: "saler-mgmt",
      label: "KINH DOANH",
      type: "group",
      children: [
        {
          key: "/saler/orders",
          icon: <MdDescription size={20} />,
          label: "Đơn hàng của tôi",
        },
        {
          key: "/saler/links",
          icon: <MdApps size={20} />,
          label: "Link giới thiệu",
        },
        {
          key: "/saler/commissions",
          icon: <MdDescription size={20} />,
          label: "Hoa hồng",
        },
        {
          key: "/saler/kpi",
          icon: <MdTrendingUp size={20} />,
          label: "KPI & Mục tiêu",
        },
      ],
    },
    {
      key: "saler-settings",
      label: "TÀI KHOẢN",
      type: "group",
      children: [
        {
          key: "/saler/withdrawals",
          icon: <MdAccountBalanceWallet size={20} />,
          label: "Rút tiền",
        },
        {
          key: "/saler/settings",
          icon: <MdPerson size={20} />,
          label: "Cài đặt",
        },
      ],
    },
  ];

  const currentMenuItems = user?.role === "admin" ? menuItems : salerMenuItems;

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <MdPerson />,
      label: "Hồ sơ cá nhân",
      onClick: () => setProfileDialogOpen(true),
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
        }}
      >
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
          }}
        >
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
              }}
            >
              CRM/LMS cá nhân
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Hệ thống quản lý
            </Text>
          </div>
        )}
      </div>
      <div style={{ padding: "0 12px 16px", flex: 1, overflowY: "auto" }}>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={currentMenuItems}
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
          danger
          onClick={handleLogout}
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 40,
            borderRadius: 8,
          }}
        >
          {(!collapsed || isMobile) && "Đăng xuất"}
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {!isMobile ? (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          style={{
            overflow: "hidden",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            boxShadow: "0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.02)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
          theme="light"
        >
          {sidebarContent}
        </Sider>
      ) : (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {sidebarContent}
          </div>
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 280,
          transition: "all 0.2s",
          background: "transparent",
        }}
      >
        <Header
          style={{
            padding: isMobile ? "0 16px" : "0 32px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 72,
            position: "sticky",
            top: 0,
            zIndex: 99,
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 12 : 24,
              flex: 1,
            }}
          >
            <Button
              type="text"
              icon={
                isMobile ? (
                  <MdMenu size={24} />
                ) : collapsed ? (
                  <MdMenu size={24} />
                ) : (
                  <MdMenuOpen size={24} />
                )
              }
              onClick={() =>
                isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)
              }
              style={{
                fontSize: 20,
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>

          <Space size={isMobile ? 12 : 24}>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 8,
                  transition: "all 0.2s",
                }}
                className="user-profile-trigger"
              >
                <Avatar
                  style={{
                    ...getAvatarStyles(user?.name || "admin"),
                    fontWeight: "bold",
                    boxShadow: "none",
                  }}
                >
                  {user?.name ? (
                    user.name.substring(0, 2).toUpperCase()
                  ) : (
                    <MdPerson />
                  )}
                </Avatar>
                {!isMobile && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        lineHeight: 1.2,
                      }}
                    >
                      <Text strong style={{ fontSize: 14, color: "#1e293b" }}>
                        {user?.name || "Admin Profile"}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#64748b" }}>
                        {user?.role === "admin"
                          ? "Super Admin"
                          : "Sales Representative"}
                      </Text>
                    </div>
                    <MdKeyboardArrowDown
                      size={20}
                      style={{ color: "#94a3b8" }}
                    />
                  </>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? "16px" : "32px",
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>

      <ProfileDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />

      <style>{`
        .modern-menu.ant-menu-light .ant-menu-item {
          height: 44px;
          line-height: 44px;
          border-radius: 8px;
          margin: 4px 8px;
          color: #64748b;
          font-weight: 700;
          width: calc(100% - 16px);
        }
        .modern-menu.ant-menu-light .ant-menu-item-selected {
          background-color: #eef2ff !important;
          color: #2563eb !important;
        }
        .modern-menu.ant-menu-light .ant-menu-item:hover {
          background-color: #f1f5f9 !important;
          color: #1e293b;
        }
        .modern-menu.ant-menu-light .ant-menu-item-group-title {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          padding: 24px 24px 8px;
          letter-spacing: 0.05em;
        }
        .user-profile-trigger:hover {
          background: #f1f5f9;
        }
        .ant-layout-sider-children {
          display: flex;
          flex-direction: column;
        }
        .learning-screen-btn:hover {
          background: #e0e7ff !important;
          color: #4f46e5 !important;
        }
      `}</style>
    </Layout>
  );
}
