import React from 'react';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li>Team</li>
          <li>Internal Knowledge Base</li>
          <li>Retailer Forecasting Tool</li>
          <li>Quick Response</li>
        </ul>
      </nav>
    </aside>
  );
}
