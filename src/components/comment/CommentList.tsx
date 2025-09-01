'use client';

import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { commentService } from '../../lib/services/commentService';
import { Comment, CreateCommentRequest } from '../../lib/types/comment';
import { LikeButton } from '../like/LikeButton';

interface CommentListProps {
  taskId: string;
  onCommentCountChange?: (count: number) => void;
}

export function CommentList({ taskId, onCommentCountChange }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchComments = async (pageNum = 0, append = false) => {
    try {
      setLoading(!append);
      setError(null);
      const response = await commentService.getComments(taskId, pageNum);
      
      if (append) {
        setComments(prev => [...prev, ...response.content]);
      } else {
        setComments(response.content);
      }
      
      setHasMore(!response.last);
      setPage(pageNum);
      onCommentCountChange?.(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの読み込みでエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1, true);
    }
  };

  const handleCommentCreated = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    onCommentCountChange?.(comments.length + 1);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    onCommentCountChange?.(comments.length - 1);
  };

  // Organize comments into parent-child structure
  const organizeComments = (comments: Comment[]) => {
    const parentComments = comments.filter(comment => !comment.parentCommentId);
    const childComments = comments.filter(comment => comment.parentCommentId);
    
    return parentComments.map(parent => ({
      ...parent,
      replies: childComments.filter(child => child.parentCommentId === parent.id),
    }));
  };

  const organizedComments = organizeComments(comments);

  if (loading && comments.length === 0) {
    return (
      <Stack align="center" p="md">
        <Text>コメント読み込み中...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack align="center" p="md">
        <Text c="red">{error}</Text>
        <Button onClick={() => fetchComments()} variant="outline" size="sm">
          再試行
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Title order={4}>コメント ({comments.length})</Title>

      <CommentForm
        taskId={taskId}
        onCommentCreated={handleCommentCreated}
      />

      {comments.length === 0 ? (
        <Text c="dimmed" ta="center" p="md">
          コメントはまだありません。最初のコメントを投稿してみましょう！
        </Text>
      ) : (
        <Stack gap="md">
          {organizedComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <CommentItem
                comment={comment}
                taskId={taskId}
                onCommentCreated={handleCommentCreated}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />
              
              {comment.replies && comment.replies.length > 0 && (
                <Stack gap="sm" ml="xl" mt="sm">
                  {comment.replies.map((reply, replyIndex) => (
                    <motion.div
                      key={reply.id}
                      data-testid="comment-reply"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + replyIndex + 1) * 0.1, duration: 0.3 }}
                    >
                      <CommentItem
                        comment={reply}
                        taskId={taskId}
                        isReply
                        onCommentUpdated={handleCommentUpdated}
                        onCommentDeleted={handleCommentDeleted}
                      />
                    </motion.div>
                  ))}
                </Stack>
              )}
            </motion.div>
          ))}

          {hasMore && (
            <Button
              onClick={loadMore}
              loading={loading}
              variant="outline"
              fullWidth
            >
              もっと見る
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

interface CommentFormProps {
  taskId: string;
  parentCommentId?: string;
  onCommentCreated: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
}

function CommentForm({
  taskId,
  parentCommentId,
  onCommentCreated,
  onCancel,
  placeholder = 'コメントを入力してください...',
}: CommentFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCommentRequest>({
    initialValues: {
      content: '',
      parentCommentId,
    },
    validate: {
      content: (value) => {
        if (!value || value.trim().length === 0) {
          return 'コメント内容を入力してください';
        }
        if (value.length > 5000) {
          return 'コメントは5,000文字以内で入力してください';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: CreateCommentRequest) => {
    try {
      setLoading(true);
      const comment = await commentService.createComment(taskId, values);
      onCommentCreated(comment);
      form.reset();
      notifications.show({
        title: 'コメント投稿',
        message: 'コメントを投稿しました',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: 'コメントの投稿に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card p="md" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Textarea
            placeholder={placeholder}
            minRows={3}
            maxRows={8}
            {...form.getInputProps('content')}
          />
          
          <Group justify="flex-end">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                キャンセル
              </Button>
            )}
            <Button
              type="submit"
              loading={loading}
              disabled={!form.values.content.trim()}
            >
              {parentCommentId ? '返信投稿' : 'コメント投稿'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}

interface CommentItemProps {
  comment: Comment;
  taskId: string;
  isReply?: boolean;
  onCommentCreated?: (comment: Comment) => void;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

function CommentItem({
  comment,
  taskId,
  isReply = false,
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  const handleEdit = async (content: string) => {
    try {
      const updatedComment = await commentService.updateComment(comment.id, { content });
      onCommentUpdated(updatedComment);
      setIsEditing(false);
      notifications.show({
        title: 'コメント編集',
        message: 'コメントを編集しました',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: 'コメントの編集に失敗しました',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await commentService.deleteComment(comment.id);
      onCommentDeleted(comment.id);
      notifications.show({
        title: 'コメント削除',
        message: 'コメントを削除しました',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: 'コメントの削除に失敗しました',
        color: 'red',
      });
    }
  };

  const handleLikeChange = (isLiked: boolean, newCount: number) => {
    setLiked(isLiked);
    setLikeCount(newCount);
  };

  return (
    <Card p="sm" radius="md" withBorder>
      <Group align="flex-start" gap="sm">
        <Avatar size="sm" radius="xl">
          {comment.authorDisplayName.charAt(0)}
        </Avatar>

        <div style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" fw={500}>
                {comment.authorDisplayName}
              </Text>
              <Text size="xs" c="dimmed">
                @{comment.authorUsername} • {new Date(comment.createdAt).toLocaleString()}
                {comment.updatedAt !== comment.createdAt && ' (編集済み)'}
              </Text>
            </div>

            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" c="dimmed" size="sm">
                  ⋮
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection="✏️" onClick={() => setIsEditing(true)}>
                  編集
                </Menu.Item>
                <Menu.Item
                  leftSection="🗑️"
                  color="red"
                  onClick={handleDelete}
                >
                  削除
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {isEditing ? (
            <EditCommentForm
              initialContent={comment.content}
              onSave={handleEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Text size="sm" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </Text>
          )}

          <Group gap="md" mt="sm">
            <LikeButton
              type="comment"
              targetId={comment.id}
              initialLiked={liked}
              initialCount={likeCount}
              onLikeChange={handleLikeChange}
              size="xs"
            />

            {!isReply && onCommentCreated && (
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                返信
              </Button>
            )}
          </Group>

          {showReplyForm && onCommentCreated && (
            <Stack mt="md">
              <CommentForm
                taskId={taskId}
                parentCommentId={comment.id}
                onCommentCreated={(newComment) => {
                  onCommentCreated(newComment);
                  setShowReplyForm(false);
                }}
                onCancel={() => setShowReplyForm(false)}
                placeholder="返信を入力してください..."
              />
            </Stack>
          )}
        </div>
      </Group>
    </Card>
  );
}

interface EditCommentFormProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

function EditCommentForm({ initialContent, onSave, onCancel }: EditCommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onSave(content);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm" mt="xs">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          minRows={3}
          maxRows={8}
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            キャンセル
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!content.trim() || content === initialContent}
          >
            保存
          </Button>
        </Group>
      </Stack>
    </form>
  );
}