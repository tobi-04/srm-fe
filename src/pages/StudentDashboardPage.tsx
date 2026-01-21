import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Progress,
  Spin,
  Empty,
  Table,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MdPlayCircleFilled,
  MdTrendingUp,
  MdCheckCircle,
} from "react-icons/md";
import StudentDashboardLayout from "../components/StudentDashboardLayout";
import { studentApi } from "../api/studentApi";

const { Title, Text } = Typography;

export default function StudentDashboardPage() {
  const navigate = useNavigate();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => studentApi.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>
            Xin chào, {dashboard?.student.name || "Học viên"}! 👋
          </Title>
          <Text type="secondary">Chào mừng bạn quay trở lại</Text>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdPlayCircleFilled size={28} color="#2563eb" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}
                  >
                    Tổng khóa học
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {dashboard?.stats.total_courses || 0}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdTrendingUp size={28} color="#f59e0b" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}
                  >
                    Đang học
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {dashboard?.stats.in_progress_courses || 0}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdCheckCircle size={28} color="#10b981" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}
                  >
                    Hoàn thành
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {dashboard?.stats.completed_courses || 0}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card variant="borderless" style={{ borderRadius: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "#fce7f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdCheckCircle size={28} color="#ec4899" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}
                  >
                    Bài đã học
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {dashboard?.stats.total_lessons_completed || 0}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Courses */}
        <Card
          variant="borderless"
          style={{ borderRadius: 12, marginBottom: 24 }}
          title={
            <Title level={4} style={{ margin: 0 }}>
              Khóa học của bạn
            </Title>
          }
          extra={
            <Button
              type="link"
              onClick={() => navigate("/student/courses")}
              style={{ padding: 0 }}
            >
              Xem tất cả
            </Button>
          }
        >
          <Table
            dataSource={dashboard?.recent_courses || []}
            rowKey="_id"
            locale={{
              emptyText: <Empty description="Bạn chưa đăng ký khóa học nào" />,
            }}
            scroll={{ x: 800 }}
            pagination={false}
            columns={[
              {
                title: "Khóa học",
                dataIndex: "title",
                key: "title",
                width: 250,
                render: (text: string, record: any) => (
                  <div>
                    <Text
                      strong
                      style={{
                        color: "#1e293b",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {text}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Slug: {record.slug}
                    </Text>
                  </div>
                ),
              },
              {
                title: "Mô tả",
                dataIndex: "description",
                key: "description",
                width: 200,
                ellipsis: true,
              },
              {
                title: "Tiến độ",
                dataIndex: "progress_percent",
                key: "progress_percent",
                width: 180,
                render: (percent: number) => (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Hoàn thành
                      </Text>
                      <Text strong style={{ fontSize: 13 }}>
                        {Math.round(percent)}%
                      </Text>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor="#2563eb"
                      size="small"
                    />
                  </div>
                ),
              },
              {
                title: "Bài học",
                key: "lessons",
                width: 120,
                render: (_: any, record: any) => (
                  <Text style={{ fontSize: 13 }}>
                    {record.completed_lessons}/{record.total_lessons} bài
                  </Text>
                ),
              },
              {
                title: "Ngày đăng ký",
                dataIndex: "enrolled_at",
                key: "enrolled_at",
                width: 130,
                render: (date: Date) =>
                  new Date(date).toLocaleDateString("vi-VN"),
              },
              {
                title: "Hành động",
                key: "action",
                width: 150,
                render: (_: any, record: any) => (
                  <Button
                    type="primary"
                    icon={<MdPlayCircleFilled />}
                    onClick={() =>
                      window.open(`/learn/${record._id}`, "_blank")
                    }
                  >
                    Học tiếp
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
