import { useState, useEffect } from "react";
import {
  Table,
  Space,
  Typography,
  Card,
  Button,
  Input,
  Avatar,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Drawer,
  InputNumber,
  Spin,
  Divider,
  Dropdown,
  type MenuProps,
  Row,
  Col,
  Statistic,
  Select,
  Progress,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdPerson,
  MdSearch,
  MdRefresh,
  MdAdd,
  MdEmail,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdLock,
  MdLockOpen,
  MdDeleteForever,
  MdAssignment,
  MdTrendingUp,
  MdAttachMoney,
  MdMoreVert,
  MdShoppingCart,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import {
  userApi,
  Saler,
  CreateSalerDto,
  UpdateKpiDto,
  AssignCoursesDto,
  UpdateCommissionsDto,
  CourseCommission,
  SalerDetails as SalerDetailsType,
} from "../api/userApi";
import { adminAnalyticsApi } from "../api/adminAnalyticsApi";
import { getAvatarStyles } from "../utils/color";
import apiClient from "../api/client";
import { DragDropTransfer } from "../components/DragDropTransfer";

const { Title, Text } = Typography;

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: string;
}

interface TransferItem {
  key: string;
  title: string;
  description: string;
}

export default function SalerManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // KPI Drawer
  const [isKpiDrawerOpen, setIsKpiDrawerOpen] = useState(false);
  const [selectedSalerForKpi, setSelectedSalerForKpi] = useState<Saler | null>(
    null,
  );
  const [loadingKpi, setLoadingKpi] = useState(false);

  // Course  Assignment Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedSalerForCourse, setSelectedSalerForCourse] =
    useState<Saler | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesPage, setCoursesPage] = useState(1);
  const [hasMoreCourses, setHasMoreCourses] = useState(true);

  // Commission Modal
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [selectedSalerForCommission, setSelectedSalerForCommission] =
    useState<Saler | null>(null);
  const [salerDetails, setSalerDetails] = useState<SalerDetailsType | null>(
    null,
  );
  const [loadingCommission, setLoadingCommission] = useState(false);

  // Saler Detail Modal (Analytics)
  const [isSalerDetailModalOpen, setIsSalerDetailModalOpen] = useState(false);
  const [selectedSalerForDetail, setSelectedSalerForDetail] =
    useState<Saler | null>(null);
  const [salerDetailPeriod, setSalerDetailPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");
  const [kpiStatsPeriod, setKpiStatsPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");

  const [form] = Form.useForm();
  const [kpiForm] = Form.useForm();
  const [commissionForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["salers", searchText, page, pageSize],
    queryFn: () =>
      userApi.getSalers({
        page,
        limit: pageSize,
        search: searchText || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // KPI Statistics query
  const { data: kpiStats } = useQuery({
    queryKey: ["saler-kpi-stats", kpiStatsPeriod],
    queryFn: () => adminAnalyticsApi.getSalerKPIStatistics(kpiStatsPeriod),
  });

  // KPI Chart query
  const { data: kpiChart } = useQuery({
    queryKey: ["saler-kpi-chart", kpiStatsPeriod],
    queryFn: () => adminAnalyticsApi.getSalerKPIChart(kpiStatsPeriod, 6),
  });

  // Saler Detail query
  const { data: salerAnalytics, isLoading: salerAnalyticsLoading } = useQuery({
    queryKey: [
      "saler-detail-analytics",
      selectedSalerForDetail?._id,
      salerDetailPeriod,
    ],
    queryFn: () =>
      selectedSalerForDetail
        ? adminAnalyticsApi.getSalerDetails(
            selectedSalerForDetail._id,
            salerDetailPeriod,
          )
        : null,
    enabled: !!selectedSalerForDetail,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSalerDto) => userApi.createSaler(dto),
    onSuccess: () => {
      message.success("Tạo tài khoản Saler thành công!");
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể tạo tài khoản";
      message.error(msg);
    },
  });

  const lockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.lockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: () => message.error("Không thể khóa tài khoản"),
  });

  const unlockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.unlockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: () => message.error("Không thể mở khóa tài khoản"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.hardDeleteMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: () => message.error("Không thể xóa tài khoản"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
  });

  const salers = data?.data || [];
  const meta = data?.meta;

  const handleSearch = () => {
    setPage(1);
  };

  const handleCreateSaler = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(values);
    } catch (error) {
      // Validation error
    }
  };

  // KPI Handlers
  const handleOpenKpiDrawer = async (saler: Saler) => {
    setSelectedSalerForKpi(saler);
    setLoadingKpi(true);
    setIsKpiDrawerOpen(true);

    try {
      const details = await userApi.getSalerDetails(saler._id);
      kpiForm.setFieldsValue({
        kpi_monthly_target: details.kpi_monthly_target || 0,
        kpi_quarterly_target: details.kpi_quarterly_target || 0,
        kpi_yearly_target: details.kpi_yearly_target || 0,
      });
    } catch (error) {
      console.error("Error loading KPI:", error);
    } finally {
      setLoadingKpi(false);
    }
  };

  const handleSaveKpi = async () => {
    if (!selectedSalerForKpi) return;

    try {
      const values: UpdateKpiDto = await kpiForm.validateFields();
      await userApi.updateSalerKpi(selectedSalerForKpi._id, values);
      message.success("Cập nhật KPI thành công!");
      setIsKpiDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Không thể cập nhật KPI";
      message.error(msg);
    }
  };

  // Course Assignment Handlers
  const handleOpenCourseModal = async (saler: Saler) => {
    setSelectedSalerForCourse(saler);
    setLoadingCourses(true);
    setIsCourseModalOpen(true);
    setAllCourses([]);
    setCoursesPage(1);
    setHasMoreCourses(true);

    try {
      // Fetch first page of courses
      const coursesResponse = await apiClient.get<{
        data: Course[];
        meta: { total: number; page: number; totalPages: number };
      }>("/courses", { params: { page: 1, limit: 20 } });

      setAllCourses(coursesResponse.data.data);
      setHasMoreCourses(
        coursesResponse.data.meta.page < coursesResponse.data.meta.totalPages,
      );

      // Fetch saler details to get assigned courses
      const details = await userApi.getSalerDetails(saler._id);
      setTargetKeys(details.assigned_courses || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleLoadMoreCourses = async () => {
    if (loadingCourses || !hasMoreCourses) return;

    setLoadingCourses(true);
    const nextPage = coursesPage + 1;

    try {
      const coursesResponse = await apiClient.get<{
        data: Course[];
        meta: { total: number; page: number; totalPages: number };
      }>("/courses", { params: { page: nextPage, limit: 20 } });

      setAllCourses((prev) => [...prev, ...coursesResponse.data.data]);
      setCoursesPage(nextPage);
      setHasMoreCourses(
        coursesResponse.data.meta.page < coursesResponse.data.meta.totalPages,
      );
    } catch (error) {
      console.error("Error loading more courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSaveCourses = async () => {
    if (!selectedSalerForCourse) return;

    try {
      const dto: AssignCoursesDto = { course_ids: targetKeys };
      await userApi.assignCourses(selectedSalerForCourse._id, dto);
      message.success("Cập nhật khóa học thành công!");
      setIsCourseModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Không thể cập nhật khóa học";
      message.error(msg);
    }
  };

  // Commission Handlers
  const handleOpenCommissionModal = async (saler: Saler) => {
    setSelectedSalerForCommission(saler);
    setLoadingCommission(true);
    setIsCommissionModalOpen(true);

    try {
      const details = await userApi.getSalerDetails(saler._id);
      setSalerDetails(details);

      commissionForm.setFieldsValue({
        default_commission_rate: details.default_commission_rate || 0,
      });

      // Set individual course commissions
      details.course_commissions?.forEach((comm: CourseCommission) => {
        commissionForm.setFieldValue(
          `course_${comm.course_id}`,
          comm.commission_rate,
        );
      });
    } catch (error) {
      console.error("Error loading commission:", error);
      message.error("Không thể tải thông tin hoa hồng");
    } finally {
      setLoadingCommission(false);
    }
  };

  const handleSaveCommission = async () => {
    if (!selectedSalerForCommission || !salerDetails) return;

    try {
      const values = await commissionForm.validateFields();
      const courseCommissions: CourseCommission[] = [];

      // Build course commissions array
      salerDetails.assigned_courses?.forEach((courseId: string) => {
        const rate = values[`course_${courseId}`];
        if (rate !== undefined) {
          courseCommissions.push({
            course_id: courseId,
            commission_rate: rate,
          });
        }
      });

      const dto: UpdateCommissionsDto = {
        default_commission_rate: values.default_commission_rate,
        course_commissions: courseCommissions,
      };

      await userApi.updateCommissions(selectedSalerForCommission._id, dto);
      message.success("Cập nhật hoa hồng thành công!");
      setIsCommissionModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Không thể cập nhật hoa hồng";
      message.error(msg);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const hasSelected = selectedRowKeys.length > 0;

  // Mobile columns - single column with everything
  const mobileColumns = [
    {
      title: "Saler",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Saler) => (
        <div style={{ padding: "4px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}>
            <Space size="small">
              <Avatar
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  ...getAvatarStyles(text || record._id),
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  fontSize: 12,
                }}>
                {text ? text.substring(0, 2).toUpperCase() : <MdPerson />}
              </Avatar>
              <div style={{ maxWidth: 150 }}>
                <Text
                  strong
                  style={{ display: "block", color: "#1e293b", fontSize: 13 }}>
                  {text}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, wordBreak: "break-all" }}>
                  {record.email}
                </Text>
                {record.code_saler && (
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 10 }}>
                    {record.code_saler}
                  </Text>
                )}
              </div>
            </Space>
            <Space size={4}>
              <Button
                type="text"
                size="small"
                icon={
                  record.is_active ? (
                    <MdLock size={16} />
                  ) : (
                    <MdLockOpen size={16} />
                  )
                }
                onClick={() => toggleMutation.mutate(record._id)}
                style={{ padding: 4 }}
              />
              <Popconfirm
                title="Xóa?"
                onConfirm={() => hardDeleteMutation.mutate([record._id])}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, size: "small" }}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<MdDeleteForever size={16} />}
                  style={{ padding: 4 }}
                />
              </Popconfirm>
            </Space>
          </div>
          <div
            style={{ display: "flex", gap: 4, marginTop: 6, marginLeft: 44 }}>
            <Tag
              color={record.is_active ? "success" : "error"}
              style={{ fontSize: 11, margin: 0 }}>
              {record.is_active ? "Hoạt động" : "Khóa"}
            </Tag>
            {record.must_change_password && (
              <Tag color="warning" style={{ fontSize: 11, margin: 0 }}>
                Đổi MK
              </Tag>
            )}
          </div>
        </div>
      ),
    },
  ];

  // Desktop columns - full view
  const desktopColumns = [
    {
      title: "Saler",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (text: string, record: Saler) => (
        <Space size="middle">
          <Avatar
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              ...getAvatarStyles(text || record._id),
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}>
            {text ? text.substring(0, 2).toUpperCase() : <MdPerson />}
          </Avatar>
          <div>
            <Text strong style={{ display: "block", color: "#1e293b" }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record._id?.slice(-6).toUpperCase() || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Code",
      dataIndex: "code_saler",
      key: "code_saler",
      width: 150,
      render: (text: string) => (
        <Text code style={{ fontSize: 12, fontWeight: 600 }}>
          {text || "N/A"}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (text: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdEmail />
          {text}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (active: boolean) => (
        <Space
          size="small"
          style={{ color: active ? "#10b981" : "#ef4444", fontWeight: 600 }}>
          {active ? <MdCheckCircle /> : <MdCancel />}
          {active ? "Hoạt động" : "Đã khóa"}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdCalendarToday />
          {new Date(date).toLocaleDateString("vi-VN")}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_: any, record: Saler) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "kpi",
            label: "Quản lý KPI",
            icon: <MdTrendingUp size={16} />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              handleOpenKpiDrawer(record);
            },
          },
          {
            key: "courses",
            label: "Phân bổ khóa học",
            icon: <MdAssignment size={16} />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              handleOpenCourseModal(record);
            },
          },
          {
            key: "commission",
            label: "Cấu hình hoa hồng",
            icon: <MdAttachMoney size={16} />,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              handleOpenCommissionModal(record);
            },
          },
          {
            type: "divider",
          },
          {
            key: "toggle",
            label: record.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản",
            icon: record.is_active ? (
              <MdLock size={16} />
            ) : (
              <MdLockOpen size={16} />
            ),
            onClick: (e) => {
              e.domEvent.stopPropagation();
              toggleMutation.mutate(record._id);
            },
          },
          {
            key: "delete",
            label: "Xóa vĩnh viễn",
            icon: <MdDeleteForever size={16} />,
            danger: true,
            onClick: (e) => {
              e.domEvent.stopPropagation();
              Modal.confirm({
                title: "Xóa vĩnh viễn?",
                content: "Hành động này không thể hoàn tác!",
                okText: "Xóa",
                cancelText: "Hủy",
                okButtonProps: { danger: true },
                onOk: () => hardDeleteMutation.mutate([record._id]),
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button
              type="text"
              icon={<MdMoreVert size={20} />}
              style={{ padding: 4 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  // Transfer data source
  const transferDataSource: TransferItem[] = allCourses.map((course) => ({
    key: course._id,
    title: course.title,
    description: course.slug,
  }));

  return (
    <DashboardLayout>
      {/* Header - Responsive */}
      <div
        className="page-header"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 0,
        }}>
        <div style={{ flex: 1 }}>
          <Title
            level={isMobile ? 3 : 2}
            className="page-title"
            style={{ marginBottom: 4 }}>
            Quản lý Saler
          </Title>
          <Text
            className="page-subtitle"
            style={{ fontSize: isMobile ? 13 : 14 }}>
            Quản lý đội ngũ bán hàng, tạo tài khoản mới, và cấu hình KPI
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "space-between" : "flex-end",
          }}>
          <Space>
            <Text strong>Thống kê theo:</Text>
            <Select
              value={kpiStatsPeriod}
              onChange={setKpiStatsPeriod}
              style={{ width: 120 }}>
              <Select.Option value="month">Tháng</Select.Option>
              <Select.Option value="quarter">Quý</Select.Option>
              <Select.Option value="year">Năm</Select.Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<MdAdd size={isMobile ? 18 : 20} />}
            size={isMobile ? "middle" : "large"}
            onClick={() => setIsModalOpen(true)}>
            Tạo Saler mới
          </Button>
        </div>
      </div>

      {/* KPI Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Tổng Saler</span>}
              value={kpiStats?.total_salers || 0}
              valueStyle={{ color: "#2563eb", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={<span style={{ fontWeight: 600 }}>Đạt KPI</span>}
              value={kpiStats?.achieved_count || 0}
              suffix={`/ ${kpiStats?.total_salers || 0}`}
              valueStyle={{ color: "#10b981", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={<span style={{ fontWeight: 600 }}>% Đạt KPI</span>}
              value={kpiStats?.achieved_percentage || 0}
              suffix="%"
              precision={1}
              valueStyle={{
                color:
                  (kpiStats?.achieved_percentage || 0) >= 50
                    ? "#10b981"
                    : "#f59e0b",
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title={<span style={{ fontWeight: 600 }}>TB % Hoàn thành</span>}
              value={kpiStats?.avg_completion || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: "#3b82f6", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* KPI Chart */}
      {kpiChart && kpiChart.length > 0 && (
        <Card
          size="small"
          title={
            <span style={{ fontWeight: 600 }}>
              Số người đạt KPI theo{" "}
              {kpiStatsPeriod === "month"
                ? "tháng"
                : kpiStatsPeriod === "quarter"
                  ? "quý"
                  : "năm"}
            </span>
          }
          style={{ marginBottom: 24 }}>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip formatter={(value: any) => [value, "Đạt KPI"]} />
                <Bar
                  dataKey="achieved_count"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Đạt KPI"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card variant="borderless" style={{ padding: isMobile ? 12 : undefined }}>
        {/* Search & Actions Bar */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: 12,
          }}>
          <Space
            size="middle"
            wrap
            style={{ width: isMobile ? "100%" : "auto" }}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<MdSearch size={18} style={{ color: "#94a3b8" }} />}
              style={{
                width: isMobile ? "100%" : 280,
                minWidth: isMobile ? "100%" : 200,
              }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button
              icon={<MdRefresh size={18} />}
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["salers"] })
              }
              loading={isLoading}>
              {isMobile ? "" : "Làm mới"}
            </Button>
          </Space>

          {hasSelected && (
            <Space
              size="small"
              wrap
              style={{ width: isMobile ? "100%" : "auto" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Đã chọn {selectedRowKeys.length}
              </Text>
              <Button
                size="small"
                icon={<MdLock size={14} />}
                onClick={() => lockMutation.mutate(selectedRowKeys as string[])}
                loading={lockMutation.isPending}>
                Khóa
              </Button>
              <Button
                size="small"
                icon={<MdLockOpen size={14} />}
                onClick={() =>
                  unlockMutation.mutate(selectedRowKeys as string[])
                }
                loading={unlockMutation.isPending}>
                Mở
              </Button>
              <Popconfirm
                title={`Xóa ${selectedRowKeys.length} saler?`}
                description="Không thể hoàn tác!"
                onConfirm={() =>
                  hardDeleteMutation.mutate(selectedRowKeys as string[])
                }
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}>
                <Button
                  size="small"
                  danger
                  icon={<MdDeleteForever size={14} />}
                  loading={hardDeleteMutation.isPending}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>

        {/* Table */}
        <Table
          rowSelection={rowSelection}
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={salers}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: isMobile ? undefined : 1200 }}
          size={isMobile ? "small" : "middle"}
          onRow={(record) => ({
            onClick: () => {
              setSelectedSalerForDetail(record);
              setIsSalerDetailModalOpen(true);
            },
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: meta?.total || 0,
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            showTotal: isMobile
              ? undefined
              : (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: isMobile ? "small" : "default",
            simple: isMobile,
          }}
        />
      </Card>

      {/* Create Saler Modal */}
      <Modal
        title="Tạo tài khoản Saler mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSaler}
        okText="Tạo tài khoản"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95%" : 520}
        centered={isMobile}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}>
            <Input placeholder="VD: saler@company.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu tạm thời"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
            extra="Saler sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu. Code affiliate sẽ được tạo tự động.">
            <Input.Password placeholder="Nhập mật khẩu tạm thời" />
          </Form.Item>
        </Form>
      </Modal>

      {/* KPI Drawer */}
      <Drawer
        title={`Quản lý KPI - ${selectedSalerForKpi?.name || ""}`}
        open={isKpiDrawerOpen}
        onClose={() => {
          setIsKpiDrawerOpen(false);
          kpiForm.resetFields();
        }}
        width={isMobile ? "95%" : 480}
        extra={
          <Button type="primary" onClick={handleSaveKpi} loading={loadingKpi}>
            Lưu KPI
          </Button>
        }>
        {loadingKpi ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin tip="Đang tải dữ liệu KPI..." />
          </div>
        ) : (
          <>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}>
              Các trường KPI là tùy chọn. Bạn có thể để trống nếu chưa muốn gán
              KPI.
            </Text>
            <Form form={kpiForm} layout="vertical">
              <Form.Item
                name="kpi_monthly_target"
                label="KPI Tháng (Tùy chọn)"
                tooltip="Mục tiêu doanh số tháng - Để trống nếu chưa có">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  controls
                  placeholder="VD: 10000000"
                  addonAfter="VNĐ"
                />
              </Form.Item>

              <Form.Item
                name="kpi_quarterly_target"
                label="KPI Quý (Tùy chọn)"
                tooltip="Mục tiêu doanh số quý - Để trống nếu chưa có">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  controls
                  placeholder="VD: 30000000"
                  addonAfter="VNĐ"
                />
              </Form.Item>

              <Form.Item
                name="kpi_yearly_target"
                label="KPI Năm (Tùy chọn)"
                tooltip="Mục tiêu doanh số năm - Để trống nếu chưa có">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  controls
                  placeholder="VD: 120000000"
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>

      {/* Course Assignment Modal */}
      <Modal
        title={`Phân bổ khóa học - ${selectedSalerForCourse?.name || ""}`}
        open={isCourseModalOpen}
        onCancel={() => {
          setIsCourseModalOpen(false);
          setTargetKeys([]);
        }}
        onOk={handleSaveCourses}
        okText="Lưu"
        cancelText="Hủy"
        width={isMobile ? "95%" : 800}>
        {loadingCourses && !allCourses.length ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin tip="Đang tải danh sách khóa học..." />
          </div>
        ) : (
          <DragDropTransfer
            dataSource={transferDataSource}
            targetKeys={targetKeys}
            onChange={(keys) => setTargetKeys(keys)}
            titles={["Khóa học có sẵn", "Khóa học được gán"]}
            height={400}
            onLoadMore={handleLoadMoreCourses}
            loading={loadingCourses}
            hasMore={hasMoreCourses}
          />
        )}
      </Modal>

      {/* Commission Modal */}
      <Modal
        title={`Cấu hình hoa hồng - ${selectedSalerForCommission?.name || ""}`}
        open={isCommissionModalOpen}
        onCancel={() => {
          setIsCommissionModalOpen(false);
          commissionForm.resetFields();
        }}
        onOk={handleSaveCommission}
        okText="Lưu"
        cancelText="Hủy"
        width={isMobile ? "95%" : 600}>
        {loadingCommission ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin tip="Đang tải dữ liệu hoa hồng..." />
          </div>
        ) : (
          <Form form={commissionForm} layout="vertical">
            <Form.Item
              name="default_commission_rate"
              label="Tỷ lệ hoa hồng mặc định"
              tooltip="Áp dụng cho các khóa học chưa được cấu hình riêng">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                addonAfter="%"
                placeholder="VD: 15"
              />
            </Form.Item>

            {salerDetails && salerDetails.assigned_courses.length > 0 && (
              <>
                <Divider />
                <Text strong>Hoa hồng theo từng khóa học:</Text>
                <div style={{ marginTop: 16 }}>
                  {salerDetails.assigned_courses.map((courseId: string) => {
                    const course = allCourses.find((c) => c._id === courseId);
                    return (
                      <Form.Item
                        key={courseId}
                        name={`course_${courseId}`}
                        label={course?.title || courseId}>
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={100}
                          addonAfter="%"
                          placeholder="Tỷ lệ hoa hồng"
                        />
                      </Form.Item>
                    );
                  })}
                </div>
              </>
            )}
          </Form>
        )}
      </Modal>

      {/* Saler Detail Modal */}
      <Modal
        title={
          <Space>
            <Avatar
              size={40}
              style={{
                ...getAvatarStyles(selectedSalerForDetail?.name || ""),
                fontWeight: "bold",
              }}>
              {selectedSalerForDetail?.name?.substring(0, 2).toUpperCase()}
            </Avatar>
            <div>
              <Text strong>{selectedSalerForDetail?.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedSalerForDetail?.email}
              </Text>
            </div>
          </Space>
        }
        open={isSalerDetailModalOpen}
        onCancel={() => setIsSalerDetailModalOpen(false)}
        footer={null}
        width={700}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text>Kỳ:</Text>
            <Select
              size="small"
              value={salerDetailPeriod}
              onChange={setSalerDetailPeriod}
              style={{ width: 100 }}>
              <Select.Option value="month">Tháng</Select.Option>
              <Select.Option value="quarter">Quý</Select.Option>
              <Select.Option value="year">Năm</Select.Option>
            </Select>
          </Space>
        </div>

        {salerAnalyticsLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : salerAnalytics ? (
          <>
            {/* KPI Progress */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title={
                      <span style={{ fontWeight: 600 }}>Doanh thu thực tế</span>
                    }
                    value={salerAnalytics.actual_revenue}
                    suffix="đ"
                    valueStyle={{ fontWeight: 700 }}
                    formatter={(value) =>
                      (value as number).toLocaleString("vi-VN")
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ fontWeight: 600 }}>Mục tiêu</span>}
                    value={salerAnalytics.target_revenue}
                    suffix="đ"
                    valueStyle={{ fontWeight: 700 }}
                    formatter={(value) =>
                      (value as number).toLocaleString("vi-VN")
                    }
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}>
                  <Text type="secondary">% Hoàn thành KPI</Text>
                  <Text
                    strong
                    style={{
                      color:
                        salerAnalytics.completion_percentage >= 100
                          ? "#10b981"
                          : "#f59e0b",
                    }}>
                    {salerAnalytics.completion_percentage.toFixed(1)}%
                  </Text>
                </div>
                <Progress
                  percent={Math.min(salerAnalytics.completion_percentage, 100)}
                  status={
                    salerAnalytics.completion_percentage >= 100
                      ? "success"
                      : "active"
                  }
                  showInfo={false}
                />
              </div>
            </Card>

            {/* Stats Row */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={
                      <span style={{ fontWeight: 600 }}>Tổng đơn hàng</span>
                    }
                    value={salerAnalytics.total_orders}
                    valueStyle={{ fontWeight: 700 }}
                    prefix={<MdShoppingCart />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title={<span style={{ fontWeight: 600 }}>Kỳ thống kê</span>}
                    value={
                      salerDetailPeriod === "month"
                        ? "Tháng này"
                        : salerDetailPeriod === "quarter"
                          ? "Quý này"
                          : "Năm nay"
                    }
                    valueStyle={{ fontSize: 18, fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Top Courses */}
            {salerAnalytics.top_courses &&
              salerAnalytics.top_courses.length > 0 && (
                <Card
                  size="small"
                  title={
                    <span style={{ fontWeight: 600 }}>
                      Top 3 khóa học bán chạy
                    </span>
                  }>
                  {salerAnalytics.top_courses.map((course, index) => (
                    <div
                      key={course.course_id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom:
                          index < salerAnalytics.top_courses.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}>
                      <Space>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color:
                              index === 0
                                ? "#f59e0b"
                                : index === 1
                                  ? "#94a3b8"
                                  : "#d97706",
                          }}>
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </Text>
                        <div>
                          <Text strong>{course.title}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {course.count} đơn
                          </Text>
                        </div>
                      </Space>
                      <Text strong style={{ color: "#10b981" }}>
                        {course.revenue.toLocaleString("vi-VN")}đ
                      </Text>
                    </div>
                  ))}
                </Card>
              )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Text type="secondary">Không có dữ liệu</Text>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
