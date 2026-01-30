import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Alert, Switch, Tabs } from "antd";
import DOMPurify from "dompurify";
import { CSSEditor } from "./shared/CSSEditor";

interface CustomHTMLProps {
  htmlContent?: string;
  disableSanitization?: boolean;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  customCSS?: React.CSSProperties;
}

export const CustomHTML: React.FC<CustomHTMLProps> = ({
  htmlContent = "<p>Nhập HTML tùy chỉnh của bạn</p>",
  disableSanitization = false,
  padding = 16,
  marginTop = 0,
  marginBottom = 0,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHTML = disableSanitization
    ? htmlContent
    : DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          "p",
          "div",
          "span",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "strong",
          "em",
          "u",
          "br",
          "hr",
          "a",
          "img",
          "ul",
          "ol",
          "li",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "blockquote",
          "code",
          "pre",
          "iframe",
        ],
        ALLOWED_ATTR: [
          "href",
          "src",
          "alt",
          "title",
          "class",
          "id",
          "style",
          "width",
          "height",
          "target",
          "rel",
          "frameborder",
          "allow",
          "allowfullscreen",
        ],
        ALLOWED_URI_REGEXP:
          /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      });

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        minHeight: "40px",
        ...customCSS,
      }}>
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        style={{
          wordBreak: "break-word",
        }}
      />
    </div>
  );
};

const CustomHTMLSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
            <Form layout="vertical">
              <Alert
                message="Bảo mật"
                description="HTML của bạn sẽ được làm sạch (sanitized) để ngăn chặn các cuộc tấn công XSS. Các thẻ và thuộc tính nguy hiểm như <script>, onclick, v.v. sẽ bị loại bỏ."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item label="Nội dung HTML">
                <Input.TextArea
                  rows={10}
                  value={props.htmlContent}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.htmlContent = e.target.value),
                    )
                  }
                  placeholder="<div><h2>Tiêu đề</h2><p>Nội dung của bạn...</p></div>"
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                />
              </Form.Item>

              <Form.Item
                label="Tắt sanitization (KHÔNG KHUYẾN NGHỊ)"
                help="Chỉ bật nếu bạn hoàn toàn tin tưởng nguồn HTML. Điều này có thể gây ra lỗ hổng bảo mật.">
                <Switch
                  checked={props.disableSanitization}
                  onChange={(checked) =>
                    setProp(
                      (props: any) => (props.disableSanitization = checked),
                    )
                  }
                />
              </Form.Item>

              {props.disableSanitization && (
                <Alert
                  message="CẢNH BÁO BẢO MẬT"
                  description="Bạn đã tắt sanitization. HTML không được kiểm tra có thể chứa mã độc hại. Chỉ sử dụng HTML từ nguồn đáng tin cậy."
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Form.Item label="Xem trước đã sanitized">
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "4px",
                    background: "#fafafa",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      whiteSpace: "pre-wrap",
                    }}>
                    {props.disableSanitization
                      ? props.htmlContent
                      : DOMPurify.sanitize(props.htmlContent || "", {
                          ALLOWED_TAGS: [
                            "p",
                            "div",
                            "span",
                            "h1",
                            "h2",
                            "h3",
                            "h4",
                            "h5",
                            "h6",
                            "strong",
                            "em",
                            "u",
                            "br",
                            "hr",
                            "a",
                            "img",
                            "ul",
                            "ol",
                            "li",
                            "table",
                            "thead",
                            "tbody",
                            "tr",
                            "th",
                            "td",
                            "blockquote",
                            "code",
                            "pre",
                            "iframe",
                          ],
                          ALLOWED_ATTR: [
                            "href",
                            "src",
                            "alt",
                            "title",
                            "class",
                            "id",
                            "style",
                            "width",
                            "height",
                            "target",
                            "rel",
                            "frameborder",
                            "allow",
                            "allowfullscreen",
                          ],
                        })}
                  </pre>
                </div>
              </Form.Item>
            </Form>
          ),
        },
        {
          key: "css",
          label: "",
          children: (
            <CSSEditor
              value={props.customCSS}
              onChange={(value) =>
                setProp((props: any) => (props.customCSS = value))
              }
            />
          ),
        },
      ]}
    />
  );
};

(CustomHTML as any).craft = {
  displayName: "Custom HTML",
  props: {
    htmlContent: "<p>Nhập HTML tùy chỉnh của bạn</p>",
    disableSanitization: false,
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    customCSS: {},
  },
  related: {
    toolbar: CustomHTMLSettings,
  },
};
