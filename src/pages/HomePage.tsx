import { Typography, Card, Row, Col, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const { Title, Paragraph, Text } = Typography;

function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '50px', minHeight: '100vh', background: '#f0f2f5' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <Title level={1}>Welcome to SRM Lesson</Title>

            {isAuthenticated && user && (
              <Card style={{ marginBottom: 24, background: '#f6f8fa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Logged in as:</Text>
                  <Text>Name: {user.name}</Text>
                  <Text>Email: {user.email}</Text>
                  <Text>Role: {user.role}</Text>
                  <Space>
                    <Button type="primary" onClick={handleLogout}>
                      Logout
                    </Button>
                    <Button onClick={() => navigate('/change-password')}>
                      Change Password
                    </Button>
                  </Space>
                </Space>
              </Card>
            )}

            {!isAuthenticated && (
              <Card style={{ marginBottom: 24, background: '#fff7e6' }}>
                <Space>
                  <Text>Not logged in.</Text>
                  <Button type="primary" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </Space>
              </Card>
            )}

            <Paragraph>
              This is a full-stack application built with:
            </Paragraph>
            <ul>
              <li><strong>Frontend:</strong> React, Vite, Ant Design, Axios, Zustand</li>
              <li><strong>Backend:</strong> NestJS, MongoDB, Mongoose, class-validator, JWT</li>
            </ul>
            <Paragraph>
              Start building your application!
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;
