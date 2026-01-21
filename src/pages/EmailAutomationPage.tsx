import { useState, useEffect } from "react";
import {
  Card,
  Select,
  Input,
  Button,
  Switch,
  List,
  Modal,
  Form,
  InputNumber,
  message,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Tabs,
  Divider,
} from "antd";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSave,
  MdMail,
  MdSchedule,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import TiptapEditor from "../components/email-automation/TiptapEditor";
import {
  emailAutomationApi,
  EmailAutomation,
  EmailAutomationStep,
  EmailLog,
  CreateStepDto,
} from "../api/emailAutomationApi";

const { Title, Text } = Typography;

export default function EmailAutomationPage() {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [selectedAutomation, setSelectedAutomation] =
    useState<EmailAutomation | null>(null);
  const [steps, setSteps] = useState<EmailAutomationStep[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [automationName, setAutomationName] = useState("");
  const [automationDescription, setAutomationDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"event" | "group">("event");
  const [targetGroup, setTargetGroup] = useState<string>("all_students");
  const [eventType, setEventType] = useState("user.registered");
  const [isActive, setIsActive] = useState(false);

  // Step editor modal
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<EmailAutomationStep | null>(
    null,
  );
  const [stepForm] = Form.useForm();
  const [stepBodyContent, setStepBodyContent] = useState("");
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);

  // Pagination
  const [logPagination, setLogPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [activeTab, setActiveTab] = useState("config");
  const [logSearchAutomation, setLogSearchAutomation] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    loadAutomations();
  }, []);

  useEffect(() => {
    if (selectedAutomation) {
      loadSteps(selectedAutomation._id);
    }
  }, [selectedAutomation]);

  useEffect(() => {
    loadEmailLogs(logSearchAutomation);
  }, [logSearchAutomation]);

  useEffect(() => {
    if (eventType) {
      loadTemplateVariables(eventType);
    }
  }, [eventType]);

  const loadAutomations = async () => {
    try {
      const data = await emailAutomationApi.getAutomations();
      setAutomations(data);
      if (data.length > 0 && !selectedAutomation) {
        selectAutomation(data[0]);
      }
    } catch (error) {
      message.error("Không thể tải danh sách automation");
    }
  };

  const selectAutomation = async (automation: EmailAutomation) => {
    setSelectedAutomation(automation);
    setAutomationName(automation.name);
    setAutomationDescription(automation.description || "");
    setTriggerType(automation.trigger_type || "event");
    setEventType(automation.event_type || "");
    setTargetGroup(automation.target_group || "all_students");
    setIsActive(automation.is_active);
  };

  const handleNewAutomation = () => {
    setSelectedAutomation(null);
    setAutomationName("");
    setAutomationDescription("");
    setTriggerType("event");
    setEventType("user.registered");
    setTargetGroup("all_students");
    setIsActive(false);
    setSteps([]);
  };

  const loadSteps = async (automationId: string) => {
    try {
      const data = await emailAutomationApi.getSteps(automationId);
      setSteps(data);
    } catch (error) {
      message.error("Không thể tải danh sách bước");
    }
  };

  const loadEmailLogs = async (automationId?: string, page = 1) => {
    setLoading(true);
    try {
      const data = await emailAutomationApi.getEmailLogs({
        automationId,
        limit: logPagination.pageSize,
        skip: (page - 1) * logPagination.pageSize,
      });
      setEmailLogs(data.logs);
      setLogPagination({ ...logPagination, current: page, total: data.total });
    } catch (error) {
      message.error("Không thể tải lịch sử email");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateVariables = async (eventType: string) => {
    try {
      const data = await emailAutomationApi.getTemplateVariables(eventType);
      setAvailableVariables(data.variables);
    } catch (error) {
      console.error("Không thể tải biến template");
    }
  };

  const handleCreateAutomation = async () => {
    if (!automationName || !eventType) {
      message.error("Vui lòng nhập tên và chọn sự kiện");
      return;
    }

    setLoading(true);
    try {
      const newAutomation = await emailAutomationApi.createAutomation({
        name: automationName,
        description: automationDescription,
        trigger_type: triggerType,
        event_type: triggerType === "event" ? eventType : undefined,
        target_group:
          triggerType === "group" ? (targetGroup as any) : undefined,
      });
      message.success("Tạo automation thành công");
      await loadAutomations();
      selectAutomation(newAutomation);
    } catch (error) {
      message.error("Không thể tạo automation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAutomation = async () => {
    if (!selectedAutomation) return;

    setLoading(true);
    try {
      await emailAutomationApi.updateAutomation(selectedAutomation._id, {
        name: automationName,
        description: automationDescription,
        trigger_type: triggerType,
        event_type: triggerType === "event" ? eventType : undefined,
        target_group:
          triggerType === "group" ? (targetGroup as any) : undefined,
      });
      message.success("Cập nhật automation thành công");
      await loadAutomations();
    } catch (error) {
      message.error("Không thể cập nhật automation");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedAutomation) return;

    setLoading(true);
    try {
      const updated = await emailAutomationApi.toggleAutomation(
        selectedAutomation._id,
      );
      setIsActive(updated.is_active);
      message.success(updated.is_active ? "Đã kích hoạt" : "Đã tạm dừng");
      await loadAutomations();
    } catch (error) {
      message.error("Không thể thay đổi trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAutomation = async () => {
    if (!selectedAutomation) return;

    Modal.confirm({
      title: "Xác nhận xóa chiến dịch",
      content:
        "Bạn có chắc muốn xóa vĩnh viễn chiến dịch này và tất cả các bước liên quan? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await emailAutomationApi.deleteAutomation(selectedAutomation._id);
          message.success("Xóa chiến dịch thành công");
          setSelectedAutomation(null);
          handleNewAutomation();
          await loadAutomations();
        } catch (error) {
          message.error("Không thể xóa chiến dịch");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleAddStep = () => {
    setEditingStep(null);
    stepForm.resetFields();
    setStepBodyContent("");
    stepForm.setFieldsValue({
      step_order: steps.length + 1,
      delay_minutes: 0,
    });
    setStepModalVisible(true);
  };

  const handleEditStep = (step: EmailAutomationStep) => {
    setEditingStep(step);
    stepForm.setFieldsValue({
      step_order: step.step_order,
      delay_minutes: step.delay_minutes,
      subject_template: step.subject_template,
    });
    setStepBodyContent(step.body_template);
    setStepModalVisible(true);
  };

  const handleSaveStep = async () => {
    if (!selectedAutomation) return;

    try {
      const values = await stepForm.validateFields();
      const stepData: CreateStepDto = {
        ...values,
        body_template: stepBodyContent,
      };

      setLoading(true);
      if (editingStep) {
        await emailAutomationApi.updateStep(editingStep._id, stepData);
        message.success("Cập nhật bước thành công");
      } else {
        await emailAutomationApi.addStep(selectedAutomation._id, stepData);
        message.success("Thêm bước thành công");
      }

      await loadSteps(selectedAutomation._id);
      setStepModalVisible(false);
    } catch (error) {
      message.error("Không thể lưu bước");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa bước này?",
      onOk: async () => {
        try {
          await emailAutomationApi.deleteStep(stepId);
          message.success("Xóa bước thành công");
          if (selectedAutomation) {
            await loadSteps(selectedAutomation._id);
          }
        } catch (error) {
          message.error("Không thể xóa bước");
        }
      },
    });
  };

  const eventTypeOptions = [
    { label: "Người dùng đăng ký", value: "user.registered" },
    { label: "Mua khóa học", value: "course.purchased" },
    { label: "Đăng ký nhưng chưa mua", value: "user.registered.no.purchase" },
  ];

  const triggerTypeOptions = [
    { label: "Theo sự kiện (Event)", value: "event" },
    { label: "Gửi theo nhóm người (Group)", value: "group" },
  ];

  const targetGroupOptions = [
    { label: "Tất cả học viên", value: "all_students" },
    { label: "Học viên chưa mua khóa học", value: "unpurchased_students" },
    { label: "Học viên đã mua khóa học", value: "purchased_students" },
    { label: "Saler (Đội ngũ bán hàng)", value: "salers" },
  ];

  const logColumns = [
    {
      title: "Chiến dịch",
      dataIndex: "automation_id",
      key: "automation_name",
      width: 180,
      render: (automation: any) => automation?.name || "N/A",
    },
    {
      title: "Người nhận",
      dataIndex: "user_id",
      key: "recipient",
      width: 200,
      render: (user: any, record: EmailLog) => (
        <Space direction="vertical" size={0}>
          <Text strong>{user?.name || "Học viên"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.recipient_email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const colors = {
          sent: "success",
          pending: "processing",
          failed: "error",
        };
        const labels = {
          sent: "Đã gửi",
          pending: "Đang gửi",
          failed: "Lỗi",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {labels[status as keyof typeof labels]}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "sent_at",
      key: "sent_at",
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "-",
    },
  ];

  const configPanel = (
    <Card
      title={
        <Space>
          <MdMail size={20} />
          <span>Cấu hình Email Automation</span>
        </Space>
      }
      extra={
        <Space>
          <Switch
            checked={isActive}
            onChange={handleToggleActive}
            disabled={!selectedAutomation}
          />
          <Text type="secondary">{isActive ? "Hoạt động" : "Tạm dừng"}</Text>
        </Space>
      }>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Automation selector */}
        {/* Unified Campaign Information */}
        <div
          style={{
            background: "#f8f9fa",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #e9ecef",
          }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}>
              <Space>
                <Text strong>Chiến dịch</Text>
                {selectedAutomation && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<MdDelete />}
                    onClick={handleDeleteAutomation}>
                    Xóa
                  </Button>
                )}
              </Space>
              {!selectedAutomation && automations.length > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => selectAutomation(automations[0])}>
                  Quay lại chọn chiến dịch
                </Button>
              )}
            </div>

            {!selectedAutomation ? (
              <Input
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                placeholder="Nhập tên chiến dịch mới..."
                autoFocus
              />
            ) : (
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn chiến dịch hoặc tạo mới"
                value={selectedAutomation?._id}
                onChange={(value) => {
                  const automation = automations.find((a) => a._id === value);
                  if (automation) selectAutomation(automation);
                }}
                options={automations.map((a) => ({
                  label: a.name,
                  value: a._id,
                }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "4px 0" }} />
                    <Button
                      type="text"
                      block
                      icon={<MdAdd />}
                      onClick={handleNewAutomation}
                      style={{ textAlign: "left", color: "#f78404" }}>
                      Tạo chiến dịch mới
                    </Button>
                  </>
                )}
              />
            )}
          </div>
        </div>

        {/* Trigger type */}
        <div>
          <Text strong>Hình thức kích hoạt</Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            value={triggerType}
            onChange={(val) => setTriggerType(val as any)}
            options={triggerTypeOptions}
          />
        </div>

        {/* Conditional fields based on Trigger Type */}
        {triggerType === "event" ? (
          <div>
            <Text strong>Sự kiện kích hoạt</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={eventType}
              onChange={setEventType}
              options={eventTypeOptions}
            />
          </div>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Text strong>Chọn nhóm đối tượng</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                value={targetGroup}
                onChange={setTargetGroup}
                options={targetGroupOptions}
              />
            </div>
          </Space>
        )}

        {/* Email steps - only show if campaign exists */}
        {selectedAutomation && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}>
              <Text strong>Danh sách Email</Text>
              <Button
                type="primary"
                size="small"
                icon={<MdAdd />}
                onClick={handleAddStep}>
                Thêm bước
              </Button>
            </div>

            <List
              dataSource={steps}
              renderItem={(step) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      size="small"
                      icon={<MdEdit />}
                      onClick={() => handleEditStep(step)}
                    />,
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      danger
                      icon={<MdDelete />}
                      onClick={() => handleDeleteStep(step._id)}
                    />,
                  ]}>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#f78404",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                        }}>
                        {step.step_order}
                      </div>
                    }
                    title={step.subject_template}
                    description={
                      <Space>
                        <MdSchedule />
                        <Text type="secondary">
                          {step.delay_minutes === 0
                            ? "Ngay lập tức"
                            : `Sau ${step.delay_minutes} phút`}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Chưa có bước nào" }}
            />
          </div>
        )}

        {/* Save button */}
        <Button
          type="primary"
          icon={<MdSave />}
          block
          onClick={
            selectedAutomation ? handleUpdateAutomation : handleCreateAutomation
          }
          loading={loading}>
          {selectedAutomation ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Space>
    </Card>
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Email Automation
        </Title>
        <Text type="secondary">
          Tự động gửi email dựa trên hành vi người dùng
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "config",
            label: (
              <Space>
                <MdMail />
                <span>Cấu hình chiến dịch</span>
              </Space>
            ),
            children: (
              <Row gutter={24}>
                <Col xs={24} lg={16}>
                  {configPanel}
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Hướng dẫn" size="small">
                    <Text type="secondary">
                      1. Chọn hoặc tạo mới chiến dịch.
                      <br />
                      2. Thiết lập hình thức kích hoạt.
                      <br />
                      3. Thêm các bước (Email) gửi đi.
                      <br />
                      4. Bật công tắc "Hoạt động" để bắt đầu.
                    </Text>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "history",
            label: (
              <Space>
                <MdSchedule />
                <span>Lịch sử gửi Email</span>
              </Space>
            ),
            children: (
              <Card>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Lọc theo chiến dịch"
                      allowClear
                      value={logSearchAutomation}
                      onChange={setLogSearchAutomation}
                      options={automations.map((a) => ({
                        label: a.name,
                        value: a._id,
                      }))}
                    />
                  </Col>
                  <Col span={16}>
                    <Text type="secondary" style={{ lineHeight: "32px" }}>
                      Hiển thị lịch sử gửi email của hệ thống.
                    </Text>
                  </Col>
                </Row>
                <Table
                  dataSource={emailLogs}
                  columns={logColumns}
                  rowKey="_id"
                  loading={loading}
                  pagination={{
                    current: logPagination.current,
                    pageSize: logPagination.pageSize,
                    total: logPagination.total,
                    onChange: (page) => {
                      loadEmailLogs(logSearchAutomation, page);
                    },
                  }}
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Step Editor Modal */}
      <Modal
        title={editingStep ? "Chỉnh sửa bước" : "Thêm bước mới"}
        open={stepModalVisible}
        onCancel={() => setStepModalVisible(false)}
        onOk={handleSaveStep}
        width={800}
        okText="Lưu"
        cancelText="Hủy">
        <Form form={stepForm} layout="vertical">
          <Form.Item
            name="step_order"
            label="Thứ tự"
            rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="delay_minutes"
            label="Độ trễ (phút)"
            extra="0 = gửi ngay lập tức, 1440 = 1 ngày"
            rules={[{ required: true, message: "Vui lòng nhập độ trễ" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="subject_template"
            label="Tiêu đề email"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
            <Input placeholder="VD: Chào mừng {{user.name}}!" />
          </Form.Item>

          <Form.Item label="Nội dung email" required>
            <TiptapEditor
              content={stepBodyContent}
              onChange={setStepBodyContent}
              availableVariables={availableVariables}
              placeholder="Nhập nội dung email..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
