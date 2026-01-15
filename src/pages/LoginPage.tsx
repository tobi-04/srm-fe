import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { getDeviceInfo } from '../utils/device';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const response = await authApi.login({
        ...values,
        ...deviceInfo,
      });
      // refreshToken is now stored in httpOnly cookie by the backend
      setAuth(response.user, response.accessToken);
      message.success('Login successful!');
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed');
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
              Welcome Back
            </Title>
            <Text type="secondary" style={{ fontSize: '15px' }}>
              Sign in to your account
            </Text>
          </div>

          <Form
            name="login"
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
                prefix={<UserOutlined style={{ color: '#667eea' }} />}
                placeholder="Email"
                size="large"
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="Password"
                size="large"
                style={{ borderRadius: '8px', padding: '12px 16px' }}
              />
            </Form.Item>

            <div style={{ marginBottom: 24, textAlign: 'right' }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#667eea',
                  fontWeight: 500,
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </Link>
            </div>

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
                Sign In
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', fontSize: '15px' }}>
              <Text style={{ color: '#666' }}>Don't have an account? </Text>
              <Link
                to="/register"
                style={{
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Sign up
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
