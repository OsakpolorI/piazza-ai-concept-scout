import { useState } from 'react';
import ReadOnlyPost from './ReadOnlyPost';
import CreatePostForm from './CreatePostForm';
import PinnedPost from './PinnedPost';

const PINNED_POST_ID = 0;

const INITIAL_POSTS = [
  {
    id: 1,
    title: 'What is the difference between a stack and a queue?',
    body: "I'm confused about when to use each. Can someone explain the key difference and give a simple example of when you'd pick one over the other?",
  },
  {
    id: 2,
    title: 'How does recursion actually work?',
    body: "I understand the base case and recursive case in theory, but I'm struggling to trace through what happens step by step when a recursive function runs. How does the call stack work here?",
  },
  {
    id: 3,
    title: 'What is Big-O notation in simple terms?',
    body: "I keep seeing O(n) and O(log n) in the lectures. What do these actually mean in practice? How do I know which one is better?",
  },
  {
    id: 4,
    title: 'Best pizza toppings for a Monday night?',
    body: "I'm thinking of ordering pizza tonight. What are everyone's favorite topping combinations? Do you prefer pepperoni, vegetarian, or something else?",
  },
  {
    id: 5,
    title: 'What does it mean when something runs in constant time?',
    body: "The professor said hash table lookup is O(1). What does constant time actually mean? Does it mean it's always instant?",
  },
];

const SIDEBAR_STYLE = {
  width: '280px',
  minWidth: '280px',
  borderRight: '1px solid #e5e7eb',
  padding: '16px',
  backgroundColor: '#fafafa',
};

const POST_ITEM_STYLE = (isSelected) => ({
  padding: '12px',
  marginBottom: '4px',
  cursor: 'pointer',
  borderRadius: '6px',
  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
  borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
});

const POST_ITEM_TITLE = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#333',
  marginBottom: '4px',
};

const POST_ITEM_META = {
  fontSize: '11px',
  color: '#999',
};

const MAIN_STYLE = {
  flex: 1,
  padding: '24px 32px',
  overflowY: 'auto',
};

const LAYOUT_STYLE = {
  display: 'flex',
  minHeight: '100vh',
};

const HEADER_STYLE = {
  padding: '16px 24px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  fontSize: '18px',
  fontWeight: 600,
};

function Forum({ onRequestExplain }) {
  const [selectedId, setSelectedId] = useState(PINNED_POST_ID);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [nextId, setNextId] = useState(INITIAL_POSTS.length + 1);

  const handleCreatePost = ({ title, body }) => {
    const newPost = {
      id: nextId,
      title,
      body,
    };
    setPosts([...posts, newPost]);
    setNextId(nextId + 1);
    setSelectedId(newPost.id);
  };

  return (
    <div>
      <header style={HEADER_STYLE}>Piazza AI Concept Scout — Live Demo</header>
      <div style={LAYOUT_STYLE}>
        <aside style={SIDEBAR_STYLE}>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Posts
          </div>
          <div
            style={POST_ITEM_STYLE(selectedId === PINNED_POST_ID)}
            onClick={() => setSelectedId(PINNED_POST_ID)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedId(PINNED_POST_ID)}
            role="button"
            tabIndex={0}
          >
            <div style={POST_ITEM_TITLE}>📌 Welcome & Instructions</div>
            <div style={POST_ITEM_META}>pinned</div>
          </div>
          {posts.map((post) => (
            <div
              key={post.id}
              style={POST_ITEM_STYLE(selectedId === post.id)}
              onClick={() => setSelectedId(post.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedId(post.id)}
              role="button"
              tabIndex={0}
            >
              <div style={POST_ITEM_TITLE}>{post.title}</div>
              <div style={POST_ITEM_META}>question @{post.id}</div>
            </div>
          ))}
        </aside>
        <main style={MAIN_STYLE}>
          {selectedId === PINNED_POST_ID && <PinnedPost />}
          {posts.map((post) => (
            <div
              key={post.id}
              style={{ display: selectedId === post.id ? 'block' : 'none' }}
            >
              <ReadOnlyPost
                title={post.title}
                body={post.body}
                postId={post.id}
                onExplain={onRequestExplain}
              />
            </div>
          ))}
          {selectedId !== PINNED_POST_ID && posts.some((p) => p.id === selectedId) && (
            <CreatePostForm onPostCreate={handleCreatePost} />
          )}
        </main>
      </div>
    </div>
  );
}

export default Forum;
