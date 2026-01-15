import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Card, Button, Space, Typography, Divider, Empty } from 'antd';
import { 
  MdTextFields, 
  MdSmartButton, 
  MdCropSquare, 
  MdImage,
  MdSettings
} from 'react-icons/md';
import { Text, Button as BuilderButton, Container, Image } from './components';

const { Text: AntText } = Typography;

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div style={{ padding: '16px' }}>
      <AntText strong style={{ marginBottom: '16px', display: 'block' }}>
        Components
      </AntText>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div
          ref={(ref) =>
            ref &&
            connectors.create(ref, <Text text="New Text" />)
          }
        >
          <Button block icon={<MdTextFields />} style={{ cursor: 'move' }}>
            Text
          </Button>
        </div>
        <div
          ref={(ref) =>
            ref &&
            connectors.create(ref, <BuilderButton text="Click Me" type="primary" />)
          }
        >
          <Button block icon={<MdSmartButton />} style={{ cursor: 'move' }}>
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
          }
        >
          <Button block icon={<MdCropSquare />} style={{ cursor: 'move' }}>
            Container
          </Button>
        </div>
        <div
          ref={(ref) =>
            ref &&
            connectors.create(ref, <Image />)
          }
        >
          <Button block icon={<MdImage />} style={{ cursor: 'move' }}>
            Image
          </Button>
        </div>
      </Space>
    </div>
  );
};

export const SettingsPanel = () => {
  const { selected, query } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.toolbar,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
    };
  });

  const { actions } = useEditor();

  return selected ? (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <AntText strong>
            <MdSettings style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Settings: {selected.name}
          </AntText>
          {selected.isDeletable && (
            <Button 
              danger 
              size="small" 
              onClick={() => actions.delete(selected.id)}
            >
              Delete
            </Button>
          )}
        </div>
        <Divider style={{ margin: '12px 0' }} />
        {selected.settings && React.createElement(selected.settings)}
      </Space>
    </div>
  ) : (
    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
      <Empty description="Select a component to edit its properties" />
    </div>
  );
};
