import { useState } from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { Layout, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  Text,
  Button as BuilderButton,
  Container,
  Image,
  Header,
  Headline,
  Subtitle,
  UserForm,
  InstructorBio,
  SuccessHeadline,
  VideoPlayer,
  CountdownTimer,
  SalesPageContent,
  TwoColumnLayout,
  Footer,
  PaymentQRCode,
  PaymentInfo,
  PaymentStatus,
  BookHero,
  BookCheckoutButton,
  IndicatorHero,
  IndicatorCheckoutButton,
  CustomHTML,
  Carousel,
  GridContent,
  GridItem,
  List,
  VideoEmbed,
  RichText,
  AdvancedButton,
  HeroSection,
} from "../../components/landing-builder/components";
import { LandingPageProvider } from "../../contexts/LandingPageContext";
import { CountdownProvider } from "../../contexts/CountdownContext";
import { BookCheckoutModal } from "../../components/books/BookCheckoutModal";
import { IndicatorCheckoutModal } from "../../components/indicators/IndicatorCheckoutModal";
import { bookApi } from "../../api/bookApi";
import { indicatorApi } from "../../api/indicatorApi";

const { Content } = Layout;

// Define specific interface instead of relying on store type to avoid import cycles if possible
// But reusing the type is better for consistency if no cycle.
import type { LandingPage } from "../../stores/landingPageStore";

const CRAFT_RESOLVER = {
  Text,
  Button: BuilderButton,
  Container,
  Image,
  Header,
  Headline,
  Subtitle,
  UserForm,
  InstructorBio,
  SuccessHeadline,
  VideoPlayer,
  CountdownTimer,
  SalesPageContent,
  TwoColumnLayout,
  Footer,
  PaymentQRCode,
  PaymentInfo,
  PaymentStatus,
  BookHero,
  BookCheckoutButton,
  IndicatorHero,
  IndicatorCheckoutButton,
  CustomHTML,
  Carousel,
  GridContent,
  GridItem,
  List,
  VideoEmbed,
  RichText,
  AdvancedButton,
  HeroSection,
};

interface LandingPageRendererProps {
  landingPage: LandingPage;
  urlStep?: 1 | 2 | 3 | 4;
  isAdmin?: boolean;
}

export const LandingPageRenderer: React.FC<LandingPageRendererProps> = ({
  landingPage,
  urlStep = 1,
  isAdmin = false,
}) => {
  // Purchase Modal State
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // Fetch book data if available - should be populated from backend
  const book =
    typeof landingPage?.book_id === "object" ? landingPage.book_id : null;

  // Fetch indicator data if available - should be populated from backend
  const indicator =
    typeof landingPage?.indicator_id === "object"
      ? landingPage.indicator_id
      : null;

  // Get content for current step
  const getCurrentPageContent = () => {
    switch (urlStep) {
      case 1:
        return landingPage.page_1_content;
      case 2:
        return landingPage.page_2_content;
      case 3:
        return landingPage.page_3_content;
      case 4:
        return null; // Success page handled by parent usually, or we can handle it if needed
      default:
        return landingPage.page_1_content;
    }
  };

  // Get default sections for empty steps
  const getDefaultStepSections = (step: number) => {
    switch (step) {
      case 1:
        return (
          <Element is={Container} background="#ffffff" canvas>
            <Element is={Header} />
            <Element is={Headline} />
            <Element is={Subtitle} />
            <Element is={UserForm} />
            <Element is={InstructorBio} />
            <Element is={Footer} />
          </Element>
        );
      case 2:
        // Override for Books/Indicators
        const isRestrictedFlow =
          landingPage?.resource_type === "book" ||
          landingPage?.book_id ||
          landingPage?.resource_type === "indicator" ||
          landingPage?.indicator_id;

        if (isRestrictedFlow) {
          const isIndicator =
            landingPage?.resource_type === "indicator" ||
            landingPage?.indicator_id;

          if (isIndicator) {
            // Default sections for Indicator - Only Hero
            return (
              <Element is={Container} padding={0} background="#ffffff" canvas>
                <IndicatorHero />
              </Element>
            );
          } else {
            // Default sections for Book - Only Hero
            return (
              <Element is={Container} padding={0} background="#ffffff" canvas>
                <BookHero />
              </Element>
            );
          }
        }

        return (
          <Element is={Container} background="#f5f5f5" canvas>
            <Element is={SuccessHeadline} />
            <Element is={Container} background="#ffffff" canvas>
              <Element is={TwoColumnLayout} canvas>
                <Element is={Container} background="transparent" canvas>
                  <Element is={VideoPlayer} />
                </Element>
                <Element is={Container} background="transparent" canvas>
                  <Element is={CountdownTimer} />
                  <Element is={SalesPageContent} />
                </Element>
              </Element>
            </Element>
            <Element is={Footer} />
          </Element>
        );
      case 3:
        return (
          <Element is={Container} background="#f5f5f5" canvas>
            <Element is={Header} />
            <div
              style={{
                padding: "40px 20px",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <Element
                is={Text}
                text="Hoàn tất Thanh toán"
                type="title"
                level={1}
              />
              <Element is={Container} background="#ffffff" canvas>
                <Element is={PaymentQRCode} />
                <Element is={PaymentInfo} />
              </Element>
              <Element is={PaymentStatus} />
            </div>
            <Element is={Footer} />
          </Element>
        );
      default:
        return null;
    }
  };

  const pageContent = getCurrentPageContent();
  const hasContent =
    pageContent &&
    typeof pageContent === "object" &&
    Object.keys(pageContent).length > 0;

  return (
    <CountdownProvider>
      <LandingPageProvider
        landingPage={landingPage}
        isPurchaseModalOpen={isPurchaseModalOpen}
        setPurchaseModalOpen={setPurchaseModalOpen}
      >
        <Layout style={{ minHeight: "100vh", background: "#ffffff" }}>
          <Content>
            {/* Draft preview banner for admins */}
            {isAdmin && landingPage.status === "draft" && (
              <Alert
                message="Chế độ xem trước bản nháp"
                description="Bạn đang xem landing page bản nháp. Trang này chưa hiển thị công khai."
                type="warning"
                showIcon
                banner
                style={{ marginBottom: 0 }}
              />
            )}

            {/* Render the page content using Craft.js in view-only mode */}
            <div
              style={{
                background: "#fff",
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{ width: "100%" }}
                className="landing-builder-content"
              >
                <Editor resolver={CRAFT_RESOLVER} enabled={false}>
                  <Frame
                    key={`step-${urlStep}`}
                    data={
                      hasContent ? JSON.stringify(pageContent) : undefined
                    }
                  >
                    {!hasContent && getDefaultStepSections(urlStep)}
                  </Frame>
                </Editor>
              </div>
            </div>

            {/* Checkout Modals */}
            {isPurchaseModalOpen && (
              <>
                {(landingPage?.resource_type === "indicator" ||
                  landingPage?.indicator_id) &&
                indicator ? (
                  <IndicatorCheckoutModal
                    open={isPurchaseModalOpen}
                    onCancel={() => setPurchaseModalOpen(false)}
                    indicator={indicator}
                  />
                ) : (landingPage?.resource_type === "book" ||
                    landingPage?.book_id) &&
                  book ? (
                  <BookCheckoutModal
                    open={isPurchaseModalOpen}
                    onCancel={() => setPurchaseModalOpen(false)}
                    book={book}
                  />
                ) : null}
              </>
            )}
          </Content>
        </Layout>
      </LandingPageProvider>
    </CountdownProvider>
  );
};
