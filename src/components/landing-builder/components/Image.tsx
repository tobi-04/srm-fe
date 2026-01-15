import React from 'react';
import { useNode } from '@craftjs/core';
import { Image as AntImage, Form, Input } from 'antd';

interface ImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = 'Image',
  width = '100%',
  height = 'auto',
  style,
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
        border: selected ? '1px dashed #1890ff' : '1px transparent solid',
        ...style 
      }}
    >
      <AntImage src={src} alt={alt} width={width} height={height} preview={false} />
    </div>
  );
};

const ImageSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Image URL">
        <Input
          value={props.src}
          onChange={(e) => setProp((props: any) => (props.src = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Alt Text">
        <Input
          value={props.alt}
          onChange={(e) => setProp((props: any) => (props.alt = e.target.value))}
        />
      </Form.Item>
    </Form>
  );
};

Image.craft = {
  displayName: 'Image',
  props: {
    src: 'https://via.placeholder.com/400x200',
    alt: 'Image',
    width: '100%',
    height: 'auto',
  },
  related: {
    toolbar: ImageSettings,
  },
};

