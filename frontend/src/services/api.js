import axios from 'axios';
const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });
export const scanFolder = (folder_path) => api.post('/scan-folder', { folder_path });
export const organizeFiles = (folder_path) => api.post('/organize', { folder_path });
export const undoFiles = () => api.post('/undo');
