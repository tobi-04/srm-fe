import { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout, Spin, Result, Button as AntButton, message } from "antd";
import { MdError, MdCheckCircle } from "react-icons/md";
import { getLandingPageBySlug } from "../../api/landingPage";
import { getPaymentTransaction } from "../../api/paymentTransaction";
import { useAuthStore } from "../../stores/authStore";
import { usePaymentData, PaymentProvider } from "../../contexts/PaymentContext";
import { LandingPageRenderer } from "./LandingPageRenderer";
import { Alert } from "antd";

const { Content } = Layout;

type FlowStep = 1 | 2 | 3 | 4; // 4 is success page

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
  const { data: transaction, error: transactionError } = useQuery({
    queryKey: ["payment-transaction", txId],
    queryFn: () => getPaymentTransaction(txId!),
    enabled: !!txId && urlStep === 3,
    refetchInterval: 5000, // Poll every 5 seconds
    retry: false, // Don't retry on enrollment error
  });

  // Handle auto-redirect when payment is completed or already enrolled
  useEffect(() => {
    // Check for enrollment error from query
    const errorMessage = (transactionError as any)?.response?.data?.message;
    if (errorMessage === "ALREADY_ENROLLED" && landingPage) {
      message.info("Bạn đã sở hữu khóa học này!");
      const courseId =
        typeof landingPage.course_id === "object"
          ? landingPage.course_id._id
          : landingPage.course_id;
      navigate(`/login?from=/learn/${courseId}`);
      return;
    }

    if (urlStep === 3 && transaction?.status === "completed") {
      message.success("Thanh toán đã được xác nhận!");
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("step", "4");
          // Ensure ref is preserved if present
          const ref = prev.get("ref");
          if (ref) next.set("ref", ref);
          return next;
        },
        { replace: true },
      );
    }
  }, [
    transaction?.status,
    transactionError,
    urlStep,
    setSearchParams,
    landingPage,
    navigate,
  ]);

  // Update URL to ensure step is present but avoid loops
  useEffect(() => {
    // Force step 2 for books/indicators flow if landing on default
    if (
      landingPage &&
      (landingPage.resource_type === "book" ||
        landingPage.book_id ||
        landingPage.resource_type === "indicator" ||
        landingPage.indicator_id) &&
      urlStep !== 2
    ) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("step", "2");
          // Ensure ref is preserved if present
          const ref = prev.get("ref");
          if (ref) next.set("ref", ref);
          return next;
        },
        { replace: true },
      );
      return;
    }

    if (!searchParams.has("step")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("step", "1");
          // Ensure ref is preserved if present
          const ref = prev.get("ref");
          if (ref) next.set("ref", ref);
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams, landingPage, urlStep]);

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
        }}
      >
        <Result
          status="403"
          title="Trang không khả dụng"
          subTitle="Landing page này chưa được xuất bản."
        />
      </Layout>
    );
  }

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
          }}
        >
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
                }}
              >
                ĐĂNG NHẬP & HỌC NGAY
              </AntButton>,
            ]}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <PaymentProvider>
      <PaymentDataInitializer transaction={transaction}>
        <LandingPageRenderer
          landingPage={landingPage}
          urlStep={urlStep}
          isAdmin={isAdmin}
        />
      </PaymentDataInitializer>
    </PaymentProvider>
  );
}

// Helper component to initialize payment data in context
// Reusing locally here as it's specific to this PAGE's data flow
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
