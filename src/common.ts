import { dayjs, ElMessageBox } from "element-plus";
import type { RBody } from "./interfaces";
import { ref } from "vue";
import { router } from "./router";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export const isMobileRef = ref(isMobile());

// dayjs.tz.setDefault("Asia/Shanghai");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Shanghai");

function isMobile(): boolean {
  return window.innerWidth < 768;
}

window.addEventListener("resize", () => {
  isMobileRef.value = isMobile();
});

// 授权请求相关
let refreshing: Promise<void> | null = null;
let aborts = new Set<AbortController>();
let token = "";

export function setToken(tk: string) {
  token = tk;
}

// 正在refresh的Promise对象
// if (window.location.pathname !== "/login") {
//   _refresh().catch(() => {});
// }
(function () {
  let isLogin = window.location.pathname === "/login";
  _refresh(!isLogin)
    .then(() => {
      if (isLogin) {
        router.push({ name: "home" });
      }
    })
    .catch(() => {});
})();
_refresh().catch();

// 用于refresh
function _refresh(redirect: boolean = true): Promise<void> {
  if (refreshing) {
    return refreshing;
  }
  let temp = fetch("/api/user/refresh")
    .then((resp) => {
      if (resp.ok) return resp.json();
      else throw new Error();
    })
    .then(async (body) => {
      if (body.code === 200 && body.data) {
        token = body.data.access_token as string;
        return;
      } else if (redirect) {
        await ElMessageBox.alert("登录过期，请重新登录");
        router.currentRoute.value.name == "home" && router.push("/login");
      }
      throw new Error();
    })
    .finally(() => {
      refreshing = null;
    });
  refreshing = temp;
  return temp;
}

type methods = "get" | "post" | "put" | "delete";

export async function doRequest<T>(
  url: string,
  method: methods,
  bodyObj?: Object | undefined,
  maxTryTimes: number = 3,
): Promise<RBody<T>> {
  if (maxTryTimes <= 0) {
    throw new Error("request failed");
  }

  let needRetry = true;
  // const token = localStorage.getItem("at");
  if (!token) {
    // 用户没有登录
    await _refresh();
  }
  try {
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };
    let body: FormData | string | undefined;
    if (!(bodyObj instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = bodyObj && JSON.stringify(bodyObj);
    } else {
      body = bodyObj;
    }
    await refreshing;
    const controller = new AbortController();
    const req = fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    aborts.add(controller);

    const resp = await req;
    if (!resp.ok) {
      throw new Error();
    }
    const json = (await resp.json()) as RBody<T>;
    // 清除controller
    aborts.delete(controller);
    if (json.code === 401) {
      // 用户登录过期，尝试refresh
      // 清空队列
      aborts.forEach((ac) => ac.abort());
      aborts = new Set();
      await _refresh().catch(() => (needRetry = false));
    } else if (json.code === 429) {
      ElNotification({
        title: "请求过于频繁",
        message: "请稍后再试",
        type: "error",
      });
      return { code: 200, msg: "none" };
    } else {
      return json; // 成功
    }
  } catch (e) {}
  //递归重试
  if (!needRetry) throw new Error("request failed");
  return await doRequest<T>(url, method, bodyObj, maxTryTimes - 1);
}

export function parseToken() {
  if (!token) return null;
  return JSON.parse(atob(token.split(".")[1] ?? "")) as {
    exp: number;
    iat: number;
    typ: "access_token" | "refresh_token";
    data?: {
      permission?: number;
    };
  };
}

export async function getPermission(): Promise<number> {
  // const token = localStorage.getItem("at");

  try {
    await refreshing;
    if (!token) return -1;
    const permission = parseToken()?.data?.permission;
    // console.log(parseToken());
    return permission ?? -1;
  } catch (e) {
    return -1;
  }
}

export const passwordReg =
  /^(?![a-zA-Z]*$)(?![a-z\d]*$)(?![A-Z\d]*$)(?![\d!@#$%^&*(),./<>?;':"{}|`~\[\]]*$)(?![a-z!@#$%^&*(),./<>?;':"{}|`~\[\]]*$)(?![A-Z!@#$%^&*(),./<>?;':"{}|`~\[\]]*$).{6,}$/;

// 实现图片压缩功能
export function compressImage(
  file: File,
  maxSize: number = 1024 * 1024,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const workerSource = `
      self.onmessage = async ({ data }) => {
        try {
          const image = await createImageBitmap(new Blob([data.buffer], { type: data.type }));
          let width = image.width;
          let height = image.height;
          let quality = 0.9;
          let result;

          for (let i = 0; i < 15; i++) {
            const canvas = new OffscreenCanvas(width, height);
            const context = canvas.getContext("2d");
            if (!context) throw new Error("无法创建画布");
            context.drawImage(image, 0, 0, width, height);
            result = await canvas.convertToBlob({ type: "image/jpeg", quality });
            if (result.size < data.maxSize) break;
            if (quality > 0.35) {
              quality -= 0.2;
            } else {
              width = Math.max(1, Math.floor(width * 0.8));
              height = Math.max(1, Math.floor(height * 0.8));
            }
          }

          image.close();
          if (!result || result.size >= data.maxSize) {
            throw new Error("图片无法压缩到指定大小");
          }
          self.postMessage({ buffer: await result.arrayBuffer() }, [await result.arrayBuffer()]);
        } catch (error) {
          self.postMessage({ error: error instanceof Error ? error.message : "图片压缩失败" });
        }
      };
    `;
    const workerUrl = URL.createObjectURL(
      new Blob([workerSource], { type: "text/javascript" }),
    );
    const worker = new Worker(workerUrl);
    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    worker.onmessage = ({
      data,
    }: MessageEvent<{ buffer?: ArrayBuffer; error?: string }>) => {
      cleanup();
      if (data.error || !data.buffer) {
        reject(new Error(data.error ?? "图片压缩失败"));
        return;
      }
      resolve(
        new File([data.buffer], file.name.replace(/\.[^.]+$/, ".jpg"), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        }),
      );
    };
    worker.onerror = (error) => {
      cleanup();
      reject(error);
    };
    file
      .arrayBuffer()
      .then((buffer) =>
        worker.postMessage({ buffer, type: file.type, maxSize }, [buffer]),
      )
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });
}
