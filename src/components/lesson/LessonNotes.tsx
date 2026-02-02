import { useState, useEffect } from "react";
import {
  Input,
  Button,
  List,
  Space,
  Typography,
  message,
  Popconfirm,
  Empty,
  Spin,
} from "antd";
import { MdDelete, MdEdit, MdAdd } from "react-icons/md";

import { studentCourseApi } from "../../api/studentCourseApi";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

interface LessonNotesProps {
  lessonId: string;
}

export default function LessonNotes({ lessonId }: LessonNotesProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await studentCourseApi.getNotes(lessonId);
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) fetchNotes();
  }, [lessonId]);

  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      await studentCourseApi.createNote(lessonId, { content });
      setContent("");
      setIsAdding(false);
      fetchNotes();
      message.success("Ghi chú đã được lưu");
    } catch (error) {
      message.error("Không thể lưu ghi chú");
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await studentCourseApi.updateNote(lessonId, editingNote._id, {
        content: editContent,
      });
      setEditingNote(null);
      fetchNotes();
      message.success("Ghi chú đã được cập nhật");
    } catch (error) {
      message.error("Không thể cập nhật ghi chú");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await studentCourseApi.deleteNote(lessonId, id);
      fetchNotes();
      message.success("Ghi chú đã được xoá");
    } catch (error) {
      message.error("Không thể xoá ghi chú");
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Ghi chú của tôi
        </Title>
        {!isAdding && (
          <Button
            type="primary"
            icon={<MdAdd />}
            onClick={() => setIsAdding(true)}
            style={{ borderRadius: 6 }}
          >
            Thêm ghi chú
          </Button>
        )}
      </div>

      {isAdding && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            background: "#f8fafc",
          }}
        >
          <TextArea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung ghi chú..."
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsAdding(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleSave}
              disabled={!content.trim()}
            >
              Lưu ghi chú
            </Button>
          </Space>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : notes.length === 0 ? (
        <Empty description="Bạn chưa có ghi chú nào cho bài học này" />
      ) : (
        <List
          dataSource={notes}
          renderItem={(item) => (
            <List.Item
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 16,
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
                </Text>
                <Space size={0}>
                  <Button
                    type="text"
                    size="small"
                    icon={<MdEdit />}
                    onClick={() => {
                      setEditingNote(item);
                      setEditContent(item.content);
                    }}
                  />
                  <Popconfirm
                    title="Xoá ghi chú này?"
                    onConfirm={() => handleDelete(item._id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<MdDelete />}
                    />
                  </Popconfirm>
                </Space>
              </div>

              {editingNote?._id === item._id ? (
                <div style={{ width: "100%" }}>
                  <TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoSize={{ minRows: 2 }}
                    style={{ marginBottom: 12 }}
                  />
                  <Space
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button size="small" onClick={() => setEditingNote(null)}>
                      Hủy
                    </Button>
                    <Button size="small" type="primary" onClick={handleUpdate}>
                      Cập nhật
                    </Button>
                  </Space>
                </div>
              ) : (
                <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {item.content}
                </Paragraph>
              )}
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
