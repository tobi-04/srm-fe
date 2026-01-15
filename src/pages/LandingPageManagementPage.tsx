import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Input,
  message,
  Modal,
  Form,
  Select,
  Popconfirm,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdRefresh, MdSearch } from 'react-icons/md';
import DashboardLayout from '../components/DashboardLayout';
import {
  getLandingPages,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
} from '../api/landingPage';
import type { LandingPage } from '../stores/landingPageStore';

const { Title } = Typography;

interface FormValues {
  course_id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
}

export default function LandingPageManagementPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Query courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses`, {
        credentials: 'include',
      });
      return response.json();
    },
  });

  const courses = coursesData?.data || [];

  // Query landing pages
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['landing-pages', searchText, statusFilter],
    queryFn: async () => {
      return getLandingPages({
        page: 1,
        limit: 100,
        status: statusFilter || undefined,
      });
    },
    staleTime: 0,
    gcTime: 0,
  });

  const landingPages = data?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createLandingPage,
    onSuccess: async () => {
      message.success('Landing page created successfully');
      await queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      await refetch();
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create landing page');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormValues> }) =>
      updateLandingPage(id, data),
    onSuccess: async () => {
      message.success('Landing page updated successfully');
      await queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      await refetch();
      setIsModalOpen(false);
      setSelectedLandingPage(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update landing page');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLandingPage,
    onSuccess: async () => {
      message.success('Landing page deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      await refetch();
    },
    onError: () => {
      message.error('Failed to delete landing page');
    },
  });

  const handleCreate = () => {
    setSelectedLandingPage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: LandingPage) => {
    setSelectedLandingPage(record);
    form.setFieldsValue({
      course_id: record.course_id,
      title: record.title,
      slug: record.slug,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleBuilder = (record: LandingPage) => {
    navigate(`/admin/landing-builder/${record._id}`);
  };

  const handleSubmit = async (values: FormValues) => {
    if (selectedLandingPage) {
      await updateMutation.mutateAsync({
        id: selectedLandingPage._id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Course',
      dataIndex: 'course_id',
      key: 'course_id',
      render: (courseId: string) => {
        const course = courses.find((c: any) => c._id === courseId);
        return course?.title || courseId;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LandingPage) => (
        <Space>
          <Button
            type="link"
            icon={<MdVisibility />}
            onClick={() => handleBuilder(record)}
          >
            Builder
          </Button>
          <Button
            type="link"
            icon={<MdEdit />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this landing page?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<MdDelete />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={2}>Landing Page Management</Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<MdAdd />}
            onClick={handleCreate}
          >
            Create Landing Page
          </Button>
          <Button icon={<MdRefresh />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Input
            placeholder="Search..."
            prefix={<MdSearch />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || '')}
            style={{ width: 150 }}
          >
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="published">Published</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={landingPages}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedLandingPage ? 'Edit Landing Page' : 'Create Landing Page'}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedLandingPage(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="course_id"
              label="Course"
              rules={[{ required: true, message: 'Please select a course' }]}
            >
              <Select placeholder="Select a course">
                {courses.map((course: any) => (
                  <Select.Option key={course._id} value={course._id}>
                    {course.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder="Enter landing page title" />
            </Form.Item>

            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ required: true, message: 'Please enter a slug' }]}
            >
              <Input placeholder="landing-page-slug" />
            </Form.Item>

            <Form.Item name="status" label="Status" initialValue="draft">
              <Select>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="published">Published</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedLandingPage ? 'Update' : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedLandingPage(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </DashboardLayout>
  );
}
