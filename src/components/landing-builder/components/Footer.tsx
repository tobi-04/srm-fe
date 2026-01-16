import React from 'react';
import { useNode } from '@craftjs/core';
import { Form, Input, Select } from 'antd';

interface FooterProps {
  disclaimerText?: string;
  physicalAddress?: string;
  supportEmail?: string;
  termsLink?: string;
  privacyLink?: string;
  copyrightText?: string;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  style?: React.CSSProperties;
}

export const Footer: React.FC<FooterProps> = ({
  disclaimerText = 'This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc. Results are not typical and may vary. Individual results will depend on work ethic, business skills, and other factors.',
  physicalAddress = 'For Physical Inquiries, Our Address: 99 Wall Street #995, New York, NY 10005',
  supportEmail = 'For Support: support[at]millionairepartnership.com',
  termsLink = '/terms',
  privacyLink = '/privacy',
  copyrightText = 'MillionairePartnership.com Copyright © 2026. All Rights Reserved.',
  backgroundColor = '#ffffff',
  textColor = '#666666',
  linkColor = '#1890ff',
  textAlign = 'center',
  fontSize = 14,
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
        backgroundColor,
        padding: 0,
        textAlign,
        fontFamily: 'sans-serif',
        border: selected ? '2px dashed #1890ff' : 'none',
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: 0,
        }}
      >
        {/* Disclaimer */}
        <p
          style={{
            fontSize: `clamp(${Math.max(11, fontSize * 0.8)}px, ${fontSize}px, ${fontSize}px)`,
            color: textColor,
            lineHeight: 1.6,
            marginBottom: '20px',
          }}
        >
          {disclaimerText}
        </p>

        {/* Physical Address */}
        <p
          style={{
            fontSize: `clamp(${Math.max(11, fontSize * 0.8)}px, ${fontSize}px, ${fontSize}px)`,
            color: textColor,
            marginBottom: '8px',
          }}
        >
          {physicalAddress}
        </p>

        {/* Support Email */}
        <p
          style={{
            fontSize: `clamp(${Math.max(11, fontSize * 0.8)}px, ${fontSize}px, ${fontSize}px)`,
            color: textColor,
            marginBottom: '20px',
          }}
        >
          {supportEmail}
        </p>

        {/* Links */}
        <p
          style={{
            fontSize: `clamp(${Math.max(11, fontSize * 0.8)}px, ${fontSize}px, ${fontSize}px)`,
            marginBottom: '12px',
          }}
        >
          <a
            href={termsLink}
            style={{
              color: linkColor,
              textDecoration: 'none',
            }}
          >
            Terms Of Service
          </a>
          {' - '}
          <a
            href={privacyLink}
            style={{
              color: linkColor,
              textDecoration: 'none',
            }}
          >
            Privacy Policy
          </a>
        </p>

        {/* Copyright */}
        <p
          style={{
            fontSize: `clamp(${Math.max(10, (fontSize - 1) * 0.8)}px, ${fontSize - 1}px, ${fontSize - 1}px)`,
            color: textColor,
            margin: 0,
          }}
        >
          {copyrightText}
        </p>
      </div>
    </div>
  );
};

const FooterSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Disclaimer Text">
        <Input.TextArea
          value={props.disclaimerText}
          onChange={(e) => setProp((props: any) => (props.disclaimerText = e.target.value))}
          rows={4}
        />
      </Form.Item>
      <Form.Item label="Physical Address">
        <Input
          value={props.physicalAddress}
          onChange={(e) => setProp((props: any) => (props.physicalAddress = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Support Email">
        <Input
          value={props.supportEmail}
          onChange={(e) => setProp((props: any) => (props.supportEmail = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Terms Link">
        <Input
          value={props.termsLink}
          onChange={(e) => setProp((props: any) => (props.termsLink = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Privacy Link">
        <Input
          value={props.privacyLink}
          onChange={(e) => setProp((props: any) => (props.privacyLink = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Copyright Text">
        <Input
          value={props.copyrightText}
          onChange={(e) => setProp((props: any) => (props.copyrightText = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Background Color">
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: any) => (props.backgroundColor = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Text Color">
        <Input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((props: any) => (props.textColor = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Link Color">
        <Input
          type="color"
          value={props.linkColor}
          onChange={(e) => setProp((props: any) => (props.linkColor = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Text Align">
        <Select
          value={props.textAlign}
          onChange={(value) => setProp((props: any) => (props.textAlign = value))}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      </Form.Item>
      <Form.Item label="Font Size">
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) => setProp((props: any) => (props.fontSize = parseInt(e.target.value)))}
        />
      </Form.Item>
    </Form>
  );
};

(Footer as any).craft = {
  displayName: 'Footer',
  props: {
    disclaimerText: 'This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc. Results are not typical and may vary. Individual results will depend on work ethic, business skills, and other factors.',
    physicalAddress: 'For Physical Inquiries, Our Address: 99 Wall Street #995, New York, NY 10005',
    supportEmail: 'For Support: support[at]millionairepartnership.com',
    termsLink: '/terms',
    privacyLink: '/privacy',
    copyrightText: 'MillionairePartnership.com Copyright © 2026. All Rights Reserved.',
    backgroundColor: '#ffffff',
    textColor: '#666666',
    linkColor: '#1890ff',
    textAlign: 'center',
    fontSize: 14,
  },
  related: {
    toolbar: FooterSettings,
  },
};
