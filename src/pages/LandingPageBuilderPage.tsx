import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Card, Button, Space, message, Spin, Layout, Typography, Divider, Tabs } from 'antd';
import { MdSave, MdArrowBack, MdPreview, MdEdit, MdVisibility } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';
import { getLandingPageById, updateLandingPage } from '../api/landingPage';
import {
  Text,
  Button as BuilderButton,
  Container,
  Image,
} from '../components/landing-builder/components';
import { Toolbox, SettingsPanel } from '../components/landing-builder/Sidebar';

const { Content, Sider } = Layout;
const { Title } = Typography;

type PageStep = '1' | '2' | '3';

const SaveButton = ({
  id,
  currentStep,
  onSave,
  loading
}: {
  id: string;
  currentStep: PageStep;
  onSave: (query: any, step: PageStep) => void;
  loading: boolean;
}) => {
  const { query } = useEditor();
  return (
    <Button
      type="primary"
      icon={<MdSave />}
      onClick={() => onSave(query, currentStep)}
      loading={loading}
    >
      Save Step {currentStep}
    </Button>
  );
};

export default function LandingPageBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState<PageStep>('1');

  // Fetch landing page data
  const { data: landingPage, isLoading } = useQuery({
    queryKey: ['landing-page', id],
    queryFn: () => getLandingPageById(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLandingPage(id, data),
    onSuccess: () => {
      message.success(`Step ${currentStep} saved successfully`);
      queryClient.invalidateQueries({ queryKey: ['landing-page', id] });
    },
    onError: () => {
      message.error('Failed to save landing page');
    },
  });

  const handleSave = (query: any, step: PageStep) => {
    const json = query.serialize();
    if (id) {
      const fieldName = `page_${step}_content`;
      updateMutation.mutate({
        id,
        data: { [fieldName]: JSON.parse(json) },
      });
    }
  };

  // Get the content for the current step
  const getCurrentPageContent = () => {
    if (!landingPage) return undefined;

    switch (currentStep) {
      case '1':
        return landingPage.page_1_content;
      case '2':
        return landingPage.page_2_content;
      case '3':
        return landingPage.page_3_content;
      default:
        return undefined;
    }
  };

  const getStepTitle = (step: PageStep) => {
    switch (step) {
      case '1':
        return 'Step 1: User Information Form';
      case '2':
        return 'Step 2: Sales Page';
      case '3':
        return 'Step 3: Payment Page';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <Editor
          resolver={{
            Text,
            Button: BuilderButton,
            Container,
            Image,
          }}
          enabled={enabled}
          onRender={({ render }) => (
            <div style={{ position: 'relative' }}>
              {render}
            </div>
          )}
        >
          {/* Top Control Bar */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Button
                  icon={<MdArrowBack />}
                  onClick={() => navigate('/admin/landing-pages')}
                >
                  Back
                </Button>
                <Title level={5} style={{ margin: 0 }}>
                  Builder: {landingPage?.title}
                </Title>
              </Space>
              <Space>
                <Button
                  icon={enabled ? <MdVisibility /> : <MdEdit />}
                  onClick={() => setEnabled(!enabled)}
                >
                  {enabled ? 'Preview Mode' : 'Edit Mode'}
                </Button>
                <SaveButton
                  id={id!}
                  currentStep={currentStep}
                  onSave={handleSave}
                  loading={updateMutation.isPending}
                />
                <Button
                  icon={<MdPreview />}
                  onClick={() => {
                    if (landingPage?.slug) {
                      window.open(`/landing/${landingPage.slug}`, '_blank');
                    }
                  }}
                >
                  Live Preview
                </Button>
              </Space>
            </div>

            {/* Step Tabs */}
            <Divider style={{ margin: '12px 0' }} />
            <Tabs
              activeKey={currentStep}
              onChange={(key) => setCurrentStep(key as PageStep)}
              items={[
                {
                  key: '1',
                  label: (
                    <span>
                      <span style={{ fontWeight: 600 }}>Step 1</span>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>User Info Form</span>
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span>
                      <span style={{ fontWeight: 600 }}>Step 2</span>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>Sales Page</span>
                    </span>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <span>
                      <span style={{ fontWeight: 600 }}>Step 3</span>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>Payment Page</span>
                    </span>
                  ),
                },
              ]}
            />
          </Card>

          <Layout style={{ flex: 1, background: '#f0f2f5', overflow: 'hidden' }}>
            {/* Main Canvas Area */}
            <Content style={{
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '1000px',
                background: '#fff',
                minHeight: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Frame
                  key={currentStep}
                  data={getCurrentPageContent() ? JSON.stringify(getCurrentPageContent()) : undefined}
                >
                  <Element
                    is={Container}
                    padding={40}
                    background="#ffffff"
                    canvas
                  >
                    <Text text={getStepTitle(currentStep)} type="title" level={1} />
                    <Text text="Drag and drop components from the right sidebar to customize this page." />
                    <BuilderButton text="Continue" type="primary" size="large" />
                  </Element>
                </Frame>
              </div>
            </Content>

            {/* Right Sidebar */}
            <Sider
              width={300}
              theme="light"
              style={{
                borderLeft: '1px solid #f0f0f0',
                overflowY: 'auto'
              }}
            >
              <Toolbox />
              <Divider style={{ margin: 0 }} />
              <SettingsPanel />
            </Sider>
          </Layout>
        </Editor>
      </div>
    </DashboardLayout>
  );
}
