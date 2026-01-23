<template>
    <!-- <slot v-if="loaded" v-show="props.visible"></slot> -->
    <div class="auto-loaded" v-show="props.visible">
        <slot v-if="loaded"></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const props = defineProps<{
    visible: boolean;
}>();

const loaded = ref(false);

// 监听 visible 变化
watchEffect(() => {
    if (props.visible && !loaded.value) {
        loaded.value = true;
    }
})

// 初始状态处理
if (props.visible) {
    loaded.value = true;
}
</script>