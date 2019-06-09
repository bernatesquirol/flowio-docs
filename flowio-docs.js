const fs = require('fs')
const path = require('path')
const drawionode = require('./flowio/drawio-node')
const _ = require('lodash');
String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};
const createSidebar=(file_path)=>{
    let name_of_file = file_path.match(/(?:[^\/\\](?!(\/|\\)))+$/gim)
    if (name_of_file==null) {name_of_file = "./"}
    else name_of_file = name_of_file[0]
    if(fs.lstatSync(file_path).isFile() && path.basename(file_path).slice(-7)=='.drawio'){
      return true//"README.md"
    }else if(fs.lstatSync(file_path).isDirectory()) {
			let files = fs.readdirSync(file_path)
			let return_obj = {}
			let children = files.map((file)=>createSidebar(path.join(file_path, file))).filter((a)=>a!=null)
			return_obj[name_of_file]=children
      if(return_obj[name_of_file].length==0) return null
      return return_obj
    }  
}
const printSidebar=(sidebar,insertSubroutingPath=null,subroutingObj=null,root='./',deep=1)=>{
  if (typeof sidebar === 'string'|| typeof sidebar === 'boolean' || sidebar[0]=='_') return null
  //if (typeof sidebar === 'string') {return "-  ["+sidebar+"]("+sidebar+")"}
  let key = Object.keys(sidebar)[0]
  //if(sidebar[key].includes('README.md')) {return "-  ["+key+"]("+ path.join(root, 'README.md')+")"}
  // skips first one (is ./)
	let new_root =deep==1?root:path.join(root,key)
	let extraString = []
	//evitar noms amb coses rares
	let url = require('querystring').escape(path.join(new_root, 'README.md')).replaceAll("%5C","/")
	
	if (new_root==insertSubroutingPath){
		extraString=Object.keys(subroutingObj).map((key)=>'- ['+subroutingObj[key]+']('+url+'?id='+key+')')
	}
	let final_tema = sidebar[key].flatMap((value)=>printSidebar(value,insertSubroutingPath,subroutingObj,new_root, deep+1)).filter((item)=>item)
	final_tema = [...final_tema, ...extraString]
  console.log('fills de ',new_root,final_tema)
  let prefix ='  '
	let return_val = ["- ["+key+"]("+url+")",...final_tema.map((item)=>prefix+item)]
  return return_val//"- ["+key+"]("+url+")"+'\n'+extraString+(final_tema.join(separador=prefix))
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
const getHTMLLogicFile = (diagram, diagram_id)=>{
  return `<a href="#" cursor="default" onclick="return false;"><div class="mxgraph" style="max-width:100%;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;toolbar&quot;:&quot;zoom&quot;,&quot;xml&quot;:&quot;&lt;mxfile modified=\&quot;2019-05-30T17:03:59.856Z\&quot; host=\&quot;www.draw.io\&quot; agent=\&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36\&quot; etag=\&quot;VbMopgLuse5UYBfXM_-i\&quot; version=\&quot;10.7.1\&quot; type=\&quot;device\&quot;&gt;&lt;diagram id=\&quot;${diagram_id}\&quot; name=\&quot;Page-1\&quot;&gt;${diagram};/diagram&gt;&lt;/mxfile&gt;&quot;}"></div></a><script type="text/javascript" src="https://www.draw.io/js/viewer.min.js"></script>`
}
const getDocumentationDiagram = (index, file_id)=>{
	if (!index[file_id]) return
	return drawionode.readDiagram(index[file_id]).then((read_diagram_obj)=>{
    let diagram = read_diagram_obj['diagram']
    let diagram_id = read_diagram_obj['id']
    //let html_content = getHTMLLogicFile(drawionode.compress(drawionode.toString(diagram)),diagram_id)
		let title = drawionode.getClearLabels(diagram.findChildrenRecursiveObjectFilter( {'flowio_key':'name'}))[0]
		let description =drawionode.getClearLabels(diagram.findChildrenRecursiveObjectFilter( {'flowio_key':'description'}))[0]
		/*if (isStudy(diagram)){

		}else if (isDatabase(diagram)){

		}else if (isFunction(diagram)){

		}*/
		//<h2 id="estudi_tal"><a href="#/?id=estudi_tal" data-id="estudi_tal" class="anchor"><span>estudi_tal</span></a></h2>
		return {'doc':`<h2 id="${diagram_id}"><a data-id="${diagram_id}" class="anchor"><span>${title}</span></a></h2>
		${description}`, 'title':title}
	})
}
//<h2><a  id="${diagram_id}" class="anchor" href="#${diagram_id}"> ${title} </a></h2>

function createDocumentation(index, file_path, flowio_path, sidebar_obj, depth=1){
	if (path.basename(file_path)[0]=='_') return
	if(!fs.existsSync(path.join(flowio_path,'./_docs'))) fs.mkdirSync(path.join(flowio_path,'./_docs'));
	if(!fs.existsSync(path.join(flowio_path,'./_docs/README.md'))) fs.writeFileSync(path.join(flowio_path,'./_docs/README.md'),'docs');
	if(depth>100) return
	if(fs.lstatSync(file_path).isFile()){
		let key_lib = path.basename(file_path)
		if (key_lib.slice(-7)=='.drawio'){
			let file_id =drawionode.getDiagramId(file_path)
      return {'diagram':getDocumentationDiagram(index,file_id).then((data)=>{
					return {'doc':data.doc,'id':file_id,'title':data.title}
				})
			}
		}
	}else if(fs.lstatSync(file_path).isDirectory()) {
		let relative_folder = path.relative(flowio_path,file_path)
		if(!fs.existsSync(path.join(flowio_path,'./_docs', relative_folder))) fs.mkdirSync(path.join(flowio_path,'./_docs', relative_folder));
		if(!fs.existsSync(path.join(flowio_path,'./_docs', relative_folder, './README.md'))) fs.writeFileSync(path.join(flowio_path,'./_docs', relative_folder, './README.md'),'docs');
		return fs.promises.readdir(file_path).then((files)=>{
      let return_obj = files.map((file)=>createDocumentation(index,path.join(file_path, file),flowio_path,sidebar_obj, depth+1))
      let promise = Promise.all(return_obj.filter((a)=>a!=null&&Object.keys(a).includes('diagram')).map((item)=>item.diagram)).then((file_diagrams)=>{
				let diagrams = file_diagrams.map((a)=>a.doc)
				//console.log("EI",file_diagrams, diagrams)
				//crear subrouting per fitxers
				let titles = file_diagrams.reduce((acc, item)=>{
					let obj = {...acc}
					obj[item.id]=item.title
					return obj
				},{})//
				console.log(titles)
				console.log('relative',relative_folder)
				let sidebar_text = printSidebar(sidebar_obj, relative_folder,titles).join('\n')
				console.log(sidebar_text)
				//posar-ho despres de la carpeta que toca al sidebar_text
				
				//creating md file.
				let title = '# '+relative_folder+'\n'
        let data = diagrams.join("\n")
        let path_file = path.relative(flowio_path,file_path)
				let new_file = path.join(flowio_path,'./_docs',path_file,"README.md")
				//console.log(relative_folder)

				//s'ha de fer tota la sidebar!!
				let side_bar = path.join(flowio_path,'./_docs',path_file,"_sidebar.md")
				return fs.promises.writeFile(new_file,title+data).then(()=>{
					//if (file_path!=flowio_path)return Promise.resolve()
					return fs.promises.writeFile(side_bar,sidebar_text)
				})
      })
      return promise//{'folder':promise}
		})
	}
}
module.exports={
    printSidebar:printSidebar,
    createSidebar:createSidebar,
    getUserParams:getUserParams,
    createDocumentation:createDocumentation
}