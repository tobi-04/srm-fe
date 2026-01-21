import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  Input,
  Avatar,
  Spin,
  Progress,
  Select,
} from "antd";
import {
  MdSearch,
  MdFilterList,
  MdTrendingUp,
  MdCheckCircle,
  MdPeople,
  MdSchedule,
  MdPerson,
} from "react-icons/md";
import { getAvatarStyles } from "../utils/color";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { adminAnalyticsApi } from "../api/adminAnalyticsApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function AdminProgressPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch Summary Data
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-progress-summary"],
    queryFn: adminAnalyticsApi.getProgressSummary,
  });

  // Fetch Paginated Student Progress
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: [
      "admin-student-progress",
      currentPage,
      pageSize,
      search,
      statusFilter,
    ],
    queryFn: () =>
      adminAnalyticsApi.getStudentProgress({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const isLoading = summaryLoading || progressLoading;

  const statsCards = [
    {
      title: "Tỷ lệ hoàn thành TB",
      value: (summary?.avgCompletion || 0) + "%",
      icon: <MdTrendingUp size={24} color="#2563eb" />,
      label: "Toàn bộ hệ thống",
      iconBg: "#eff6ff",
    },
    {
      title: "Học viên hoạt động",
      value: summary?.activeToday || 0,
      icon: <MdPeople size={24} color="#7c3aed" />,
      label: "Trong ngày hôm nay",
      iconBg: "#f5f3ff",
    },
    {
      title: "Bài học hoàn thành",
      value: summary?.completedToday || 0,
      icon: <MdCheckCircle size={24} color="#059669" />,
      label: "Hôm nay",
      iconBg: "#ecfdf5",
    },
    {
      title: "Tổng thời gian học",
      value: (summary?.totalDurationHours || 0) + "h",
      icon: <MdSchedule size={24} color="#f59e0b" />,
      label: "Trong tháng này",
      iconBg: "#fffbeb",
    },
  ];

  const columns = [
    {
      title: "HỌC VIÊN",
      key: "student",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            src={record.student?.avatar}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              ...getAvatarStyles(record.student?.name || record.student?.id),
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}>
            {record.student?.name ? (
              record.student.name.substring(0, 2).toUpperCase()
            ) : (
              <MdPerson />
            )}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 14 }}>
              {record.student?.name || "N/A"}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.student?.email || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "KHÓA HỌC",
      key: "course",
      render: (_: any, record: any) => (
        <div style={{ maxWidth: 200 }}>
          <Text strong style={{ fontSize: 13 }}>
            {record.course?.title || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "TIẾN ĐỘ",
      key: "progress",
      width: 250,
      render: (_: any, record: any) => (
        <div style={{ paddingRight: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}>
            <Text style={{ fontSize: 12 }}>{record.progress}%</Text>
            {record.isCompleted && (
              <Tag color="success" style={{ borderRadius: 10, fontSize: 10 }}>
                Hoàn thành
              </Tag>
            )}
          </div>
          <Progress
            percent={record.progress}
            size="small"
            showInfo={false}
            strokeColor={record.isCompleted ? "#10b981" : "#2563eb"}
          />
        </div>
      ),
    },
    {
      title: "HOẠT ĐỘNG CUỐI",
      key: "lastActivity",
      render: (_: any, record: any) => (
        <div>
          <Text style={{ fontSize: 13 }}>
            {record.lastActivity
              ? dayjs(record.lastActivity).format("DD/MM/YYYY HH:mm")
              : "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/admin/students?id=${record.student.id}`)}
          style={{ fontWeight: 600 }}>
          Chi tiết
        </Button>
      ),
    },
  ];

  if (isLoading && !progressData) {
    return (
      <DashboardLayout>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            width: "100%",
            justifyContent: "center",
          }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: "24px 0" }}>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 800 }}>
          Tiến độ học tập
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Theo dõi và phân tích hiệu quả học tập của học viên
        </Text>

        {/* Summary Cards */}
        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 20,
                  boxShadow:
                    "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                }}
                styles={{ body: { padding: "24px" } }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: "0.025em",
                      }}>
                      {stat.title}
                    </Text>
                    <Title
                      level={2}
                      style={{
                        margin: "12px 0 4px",
                        fontWeight: 800,
                        color: "#1e293b",
                      }}>
                      {stat.value}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stat.label}
                    </Text>
                  </div>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: stat.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.05)",
                    }}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Table Section */}
        <Card
          variant="borderless"
          style={{
            marginTop: 32,
            borderRadius: 24,
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)",
            overflow: "hidden",
          }}
          styles={{ body: { padding: 0 } }}>
          {/* Filters Bar */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}>
            <div style={{ display: "flex", gap: 16, flex: 1, minWidth: 300 }}>
              <Input
                placeholder="Tìm học viên, email hoặc khóa học..."
                prefix={<MdSearch size={22} color="#94a3b8" />}
                style={{ borderRadius: 12, height: 44, maxWidth: 400 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                defaultValue="all"
                style={{ width: 160, height: 44 }}
                onChange={setStatusFilter}
                suffixIcon={<MdFilterList size={18} />}
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Đang học", value: "learning" },
                  { label: "Hoàn thành", value: "completed" },
                ]}
              />
            </div>
            <Text strong type="secondary">
              {progressData?.total || 0} kết quả
            </Text>
          </div>

          <Table
            columns={columns}
            dataSource={progressData?.data || []}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: progressData?.total || 0,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              style: { padding: "16px 24px" },
            }}
            rowKey="id"
            className="progress-table"
          />
        </Card>
      </div>

      <style>{`
        .progress-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 16px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .progress-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .progress-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
