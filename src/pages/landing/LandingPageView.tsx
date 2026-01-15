import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Editor, Frame, Element } from '@craftjs/core';
import { Layout, Spin, Result, Alert, Steps, Button as AntButton } from 'antd';
import { MdError, MdCheckCircle } from 'react-icons/md';
import { getLandingPageBySlug } from '../../api/landingPage';
import { useAuthStore } from '../../stores/authStore';
import {
  Text,
  Button as BuilderButton,
  Container,
  Image,
} from '../../components/landing-builder/components';

const { Content } = Layout;

type FlowStep = 1 | 2 | 3 | 4; // 4 is success page

export default function LandingPageView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Get step from URL params or default to 1
  const urlStep = parseInt(searchParams.get('step') || '1') as FlowStep;
  const [currentStep, setCurrentStep] = useState<FlowStep>(urlStep);

  // Form data collected from step 1
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Fetch landing page data by slug
  const { data: landingPage, isLoading, error } = useQuery({
    queryKey: ['landing-page-public', slug],
    queryFn: () => getLandingPageBySlug(slug!),
    enabled: !!slug,
  });

  // Update URL when step changes
  useEffect(() => {
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as FlowStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FlowStep);
    }
  };

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (error || !landingPage) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="404"
          title="Landing Page Not Found"
          subTitle="Sorry, the landing page you are looking for does not exist."
          icon={<MdError size={64} />}
        />
      </Layout>
    );
  }

  // If page is not published and user is not admin, show error
  if (landingPage.status !== 'published' && !isAdmin) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="403"
          title="Page Not Available"
          subTitle="This landing page is not published yet."
        />
      </Layout>
    );
  }

  // Get content for current step
  const getCurrentPageContent = () => {
    switch (currentStep) {
      case 1:
        return landingPage.page_1_content;
      case 2:
        return landingPage.page_2_content;
      case 3:
        return landingPage.page_3_content;
      case 4:
        return null; // Success page
      default:
        return landingPage.page_1_content;
    }
  };

  // Render success page
  if (currentStep === 4) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px' }}>
          <Result
            status="success"
            icon={<MdCheckCircle size={72} style={{ color: '#52c41a' }} />}
            title="Payment Successful!"
            subTitle={landingPage.metadata?.success_message || "Thank you for your purchase! We've sent a confirmation email to your registered email address."}
            extra={[
              <AntButton type="primary" key="home" size="large">
                Go to Course
              </AntButton>,
            ]}
          />
        </Content>
      </Layout>
    );
  }

  const pageContent = getCurrentPageContent();

  return (
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Content>
        {/* Draft preview banner for admins */}
        {isAdmin && landingPage.status === 'draft' && (
          <Alert
            message="Draft Preview Mode"
            description="You are viewing a draft landing page. This page is not visible to the public yet."
            type="warning"
            showIcon
            banner
            style={{ marginBottom: 0 }}
          />
        )}

        {/* Progress Steps */}
        <div style={{ background: '#fff', padding: '24px 50px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Steps
              current={currentStep - 1}
              items={[
                {
                  title: 'Information',
                  description: 'Your details',
                },
                {
                  title: 'Course',
                  description: 'Review course',
                },
                {
                  title: 'Payment',
                  description: 'Complete purchase',
                },
              ]}
            />
          </div>
        </div>

        {/* Render the page content using Craft.js in view-only mode */}
        <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 180px)', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Editor
              resolver={{
                Text,
                Button: BuilderButton,
                Container,
                Image,
              }}
              enabled={false}
            >
              <Frame data={pageContent && Object.keys(pageContent).length > 0 ? JSON.stringify(pageContent) : undefined}>
                {/* Default content if no page_content exists */}
                <Element is={Container} padding={40} background="#ffffff" canvas>
                  <Text
                    text={currentStep === 1 ? 'Step 1: Enter Your Information' : currentStep === 2 ? 'Step 2: Course Details' : 'Step 3: Payment'}
                    type="title"
                    level={1}
                  />
                  <Text text="This page is being customized. Please check back soon." />
                  <BuilderButton
                    text={currentStep < 3 ? 'Continue' : 'Complete Payment'}
                    type="primary"
                    size="large"
                  />
                </Element>
              </Frame>
            </Editor>

            {/* Navigation Buttons */}
            <div style={{ padding: '24px 40px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
              <AntButton
                size="large"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                Previous
              </AntButton>
              <AntButton
                type="primary"
                size="large"
                onClick={handleNextStep}
              >
                {currentStep === 1 ? 'Continue to Course' : currentStep === 2 ? 'Proceed to Payment' : 'Complete Payment'}
              </AntButton>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
