import { useState, useEffect } from "react";
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
  Modal,
} from "antd";
import {
  MdSave,
  MdArrowBack,
  MdPreview,
  MdEdit,
  MdVisibility,
  MdShare,
  MdMoreVert,
  MdDeleteSweep,
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
  // Advanced Components
  VideoEmbed,
  RichText,
  AdvancedButton,
  HeroSection,
  GridContent,
  GridItem,
  List,
  Carousel,
  CustomHTML,
  BookHero,
  BookCheckoutButton,
  IndicatorHero,
  IndicatorCheckoutButton,
} from "../components/landing-builder/components";
import { Toolbox, SettingsPanel } from "../components/landing-builder/Sidebar";
import { LandingPageProvider } from "../contexts/LandingPageContext";
import { PaymentProvider } from "../contexts/PaymentContext";
import { CountdownProvider } from "../contexts/CountdownContext";
import ShareDialog from "../components/ShareDialog";
import { BookCheckoutModal } from "../components/books/BookCheckoutModal";
import { IndicatorCheckoutModal } from "../components/indicators/IndicatorCheckoutModal";
import { indicatorApi } from "../api/indicatorApi";
import { bookApi } from "../api/bookApi";

const { Content, Sider } = Layout;
const { Title } = Typography;

type PageStep = "1" | "2" | "3";

const SaveButton = ({
  currentStep,
  onSave,
  loading,
  isRestrictedFlow,
}: {
  currentStep: PageStep;
  onSave: (query: any, step: PageStep) => void;
  loading: boolean;
  isRestrictedFlow?: boolean;
}) => {
  const { query } = useEditor();
  return (
    <Button
      type="primary"
      icon={<MdSave />}
      onClick={() => onSave(query, currentStep)}
      loading={loading}
    >
      {isRestrictedFlow ? "Lưu" : `Lưu Bước ${currentStep}`}
    </Button>
  );
};

