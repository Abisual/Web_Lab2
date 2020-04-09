;(function(){

	var HttpProtocol = function()
	{
		this.get = function(uri, next){
			var XML = new XMLHttpRequest();
			XML.onreadystatechange = function() {
				if(XML.readyState == 4 && XML.status == 200)
					next(XML.responseText);
			}

			XML.open("GET", uri, true);
			XML.send(null);
		}
	}

	var client = new HttpProtocol();
	var currentTemplate = {};
	
	client.get('/templates', function(res){

		var loc = JSON.parse(res);
		var condition = loc.files.length!=0;
		var bl = document.querySelector('.choose');

		if(condition){
			initButtons(loc.files);
		}
		else
			bl.innerHTML = '<p>На сервере отсутствуют шаблоны.</p>';

	});

	function initButtons(files){

		var ul = document.createElement('ul');
			parent = document.querySelector('.choose');

		ul.setAttribute('class','templ-variants');
		parent.appendChild(ul);
		files.forEach(insertIntoUL);

		function insertIntoUL(el,index,arr){
			var li = document.createElement('li');
			li.setAttribute('class','templ-name');
			li.setAttribute('data-id',files[index]);
			ul.appendChild(li);
			li.innerHTML = li.innerHTML + el;
		}


		var templ = document.querySelectorAll('.templ-name');
		for (var i = 0; i < templ.length; i++) {
			templ[i].addEventListener('click', function(){
				var act = document.querySelector('.active-templ');
				if(act) act.classList.remove('active-templ');	
				this.classList.add('active-templ');
				initForm(document.getElementById('form'), this.getAttribute('data-id'));
			});
		}

	}

	function initForm(parent, fileName){
		client.get('/raw/'+fileName, function(res){
				parent.innerHTML = '';
				var inputCounter = 1;
				var jsonString = res;
				var obj = (JSON.parse(jsonString)).data;

				currentTemplate = jsonString;

				var keys = Object.keys(obj);

				var name = obj[keys[0]];
				var str = keys[1], str_type = obj[keys[1]];
				var resources = obj.resources;
				

				var form = document.createElement('form');
				form.setAttribute('method','POST');
				form.setAttribute('action','/database');
				parent.appendChild(form);

				var fieldset_daddy = document.createElement('fieldset'),
					legend_daddy = document.createElement('legend');
				legend_daddy.innerText = obj.name;

				form.appendChild(fieldset_daddy);
				fieldset_daddy.appendChild(legend_daddy);

				var label = document.createElement('label');
				label.setAttribute('for','input-'+inputCounter);
				label.innerText = str+':';

				var input = document.createElement('input');
				input.setAttribute('type','text');
				input.setAttribute('name',str);
				input.setAttribute('id','input-'+inputCounter);
				input.setAttribute('required','required');
				inputCounter++;

				fieldset_daddy.appendChild(label);
				fieldset_daddy.appendChild(input);

				for (var i = 0; i < resources.length; i++) {
					var current_res = resources[i];
					var current_keys = Object.keys(current_res);
					var fieldset_child = document.createElement('fieldset');
					var legend_child = document.createElement('legend');
					legend_child.innerText = current_res.name;
					fieldset_daddy.appendChild(fieldset_child);
					fieldset_child.appendChild(legend_child);

					for (var j = 1; j < current_keys.length; j++) {
						var label = document.createElement('label');
						label.setAttribute('for','input-'+inputCounter);
						label.innerText = current_keys[j]+':';

						var input = document.createElement('input');
						input.setAttribute('type','text');
						input.setAttribute('name',current_keys[j]);
						input.setAttribute('id','input-'+inputCounter);
						input.setAttribute('required','required');
						inputCounter++;
						fieldset_child.appendChild(label);
						fieldset_child.appendChild(input);
					} 
				}

				var cur_templ = document.createElement('input');
				cur_templ.setAttribute('type','text');
				cur_templ.setAttribute('value',currentTemplate);
				cur_templ.setAttribute('name','currentTemplate');
				cur_templ.setAttribute('style','visibility:hidden;float:right');

				form.appendChild(cur_templ);
				
				var submit = document.createElement('input');

				submit.setAttribute('type','submit');
				submit.setAttribute('name','request');
				submit.setAttribute('value','OK');

				form.appendChild(submit);
			});
	}

})();