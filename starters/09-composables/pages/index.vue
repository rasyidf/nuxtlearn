<script setup lang="ts">
const { count, doubled, increment, decrement, reset } = useCounter(5)
const { success, error, info } = useNotifications()
const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()

const now = new Date()
const sampleAmount = 1234.56
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-2xl font-bold">Chapter 09: Composables</h2>

    <!-- useCounter demo -->
    <section class="rounded-lg border p-6">
      <h3 class="mb-4 text-lg font-semibold">useCounter()</h3>
      <p class="mb-2">Count: <strong>{{ count }}</strong></p>
      <p class="mb-4">Doubled: <strong>{{ doubled }}</strong></p>
      <div class="flex gap-2">
        <button
          class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          @click="increment"
        >
          +
        </button>
        <button
          class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          @click="decrement"
        >
          &minus;
        </button>
        <button
          class="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
          @click="reset"
        >
          Reset
        </button>
      </div>
    </section>

    <!-- useNotifications demo -->
    <section class="rounded-lg border p-6">
      <h3 class="mb-4 text-lg font-semibold">useNotifications()</h3>
      <div class="flex gap-2">
        <button
          class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
          @click="success('Operation completed successfully!')"
        >
          Success
        </button>
        <button
          class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          @click="error('Something went wrong!')"
        >
          Error
        </button>
        <button
          class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          @click="info('Here is some information.')"
        >
          Info
        </button>
      </div>
    </section>

    <!-- Utils demo -->
    <section class="rounded-lg border p-6">
      <h3 class="mb-4 text-lg font-semibold">Auto-imported Utils</h3>
      <p class="mb-2">
        <span class="font-medium">formatDate:</span> {{ formatDate(now) }}
      </p>
      <p>
        <span class="font-medium">formatCurrency:</span> {{ formatCurrency(sampleAmount) }}
      </p>
    </section>

    <!-- App Config demo -->
    <section class="rounded-lg border p-6">
      <h3 class="mb-4 text-lg font-semibold">useAppConfig()</h3>
      <p class="mb-2">
        <span class="font-medium">Site name:</span> {{ appConfig.site.name }}
      </p>
      <p>
        <span class="font-medium">Primary color:</span>
        <span
          class="ml-2 inline-block h-4 w-4 rounded"
          :style="{ backgroundColor: appConfig.ui.primaryColor }"
        />
        {{ appConfig.ui.primaryColor }}
      </p>
    </section>

    <!-- Runtime Config demo -->
    <section class="rounded-lg border p-6">
      <h3 class="mb-4 text-lg font-semibold">useRuntimeConfig()</h3>
      <p>
        <span class="font-medium">Public API Base:</span>
        <code class="ml-2 rounded bg-gray-100 px-2 py-1">{{ runtimeConfig.public.apiBase }}</code>
      </p>
    </section>

    <NotificationToast />
  </div>
</template>
