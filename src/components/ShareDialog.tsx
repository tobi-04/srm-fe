import React, { useState, useMemo } from "react";
import {
  Modal,
  Tabs,
  Input,
  Button,
  Space,
  Typography,
  message,
  QRCode,
  Card,
} from "antd";
import { MdContentCopy, MdOpenInNew, MdShare } from "react-icons/md";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import { buildShareUrl } from "../utils/trafficSource";

const { Text, Title } = Typography;

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  landingPageSlug?: string;
  landingPageTitle?: string;
}

type SharePlatform = "facebook" | "youtube" | "tiktok";

interface PlatformConfig {
  key: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
  shareUrlTemplate: (url: string) => string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: "facebook",
    label: "Facebook",
    icon: <FaFacebook size={20} />,
    color: "#1877f2",
    shareUrlTemplate: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: <FaYoutube size={20} />,
    color: "#ff0000",
    shareUrlTemplate: (url: string) =>
      `https://www.youtube.com/redirect?q=${encodeURIComponent(url)}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: <FaTiktok size={20} />,
    color: "#000000",
    shareUrlTemplate: (url: string) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(url)}`,
  },
];

export default function ShareDialog({
  open,
  onClose,
  landingPageSlug,
  landingPageTitle,
}: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState<SharePlatform>("facebook");

  // Generate base URL for landing page
  const baseUrl = useMemo(() => {
    if (!landingPageSlug) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/landing/${landingPageSlug}`;
  }, [landingPageSlug]);

  // Generate share URLs for each platform
  const shareUrls = useMemo(() => {
    if (!baseUrl) return {};
    return {
      facebook: buildShareUrl(baseUrl, "facebook", landingPageTitle || "share"),
      youtube: buildShareUrl(baseUrl, "youtube", landingPageTitle || "share"),
      tiktok: buildShareUrl(baseUrl, "tiktok", landingPageTitle || "share"),
    };
  }, [baseUrl, landingPageTitle]);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Đã sao chép link vào clipboard!");
    } catch {
      message.error("Không thể sao chép link");
    }
  };

  const handleOpenShareDialog = (platform: SharePlatform) => {
    const config = PLATFORMS.find((p) => p.key === platform);
    const shareUrl = shareUrls[platform];
    if (config && shareUrl) {
      const shareDialogUrl = config.shareUrlTemplate(shareUrl);
      window.open(shareDialogUrl, "_blank", "width=600,height=400");
    }
  };

  const renderTabContent = (platform: SharePlatform) => {
    const config = PLATFORMS.find((p) => p.key === platform);
    const url = shareUrls[platform] || "";

    if (!config) return null;

    return (
      <div style={{ padding: "16px 0" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Share Link Section */}
          <Card size="small">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Link chia sẻ {config.label}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                  Link này đã được gắn UTM để tracking
                </Text>
              </div>
              <Input.TextArea
                value={url}
                readOnly
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ fontFamily: "monospace", fontSize: 12 }}
              />
              <Space wrap>
                <Button
                  icon={<MdContentCopy />}
                  onClick={() => handleCopyLink(url)}>
                  Sao chép link
                </Button>
                <Button
                  type="primary"
                  icon={<MdOpenInNew />}
                  onClick={() => handleOpenShareDialog(platform)}
                  style={{
                    background: config.color,
                    borderColor: config.color,
                  }}>
                  Chia sẻ lên {config.label}
                </Button>
              </Space>
            </Space>
          </Card>

          {/* QR Code Section */}
          <Card
            size="small"
            title={
              <Space>
                {config.icon}
                <span>Mã QR cho {config.label}</span>
              </Space>
            }>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "16px 0",
              }}>
              <QRCode
                value={url || "https://example.com"}
                size={180}
                color={config.color}
                bordered={false}
              />
            </div>
            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 12,
              }}>
              Quét mã QR để truy cập trực tiếp với UTM tracking
            </Text>
          </Card>

          {/* UTM Parameters Info */}
          <Card size="small" title="Thông tin UTM">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">utm_source:</Text>
                <Text code>{platform}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">utm_medium:</Text>
                <Text code>social</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">utm_campaign:</Text>
                <Text code>{landingPageTitle || "share"}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">utm_content:</Text>
                <Text code>{platform}_share</Text>
              </div>
            </Space>
          </Card>
        </Space>
      </div>
    );
  };

  const tabItems = PLATFORMS.map((platform) => ({
    key: platform.key,
    label: (
      <Space>
        <span style={{ color: platform.color }}>{platform.icon}</span>
        <span>{platform.label}</span>
      </Space>
    ),
    children: renderTabContent(platform.key),
  }));

  return (
    <Modal
      title={
        <Space>
          <MdShare size={20} />
          <span>Chia sẻ Landing Page</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden>
      {!landingPageSlug ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Title level={5} type="secondary">
            Không có landing page để chia sẻ
          </Title>
          <Text type="secondary">
            Vui lòng lưu landing page trước khi chia sẻ.
          </Text>
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as SharePlatform)}
          items={tabItems}
        />
      )}
    </Modal>
  );
}