const ResetToDefaultButton = ({
  currentStep,
  landingPageId,
}: {
  currentStep: PageStep;
  landingPageId: string;
}) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLandingPage(id, data),
    onSuccess: () => {
      message.success(`Đã khôi phục Bước ${currentStep} về mặc định`);
      queryClient.invalidateQueries({
        queryKey: ["landing-page", landingPageId],
      });
      // Force reload to apply changes from DB
      window.location.reload();
    },
    onError: () => {
      message.error("Không thể khôi phục về mặc định");
    },
  });

  const handleReset = () => {
    Modal.confirm({
      title: "Khôi phục về mặc định?",
      content: `Bạn có chắc chắn muốn khôi phục Bước ${currentStep} về mặc định? Tất cả thay đổi tùy chỉnh sẽ bị xóa.`,
      okText: "Khôi phục",
      cancelText: "Hủy",
      okType: "danger",
      onOk: () => {
        const fieldName = `page_${currentStep}_content`;
        updateMutation.mutate({
          id: landingPageId,
          data: { [fieldName]: null },
        });
      },
    });
  };

  return (
    <Button
      danger
      icon={<MdDeleteSweep />}
      onClick={handleReset}
      loading={updateMutation.isPending}
    >
      Khôi phục mặc định
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
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // Fetch landing page data
  const { data: landingPage, isLoading } = useQuery({
    queryKey: ["landing-page", id],
    queryFn: () => getLandingPageById(id!),
    enabled: !!id,
  });

  // Fetch book data if available
  const { data: book } = useQuery({
    queryKey: ["book", landingPage?.book_id],
    queryFn: () => {
      // Handle case where book_id might be an object (if populated) or string
      const bookId =
        typeof landingPage?.book_id === "object"
          ? (landingPage.book_id as any)._id
          : landingPage?.book_id;
      return bookApi.adminGetById(bookId).then((res: any) => res.data);
    },
    enabled: !!landingPage?.book_id,
  });

  // Fetch indicator data if available
  const { data: indicator } = useQuery({
    queryKey: ["indicator", landingPage?.indicator_id],
    queryFn: () => {
      const indicatorId =
        typeof landingPage?.indicator_id === "object"
          ? (landingPage.indicator_id as any)._id
          : landingPage?.indicator_id;
      return indicatorApi
        .adminGetById(indicatorId)
        .then((res: any) => res.data);
    },
    enabled: !!landingPage?.indicator_id,
  });

  // Force Step 2 for Books/Indicators
  useEffect(() => {
    const isRestrictedFlow =
      landingPage?.resource_type === "book" ||
      landingPage?.book_id ||
      landingPage?.resource_type === "indicator" ||
      landingPage?.indicator_id;

    if (isRestrictedFlow && currentStep !== "2") {
      setCurrentStep("2");
    }
  }, [landingPage, currentStep]);

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
        // Override for Books/Indicators
        const isRestrictedFlow =
          landingPage?.resource_type === "book" ||
          landingPage?.book_id ||
          landingPage?.resource_type === "indicator" ||
          landingPage?.indicator_id;

        if (isRestrictedFlow) {
          const isIndicator =
            landingPage?.resource_type === "indicator" ||
            landingPage?.indicator_id;

          return (
            <Element is={Container} padding={0} background="#ffffff" canvas>
              <Element is={Container} padding={20} background="#fff" canvas>
                {isIndicator ? (
                  <IndicatorCheckoutButton />
                ) : (
                  <BookCheckoutButton />
                )}
              </Element>
              <Footer />
            </Element>
          );
        }

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
        }}
      >
        <LandingPageProvider
          landingPage={landingPage || null}
          isPurchaseModalOpen={isPurchaseModalOpen}
          setPurchaseModalOpen={setPurchaseModalOpen}
        >
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
                  // Advanced Components
                  VideoEmbed,
                  RichText,
                  AdvancedButton,
                  HeroSection,
                  GridContent,
                  GridItem,
                  List,
                  Carousel,
                  CustomHTML,
                  BookHero,
                  BookCheckoutButton,
                  IndicatorHero,
                  IndicatorCheckoutButton,
                }}
                enabled={enabled}
                onRender={({ render }) => (
                  <div style={{ position: "relative" }}>{render}</div>
                )}
              >
                {/* Top Control Bar */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <Button
                        icon={<MdArrowBack />}
                        onClick={() => navigate("/admin/landing-pages")}
                      >
                        Quay lại
                      </Button>
                      <Title level={5} style={{ margin: 0 }}>
                        Thiết kế: {landingPage?.title}
                      </Title>
                    </Space>
                    <Space>
                      <Button
                        icon={enabled ? <MdVisibility /> : <MdEdit />}
                        onClick={() => setEnabled(!enabled)}
                      >
                        {enabled ? "Chế độ xem trước" : "Chế độ chỉnh sửa"}
                      </Button>
                      <SaveButton
                        currentStep={currentStep}
                        onSave={handleSave}
                        loading={updateMutation.isPending}
                        isRestrictedFlow={
                          !!(
                            landingPage?.resource_type === "book" ||
                            landingPage?.book_id ||
                            landingPage?.resource_type === "indicator" ||
                            landingPage?.indicator_id
                          )
                        }
                      />
                      <ResetToDefaultButton
                        currentStep={currentStep}
                        landingPageId={id!}
                      />
                      <Button
                        icon={<MdPreview />}
                        onClick={() => navigate(`/admin/landing-preview/${id}`)}
                      >
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
                        }}
                      >
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
                        trigger={["click"]}
                      >
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
                    ].filter((item) => {
                      // If it is a book or indicator, only show step 2
                      const isRestrictedFlow =
                        landingPage?.resource_type === "book" ||
                        landingPage?.book_id ||
                        landingPage?.resource_type === "indicator" ||
                        landingPage?.indicator_id;

                      if (isRestrictedFlow) {
                        return item.key === "2";
                      }
                      return true;
                    })}
                    renderTabBar={(props, DefaultTabBar) => {
                      const isRestrictedFlow =
                        landingPage?.resource_type === "book" ||
                        landingPage?.book_id ||
                        landingPage?.resource_type === "indicator" ||
                        landingPage?.indicator_id;

                      if (isRestrictedFlow) return <></>;
                      return <DefaultTabBar {...props} />;
                    }}
                  />
                </Card>

                <Layout
                  style={{
                    flex: 1,
                    background: "#f0f2f5",
                    overflow: "hidden",
                  }}
                >
                  {/* Main Canvas Area */}
                  <Content
                    style={{
                      padding: "24px",
                      overflowY: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "1000px",
                        background: "#fff",
                        minHeight: "100%",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      className="landing-builder-content"
                    >
                      <Frame
                        key={currentStep}
                        data={
                          getCurrentPageContent()
                            ? JSON.stringify(getCurrentPageContent())
                            : undefined
                        }
                      >
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
                    }}
                  >
                    <Toolbox />
                    <Divider style={{ margin: 0 }} />
                    <SettingsPanel />
                  </Sider>
                </Layout>
              </Editor>
            </CountdownProvider>
          </PaymentProvider>

          {/* Render Checkou Modals */}
          {isPurchaseModalOpen && (
            <>
              {(landingPage?.resource_type === "indicator" ||
                landingPage?.indicator_id) &&
              indicator ? (
                <IndicatorCheckoutModal
                  open={isPurchaseModalOpen}
                  onCancel={() => setPurchaseModalOpen(false)}
                  indicator={indicator}
                />
              ) : (landingPage?.resource_type === "book" ||
                  landingPage?.book_id) &&
                book ? (
                <BookCheckoutModal
                  open={isPurchaseModalOpen}
                  onCancel={() => setPurchaseModalOpen(false)}
                  book={book}
                />
              ) : null}
            </>
          )}
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
