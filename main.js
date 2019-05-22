// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const fs = require('fs')
const path = require('path')
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
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: true
    }
  })
  console.log(getUserParams()['path_flowio'])
  let path_flowio = getUserParams()['path_flowio']?getUserParams()['path_flowio']:'C:\\Users\\besquirol\\PDU\\diagrames\\_docs'
  let sidebar = createSidebar(path_flowio)
  let sidebar_text = printSidebar(sidebar)
  fs.writeFile(path.join(path_flowio,'_sidebar.md'),sidebar_text,()=>{
    mainWindow.loadFile('index.html',{
      query:{
        loadSidebar: '_sidebar.md',
        name:'',
        repo:'',
        basePath:'/'+path_flowio.split(path.sep).join('/')
      }
    })
  })
  // and load the index.html of the app.

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

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
