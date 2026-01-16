import React from 'react';
import { useNode } from '@craftjs/core';
import { Typography, Input, Select, Form } from 'antd';

const { Title, Paragraph } = Typography;

interface TextProps {
  text: string;
  type?: 'title' | 'paragraph';
  level?: 1 | 2 | 3 | 4 | 5;
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({ text, type = 'paragraph', level = 3, style }) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{ 
        padding: '8px', 
        border: selected ? '1px dashed #1890ff' : '1px transparent solid',
        ...style 
      }}
    >
      {type === 'title' ? (
        <Title level={level as any}>{text}</Title>
      ) : (
        <Paragraph>{text}</Paragraph>
      )}
    </div>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Text Content">
        <Input.TextArea
          value={props.text}
          onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Type">
        <Select
          value={props.type}
          onChange={(value) => setProp((props: any) => (props.type = value))}
          options={[
            { value: 'title', label: 'Title' },
            { value: 'paragraph', label: 'Paragraph' },
          ]}
        />
      </Form.Item>
      {props.type === 'title' && (
        <Form.Item label="Title Level">
          <Select
            value={props.level}
            onChange={(value) => setProp((props: any) => (props.level = value))}
            options={[
              { value: 1, label: 'Level 1' },
              { value: 2, label: 'Level 2' },
              { value: 3, label: 'Level 3' },
              { value: 4, label: 'Level 4' },
            ]}
          />
        </Form.Item>
      )}
    </Form>
  );
};

(Text as any).craft = {
  displayName: 'Text',
  props: {
    text: 'Edit this text',
    type: 'paragraph',
    level: 3,
  },
  related: {
    toolbar: TextSettings,
  },
};

