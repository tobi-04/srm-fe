import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography, Card, Table, Tag, Input, Space } from "antd";
import { MdPeople, MdSearch } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import salerApi from "../api/salerApi";

const { Title, Text } = Typography;

export default function SalerStudentsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["saler-students", search],
    queryFn: () => salerApi.getStudents({ search }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      title: "Tên học viên",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Khóa học đã mua",
      dataIndex: "purchased_courses",
      key: "courses",
      render: (courses: any[]) => (
        <Space direction="vertical" size={2}>
          {courses.map((course: any, idx: number) => (
            <Tag color="blue" key={idx}>
              {course?.title || "Course"}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "total_spent",
      key: "total",
      render: (amount: number) => (
        <Text strong style={{ color: "#10b981" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <MdPeople style={{ marginRight: 12 }} />
          Học viên của tôi
        </Title>
        <Text type="secondary">
          Danh sách học viên đã mua khóa học qua link giới thiệu của bạn
        </Text>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<MdSearch size={20} style={{ color: "#94a3b8" }} />}
            placeholder="Tìm kiếm học viên theo tên hoặc email..."
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400, height: 40 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </DashboardLayout>
  );
}
