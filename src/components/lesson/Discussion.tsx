import { useState, useEffect, useRef } from "react";

import {
  List,
  Avatar,
  Button,
  Input,
  Space,
  Typography,
  message,
  Popconfirm,
  Dropdown,
} from "antd";
import { MdReply, MdDelete, MdEdit, MdThumbUp } from "react-icons/md";
import { studentCourseApi } from "../../api/studentCourseApi";
import { getAvatarStyles } from "../../utils/color";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DiscussionProps {
  lessonId: string;
  userId?: string;
}

export default function Discussion({ lessonId, userId }: DiscussionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const isFetching = useRef(false);

  const fetchComments = async (id: string) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const data = await studentCourseApi.getComments(id);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchComments(lessonId);
    }
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await studentCourseApi.createComment(lessonId, {
        content,
        replied_to: replyTo?._id,
      });
      setContent("");
      setReplyTo(null);
      fetchComments(lessonId);

      message.success("Bình luận đã được gửi");
    } catch (error) {
      message.error("Không thể gửi bình luận");
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await studentCourseApi.updateComment(lessonId, editingComment._id, {
        content: editContent,
      });
      setEditingComment(null);
      fetchComments(lessonId);

      message.success("Bình luận đã được cập nhật");
    } catch (error) {
      message.error("Không thể cập nhật bình luận");
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await studentCourseApi.deleteComment(lessonId, commentId);
      fetchComments(lessonId);

      message.success("Bình luận đã được xoá");
    } catch (error) {
      message.error("Không thể xoá bình luận");
    }
  };

  const handleReaction = async (commentId: string, type: string) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để tương tác");
      return;
    }
    try {
      const comment = findComment(commentId);
      if (comment?.userReaction === type) {
        await studentCourseApi.removeReaction(lessonId, commentId);
      } else {
        await studentCourseApi.addReaction(lessonId, commentId, type);
      }
      fetchComments(lessonId);
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const findComment = (id: string) => {
    for (const c of comments) {
      if (c._id === id) return c;
      if (c.replies) {
        const found = c.replies.find((r: any) => r._id === id);
        if (found) return found;
      }
    }
    return null;
  };

  const reactionOptions = [
    { key: "like", label: "👍 Thích", emoji: "👍" },
    { key: "love", label: "❤️ Yêu thích", emoji: "❤️" },
    { key: "haha", label: "😆 Haha", emoji: "😆" },
    { key: "wow", label: "😲 Wow", emoji: "😲" },
    { key: "sad", label: "😢 Buồn", emoji: "😢" },
    { key: "angry", label: "😡 Phẫn nộ", emoji: "😡" },
  ];

  const renderCommentActions = (item: any) => {
    const commentUserId =
      typeof item.user_id === "object" ? item.user_id?._id : item.user_id;
    const isOwner = userId === commentUserId;

    const reactionItems = {
      items: reactionOptions.map((opt) => ({
        key: opt.key,
        label: opt.label,
        onClick: () => handleReaction(item._id, opt.key),
      })),
    };

    return [
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Dropdown menu={reactionItems} placement="bottomLeft" arrow>
          <Button
            type="text"
            size="small"
            className={item.userReaction ? "text-blue-500" : ""}
            icon={item.userReaction ? null : <MdThumbUp />}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {item.userReaction ? (
              <span>
                {reactionOptions.find((o) => o.key === item.userReaction)
                  ?.emoji || ""}{" "}
                {reactionOptions.find((o) => o.key === item.userReaction)
                  ?.label || "Thích"}
              </span>
            ) : (
              <span>Thích</span>
            )}
          </Button>
        </Dropdown>

        {Object.keys(item.reactions || {}).length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: "#fff",
              border: "1px solid #e2e8f0",
              padding: "2px 8px",
              borderRadius: 16,
              cursor: "default",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {Object.entries(item.reactions).map(([key, count]: any) => {
              if (count <= 0) return null;
              const emoji = reactionOptions.find((o) => o.key === key)?.emoji;
              if (!emoji) return null;
              return (
                <span
                  key={key}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#334155",
                  }}
                  title={reactionOptions.find((o) => o.key === key)?.label}
                >
                  <span style={{ fontSize: 15 }}>{emoji}</span> {count}
                </span>
              );
            })}
          </div>
        )}
      </div>,

      <Button
        type="text"
        size="small"
        icon={<MdReply />}
        onClick={() => {
          setReplyTo(item);
          setEditingComment(null);
          setContent(`@${item.user?.name || item.user_id?.name} `);
        }}
      >
        Phản hồi
      </Button>,
      <>
        {isOwner && (
          <Space size={0}>
            <Button
              type="text"
              size="small"
              icon={<MdEdit />}
              onClick={() => {
                setEditingComment(item);
                setEditContent(item.content);
                setReplyTo(null);
              }}
            />
            <Popconfirm
              title="Xoá bình luận này?"
              onConfirm={() => handleDelete(item._id)}
            >
              <Button type="text" size="small" danger icon={<MdDelete />} />
            </Popconfirm>
          </Space>
        )}
      </>,
    ];
  };

  const renderCommentItem = (item: any, isReply = false) => (
    <List.Item
      key={item._id}
      style={{
        padding: isReply ? "12px 12px 12px 48px" : "16px 0",
        borderBottom: isReply ? "none" : "1px solid #f1f5f9",
      }}
      actions={
        editingComment?._id === item._id ? [] : renderCommentActions(item)
      }
    >
      <List.Item.Meta
        avatar={
          <Avatar
            style={getAvatarStyles(
              item.user?.name || item.user_id?.name || "U",
            )}
          >
            {(item.user?.name || item.user_id?.name)?.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Space>
            <Text strong>{item.user?.name || item.user_id?.name}</Text>

            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(item.created_at).fromNow()}
            </Text>
          </Space>
        }
        description={
          editingComment?._id === item._id ? (
            <div style={{ marginTop: 8 }}>
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoSize={{ minRows: 2 }}
              />
              <Space style={{ marginTop: 8 }}>
                <Button size="small" type="primary" onClick={handleUpdate}>
                  Cập nhật
                </Button>
                <Button size="small" onClick={() => setEditingComment(null)}>
                  Hủy
                </Button>
              </Space>
            </div>
          ) : (
            <Paragraph style={{ marginBottom: 4, whiteSpace: "pre-wrap" }}>
              {item.content}
            </Paragraph>
          )
        }
      />
    </List.Item>
  );

  return (
    <div style={{ padding: "0 10px" }}>
      <div style={{ marginBottom: 24 }}>
        {replyTo && (
          <div
            style={{
              marginBottom: 8,
              padding: "4px 12px",
              background: "#f8fafc",
              borderRadius: 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đang phản hồi <b>{replyTo.user?.name || replyTo.user_id?.name}</b>
            </Text>

            <Button type="text" size="small" onClick={() => setReplyTo(null)}>
              Hủy
            </Button>
          </div>
        )}
        <TextArea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            userId
              ? "Viết bình luận của bạn..."
              : "Vui lòng đăng nhập để bình luận"
          }
          disabled={!userId}
          style={{ borderRadius: 8 }}
        />
        <div
          style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!content.trim() || !userId}
            style={{ borderRadius: 6 }}
          >
            Gửi bình luận
          </Button>
        </div>
      </div>

      <List
        loading={loading}
        dataSource={comments}
        renderItem={(item) => (
          <>
            {renderCommentItem(item)}
            {item.replies?.map((reply: any) => renderCommentItem(reply, true))}
          </>
        )}
      />
    </div>
  );
}
