import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider, Switch, Button as AntButton } from "antd";
import { MdQrCode2, MdDownload } from "react-icons/md";

import { usePaymentData } from "../../../../contexts/PaymentContext";

interface PaymentQRCodeProps {
  // Customizable labels
  bankLabel?: string;
  accountLabel?: string;
  contentLabel?: string;
  amountLabel?: string;

  // QR settings
  qrSize?: number;
  showDownloadButton?: boolean;

  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  bankLabel = "Ngân hàng",
  accountLabel = "Số tài khoản",
  contentLabel = "Nội dung CK",
  amountLabel = "Số tiền",
  qrSize = 300,
  showDownloadButton = true,
  padding = 20,
  marginTop = 0,
  marginBottom = 30,
  maxWidth = 1200,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { transaction } = usePaymentData();

  // Use transaction data if available, otherwise fallback to placeholders (for preview)
  const qrCodeUrl = transaction?.qr_code_url || "";
  const bankAccount = transaction?.bank_account || "2811200440";
  const bankCode = transaction?.bank_code || "MB";
  const bankName = transaction?.bank_name || "";
  const accountName = transaction?.account_name || "";
  const transferContent = transaction?.transfer_code || "ZLP123456";
  const totalAmount = transaction?.amount || 100700;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const displayTransferContent = transferContent.toUpperCase();

  const handleDownloadQR = async () => {
    if (!qrCodeUrl) {
      alert("QR code chưa sẵn sàng");
      return;
    }

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-qr-${displayTransferContent}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download QR code:", error);
      // Fallback to traditional download if fetch fails (e.g. CORS)
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.target = "_blank";
      link.download = `payment-qr-${displayTransferContent}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        border: selected ? "2px dashed #1890ff" : "none",
        textAlign: "center",
        ...style,
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}>
        {/* QR Code */}
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="Payment QR Code"
            style={{
              width: `${qrSize}px`,
              height: `${qrSize}px`,
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
            }}
          />
        ) : (
          <div
            style={{
              width: `${qrSize}px`,
              height: `${qrSize}px`,
              border: "2px dashed #e0e0e0",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#999",
            }}>
            <MdQrCode2 size={64} />
            <p style={{ margin: 0 }}>QR Code sẽ hiển thị sau khi thanh toán</p>
          </div>
        )}

        {/* Download Button */}
        {showDownloadButton && qrCodeUrl && (
          <AntButton
            type="primary"
            icon={<MdDownload />}
            onClick={handleDownloadQR}
            style={{ marginTop: "8px" }}>
            Tải QR Code
          </AntButton>
        )}

        {/* Amount */}
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}>
          {amountLabel}: {formatCurrency(totalAmount)}
        </div>

        {/* Bank Info */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "400px",
          }}>
          <div style={{ marginBottom: "8px", textAlign: "left" }}>
            <strong>{bankLabel}:</strong> {bankName || bankCode}{" "}
            {bankName ? `(${bankCode})` : ""}
          </div>
          <div style={{ marginBottom: "8px", textAlign: "left" }}>
            <strong>{accountLabel}:</strong> {bankAccount}
          </div>
          {accountName && (
            <div style={{ marginBottom: "8px", textAlign: "left" }}>
              <strong>Chủ tài khoản:</strong> {accountName}
            </div>
          )}
          <div style={{ textAlign: "left" }}>
            <strong>{contentLabel}:</strong>{" "}
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              {displayTransferContent}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentQRCodeSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Label: Ngân hàng">
        <Input
          value={props.bankLabel}
          onChange={(e) =>
            setProp((props: any) => (props.bankLabel = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Label: Số tài khoản">
        <Input
          value={props.accountLabel}
          onChange={(e) =>
            setProp((props: any) => (props.accountLabel = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Label: Nội dung CK">
        <Input
          value={props.contentLabel}
          onChange={(e) =>
            setProp((props: any) => (props.contentLabel = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Label: Số tiền">
        <Input
          value={props.amountLabel}
          onChange={(e) =>
            setProp((props: any) => (props.amountLabel = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Kích thước QR (px)">
        <Slider
          min={100}
          max={500}
          value={props.qrSize}
          onChange={(value) => setProp((props: any) => (props.qrSize = value))}
        />
      </Form.Item>
      <Form.Item label="Hiển thị nút tải QR">
        <Switch
          checked={props.showDownloadButton}
          onChange={(checked) =>
            setProp((props: any) => (props.showDownloadButton = checked))
          }
        />
      </Form.Item>
      <Form.Item label={`Padding (${props.padding}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.padding}
          onChange={(value) => setProp((props: any) => (props.padding = value))}
        />
      </Form.Item>
      <Form.Item label={`Max Width (${props.maxWidth}px)`}>
        <Slider
          min={400}
          max={2000}
          value={props.maxWidth}
          onChange={(value) =>
            setProp((props: any) => (props.maxWidth = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Top (${props.marginTop}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.marginTop}
          onChange={(value) =>
            setProp((props: any) => (props.marginTop = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Bottom (${props.marginBottom}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.marginBottom}
          onChange={(value) =>
            setProp((props: any) => (props.marginBottom = value))
          }
        />
      </Form.Item>
    </Form>
  );
};

(PaymentQRCode as any).craft = {
  displayName: "Payment QR Code",
  props: {
    bankLabel: "Ngân hàng",
    accountLabel: "Số tài khoản",
    contentLabel: "Nội dung CK",
    amountLabel: "Số tiền",
    qrSize: 300,
    showDownloadButton: true,
    padding: 20,
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 1200,
  },
  related: {
    toolbar: PaymentQRCodeSettings,
  },
};
