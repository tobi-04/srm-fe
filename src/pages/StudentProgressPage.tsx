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
  Progress,
  Badge,
} from "antd";
import {
  MdSearch,
  MdRefresh,
  MdAccessTime,
  MdPeople,
  MdTrendingUp,
} from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { adminAnalyticsApi } from "../api/adminAnalyticsApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function StudentProgressPage() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 1. Fetch Summary Stats
  const { data: summary } = useQuery({
    queryKey: ["admin-progress-summary"],
    queryFn: adminAnalyticsApi.getProgressSummary,
  });

  // 2. Fetch Paginated Student Progress
  const {
    data: progressData,
    isLoading: progressLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-student-progress", currentPage, searchText, statusFilter],
    queryFn: () =>
      adminAnalyticsApi.getStudentProgress({
        page: currentPage,
        limit: pageSize,
        search: searchText,
        status: statusFilter,
      }),
  });

  const statsCards = [
    {
      title: "TỶ LỆ HOÀN THÀNH TB",
      value: summary ? `${summary.avgCompletion}%` : "0%",
      percent: summary?.avgCompletion || 0,
      icon: <MdTrendingUp size={24} color="#6366f1" />,
      iconBg: "#eef2ff",
      color: "#6366f1",
    },
    {
      title: "HỌC VIÊN ĐANG HỌC",
      value: summary?.activeToday || 0,
      subValue: "online",
      icon: <MdPeople size={24} color="#10b981" />,
      iconBg: "#ecfdf5",
      color: "#10b981",
      showBadge: true,
    },
    {
      title: "XONG TRONG NGÀY",
      value: `${summary?.completedToday || 0} học viên`,
      subValue: "Hoàn thành ít nhất 1 bài học",
      icon: <MdRefresh size={24} color="#f59e0b" />,
      iconBg: "#fffbeb",
      color: "#f59e0b",
    },
    {
      title: "TỔNG THỜI LƯỢNG HỌC",
      value: `${summary?.totalDurationHours || 0}h`,
      subValue: "Tính từ đầu tháng",
      icon: <MdAccessTime size={24} color="#3b82f6" />,
      iconBg: "#eff6ff",
      color: "#3b82f6",
    },
  ];

  const columns = [
    {
      title: "HỌC VIÊN",
      key: "student",
      render: (record: any) => (
        <Space>
          <Avatar
            src={record.student.avatar}
            style={{ backgroundColor: "#6366f1", fontWeight: "bold" }}>
            {record.student.name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong style={{ display: "block" }}>
              {record.student.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.student.id?.slice(-4).toUpperCase()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "KHÓA HỌC",
      key: "course",
      render: (record: any) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {record.course.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Lesson: Processing...
          </Text>
        </div>
      ),
    },
    {
      title: "TIẾN ĐỘ",
      key: "progress",
      width: 250,
      render: (record: any) => (
        <div style={{ paddingRight: 24 }}>
          <Progress
            percent={record.progress}
            size="small"
            strokeColor={record.progress >= 100 ? "#10b981" : "#6366f1"}
            trailColor="#f1f5f9"
            showInfo={false}
          />
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <Text strong style={{ fontSize: 12 }}>
              {record.progress}%
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "NGÀY BẮT ĐẦU",
      key: "startDate",
      render: (record: any) => (
        <Text style={{ color: "#64748b" }}>
          {dayjs(record.startDate).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "TRẠNG THÁI",
      key: "status",
      align: "center" as const,
      render: (record: any) => (
        <Tag
          color={record.isCompleted ? "success" : "blue"}
          style={{
            borderRadius: 12,
            padding: "0 12px",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: 10,
          }}>
          {record.isCompleted ? "HOÀN THÀNH" : "ĐANG HỌC"}
        </Tag>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div
        style={{
          background: "#f8fafc",
          minHeight: "100%",
          padding: "0 0 32px 0",
        }}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Header */}
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              Theo dõi tiến độ học tập
            </Title>
            <Text type="secondary">
              Giám sát quá trình hoàn thành khóa học và mức độ chuyên cần của
              học viên.
            </Text>
          </div>

          {/* Stats Row */}
          <Row gutter={[24, 24]}>
            {statsCards.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  variant="borderless"
                  style={{ borderRadius: 16, height: "100%" }}
                  styles={{ body: { padding: "20px" } }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}>
                    {stat.title}
                  </Text>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}>
                    <div>
                      <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                        {stat.value}
                      </Title>
                      {stat.subValue && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 4,
                          }}>
                          {stat.showBadge && (
                            <Badge
                              status="success"
                              style={{ marginBottom: 4 }}
                            />
                          )}
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              color: stat.showBadge ? "#10b981" : undefined,
                            }}>
                            {stat.subValue}
                          </Text>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: stat.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      {stat.icon}
                    </div>
                  </div>
                  {stat.percent !== undefined && (
                    <Progress
                      percent={stat.percent}
                      showInfo={false}
                      strokeColor={stat.color}
                      style={{ marginTop: 16 }}
                      size={["100%", 4]}
                    />
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          {/* Filters & Table */}
          <Card
            variant="borderless"
            style={{ borderRadius: 16 }}
            styles={{ body: { padding: "24px" } }}>
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
              }}>
              <Input
                placeholder="Tìm tên học viên hoặc khóa học..."
                prefix={<MdSearch size={22} style={{ color: "#94a3b8" }} />}
                style={{
                  width: 400,
                  borderRadius: 12,
                  height: 44,
                  background: "#f1f5f9",
                  border: "none",
                }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Space>
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "4px",
                    borderRadius: 12,
                    display: "flex",
                    gap: 4,
                  }}>
                  <Button
                    type={statusFilter === undefined ? "primary" : "text"}
                    onClick={() => setStatusFilter(undefined)}
                    style={{ borderRadius: 8, height: 36, fontWeight: 600 }}>
                    Tất cả
                  </Button>
                  <Button
                    type={statusFilter === "learning" ? "primary" : "text"}
                    onClick={() => setStatusFilter("learning")}
                    style={{ borderRadius: 8, height: 36, fontWeight: 600 }}>
                    Đang học
                  </Button>
                  <Button
                    type={statusFilter === "completed" ? "primary" : "text"}
                    onClick={() => setStatusFilter("completed")}
                    style={{ borderRadius: 8, height: 36, fontWeight: 600 }}>
                    Hoàn thành
                  </Button>
                </div>
                <Button
                  icon={<MdRefresh size={20} />}
                  onClick={() => refetch()}
                  style={{
                    height: 44,
                    width: 44,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={progressData?.data || []}
              rowKey="id"
              loading={progressLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: progressData?.total || 0,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                style: { marginTop: 24 },
              }}
              style={{ background: "white" }}
              rowClassName="modern-table-row"
            />
          </Card>
        </Space>
      </div>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #94a3b8 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 2px solid #f1f5f9 !important;
        }
        .modern-table-row:hover > td {
          background: #f8fafc !important;
        }
        .ant-progress-bg {
          height: 6px !important;
          border-radius: 10px !important;
        }
        .ant-progress-inner {
          background: #f1f5f9 !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
