import axios, { Method, AxiosResponse, AxiosError } from "axios";
import { getRecoil, setRecoil } from "recoil-nexus"; 
import { selectedUserLoginToken, refreshTokenState } from "state";
import { clearStoredSession, isAccessTokenUsable } from "./authSession";
import { API_ENDPOINTS, buildApiUrl, getApiBaseUrl } from "config/api";

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = getRecoil(selectedUserLoginToken);
      if (isAccessTokenUsable(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token && !getRecoil(refreshTokenState)) {
        clearStoredSession();
        setRecoil(selectedUserLoginToken, null);
        setRecoil(refreshTokenState, null);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {    
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {      
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest!.headers!.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest!));
          },
          reject,
        });
      });
    }

    originalRequest!._retry = true;
    isRefreshing = true;

    let requestResult: Promise<AxiosResponse> | AxiosResponse | null = null;
    try {
      const res = await axios.post(
        buildApiUrl(API_ENDPOINTS.identity.refreshToken),
        { refreshToken: getRecoil(refreshTokenState) },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      const payload = res.data?.data;
      const newAccessToken: string = payload?.accessToken;
      const newRefreshToken: string = payload?.refreshToken || res.headers?.["x-refresh-token"] || getRecoil(refreshTokenState);

      if (!newAccessToken || !newRefreshToken) {
        throw new Error("Refresh token response is missing tokens.");
      }

      setRecoil(selectedUserLoginToken, newAccessToken);
      setRecoil(refreshTokenState, newRefreshToken); 
      originalRequest!.headers!.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);
      requestResult = axiosInstance(originalRequest!);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearStoredSession();
      setRecoil(selectedUserLoginToken, null);       
      setRecoil(refreshTokenState, null);
      isRefreshing = false;
      return Promise.reject(refreshError);
    }

    isRefreshing = false;
    return requestResult;
  },
);

interface Options {
  url: string;
  data?: object | string;
  params?: object;
  headers?: object;
  fullheaders?: object;
  signal?: AbortSignal;
  contentType?: string;
  authorizedToken?: string;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

interface FullOptions extends Options {
  method: Method;
}

const request = (arg: FullOptions): Promise<AxiosResponse> => {
  const {
    method,
    contentType = "application/json",
    url,
    headers,
    fullheaders,
    authorizedToken,
    data,
    params,
  } = arg;

  let Myheaders: Record<string, string> = {};        
  if (fullheaders) {
    Myheaders = { ...(fullheaders as Record<string, string>) };
  } else {
    Myheaders = {
      ...headers,
      "Content-Type": contentType ?? "application/json",
      ...(authorizedToken ? { Authorization: authorizedToken } : {}),
    };
  }

  return axiosInstance.request({
    method,
    headers: { ...Myheaders },
    url,
    data,
    params,
  });
};

const httpClient = {
  request,
  get: (arg: Options): Promise<AxiosResponse> =>     
    request({ ...arg, method: "GET" }),
  post: (arg: Options): Promise<AxiosResponse> =>    
    request({ ...arg, method: "POST" }),
  put: (arg: Options): Promise<AxiosResponse> =>     
    request({ ...arg, method: "PUT" }),
  delete: (arg: Options): Promise<AxiosResponse> =>  
    request({ ...arg, method: "DELETE" }),
};

export default httpClient;
