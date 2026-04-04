<template>
    <el-image :src="src" :lazy="lazy" :alt="alt" :preview-src-list="[src]"></el-image>
</template>
<script setup lang="ts">
const props = defineProps<{
    src: string,
    alt?: string,
    lazy?: boolean,
}>()
</script>