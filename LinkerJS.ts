import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class LinkerJS {
    private axiosInstance: AxiosInstance;
    private basePath: string = '';
    private resourceId?: string | number;
    private queryParams: Record<string, any> = {};
    private requestData?: any;

    constructor(baseURL?: string) {
        const urlFromBase = baseURL || localStorage.getItem('apiBaseURL') || '';
        this.axiosInstance = axios.create({
            baseURL: urlFromBase,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    baseURL(baseURL: string): this {
        this.axiosInstance.defaults.baseURL = baseURL;
        return this;
    }

    data(payload: any): this {
        this.requestData = payload;
        return this;
    }

    path(path: string): this {
        this.basePath = path;
        return this;
    }

    id(resourceId: string | number): this {
        this.resourceId = resourceId;
        return this;
    }

    query(params: Record<string, any>): this {
        this.queryParams = { ...this.queryParams, ...params };
        return this;
    }

    page(pageNumber: number): this {
        this.queryParams = { ...this.queryParams, page: pageNumber };
        return this;
    }

    header(headers: Record<string, string>): this {
        this.axiosInstance.defaults.headers = {
            ...this.axiosInstance.defaults.headers,
            ...headers
        };
        return this;
    }

    timeout(ms: number): this {
        this.axiosInstance.defaults.timeout = ms;
        return this;
    }

    withCredentials(flag: boolean): this {
        this.axiosInstance.defaults.withCredentials = flag;
        return this;
    }

    reset(): this {
        //this.basePath = '';
        this.resourceId = undefined;
        this.queryParams = {};
        this.requestData = undefined;
        return this;
    }

    addInterceptor(onRequest?: any, onResponse?: any): this {
        if (onRequest) this.axiosInstance.interceptors.request.use(onRequest);
        if (onResponse) this.axiosInstance.interceptors.response.use(onResponse);
        return this;
    }

    private buildURL(): string {
        let fullPath = this.basePath;
        if (this.resourceId !== undefined) {
            fullPath = `${fullPath}/${this.resourceId}`;
        }
        const params = new URLSearchParams(this.queryParams as any).toString();
        return params ? `${fullPath}?${params}` : fullPath;
    }

    async request<T = any>(method: string, endpoint: string, data: object | null = null, options: AxiosRequestConfig = {}): Promise<T> {
        try {
            const config: AxiosRequestConfig = {
                method: method.toUpperCase() as any,
                url: endpoint,
                data,
                ...options
            };

            const response: AxiosResponse<T> = await this.axiosInstance.request<T>(config);
            return response.data;

        } catch (error: any) {
            if (error.response) {
                throw new Error(`HTTP Hatası ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                throw new Error("Sunucuya ulaşılamadı. Ağ hatası olabilir.");
            } else {
                throw new Error(`İstek hatası: ${error.message}`);
            }
        }
    }

    get<T = any>(options?: AxiosRequestConfig): Promise<T> {
        return this.request<T>('GET', this.buildURL(), null, options);
    }

    post<T = any>(options?: AxiosRequestConfig): Promise<T> {
        return this.request<T>('POST', this.buildURL(), this.requestData, options);
    }

    put<T = any>(options?: AxiosRequestConfig): Promise<T> {
        return this.request<T>('PUT', this.buildURL(), this.requestData, options);
    }

    delete<T = any>(options?: AxiosRequestConfig): Promise<T> {
        return this.request<T>('DELETE', this.buildURL(), null, options);
    }

    // ===== File Upload / Download =====
    uploadFile(file: File, fieldName: string = 'file', options?: AxiosRequestConfig): Promise<any> {
        const formData = new FormData();
        formData.append(fieldName, file);
        return this.post({ ...options, data: formData, headers: { 'Content-Type': 'multipart/form-data', ...options?.headers } });
    }

    downloadFile(fileName: string, options?: AxiosRequestConfig): Promise<void> {
        return this.get<Blob>({ ...options, responseType: 'blob' }).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    }

    static create(baseURL?: string): LinkerJS {
        return new LinkerJS(baseURL);
    }
}

export default LinkerJS;
