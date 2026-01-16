import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Editor, Frame, Element } from "@craftjs/core";
import {
  Layout,
  Spin,
  Result,
  Alert,
  Steps,
  Button as AntButton,
  Segmented,
} from "antd";
import {
  MdError,
  MdCheckCircle,
  MdPhoneIphone,
  MdTablet,
  MdLaptop,
} from "react-icons/md";
import { getLandingPageBySlug } from "../../api/landingPage";
import { useAuthStore } from "../../stores/authStore";
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
} from "../../components/landing-builder/components";

const { Content } = Layout;

type FlowStep = 1 | 2 | 3 | 4; // 4 is success page
type DeviceType = "mobile" | "tablet" | "desktop";

export default function LandingPageView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Get step from URL params or default to 1
  const urlStep = parseInt(searchParams.get("step") || "1") as FlowStep;
  const [currentStep, setCurrentStep] = useState<FlowStep>(urlStep);

  // Device preview state
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  // Fetch landing page data by slug
  const {
    data: landingPage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["landing-page-public", slug],
    queryFn: () => getLandingPageBySlug(slug!),
    enabled: !!slug,
  });

  // Update URL when step changes
  useEffect(() => {
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as FlowStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FlowStep);
    }
  };

  if (isLoading) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  if (error || !landingPage) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="404"
          title="Landing Page Not Found"
          subTitle="Sorry, the landing page you are looking for does not exist."
          icon={<MdError size={64} />}
        />
      </Layout>
    );
  }

  // If page is not published and user is not admin, show error
  if (landingPage.status !== "published" && !isAdmin) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="403"
          title="Page Not Available"
          subTitle="This landing page is not published yet."
        />
      </Layout>
    );
  }

  // Get content for current step
  const getCurrentPageContent = () => {
    switch (currentStep) {
      case 1:
        return landingPage.page_1_content;
      case 2:
        return landingPage.page_2_content;
      case 3:
        return landingPage.page_3_content;
      case 4:
        return null; // Success page
      default:
        return landingPage.page_1_content;
    }
  };

  // Get device dimensions and styles
  const getDeviceConfig = (device: DeviceType) => {
    switch (device) {
      case "mobile":
        return {
          width: 375,
          height: 667,
          scale: 0.8,
          label: "iPhone SE",
        };
      case "tablet":
        return {
          width: 768,
          height: 1024,
          scale: 0.65,
          label: "iPad",
        };
      case "desktop":
        return {
          width: 1440,
          height: 900,
          scale: 0.7,
          label: "Desktop",
        };
    }
  };

  const deviceConfig = getDeviceConfig(deviceType);

  // Get default sections for empty steps
  const getDefaultStepSections = (step: FlowStep) => {
    switch (step) {
      case 1:
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
      case 2:
        return (
          <Element is={Container} padding={0} background="#f5f5f5" canvas>
            <SuccessHeadline />
            <Container background="#ffffff">
              <Element is={TwoColumnLayout} canvas>
                <Element
                  is={Container}
                  background="transparent"
                  canvas
                >
                  <VideoPlayer />
                </Element>
                <Element
                  is={Container}
                  background="transparent"
                  canvas
                >
                  <CountdownTimer />
                  <SalesPageContent />
                </Element>
              </Element>
            </Container>
            <Footer />
          </Element>
        );
      case 3:
        return (
          <Element is={Container} background="#ffffff" canvas>
            <Text text="Step 3: Payment" type="title" level={1} />
            <Text text="Complete your payment to access the course." />
            <BuilderButton
              text="Complete Payment"
              type="primary"
              size="large"
            />
          </Element>
        );
      default:
        return null;
    }
  };

  // Render success page
  if (currentStep === 4) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px",
          }}
        >
          <Result
            status="success"
            icon={<MdCheckCircle size={72} style={{ color: "#52c41a" }} />}
            title="Payment Successful!"
            subTitle={
              landingPage.metadata?.success_message ||
              "Thank you for your purchase! We've sent a confirmation email to your registered email address."
            }
            extra={[
              <AntButton type="primary" key="home" size="large">
                Go to Course
              </AntButton>,
            ]}
          />
        </Content>
      </Layout>
    );
  }

  const pageContent = getCurrentPageContent();

  return (
    <Layout style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Content>
        {/* Draft preview banner for admins */}
        {isAdmin && landingPage.status === "draft" && (
          <Alert
            message="Draft Preview Mode"
            description="You are viewing a draft landing page. This page is not visible to the public yet."
            type="warning"
            showIcon
            banner
            style={{ marginBottom: 0 }}
          />
        )}

        {/* Progress Steps */}
        <div
          style={{
            background: "#fff",
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "300px" }}>
                <Steps
                  current={currentStep - 1}
                  responsive
                  items={[
                    {
                      title: "Information",
                      description: "Your details",
                    },
                    {
                      title: "Course",
                      description: "Review course",
                    },
                    {
                      title: "Payment",
                      description: "Complete purchase",
                    },
                  ]}
                />
              </div>

              {/* Device Selector */}
              <Segmented
                value={deviceType}
                onChange={(value) => setDeviceType(value as DeviceType)}
                options={[
                  {
                    label: (
                      <div
                        style={{
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <MdPhoneIphone size={18} />
                        <span>Mobile</span>
                      </div>
                    ),
                    value: "mobile",
                  },
                  {
                    label: (
                      <div
                        style={{
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <MdTablet size={18} />
                        <span>Tablet</span>
                      </div>
                    ),
                    value: "tablet",
                  },
                  {
                    label: (
                      <div
                        style={{
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <MdLaptop size={18} />
                        <span>Desktop</span>
                      </div>
                    ),
                    value: "desktop",
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Render the page content using Craft.js in view-only mode */}
        <div
          style={{
            background: "#e5e7eb",
            minHeight: "calc(100vh - 180px)",
            padding: "40px 20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* Device Mockup Container */}
          <div
            style={{
              perspective: "2000px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Device Label */}
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {deviceConfig.label} ({deviceConfig.width} × {deviceConfig.height}
              )
            </div>

            {/* Device Frame */}
            <div
              style={{
                width: `${deviceConfig.width}px`,
                transform: `scale(${deviceConfig.scale})`,
                transformOrigin: "top center",
                transition: "all 0.3s ease-in-out",
              }}
            >
              {/* Mockup Frame */}
              <div
                style={{
                  background:
                    deviceType === "mobile"
                      ? "#1f2937"
                      : deviceType === "tablet"
                      ? "#374151"
                      : "#4b5563",
                  borderRadius:
                    deviceType === "desktop"
                      ? "12px"
                      : deviceType === "tablet"
                      ? "24px"
                      : "32px",
                  padding:
                    deviceType === "desktop"
                      ? "20px 20px 60px"
                      : deviceType === "tablet"
                      ? "50px 20px"
                      : "12px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  position: "relative",
                }}
              >
                {/* Mobile notch */}
                {deviceType === "mobile" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "150px",
                      height: "24px",
                      background: "#1f2937",
                      borderRadius: "0 0 16px 16px",
                      zIndex: 10,
                    }}
                  />
                )}

                {/* Tablet home button */}
                {deviceType === "tablet" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      border: "2px solid #6b7280",
                    }}
                  />
                )}

                {/* Screen Content */}
                <div
                  style={{
                    width: "100%",
                    height: `${deviceConfig.height}px`,
                    background: "#ffffff",
                    borderRadius: deviceType === "desktop" ? "8px" : "16px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                    className="landing-builder-content"
                  >
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
                      }}
                      enabled={false}
                    >
                      <Frame
                        key={`step-${currentStep}-${deviceType}`}
                        data={
                          pageContent && Object.keys(pageContent).length > 0
                            ? JSON.stringify(pageContent)
                            : undefined
                        }
                      >
                        {/* Show default content for step if no saved content exists */}
                        {(!pageContent ||
                          Object.keys(pageContent).length === 0) &&
                          getDefaultStepSections(currentStep)}
                      </Frame>
                    </Editor>
                  </div>
                </div>

                {/* Desktop stand */}
                {deviceType === "desktop" && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "200px",
                        height: "8px",
                        background: "#6b7280",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "300px",
                        height: "20px",
                        background: "#4b5563",
                        borderRadius: "0 0 8px 8px",
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
                width: `${deviceConfig.width * deviceConfig.scale}px`,
              }}
            >
              <AntButton
                size="large"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                style={{ minWidth: "120px" }}
              >
                Previous
              </AntButton>
              <AntButton
                type="primary"
                size="large"
                onClick={handleNextStep}
                style={{ minWidth: "120px" }}
              >
                {currentStep === 1
                  ? "Continue to Course"
                  : currentStep === 2
                  ? "Proceed to Payment"
                  : "Complete Payment"}
              </AntButton>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
