<template>
    <div v-for="task in tasks">
        <AutoLoad :visible="activeId === task.id">
            <SingleTask :task-id="task.id" :visible="activeId === task.id"></SingleTask>
        </AutoLoad>
    </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import type { Task } from '../../interfaces';

const SingleTask = defineAsyncComponent(() => import('./SingleTask.vue'));

const { activeId } = defineProps<{
    activeId: number;
    tasks: Task[];
}>();

</script>