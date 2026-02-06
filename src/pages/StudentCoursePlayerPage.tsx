import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  List,
  Progress,
  Spin,
  Tag,
  Tabs,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  MdPlayCircleFilled,
  MdLock,
  MdCheckCircle,
  MdList,
  MdOndemandVideo,
} from "react-icons/md";
import StudentDashboardLayout from "../components/StudentDashboardLayout";
import { studentApi } from "../api/studentApi";

const { Title, Text } = Typography;

export default function StudentCoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth < 768);

  const { data: course, isLoading } = useQuery({
    queryKey: ["student-course", slug],
    queryFn: () => studentApi.getCourseDetail(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
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

  const currentLesson =
    course?.lessons.find((l) => l._id === selectedLesson) || course?.lessons[0];

  // Mobile: Tabs layout | Desktop: Side-by-side
  const videoSection = (
    <Card
      variant="borderless"
      style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 0 }}>
      {currentLesson?.video_url ? (
        <div
          style={{
            position: "relative",
            paddingTop: "56.25%",
            marginBottom: 16,
          }}>
          <iframe
            src={currentLesson.video_url}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 8,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          style={{
            height: 300,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}>
          <MdOndemandVideo size={64} color="white" />
        </div>
      )}
      <Title level={4} style={{ margin: "0 0 8px 0" }}>
        {currentLesson?.title}
      </Title>
      <Text type="secondary">{currentLesson?.description}</Text>
    </Card>
  );

  const lessonsSection = (
    <Card
      variant="borderless"
      style={{ borderRadius: 12 }}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Title level={5} style={{ margin: 0 }}>
            Danh sách bài học
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {course?.lessons.filter((l) => l.is_completed).length}/
            {course?.lessons.length}
          </Text>
        </div>
      }>
      <div style={{ marginBottom: 12 }}>
        <Progress
          percent={course?.progress_percent || 0}
          showInfo={false}
          strokeColor="#2563eb"
        />
      </div>
      <List
        dataSource={course?.lessons}
        renderItem={(lesson, index) => (
          <List.Item
            key={lesson._id}
            onClick={() => !lesson.is_locked && setSelectedLesson(lesson._id)}
            style={{
              cursor: lesson.is_locked ? "not-allowed" : "pointer",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 4,
              background:
                selectedLesson === lesson._id ||
                (!selectedLesson && index === 0)
                  ? "#eff6ff"
                  : "transparent",
              opacity: lesson.is_locked ? 0.6 : 1,
              transition: "all 0.2s",
            }}>
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: lesson.is_completed
                      ? "#d1fae5"
                      : lesson.is_locked
                        ? "#f1f5f9"
                        : "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {lesson.is_locked ? (
                    <MdLock size={18} color="#94a3b8" />
                  ) : lesson.is_completed ? (
                    <MdCheckCircle size={18} color="#10b981" />
                  ) : (
                    <MdPlayCircleFilled size={18} color="#2563eb" />
                  )}
                </div>
              }
              title={
                <Text
                  strong={
                    selectedLesson === lesson._id ||
                    (!selectedLesson && index === 0)
                  }
                  style={{ fontSize: 14 }}>
                  Bài {index + 1}: {lesson.title}
                </Text>
              }
              description={
                lesson.is_locked ? (
                  <Tag color="default" style={{ fontSize: 11 }}>
                    Đã khóa
                  </Tag>
                ) : lesson.is_completed ? (
                  <Tag color="success" style={{ fontSize: 11 }}>
                    Hoàn thành
                  </Tag>
                ) : (
                  <Progress
                    percent={lesson.progress_percent}
                    showInfo={false}
                    strokeColor="#2563eb"
                    size="small"
                  />
                )
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <StudentDashboardLayout>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            {course?.title}
          </Title>
          <Text type="secondary">{course?.description}</Text>
        </div>

        {/* Mobile: Tabs | Desktop: Side-by-side */}
        {isMobile ? (
          <Tabs
            defaultActiveKey="video"
            items={[
              {
                key: "video",
                label: (
                  <span>
                    <MdOndemandVideo style={{ marginRight: 8 }} />
                    Video
                  </span>
                ),
                children: videoSection,
              },
              {
                key: "lessons",
                label: (
                  <span>
                    <MdList style={{ marginRight: 8 }} />
                    Bài học
                  </span>
                ),
                children: lessonsSection,
              },
            ]}
          />
        ) : (
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              {videoSection}
            </Col>
            <Col xs={24} lg={8}>
              {lessonsSection}
            </Col>
          </Row>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
