import React from "react";
import { Card, Checkbox, Input, Empty, Typography, Spin } from "antd";
import { MdSearch, MdDragIndicator } from "react-icons/md";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Text } = Typography;

interface TransferItem {
  key: string;
  title: string;
  description?: string;
}

interface DragDropTransferProps {
  dataSource: TransferItem[];
  targetKeys: string[];
  onChange: (targetKeys: string[]) => void;
  titles?: [string, string];
  height?: number;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
}

interface SortableItemProps {
  item: TransferItem;
  isSelected: boolean;
  onSelect: (key: string, checked: boolean) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`transfer-item ${isSelected ? "selected" : ""}`}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          cursor: "move",
          backgroundColor: isSelected ? "#e6f7ff" : "#fff",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          marginBottom: "4px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = "#fff";
          }
        }}>
        <div {...listeners} style={{ marginRight: 8, cursor: "grab" }}>
          <MdDragIndicator size={16} color="#8c8c8c" />
        </div>
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(item.key, e.target.checked)}
          style={{ marginRight: 8 }}
        />
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 13 }}>
            {item.title}
          </Text>
          {item.description && (
            <Text
              type="secondary"
              style={{ display: "block", fontSize: 11, marginTop: 2 }}>
              {item.description}
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};

// Droppable zone component for empty areas
interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  height: number;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  children,
  height,
  onScroll,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      onScroll={onScroll}
      style={{
        height,
        overflowY: "auto",
        border: `2px dashed ${isOver ? "#1890ff" : "transparent"}`,
        borderRadius: 4,
        padding: 8,
        backgroundColor: isOver ? "#e6f7ff" : "transparent",
        transition: "all 0.2s",
      }}>
      {children}
    </div>
  );
};

export const DragDropTransfer: React.FC<DragDropTransferProps> = ({
  dataSource,
  targetKeys,
  onChange,
  titles = ["Source", "Target"],
  height = 400,
  onLoadMore,
  loading = false,
  hasMore = false,
}) => {
  const [searchLeft, setSearchLeft] = React.useState("");
  const [searchRight, setSearchRight] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const leftItems = dataSource.filter(
    (item) =>
      !targetKeys.includes(item.key) &&
      item.title.toLowerCase().includes(searchLeft.toLowerCase()),
  );

  const rightItems = dataSource.filter(
    (item) =>
      targetKeys.includes(item.key) &&
      item.title.toLowerCase().includes(searchRight.toLowerCase()),
  );

  const handleSelect = (key: string, checked: boolean) => {
    setSelectedKeys((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeKey = active.id as string;
    const overKey = over.id as string;

    const isActiveInTarget = targetKeys.includes(activeKey);
    const isOverInTarget = targetKeys.includes(overKey);

    // Check if dropped on a dropzone
    if (overKey === "left-dropzone") {
      if (isActiveInTarget) {
        // Move from right to left
        onChange(targetKeys.filter((key) => key !== activeKey));
        setSelectedKeys([]);
      }
      return;
    } else if (overKey === "right-dropzone") {
      if (!isActiveInTarget) {
        // Move from left to right
        onChange([...targetKeys, activeKey]);
        setSelectedKeys([]);
      }
      return;
    }

    // Dragging between different lists (when dropping on an item)
    if (isActiveInTarget !== isOverInTarget) {
      if (isActiveInTarget) {
        // Moving from right to left
        onChange(targetKeys.filter((key) => key !== activeKey));
      } else {
        // Moving from left to right
        onChange([...targetKeys, activeKey]);
      }
      setSelectedKeys([]);
    } else if (active.id !== over.id) {
      // Reordering within the same list (only for right panel)
      if (isActiveInTarget) {
        const oldIndex = rightItems.findIndex((item) => item.key === activeKey);
        const newIndex = rightItems.findIndex((item) => item.key === overKey);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(rightItems, oldIndex, newIndex);
          const newTargetKeys = newOrder.map((item) => item.key);
          onChange(newTargetKeys);
        }
      }
    }
  };

  const moveToRight = () => {
    const keysToMove = selectedKeys.filter((key) => !targetKeys.includes(key));
    if (keysToMove.length > 0) {
      onChange([...targetKeys, ...keysToMove]);
      setSelectedKeys([]);
    }
  };

  const moveToLeft = () => {
    const keysToMove = selectedKeys.filter((key) => targetKeys.includes(key));
    if (keysToMove.length > 0) {
      onChange(targetKeys.filter((key) => !keysToMove.includes(key)));
      setSelectedKeys([]);
    }
  };

  // Handle scroll for infinite loading
  const handleLeftScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPercentage =
      (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;

    // Load more when scrolled 80% down
    if (scrollPercentage > 80 && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  const activeItem = dataSource.find((item) => item.key === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 16 }}>
        {/* Left Panel */}
        <Card
          title={titles[0]}
          size="small"
          style={{ flex: 1, minWidth: 0 }}
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {leftItems.length} items
            </Text>
          }>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<MdSearch />}
            value={searchLeft}
            onChange={(e) => setSearchLeft(e.target.value)}
            style={{ marginBottom: 12 }}
            size="small"
          />
          <DroppableZone
            id="left-dropzone"
            height={height}
            onScroll={handleLeftScroll}>
            {leftItems.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu"
              />
            ) : (
              <>
                <SortableContext
                  items={leftItems.map((item) => item.key)}
                  strategy={verticalListSortingStrategy}>
                  {leftItems.map((item) => (
                    <SortableItem
                      key={item.key}
                      item={item}
                      isSelected={selectedKeys.includes(item.key)}
                      onSelect={handleSelect}
                    />
                  ))}
                </SortableContext>
                {loading && (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <Spin size="small" />
                    <Text
                      type="secondary"
                      style={{ marginLeft: 8, fontSize: 12 }}>
                      Đang tải...
                    </Text>
                  </div>
                )}
              </>
            )}
          </DroppableZone>
        </Card>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
          }}>
          <button
            onClick={moveToRight}
            disabled={
              selectedKeys.filter((k) => !targetKeys.includes(k)).length === 0
            }
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              backgroundColor: "#fff",
              fontSize: 20,
            }}>
            →
          </button>
          <button
            onClick={moveToLeft}
            disabled={
              selectedKeys.filter((k) => targetKeys.includes(k)).length === 0
            }
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              backgroundColor: "#fff",
              fontSize: 20,
            }}>
            ←
          </button>
        </div>

        {/* Right Panel */}
        <Card
          title={titles[1]}
          size="small"
          style={{ flex: 1, minWidth: 0 }}
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {rightItems.length} items
            </Text>
          }>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<MdSearch />}
            value={searchRight}
            onChange={(e) => setSearchRight(e.target.value)}
            style={{ marginBottom: 12 }}
            size="small"
          />
          <DroppableZone id="right-dropzone" height={height}>
            {rightItems.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có khóa học nào"
              />
            ) : (
              <SortableContext
                items={rightItems.map((item) => item.key)}
                strategy={verticalListSortingStrategy}>
                {rightItems.map((item) => (
                  <SortableItem
                    key={item.key}
                    item={item}
                    isSelected={selectedKeys.includes(item.key)}
                    onSelect={handleSelect}
                  />
                ))}
              </SortableContext>
            )}
          </DroppableZone>
        </Card>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#fff",
              border: "2px solid #1890ff",
              borderRadius: 4,
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              cursor: "grabbing",
            }}>
            <Text strong>{activeItem.title}</Text>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
