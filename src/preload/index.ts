import { contextBridge } from "electron"

// TODO:
contextBridge.exposeInMainWorld('electron', '')
contextBridge.exposeInMainWorld('api', '')
