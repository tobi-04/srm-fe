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
} from "./components";

const { Text: AntText } = Typography;

export const Toolbox = () => {
  const { connectors } = useEditor();

  const collapseItems = [
    {
      key: "basic",
      label: "Basic Components",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div
            ref={(ref) =>
              ref && connectors.create(ref, <Text text="New Text" />)
            }>
            <Button block icon={<MdTextFields />} style={{ cursor: "move" }}>
              Text
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <BuilderButton text="Click Me" type="primary" />
              )
            }>
            <Button block icon={<MdSmartButton />} style={{ cursor: "move" }}>
              Button
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Element is={Container} padding={20} canvas>
                  <Text text="Empty Container" />
                </Element>
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
                <Image src="https://via.placeholder.com/150" />
              )
            }>
            <Button block icon={<MdImage />} style={{ cursor: "move" }}>
              Image
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "step1",
      label: "Step 1: User Info Form",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div ref={(ref) => ref && connectors.create(ref, <Header />)}>
            <Button
              block
              icon={<MdTitle />}
              style={{ cursor: "move" }}
              size="small">
              Header Banner
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <Headline />)}>
            <Button
              block
              icon={<MdTitle />}
              style={{ cursor: "move" }}
              size="small">
              Headline
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <Subtitle />)}>
            <Button
              block
              icon={<MdSubtitles />}
              style={{ cursor: "move" }}
              size="small">
              Subtitle
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <UserForm />)}>
            <Button
              block
              icon={<MdInput />}
              style={{ cursor: "move" }}
              size="small">
              User Form
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <InstructorBio />)}>
            <Button
              block
              icon={<MdPerson />}
              style={{ cursor: "move" }}
              size="small">
              Instructor Bio
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "step2",
      label: "Step 2: Sales Page",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div
            ref={(ref) => ref && connectors.create(ref, <SuccessHeadline />)}>
            <Button
              block
              icon={<MdCheckCircle />}
              style={{ cursor: "move" }}
              size="small">
              Success Headline
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <VideoPlayer />)}>
            <Button
              block
              icon={<MdPlayCircle />}
              style={{ cursor: "move" }}
              size="small">
              Video Player
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <CountdownTimer />)}>
            <Button
              block
              icon={<MdTimer />}
              style={{ cursor: "move" }}
              size="small">
              Countdown Timer
            </Button>
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <SalesPageContent />)}>
            <Button
              block
              icon={<MdCheckCircle />}
              style={{ cursor: "move" }}
              size="small">
              Sales Content
            </Button>
          </div>
          <div
            ref={(ref) =>
              ref &&
              connectors.create(
                ref,
                <Element is={TwoColumnLayout} canvas>
                  <Text text="Left Column" />
                  <Text text="Right Column" />
                </Element>
              )
            }>
            <Button
              block
              icon={<MdViewWeek />}
              style={{ cursor: "move" }}
              size="small">
              Two Columns
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "step3",
      label: "Step 3: Payment",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div ref={(ref) => ref && connectors.create(ref, <PaymentQRCode />)}>
            <Button
              block
              icon={<MdQrCode2 />}
              style={{ cursor: "move" }}
              size="small">
              Payment QR Code
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <PaymentInfo />)}>
            <Button
              block
              icon={<MdInfo />}
              style={{ cursor: "move" }}
              size="small">
              Payment Info
            </Button>
          </div>
          <div ref={(ref) => ref && connectors.create(ref, <PaymentStatus />)}>
            <Button
              block
              icon={<MdPayment />}
              style={{ cursor: "move" }}
              size="small">
              Payment Status
            </Button>
          </div>
        </Space>
      ),
    },
    {
      key: "common",
      label: "Common Components",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <div ref={(ref) => ref && connectors.create(ref, <Footer />)}>
            <Button
              block
              icon={<MdContactPage />}
              style={{ cursor: "move" }}
              size="small">
              Footer
            </Button>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <AntText strong style={{ marginBottom: "16px", display: "block" }}>
        Components
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
            Settings: {selected.name}
          </AntText>
          {selected.isDeletable && (
            <Button
              danger
              size="small"
              onClick={() => actions.delete(selected.id)}>
              Delete
            </Button>
          )}
        </div>
        <Divider style={{ margin: "12px 0" }} />
        {selected.settings && React.createElement(selected.settings)}
      </Space>
    </div>
  ) : (
    <div style={{ padding: "32px 16px", textAlign: "center" }}>
      <Empty description="Select a component to edit its properties" />
    </div>
  );
};
