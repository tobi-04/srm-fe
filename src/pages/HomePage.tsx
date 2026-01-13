import { Typography, Card, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

function HomePage() {
  return (
    <div style={{ padding: '50px', minHeight: '100vh', background: '#f0f2f5' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <Title level={1}>Welcome to SRM Lesson</Title>
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
