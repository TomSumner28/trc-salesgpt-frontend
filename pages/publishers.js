import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePublishers, DEFAULT_PUBLISHERS } from '../lib/usePublishers';

export default function PublisherAdmin() {
  const [publishers, setPublishers] = usePublishers();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    network: '',
    sub: '',
    regions: 'UK',
    reach: '',
    newCustomers: false,
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ network: '', sub: '', regions: 'UK', reach: '', newCustomers: false });
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      network: p.network,
      sub: p.sub,
      regions: p.regions.join(','),
      reach: p.reach,
      newCustomers: p.newCustomers,
    });
  };

  const savePublisher = (e) => {
    e.preventDefault();
    const regions = form.regions.split(',').map((r) => r.trim().toUpperCase());
    const updated = { ...form, regions, reach: parseInt(form.reach, 10) || 0, id: editing ?? Date.now() };
    setPublishers((prev) => {
      if (editing) {
        return prev.map((p) => (p.id === editing ? updated : p));
      }
      return [...prev, updated];
    });
    resetForm();
  };

  const removePublisher = (id) => {
    if (confirm('Delete publisher?')) {
      setPublishers((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const restoreDefaults = () => {
    if (confirm('Restore default data?')) {
      setPublishers(DEFAULT_PUBLISHERS);
    }
  };

  return (
    <>
      <Head>
        <title>Publisher Data</title>
      </Head>
      <main className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/">Back</Link>
          <button type="button" onClick={restoreDefaults}>Restore Defaults</button>
        </div>
        <h1>Publishers</h1>
        <table className="monthly-table">
          <thead>
            <tr>
              <th>Network</th>
              <th>Sub Publishers</th>
              <th>Regions</th>
              <th>Reach</th>
              <th>New Customers</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((p) => (
              <tr key={p.id}>
                <td>{p.network}</td>
                <td>{p.sub}</td>
                <td>{p.regions.join(', ')}</td>
                <td>{p.reach.toLocaleString()}</td>
                <td>{p.newCustomers ? 'Yes' : 'No'}</td>
                <td>
                  <button type="button" onClick={() => startEdit(p)}>Edit</button>{' '}
                  <button type="button" onClick={() => removePublisher(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={savePublisher} className="form" style={{ marginTop: '20px' }}>
          <h3>{editing ? 'Edit Publisher' : 'Add Publisher'}</h3>
          <label className="full-width">
            Network
            <input value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} required />
          </label>
          <label className="full-width">
            Sub Publishers
            <input value={form.sub} onChange={(e) => setForm({ ...form, sub: e.target.value })} required />
          </label>
          <label>
            Regions (comma separated e.g. UK,US)
            <input value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} />
          </label>
          <label>
            Reach
            <input type="number" value={form.reach} onChange={(e) => setForm({ ...form, reach: e.target.value })} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={form.newCustomers} onChange={(e) => setForm({ ...form, newCustomers: e.target.checked })} /> New Customers
          </label>
          <button type="submit" className="full-width">{editing ? 'Save' : 'Add'}</button>
        </form>
      </main>
    </>
  );
}
