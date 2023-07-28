import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { nanoid } from '@reduxjs/toolkit';
import EnhancedTable from './TodoGrid';
import styled from '@emotion/styled';
window.addEventListener('online', () => console.log('Became online'));
window.addEventListener('offline', () => console.log('Became offline'));
const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const data = [
  {
    id: nanoid(),
    name: 'test',
    isCompleted: true,
  },
  {
    name: 'test',
    isCompleted: true,
  },
];

function App() {
  const [count, setCount] = useState(0);

  return (
    <Container>
      <EnhancedTable />
    </Container>
  );
}

export default App;
