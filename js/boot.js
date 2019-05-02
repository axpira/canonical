import {HttpService} from './helpers/HttpService.js';

var $ = document.querySelector.bind(document);

var http = new HttpService();

const resultDiv = $('#resultDiv')
const addFormElement = $('#addEntityForm')
const addAttributeFormElement = $('#addAttributeForm')
const addRelationshipFormElement = $('#addRelationshipForm')

var entidades = new Map();
var entidadeAtiva = "";


function addEntidade(nome, descricao, metaentidade) {
    entidades.set(nome, {
        descricao: descricao,
        metaentidade: metaentidade,
        atributos: new Map(),
        relacionamentos: new Map()
    });
}

function addAtributo(entidadeNome, atributo, tipoDado, metadado, descricao) {
	var entidade = entidades.get(entidadeNome);
    if (!entidade) {
        alert('entidade nao encontrada');
        return
    }
	
	entidade.atributos.set(atributo, 
		{
			tipoDado: tipoDado,
			metadado: metadado,
			descricao: descricao
		}
    );
}

function addRelationship(entidadeNome, nomeRelacao, entidadeRelacionada) {
	var entidade = entidades.get(entidadeNome);
    if (!entidade) {
        alert('entidade nao encontrada [' + entidade + ']');
        return
    }
    if (!entidades.get(entidadeRelacionada)) {
        alert('entidade relacionada nao encontrada [' + entidadeRelacionada + ']');
        return
    }
	
	entidade.relacionamentos.set(entidadeRelacionada, 
		{
			nomeRelacao: nomeRelacao
		}
    );

}


function initData() {
    addEntidade(
        "cliente", 
        "Pessoa que contrata serviços ou adquire seguro.",
        "pessoa - dados sobre entidade natural ou moral com capacidade para ser sujeito ativo ou passivo de direito"
    );
    addEntidade(
        "pessoa", 
        "indivíduo a quem se atribuí dever e direito.",
        "pessoa - dados sobre entidade natural ou moral com capacidade para ser sujeito ativo ou passivo de direito"
    );
	addAtributo(
		"cliente",
		"codigo",
		"integer",
		"codigo cliente",
		"Identificador unívoco do indivíduo que contrata serviços ou adquire a mercadorias mediante pagamento."
	);
	addAtributo(
		"cliente",
		"nome",
		"string",
		"nome cliente",
		"Nome do indivíduo que contrata serviços ou adquire a mercadorias mediante pagamento."
    );
    addRelationship(
        "cliente",
        "possui",
        "pessoa"
    );
}

function createTextElement(element, text) {
    var e = document.createElement(element);
    e.appendChild( document.createTextNode(text) );
    return e;
}

function createKeyValueElement(key, value) {
    var div = document.createElement('div');
    var divKey = document.createElement('div');
    divKey.setAttribute('class', 'key');
    divKey.appendChild( document.createTextNode(key) );

    var divValue = document.createElement('div');
    divValue.setAttribute('class', 'value');
    divValue.appendChild( document.createTextNode(value) );

    div.appendChild( divKey );
    div.appendChild( divValue );
    
    return div;
}


function createButton(text, classes, func) {
    var btn = document.createElement('button');
    btn.setAttribute('class', classes);
    btn.appendChild( document.createTextNode(text) );
    if (func) {
        btn.onclick = func;
    }
    
    return btn;
}

function isPrimitive(arg) {
  return arg === null || typeof arg !== 'object' &&
    typeof arg !== 'function';
}

