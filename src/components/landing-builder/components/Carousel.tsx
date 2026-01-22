import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Button, Space, Slider, Select, Switch, Tabs } from "antd";
import { MdAdd, MdDelete } from "react-icons/md";
import { CSSEditor } from "./shared/CSSEditor";
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface SlideData {
  imageUrl: string;
  caption?: string;
}

interface CarouselProps {
  slides?: SlideData[];
  autoPlay?: boolean;
  autoPlaySpeed?: number;
  showDots?: boolean;
  showArrows?: boolean;
  transition?: "slide" | "fade";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  customCSS?: React.CSSProperties;
}

export const Carousel: React.FC<CarouselProps> = ({
  slides = [
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide+1",
      caption: "Slide 1",
    },
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide+2",
      caption: "Slide 2",
    },
    {
      imageUrl: "https://via.placeholder.com/800x400?text=Slide+3",
      caption: "Slide 3",
    },
  ],
  autoPlay = true,
  autoPlaySpeed = 3000,
  showDots = true,
  showArrows = true,
  transition = "slide",
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

  const settings = {
    dots: showDots,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: autoPlay,
    autoplaySpeed: autoPlaySpeed,
    arrows: showArrows,
    fade: transition === "fade",
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      <div style={{ maxWidth: "100%", overflow: "hidden" }}>
        {slides.length > 0 ? (
          <SlickSlider {...settings}>
            {slides.map((slide, index) => (
              <div key={index}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "50%", // 2:1 aspect ratio
                    overflow: "hidden",
                    borderRadius: "8px",
                  }}>
                  <img
                    src={slide.imageUrl}
                    alt={slide.caption || `Slide ${index + 1}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {slide.caption && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        padding: "12px 20px",
                        fontSize: "16px",
                      }}>
                      {slide.caption}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </SlickSlider>
        ) : (
          <div
            style={{
              background: "#f0f0f0",
              padding: "60px",
              textAlign: "center",
              color: "#999",
              borderRadius: "8px",
            }}>
            Thêm slides để hiển thị carousel
          </div>
        )}
      </div>
    </div>
  );
};

const CarouselSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  const addSlide = () => {
    setProp((props: any) => {
      const newSlides = [...(props.slides || [])];
      newSlides.push({
        imageUrl: `https://via.placeholder.com/800x400?text=Slide+${newSlides.length + 1}`,
        caption: `Slide ${newSlides.length + 1}`,
      });
      props.slides = newSlides;
    });
  };

  const removeSlide = (index: number) => {
    setProp((props: any) => {
      props.slides = props.slides.filter((_: any, i: number) => i !== index);
    });
  };

  const updateSlide = (
    index: number,
    field: keyof SlideData,
    value: string,
  ) => {
    setProp((props: any) => {
      props.slides[index][field] = value;
    });
  };

  return (
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
            <Form layout="vertical">
              <Form.Item label="Slides">
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle">
                  {(props.slides || []).map(
                    (slide: SlideData, index: number) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #f0f0f0",
                          padding: "12px",
                          borderRadius: "4px",
                        }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}>
                            <strong>Slide {index + 1}</strong>
                            <Button
                              danger
                              size="small"
                              icon={<MdDelete />}
                              onClick={() => removeSlide(index)}
                            />
                          </div>
                          <Input
                            placeholder="URL ảnh"
                            value={slide.imageUrl}
                            onChange={(e) =>
                              updateSlide(index, "imageUrl", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Chú thích (tùy chọn)"
                            value={slide.caption}
                            onChange={(e) =>
                              updateSlide(index, "caption", e.target.value)
                            }
                          />
                        </Space>
                      </div>
                    ),
                  )}
                  <Button block icon={<MdAdd />} onClick={addSlide}>
                    Thêm slide
                  </Button>
                </Space>
              </Form.Item>

              <Form.Item label="Tự động chạy">
                <Switch
                  checked={props.autoPlay}
                  onChange={(checked) =>
                    setProp((props: any) => (props.autoPlay = checked))
                  }
                />
              </Form.Item>

              {props.autoPlay && (
                <Form.Item label={`Tốc độ tự động: ${props.autoPlaySpeed}ms`}>
                  <Slider
                    min={1000}
                    max={10000}
                    step={500}
                    value={props.autoPlaySpeed}
                    onChange={(value) =>
                      setProp((props: any) => (props.autoPlaySpeed = value))
                    }
                  />
                </Form.Item>
              )}

              <Form.Item label="Hiển thị dots">
                <Switch
                  checked={props.showDots}
                  onChange={(checked) =>
                    setProp((props: any) => (props.showDots = checked))
                  }
                />
              </Form.Item>

              <Form.Item label="Hiển thị mũi tên">
                <Switch
                  checked={props.showArrows}
                  onChange={(checked) =>
                    setProp((props: any) => (props.showArrows = checked))
                  }
                />
              </Form.Item>

              <Form.Item label="Hiệu ứng chuyển đổi">
                <Select
                  value={props.transition}
                  onChange={(value) =>
                    setProp((props: any) => (props.transition = value))
                  }
                  options={[
                    { value: "slide", label: "Slide" },
                    { value: "fade", label: "Fade" },
                  ]}
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

(Carousel as any).craft = {
  displayName: "Carousel",
  props: {
    slides: [
      {
        imageUrl: "https://via.placeholder.com/800x400?text=Slide+1",
        caption: "Slide 1",
      },
      {
        imageUrl: "https://via.placeholder.com/800x400?text=Slide+2",
        caption: "Slide 2",
      },
      {
        imageUrl: "https://via.placeholder.com/800x400?text=Slide+3",
        caption: "Slide 3",
      },
    ],
    autoPlay: true,
    autoPlaySpeed: 3000,
    showDots: true,
    showArrows: true,
    transition: "slide",
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    customCSS: {},
  },
  related: {
    toolbar: CarouselSettings,
  },
};
