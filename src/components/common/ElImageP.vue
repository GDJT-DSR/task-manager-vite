<template>
    <el-image style="max-width: max(30vw , 300px)" v-for="src in srcs" :src="src" :lazy="lazy" :alt="alt"
        :preview-src-list="srcs"></el-image>
</template>
<script setup lang="ts">
const props = defineProps<{
    srcs: string[],
    alt?: string,
    lazy?: boolean,
}>()
</script>