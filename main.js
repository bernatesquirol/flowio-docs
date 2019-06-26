// Modules to control application life and create native browser window
const {app, BrowserWindow, BrowserView} = require('electron')
const fs = require('fs')
const path = require('path')
const flowio = require('./flowio-core/flowio')
const flowio_docs = require('./flowio-docs')

app.setPath('userData',path.join(app.getPath('appData'),'flowio'))
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: true,
    width: 1600,
		height: 1200,
    webPreferences: {
      nodeIntegration: true,
      webSecurity:false
    }
  })
  
  //console.log(getUserParams()['flowio_path'])
  let path_flowio = flowio_docs.getUserParams(app.getPath('userData'))['flowio_path']//?getUserParams()['path_flowio']:'C:\\Users\\besquirol\\PDU\\diagrames\\_docs'
  if (path_flowio){
    flowio.createFileIndex(path_flowio).then((index)=>{
      let docs_path = path.join(path_flowio,'_docs')
      let phantom_sidebar = flowio_docs.createSidebar(path_flowio)
      /*let sidebar_text = flowio_docs.printSidebar(sidebar)
      console.log(sidebar_text)*/
      flowio_docs.createDocumentation(index,path_flowio,path_flowio, phantom_sidebar)

      //console.log(JSON.stringify(sidebar,null,1))
      
      mainWindow.webContents.setUserAgent('chrome/73.0.3683.121')
      //fs.writeFile(path.join(docs_path,'_sidebar.md'),sidebar_text,
      flowio_docs.createDocumentation(index,path_flowio,path_flowio, phantom_sidebar).then(()=>{
        mainWindow.webContents.setUserAgent('chrome/73.0.3683.121')
        mainWindow.loadFile('index.html',{
          query:{
            loadSidebar: '_sidebar.md',
            name:'',
            repo:'',
            basePath:'/'+docs_path.split(path.sep).join('/'),
            
          }
        })
      })
    })
  }
    
    
  
  // and load the index.html of the app.

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
 /* let view = new BrowserView()
  mainWindow.setBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
 view.webContents.loadURL('https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram.drawio#RrZNbb4MgFIB%2FjY9LRLJeXuu6W7Inm%2BxxIXIqJCgGcWh%2F%2FXCAlzVN16QvhvNxgHM%2BMMJp2b0oUrMPSUFESUy7CD9FSbJZI%2FsdQO%2FAY5w4UChOHUITyPgJPIw9bTmFZpGopRSa10uYy6qCXC8YUUqaZdpRiuWpNSngDGQ5Eef0k1PNfFvJeuKvwAsWTkarrZspSUj2nTSMUGlmCO8jnCoptRuVXQpicBe8uHXPF2bHwhRU%2Bj8LyOHdrA4Vpibdv7Wnzdc2Kx78Lt9EtL5hX6zugwHDuIasJvkQG3vJEd4xXQobITskTe28H3kH9qid3xGUhu5iqWgUYB8OyBK06m1KWBCc9eEx%2BNjMrsAjNrMfGPGXXow7T17swKu5QVNyXZNWnFTFEO2uGLuHIPxHEDoXtLqPIBtOb%2FR3bvaj4%2F0P')*/
  mainWindow.webContents.on('dom-ready',()=>{
    
    //mainWindow.webContents.executeJavaScript('console.log("jeee",navigator.getUserAgent())')
  })
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
