<template>
    <div class="container">
        <div class="login">
            <!-- <el-row> -->

            <h1>用户登录</h1>
            <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px" class="login-form"
                @submit.prevent="formSubmit">
                <ElFormItem label=" 账号" prop="username" label-position="top">
                    <ElInput v-model="form.username" placeholder="请输入账号" clearable />
                </ElFormItem>

                <ElFormItem label="密码" prop="password" label-position="top">
                    <ElInput v-model="form.password" type="password" placeholder="请输入密码" show-password clearable />
                </ElFormItem>

                <ElFormItem style="align-content: center" label-position="top">
                    <!-- <div style="text-align: center;"> -->
                    <ElButton :loading="loading" type="primary" native-type="submit">登 录</ElButton>
                    <!-- </div> -->
                </ElFormItem>
            </ElForm>
            <!-- </el-row> -->
        </div>
    </div>

    <div class="bg"></div>

    <ChangePassword v-model="showChangePwd" :allow-other-close="false"></ChangePassword>
</template>

<script setup lang="ts">
import { ElForm, ElFormItem, ElButton, ElInput, ElNotification, type FormInstance } from "element-plus";
import { ref } from "vue";
import { useRouter } from 'vue-router';
import { passwordReg, setToken } from "../common";
import ChangePassword from "./common/ChangePassword.vue";

const router = useRouter()

const showChangePwd = ref(false)
let form = ref({
    username: "",
    password: "",
});
const formRef = ref<FormInstance>();

let rules = ref({
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

let loading = ref(false);

interface UserResponse {
    code: number
    msg: string
    data: {
        access_token: string
    }

}

async function formSubmit() {

    if (!formRef.value) {
        return;
    }
    await formRef.value.validate((valid, _) => {
        if (valid) {
            submit();
        }
    })
}

async function submit() {
    loading.value = true
    const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: form.value.username,
            password: form.value.password,
        })
    })
    if (res.status !== 200) {
        // Swal.fire('登录失败', '服务器错误，请稍后再试', 'error');
        ElNotification({
            title: '登录失败',
            message: '服务器错误，请稍后再试',
            type: 'error'
        })
        form.value = {
            username: "",
            password: "",
        };
        loading.value = false;
        return;
    }
    const json = (await res.json()) as UserResponse;
    if (json.code !== 200 || !json.data) {
        // Swal.fire('登录失败', json.msg ?? '用户名或密码错误', 'error');

        ElNotification({
            title: '登录失败',
            message: json.msg ?? '用户名或密码错误',
            type: 'error'
        })
        loading.value = false;
        return;
    }
    // 登录成功
    // localStorage.setItem('at', json.data.access_token);
    setToken(json.data.access_token);
    localStorage.setItem('name', form.value.username);

    if (!passwordReg.test(form.value.password)) {
        showChangePwd.value = true;
        loading.value = false;
        return;
    }


    ElNotification({
        type: 'success',
        title: '登录成功',
        duration: 2000,
    });
    loading.value = false;
    setTimeout(() => {
        router.push('/');
    }, 2000);
}

</script>

<style lang="scss">
h1 {
    padding-top: 2vh;
    text-align: center;
    padding-bottom: 5vh;
}

.login {
    // margin-top: 10vh;
    padding: 3vh 10vw;
    /* 使用rem单位，按根字体大小缩放 */
    position: absolute;
    width: min(80vw, 500px);
    top: min(50%, 20vh);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -70%);

    background-color: rgba(161, 246, 255, 0.7);

    border-radius: 30px;
}

.login-form {
    max-width: 400px;
    margin: 0 auto;
}


.el-form-item__label {
    font-size: 1rem;
    color: black;
}

/* 媒体查询：小屏幕设备 */
@media (max-width: 768px) {
    .login {
        padding: 1rem;
        /* 小屏幕减少padding */
    }

    .login-form {
        width: 95%;
        /* 小屏幕增加宽度比例 */
    }
}

/* 媒体查询：超小屏幕设备 */
@media (max-width: 480px) {
    .login {
        padding: 0.5rem;
    }

    .login-form {
        width: 100%;
    }
}

.bg {
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background: url(../assets/bg.webp);
    background-size: cover;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: -1;
}
</style>