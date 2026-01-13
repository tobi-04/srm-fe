import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await authApi.forgotPassword(values);
      message.success(response.message);
      // In development, show the reset token
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send reset email');
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
              Forgot Password
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              Enter your email to reset your password
            </Text>
          </div>

          {resetToken && (
            <Alert
              message="Development Mode"
              description={
                <div>
                  <p>Reset token (for development):</p>
                  <Input.TextArea
                    value={resetToken}
                    readOnly
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    style={{ marginTop: 8, fontSize: 12 }}
                  />
                  <p style={{ marginTop: 8 }}>
                    Use this token in the reset password page.
                  </p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24, borderRadius: '8px' }}
            />
          )}

          <Form
            name="forgotPassword"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#667eea' }} />}
                placeholder="Email"
                size="large"
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
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
                Send Reset Link
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', fontSize: '15px' }}>
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Back to login
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
