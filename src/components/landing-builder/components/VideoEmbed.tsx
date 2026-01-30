import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Select, Slider, Tabs } from "antd";
import { CSSEditor } from "./shared/CSSEditor";

interface VideoEmbedProps {
  url: string;
  width?: number;
  height?: number;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "custom";
  alignment?: "left" | "center" | "right";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

// Helper to extract video ID from URL
const getVideoEmbedUrl = (url: string): string => {
  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const match = url.match(vimeoRegex);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  // Direct video URL or already an embed URL
  return url;
};

const getAspectRatioPadding = (ratio: string): string => {
  switch (ratio) {
    case "16:9":
      return "56.25%";
    case "4:3":
      return "75%";
    case "1:1":
      return "100%";
    default:
      return "56.25%";
  }
};

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  url = "",
  // width = 100, // Not used - removed
  height = 400,
  aspectRatio = "16:9",
  alignment = "center",
  padding = 16,
  marginTop = 0,
  marginBottom = 0,
  maxWidth = 800,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const embedUrl = getVideoEmbedUrl(url);
  const isValidUrl =
    url &&
    (url.includes("youtube") || url.includes("vimeo") || url.includes("http"));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: `${maxWidth}px`,
        marginLeft:
          alignment === "center"
            ? "auto"
            : alignment === "right"
              ? "auto"
              : "0",
        marginRight:
          alignment === "center" ? "auto" : alignment === "left" ? "auto" : "0",
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      {isValidUrl ? (
        <div
          style={{
            position: "relative",
            paddingBottom:
              aspectRatio === "custom"
                ? `${height}px`
                : getAspectRatioPadding(aspectRatio),
            height: aspectRatio === "custom" ? `${height}px` : 0,
            overflow: "hidden",
          }}>
          <iframe
            src={embedUrl}
            style={{
              position: aspectRatio === "custom" ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: aspectRatio === "custom" ? "100%" : "100%",
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
        </div>
      ) : (
        <div
          style={{
            background: "#f0f0f0",
            padding: "40px",
            textAlign: "center",
            color: "#999",
            borderRadius: "4px",
          }}>
          Nhập URL video để hiển thị (YouTube hoặc Vimeo)
        </div>
      )}
    </div>
  );
};

const VideoEmbedSettings = () => {
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
              <Form.Item label="URL Video" help="Hỗ trợ YouTube, Vimeo">
                <Input
                  value={props.url}
                  onChange={(e) =>
                    setProp((props: any) => (props.url = e.target.value))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </Form.Item>

              <Form.Item label="Aspect Ratio">
                <Select
                  value={props.aspectRatio}
                  onChange={(value) =>
                    setProp((props: any) => (props.aspectRatio = value))
                  }
                  options={[
                    { value: "16:9", label: "16:9 (Widescreen)" },
                    { value: "4:3", label: "4:3 (Standard)" },
                    { value: "1:1", label: "1:1 (Square)" },
                    { value: "custom", label: "Tùy chỉnh" },
                  ]}
                />
              </Form.Item>

              {props.aspectRatio === "custom" && (
                <Form.Item label={`Chiều cao: ${props.height}px`}>
                  <Slider
                    min={200}
                    max={800}
                    value={props.height}
                    onChange={(value) =>
                      setProp((props: any) => (props.height = value))
                    }
                  />
                </Form.Item>
              )}

              <Form.Item label="Căn chỉnh">
                <Select
                  value={props.alignment}
                  onChange={(value) =>
                    setProp((props: any) => (props.alignment = value))
                  }
                  options={[
                    { value: "left", label: "Trái" },
                    { value: "center", label: "Giữa" },
                    { value: "right", label: "Phải" },
                  ]}
                />
              </Form.Item>

              <Form.Item label={`Max Width: ${props.maxWidth}px`}>
                <Slider
                  min={300}
                  max={1200}
                  step={10}
                  value={props.maxWidth}
                  onChange={(value) =>
                    setProp((props: any) => (props.maxWidth = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Padding: ${props.padding}px`}>
                <Slider
                  min={0}
                  max={60}
                  value={props.padding}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Margin Top: ${props.marginTop}px`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.marginTop}
                  onChange={(value) =>
                    setProp((props: any) => (props.marginTop = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Margin Bottom: ${props.marginBottom}px`}>
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

(VideoEmbed as any).craft = {
  displayName: "Video Embed",
  props: {
    url: "",
    width: 100,
    height: 400,
    aspectRatio: "16:9",
    alignment: "center",
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 800,
    customCSS: {},
  },
  related: {
    toolbar: VideoEmbedSettings,
  },
};
