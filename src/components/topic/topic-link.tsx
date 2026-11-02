import Link from 'next/link';
import { topicById, type TopicId } from '@/content/topics';

/**
 * Link to another topic by name. While the topic is not ready it is plain text followed by
 * "(กำลังพัฒนา)", so no reader lands on a placeholder from inside a lesson.
 */
export function TopicLink({ id }: { id: TopicId }) {
  const t = topicById(id);
  if (t.status !== 'ready')
    return (
      <span data-testid={`topic-link-${id}`}>
        <span className="font-semibold">{t.title}</span> (กำลังพัฒนา)
      </span>
    );
  return (
    <Link
      href={t.href}
      className="link font-semibold link-primary"
      data-testid={`topic-link-${id}`}
    >
      {t.title}
    </Link>
  );
}
