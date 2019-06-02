// Modules to control application life and create native browser window
const {app, BrowserWindow, BrowserView} = require('electron')
const fs = require('fs')
const path = require('path')
app.setPath('userData',path.join(app.getPath('appData'),'flowio'))
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
const createSidebar=(file_path)=>{
  let name_of_file = file_path.match(/(?:[^\/\\](?!(\/|\\)))+$/gim)
  if (name_of_file==null) {name_of_file = "./"}
  else name_of_file = name_of_file[0]
  if(fs.lstatSync(file_path).isFile() && path.basename(file_path).slice(-3)=='.md'){
    return name_of_file
  }else if(fs.lstatSync(file_path).isDirectory()) {
    let files = fs.readdirSync(file_path)
    let return_obj = {}
    return_obj[name_of_file]=files.map((file)=>createSidebar(path.join(file_path, file))).filter((a)=>a!=null)
    if(return_obj[name_of_file].length==0) return null
    return return_obj
  }

}

const printSidebar=(sidebar,deep=1)=>{
  //console.log(sidebar)
  if (typeof sidebar === 'string' && sidebar[0]=='_') return ''
  if (typeof sidebar === 'string') {return "-  ["+sidebar+"]("+sidebar+")"}
  let key = Object.keys(sidebar)[0]
  //console.log(key,Array.isArray(sidebar[key]))
  let final_tema = sidebar[key].map((value)=>printSidebar(value, deep+1))
  //console.log(final_tema)
  let prefix ='\n'+'  '.repeat(deep)
  return "- "+key+prefix+(final_tema.join(separador=prefix))
}

function getUserParams(must_query={}){
	let path_url_params = path.join(app.getPath('userData'),'urlParams.json')
	if(!fs.existsSync(path_url_params)){
		fs.writeFileSync(path_url_params,'{}')
		console.log('Written default user params')
    return {}
	}else{
		urlparams = fs.readFileSync(path_url_params,'utf8')
		return JSON.parse(urlparams)
	}
	//if(!query['clibs']) query['clibs']=[]
	//if(!Array.isArray(query['clibs'])) query['clibs']=[query['clibs']]
}


function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity:false
    }
  })
  //console.log(getUserParams()['flowio_path'])
  let path_flowio = getUserParams()['flowio_path']//?getUserParams()['path_flowio']:'C:\\Users\\besquirol\\PDU\\diagrames\\_docs'
  if (path_flowio){
    let sidebar = createSidebar(path_flowio)
    let sidebar_text = printSidebar(sidebar)
    let docs_path = path.join(path_flowio,'_docs')
    mainWindow.webContents.setUserAgent('chrome/73.0.3683.121')
    fs.writeFile(path.join(docs_path,'_sidebar.md'),sidebar_text,()=>{
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
  }
  
  // and load the index.html of the app.

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
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
