const fs = require('fs')
const { ipcMain } = require('electron')

function openDir(directory) {
  return new Promise(resolve => {
    fs.readdir(directory, (err, dir) => {
      resolve(dir)
    })
  })
}

ipcMain.on('file-list-request', (event, args) => {
  openDir(args)
  .then(data => {
    event.sender.send('file-list-reply', data)
  })
})