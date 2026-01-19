import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Space,
  Tag,
  Button,
  Tabs,
  Progress,
  Collapse,
  Spin,
  message,
  Breadcrumb,
  Card,
  List,
  Divider,
  Avatar,
  Dropdown,
} from "antd";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdPlayCircle,
  MdDescription,
  MdFolder,
  MdChat,
  MdNote,
  MdAccessTime,
  MdCalendarToday,
  MdFileDownload,
  MdLink,
  MdMenuBook,
  MdPerson,
  MdLogout,
} from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentCourseApi, LessonWithProgress } from "../api/studentCourseApi";
import { useAuthStore } from "../stores/authStore";
import { getAvatarStyles } from "../utils/color";

const { Content, Sider, Header, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Group lessons by chapter (using order ranges)
function groupLessonsByChapter(
  lessons: LessonWithProgress[],
  syllabus: string[],
): { chapter: string; lessons: LessonWithProgress[] }[] {
  if (!syllabus || syllabus.length === 0) {
    return [
      {
        chapter: "Nội dung khóa học",
        lessons: [...lessons].sort((a, b) => a.order - b.order),
      },
    ];
  }

  // Group lessons by their chapter_index
  const chaptersMap: Record<number, LessonWithProgress[]> = {};

  lessons.forEach((lesson) => {
    const chapterIdx = lesson.chapter_index || 0;
    if (!chaptersMap[chapterIdx]) {
      chaptersMap[chapterIdx] = [];
    }
    chaptersMap[chapterIdx].push(lesson);
  });

  return syllabus.map((chapterName, index) => ({
    chapter: chapterName,
    lessons: (chaptersMap[index] || []).sort((a, b) => a.order - b.order),
  }));
}

// YouTube embed component
function YouTubePlayer({
  videoUrl,
  lastPosition,
}: {
  videoUrl?: string;
  onProgress?: (time: number) => void;
  lastPosition?: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract YouTube video ID
  const getVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    );
    return match ? match[1] : null;
  };

  if (!videoUrl) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          aspectRatio: "16/9",
          background: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
        }}>
        <Text style={{ color: "#888" }}>Không có video cho bài học này</Text>
      </div>
    );
  }

  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          aspectRatio: "16/9",
          background: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
        }}>
        <Text style={{ color: "#888" }}>Video không hợp lệ</Text>
      </div>
    );
  }

  const startTime = lastPosition ? Math.floor(lastPosition) : 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        aspectRatio: "16/9",
        borderRadius: 12,
        overflow: "hidden",
        background: "#000",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      }}>
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&rel=0&modestbranding=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function CourseViewerPage() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("description");
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchTimeRef = useRef(0);

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["student-course", courseId],
    queryFn: () => studentCourseApi.getCourse(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    },
  });

  // Fetch lesson data
  const {
    data: lesson,
    isLoading: _lessonLoading,
    error: _lessonError,
  } = useQuery({
    queryKey: ["student-lesson", courseId, lessonId],
    queryFn: () => studentCourseApi.getLesson(courseId!, lessonId!),
    enabled: !!courseId && !!lessonId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: {
      watch_time?: number;
      last_position?: number;
      completed?: boolean;
    }) => studentCourseApi.updateProgress(courseId!, lessonId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-course", courseId],
      });
    },
  });

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!lessonId) return;

    progressInterval.current = setInterval(() => {
      if (watchTimeRef.current > 0) {
        updateProgressMutation.mutate({
          watch_time: watchTimeRef.current,
          last_position: watchTimeRef.current,
        });
      }
    }, 30000);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [lessonId]);

  // Handle video progress
  const handleVideoProgress = useCallback((time: number) => {
    watchTimeRef.current = time;
  }, []);

  // Handle mark as completed
  const handleMarkCompleted = () => {
    updateProgressMutation.mutate({ completed: true });
    message.success("Đã đánh dấu hoàn thành bài học!");
  };

  // Handle 403 error (not enrolled)
  useEffect(() => {
    if (courseError) {
      const err = courseError as any;
      if (err?.response?.status === 403) {
        const redirectTo = err?.response?.data?.redirectTo;
        if (redirectTo) {
          message.warning("Bạn chưa đăng ký khóa học này");
          navigate(redirectTo);
        } else {
          message.error("Bạn chưa đăng ký khóa học này");
          navigate("/");
        }
      }
    }
  }, [courseError, navigate]);

  // Navigate to lesson
  const navigateToLesson = (newLessonId: string) => {
    navigate(`/learn/${courseId}/lessons/${newLessonId}`);
  };

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (course && !lessonId && course.lessons.length > 0) {
      const sortedLessons = [...course.lessons].sort(
        (a, b) => a.order - b.order,
      );
      navigate(`/learn/${courseId}/lessons/${sortedLessons[0]._id}`, {
        replace: true,
      });
    }
  }, [course, lessonId, courseId, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (courseLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Spin size="large" />
      </div>
    );
  }

  const chapters = groupLessonsByChapter(course.lessons, course.syllabus);

  const userMenuItems = {
    items: [
      {
        key: "profile",
        icon: <MdPerson />,
        label: "Hồ sơ cá nhân",
      },
      {
        key: "logout",
        icon: <MdLogout />,
        label: "Đăng xuất",
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}>
        <Space size={16}>
          <div
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <MdMenuBook color="white" size={18} />
            </div>
            <Text
              strong
              style={{ fontSize: 16, color: "#1e293b", display: "block" }}>
              SRM Lesson
            </Text>
          </div>
          <Divider type="vertical" />
          <Breadcrumb
            style={{ margin: 0 }}
            items={[{ title: course.title }, { title: lesson.title }]}
          />
        </Space>

        <Dropdown menu={userMenuItems} placement="bottomRight" arrow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}>
            <Avatar style={getAvatarStyles(user?.name || "admin")}>
              {user?.name ? (
                user.name.substring(0, 2).toUpperCase()
              ) : (
                <MdPerson />
              )}
            </Avatar>
            <Text strong className="hide-on-mobile">
              {user?.name || "Học viên"}
            </Text>
          </div>
        </Dropdown>
      </Header>

      <Layout>
        <Content style={{ padding: 24, overflow: "auto" }}>
          {/* Video Player */}
          <YouTubePlayer
            videoUrl={lesson.video}
            onProgress={handleVideoProgress}
            lastPosition={lesson.progress.last_position}
          />

          {/* Lesson Info */}
          <div style={{ marginTop: 24, padding: "0 20px" }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              {lesson.title}
            </Title>
            <Space size="middle" wrap>
              <Space size={4}>
                <MdAccessTime size={16} color="#666" />
                <Text type="secondary">--:--</Text>
              </Space>
              <Space size={4}>
                <MdCalendarToday size={16} color="#666" />
                <Text type="secondary">
                  Cập nhật ngày {new Date().toLocaleDateString("vi-VN")}
                </Text>
              </Space>
              <Tag
                color={
                  lesson.progress.status === "completed"
                    ? "success"
                    : lesson.progress.status === "in_progress"
                      ? "processing"
                      : "default"
                }>
                {lesson.progress.status === "completed"
                  ? "Hoàn thành"
                  : lesson.progress.status === "in_progress"
                    ? "Đang học"
                    : "Chưa học"}
              </Tag>
            </Space>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}>
              <Button
                icon={<MdArrowBack />}
                disabled={!lesson.navigation.prev}
                onClick={() =>
                  lesson.navigation.prev &&
                  navigateToLesson(lesson.navigation.prev._id)
                }>
                Bài trước
              </Button>
              <Space>
                {lesson.progress.status !== "completed" && (
                  <Button type="primary" onClick={handleMarkCompleted}>
                    Đánh dấu hoàn thành
                  </Button>
                )}
              </Space>
              <Button
                type="primary"
                icon={<MdArrowForward />}
                iconPosition="end"
                disabled={!lesson.navigation.next}
                onClick={() =>
                  lesson.navigation.next &&
                  navigateToLesson(lesson.navigation.next._id)
                }>
                Bài tiếp theo
              </Button>
            </div>

            {/* Tabs */}
            <Card style={{ marginTop: 32 }}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: "description",
                    label: (
                      <Space>
                        <MdDescription />
                        Mô tả bài học
                      </Space>
                    ),
                    children: (
                      <div>
                        <Paragraph>{lesson.description}</Paragraph>
                        {lesson.main_content &&
                          lesson.main_content.length > 0 && (
                            <>
                              <Title level={5}>Nội dung chính</Title>
                              <List
                                dataSource={lesson.main_content}
                                renderItem={(item) => (
                                  <List.Item>
                                    <Text>{item}</Text>
                                  </List.Item>
                                )}
                              />
                            </>
                          )}
                      </div>
                    ),
                  },
                  {
                    key: "materials",
                    label: (
                      <Space>
                        <MdFolder />
                        Tài liệu
                      </Space>
                    ),
                    children: (
                      <div style={{ minHeight: 120 }}>
                        {lesson.files && lesson.files.length > 0 ? (
                          <List
                            dataSource={lesson.files}
                            renderItem={(file) => (
                              <List.Item
                                actions={[
                                  <Button
                                    type="link"
                                    icon={<MdFileDownload />}
                                    href={file.url}
                                    target="_blank">
                                    Tải về
                                  </Button>,
                                ]}>
                                <List.Item.Meta
                                  avatar={
                                    <div
                                      style={{
                                        width: 40,
                                        height: 40,
                                        background: "#f0f7ff",
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}>
                                      <MdLink size={20} color="#1890ff" />
                                    </div>
                                  }
                                  title={<Text strong>{file.name}</Text>}
                                  description={
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}>
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                      • {file.mime}
                                    </Text>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <div
                            style={{ textAlign: "center", padding: "40px 0" }}>
                            <MdFolder size={48} color="#e5e7eb" />
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                Chưa có tài liệu cho bài học này
                              </Text>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "discussion",
                    label: (
                      <Space>
                        <MdChat />
                        Thảo luận
                      </Space>
                    ),
                    children: (
                      <Text type="secondary">Tính năng đang phát triển</Text>
                    ),
                  },
                  {
                    key: "notes",
                    label: (
                      <Space>
                        <MdNote />
                        Ghi chú
                      </Space>
                    ),
                    children: (
                      <Text type="secondary">Tính năng đang phát triển</Text>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </Content>

        {/* Right Sidebar - Course Structure */}
        <Sider
          width={360}
          style={{
            background: "#fff",
            borderLeft: "1px solid #f0f0f0",
            overflow: "auto",
            height: "calc(100vh - 64px)",
            position: "sticky",
            top: 64,
          }}>
          <div style={{ padding: 20 }}>
            {/* Progress Header */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 16 }}>
                Cấu trúc khóa học
              </Text>
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tiến độ: Hoàn thành {course.progress.percentComplete}%
                  </Text>
                </div>
                <Progress
                  percent={course.progress.percentComplete}
                  size="small"
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {course.progress.completed}/{course.totalLessons} Bài học
                </Text>
              </div>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {/* Course Content */}
            <Text
              strong
              style={{ fontSize: 14, display: "block", marginBottom: 12 }}>
              Nội dung bài học
            </Text>

            <Collapse
              defaultActiveKey={chapters.map((_, i) => i.toString())}
              ghost
              expandIconPosition="end">
              {chapters.map((chapter, chapterIdx) => {
                const completedInChapter = chapter.lessons.filter(
                  (l) => l.progress.status === "completed",
                ).length;
                const isChapterComplete =
                  completedInChapter === chapter.lessons.length;

                return (
                  <Panel
                    key={chapterIdx.toString()}
                    header={
                      <Space>
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, color: "#1890ff" }}>
                          CHƯƠNG {chapterIdx + 1}
                        </Text>
                        <Text strong style={{ fontSize: 13 }}>
                          {chapter.chapter}
                        </Text>
                        {isChapterComplete && (
                          <Tag color="success" style={{ marginLeft: 8 }}>
                            Xong
                          </Tag>
                        )}
                      </Space>
                    }>
                    {chapter.lessons.map((l) => {
                      const isActive = l._id === lessonId;
                      const isCompleted = l.progress.status === "completed";
                      const isInProgress = l.progress.status === "in_progress";

                      return (
                        <div
                          key={l._id}
                          onClick={() => navigateToLesson(l._id)}
                          style={{
                            padding: "10px 12px",
                            marginBottom: 4,
                            borderRadius: 8,
                            cursor: "pointer",
                            background: isActive ? "#e6f7ff" : "transparent",
                            borderLeft: isActive
                              ? "3px solid #1890ff"
                              : "3px solid transparent",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                          }}>
                          {isCompleted ? (
                            <MdCheckCircle size={18} color="#52c41a" />
                          ) : isInProgress ? (
                            <MdPlayCircle size={18} color="#1890ff" />
                          ) : (
                            <MdPlayCircle size={18} color="#d9d9d9" />
                          )}
                          <div style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 13,
                                color: isActive ? "#1890ff" : "#333",
                                fontWeight: isActive ? 600 : 400,
                                display: "block",
                              }}>
                              {l.order}.{chapterIdx + 1} {l.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {isInProgress
                                ? "Đang học"
                                : isCompleted
                                  ? "Hoàn thành"
                                  : "--:--"}
                            </Text>
                          </div>
                        </div>
                      );
                    })}
                  </Panel>
                );
              })}
            </Collapse>
          </div>
        </Sider>
      </Layout>

      <Footer
        style={{
          textAlign: "center",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          padding: "16px 0",
        }}>
        SRM Lesson ©{new Date().getFullYear()} - Chúc bạn học tập tốt!
      </Footer>

      <style>{`
        .hide-on-mobile {
          @media (max-width: 576px) {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
}
