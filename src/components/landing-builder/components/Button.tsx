import React from 'react';
import { useNode } from '@craftjs/core';
import { Button as AntButton, Form, Input, Select } from 'antd';

interface ButtonProps {
  text: string;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  size?: 'large' | 'middle' | 'small';
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  type = 'primary',
  size = 'middle',
  style,
  onClick,
}) => {
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
        display: 'inline-block',
        border: selected ? '1px dashed #1890ff' : '1px transparent solid',
        ...style 
      }}
    >
      <AntButton type={type} size={size} onClick={onClick}>
        {text}
      </AntButton>
    </div>
  );
};

const ButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Button Text">
        <Input
          value={props.text}
          onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Type">
        <Select
          value={props.type}
          onChange={(value) => setProp((props: any) => (props.type = value))}
          options={[
            { value: 'primary', label: 'Primary' },
            { value: 'default', label: 'Default' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'link', label: 'Link' },
            { value: 'text', label: 'Text' },
          ]}
        />
      </Form.Item>
      <Form.Item label="Size">
        <Select
          value={props.size}
          onChange={(value) => setProp((props: any) => (props.size = value))}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'middle', label: 'Middle' },
            { value: 'large', label: 'Large' },
          ]}
        />
      </Form.Item>
    </Form>
  );
};

(Button as any).craft = {
  displayName: 'Button',
  props: {
    text: 'Click Me',
    type: 'primary',
    size: 'middle',
  },
  related: {
    toolbar: ButtonSettings,
  },
};

