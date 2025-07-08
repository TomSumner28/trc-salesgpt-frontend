import React from 'react';
import styles from '../styles/Header.module.css';

export default function Header({ onConnect }) {
  return (
    <header className={styles.header}>
      <h1>Sales Dashboard</h1>
      <button onClick={onConnect}>Connect Outlook</button>
    </header>
  );
}
