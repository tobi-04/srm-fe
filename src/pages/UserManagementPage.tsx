import { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Input,
  Avatar,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  MdPerson,
  MdSearch,
  MdRefresh,
  MdAdd,
  MdMoreVert,
  MdEmail,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../api/client";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagementPage() {
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", searchText],
    queryFn: async () => {
      const response = await apiClient.get("/users", {
        params: {
          page: 1,
          limit: 100,
          search: searchText,
        },
      });
      return response.data;
    },
  });

  const users = data?.data || [];

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string, record: User) => (
        <Space size="middle">
          <Avatar
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              ...getAvatarStyles(text || record._id),
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}>
            {text ? text.substring(0, 2).toUpperCase() : <MdPerson />}
          </Avatar>
          <div>
            <Text strong style={{ display: "block", color: "#1e293b" }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record._id?.slice(-6).toUpperCase() || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (text: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdEmail />
          {text}
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role: string) => {
        const roleConfig: Record<string, { color: string; bg: string }> = {
          admin: { color: "#ef4444", bg: "#fef2f2" },
          user: { color: "#6366f1", bg: "#eef2ff" },
          sale: { color: "#10b981", bg: "#ecfdf5" },
        };
        const config = roleConfig[role] || { color: "#64748b", bg: "#f1f5f9" };
        return (
          <Tag style={{ color: config.color, background: config.bg }}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 150,
      render: (active: boolean) => (
        <Space
          size="small"
          style={{ color: active ? "#10b981" : "#ef4444", fontWeight: 600 }}>
          {active ? <MdCheckCircle /> : <MdCancel />}
          {active ? "Active" : "Inactive"}
        </Space>
      ),
    },
    {
      title: "Joined Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdCalendarToday />
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Space>
      ),
    },
    {
      title: "",
      key: "action",
      width: 150,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button type="text" size="small" style={{ color: "#6366f1" }}>
            Edit
          </Button>
          <Button type="text" size="small" danger>
            {record.is_active ? "Disable" : "Enable"}
          </Button>
          <Button type="text" icon={<MdMoreVert />} />
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            User Management
          </Title>
          <Text className="page-subtitle">
            Manage system users, roles, and access permissions
          </Text>
        </div>
        <Button type="primary" icon={<MdAdd size={20} />} size="large">
          Add New User
        </Button>
      </div>

      <Card variant="borderless">
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}>
          <Space size="middle">
            <Input
              placeholder="Search by name or email..."
              prefix={<MdSearch size={20} style={{ color: "#94a3b8" }} />}
              style={{ width: 320 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => refetch()}
            />
            <Button
              icon={<MdRefresh size={20} />}
              onClick={() => refetch()}
              loading={isLoading}>
              Refresh
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            itemRender: (_, type, originalElement) => {
              if (type === "prev")
                return (
                  <Text style={{ color: "#6366f1", fontWeight: 600 }}>
                    Previous
                  </Text>
                );
              if (type === "next")
                return (
                  <Text style={{ color: "#6366f1", fontWeight: 600 }}>
                    Next
                  </Text>
                );
              return originalElement;
            },
          }}
        />
      </Card>

      <style>{`
        .ant-table-body::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .ant-table-body::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .ant-table-body::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </DashboardLayout>
  );
}
