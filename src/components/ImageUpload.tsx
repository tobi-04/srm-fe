import React, { useState } from "react";
import { Upload, Button, message, Input, Space, Image } from "antd";
import {
  UploadOutlined,
  LinkOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { uploadApi, UploadFolder } from "../api/uploadApi";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  folder?: UploadFolder;
  placeholder?: string;
}

/**
 * ImageUpload component - supports both R2 upload and URL paste
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = "covers",
  placeholder = "https://example.com/image.jpg",
}) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;

    setUploading(true);
    try {
      const result = await uploadApi.uploadImage(file as File, folder);
      onChange?.(result.url);
      onSuccess?.(result);
      message.success("Upload thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(error.response?.data?.message || "Upload thất bại");
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      message.warning("Vui lòng nhập URL ảnh");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      onChange?.(urlInput.trim());
      setUrlInput("");
      message.success("Đã cập nhật URL ảnh");
    } catch {
      message.error("URL không hợp lệ");
    }
  };

  const handleClear = () => {
    onChange?.("");
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Mode Toggle */}
      <Space style={{ marginBottom: 12 }}>
        <Button
          size="small"
          type={mode === "upload" ? "primary" : "default"}
          onClick={() => setMode("upload")}
          icon={<UploadOutlined />}
        >
          Upload
        </Button>
        <Button
          size="small"
          type={mode === "url" ? "primary" : "default"}
          onClick={() => setMode("url")}
          icon={<LinkOutlined />}
        >
          Dán Link
        </Button>
      </Space>

      {/* Upload Mode */}
      {mode === "upload" && (
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={handleUpload}
          disabled={uploading}
        >
          <Button
            icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
            loading={uploading}
            style={{ width: "100%" }}
          >
            {uploading ? "Đang upload..." : "Chọn ảnh từ máy"}
          </Button>
        </Upload>
      )}

      {/* URL Mode */}
      {mode === "url" && (
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder={placeholder}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onPressEnter={handleUrlSubmit}
          />
          <Button type="primary" onClick={handleUrlSubmit}>
            Áp dụng
          </Button>
        </Space.Compact>
      )}

      {/* Preview */}
      {value && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Ảnh hiện tại:
            </span>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClear}
            >
              Xóa
            </Button>
          </div>
          <Image
            src={value}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: 200,
              objectFit: "contain",
              borderRadius: 4,
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANHSURBVHic7dZBDgAgCEPR3v/Q6CLGxSL0XxYkkKoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/7Hag3J8xgE4SXsJoEMEgY4IBJ2rPSgHIGD3IJzYPQgndg/Cid2DcGL3IJzYPQgndg/Cid2DcGL3IJzYPQgndg/Cid2DcGL3IJzYPQgndg/Cid2DcGL3IJzYPQgndg8C/+gCAAAAAAAAAGB/LQD+2wUAAAAAAAAAAAAAALBpAfZZCmD3AAAAAElFTkSuQmCC"
          />
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "#94a3b8",
              wordBreak: "break-all",
            }}
          >
            {value}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
