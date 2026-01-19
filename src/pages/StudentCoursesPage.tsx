import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Progress,
  Select,
  Input,
  Tag,
  Spin,
  Empty,
  Pagination,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MdPlayCircleFilled,
  MdSearch,
  MdCheckCircle,
  MdTrendingUp,
} from "react-icons/md";
import StudentDashboardLayout from "../components/StudentDashboardLayout";
import { studentApi } from "../api/studentApi";

const { Title, Text } = Typography;

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [status, setStatus] = useState<"all" | "in_progress" | "completed">(
    "all",
  );
  const [searchText, setSearchText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["student-courses", page, pageSize, status],
    queryFn: () => studentApi.getCourses({ page, limit: pageSize, status }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredCourses = data?.data?.filter((course) =>
    searchText
      ? course.title.toLowerCase().includes(searchText.toLowerCase())
      : true,
  );

  return (
    <StudentDashboardLayout>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Khóa học của tôi
          </Title>
          <Text type="secondary">
            Quản lý và theo dõi tiến độ các khóa học đã đăng ký
          </Text>
        </div>

        {/* Filters */}
        <Card
          variant="borderless"
          style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Input
                placeholder="Tìm kiếm khóa học..."
                prefix={<MdSearch size={20} style={{ color: "#94a3b8" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Select
                value={status}
                onChange={setStatus}
                style={{ width: "100%" }}
                size="large"
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Đang học", value: "in_progress" },
                  { label: "Hoàn thành", value: "completed" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Courses Grid */}
        {isLoading ? (
          <div
            style={{
              height: "50vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Spin size="large" />
          </div>
        ) : !filteredCourses?.length ? (
          <Empty description="Không tìm thấy khóa học nào" />
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {filteredCourses.map((course) => (
                <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
                  <Card
                    variant="borderless"
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: 12,
                      overflow: "hidden",
                      height: "100%",
                    }}
                    styles={{
                      body: {
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                      },
                    }}>
                    <div
                      style={{
                        height: 140,
                        background: `linear-gradient(135deg, ${
                          course.is_completed ? "#10b981" : "#2563eb"
                        } 0%, ${course.is_completed ? "#059669" : "#1e40af"} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}>
                      <MdPlayCircleFilled size={40} color="white" />
                      {course.is_completed && (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            background: "white",
                            borderRadius: 20,
                            padding: "4px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}>
                          <MdCheckCircle size={16} color="#10b981" />
                          <Text
                            strong
                            style={{ fontSize: 12, color: "#10b981" }}>
                            Hoàn thành
                          </Text>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: 16,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Title
                        level={5}
                        style={{
                          margin: "0 0 8px 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          minHeight: 48,
                        }}>
                        {course.title}
                      </Title>
                      <div style={{ marginBottom: 12, flex: 1 }}>
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
                          strokeColor={
                            course.is_completed ? "#10b981" : "#2563eb"
                          }
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
                        type={course.is_completed ? "default" : "primary"}
                        block
                        icon={
                          course.is_completed ? (
                            <MdCheckCircle />
                          ) : (
                            <MdPlayCircleFilled />
                          )
                        }
                        onClick={() =>
                          navigate(`/student/course/${course.slug}`)
                        }>
                        {course.is_completed ? "Xem lại" : "Học tiếp"}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {data && data.meta.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={data.meta.total}
                  onChange={(newPage, newPageSize) => {
                    setPage(newPage);
                    setPageSize(newPageSize);
                  }}
                  showSizeChanger
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} / ${total} khóa học`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
