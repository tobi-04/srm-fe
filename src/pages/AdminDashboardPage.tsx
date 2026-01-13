import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  Typography,
  Space,
  Tag,
  Button,
} from "antd";
import {
  MdPerson,
  MdShoppingCart,
  MdAttachMoney,
  MdTrendingUp,
  MdNorthEast,
  MdSouthWest,
  MdMoreVert,
  MdLayers,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const statsCards = [
    {
      title: "Total Users",
      value: 2543,
      icon: <MdPerson size={24} color="#6366f1" />,
      trend: <MdNorthEast color="#10b981" />,
      color: "#6366f1",
      change: "+12.5%",
    },
    {
      title: "Total Sales",
      value: 45893,
      icon: <MdAttachMoney size={24} color="#8b5cf6" />,
      trend: <MdNorthEast color="#10b981" />,
      color: "#8b5cf6",
      change: "+8.2%",
      prefix: "$",
    },
    {
      title: "Orders",
      value: 1234,
      icon: <MdShoppingCart size={24} color="#f59e0b" />,
      trend: <MdSouthWest color="#ef4444" />,
      color: "#f59e0b",
      change: "-3.1%",
    },
    {
      title: "Growth",
      value: 23.4,
      icon: <MdTrendingUp size={24} color="#10b981" />,
      trend: <MdNorthEast color="#10b981" />,
      color: "#10b981",
      change: "+5.7%",
      suffix: "%",
    },
  ];

  const recentOrders = [
    {
      key: "1",
      orderId: "#12345",
      customer: "John Doe",
      product: "Premium Package",
      amount: "$299",
      status: "completed",
      date: "2024-01-13",
    },
    {
      key: "2",
      orderId: "#12346",
      customer: "Jane Smith",
      product: "Basic Package",
      amount: "$99",
      status: "pending",
      date: "2024-01-13",
    },
    {
      key: "3",
      orderId: "#12347",
      customer: "Bob Johnson",
      product: "Enterprise Package",
      amount: "$599",
      status: "processing",
      date: "2024-01-12",
    },
    {
      key: "4",
      orderId: "#12348",
      customer: "Alice Brown",
      product: "Premium Package",
      amount: "$299",
      status: "completed",
      date: "2024-01-12",
    },
    {
      key: "5",
      orderId: "#12349",
      customer: "Charlie Wilson",
      product: "Basic Package",
      amount: "$99",
      status: "cancelled",
      date: "2024-01-11",
    },
  ];

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => (
        <Text strong color="#1e293b">
          {text}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (text: string) => (
        <Tag
          style={{
            borderRadius: 6,
            border: "none",
            background: "#f1f5f9",
            color: "#475569",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, { color: string; bg: string }> = {
          completed: { color: "#10b981", bg: "#ecfdf5" },
          pending: { color: "#f59e0b", bg: "#fffbeb" },
          processing: { color: "#6366f1", bg: "#eef2ff" },
          cancelled: { color: "#ef4444", bg: "#fef2f2" },
        };
        const config = colorMap[status] || colorMap.pending;
        return (
          <Tag
            style={{
              color: config.color,
              background: config.bg,
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              padding: "2px 10px",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: "",
      key: "action",
      render: () => <Button type="text" icon={<MdMoreVert size={20} />} />,
    },
  ];

  const topProducts = [
    { name: "Premium Package", sales: 234, progress: 85, color: "#6366f1" },
    { name: "Enterprise Package", sales: 189, progress: 70, color: "#8b5cf6" },
    { name: "Basic Package", sales: 156, progress: 58, color: "#f59e0b" },
    { name: "Starter Package", sales: 98, progress: 35, color: "#10b981" },
  ];

  return (
    <DashboardLayout>
      <Space direction="vertical" size={32} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <Title
              level={2}
              style={{
                marginBottom: 4,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Dashboard Overview
            </Title>
            <Text style={{ color: "#64748b", fontSize: 16 }}>
              Welcome back! Here's what's happening today.
            </Text>
          </div>
          <Button type="primary">Download Report</Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 20,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                }}
                styles={{ body: { padding: "24px" } }}
                className="hover-card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: `${stat.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <Tag
                    style={{
                      borderRadius: 20,
                      border: "none",
                      background: "#f1f5f9",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      margin: 0,
                      height: 28,
                      padding: "0 10px",
                    }}
                  >
                    {stat.trend}
                    <span style={{ fontWeight: 600 }}>{stat.change}</span>
                  </Tag>
                </div>
                <Statistic
                  title={
                    <Text style={{ color: "#64748b", fontWeight: 500 }}>
                      {stat.title}
                    </Text>
                  }
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  valueStyle={{
                    fontWeight: 800,
                    fontSize: 28,
                    color: "#1e293b",
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Text style={{ fontSize: 18, fontWeight: 700 }}>
                  Recent Transactions
                </Text>
              }
              extra={
                <Button
                  type="link"
                  style={{ color: "#6366f1", fontWeight: 600 }}
                >
                  View All
                </Button>
              }
              variant="borderless"
              style={{
                borderRadius: 20,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
              }}
              styles={{ body: { padding: "8px 24px 24px" } }}
            >
              <Table
                dataSource={recentOrders}
                columns={columns}
                pagination={false}
                size="large"
                className="modern-table"
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <Text style={{ fontSize: 18, fontWeight: 700 }}>
                  Top Performance
                </Text>
              }
              variant="borderless"
              style={{
                borderRadius: 20,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <Space direction="vertical" size={24} style={{ width: "100%" }}>
                {topProducts.map((product, index) => (
                  <div key={index}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: product.color,
                          }}
                        />
                        <Text strong style={{ color: "#475569" }}>
                          {product.name}
                        </Text>
                      </div>
                      <Text strong style={{ color: "#1e293b" }}>
                        {product.sales} sales
                      </Text>
                    </div>
                    <Progress
                      percent={product.progress}
                      showInfo={false}
                      strokeColor={product.color}
                      size={{ height: 10 }}
                      style={{ margin: 0 }}
                    />
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 8,
                    padding: 20,
                    borderRadius: 16,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "white",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 14,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Total Target
                  </Text>
                  <Title
                    level={3}
                    style={{ color: "white", margin: 0, fontWeight: 800 }}
                  >
                    $128,430.00
                  </Title>
                  <Progress
                    percent={78}
                    showInfo={false}
                    strokeColor="rgba(255,255,255,0.3)"
                    trailColor="rgba(255,255,255,0.1)"
                    size={{ height: 6 }}
                    style={{ marginTop: 16 }}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>

      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
        }
        .modern-table .ant-table {
          background: transparent;
        }
        .modern-table .ant-table-thead > tr > th {
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f1f5f9;
        }
        .modern-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc;
          padding: 20px 16px !important;
        }
        .modern-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        .header-action-btn:hover {
          background: #f1f5f9 !important;
          color: #4f46e5 !important;
        }
        .ant-table-content::-webkit-scrollbar {
          height: 4px;
        }
        .ant-table-content::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </DashboardLayout>
  );
}
