const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

/* 캐시만 임시 폴더로 옮겨 접근 거부 메시지를 없앱니다.
   저장 기록(닉네임·코인·체험 기록)은 원래 위치에 그대로 남아요. */
try {
  app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('temp'), 'yeosu-career-quest-cache'));
  app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
} catch (e) { /* 무시 */ }

/* 이미 실행 중이면 새 창을 또 띄우지 않고 기존 창을 앞으로 가져옵니다(남은 프로세스 때문에 생기는 캐시 충돌 방지) */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 760, minWidth: 960, minHeight: 600,
    title: '전남대학교 여수캠퍼스 진로탐험', backgroundColor: '#0b1d33', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  Menu.setApplicationMenu(null);
  win.loadFile('index.html', { query: { fx: 'auto', dt: 'auto' } });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') win.setFullScreen(!win.isFullScreen());          // 전체화면
    if (input.key === 'F12') win.webContents.toggleDevTools();                 // 오류 확인용 개발자 도구
  });
  win.on('closed', () => { win = null; });
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
