<template>
    <h1>评分任务</h1>
    <AutoLoad v-for="question in questions" :visible="question.id === activeId">
        <SingleQuestion :active-id="activeId" :question-abstract="question"></SingleQuestion>
    </AutoLoad>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { ScoreTask } from '../../interfaces';

const props = defineProps<{
    activeId: number;
    answerActiveId: number;
    rates: ScoreTask[]
}>();

const questions = computed(() => props.rates.map(s => s.questions).flat());


</script>

<style scoped lang="scss">
h1 {
    text-align: center;
    margin-top: 15px;
}
</style>