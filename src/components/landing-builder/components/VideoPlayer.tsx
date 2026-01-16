import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider } from "antd";

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  title = "Watch This Video Before Joining:",
  padding = 12,
  marginTop = 0,
  marginBottom = 0,
  maxWidth = 1200,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Extract YouTube video ID if it's a YouTube URL
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth === 1200 ? "100%" : `${maxWidth}px`,
        marginRight: "auto",
        marginLeft: "auto",
        border: selected ? "2px dashed #1890ff" : "none",
      }}>
      <div style={style}>
        {title && (
          <h3
            style={{
              fontSize: "clamp(16px, 20px, 20px)",
              fontWeight: "bold",
              color: "#000",
              marginBottom: "16px",
            }}>
            {title}
          </h3>
        )}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%",
            height: 0,
          }}>
          <iframe
            width="100%"
            height="100%"
            src={getEmbedUrl(videoUrl)}
            title="Video Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: "8px",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const VideoPlayerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Video Title">
        <Input
          value={props.title}
          onChange={(e) =>
            setProp((props: any) => (props.title = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Video URL (YouTube or Embed URL)">
        <Input
          value={props.videoUrl}
          onChange={(e) =>
            setProp((props: any) => (props.videoUrl = e.target.value))
          }
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Form.Item>
      <Form.Item label={`Padding: ${props.padding || 12}px`}>
        <Slider
          min={0}
          max={100}
          value={props.padding || 12}
          onChange={(value) => setProp((props: any) => (props.padding = value))}
        />
      </Form.Item>
      <Form.Item
        label={`Max Width: ${
          props.maxWidth === 1200 ? "Full" : (props.maxWidth || 1200) + "px"
        }`}>
        <Slider
          min={400}
          max={1200}
          step={10}
          value={props.maxWidth || 1200}
          onChange={(value) =>
            setProp((props: any) => (props.maxWidth = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Top: ${props.marginTop || 0}px`}>
        <Slider
          min={0}
          max={100}
          value={props.marginTop || 0}
          onChange={(value) =>
            setProp((props: any) => (props.marginTop = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Bottom: ${props.marginBottom || 0}px`}>
        <Slider
          min={0}
          max={100}
          value={props.marginBottom || 0}
          onChange={(value) =>
            setProp((props: any) => (props.marginBottom = value))
          }
        />
      </Form.Item>
    </Form>
  );
};

(VideoPlayer as any).craft = {
  displayName: "Video Player",
  props: {
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Watch This Video Before Joining:",
    padding: 12,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 1200,
  },
  related: {
    toolbar: VideoPlayerSettings,
  },
};
