import React, { useState, useEffect } from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider, Tabs } from "antd";
import { useCountdown } from "../../../contexts/CountdownContext";
import { CSSEditor } from "./shared/CSSEditor";

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
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
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
  padding = 0,
  marginTop = 0,
  marginBottom = 30,
  maxWidth = 1200,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { setCountdownFinished } = useCountdown();

  const [timeLeft, setTimeLeft] = useState({
    hours,
    minutes,
    seconds,
  });

  // Reset timer when props change (in builder mode)
  useEffect(() => {
    setTimeLeft({
      hours,
      minutes,
      seconds,
    });
  }, [hours, minutes, seconds]);

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
          // Countdown finished!
          clearInterval(timer);
          setCountdownFinished(true);
          return prev;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setCountdownFinished]);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        backgroundColor,
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        border: selected ? "2px dashed #1890ff" : "none",
        textAlign: "center",
      }}>
      <div style={customCSS}>
        <p
          style={{
            fontSize: "clamp(14px, 18px, 18px)",
            fontWeight: 600,
            color: labelColor,
            marginBottom: "16px",
          }}>
          {label}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(8px, 20px, 20px)",
            flexWrap: "wrap",
          }}>
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
              }}>
              {formatNumber(timeLeft.hours)}
            </div>
            <div
              style={{
                fontSize: "clamp(10px, 14px, 14px)",
                color: labelColor,
                marginTop: "8px",
                textTransform: "uppercase",
              }}>
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
            }}>
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
              }}>
              {formatNumber(timeLeft.minutes)}
            </div>
            <div
              style={{
                fontSize: "clamp(10px, 14px, 14px)",
                color: labelColor,
                marginTop: "8px",
                textTransform: "uppercase",
              }}>
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
            }}>
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
              }}>
              {formatNumber(timeLeft.seconds)}
            </div>
            <div
              style={{
                fontSize: "clamp(10px, 14px, 14px)",
                color: labelColor,
                marginTop: "8px",
                textTransform: "uppercase",
              }}>
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
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
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
                      (props: any) =>
                        (props.hours = parseInt(e.target.value) || 0),
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
                      (props: any) =>
                        (props.minutes = parseInt(e.target.value) || 0),
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
                      (props: any) =>
                        (props.seconds = parseInt(e.target.value) || 0),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label={`Font Size (${props.fontSize}px)`}>
                <Slider
                  min={10}
                  max={120}
                  value={props.fontSize}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontSize = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Font Weight (${props.fontWeight})`}>
                <Slider
                  min={100}
                  max={900}
                  step={100}
                  value={props.fontWeight}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontWeight = value))
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
                    setProp(
                      (props: any) => (props.backgroundColor = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label={`Padding (${props.padding}px)`}>
                <Slider
                  min={0}
                  max={200}
                  value={props.padding}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Max Width (${props.maxWidth}px)`}>
                <Slider
                  min={400}
                  max={2000}
                  value={props.maxWidth}
                  onChange={(value) =>
                    setProp((props: any) => (props.maxWidth = value))
                  }
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
    padding: 0,
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 1200,
    customCSS: {},
  },
  related: {
    toolbar: CountdownTimerSettings,
  },
};
