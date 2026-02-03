import { useNode, useEditor } from "@craftjs/core";
import {
  Button,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  Form,
  Input,
} from "antd";
import { Text } from "./";
import { useLandingPageData } from "../../../contexts/LandingPageContext";
import { ThunderboltOutlined, LineChartOutlined } from "@ant-design/icons";

const { Title } = Typography;

// Indicator Hero Component - Defaults to showing indicator info
export const IndicatorHero = ({ ...props }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const { landingPage } = useLandingPageData();

  // Safe extraction of indicator data
  const indicator =
    landingPage &&
    (landingPage.resource_type === "indicator" || landingPage.indicator_id) &&
    typeof landingPage.indicator_id === "object"
      ? landingPage.indicator_id
      : null;

  if (!indicator) {
    return (
      <div
        ref={(ref) => connect(drag(ref!))}
        style={{ padding: 20, textAlign: "center", background: "#fff" }}
      >
        <Text text="Indicator details will appear here in published mode" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      style={{
        background: props.background || "#ffffff",
        padding: props.padding || "40px 20px",
      }}
    >
      <Row
        gutter={[32, 32]}
        align="middle"
        justify="center"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <Col xs={24} md={10} style={{ textAlign: "center" }}>
          {indicator.cover_image ? (
            <img
              src={indicator.cover_image}
              alt={indicator.name}
              style={{
                maxWidth: "100%",
                maxHeight: 500,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                borderRadius: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 300,
                height: 450,
                background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                borderRadius: 8,
              }}
            >
              <LineChartOutlined style={{ fontSize: 60, color: "#fff" }} />
            </div>
          )}
        </Col>
        <Col xs={24} md={14}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Tag color="purple" style={{ fontSize: 14, padding: "4px 10px" }}>
                <ThunderboltOutlined /> INDICATOR
              </Tag>
              <Title
                level={1}
                style={{ marginTop: 16, marginBottom: 8, fontSize: 42 }}
              >
                {indicator.name}
              </Title>
              <Text
                text={
                  indicator.description ||
                  "Indicator chuyên nghiệp giúp bạn phân tích thị trường hiệu quả..."
                }
                customCSS={{ fontSize: 18, color: "#555" }}
              />
            </div>

            <Divider />

            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span
                style={{ fontSize: 36, fontWeight: "bold", color: "#722ed1" }}
              >
                {formatPrice(indicator.price_monthly)}
              </span>
              <span style={{ fontSize: 18, color: "#999" }}>/tháng</span>
            </div>

            <IndicatorCheckoutButton />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

IndicatorHero.craft = {
  displayName: "Indicator Hero Section",
  props: {
    background: "#ffffff",
    padding: "40px 20px",
  },
  rules: {
    canDrag: true,
    canDrop: true,
    canDelete: true,
  },
};

// Start: Indicator Checkout Button Settings
const IndicatorCheckoutButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Button Text">
        <Input
          value={props.text}
          onChange={(e) =>
            setProp((props: any) => (props.text = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Background Color">
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            type="color"
            value={props.buttonBgColor}
            onChange={(e) =>
              setProp((props: any) => (props.buttonBgColor = e.target.value))
            }
            style={{ width: "40px", padding: 0 }}
          />
          <Input
            value={props.buttonBgColor}
            onChange={(e) =>
              setProp((props: any) => (props.buttonBgColor = e.target.value))
            }
          />
        </div>
      </Form.Item>
      <Form.Item label="Text Color">
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            type="color"
            value={props.textColor}
            onChange={(e) =>
              setProp((props: any) => (props.textColor = e.target.value))
            }
            style={{ width: "40px", padding: 0 }}
          />
          <Input
            value={props.textColor}
            onChange={(e) =>
              setProp((props: any) => (props.textColor = e.target.value))
            }
          />
        </div>
      </Form.Item>
      <Form.Item label="Border Color">
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            type="color"
            value={props.borderColor}
            onChange={(e) =>
              setProp((props: any) => (props.borderColor = e.target.value))
            }
            style={{ width: "40px", padding: 0 }}
          />
          <Input
            value={props.borderColor}
            onChange={(e) =>
              setProp((props: any) => (props.borderColor = e.target.value))
            }
          />
        </div>
      </Form.Item>
    </Form>
  );
};

// Start: Indicator Checkout Button
export const IndicatorCheckoutButton = ({ ...props }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Get editor enabled state (true = edit mode)
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { setPurchaseModalOpen } = useLandingPageData();

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      style={{
        width: "100%",
        padding: "10px 0",
        ...props.style,
      }}
    >
      <Button
        type="primary"
        size="large"
        block
        onClick={() => setPurchaseModalOpen && setPurchaseModalOpen(true)}
        style={{
          height: "40px",
          fontWeight: 600,
          backgroundColor: props.buttonBgColor,
          borderColor: props.borderColor,
          color: props.textColor,
          pointerEvents: enabled ? "none" : "auto", // Fix selection in edit mode
        }}
        icon={<ThunderboltOutlined />}
      >
        {props.text || "THUÊ NGAY"}
      </Button>
    </div>
  );
};

IndicatorCheckoutButton.craft = {
  displayName: "Nút Thuê Indicator",
  props: {
    text: "THUÊ NGAY",
    background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
    buttonBgColor: undefined, // undefined means use default/theme
    textColor: undefined,
    borderColor: undefined,
  },
  rules: {
    canDrag: true,
    canDelete: false, // MANDATORY: Cannot be deleted
  },
  related: {
    settings: IndicatorCheckoutButtonSettings,
  },
};
