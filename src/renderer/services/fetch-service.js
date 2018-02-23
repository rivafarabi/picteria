const ipc = window.require('electron').ipcRenderer

export default class FetchService {
  fetchFile () {
    return new Promise(resolve => {
      ipc.send('file-request')
      ipc.send('file-reply', (event, args) => {
        resolve(args)
      })
    })
  }

  fetchDir (dir) {
    return new Promise(resolve => {
      ipc.send('file-list-request', dir)
      ipc.on('file-list-reply', (event, args) => {
        var pattern = /\.(gif|jpg|jpeg|tiff|png|bmp|svg)$/i
        args.forEach((item, index, object) => {
          var isImage = pattern.test(item)
          if (!isImage) {
            object.splice(index, 1)
          }
          index--
        })
        resolve(args)
      })
    })
  }
}
