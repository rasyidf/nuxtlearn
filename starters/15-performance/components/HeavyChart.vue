<script setup lang="ts">
// Simulates a heavy component (like a charting library).
// In real apps this might be Chart.js, D3, or ECharts — all heavy bundles.
// Using Lazy prefix + v-if ensures this is code-split and only loaded on demand.

const rows = 12
const cols = 24

const data = Array.from({ length: rows }, (_, row) =>
  Array.from({ length: cols }, (_, col) => Math.floor(Math.random() * 100))
)
</script>

<template>
  <div>
    <h3 style="margin-bottom: 0.5rem;">📊 Heavy Chart Component (Code-Split)</h3>
    <p style="color: #888; font-size: 0.85rem; margin-bottom: 1rem;">
      This simulates a large charting library. It's loaded lazily via the <code>Lazy</code> prefix.
    </p>

    <div style="overflow-x: auto;">
      <table style="border-collapse: collapse; font-size: 0.75rem; width: 100%;">
        <thead>
          <tr>
            <th style="padding: 4px 8px; border: 1px solid #444; background: #2a2a3e;">Hour</th>
            <th
              v-for="col in cols"
              :key="col"
              style="padding: 4px 8px; border: 1px solid #444; background: #2a2a3e;"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIdx) in data" :key="rowIdx">
            <td style="padding: 4px 8px; border: 1px solid #444; font-weight: bold; background: #2a2a3e;">
              Month {{ rowIdx + 1 }}
            </td>
            <td
              v-for="(cell, colIdx) in row"
              :key="colIdx"
              :style="{
                padding: '4px 8px',
                border: '1px solid #444',
                background: `hsl(${200 + cell}, 60%, ${20 + cell * 0.3}%)`,
                textAlign: 'center',
              }"
            >
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
