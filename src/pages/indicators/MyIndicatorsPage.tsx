import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Tag,
  Space,
  Button,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MdShowChart } from "react-icons/md";
import { indicatorApi, IndicatorSubscription } from "../../api/indicatorApi";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MyIndicatorsPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: () =>
      indicatorApi.getMySubscriptions().then((res: any) => res.data),
  });

  const getStatusTag = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đang thuê
          </Tag>
        );
      case "EXPIRED":
        return (
          <Tag color="error" icon={<ClockCircleOutlined />}>
            Hết hạn
          </Tag>
        );
      case "CANCELLED":
        return <Tag color="default">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "24px 32px" }}>
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Indicator của tôi
          </Title>
          <Text type="secondary">
            Quản lý các Indicator bạn đang thuê và xem thông tin liên hệ
          </Text>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : !subscriptions || subscriptions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Bạn chưa thuê Indicator nào"
            style={{ padding: 80 }}
          >
            <Button type="primary" onClick={() => navigate("/indicators")}>
              Khám phá Indicators
            </Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {subscriptions.map((sub: IndicatorSubscription) => (
              <Col xs={24} md={12} lg={8} key={sub._id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                  cover={
                    <div
                      style={{
                        height: 140,
                        background:
                          "linear-gradient(135deg, #f7840420, #fb9d1420)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {sub.indicator.cover_image ? (
                        <img
                          src={sub.indicator.cover_image}
                          alt={sub.indicator.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <MdShowChart
                          style={{
                            fontSize: 48,
                            color: "#f78404",
                            opacity: 0.6,
                          }}
                        />
                      )}
                      <div style={{ position: "absolute", top: 12, right: 12 }}>
                        {getStatusTag(sub.status)}
                      </div>
                    </div>
                  }
                >
                  <Title level={5} style={{ marginBottom: 8 }}>
                    {sub.indicator.name}
                  </Title>

                  <Space size="small" style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Hết hạn:{" "}
                      {sub.end_at
                        ? dayjs(sub.end_at).format("DD/MM/YYYY")
                        : "N/A"}
                    </Text>
                    {sub.auto_renew && (
                      <Tag color="blue" style={{ fontSize: 11 }}>
                        Tự động gia hạn
                      </Tag>
                    )}
                  </Space>

                  {sub.status === "ACTIVE" && (
                    <>
                      <Divider style={{ margin: "12px 0" }} />
                      <Text
                        strong
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Thông tin liên hệ:
                      </Text>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        {sub.indicator.owner_name && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <UserOutlined style={{ color: "#f78404" }} />
                            <Text>{sub.indicator.owner_name}</Text>
                          </div>
                        )}
                        {sub.indicator.contact_email && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <MailOutlined style={{ color: "#f78404" }} />
                            <Text copyable style={{ fontSize: 13 }}>
                              {sub.indicator.contact_email}
                            </Text>
                          </div>
                        )}
                        {sub.indicator.contact_telegram && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <MessageOutlined style={{ color: "#f78404" }} />
                            <Text copyable style={{ fontSize: 13 }}>
                              {sub.indicator.contact_telegram}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </>
                  )}

                  <Button
                    type="link"
                    block
                    style={{ marginTop: 16 }}
                    onClick={() =>
                      navigate(`/indicators/${sub.indicator.slug}`)
                    }
                  >
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyIndicatorsPage;
