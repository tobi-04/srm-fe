import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Checkbox } from "antd";

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
  marginBottom?: number;
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
  marginBottom = 40,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

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
    cursor: "pointer",
    textTransform: "uppercase",
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        padding: "0 12px",
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}
    >
      <div
        style={{
          maxWidth: `${maxWidth}px`,
          width: "100%",
          margin: "0 auto",
          padding: 0,
          boxSizing: "border-box",
          ...style,
        }}
      >
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder={namePlaceholder}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder={emailPlaceholder}
            style={inputStyle}
            required
          />
          {showPhone && (
            <input
              type="tel"
              placeholder={phonePlaceholder}
              style={inputStyle}
            />
          )}
          {showAddress && (
            <input
              type="text"
              placeholder={addressPlaceholder}
              style={inputStyle}
            />
          )}
          {showBirthday && (
            <input
              type="date"
              placeholder={birthdayPlaceholder}
              style={inputStyle}
            />
          )}
          <button type="submit" style={buttonStyle}>
            {buttonText}
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
          }
        >
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
          }
        >
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
          }
        >
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
      <Form.Item label="Max Width">
        <Input
          type="number"
          value={props.maxWidth}
          onChange={(e) =>
            setProp((props: any) => (props.maxWidth = parseInt(e.target.value)))
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
    marginBottom: 40,
  },
  related: {
    toolbar: UserFormSettings,
  },
};
