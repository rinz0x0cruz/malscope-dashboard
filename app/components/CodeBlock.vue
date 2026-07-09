<script setup lang="ts">
const props = defineProps<{ code: string; label?: string }>()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  } catch {
    // clipboard blocked (insecure context) — no-op
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-default/60 bg-[#0c0c0e]">
    <div class="flex items-center justify-between border-b border-default/50 bg-elevated/30 px-3 py-1.5">
      <span class="font-mono text-[11px] uppercase tracking-wide text-dimmed">{{ label }}</span>
      <UButton
        size="xs" variant="ghost"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        :color="copied ? 'success' : 'neutral'"
        @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </UButton>
    </div>
    <pre class="max-h-96 overflow-auto p-3 text-xs leading-relaxed"><code class="font-mono text-muted">{{ code }}</code></pre>
  </div>
</template>
