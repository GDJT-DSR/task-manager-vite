<template>
    <div class="sub-desc" v-if="sub.desc">
        <vue-katex :content="sub.desc" />
    </div>
    <el-image class="img" v-if="sub.img" :src="sub.img" :preview-src-list="[sub.img]"></el-image>
    <div class="record" v-if="sub.answer && sub.answer.content">
        <el-divider></el-divider>
        <div class="title">我的回答：</div>
        <!-- <div class="answer">{{ sub.record.content }}</div> -->
        <div class="answer">
            <vue-katex :content="sub.answer.content" />
        </div>
        <el-image class="img" v-if="sub.answer.img" :src="sub.answer.img" :preview-src-list="[sub.answer.img]" />
        <br />

    </div>
    <el-button @click="showDialog = true">{{ sub.answer ? '更改回答' : '填写回答' }}</el-button>
    <!-- <teleport to="#teleport">
        <el-dialog v-model="showDialog" title="我的回答">

        </el-dialog>
    </teleport> -->
    <auto-load :visible="showDialog">
        <teleport to="#teleport">
            <el-dialog v-model="showDialog" title="我的回答">
                <el-form v-model="form">
                    <el-form-item label="内容" label-position="top">
                        <el-input v-model="form.content" type="textarea" height="100"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateContent">保存</el-button>
                    </el-form-item>
                </el-form>
                <el-upload ref="upload" class="upload-demo" action="" :limit="1" :on-exceed="handleExceed"
                    :http-request="doUpload" :auto-upload="false">
                    <template #trigger>
                        <el-button type="primary">选择文件</el-button>
                    </template>
                    <el-button class="upload" type="success" @click="submitUpload">
                        上传
                    </el-button>
                    <template #tip>
                        <div>最多只能上传一个文件，新上传的文件会覆盖旧文件</div>
                    </template>
                </el-upload>
            </el-dialog>
        </teleport>
    </auto-load>
    <div v-if="sub.answer && sub.answer.score">
        <el-divider></el-divider>
        <div class="title">得分：{{ sub.answer?.score }}分 / {{ sub.max_score }}分</div>
    </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { Question } from '../../interfaces';
import AutoLoad from '../common/AutoLoad.vue';
import { genFileId, type NotificationParams, type UploadInstance, type UploadProps, type UploadRawFile, type UploadRequestOptions } from 'element-plus';
import { doRequest } from '../../common';


const prop = defineProps<{ sub: Question }>();
const emit = defineEmits(['update']);
const showDialog = ref(false);
const form = reactive({
    content: prop.sub.answer?.content ?? ''
})


async function updateContent() {
    const target = form.content;
    const origin = prop.sub.answer?.content || '';
    if (!target) { return; }
    const res = await doRequest<void>(`/api/answer/${prop.sub.id}/fill-in`, 'post', {
        target,
        origin
    });
    if (res.code !== 200) {
        ElNotification({
            title: '更改失败',
            message: res.msg,
            type: 'error',
        });
    } else {
        emit('update');
        ElNotification({
            title: "更改成功",
            type: 'success',
        });
    }
    showDialog.value = false;
}

const upload = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}

function submitUpload() {
    upload.value!.submit();
}

async function doUpload(opt: UploadRequestOptions): Promise<void> {
    const file = opt.file;
    let param: NotificationParams = {
        title: "上传文件失败",
        type: 'error',
    }
    if (!file) {
        ElNotification({
            ...param,
            message: "请选择文件"
        })
        return;
    }
    const form = new FormData();
    form.append('file', file);
    try {
        const resp = await doRequest<void>(`/api/answer/${prop.sub.answer!.id}/upload`, 'post', form);
        if (resp.code !== 200) {
            ElNotification({
                ...param,
                message: resp.msg || '服务器错误',
            })
        } else {

            ElNotification({
                title: "上传成功",
                type: 'success',
            })

            emit('update')
        }
    }
    catch (e) {
        ElNotification(param)
    }

}
</script>

<style>
.upload {
    margin-left: 5px;
}

.img {
    width: min(400px, 60vw);
}
</style>