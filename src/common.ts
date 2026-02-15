import { ElMessageBox } from "element-plus";
import type { RBody } from "./interfaces";
import { ref } from "vue";
import { router } from "./router";

export const isMobileRef = ref(isMobile());

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
if (window.location.pathname !== "/login") {
  _refresh().catch(() => {});
}

// 用于refresh
function _refresh(): Promise<void> {
  if (refreshing) {
    return refreshing;
  }
  let temp = fetch("/api/user/refresh")
    .then((resp) => {
      if (resp.ok) return resp.json();
      else throw new Error();
    })
    .then(async (body) => {
      if (body.code !== 200 || !body.data) {
        await ElMessageBox.alert("登录过期，请重新登录");
        router.currentRoute.value.name == "home" && router.push("/login");
        throw new Error();
      }
      // localStorage.setItem("at", body.data.access_token as string);
      token = body.data.access_token as string;
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
      return json;
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
