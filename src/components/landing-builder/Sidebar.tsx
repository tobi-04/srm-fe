import React from "react";
import { useEditor, Element } from "@craftjs/core";
import { Button, Space, Typography, Divider, Empty, Collapse } from "antd";
import {
  MdTextFields,
  MdSmartButton,
  MdCropSquare,
  MdImage,
  MdSettings,
  MdViewWeek,
  MdTitle,
  MdSubtitles,
  MdInput,
  MdPerson,
  MdCheckCircle,
  MdPlayCircle,
  MdTimer,
  MdContactPage,
  MdQrCode2,
  MdPayment,
  MdInfo,
  MdVideoLibrary,
  MdFormatColorText,
  MdRadioButtonChecked,
  MdViewCarousel,
  MdList,
  MdCode,
  MdDashboard,
  MdGradient,
} from "react-icons/md";
import {
  Text,
  Button as BuilderButton,
  Container,
  Image,
  Header,
  Headline,
  Subtitle,
  UserForm,
  InstructorBio,
  SuccessHeadline,
  VideoPlayer,
  CountdownTimer,
  SalesPageContent,
  TwoColumnLayout,
  Footer,
  PaymentQRCode,
  PaymentInfo,
  PaymentStatus,
  // Advanced Components
  VideoEmbed,
  RichText,
  AdvancedButton,
  HeroSection,
  GridContent,
  GridItem,
  List,
  Carousel,
  CustomHTML,
} from "./components";

const { Text: AntText } = Typography;