function createTable(caption, headers, values, addFunc) {
    var div = document.createElement('div');
    var tbl = document.createElement('table');
    tbl.setAttribute('border', '1');
    if (caption) {
        var c = document.createElement('caption');
        c.appendChild(document.createTextNode(caption));
        if (addFunc) {
            c.appendChild(createButton('+','btn btn-primary', addFunc));
        }
        //c.appendChild(createButton('+','btn btn-primary', function() {
        //    addAttributeFormElement.classList.remove("hide");
        //}));
        tbl.appendChild(c);
    }
    var thead = document.createElement('thead');
    var trHead = document.createElement('tr');
    for (var head of headers) {
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(head));
        trHead.appendChild(td)
    }
    thead.appendChild(trHead);
    tbl.appendChild(thead); 



    if (values) {
        var tbody = document.createElement('tbody');
        for (var row of values) {
            var tr = document.createElement('tr');
            for (var col of row) {
                var td = document.createElement('td');
                if ( col instanceof HTMLElement ) {
                    td.appendChild(col);
                } else {
                    td.appendChild(document.createTextNode(col));
                }
                tbody.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        tbl.appendChild(tbody); 
    }
    div.appendChild(tbl);

    return div;
}

function showEntidade(entidadeNome) {
    entidadeAtiva = entidadeNome;
    var content = "";
    var entidade = entidades.get(entidadeNome);
    if (!entidade) {
        alert("Entidade " + entidadeNome + " nao encontrada");
        return
    }
    //document.body.appendChild(btn);
    //resultDiv.innerHTML = content;
    // resultDiv.innerHTML = '';
    // resultDiv.appendChild( createButton("textoDoBotao", "btn btn-primary", function(){ 
    //     showEntidade('asdas');
    //     return false;
    // }));
    // resultDiv.appendChild(  createTable('legenda', ['a','b','c']) );
    var div = document.createElement('div');
    // resultDiv.appendChild(  createTable('', ['a','b','c'], [[div,'b1','c1'],['a2','b2','c2'],['a3','b3','c3']]) );
    // return


    div.appendChild(createTextElement('h1', entidadeNome));
    div.appendChild(createKeyValueElement('Descrição', entidade.descricao));
    div.appendChild(createKeyValueElement('Metaentidade', entidade.metaentidade));

    {
        var arr = [];
        for (var [atributo, value] of entidade.atributos) {
          arr.push( [ atributo, value.tipoDado, value.metadado, value.descricao ] );
        }

        div.appendChild( 
            createTable(
                'atributos', 
                ['atributo','tipo dado','metadado', 'descricao'], 
                arr,
                function() {
                    addAttributeFormElement.classList.remove("hide");
                }
            )
        );
    }
    {
        var arr = [];
        for (var [entidadeRelacionada, value] of entidade.relacionamentos) {
            var er = entidades.get(entidadeRelacionada);
            var btn = document.createElement('a');
            btn.setAttribute('href', '#');
            btn.appendChild( document.createTextNode(entidadeRelacionada) );
            btn.onclick = function(e){
                e.preventDefault();
                showEntidade(entidadeRelacionada);
                return false;
            };

            arr.push( [ value.nomeRelacao, btn, er.descricao ])
        }

        div.appendChild( 
            createTable(
                'relacionamentos', 
                ['nome relação', 'entidade relacionada', 'descrição' ],
                arr,
                function() {
                    addRelationshipFormElement.classList.remove("hide");
                }
            )
        );
    }

    resultDiv.innerHTML = '';
    resultDiv.appendChild(div);
}

function appendButton(text, f) {
    var container = $("#buttons");
    container.appendChild( createButton(text, 'btn btn-primary', f) )
}

function appendButtonEntity(entity) {
    appendButton( entity, function(){ 
        showEntidade(entity);
        return false;
    });
}

function initButtons() {
    var container = $("#buttons");
    container.innerHTML = '';
    appendButton("+", function() {
        addFormElement.classList.remove("hide");
    });
    for (var [entidade] of entidades) {
        appendButtonEntity(entidade);
    }
}

function initAddForm() {
    $("#addFormBtnCancel").onclick = (event) => {
        addFormElement.classList.add("hide");
    };
    $("#addFormBtnSave").onclick = (event) => {
        var name = $("#addEntityName").value;
        var description = $("#addEntityDescription").value;
        var meta = $("#addEntityMeta").value;

        addEntidade(
            name, 
            description,
            meta
        );
        initButtons();
        addFormElement.classList.add("hide");
    };
// document.querySelector('#btnPessoa').onclick = (event) => {
//     event.preventDefault();
//     showEntidade('pessoa');
// }
}

function initAddAttribute() {
    $("#addAttributeBtnCancel").onclick = (event) => {
        addAttributeFormElement.classList.add("hide");
    };
    $("#addAttributeBtnSave").onclick = (event) => {
        var name = $("#addAttributeName").value;
        var type = $("#addAttributeType").value;
        var meta = $("#addAttributeMeta").value;
        var description = $("#addAttributeDescription").value;

	    addAtributo(
	    	entidadeAtiva,
	    	name,
	    	type,
	    	meta,
	    	description
	    );
        showEntidade(entidadeAtiva);

        addAttributeFormElement.classList.add("hide");
    };
}

function initAddRelationship() {
    $("#addRelationshipBtnCancel").onclick = (event) => {
        addRelationshipFormElement.classList.add("hide");
    };
    $("#addRelationshipBtnSave").onclick = (event) => {
        var name = $("#addRelationshipName").value;
        var entity = $("#addRelationshipEntity").value;

	    addRelationship(
            entidadeAtiva,
	    	name,
            entity
	    );
        showEntidade(entidadeAtiva);

        addRelationshipFormElement.classList.add("hide");
    };
}
initData();
initAddForm();
initAddAttribute();
initAddRelationship();
//updateData();
initButtons();
showEntidade('cliente');
// document.querySelector('#btnPessoa').onclick = (event) => {
//     event.preventDefault();
//     showEntidade('pessoa');
// }

// document.querySelectorAll('.btnEntity').forEach(
//     (button) => {
//         button.addEventListener('click', () => {
//             console.log("forEach worked");
//             console.log(button);
//             showEntidade(button.textContent);
//         });
//     }

// );

// document.querySelector('.btnEntity').onclick = (event) => {
//     event.preventDefault();
//     console.log('entrou');
//     var entity = event.target.textContent;
//     showEntidade(entity);
// }
    // var txt = $('#test').value
    // myMap.set("a", txt)
    // var person = {
        // firstName: "John",
        // lastName : "Doe",
        // id       : 5566,
        // fullName : function() {
            // return this.firstName + " " + this.lastName;
        // }
    // };
    // var pessoa = {
        // atributo: "Codigo
    // myMap.set("b", person);
    // for (var [key, value] of myMap) {
        // console.log(key + " = " + value);
    // }
    // console.log(myMap.get("b").id);


    // let ret = http.get('http://localhost:9090/api/cat');
    // ret.then( ret => {
    //     resultDiv.innerHTML += "Resposta do servidor " + ret.animal + "<br />";
    // }).catch(error => console.log("Deu ruim: " + error));

// document.querySelector('#btnDog').onclick = (event) => {
//     event.preventDefault();
//     console.log("Clicou no Cachorro");
//     // let ret = http.get('http://localhost:9090/api/dog');
//     // ret.then( ret => {
//     //     resultDiv.innerHTML += "Resposta do servidor " + ret.animal + "<br />";
//     // }).catch(error => console.log("Deu ruim: " + error));
// }
