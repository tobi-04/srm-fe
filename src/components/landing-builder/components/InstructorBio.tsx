import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, message } from "antd";
import { MdCheckCircle } from "react-icons/md";
import { useParams } from "react-router-dom";

interface InstructorBioProps {
  imageUrl?: string;
  instructorName?: string;
  bioText?: string;
  sectionTitle?: string;
  benefits?: string[];
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  footerText?: string;
  backgroundColor?: string;
  checkIconColor?: string;
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const InstructorBio: React.FC<InstructorBioProps> = ({
  imageUrl = "https://via.placeholder.com/300x400",
  instructorName = "Glynn Kosky",
  bioText = "Glynn is an 8-figure award winner who has helped over 23,000 people...",
  sectionTitle = "On This Web Class You Will Learn:",
  benefits = [
    "How to generate HIGH-TICKET commissions in 2025",
    "The exact system that made me $1M+ in passive income",
    "How YOU can start earning within 24 hours",
    "My secret automation system that works on autopilot",
    "The #1 mistake that keeps people from success",
  ],
  buttonText = "YES! I Want The Free Web Class",
  buttonColor = "#1890ff",
  buttonTextColor = "#ffffff",
  footerText = "100% Free - Next Class Is Starting Soon!",
  backgroundColor = "#ffffff",
  checkIconColor = "#52c41a",
  marginBottom = 40,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { slug } = useParams<{ slug: string }>();

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        backgroundColor,
        padding: "0 12px",
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: 0,
          ...style,
        }}>
        {/* Left Column: Instructor Image and Bio */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <img
            src={imageUrl}
            alt={instructorName}
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "auto",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          />
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
              margin: 0,
            }}>
            {bioText}
          </p>
        </div>

        {/* Right Column: Benefits and CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#000",
              marginBottom: "20px",
            }}>
            {sectionTitle}
          </h3>

          {/* Benefits List */}
          <div style={{ marginBottom: "24px" }}>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}>
                <MdCheckCircle
                  style={{
                    fontSize: "24px",
                    color: checkIconColor,
                    marginRight: "12px",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
                <span
                  style={{ fontSize: "16px", color: "#000", lineHeight: 1.5 }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            style={{
              width: "100%",
              padding: "16px 24px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: buttonColor,
              color: buttonTextColor,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
            onClick={() => {
              // Check if we're in builder/preview mode
              if (!slug) {
                message.info(
                  "This button will scroll to the form when viewing the published landing page."
                );
                return;
              }

              // Scroll to user form section
              const formSection = document.getElementById("user-form-section");
              if (formSection) {
                formSection.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }}>
            {buttonText}
          </button>

          {/* Footer Text */}
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
              margin: 0,
            }}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
};

const InstructorBioSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Instructor Image URL">
        <Input
          value={props.imageUrl}
          onChange={(e) =>
            setProp((props: any) => (props.imageUrl = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Instructor Name">
        <Input
          value={props.instructorName}
          onChange={(e) =>
            setProp((props: any) => (props.instructorName = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Bio Text">
        <Input.TextArea
          value={props.bioText}
          onChange={(e) =>
            setProp((props: any) => (props.bioText = e.target.value))
          }
          rows={3}
        />
      </Form.Item>
      <Form.Item label="Section Title">
        <Input
          value={props.sectionTitle}
          onChange={(e) =>
            setProp((props: any) => (props.sectionTitle = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Benefits (comma-separated)">
        <Input.TextArea
          value={props.benefits.join(", ")}
          onChange={(e) =>
            setProp(
              (props: any) =>
                (props.benefits = e.target.value
                  .split(",")
                  .map((b: string) => b.trim()))
            )
          }
          rows={5}
        />
      </Form.Item>
      <Form.Item label="Button Text">
        <Input
          value={props.buttonText}
          onChange={(e) =>
            setProp((props: any) => (props.buttonText = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Button Color">
        <Input
          type="color"
          value={props.buttonColor}
          onChange={(e) =>
            setProp((props: any) => (props.buttonColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Button Text Color">
        <Input
          type="color"
          value={props.buttonTextColor}
          onChange={(e) =>
            setProp((props: any) => (props.buttonTextColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Check Icon Color">
        <Input
          type="color"
          value={props.checkIconColor}
          onChange={(e) =>
            setProp((props: any) => (props.checkIconColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Footer Text">
        <Input
          value={props.footerText}
          onChange={(e) =>
            setProp((props: any) => (props.footerText = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Background Color">
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={(e) =>
            setProp((props: any) => (props.backgroundColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Margin Bottom">
        <Input
          type="number"
          value={props.marginBottom}
          onChange={(e) =>
            setProp(
              (props: any) => (props.marginBottom = parseInt(e.target.value))
            )
          }
        />
      </Form.Item>
    </Form>
  );
};

(InstructorBio as any).craft = {
  displayName: "Instructor Bio",
  props: {
    imageUrl: "https://via.placeholder.com/300x400",
    instructorName: "Glynn Kosky",
    bioText:
      "Glynn is an 8-figure award winner who has helped over 23,000 people...",
    sectionTitle: "On This Web Class You Will Learn:",
    benefits: [
      "How to generate HIGH-TICKET commissions in 2025",
      "The exact system that made me $1M+ in passive income",
      "How YOU can start earning within 24 hours",
      "My secret automation system that works on autopilot",
      "The #1 mistake that keeps people from success",
    ],
    buttonText: "YES! I Want The Free Web Class",
    buttonColor: "#1890ff",
    buttonTextColor: "#ffffff",
    footerText: "100% Free - Next Class Is Starting Soon!",
    backgroundColor: "#ffffff",
    checkIconColor: "#52c41a",
    marginBottom: 40,
  },
  related: {
    toolbar: InstructorBioSettings,
  },
};
