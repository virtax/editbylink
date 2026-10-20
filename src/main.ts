import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <header style="padding: 1rem; border-bottom: 1px solid var(--border-color); background: var(--header-bg);">
      <h1>EditByLink</h1>
    </header>
    <main style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <p>Project initialized (Phase 0.1).</p>
    </main>
  `;
}
