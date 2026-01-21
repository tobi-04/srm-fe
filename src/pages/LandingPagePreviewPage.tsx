import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Button,
  Space,
  Spin,
  Typography,
  Segmented,
  Steps,
  Tooltip,
} from "antd";
import {
  MdArrowBack,
  MdDesktopWindows,
  MdTabletMac,
  MdPhoneIphone,
  MdOpenInNew,
  MdEdit,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import { getLandingPageById } from "../api/landingPage";

const { Title, Text } = Typography;

type DeviceType = "desktop" | "tablet" | "mobile";
type StepType = 1 | 2 | 3;

const DEVICE_SIZES: Record<
  DeviceType,
  { width: number; height: number; label: string }
> = {
  desktop: { width: 1200, height: 800, label: "Desktop" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  mobile: { width: 375, height: 667, label: "Mobile" },
};

const STEP_INFO: Record<StepType, { title: string; description: string }> = {
  1: { title: "Bước 1", description: "Form thông tin" },
  2: { title: "Bước 2", description: "Trang bán hàng" },
  3: { title: "Bước 3", description: "Thanh toán" },
};

export default function LandingPagePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [currentStep, setCurrentStep] = useState<StepType>(1);

  // Fetch landing page data
  const { data: landingPage, isLoading } = useQuery({
    queryKey: ["landing-page", id],
    queryFn: () => getLandingPageById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const deviceConfig = DEVICE_SIZES[device];
  const iframeUrl = landingPage?.slug
    ? `/landing/${landingPage.slug}?step=${currentStep}&preview=true`
    : "";

  return (
    <DashboardLayout>
      <div
        style={{
          height: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Control Bar */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {/* Left: Back button and title */}
            <Space>
              <Button
                icon={<MdArrowBack />}
                onClick={() => navigate(`/admin/landing-builder/${id}`)}
              >
                Quay lại Builder
              </Button>
              <Title level={5} style={{ margin: 0 }}>
                Xem trước: {landingPage?.title}
              </Title>
            </Space>

            {/* Center: Step selector */}
            <Steps
              current={currentStep - 1}
              size="small"
              onChange={(step) => setCurrentStep((step + 1) as StepType)}
              style={{ maxWidth: 500 }}
              items={[
                {
                  title: STEP_INFO[1].title,
                  description: STEP_INFO[1].description,
                },
                {
                  title: STEP_INFO[2].title,
                  description: STEP_INFO[2].description,
                },
                {
                  title: STEP_INFO[3].title,
                  description: STEP_INFO[3].description,
                },
              ]}
            />

            {/* Right: Device selector and actions */}
            <Space>
              <Segmented
                value={device}
                onChange={(value) => setDevice(value as DeviceType)}
                options={[
                  {
                    value: "desktop",
                    icon: (
                      <Tooltip title="Desktop (1200px)">
                        <MdDesktopWindows size={18} />
                      </Tooltip>
                    ),
                  },
                  {
                    value: "tablet",
                    icon: (
                      <Tooltip title="Tablet (768px)">
                        <MdTabletMac size={18} />
                      </Tooltip>
                    ),
                  },
                  {
                    value: "mobile",
                    icon: (
                      <Tooltip title="Mobile (375px)">
                        <MdPhoneIphone size={18} />
                      </Tooltip>
                    ),
                  },
                ]}
              />
              <Button
                icon={<MdEdit />}
                onClick={() => navigate(`/admin/landing-builder/${id}`)}
              >
                Chỉnh sửa
              </Button>
              <Button
                icon={<MdOpenInNew />}
                onClick={() => {
                  if (landingPage?.slug) {
                    window.open(`/landing/${landingPage.slug}`, "_blank");
                  }
                }}
              >
                Mở tab mới
              </Button>
            </Space>
          </div>
        </Card>

        {/* Preview Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            background: "#e8e8e8",
            padding: 24,
            overflow: "auto",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              borderRadius: device === "mobile" ? 24 : 8,
              overflow: "hidden",
              transition: "all 0.3s ease",
              position: "relative",
            }}
          >
            {/* Device frame indicator */}
            <div
              style={{
                background: "#333",
                padding: "8px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {deviceConfig.label} - {deviceConfig.width}×
                {deviceConfig.height}px
              </Text>
              <Text style={{ color: "#888", fontSize: 11 }}>
                {STEP_INFO[currentStep].title}:{" "}
                {STEP_INFO[currentStep].description}
              </Text>
            </div>

            {/* Iframe */}
            <iframe
              src={iframeUrl}
              title="Landing Page Preview"
              style={{
                width: deviceConfig.width,
                height: deviceConfig.height,
                border: "none",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
