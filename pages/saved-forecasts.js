import Head from 'next/head';
import Link from 'next/link';
import { useSavedForecasts } from '../lib/useSavedForecasts';

export default function SavedForecasts() {
  const [forecasts, , removeForecast] = useSavedForecasts();
  return (
    <>
      <Head>
        <title>Saved Forecasts</title>
      </Head>
      <main className="container">
        <div className="top-bar">
          <Link href="/">Forecasting</Link>
          <Link href="/publishers" style={{ marginLeft: '20px' }}>Publishers</Link>
          <Link href="/publisher-forecast" style={{ marginLeft: '20px' }}>
            Publisher Forecasts
          </Link>
          <Link href="/saved-forecasts" style={{ marginLeft: '20px' }}>
            Saved Forecasts
          </Link>
        </div>
        <h1>Saved Forecasts</h1>
        {forecasts.length === 0 ? (
          <p>No saved forecasts.</p>
        ) : (
          <table className="monthly-table">
            <thead>
              <tr>
                <th>Retailer/Publisher</th>
                <th>Date Saved</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f) => (
                <tr key={f.id}>
                  <td>{f.retailer || f.publisher || 'Forecast'}</td>
                  <td>{new Date(f.savedAt).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => removeForecast(f.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
