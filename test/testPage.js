var currLib = '';
function loadLib(lib){
	currLib = lib;
	document.getElementById( 'chooseLib' ).innerHTML = '<div id="libLoaded"> Loading... '+  lib + '</div>';
	loadScript([ '../libs/' + lib + '.js'], showExamples);
	var cnt = 0;
	function loadScript(srcs, done, endAt){
		//load scripts sequentially
		endAt = endAt || srcs.length;
		if(srcs.length > 0){
			var src = srcs.shift(),
				s = document.createElement("script");
			s.charset = "UTF-8";
			s.src = src;
			document.body.appendChild(s);
			s.onreadystatechange = function() {
				if(s.readyState === 4){
				    loadScript(srcs, endAt);
					if(++cnt === endAt){
						done();
					}
				}
			};
			s.onload = function(){
				loadScript(srcs, endAt);
				(++cnt === endAt) && done();
			};
		}
	}
	function showExamples(){
		//initialise the lib
		$p.libs[lib]();
		
		document.getElementById( 'libLoaded' ).innerHTML = '<b>'+ lib + '</b> is loaded<br />You can run the examples below individually or <a href="#" onclick="runAll(this)">all at once</a>';
		document.getElementById( 'examples' ).style.display = 'block';
		var lis = $p( 'ul.exampleList > li' ),
			lii,
			cn,
			span;
		for(var i = 0, ii = lis.length; i < ii; i++){
			lii = lis[i];
			if(!(/^ex[0-9]+$/).test(lis[i].className)){ 
				continue; 
			}

			var h = $p('h3', lii);
			if(h[0]){
				h = h[0];
				if(!(/SPAN/).test(h.nextSibling.tagName)){
					span = document.createElement( 'SPAN' );
					h.parentNode.insertBefore(span, h.nextSibling);
				}else{
					span = h.nextSibling;
				}
				var cn = lis[i].className;
				window[cn].id = cn;
				span.id = cn;
				span.innerHTML = 
					'<a class="run"   href="#" onclick="run(this, '+cn+');return false;">Run</a>'+
					'<a class="debug" href="#" onclick="run(this, '+cn+', true);return false;">Debug</a>';
			}
		}
	}
}

$p.plugins.compileDebug = function(directive, ctxt, template){
	debugger;
	var rfn = this._compiler( ( template || this[0] ).cloneNode( true ), directive, ctxt);
	var json;
	return function(data){
		json = json || data;
		return rfn( { data: data, json:json } );
	};
};
function runAll(a){
	a.onclick = null;
	var lis = $p( 'ul.exampleList > li' ),
		lii;
	for(var i = 0, ii = lis.length; i < ii; i++){
		lii = lis[i];
		if(!(/^ex[0-9]+$/).test(lis[i].className)){ 
			continue; 
		}
		run( $p('a.run', lii)[0], window[lii.className] );
	}
	
}
function run(elm, fn, debug){
	if(!elm){return;}
	elm.parentNode.innerHTML = '';
	if(debug === true){
		$p.plugins.__compile = $p.plugins.compile;
		$p.plugins.compile = $p.plugins.compileDebug;
	}
	transform(fn, debug);
	if(debug === true){
		$p.plugins.compile = $p.plugins.__compile;
	}
}

function transform(ex, debug){
	var template;
	
	switch(currLib){
		case 'domassistant':
		case 'jquery':
			template = $( ex.template );
		break;
		case 'mootools':
			template = $(document).getElement( ex.template );
		case 'prototype':
			template = $$( ex.template )[0];
		default:
			template = $p( ex.template );
	}

	switch(ex.id){
		case 'ex05':
			/* Loop on table with events */
			template.render( ex.data, ex.directive1 ).render( ex.data, ex.directive2 );
		break;
		case 'ex07':
			/* Recursion */
			countries = template.compile( ex.directive );

			if(typeof countries[0] === 'function'){ //DOMAssistant sends back an array?
				countries = countries[0];
			}
			//some libs send back an array, some send the node
			(template[0] || template).parentNode.innerHTML = countries( ex.data );
		break;
		default:
			template.autoRender( ex.data , ex.directive );
	}

}
var countries;
