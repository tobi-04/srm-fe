import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import {
  Card,
  Button,
  Space,
  message,
  Spin,
  Layout,
  Typography,
  Divider,
  Tabs,
  Dropdown,
} from "antd";
import {
  MdSave,
  MdArrowBack,
  MdPreview,
  MdEdit,
  MdVisibility,
  MdShare,
  MdMoreVert,
} from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { getLandingPageById, updateLandingPage } from "../api/landingPage";
import {
  Text,
  Button as BuilderButton,
  Container,
  Image,
  Header,
  Headline,
  Subtitle,
  UserForm,
  InstructorBio,
  SuccessHeadline,
  VideoPlayer,
  CountdownTimer,
  SalesPageContent,
  TwoColumnLayout,
  Footer,
  PaymentQRCode,
  PaymentInfo,
  PaymentStatus,
} from "../components/landing-builder/components";
import { Toolbox, SettingsPanel } from "../components/landing-builder/Sidebar";
import { LandingPageProvider } from "../contexts/LandingPageContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import { CountdownProvider } from "../contexts/CountdownContext";
import ShareDialog from "../components/ShareDialog";

const { Content, Sider } = Layout;
const { Title } = Typography;

type PageStep = "1" | "2" | "3";

const SaveButton = ({
  currentStep,
  onSave,
  loading,
}: {
  currentStep: PageStep;
  onSave: (query: any, step: PageStep) => void;
  loading: boolean;
}) => {
  const { query } = useEditor();
  return (
    <Button
      type="primary"
      icon={<MdSave />}
      onClick={() => onSave(query, currentStep)}
      loading={loading}>
      Lưu Bước {currentStep}
    </Button>
  );
};

