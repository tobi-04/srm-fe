import { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Editor, Frame, Element } from "@craftjs/core";
import {
  Layout,
  Spin,
  Result,
  Alert,
  Button as AntButton,
  message,
} from "antd";
import { MdError, MdCheckCircle } from "react-icons/md";
import { getLandingPageBySlug } from "../../api/landingPage";
import { getPaymentTransaction } from "../../api/paymentTransaction";
import { useAuthStore } from "../../stores/authStore";
import { CountdownProvider } from "../../contexts/CountdownContext";
import { PaymentProvider, usePaymentData } from "../../contexts/PaymentContext";
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
} from "../../components/landing-builder/components";

import { LandingPageProvider } from "../../contexts/LandingPageContext";

const { Content } = Layout;

type FlowStep = 1 | 2 | 3 | 4; // 4 is success page

const CRAFT_RESOLVER = {
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
};

export default function LandingPageView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const txId = searchParams.get("tx");

  // Get step from URL params or default to 1 (Single source of truth)
  const urlStep = parseInt(searchParams.get("step") || "1") as FlowStep;

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

  // Fetch transaction if in step 3
  const { data: transaction } = useQuery({
    queryKey: ["payment-transaction", txId],
    queryFn: () => getPaymentTransaction(txId!),
    enabled: !!txId && urlStep === 3,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Handle auto-redirect when payment is completed
  useEffect(() => {
    if (urlStep === 3 && transaction?.status === "completed") {
      message.success("Thanh toán đã được xác nhận!");
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("step", "4");
          return next;
        },
        { replace: true },
      );
    }
  }, [transaction?.status, urlStep, setSearchParams]);

  // Update URL to ensure step is present but avoid loops
  useEffect(() => {
    if (!searchParams.has("step")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("step", "1");
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
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
        }}>
        <Result
          status="404"
          title="Không tìm thấy Landing Page"
          subTitle="Xin lỗi, landing page bạn đang tìm kiếm không tồn tại."
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
        }}>
        <Result
          status="403"
          title="Trang không khả dụng"
          subTitle="Landing page này chưa được xuất bản."
        />
      </Layout>
    );
  }

  // Get content for current step
  const getCurrentPageContent = () => {
    switch (urlStep) {
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

  // Get default sections for empty steps
  const getDefaultStepSections = (step: FlowStep) => {
    switch (step) {
      case 1:
        return (
          <Element is={Container} background="#ffffff" canvas>
            <Element is={Header} />
            <Element is={Headline} />
            <Element is={Subtitle} />
            <Element is={UserForm} />
            <Element is={InstructorBio} />
            <Element is={Footer} />
          </Element>
        );
      case 2:
        return (
          <Element is={Container} background="#f5f5f5" canvas>
            <Element is={SuccessHeadline} />
            <Element is={Container} background="#ffffff" canvas>
              <Element is={TwoColumnLayout} canvas>
                <Element is={Container} background="transparent" canvas>
                  <Element is={VideoPlayer} />
                </Element>
                <Element is={Container} background="transparent" canvas>
                  <Element is={CountdownTimer} />
                  <Element is={SalesPageContent} />
                </Element>
              </Element>
            </Element>
            <Element is={Footer} />
          </Element>
        );
      case 3:
        return (
          <Element is={Container} background="#f5f5f5" canvas>
            <Element is={Header} />
            <div
              style={{
                padding: "40px 20px",
                maxWidth: "800px",
                margin: "0 auto",
              }}>
              <Element
                is={Text}
                text="Hoàn tất Thanh toán"
                type="title"
                level={1}
              />
              <Element is={Container} background="#ffffff" canvas>
                <Element is={PaymentQRCode} />
                <Element is={PaymentInfo} />
              </Element>
              <Element is={PaymentStatus} />
            </div>
            <Element is={Footer} />
          </Element>
        );
      default:
        return null;
    }
  };

  // Render success page
  if (urlStep === 4) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Content
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px",
          }}>
          <Result
            status="success"
            icon={<MdCheckCircle size={72} style={{ color: "#52c41a" }} />}
            title="Thanh toán thành công!"
            subTitle={
              <div style={{ textAlign: "center" }}>
                <p>
                  {landingPage.metadata?.success_message ||
                    "Cảm ơn bạn đã mua hàng! Giao dịch của bạn đã được xác nhận thành công."}
                </p>
                <Alert
                  type="info"
                  message="Thông tin đăng nhập"
                  description={
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: "4px 0" }}>
                        1. Chúng tôi đã gửi <b>Email tài khoản & Mật khẩu</b>{" "}
                        đến địa chỉ bạn đã đăng ký.
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        2. Vui lòng kiểm tra kỹ cả hộp thư <b>Spam (Thư rác)</b>{" "}
                        nếu không thấy ở hộp thư đến.
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        3. Nhấn nút bên dưới để đăng nhập và bắt đầu học ngay.
                      </p>
                    </div>
                  }
                  showIcon
                />
              </div>
            }
            extra={[
              <AntButton
                type="primary"
                key="home"
                size="large"
                style={{
                  height: "50px",
                  padding: "0 40px",
                  fontSize: "18px",
                  borderRadius: "8px",
                  background: "#f78404",
                  border: "none",
                }}
                onClick={() => {
                  const courseId =
                    typeof landingPage.course_id === "object"
                      ? landingPage.course_id._id
                      : landingPage.course_id;
                  navigate(`/login?from=/learn/${courseId}`);
                }}>
                ĐĂNG NHẬP & HỌC NGAY
              </AntButton>,
            ]}
          />
        </Content>
      </Layout>
    );
  }

  const pageContent = getCurrentPageContent();
  const hasContent =
    pageContent &&
    typeof pageContent === "object" &&
    Object.keys(pageContent).length > 0;

  return (
    <CountdownProvider>
      <LandingPageProvider landingPage={landingPage}>
        <PaymentProvider>
          <PaymentDataInitializer transaction={transaction}>
            <Layout style={{ minHeight: "100vh", background: "#ffffff" }}>
              <Content>
                {/* Draft preview banner for admins */}
                {isAdmin && landingPage.status === "draft" && (
                  <Alert
                    message="Chế độ xem trước bản nháp"
                    description="Bạn đang xem landing page bản nháp. Trang này chưa hiển thị công khai."
                    type="warning"
                    showIcon
                    banner
                    style={{ marginBottom: 0 }}
                  />
                )}

                {/* Render the page content using Craft.js in view-only mode */}
                <div
                  style={{
                    background: "#fff",
                    minHeight: "100vh",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}>
                  <div
                    style={{ width: "100%" }}
                    className="landing-builder-content">
                    <Editor resolver={CRAFT_RESOLVER} enabled={false}>
                      <Frame
                        key={`step-${urlStep}`}
                        data={
                          hasContent ? JSON.stringify(pageContent) : undefined
                        }>
                        {!hasContent && getDefaultStepSections(urlStep)}
                      </Frame>
                    </Editor>
                  </div>
                </div>
              </Content>
            </Layout>
          </PaymentDataInitializer>
        </PaymentProvider>
      </LandingPageProvider>
    </CountdownProvider>
  );
}

// Helper component to initialize payment data in context
function PaymentDataInitializer({
  transaction,
  children,
}: {
  transaction: any;
  children: React.ReactNode;
}) {
  const { setTransaction } = usePaymentData();

  useEffect(() => {
    if (transaction) {
      setTransaction(transaction);
    }
  }, [transaction, setTransaction]);

  return <>{children}</>;
}
