import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const onFinish = async (values: { token: string; new_password: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword({
        token: values.token,
        new_password: values.new_password,
      });
      message.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        filter: 'blur(60px)',
      }} />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
          styles={{ body: { padding: '48px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={2} style={{ marginBottom: 8, fontSize: '32px', fontWeight: 700 }}>
              Reset Password
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              Create a new password for your account
            </Text>
          </div>

          <Form
            name="resetPassword"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            initialValues={{ token }}
            requiredMark={false}
          >
            <Form.Item
              name="token"
              label={<span style={{ fontWeight: 500 }}>Reset Token</span>}
              rules={[{ required: true, message: 'Please input the reset token!' }]}
            >
              <Input.TextArea
                placeholder="Paste your reset token here"
                autoSize={{ minRows: 3, maxRows: 5 }}
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="new_password"
              label={<span style={{ fontWeight: 500 }}>New Password</span>}
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="New Password"
                size="large"
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label={<span style={{ fontWeight: 500 }}>Confirm New Password</span>}
              dependencies={['new_password']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="Confirm New Password"
                size="large"
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
