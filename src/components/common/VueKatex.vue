<template>
    <span v-html="parsed"></span>
</template>

<script setup lang="ts">
import katex from 'katex';

function parse(text: string): string {
    if (!text) return '';

    const parts = text.split(/(?<!\\)\$/);


    return parts.map((value: string, index: number) => ((index >> 1 << 1) === index) ? value.replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/"/g, '&quot;').
        replace(/'/g, '&#039;').
        replace('\\\\', '<br />').
        replace('\n\n', '<br />')
        : katex.renderToString(value)
    ).join('');
}

const { content } = defineProps<{
    content: string
}>();

const parsed = parse(content)

</script>

<style lang="scss"></style>