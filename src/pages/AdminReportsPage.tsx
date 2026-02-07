import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Select,
  DatePicker,
  Space,
  message,
  Typography,
  Spin,
  Tag,
  Statistic,
  Row,
  Col,
} from "antd";
import { DownloadOutlined, ReloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import DashboardLayout from "../components/DashboardLayout";
import apiClient, { clearApiCache } from "../api/client";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

enum TimeRange {
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  ALL = "all",
  CUSTOM = "custom",
}

interface ReportRow {
  invoiceNumber: number;
  invoiceDate: string;
  customerName: string;
  address: string;
  taxCode: string;
  email: string;
  paymentMethod: string;
  vatRate: string;
  vatAmount: string;
  productName: string;
  unit: string;
  quantity: number;
  amount: number;
  productType: "COURSE" | "BOOK" | "INDICATOR";
}

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.ALL); // Đổi từ MONTH sang ALL
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Clear cache when component mounts
  useEffect(() => {
    clearApiCache();
  }, []);

  // Fetch report data for table preview
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-reports", timeRange, dateRange],
    queryFn: async () => {
      const params: any = { range: timeRange };

      if (timeRange === TimeRange.CUSTOM && dateRange) {
        params.from = dateRange[0].format("YYYY-MM-DD");
        params.to = dateRange[1].format("YYYY-MM-DD");
      }

      // Clear cache before fetching to ensure fresh data
      clearApiCache();

      const response = await apiClient.get("/admin/reports", { params });
      return response.data;
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params: any = { range: timeRange };

      if (timeRange === TimeRange.CUSTOM && dateRange) {
        params.from = dateRange[0].format("YYYY-MM-DD");
        params.to = dateRange[1].format("YYYY-MM-DD");
      }

      // Clear cache
      clearApiCache();

      // Download file
      const response = await apiClient.get("/admin/reports/export", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from header hoặc tạo default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `report-${dayjs().format("YYYYMMDD-HHmmss")}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`Đã xuất ${data?.total || 0} bản ghi thành công!`);
    } catch (error: any) {
      console.error("Export failed:", error);
      message.error(error.response?.data?.message || "Lỗi khi xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 70,
      align: "center" as const,
    },
    {
      title: "Ngày hóa đơn",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      width: 160,
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Sản phẩm/Dịch vụ",
      dataIndex: "productName",
      key: "productName",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "productType",
      key: "productType",
      width: 100,
      render: (type: string) => {
        const colors: Record<string, string> = {
          COURSE: "blue",
          BOOK: "green",
          INDICATOR: "purple",
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: "ĐVT",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 60,
      align: "center" as const,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right" as const,
      render: (amount: number) => (
        <Text strong>{amount.toLocaleString("vi-VN")}đ</Text>
      ),
    },
    {
      title: "HT thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
    },
  ];

  const reportRows: ReportRow[] = data?.data || [];
  const totalAmount = reportRows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <DashboardLayout>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <FileExcelOutlined /> Báo cáo đơn hàng
          </Title>
          <Text type="secondary">
            Xuất báo cáo Excel cho tất cả đơn hàng đã thanh toán
          </Text>
        </div>

        {/* Filters */}
        <Card>
          <Space wrap>
            <Select
              value={timeRange}
              onChange={(value) => {
                setTimeRange(value);
                if (value !== TimeRange.CUSTOM) {
                  setDateRange(null);
                }
              }}
              style={{ width: 200 }}
            >
              <Select.Option value={TimeRange.WEEK}>1 Tuần</Select.Option>
              <Select.Option value={TimeRange.MONTH}>1 Tháng</Select.Option>
              <Select.Option value={TimeRange.QUARTER}>1 Quý</Select.Option>
              <Select.Option value={TimeRange.YEAR}>1 Năm</Select.Option>
              <Select.Option value={TimeRange.ALL}>Tất cả</Select.Option>
              <Select.Option value={TimeRange.CUSTOM}>Tùy chỉnh</Select.Option>
            </Select>

            {timeRange === TimeRange.CUSTOM && (
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                format="YYYY-MM-DD"
              />
            )}

            <Button icon={<ReloadOutlined />} onClick={() => {
              clearApiCache();
              refetch();
            }}>
              Làm mới
            </Button>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={isExporting}
              disabled={!reportRows.length}
            >
              Xuất Excel
            </Button>
          </Space>
        </Card>

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số đơn"
                value={data?.total || 0}
                suffix="đơn hàng"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={totalAmount}
                precision={0}
                suffix="đ"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Giá trị trung bình"
                value={reportRows.length > 0 ? totalAmount / reportRows.length : 0}
                precision={0}
                suffix="đ"
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={reportRows}
            rowKey="invoiceNumber"
            loading={isLoading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bản ghi`,
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