export default function LandingPageBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState<PageStep>("1");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Fetch landing page data
  const { data: landingPage, isLoading } = useQuery({
    queryKey: ["landing-page", id],
    queryFn: () => getLandingPageById(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLandingPage(id, data),
    onSuccess: () => {
      message.success(`Bước ${currentStep} đã được lưu thành công`);
      queryClient.invalidateQueries({ queryKey: ["landing-page", id] });
    },
    onError: () => {
      message.error("Không thể lưu landing page");
    },
  });

  const handleSave = (query: any, step: PageStep) => {
    const json = query.serialize();
    if (id) {
      const fieldName = `page_${step}_content`;
      updateMutation.mutate({
        id,
        data: { [fieldName]: JSON.parse(json) },
      });
    }
  };

  // Get the content for the current step
  const getCurrentPageContent = () => {
    if (!landingPage) return undefined;

    let content;
    switch (currentStep) {
      case "1":
        content = landingPage.page_1_content;
        break;
      case "2":
        content = landingPage.page_2_content;
        break;
      case "3":
        content = landingPage.page_3_content;
        break;
      default:
        content = undefined;
    }

    // Return content if it exists and has nodes
    if (content && Object.keys(content).length > 0) {
      return content;
    }

    // Return undefined for empty content - will use default React elements
    return undefined;
  };

  // Get default sections for each step
  const getDefaultStepSections = (step: PageStep) => {
    switch (step) {
      case "1":
        return (
          <Element is={Container} padding={0} background="#ffffff" canvas>
            <Header />
            <Headline />
            <Subtitle />
            <UserForm />
            <InstructorBio />
            <Footer />
          </Element>
        );
      case "2":
        return (
          <Element is={Container} padding={0} background="#f5f5f5" canvas>
            <SuccessHeadline />
            <Container background="#ffffff">
              <Element is={TwoColumnLayout} canvas>
                <Element is={Container} background="transparent" canvas>
                  <VideoPlayer />
                </Element>
                <Element is={Container} background="transparent" canvas>
                  <CountdownTimer />
                  <SalesPageContent />
                </Element>
              </Element>
            </Container>
            <Footer />
          </Element>
        );
      case "3":
        return (
          <Element is={Container} background="#f5f5f5" canvas>
            <Text text="Complete Your Payment" type="title" level={1} />
            <Container background="#ffffff">
              <PaymentQRCode />
              <PaymentInfo />
            </Container>
            <PaymentStatus />
            <Footer />
          </Element>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        style={{
          height: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}>
        <LandingPageProvider landingPage={landingPage || null}>
          <PaymentProvider>
            <CountdownProvider>
              <Editor
                resolver={{
                  Text,
                  Button: BuilderButton,
                  Container,
                  Image,
                  Header,
                  Headline,
                  Subtitle,
                  UserForm,
                  InstructorBio,
                  SuccessHeadline,
                  VideoPlayer,
                  CountdownTimer,
                  SalesPageContent,
                  TwoColumnLayout,
                  Footer,
                  PaymentQRCode,
                  PaymentInfo,
                  PaymentStatus,
                }}
                enabled={enabled}
                onRender={({ render }) => (
                  <div style={{ position: "relative" }}>{render}</div>
                )}>
                {/* Top Control Bar */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <Space>
                      <Button
                        icon={<MdArrowBack />}
                        onClick={() => navigate("/admin/landing-pages")}>
                        Quay lại
                      </Button>
                      <Title level={5} style={{ margin: 0 }}>
                        Thiết kế: {landingPage?.title}
                      </Title>
                    </Space>
                    <Space>
                      <Button
                        icon={enabled ? <MdVisibility /> : <MdEdit />}
                        onClick={() => setEnabled(!enabled)}>
                        {enabled ? "Chế độ xem trước" : "Chế độ chỉnh sửa"}
                      </Button>
                      <SaveButton
                        currentStep={currentStep}
                        onSave={handleSave}
                        loading={updateMutation.isPending}
                      />
                      <Button
                        icon={<MdPreview />}
                        onClick={() =>
                          navigate(`/admin/landing-preview/${id}`)
                        }>
                        Xem trước
                      </Button>
                      <Button
                        icon={<MdVisibility />}
                        onClick={() => {
                          if (landingPage?.slug) {
                            window.open(
                              `/landing/${landingPage.slug}`,
                              "_blank",
                            );
                          }
                        }}>
                        Mở trong tab mới
                      </Button>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "share",
                              label: "Chia sẻ",
                              icon: <MdShare />,
                              onClick: () => setIsShareDialogOpen(true),
                            },
                          ],
                        }}
                        trigger={["click"]}>
                        <Button icon={<MdMoreVert />} />
                      </Dropdown>
                    </Space>
                  </div>

                  {/* Step Tabs */}
                  <Divider style={{ margin: "12px 0" }} />
                  <Tabs
                    activeKey={currentStep}
                    onChange={(key) => setCurrentStep(key as PageStep)}
                    items={[
                      {
                        key: "1",
                        label: (
                          <span>
                            <span style={{ fontWeight: 600 }}>Bước 1</span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              Form thông tin
                            </span>
                          </span>
                        ),
                      },
                      {
                        key: "2",
                        label: (
                          <span>
                            <span style={{ fontWeight: 600 }}>Bước 2</span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              Trang bán hàng
                            </span>
                          </span>
                        ),
                      },
                      {
                        key: "3",
                        label: (
                          <span>
                            <span style={{ fontWeight: 600 }}>Bước 3</span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              Trang thanh toán
                            </span>
                          </span>
                        ),
                      },
                    ]}
                  />
                </Card>

                <Layout
                  style={{
                    flex: 1,
                    background: "#f0f2f5",
                    overflow: "hidden",
                  }}>
                  {/* Main Canvas Area */}
                  <Content
                    style={{
                      padding: "24px",
                      overflowY: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "1000px",
                        background: "#fff",
                        minHeight: "100%",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      className="landing-builder-content">
                      <Frame
                        key={currentStep}
                        data={
                          getCurrentPageContent()
                            ? JSON.stringify(getCurrentPageContent())
                            : undefined
                        }>
                        {!getCurrentPageContent() &&
                          getDefaultStepSections(currentStep)}
                      </Frame>
                    </div>
                  </Content>

                  {/* Right Sidebar */}
                  <Sider
                    width={300}
                    theme="light"
                    style={{
                      borderLeft: "1px solid #f0f0f0",
                      overflowY: "auto",
                    }}>
                    <Toolbox />
                    <Divider style={{ margin: 0 }} />
                    <SettingsPanel />
                  </Sider>
                </Layout>
              </Editor>
            </CountdownProvider>
          </PaymentProvider>
        </LandingPageProvider>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        landingPageSlug={landingPage?.slug}
        landingPageTitle={landingPage?.title}
      />
    </DashboardLayout>
  );
}
