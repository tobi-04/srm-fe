import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  message,
  Modal,
} from "antd";
import { MdTableChart, MdSave, MdSettings } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import GoogleSheetEmbed from "../components/GoogleSheetEmbed";

const { Title, Text } = Typography;

// LocalStorage key for persisting the Google Sheet URL
const STORAGE_KEY = "googleSheetUrl";

/**
 * GoogleSheetPage
 *
 * Admin page for embedding Google Sheets directly into the dashboard
 * Features:
 * - Input field for Google Sheet URL
 * - URL validation (must contain docs.google.com/spreadsheets)
 * - localStorage persistence
 * - Iframe rendering of the sheet
 * - Compact settings button when URL is configured
 */
export default function GoogleSheetPage() {
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load saved URL from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedUrl(stored);
      setUrl(stored);
    }
  }, []);

  /**
   * Validates if the URL is a valid Google Sheets URL
   */
  const isValidGoogleSheetUrl = (urlToValidate: string): boolean => {
    return urlToValidate.includes("docs.google.com/spreadsheets");
  };

  /**
   * Handles saving the Google Sheet URL
   * - Validates the URL
   * - Saves to localStorage
   * - Updates the iframe
   */
  const handleSave = () => {
    setError("");

    // Validate URL is not empty
    if (!url.trim()) {
      setError("Vui lòng nhập URL Google Sheet");
      return;
    }

    // Validate URL is a Google Sheets URL
    if (!isValidGoogleSheetUrl(url)) {
      setError(
        "URL không hợp lệ. Vui lòng nhập link Google Sheet (phải chứa docs.google.com/spreadsheets)",
      );
      return;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, url);
    setSavedUrl(url);
    setIsModalOpen(false);
    message.success("Đã lưu và hiển thị Google Sheet!");
  };

  /**
   * Configuration form component (used in both inline and modal)
   */
  const ConfigForm = () => (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div>
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          URL Google Sheet
        </Text>
        <Text
          type="secondary"
          style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
          Lưu ý: Google Sheet phải được chia sẻ công khai hoặc "Mọi người có
          link đều có thể xem"
        </Text>
        <Input
          placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPressEnter={handleSave}
          size="large"
          status={error ? "error" : ""}
        />
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError("")}
        />
      )}

      <Button
        type="primary"
        icon={<MdSave />}
        onClick={handleSave}
        size="large"
        block>
        Lưu & Hiển thị
      </Button>
    </Space>
  );

  return (
    <DashboardLayout>
      <div>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <div>
              <Title
                level={2}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                <MdTableChart size={32} style={{ color: "#f78404" }} />
                Google Sheet
              </Title>
              <Text type="secondary">
                Nhúng Google Sheet trực tiếp vào trang quản trị để xem và nhập
                dữ liệu
              </Text>
            </div>

            {/* Show settings button only when URL is already configured */}
            {savedUrl && (
              <Button
                icon={<MdSettings size={20} />}
                onClick={() => setIsModalOpen(true)}
                size="large"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                Cài đặt
              </Button>
            )}
          </div>

          {/* Show config form only when no URL is saved yet */}
          {!savedUrl && (
            <Card>
              <ConfigForm />
            </Card>
          )}
        </Space>

        {/* Render the embedded Google Sheet if URL is saved */}
        <GoogleSheetEmbed url={savedUrl} />

        {/* Settings Modal - shown when user clicks settings button */}
        <Modal
          title="Cài đặt Google Sheet"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setError("");
          }}
          footer={null}
          width={600}>
          <ConfigForm />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
