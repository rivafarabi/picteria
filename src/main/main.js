const { app, BrowserWindow, ipcMain } = require('electron')
let win = null

app.on('ready', () => {
  win = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    webPreferences: {
      webSecurity: false
    },
    transparent: false,
    frame:true
  })

  win.loadURL('http://localhost:8080')
  
  win.once('ready-to-show', () => {
    win.show()
  })
  
  var filesystem = require('./services/filesystem')

  win.on('closed', () => {
    win = null
  })
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit()
  }
})