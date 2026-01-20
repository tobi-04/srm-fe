import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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
  MdCalendarToday,
  MdFileDownload,
  MdLink,
  MdMenuBook,
  MdPerson,
  MdLogout,
  MdLock,
  MdBarChart,
} from "react-icons/md";
import YouTube, { YouTubeProps } from "react-youtube";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentCourseApi, LessonWithProgress } from "../api/studentCourseApi";
import { useAuthStore } from "../stores/authStore";
import { getAvatarStyles } from "../utils/color";

const { Content, Sider, Header, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Group lessons by chapter
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

// YouTube embed component with progress tracking
const YouTubePlayer = memo(
  ({
    videoUrl,
    lastPosition,
    onProgress,
  }: {
    videoUrl?: string;
    onProgress?: (
      currentTime: number,
      duration: number,
      segments: { start: number; end: number }[],
    ) => void;
    lastPosition?: number;
  }) => {
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastTimeRef = useRef<number>(lastPosition || 0);
    const hasResumedRef = useRef(false);

    const getVideoId = (url: string) => {
      const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      );
      return match ? match[1] : null;
    };

    const videoId = useMemo(
      () => (videoUrl ? getVideoId(videoUrl) : null),
      [videoUrl],
    );

    const onPlayerReady: YouTubeProps["onReady"] = (event) => {
      playerRef.current = event.target;
      if (lastPosition && !hasResumedRef.current) {
        event.target.seekTo(lastPosition);
        lastTimeRef.current = lastPosition;
        hasResumedRef.current = true;
      }
    };

    const startTracking = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          const playbackRate = playerRef.current.getPlaybackRate();

          const diff = currentTime - lastTimeRef.current;
          const segments: { start: number; end: number }[] = [];

          if (diff > 0 && diff <= 3 * playbackRate) {
            segments.push({
              start: Math.floor(lastTimeRef.current * 10) / 10,
              end: Math.floor(currentTime * 10) / 10,
            });
          }

          if (onProgress) onProgress(currentTime, duration, segments);
          lastTimeRef.current = currentTime;
        }
      }, 1000);
    };

    const stopTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const onStateChange: YouTubeProps["onStateChange"] = (event) => {
      if (event.data === 1) {
        startTracking();
      } else {
        stopTracking();
        if (playerRef.current) {
          lastTimeRef.current = playerRef.current.getCurrentTime();
        }
      }
    };

    useEffect(() => {
      return () => stopTracking();
    }, []);

    const opts: YouTubeProps["opts"] = useMemo(
      () => ({
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          start: lastPosition ? Math.floor(lastPosition) : 0,
        },
      }),
      [videoId], // Only change opts if videoId changes, not if lastPosition updates
    );

    if (!videoUrl || !videoId) {
      return (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          }}>
          <Text style={{ color: "#888" }}>
            {!videoUrl ? "Không có video" : "Video không hợp lệ"}
          </Text>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          margin: "0 0 24px 0",
        }}>
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  },
);

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
  const durationRef = useRef(0);
  const segmentsBufferRef = useRef<{ start: number; end: number }[]>([]);
  const lessonInitialPositionRef = useRef<number | undefined>(undefined);
  const lastLessonIdRef = useRef<string | undefined>(undefined);

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
  });

  // Fetch lesson data
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ["student-lesson", courseId, lessonId],
    queryFn: () => studentCourseApi.getLesson(courseId!, lessonId!),
    enabled: !!courseId && !!lessonId,
    staleTime: 5 * 60 * 1000,
  });

  // Track if we need to reset initial position for a new lesson
  if (lesson?._id && lesson._id !== lastLessonIdRef.current) {
    lessonInitialPositionRef.current = lesson.progress.last_position;
    lastLessonIdRef.current = lesson._id;
  }

  // Auto-resume logic
  useEffect(() => {
    if (course && !lessonId && course.autoResumeLessonId) {
      navigate(`/learn/${courseId}/lessons/${course.autoResumeLessonId}`, {
        replace: true,
      });
    } else if (
      course &&
      !lessonId &&
      !course.autoResumeLessonId &&
      course.lessons.length > 0
    ) {
      navigate(`/learn/${courseId}/lessons/${course.lessons[0]._id}`, {
        replace: true,
      });
    }
  }, [course, lessonId, courseId, navigate]);

  // Handle lesson navigation with locking check
  const navigateToLesson = (id: string, isLocked?: boolean) => {
    const lessonFromList = course?.lessons.find((l) => l._id === id);
    const actualLockStatus =
      isLocked !== undefined ? isLocked : lessonFromList?.is_locked;

    if (actualLockStatus) {
      message.warning(
        "Bài học này đang bị khóa. Bạn cần hoàn thành các bài học trước đó!",
      );
      return;
    }
    navigate(`/learn/${courseId}/lessons/${id}`);
  };

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: {
      watch_time?: number;
      last_position?: number;
      duration?: number;
      watched_segments?: { start: number; end: number }[];
      completed?: boolean;
    }) => studentCourseApi.updateProgress(courseId!, lessonId!, data),
    onSuccess: (_, variables) => {
      // Clear segments that were successfully sent
      if (variables.watched_segments) {
        segmentsBufferRef.current = [];
      }
      // Only invalidate course to update sidebar progress
      queryClient.invalidateQueries({ queryKey: ["student-course", courseId] });
    },
  });

  // Auto-save progress
  useEffect(() => {
    if (!lessonId) return;
    progressInterval.current = setInterval(() => {
      if (watchTimeRef.current > 0 || segmentsBufferRef.current.length > 0) {
        updateProgressMutation.mutate({
          watch_time: watchTimeRef.current,
          last_position: watchTimeRef.current,
          duration: durationRef.current,
          watched_segments: [...segmentsBufferRef.current],
        });
      }
    }, 15000);
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [lessonId]);

  const handleVideoProgress = useCallback(
    (
      time: number,
      duration: number,
      segments: { start: number; end: number }[],
    ) => {
      watchTimeRef.current = Math.floor(time);
      durationRef.current = Math.floor(duration);
      if (segments.length > 0) {
        segmentsBufferRef.current = [...segmentsBufferRef.current, ...segments];
      }
    },
    [],
  );

  useEffect(() => {
    if (courseError) {
      const err = courseError as any;
      if (err?.response?.status === 403) {
        const redirectTo = err?.response?.data?.redirectTo;
        message.warning("Bạn chưa đăng ký khóa học này");
        navigate(redirectTo || "/");
      }
    }
  }, [courseError, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (courseLoading || !course) {
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
      { key: "profile", icon: <MdPerson />, label: "Hồ sơ cá nhân" },
      {
        key: "logout",
        icon: <MdLogout />,
        label: "Đăng xuất",
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e2e8f0",
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
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <MdMenuBook color="white" size={18} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
              SRM Lesson
            </Text>
          </div>
          <Divider type="vertical" />
          <Breadcrumb
            items={[
              { title: course.title },
              { title: lesson?.title || "Đang tải..." },
            ]}
          />
        </Space>
        <Dropdown menu={userMenuItems} placement="bottomRight" arrow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}>
            <Avatar size="small" style={getAvatarStyles(user?.name || "User")}>
              {user?.name?.substring(0, 1).toUpperCase() || <MdPerson />}
            </Avatar>
            <Text strong style={{ fontSize: 13 }} className="hide-on-mobile">
              {user?.name || "Học viên"}
            </Text>
          </div>
        </Dropdown>
      </Header>

      <Layout>
        <Content
          style={{
            padding: "24px 40px",
            overflow: "auto",
            background: "#fff",
          }}>
          {lessonLoading || !lesson ? (
            <div style={{ padding: "100px 0", textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <YouTubePlayer
                videoUrl={lesson.video}
                lastPosition={lessonInitialPositionRef.current}
                onProgress={handleVideoProgress}
              />

              <div style={{ padding: "0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}>
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 700,
                      flex: 1,
                    }}>
                    {lesson.title}
                  </Title>
                  <Space style={{ marginLeft: 24 }}>
                    <Button
                      icon={<MdArrowBack />}
                      style={{ borderRadius: 6 }}
                      onClick={() =>
                        navigateToLesson(lesson.navigation.prev!._id)
                      }
                      disabled={!lesson.navigation.prev}>
                      Bài trước
                    </Button>
                    <Button
                      type="primary"
                      iconPosition="end"
                      icon={
                        course?.lessons.find(
                          (l) => l._id === lesson.navigation.next?._id,
                        )?.is_locked ? (
                          <MdLock />
                        ) : (
                          <MdArrowForward />
                        )
                      }
                      style={{
                        borderRadius: 6,
                        background: course?.lessons.find(
                          (l) => l._id === lesson.navigation.next?._id,
                        )?.is_locked
                          ? "#94a3b8"
                          : "#2563eb",
                      }}
                      onClick={() =>
                        navigateToLesson(lesson.navigation.next!._id)
                      }
                      disabled={
                        !lesson.navigation.next ||
                        course?.lessons.find(
                          (l) => l._id === lesson.navigation.next?._id,
                        )?.is_locked
                      }>
                      Bài tiếp theo
                    </Button>
                  </Space>
                </div>

                <Space size="large" style={{ marginBottom: 32 }}>
                  <Space>
                    <MdCalendarToday color="#64748b" />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Cập nhật ngày 24/10/2023
                    </Text>
                  </Space>
                </Space>

                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  style={{ marginBottom: 24 }}
                  items={[
                    {
                      key: "description",
                      label: "Mô tả bài học",
                      children: (
                        <div style={{ paddingTop: 16 }}>
                          <Paragraph
                            style={{
                              fontSize: 16,
                              color: "#334155",
                              lineHeight: "1.7",
                            }}>
                            {lesson.description}
                          </Paragraph>

                          <div style={{ marginTop: 32 }}>
                            <Title
                              level={4}
                              style={{ fontSize: 18, marginBottom: 16 }}>
                              Nội dung chính
                            </Title>
                            <ul
                              style={{
                                paddingLeft: 20,
                                color: "#334155",
                                lineHeight: "2",
                              }}>
                              {lesson.main_content?.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              )) || (
                                <>
                                  <li>
                                    Tại sao Persona lại quan trọng trong quy
                                    trình Design Thinking.
                                  </li>
                                  <li>
                                    Cách thu thập dữ liệu để xây dựng Persona
                                    thực tế.
                                  </li>
                                  <li>
                                    Sự khác biệt giữa Marketing Persona và UX
                                    Persona.
                                  </li>
                                  <li>
                                    Hướng dẫn sử dụng template cho bản Persona
                                    đầu tiên của bạn.
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>

                          <div style={{ marginTop: 40 }}>
                            <Title
                              level={4}
                              style={{ fontSize: 18, marginBottom: 20 }}>
                              Tài liệu đính kèm
                            </Title>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: 16,
                              }}>
                              {lesson.files?.map((file) => (
                                <div
                                  key={file._id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: 16,
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 12,
                                    gap: 12,
                                  }}>
                                  <div
                                    style={{
                                      width: 44,
                                      height: 44,
                                      background: file.mime.includes("pdf")
                                        ? "#fef2f2"
                                        : "#eff6ff",
                                      borderRadius: 8,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}>
                                    {file.mime.includes("pdf") ? (
                                      <MdDescription
                                        size={24}
                                        color="#ef4444"
                                      />
                                    ) : (
                                      <MdFolder size={24} color="#3b82f6" />
                                    )}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <Text
                                      strong
                                      style={{
                                        display: "block",
                                        fontSize: 14,
                                      }}>
                                      {file.name}
                                    </Text>
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}>
                                      {file.mime.split("/")[1].toUpperCase()} •{" "}
                                      {(file.size / 1024 / 1024).toFixed(1)} MB
                                    </Text>
                                  </div>
                                  <Button
                                    type="text"
                                    icon={<MdFileDownload size={20} />}
                                    href={file.url}
                                    target="_blank"
                                  />
                                </div>
                              ))}
                              {(!lesson.files || lesson.files.length === 0) && (
                                <Text
                                  type="secondary"
                                  style={{
                                    display: "block",
                                    padding: "40px 20px",
                                    textAlign: "center",
                                    fontSize: 14,
                                  }}>
                                  Không có tài liệu đính kèm
                                </Text>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "discussion",
                      label: "Thảo luận",
                      children: (
                        <div style={{ minHeight: 120, padding: 20 }}>
                          <Text type="secondary">
                            Tính năng đang phát triển
                          </Text>
                        </div>
                      ),
                    },
                    {
                      key: "notes",
                      label: "Ghi chú",
                      children: (
                        <div style={{ minHeight: 120, padding: 20 }}>
                          <Text type="secondary">
                            Tính năng đang phát triển
                          </Text>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </Content>

        <Sider
          width={380}
          style={{
            background: "#f8fafc",
            borderLeft: "1px solid #e2e8f0",
            overflow: "auto",
            height: "calc(100vh - 60px)",
            position: "sticky",
            top: 60,
          }}>
          <div style={{ padding: "24px 20px" }}>
            <div
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                marginBottom: 24,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}>
              <Title level={5} style={{ margin: "0 0 16px 0", fontSize: 15 }}>
                Cấu trúc khóa học
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                Tiến độ: Hoàn thành {course.progress.percentComplete}%
              </Text>
              <Progress
                percent={course.progress.percentComplete}
                showInfo={false}
                strokeWidth={6}
                strokeColor="#2563eb"
                trailColor="#f1f5f9"
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  {course.progress.completed}/{course.totalLessons} Bài học
                </Text>
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  Còn lại 14 giờ
                </Text>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}>
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f1f5f9",
                }}>
                <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                  Nội dung bài học
                </Title>
              </div>
              <Collapse
                defaultActiveKey={chapters.map((_, i) => i.toString())}
                ghost
                expandIconPosition="end"
                style={{ background: "#fff" }}>
                {chapters.map((chapter, chapterIdx) => {
                  const completedInChapter = chapter.lessons.filter(
                    (l) => l.progress.status === "completed",
                  ).length;
                  const isChapterComplete =
                    completedInChapter === chapter.lessons.length;

                  return (
                    <Panel
                      key={chapterIdx.toString()}
                      className="chapter-panel"
                      header={
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#94a3b8",
                            }}>
                            CHƯƠNG {chapterIdx + 1}
                          </Text>
                          <Space size={8}>
                            <Text
                              strong
                              style={{ fontSize: 13, color: "#1e293b" }}>
                              {chapter.chapter}
                            </Text>
                            {isChapterComplete && (
                              <Tag
                                color="success"
                                style={{
                                  background: "#f0fdf4",
                                  border: "none",
                                  color: "#16a34a",
                                  padding: "0 8px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  margin: 0,
                                }}>
                                Xong
                              </Tag>
                            )}
                          </Space>
                        </div>
                      }>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {chapter.lessons.map((l) => {
                          const isActive = l._id === lessonId;
                          const isCompleted = l.progress.status === "completed";
                          const isLocked = l.is_locked;

                          return (
                            <div
                              key={l._id}
                              onClick={() => navigateToLesson(l._id, isLocked)}
                              style={{
                                padding: "14px 20px",
                                cursor: isLocked ? "not-allowed" : "pointer",
                                background: isActive
                                  ? "#eff6ff"
                                  : "transparent",
                                borderLeft: isActive
                                  ? "3px solid #2563eb"
                                  : "3px solid transparent",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                transition: "all 0.2s ease",
                                position: "relative",
                              }}>
                              <div style={{ marginTop: 2 }}>
                                {isLocked ? (
                                  <MdLock size={16} color="#94a3b8" />
                                ) : isCompleted ? (
                                  <MdCheckCircle size={16} color="#16a34a" />
                                ) : (
                                  <MdPlayCircle
                                    size={16}
                                    color={isActive ? "#2563eb" : "#94a3b8"}
                                  />
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 13,
                                    color: isLocked
                                      ? "#94a3b8"
                                      : isActive
                                        ? "#2563eb"
                                        : "#475569",
                                    fontWeight: isActive ? 600 : 400,
                                    display: "block",
                                    lineHeight: "1.4",
                                    textDecoration: isCompleted
                                      ? "line-through"
                                      : "none",
                                  }}>
                                  {l.order}. {l.title}
                                </Text>
                                <Space size={4} style={{ marginTop: 2 }}>
                                  {isActive && (
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: "#2563eb",
                                      }}>
                                      Đang phát •{" "}
                                    </Text>
                                  )}
                                  <Text
                                    style={{ fontSize: 11, color: "#94a3b8" }}>
                                    {l.progress.duration
                                      ? Math.floor(l.progress.duration / 60) +
                                        ":" +
                                        (l.progress.duration % 60)
                                          .toString()
                                          .padStart(2, "0")
                                      : "10:20"}
                                    {l.progress.status !== "not_started" &&
                                      ` • ${Math.round(l.progress.progress_percent || 0)}%`}
                                  </Text>
                                </Space>
                              </div>
                              {isActive && (
                                <MdBarChart
                                  size={18}
                                  color="#2563eb"
                                  style={{ alignSelf: "center" }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Panel>
                  );
                })}
              </Collapse>
            </div>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "center",
                gap: 12,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Tag
                  style={{
                    margin: 0,
                    padding: "0 4px",
                    fontSize: 10,
                    background: "#f1f5f9",
                  }}>
                  Space
                </Tag>{" "}
                <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                  Phát/Tạm dừng
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Tag
                  style={{
                    margin: 0,
                    padding: "0 4px",
                    fontSize: 10,
                    background: "#f1f5f9",
                  }}>
                  →
                </Tag>{" "}
                <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                  Tua nhanh
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Tag
                  style={{
                    margin: 0,
                    padding: "0 4px",
                    fontSize: 10,
                    background: "#f1f5f9",
                  }}>
                  F
                </Tag>{" "}
                <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                  Toàn màn hình
                </Text>
              </div>
            </div>
          </div>
        </Sider>
      </Layout>

      <Footer
        style={{
          textAlign: "center",
          background: "#fff",
          borderTop: "1px solid #e2e8f0",
          padding: "16px 0",
          color: "#64748b",
          fontSize: 12,
        }}>
        SRM Lesson ©{new Date().getFullYear()} - Chúc bạn học tập tốt!
      </Footer>

      <style>{`
        .hide-on-mobile { @media (max-width: 768px) { display: none; } }
        .chapter-panel .ant-collapse-header { padding: 16px 20px !important; }
        .chapter-panel .ant-collapse-content-box { padding: 0 !important; }
        .ant-tabs-nav::before { border-bottom: 2px solid #f1f5f9 !important; }
        .ant-tabs-ink-bar { height: 2px !important; background: #2563eb !important; }
        .ant-tabs-tab { padding: 12px 0 !important; margin: 0 16px !important; }
        .ant-tabs-tab:first-child { margin-left: 0 !important; }
        .ant-tabs-tab-btn { color: #64748b !important; font-size: 14px !important; font-weight: 500 !important; }
        .ant-tabs-tab-active .ant-tabs-tab-btn { color: #2563eb !important; }
        .ant-breadcrumb-link { font-size: 13px; }
      `}</style>
    </Layout>
  );
}
