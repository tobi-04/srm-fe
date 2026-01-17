import React, { useState, useEffect } from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Checkbox, message, Slider } from "antd";
import { useParams } from "react-router-dom";
import { submitUserForm } from "../../../api/landingPage";
import { useAuthStore } from "../../../stores/authStore";

interface UserFormProps {
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
  addressPlaceholder?: string;
  birthdayPlaceholder?: string;
  showPhone?: boolean;
  showAddress?: boolean;
  showBirthday?: boolean;
  maxWidth?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
  style?: React.CSSProperties;
}

export const UserForm: React.FC<UserFormProps> = ({
  buttonText = "YES! I Want The Free Web Class",
  buttonColor = "#1890ff",
  buttonTextColor = "#ffffff",
  namePlaceholder = "Enter your name",
  emailPlaceholder = "Enter your email",
  phonePlaceholder = "Enter your phone number",
  addressPlaceholder = "Enter your address",
  birthdayPlaceholder = "Enter your birthday",
  showPhone = false,
  showAddress = false,
  showBirthday = false,
  maxWidth = 600,
  marginTop = 0,
  marginBottom = 40,
  padding = 0,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthday: "",
  });

  // Auto-fill name and email if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if we're in builder/preview mode (no slug available)
    if (!slug) {
      message.info(
        "Form submission is disabled in preview mode. Publish the landing page to enable form submission."
      );
      return;
    }

    // Basic validation
    if (!formData.name.trim()) {
      message.error("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      message.error("Please enter your email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      message.error("Please enter a valid email address");
      return;
    }

    // Phone validation (if provided)
    if (showPhone && formData.phone && formData.phone.trim()) {
      // Vietnamese phone number: 10 digits, starts with 0
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
        message.error(
          "Please enter a valid phone number (10 digits, starts with 0)"
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const submitData: any = {
        name: formData.name,
        email: formData.email,
      };

      // Add optional fields if they have values
      if (showPhone && formData.phone) submitData.phone = formData.phone;
      if (showAddress && formData.address)
        submitData.address = formData.address;
      if (showBirthday && formData.birthday)
        submitData.birthday = formData.birthday;

      const response = await submitUserForm(slug, submitData);

      message.success("Form submitted successfully!");

      // Save real submission ID to localStorage for payment creation later
      localStorage.setItem(
        `landing_${slug}_submission_id`,
        response.submission_id
      );

      // Navigate to step 2 using window.location
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("step", "2");
      window.location.href = currentUrl.toString();

      // Reset form (will happen after navigation, but good practice)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        birthday: "",
      });
    } catch (error: any) {
      console.error("Form submission error:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to submit form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
    marginBottom: "12px",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 24px",
    fontSize: "clamp(14px, 18px, 18px)",
    fontWeight: "bold",
    backgroundColor: buttonColor,
    color: buttonTextColor,
    border: "none",
    borderRadius: "4px",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    textTransform: "uppercase",
    opacity: isSubmitting ? 0.7 : 1,
  };

  return (
    <div
      id="user-form-section"
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}>
      <div
        style={{
          maxWidth: `${maxWidth}px`,
          width: "100%",
          margin: "0 auto",
          padding: 0,
          boxSizing: "border-box",
          ...style,
        }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={namePlaceholder + " *"}
            style={{
              ...inputStyle,
              backgroundColor: user ? "#f5f5f5" : inputStyle.backgroundColor,
              cursor: user ? "not-allowed" : "text",
            }}
            required
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isSubmitting || !!user}
          />
          {user && (
            <small
              style={{
                color: "#999",
                fontSize: "12px",
                marginTop: "-8px",
                marginBottom: "8px",
                display: "block",
              }}>
              Name is locked for logged-in users
            </small>
          )}
          <input
            type="email"
            placeholder={emailPlaceholder + " *"}
            style={{
              ...inputStyle,
              backgroundColor: user ? "#f5f5f5" : inputStyle.backgroundColor,
              cursor: user ? "not-allowed" : "text",
            }}
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isSubmitting || !!user}
          />
          {user && (
            <small
              style={{
                color: "#999",
                fontSize: "12px",
                marginTop: "-8px",
                marginBottom: "8px",
                display: "block",
              }}>
              Email is locked for logged-in users
            </small>
          )}
          {showPhone && (
            <input
              type="tel"
              placeholder={phonePlaceholder + " (Optional)"}
              style={inputStyle}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={isSubmitting}
            />
          )}
          {showAddress && (
            <input
              type="text"
              placeholder={addressPlaceholder + " (Optional)"}
              style={inputStyle}
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={isSubmitting}
            />
          )}
          {showBirthday && (
            <div>
              <label
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "4px",
                  display: "block",
                }}>
                {birthdayPlaceholder} (Optional)
              </label>
              <input
                type="date"
                style={inputStyle}
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}
          <button type="submit" style={buttonStyle} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

const UserFormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
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
      <Form.Item label="Name Placeholder">
        <Input
          value={props.namePlaceholder}
          onChange={(e) =>
            setProp((props: any) => (props.namePlaceholder = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Email Placeholder">
        <Input
          value={props.emailPlaceholder}
          onChange={(e) =>
            setProp((props: any) => (props.emailPlaceholder = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item>
        <Checkbox
          checked={props.showPhone}
          onChange={(e) =>
            setProp((props: any) => (props.showPhone = e.target.checked))
          }>
          Show Phone Field
        </Checkbox>
      </Form.Item>
      {props.showPhone && (
        <Form.Item label="Phone Placeholder">
          <Input
            value={props.phonePlaceholder}
            onChange={(e) =>
              setProp((props: any) => (props.phonePlaceholder = e.target.value))
            }
          />
        </Form.Item>
      )}
      <Form.Item>
        <Checkbox
          checked={props.showAddress}
          onChange={(e) =>
            setProp((props: any) => (props.showAddress = e.target.checked))
          }>
          Show Address Field
        </Checkbox>
      </Form.Item>
      {props.showAddress && (
        <Form.Item label="Address Placeholder">
          <Input
            value={props.addressPlaceholder}
            onChange={(e) =>
              setProp(
                (props: any) => (props.addressPlaceholder = e.target.value)
              )
            }
          />
        </Form.Item>
      )}
      <Form.Item>
        <Checkbox
          checked={props.showBirthday}
          onChange={(e) =>
            setProp((props: any) => (props.showBirthday = e.target.checked))
          }>
          Show Birthday Field
        </Checkbox>
      </Form.Item>
      {props.showBirthday && (
        <Form.Item label="Birthday Placeholder">
          <Input
            value={props.birthdayPlaceholder}
            onChange={(e) =>
              setProp(
                (props: any) => (props.birthdayPlaceholder = e.target.value)
              )
            }
          />
        </Form.Item>
      )}
      <Form.Item label={`Max Width (${props.maxWidth}px)`}>
        <Slider
          min={300}
          max={1200}
          value={props.maxWidth}
          onChange={(value) =>
            setProp((props: any) => (props.maxWidth = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Padding (${props.padding}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.padding}
          onChange={(value) => setProp((props: any) => (props.padding = value))}
        />
      </Form.Item>
      <Form.Item label={`Margin Top (${props.marginTop}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.marginTop}
          onChange={(value) =>
            setProp((props: any) => (props.marginTop = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Bottom (${props.marginBottom}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.marginBottom}
          onChange={(value) =>
            setProp((props: any) => (props.marginBottom = value))
          }
        />
      </Form.Item>
    </Form>
  );
};

(UserForm as any).craft = {
  displayName: "User Form",
  props: {
    buttonText: "YES! I Want The Free Web Class",
    buttonColor: "#1890ff",
    buttonTextColor: "#ffffff",
    namePlaceholder: "Enter your name",
    emailPlaceholder: "Enter your email",
    phonePlaceholder: "Enter your phone number",
    addressPlaceholder: "Enter your address",
    birthdayPlaceholder: "Enter your birthday",
    showPhone: false,
    showAddress: false,
    showBirthday: false,
    maxWidth: 600,
    marginTop: 0,
    marginBottom: 40,
    padding: 0,
  },
  related: {
    toolbar: UserFormSettings,
  },
};
