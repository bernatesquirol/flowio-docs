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

function getUserParams(url,must_query={}){
	let path_url_params = path.join(url,'urlParams.json')
	let query = {}
	if(!fs.existsSync(path_url_params)){
		query = DEFAULT_QUERY
		fs.writeFile(path_url_params, JSON.stringify(query), ()=>{})
		console.log('Written default user params')
	}else{
		urlparams = fs.readFileSync(path_url_params,'utf8')
		query = JSON.parse(urlparams)
	}
	if(!query['clibs']) query['clibs']=[]
	if(!Array.isArray(query['clibs'])) query['clibs']=[query['clibs']]
	return {...query,...must_query}
}

module.exports={
    printSidebar:printSidebar,
    createSidebar:createSidebar,
    getUserParams:getUserParams
}