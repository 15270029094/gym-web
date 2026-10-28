<script setup>
defineProps({
  name: { type: String, required: true }
})
</script>

<template>
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <g v-if="name === '头颈'" fill="#e24b4b">
      <circle cx="34" cy="16" r="9" />
      <path d="M28 24h10l3 8H30z" />
      <path d="M24 32c8 2 16 2 22-2 1 10-2 16-8 18-6 1-12-2-16-8z" />
    </g>
    <g v-else-if="name === '肩'" fill="#e24b4b">
      <path d="M18 18c8-6 20-6 30 2 2 8-2 14-8 16-4-6-10-8-16-6-2 6-6 10-8 16-6-2-10-10-8-18 4-4 8-6 10-10z" />
      <circle cx="46" cy="22" r="4" fill="#fff" />
    </g>
    <g v-else-if="name === '手和肘'" fill="#e24b4b">
      <path d="M30 6c4 0 6 4 6 8v10c4-1 8 2 8 6v4c0 3-2 5-5 5h-2v8c0 6-4 10-9 10s-8-4-8-10V22c0-4 3-7 6-8V14c0-4 2-8 4-8z" />
    </g>
    <g v-else-if="name === '脊柱'" fill="#e24b4b">
      <rect x="28" y="6" width="8" height="6" rx="2" />
      <rect x="27" y="14" width="10" height="6" rx="2" />
      <rect x="26" y="22" width="12" height="6" rx="2" />
      <rect x="26" y="30" width="12" height="6" rx="2" />
      <rect x="27" y="38" width="10" height="6" rx="2" />
      <path d="M24 46h16l-2 10H28z" />
    </g>
    <g v-else-if="name === '胸'" fill="#e24b4b">
      <path d="M18 16c6-6 22-6 28 0 2 10 2 18 0 26-8 6-20 6-28 0-2-8-2-16 0-26z" />
      <path d="M32 18v22" stroke="#fff" stroke-width="2" />
      <ellipse cx="24" cy="30" rx="5" ry="7" fill="#fff" />
      <ellipse cx="40" cy="30" rx="5" ry="7" fill="#fff" />
    </g>
    <g v-else-if="name === '腹'" fill="#e24b4b">
      <path d="M16 14h32l-2 28c-4 8-24 8-28 0z" />
      <path d="M32 16v24M22 22h20M22 30h20" stroke="#fff" stroke-width="2" />
    </g>
    <g v-else-if="name === '盆(女)'" fill="#e24b4b">
      <path d="M14 24c4-10 32-10 36 0 2 8-2 14-8 16l2 10h-8l-2-8h-4l-2 8h-8l2-10c-6-2-10-8-8-16z" />
    </g>
    <g v-else-if="name === '盆(男)'" fill="#e24b4b">
      <path d="M12 22c6-8 34-8 40 0 2 8 0 14-6 16l4 12h-8l-3-10h-6l-3 10h-8l4-12c-6-2-8-8-6-16z" />
    </g>
    <g v-else-if="name === '髋'" fill="#e24b4b">
      <path d="M10 20c8-8 36-8 44 2-4 8-12 12-20 12S14 30 10 20z" />
      <path d="M30 32l-6 22h8l4-14 4 14h8l-8-22z" />
    </g>
    <g v-else-if="name === '膝和足'" fill="#e24b4b">
      <path d="M30 4h8l2 16-4 6 2 14-8 4-6-14 2-6z" />
      <path d="M22 46c8-4 18-2 24 4 2 6-2 10-10 10H24c-6 0-8-4-2-14z" />
    </g>
    <g v-else-if="name === '全身(男)'" fill="#e24b4b">
      <circle cx="32" cy="8" r="5" />
      <path d="M22 16h20l2 14-6 4v10l4 16h-6l-3-14h-2l-3 14h-6l4-16V34l-6-4z" />
    </g>
    <g v-else fill="#e24b4b">
      <circle cx="32" cy="8" r="5" />
      <path d="M24 16h16l-1 8 5 6-4 4v8l3 16h-6l-2-14h-2l-2 14h-6l3-16v-8l-4-4 5-6z" />
    </g>
  </svg>
</template>
