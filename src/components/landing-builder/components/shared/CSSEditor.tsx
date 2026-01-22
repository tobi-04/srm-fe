import React from "react";
import { Form, Input } from "antd";

interface CSSEditorProps {
  value?: React.CSSProperties;
  onChange?: (value: React.CSSProperties) => void;
}

export const CSSEditor: React.FC<CSSEditorProps> = ({
  value = {},
  onChange,
}) => {
  const handleChange = (cssString: string) => {
    try {
      // Parse CSS string to object
      const cssObj: any = {};
      const lines = cssString.split("\n").filter((line) => line.trim());

      lines.forEach((line) => {
        const [prop, val] = line.split(":").map((s) => s.trim());
        if (prop && val) {
          // Convert kebab-case to camelCase
          const camelProp = prop.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase(),
          );
          cssObj[camelProp] = val.replace(";", "").trim();
        }
      });

      onChange?.(cssObj);
    } catch (error) {
      console.error("Invalid CSS:", error);
    }
  };

  // Convert CSS object to string for display
  const cssToString = (css: React.CSSProperties): string => {
    return Object.entries(css)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${kebabKey}: ${value};`;
      })
      .join("\n");
  };

  return (
    <Form.Item
      label=""
      help="Nhập CSS theo định dạng: property: value; (mỗi thuộc tính một dòng)">
      <Input.TextArea
        rows={6}
        value={cssToString(value)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="background-color: #ff0000;
color: white;
border-radius: 10px;
padding: 20px;"
        style={{ fontFamily: "monospace", fontSize: "12px" }}
      />
    </Form.Item>
  );
};
