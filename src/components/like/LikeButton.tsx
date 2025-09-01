'use client';

import { ActionIcon, Group, Loader,Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useCallback,useState } from 'react';

import { likeService } from '../../lib/services/likeService';

interface LikeButtonProps {
  type: 'task' | 'comment';
  targetId: string;
  initialLiked: boolean;
  initialCount: number;
  onLikeChange: (liked: boolean, newCount: number) => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function LikeButton({
  type,
  targetId,
  initialLiked,
  initialCount,
  onLikeChange,
  disabled = false,
  size = 'sm',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggleLike = useCallback(async () => {
    if (loading || disabled) return;

    try {
      setLoading(true);
      
      let result;
      if (type === 'task') {
        result = await likeService.toggleTaskLike(targetId);
      } else {
        result = await likeService.toggleCommentLike(targetId);
      }

      const isNowLiked = result !== null;
      const newCount = isNowLiked ? count + 1 : count - 1;
      
      setLiked(isNowLiked);
      setCount(newCount);
      onLikeChange(isNowLiked, newCount);

    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: 'いいねの更新に失敗しました',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [type, targetId, liked, count, loading, disabled, onLikeChange]);

  const getAriaLabel = () => {
    const target = type === 'task' ? 'タスク' : 'コメント';
    const action = liked ? 'いいねを取り消す' : 'いいねする';
    return `${target}を${action} (現在 ${count} いいね)`;
  };

  return (
    <motion.div
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
    >
      <Group gap={4} align="center">
        <ActionIcon
          variant={liked ? 'filled' : 'subtle'}
          color={liked ? 'red' : 'gray'}
          size={size}
          onClick={handleToggleLike}
          disabled={disabled}
          aria-pressed={liked}
          aria-label={getAriaLabel()}
          data-liked={liked}
          data-loading={loading}
          style={{
            transition: 'all 0.2s ease',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <Loader size="xs" color={liked ? 'white' : 'gray'} />
          ) : (
            <motion.span
              animate={{ 
                scale: liked ? [1, 1.2, 1] : 1,
                rotate: liked ? [0, 10, -5, 0] : 0
              }}
              transition={{ duration: 0.3 }}
            >
              {liked ? '❤️' : '🤍'}
            </motion.span>
          )}
        </ActionIcon>
        
        <Text 
          size={size} 
          c={liked ? 'red' : 'dimmed'}
          fw={liked ? 600 : 400}
          style={{ transition: 'all 0.2s ease' }}
        >
          {count}
        </Text>
      </Group>
    </motion.div>
  );
}