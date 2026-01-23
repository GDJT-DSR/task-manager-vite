<template>
    <AutoLoad v-for="sub in subTasks" :visible="sub.id === props.activeId">
        <div class="single">
            <h1>评分任务</h1>
            <ElDescriptions title="评分任务信息" border :column="2">
                <ElDescriptionsItem label="标题">{{ sub.title }}</ElDescriptionsItem>
                <ElDescriptionsItem label="最大分值">{{ sub.max_score }}</ElDescriptionsItem>
            </ElDescriptions>
            <span ref="target"></span>
            <ElCarousel ref="carousel" indicator-position="none" :autoplay="false" arrow="always"
                :height="`${height}px`">
                <ElCarouselItem v-for="record in sub.records" :name="record.id.toString()">
                    <ElScrollbar>
                        <SingleRate :rate="record" :step="sub.step || 1" :max="sub.max_score || 10"></SingleRate>
                    </ElScrollbar>
                </ElCarouselItem>
            </ElCarousel>
        </div>
    </AutoLoad>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ScoreTask } from '../../interfaces';
import { ElCarousel, ElCarouselItem, ElDescriptions } from 'element-plus';

const props = defineProps<{
    activeId: number;
    rates: ScoreTask[]
}>();

const subTasks = computed(() => props.rates.map(s => s.sub_tasks).flat());

const target = ref<HTMLSpanElement[]>();

const height = computed(() => {
    if (!target.value) return 300;
    const rect = target.value[0]?.getBoundingClientRect();
    if (!rect) return 300;
    return window.innerHeight - rect.top - 20;
});

</script>

<style scoped lang="scss">
h1 {
    text-align: center;
    margin-bottom: 15px;
}

.single {
    margin: 0 max(3%, 20px);
}
</style>