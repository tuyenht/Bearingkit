'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  async function onSave() {
    await fetch('/api/settings', { method: 'POST', body: JSON.stringify({ name }) });
    setSaved(true);
  }

  return (
    <main>
      <h1>Settings</h1>
      <label htmlFor="name">Display name</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={onSave}>Save</button>
      {saved ? <p role="status">Saved</p> : null}
    </main>
  );
}
