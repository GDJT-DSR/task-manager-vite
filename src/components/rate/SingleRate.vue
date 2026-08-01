<template>
  <div class="wrapper">
    <ElDescriptions direction="vertical" border :column="1" title="回答详情">
      <ElDescriptionsItem label="回答内容" label-align="center" align="left">
        <FormattedLatex v-if="type === 'fill_in'">{{ rate.content }}</FormattedLatex>
        <ElImageP class="img" v-else-if="type === 'upload'" :srcs="[`/uploads/${props.rate.content}`]"></ElImageP>
        <!-- <div v-if="rate.img">
          <el-image class="img" :src="rate.img" :preview-src-list="[rate.img]" :preview-teleported="true" />
        </div> -->
      </ElDescriptionsItem>
      <ElDescriptionsItem label="我的评分" label-align="center" align="center">
        <ElForm ref="formRef" @submit.prevent="submit">
          <div class="form">
            <ElButton type="primary" @click="$emit('previous')">
              <el-icon>
                <Back />
              </el-icon>
              上一个(B)
            </ElButton>
            <div>
              <ElInputNumber v-model="num" size="large" :step-strictly="true" :step="step" :max="max" :min="0"
                style="margin-right: 20px;" />
              <ElButton type="primary" native-type="submit">提交</ElButton>
            </div>
            <ElButton type="primary" @click="$emit('next')">
              <el-icon>
                <Right />
              </el-icon>
              下一个(N)
            </ElButton>
          </div>
        </ElForm>
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>

</template>

<script setup lang="ts">
import { ElDescriptions, ElNotification, type FormInstance } from 'element-plus';
import type { ScoreAnswer, QuestionType } from '../../interfaces';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { doRequest } from '../../common';


const props = defineProps<{
  rate: ScoreAnswer;
  step: number;
  max: number;
  type: QuestionType;
}>();
const num = ref(props.rate.score);
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const scrollbarHeight = ref(600);
let origin = props.rate.score;

const emit = defineEmits(["previous", "next"])


function updateScrollbarHeight() {
  if (typeof window === 'undefined') {
    return 300;
  }
  scrollbarHeight.value = Math.max(window.innerHeight - 500, 150);
}



onMounted(() => {
  updateScrollbarHeight();
  window.addEventListener('resize', updateScrollbarHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollbarHeight);
});

async function submit() {
  if (!formRef.value) {
    return;
  }
  loading.value = true;

  try {
    const resp = await doRequest<Object>(`/api/score/${props.rate.id}`, 'post', {
      target: num.value,
      origin
    });
    if (resp.code === 200) {
      ElNotification({
        title: "提交成功！",
        type: 'success',
      })
      origin = num.value;
    } else {
      ElNotification({
        title: "提交失败！",
        message: resp.msg,
        type: 'error',
      })
    }
  } catch (e) {
    ElNotification({
      title: "提交失败",
      type: 'error',
    })
  }
  loading.value = false;
}



</script>

<style scoped>
h3 {
  padding-top: 20px;
  text-align: center;
}


div.wrapper {
  padding: 30px 0;
}

.img {
  width: min(500px, 60vw);
}

.form {
  display: flex;
}

.form>div {
  flex: 1;
}
</style>