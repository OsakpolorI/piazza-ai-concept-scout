import { useState } from 'react';
import MockPost from './MockPost';

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
    title: 'What is the difference between RAM and storage?',
    body: "I hear these terms a lot but I'm not sure how they differ. Why does my program run faster when things are in RAM versus on disk?",
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
  const [selectedId, setSelectedId] = useState(INITIAL_POSTS[0].id);

  return (
    <div>
      <header style={HEADER_STYLE}>Core Computer Science Fundamentals</header>
      <div style={LAYOUT_STYLE}>
        <aside style={SIDEBAR_STYLE}>
          {INITIAL_POSTS.map((post) => (
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
          {INITIAL_POSTS.map((post) => (
            <div
              key={post.id}
              style={{ display: selectedId === post.id ? 'block' : 'none' }}
            >
              <MockPost
                initialTitle={post.title}
                initialBody={post.body}
                postId={post.id}
                onExplain={onRequestExplain}
              />
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default Forum;
