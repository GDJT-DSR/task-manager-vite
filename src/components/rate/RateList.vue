<template>
    <AutoLoad v-for="question in questions" :visible="question.id === props.activeId">
        <SingleQuestion :question-abstract="question"></SingleQuestion>
    </AutoLoad>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { ScoreTask } from '../../interfaces';

const props = defineProps<{
    activeId: number;
    rates: ScoreTask[]
}>();
const questions = computed(() => props.rates.map(s => s.questions).flat());


</script>

<style scoped lang="scss">
h1 {
    text-align: center;
    margin-bottom: 15px;
}
</style>