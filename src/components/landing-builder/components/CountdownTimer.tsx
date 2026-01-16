import React, { useState, useEffect } from "react";
import { useNode } from "@craftjs/core";
import { Form, Input } from "antd";

interface CountdownTimerProps {
  label?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  labelColor?: string;
  backgroundColor?: string;
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  label = "Web Class Starts In:",
  hours = 0,
  minutes = 15,
  seconds = 0,
  fontSize = 48,
  fontWeight = 700,
  color = "#000000",
  labelColor = "#666666",
  backgroundColor = "transparent",
  marginBottom = 30,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const [timeLeft, setTimeLeft] = useState({
    hours,
    minutes,
    seconds,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(timer);
          return prev;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        backgroundColor,
        padding: "0 12px",
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
        textAlign: "center",
      }}
    >
      <div style={style}>
        <p
          style={{
            fontSize: "clamp(14px, 18px, 18px)",
            fontWeight: 600,
            color: labelColor,
            marginBottom: "16px",
          }}
        >
          {label}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(8px, 20px, 20px)",
            flexWrap: "wrap",
          }}
        >
          {/* Hours */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: `clamp(${Math.max(24, fontSize * 0.5)}px, ${
                  fontSize * 0.7
                }px, ${fontSize}px)`,
                fontWeight,
                color,
                lineHeight: 1,
              }}
            >
              {formatNumber(timeLeft.hours)}
            </div>
            <div
              style={{
                fontSize: "clamp(10px, 14px, 14px)",
                color: labelColor,
                marginTop: "8px",
                textTransform: "uppercase",
              }}
            >
              HOURS
            </div>
          </div>

          <div
            style={{
              fontSize: `clamp(${Math.max(24, fontSize * 0.5)}px, ${
                fontSize * 0.7
              }px, ${fontSize}px)`,
              color,
              lineHeight: 1,
            }}
          >
            :
          </div>

          {/* Minutes */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: `clamp(${Math.max(24, fontSize * 0.5)}px, ${
                  fontSize * 0.7
                }px, ${fontSize}px)`,
                fontWeight,
                color,
                lineHeight: 1,
              }}
            >
              {formatNumber(timeLeft.minutes)}
            </div>
            <div
              style={{
                fontSize: "clamp(10px, 14px, 14px)",
                color: labelColor,
                marginTop: "8px",
                textTransform: "uppercase",
              }}
            >
              MINUTES
            </div>
          </div>

          <div
            style={{
              fontSize: `clamp(${Math.max(24, fontSize * 0.5)}px, ${
                fontSize * 0.7
              }px, ${fontSize}px)`,
              color,
              lineHeight: 1,
            }}
          >
            :
          </div>

          {/* Seconds */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: `clamp(${Math.max(24, fontSize * 0.5)}px, ${
                  fontSize * 0.7
                }px, ${fontSize}px)`,
                fontWeight,
                color,
                lineHeight: 1,
              }}
            >
              {formatNumber(timeLeft.seconds)}
            </div>
            <div
              style={{
                fontSize: "clamp(10px, 14px, 14px)",
                color: labelColor,
                marginTop: "8px",
                textTransform: "uppercase",
              }}
            >
              SECONDS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CountdownTimerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Label">
        <Input
          value={props.label}
          onChange={(e) =>
            setProp((props: any) => (props.label = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Initial Hours">
        <Input
          type="number"
          value={props.hours}
          onChange={(e) =>
            setProp(
              (props: any) => (props.hours = parseInt(e.target.value) || 0)
            )
          }
        />
      </Form.Item>
      <Form.Item label="Initial Minutes">
        <Input
          type="number"
          value={props.minutes}
          onChange={(e) =>
            setProp(
              (props: any) => (props.minutes = parseInt(e.target.value) || 0)
            )
          }
        />
      </Form.Item>
      <Form.Item label="Initial Seconds">
        <Input
          type="number"
          value={props.seconds}
          onChange={(e) =>
            setProp(
              (props: any) => (props.seconds = parseInt(e.target.value) || 0)
            )
          }
        />
      </Form.Item>
      <Form.Item label="Font Size">
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) =>
            setProp((props: any) => (props.fontSize = parseInt(e.target.value)))
          }
        />
      </Form.Item>
      <Form.Item label="Font Weight">
        <Input
          type="number"
          value={props.fontWeight}
          min={100}
          max={900}
          step={100}
          onChange={(e) =>
            setProp(
              (props: any) => (props.fontWeight = parseInt(e.target.value))
            )
          }
        />
      </Form.Item>
      <Form.Item label="Number Color">
        <Input
          type="color"
          value={props.color}
          onChange={(e) =>
            setProp((props: any) => (props.color = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Label Color">
        <Input
          type="color"
          value={props.labelColor}
          onChange={(e) =>
            setProp((props: any) => (props.labelColor = e.target.value))
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

(CountdownTimer as any).craft = {
  displayName: "Countdown Timer",
  props: {
    label: "Web Class Starts In:",
    hours: 0,
    minutes: 15,
    seconds: 0,
    fontSize: 48,
    fontWeight: 700,
    color: "#000000",
    labelColor: "#666666",
    backgroundColor: "transparent",
    marginBottom: 30,
  },
  related: {
    toolbar: CountdownTimerSettings,
  },
};
