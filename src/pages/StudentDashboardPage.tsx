import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Progress,
  Spin,
  Empty,
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
          }}>
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
                  }}>
                  <MdPlayCircleFilled size={28} color="#2563eb" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}>
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
                  }}>
                  <MdTrendingUp size={28} color="#f59e0b" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}>
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
                  }}>
                  <MdCheckCircle size={28} color="#10b981" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}>
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
                  }}>
                  <MdCheckCircle size={28} color="#ec4899" />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 13 }}>
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
              style={{ padding: 0 }}>
              Xem tất cả
            </Button>
          }>
          {!dashboard?.recent_courses?.length ? (
            <Empty description="Bạn chưa đăng ký khóa học nào" />
          ) : (
            <Row gutter={[16, 16]}>
              {dashboard.recent_courses.map((course) => (
                <Col xs={24} sm={24} md={8} key={course._id}>
                  <Card
                    variant="borderless"
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                    styles={{ body: { padding: 0 } }}>
                    <div
                      style={{
                        height: 160,
                        background: `linear-gradient(135deg, ${
                          Math.random() > 0.5 ? "#667eea" : "#f093fb"
                        } 0%, ${Math.random() > 0.5 ? "#764ba2" : "#4facfe"} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      <MdPlayCircleFilled size={48} color="white" />
                    </div>
                    <div style={{ padding: 16 }}>
                      <Title
                        level={5}
                        style={{
                          margin: "0 0 8px 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                        {course.title}
                      </Title>
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Tiến độ
                          </Text>
                          <Text strong style={{ fontSize: 13 }}>
                            {Math.round(course.progress_percent)}%
                          </Text>
                        </div>
                        <Progress
                          percent={course.progress_percent}
                          showInfo={false}
                          strokeColor="#2563eb"
                        />
                      </div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "block",
                          marginBottom: 12,
                        }}>
                        {course.completed_lessons}/{course.total_lessons} bài
                        học
                      </Text>
                      <Button
                        type="primary"
                        block
                        icon={<MdPlayCircleFilled />}
                        onClick={() =>
                          navigate(`/student/course/${course.slug}`)
                        }>
                        Học tiếp
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