export const Toolbox = () => {
  const { connectors } = useEditor();

  const collapseItems = [
    {
      key: "basic",
      label: "Thành phần cơ bản",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div
            ref={(ref) =>
              ref && connectors.create(ref, <Text text="Văn bản mới" />)
            }>
            <Button block icon={<MdTextFields />} style={{ cursor: "move" }}>
              Văn bản
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <BuilderButton text="Nhấp vào đây" type="primary" />,
              )
            }>
            <Button block icon={<MdSmartButton />} style={{ cursor: "move" }}>
              Nút bấm
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Element is={Container} padding={20} canvas>
                  <Text text="Container trống" />
                </Element>,
              )
            }>
            <Button block icon={<MdCropSquare />} style={{ cursor: "move" }}>
              Container
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Image src="https://via.placeholder.com/150" />,
              )
            }>
            <Button block icon={<MdImage />} style={{ cursor: "move" }}>
              Hình ảnh
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "advanced",
      label: "Thành phần nâng cao",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div
            ref={(ref) => ref && connectors.create(ref, <VideoEmbed url="" />)}>
            <Button
              block
              icon={<MdVideoLibrary />}
              style={{ cursor: "move" }}
              size="small">
              Video Embed
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref && connectors.create(ref, <RichText text="Nhập văn bản" />)
            }>
            <Button
              block
              icon={<MdFormatColorText />}
              style={{ cursor: "move" }}
              size="small">
              Rich Text
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(ref, <AdvancedButton label="Nhấp vào đây" />)
            }>
            <Button
              block
              icon={<MdRadioButtonChecked />}
              style={{ cursor: "move" }}
              size="small">
              Advanced Button
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Element is={HeroSection} canvas>
                  <Text text="Hero Content" />
                </Element>,
              )
            }>
            <Button
              block
              icon={<MdGradient />}
              style={{ cursor: "move" }}
              size="small">
              Hero Section
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Element is={GridContent} canvas>
                  {[1, 2, 3].map((i) => (
                    <Element key={i} is={GridItem} canvas>
                      <Text text={`Grid ${i}`} />
                    </Element>
                  ))}
                </Element>,
              )
            }>
            <Button
              block
              icon={<MdDashboard />}
              style={{ cursor: "move" }}
              size="small">
              Grid Content
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <List />)}>
            <Button
              block
              icon={<MdList />}
              style={{ cursor: "move" }}
              size="small">
              Danh sách
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <Carousel />)}>
            <Button
              block
              icon={<MdViewCarousel />}
              style={{ cursor: "move" }}
              size="small">
              Carousel
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <CustomHTML />)}>
            <Button
              block
              icon={<MdCode />}
              style={{ cursor: "move" }}
              size="small">
              Custom HTML
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "step1",
      label: "Bước 1: Form thông tin",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div ref={(ref) => ref && connectors.create(ref, <Header />)}>
            <Button
              block
              icon={<MdTitle />}
              style={{ cursor: "move" }}
              size="small">
              Banner tiêu đề
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <Headline />)}>
            <Button
              block
              icon={<MdTitle />}
              style={{ cursor: "move" }}
              size="small">
              Tiêu đề chính
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <Subtitle />)}>
            <Button
              block
              icon={<MdSubtitles />}
              style={{ cursor: "move" }}
              size="small">
              Tiêu đề phụ
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <UserForm />)}>
            <Button
              block
              icon={<MdInput />}
              style={{ cursor: "move" }}
              size="small">
              Form người dùng
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <InstructorBio />)}>
            <Button
              block
              icon={<MdPerson />}
              style={{ cursor: "move" }}
              size="small">
              Giới thiệu giảng viên
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "step2",
      label: "Bước 2: Trang bán hàng",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div
            ref={(ref) => ref && connectors.create(ref, <SuccessHeadline />)}>
            <Button
              block
              icon={<MdCheckCircle />}
              style={{ cursor: "move" }}
              size="small">
              Tiêu đề thành công
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <VideoPlayer />)}>
            <Button
              block
              icon={<MdPlayCircle />}
              style={{ cursor: "move" }}
              size="small">
              Trình phát video
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <CountdownTimer />)}>
            <Button
              block
              icon={<MdTimer />}
              style={{ cursor: "move" }}
              size="small">
              Đồng hồ đếm ngược
            </Button>
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <SalesPageContent />)}>
            <Button
              block
              icon={<MdCheckCircle />}
              style={{ cursor: "move" }}
              size="small">
              Nội dung bán hàng
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Element is={TwoColumnLayout} canvas>
                  <Text text="Cột trái" />
                  <Text text="Cột phải" />
                </Element>,
              )
            }>
            <Button
              block
              icon={<MdViewWeek />}
              style={{ cursor: "move" }}
              size="small">
              Hai cột
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "step3",
      label: "Bước 3: Thanh toán",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div ref={(ref) => ref && connectors.create(ref, <PaymentQRCode />)}>
            <Button
              block
              icon={<MdQrCode2 />}
              style={{ cursor: "move" }}
              size="small">
              Mã QR thanh toán
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <PaymentInfo />)}>
            <Button
              block
              icon={<MdInfo />}
              style={{ cursor: "move" }}
              size="small">
              Thông tin thanh toán
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <PaymentStatus />)}>
            <Button
              block
              icon={<MdPayment />}
              style={{ cursor: "move" }}
              size="small">
              Trạng thái thanh toán
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "common",
      label: "Thành phần chung",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div ref={(ref) => ref && connectors.create(ref, <Footer />)}>
            <Button
              block
              icon={<MdContactPage />}
              style={{ cursor: "move" }}
              size="small">
              Chân trang
            </Button>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <AntText strong style={{ marginBottom: "16px", display: "block" }}>
        Thành phần
      </AntText>
      <Collapse defaultActiveKey={["basic"]} ghost items={collapseItems} />
    </div>
  );
};

export const SettingsPanel = () => {
  const { selected } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected;
    let selected: any;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.toolbar,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
    };
  });

  const { actions } = useEditor();

  return selected ? (
    <div style={{ padding: "16px" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <AntText strong>
            <MdSettings
              style={{ verticalAlign: "middle", marginRight: "4px" }}
            />
            Cài đặt: {selected.name}
          </AntText>
          {selected.isDeletable && (
            <Button
              danger
              size="small"
              onClick={() => actions.delete(selected.id)}>
              Xóa
            </Button>
          )}
        </div>
        <Divider style={{ margin: "12px 0" }} />
        {selected.settings && React.createElement(selected.settings)}
      </Space>
    </div>
  ) : (
    <div style={{ padding: "32px 16px", textAlign: "center" }}>
      <Empty description="Chọn một thành phần để chỉnh sửa thuộc tính" />
    </div>
  );
};
