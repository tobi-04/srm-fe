import { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Progress,
  Select,
  Input,
  Tag,
  Empty,
  Table,
  Space,
  Image,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  MdPlayCircleFilled,
  MdSearch,
  MdCheckCircle,
  MdTrendingUp,
  MdImage,
} from "react-icons/md";
import StudentDashboardLayout from "../components/StudentDashboardLayout";
import { studentCourseApi } from "../api/studentCourseApi";

const { Title, Text } = Typography;

export default function StudentCoursesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [status, setStatus] = useState<"all" | "in_progress" | "completed">(
    "all",
  );
  const [searchText, setSearchText] = useState("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["student-enrolled-courses"],
    queryFn: () => studentCourseApi.getEnrolledCourses(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Filter by status
  let filteredByStatus = courses || [];
  if (status === "completed") {
    filteredByStatus = filteredByStatus.filter(
      (course) => course.progress.percentComplete === 100,
    );
  } else if (status === "in_progress") {
    filteredByStatus = filteredByStatus.filter(
      (course) =>
        course.progress.percentComplete > 0 &&
        course.progress.percentComplete < 100,
    );
  }

  // Filter by search text
  const filteredCourses = filteredByStatus.filter((course) =>
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
          style={{ borderRadius: 12, marginBottom: 24 }}
        >
          <Space size="middle" wrap style={{ width: "100%" }}>
            <Input
              placeholder="Tìm kiếm khóa học..."
              prefix={<MdSearch size={20} style={{ color: "#94a3b8" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ minWidth: 280 }}
            />
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 150 }}
              size="large"
              options={[
                { label: "Tất cả", value: "all" },
                { label: "Đang học", value: "in_progress" },
                { label: "Hoàn thành", value: "completed" },
              ]}
            />
          </Space>
        </Card>

        {/* Courses Table */}
        <Card variant="borderless" style={{ borderRadius: 12 }}>
          <Table
            dataSource={filteredCourses || []}
            rowKey="_id"
            loading={isLoading}
            locale={{
              emptyText: <Empty description="Không tìm thấy khóa học nào" />,
            }}
            scroll={{ x: 1000 }}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: filteredCourses.length,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize || 12);
              },
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} khóa học`,
            }}
            columns={[
              {
                title: "Thumbnail",
                dataIndex: "thumbnail",
                key: "thumbnail",
                width: 100,
                render: (thumbnail: string) =>
                  thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt="Course thumbnail"
                      width={60}
                      height={60}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                      preview
                    />
                  ) : (
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        background: "#f1f5f9",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MdImage size={24} color="#94a3b8" />
                    </div>
                  ),
              },
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
                      {record.category || "Chưa phân loại"}
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
                key: "progress",
                width: 180,
                render: (_: any, record: any) => {
                  const percent = record.progress?.percentComplete || 0;
                  return (
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
                        strokeColor={percent === 100 ? "#10b981" : "#2563eb"}
                        size="small"
                      />
                    </div>
                  );
                },
              },
              {
                title: "Bài học",
                key: "lessons",
                width: 120,
                render: (_: any, record: any) => (
                  <Text style={{ fontSize: 13 }}>
                    {record.progress?.completed || 0}/{record.totalLessons || 0}{" "}
                    bài
                  </Text>
                ),
              },
              {
                title: "Trạng thái",
                key: "status",
                width: 130,
                render: (_: any, record: any) => {
                  const isCompleted = record.progress?.percentComplete === 100;
                  return isCompleted ? (
                    <Tag
                      icon={<MdCheckCircle style={{ marginRight: 4 }} />}
                      color="success"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "fit-content",
                      }}
                    >
                      Hoàn thành
                    </Tag>
                  ) : (
                    <Tag
                      icon={<MdTrendingUp style={{ marginRight: 4 }} />}
                      color="processing"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "fit-content",
                      }}
                    >
                      Đang học
                    </Tag>
                  );
                },
              },
              {
                title: "Hành động",
                key: "action",
                width: 150,
                render: (_: any, record: any) => {
                  const isCompleted = record.progress?.percentComplete === 100;
                  return (
                    <Button
                      type={isCompleted ? "default" : "primary"}
                      icon={
                        isCompleted ? <MdCheckCircle /> : <MdPlayCircleFilled />
                      }
                      onClick={() =>
                        window.open(`/learn/${record._id}`, "_blank")
                      }
                    >
                      {isCompleted ? "Xem lại" : "Học tiếp"}
                    </Button>
                  );
                },
              },
            ]}
          />
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
