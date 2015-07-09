/* jshint ignore:start */
/*
 * Type: function
 * Descrición: para observar cada bloque de categorias que se desplega en el menu horisontal
 * Parametros:
 * 	category_id_container: id del nodo que contiene las categorias, en un principio es default-options, el cual el id de nodo que contiene las categorias por defecto. es decir la principales.
 *  luego de selecionar una categoria, sera insertado en el dom un nuevo nodo contenedor de categorias si y solo si la categoria selecionada tenga desendientes, la idea es observar a los nuevas categorias
 *  insertadas
 *
 * */
var observer_category_container = function(category_id_container){

  if(!category_id_container){
    category_id_container = 'default-options';
  }

  // recive el id del nodo que contiene las categorias
  $('#'+category_id_container).children().each(function(){
    $(this).click(function(event){

      var element_id 	= $(this).attr('id'); // category-id-142
      var category_id = str_replace(element_id,'category-id-',''); // 142

      // solicitamos un metodo de la clase, se le envia el id de la categoria selelcionada
      get_child_elements(category_id);


    });
  });
}



/*
 * Type: función
 * Descrición: nucleo del menu principal, determina si la categoria suministrada tiene decendientes, si los tiene construye un nuevo bloque, si no tiene se supone que es la categoria selecionada.
 * Parametros:
 * 	category_id: int, el id de la categoria
 * */
var get_child_elements = function(category_id){
  var get_child_elements_obj = {
    "type":"post",
    "url":"/get_category_child_elements",
    "data":{
      "custon":{}
    },
    "console_log":true,
    "callbacks":{
      "complete":function(response){

        var a = response.responseText;

        var obj = $.parseJSON(a);
        if(obj.expired_session){
          window.location = "/entrar";
        }

        set_menu(obj);
        set_path(obj.path);

      }
    }
  }

  var category_element = $('#category-id-'+category_id);
  // remueve los vecinos a la derecha, acomodando el espacio para recivir e insertar la respuesta del servidor aseca de si hay o no mas categorias depedientes.
  var category_id_container	= $(category_element).parent().attr('id');
  $('#'+category_id_container).nextAll().each(function(){ $(this).remove() });

  var request_this = {};
  request_this.category_id  = category_id;

  get_child_elements_obj.data.custon = request_this;
  new Request(get_child_elements_obj);

}


/*
 * Type: función
 * Descrición: funcion destinada a pausar una publicación activa
 * Parametros:
 * 	id: int, el id de la publicación
 * */
var pause = function(){
  var pause_obj = {
    "type":"post",
    "url":"/pause",
    "data":{
      "custon":{}
    },
    "console_log":true,
    "callbacks":{
      "complete":function(response){

        var a = response.responseText;
        var obj = $.parseJSON(a);
        if(obj.expired_session){
          window.location = "/entrar";
        }

        if(obj.result){

          $('#pause').css({
            "display": 'none'
          });
          $('#activate').css({
            "display": 'inline'
          });

        }else{
          window.location = "/";
        }


      }
    }
  }

  if($("#pause").length){
    $("#pause").click(function(){
      var request_this = {};
      request_this.id  = $("#ProductId").val();
      pause_obj.data.custon = request_this;
      new Request(pause_obj);
    });
  }

}

/*
 * Type: función
 * Descrición: funcion destinada a activar una publicación pausada
 * Parametros:
 * 	id: int, el id de la publicación
 ********************************************************************/
var activate = function(){
  var activate_obj = {
    "type":"post",
    "url":"/activate",
    "data":{
      "custon":{}
    },
    "console_log":true,
    "callbacks":{
      "complete":function(response){

        var a = response.responseText;
        var obj = $.parseJSON(a);
        if(obj.expired_session){
          window.location = "/entrar";
        }

        if(obj.result){

          $('#pause').css({
            "display": "inline"
          });
          $('#activate').css({
            "display": "none"
          });

        }else{
          window.location = "/";
        }

      }
    }
  }

  if($("#activate").length){
    $("#activate").click(function(){
      var request_this = {};
      request_this.id  = $("#ProductId").val();

      activate_obj.data.custon = request_this;
      new Request(activate_obj);
    });
  }

}



var _delete =  function(){

  var delete_obj = {
    "type":"post",
    "url":"/delete",
    "data":{
      "custon":{}
    },
    "console_log":true,
    "callbacks":{
      "complete":function(response){

        var a = response.responseText;


        var obj = $.parseJSON(a);
        if(obj.expired_session){
          window.location = "/entrar";
        }

        if(obj.result){
          window.location = "/cuenta";
        }else{
          window.location = "/";
        }

      }
    }
  }

  if($("#delete").length){

    $("#delete").on('click',function(event){
      event.preventDefault();
      // Activamos el modal
      $('#delete_product_modal').modal({"backdrop":true,"keyboard":true,"show":true,"remote":false}).on('hidden',function(){
      });
    });

    $("#delete_product").click(function(){
      var request_this = {};
      request_this.id  		= $("#ProductId").val();
      request_this.session 	= true;

      delete_obj.data.custon = request_this;
      new Request(delete_obj);
    });

  }

}








/*
 * Type: función
 * Descrición: para construri y observar el path: eletronicos>laptops>14"  cada seción reprecenta una previa seleción en el menu, la idea es regresar a un estado anterior del menu rapidamente sin temer que observar todas
 * las categorias.
 * Parametros:
 * 	path: un objeto json
 * */
var set_path =  function(path){
  var h = '';

  $.each(path,function(k,v){
    if((k+1)==$(path).length){
      h += '<li id="'+'path-category-id-'+v.id+'" class="active">'+v.name+'</li>';
    }else{
      h += '<li id="'+'path-category-id-'+v.id+'"><span style="color: #08C;">'+v.name+'</span> <span class="divider">/</span></li>';
    }
  });
  $('#path').html(h);
  $('#path2').html(h);

  $('#path').children().each(function(){
    $(this).click(function(){
      var path_category_id				= $(this).attr('id'); //  path-category-id-142
      var category_id						= str_replace(path_category_id,'path-category-id-','');	// 142
      get_child_elements(category_id);
    })
  });
}



/*
 * Type: función
 * Descrición: para re-construrir y observar eventos del menu.
 * Parametros:
 * 	menu: un objeto json
 * */
var set_menu = function(obj){

  //console.log(obj);

  if(obj.children){

    // los elementos que esten + 1 - cuento los menus - el por defecto y los que este desplegados - mas el que sera proximamente insertado en el dom es decir (+1) y asi calcular el nuevo ancho
    var newWidth = (($('#menu').children().length)+1)*251;
    $('#menu').css({"width":newWidth+'px'});

    //var srollValue = $('menu-box').scrollLeft	- la idea es si la caja interna sobrepasa el tamaño al insertar un nuevo menu dependiente
    // el scroll automaticamente se actualiza pero no es visible el submenu por lo tanto hay que auto rodar hasta el final
    var parent_obj_width_dimension 	= $('#menu').parent().width();
    var child_obj_width_dimension	= $('#menu').width();

    if(child_obj_width_dimension > parent_obj_width_dimension){
      var scroll_value = child_obj_width_dimension - parent_obj_width_dimension;
      $('#menu-box').scrollLeft(scroll_value);
    }

    var tmp1							= random_number(1,9999)
    var tmp2 							= random_number(10000,20000)
    var random_category_id_container	= 'dependent-options-'+random_number(tmp1,tmp2)


    var ul = '';
    ul += '<div class="ulMenu" id="'+random_category_id_container+'">'
    $.each(obj.categories,function(k,v){
      ul +=  '<div id="category-id-'+k+'" class="liMenu"> '+v+'</div>'
    });
    ul += '</div>'

    $('#menu').append(ul)

    // se observa este nuevo elemento - el nuevo submenu para ser prosesado
    observer_category_container(random_category_id_container);

    $('#ProductCategoryId').attr({"value":null});

    $('#add-content').attr({"disabled":"disabled"}); // se inavilita el boton para procegiar con la carga del nuevo producto
    // add .disabled
    if(!$('#add-content').hasClass("disabled")){
      $('#add-content').addClass("disabled");
    }

  }else{

    var newWidth = (($('#menu').children().length)*251)+301;
    $('#menu').css({"width":newWidth+'px'});

    //var srollValue = $('menu-box').scrollLeft	- la idea es si la caja interna sobrepasa el tamaño al insertar un nuevo menu dependiente
    // el scroll automaticamente se actualiza pero no es visible el submenu por lo tanto hay que auto rodar hasta el final
    var parent_obj_width_dimension 	= $('#menu').parent().width();
    var child_obj_width_dimension	= $('#menu').width();

    if(child_obj_width_dimension > parent_obj_width_dimension){
      var scroll_value = child_obj_width_dimension - parent_obj_width_dimension;
      $('#menu-box').scrollLeft(scroll_value);
    }

    var ul = '<div id="category-selected" class="category-selected"><div style="margin-top: 50px;" ><center><span class="category-selected-text">Categoria selecionada!</span> <br><img src="/img/ok.png" alt="Gracias" /></center></div></div>';
    $('#menu').append(ul);

    $('#ProductCategoryId').attr({"value":obj.category_id_selected});

    $('#add-content').attr({"disabled":false});
    // remove css class .disabled
    if($('#add-content').hasClass("disabled")){
      $('#add-content').removeClass("disabled");
    }

  }

  var category_element = $('#category-id-'+obj.id);

  // establecer stylos - del actual contenedor-menu - se verifica si existe un elemento con la clase css li-selected - si existe se le remueve - se procede a agregarle la clase css  li-selected a la categoria selecionada
  $(category_element).parent().children().each(function(){
    if($(this).hasClass('li-selected')){
      $(this).removeClass('li-selected');
    }
  });
  $(category_element).addClass('li-selected');

}

/*
 * Type: función
 * Descrición: para rearmar el menu de categorias completamente y path con solo suminitrar el id de la categoria selecionada guardada, del borrador o la publicacion a editar.
 * las categorias.
 * Parametros:
 * 	id: id de la categoria
 * */
var update_all_menu = function(){

  var current_menu = $.parseJSON($("#current-menu").html());
  set_path(current_menu);

  $.each(current_menu,function(){
    set_menu(this);
  });

}


/*
 * Type: función
 * Descrición: Administar la trancisión, luego de selecionar la categoria, al editar la categoria.
 * Parametros: null
 * */
var transition = function(){
  // Cuando se va editar hay que acomodar el menu de selecion de categorias para que en caso de que el usuario quiera editar la categoria pueda observar el menu tal cual lo dejo.
  if($('#ProductCategoryId').val()){
    update_all_menu();

    //console.log('se debe empezar a migrar UpdateAllMenu.buildMenu(id) de categories.js');

    $('#category-selector').css({"display":"none"});
    $('#add-product').css({"display":'block'});
  }else{
    $('#category-selector').css({"display": "block"});
    $('add-product').css({"display": "none"});
  }

  if($('#add-content')){

    $('#add-content').click(function(event){
      event.preventDefault();
      $('#category-selector').css({"display":"none"});
      $('#add-product').css({"display":"inherit"});
    });
  }

  /* VERIFICAR LA VALIDES DE ESTE CODIGO
   ****************************************/
  if($('#edit-category')){
    $('#edit-category').click(function(event){

      $('#category-selector').css({"display":"block"});
      $('#add-product').css({"display": "none"});

      var parent_obj_width_dimension 	= $('#menu').parent().width();
      var child_obj_width_dimension	= $('#menu').width();

      if(child_obj_width_dimension > parent_obj_width_dimension){
        var scroll_value = child_obj_width_dimension - parent_obj_width_dimension;
        $('#menu-box').scrollLeft(scroll_value);
      }

    });
  }



}




/*
 * Type: Clase generica ajax: para procesar un formulario.
 * Descrición: destinada a crear una nueva publicación, la clase requiere dos objetos para ser procesada.
 * 	1) new_product_obj: procesado luego de completar el proceso de validacion
 *  2) new_product_validate_obj: requerido para procesar la validacion.
 * Parametros:
 * 	a) id del formulario
 * 	b) objeto con los paramentros para validar la data sumistrada.
 * */
var new_product_obj = {
  "type":"post",
  "url":"/add_new",
  "data":{
    "form":{
      "id":"ProductAddForm",
      "inputs":{
        "id":{
          "id":"ProductId"
        },
        "category_id":{
          "id":"ProductCategoryId"
        },
        "title":{
          "id":"ProductTitle"
        },
        "subtitle":{
          "id":"ProductSubtitle"
        },
        "body":{
          "id":"ProductBody"
        },
        "price":{
          "id":"ProductPrice"
        },
        "quantity":{
          "id":"ProductQuantity"
        },
      }
    }
  },
  "console_log":true,
  "callbacks":{
    "complete":function(response){
      var a	= response.responseText;

      var obj = $.parseJSON(a);
      if(obj.expired_session){
        window.location = "/entrar";
      }

      /* Acciones luego de guardar un producto con exito.
       *******************************************/
      /*
       console.log(a);
       {"result":true,"product_id":"15","product_title":"sa"}
       */

      if(obj.result){
        var slug = str_replace((obj.product_title.toLowerCase().trim()),' ','_');
        var link = 	'/producto/'+obj.product_id+'/'+slug+'.html';
        window.location = link;
      }else{
        window.location = "/";
      }
    }
  }
}


// validación:
var new_product_validate_obj = {
  "submitHandler": function(form){

    /*
     el id debe ser definido al abrir el modal, porque al cargar multiples imagenes, el codigo se ejecuta rapidamente, con lo que si son 10 imagenes las 3-4 primera informaran que el id no existe, por lo tanto
     se crerar cuatro product.id., evitamos esto al abrir el modal automaticamente solicitamos crear un borrador para definir el product.id con el cual seran guardadas las multiples imagenes.
     */

    /* Descripción: función destinada a establecer un efecto visual de requerido sobre la seccion dispuesta para cargar imagenes.
     *************************************************/
    var start_upload = function(){
      $("#start-upload").parent().css({
        "background-color":"#FFD1D1",
        "border":"1px solid red"
      });
      $("#start-upload").one("click",function(){
        $("#start-upload").parent().css({
          "background-color":"white",
          "border":"1px solid #CCC"
        });
      });
    }

    if($('#ProductId').val()){
      if($("#product_thumbnails a").length){
        /* luz verde para relizar solicitud ajax
         ********************************/
        new Request(new_product_obj);
      }else{
        /* Se invita en cargar imagenes
         ******************************/
        start_upload();
      }
    }else{
      /* Se invita a cargar imagenes
       ******************************/
      start_upload();
    }

    console.log('se envia la solicitud');
  },
  "rules":{
    "ProductTitle":{
      "required":true,
      "maxlength":200
    },
    "ProductBody":{
      "required":true
    },
    "ProductPrice":{
      "required":true,
      "number": true,
      "min":0
    },
    "ProductQuantity":{
      "required":true,
      "digits": true,
      "min":1
    }
  },
  "messages":{
    "ProductTitle":{
      "required":"El campo titulo es obligatorio.",
      "maxlength":"El titulo no debe tener mas de 200 caracteres."
    },
    "ProductBody":{
      "required":"El campo descipción es obligatorio."
    },
    "ProductPrice":{
      "required":"El campo precio es obligatorio.",
      "number":"Solo un numero, entero o racional separado por un punto.",
      "min":"El precio debe ser igual o mayor a 0."
    },
    "ProductQuantity":{
      "required":"El campo cantidad es obligatorio.",
      "digits":"Solo numeros enteros positivos.",
      "min":"La cantidad debe ser igual o mayor a 1."
    }
  }
}


/*
 * Type: function.
 * Descrición: destinada a crear un borrador. basicamente para definir el id de la publicación.
 * Parametros:
 * 	now: boleano
 * 		1) si es true: se hara la solicitud imediatamente
 * 		2) si es false o indefinido: se esperara por un evento para realizar la solicitud
 * */
var	save_draft = function(now){
  var save_draft_obj = {
    "type":"post",
    "url":"/save_draft",
    "data":{
      "custon":{}
    },
    "console_log":true,
    "callbacks":{
      "complete":function(response){

        var a = response.responseText;
        console.log(a);

        var obj = $.parseJSON(a);

        if(obj.expired_session){
          window.location = "/entrar";
        }

        // {"id":"8","time":"22:04"}
        if(obj.id){
          $('#ProductId').attr({"value":obj.id});
          $('#debugTime').css({"display":"block"});
          $('#lastTimeSave').html(obj.time);

          if(this.flag){
            clear = true
          }else{
            clear = false
          }
          this.flag = elapsedTime(clear);

          // se prende
          // se apaga y luego se prende
          // se apaga y luego se prende
        }
      }
    }
  }

  if(now){
    var request_this = {};

    request_this.id 				= $("#ProductId").val();
    request_this.category_id  		= $("#ProductCategoryId").val();
    request_this.title  			= $("#ProductTitle").val();
    request_this.subtitle  			= $("#ProductSubtitle").val();
    request_this.body  				= $("#ProductBody").val();
    request_this.price  			= $("#ProductPrice").val();
    request_this.quantity 			= $("#ProductQuantity").val();

    save_draft_obj.data.custon = request_this;

    new Request(save_draft_obj);
  }else{
    $('#save-now').click(function(){

      var request_this = {};

      request_this.id 				= $("#ProductId").val();
      request_this.category_id  		= $("#ProductCategoryId").val();
      request_this.title  			= $("#ProductTitle").val();
      request_this.subtitle  			= $("#ProductSubtitle").val();
      request_this.body  				= $("#ProductBody").val();
      request_this.price  			= $("#ProductPrice").val();
      request_this.quantity 			= $("#ProductQuantity").val();

      save_draft_obj.data.custon = request_this;

      new Request(save_draft_obj);

    });
  }
  return null;
}

/*
 * Type: function.
 * Descrición: destinada a desplegar en el dom los minutos transcurridos luego de guardar un borrador.
 * Parametros:
 * 	clear: boleano
 * */
var elapsedTime = function(clear){
  if(clear){ clearInterval(this.id) }
  $("#minutesElapsed").html(0);
  this.id = self.setInterval(function(){
    var tmp =  $("#minutesElapsed").html();
    elapsed_time = parseInt(tmp)+1;
    $("#minutesElapsed").html(elapsed_time);
  }, 60000);
  return true
}



/*
 * Type: Evento.
 * Descrición: Destinado a observar el envento de abrir el modal para cargar imagenes del producto o servicio, con el fin de establecer acciones.
 * */
$("#start-upload").on('click',function(event){
  event.preventDefault();
  $('#uploading-pictures').modal({"backdrop":false,"keyboard":true,"show":true,"remote":false});
});

$('#uploading-pictures').on('show', function(){
  save_draft(true);
});

$("#continue-upload").on('click',function(event){
  event.preventDefault();
  $('#uploading-pictures').modal({"backdrop":false,"keyboard":true,"show":true,"remote":false});
});


/*
 * Type: Objeto JSON.
 * Descrición: Almacena ordenadamente todas las acciones que ocurren tras los eventos que suceden en una solicitud xhr.
 * */
var file_upload_callbacks = {
  "events":{
    "dragover":function(element){
      $('#drop-files').css({
        "border": '2px dashed #357AE8',
      });
      $('#uploading-pictures').css({
        "border": '1px solid #357AE8',
      });
    },
    "drop":function(element){
      $('#drop-files').css({
        "border": '2px dashed #DCDCDC',
      });
      $('#uploading-pictures').css({
        "border": '1px solid rgba(0, 0, 0, 0.3)',
      });

    },
    'progressEvent':{
      'loadstart':function(evt){
        //	Description					|	Times
        //	Progress has begun. 			Once.
        //	console.log(evt);


        var temporary_element = '<a class="thumbnail" style="overflow: hidden;  width: 200px; height: 200px; float: left; margin: 5px;" >'+
          '<div style="overflow: hidden; width: 200px; padding-top: 30px;" ><center><img src="/img/photocamera.png" ></center></div>'+
          '<div style="overflow: hidden; width: 200px; margin-top: 5px;" >'+
          '<center>'+
          '<span class="upload-progress"><img src="/img/loading.gif" ></span>'
        '</center>'+
        '</div>'+
        '</a>';

        if($("#optional-selection-container")){

          $('#optional-selection-container').css({
            "display": "none"
          });
          $('#drop-files').append(temporary_element);

          this.last_element_inserted = $('#drop-files').children().last();


        }else{

          $('#drop-files').append(temporary_element);

          this.last_element_inserted =  $('#drop-files').children().last();

        }

        // añadir mas
        $('#second-files-button').css({"display":"block"});

        // permitimos guardar
        $('#save-this').removeClass('disabled');




      },
      'progress':function(evt){
        //	Description					|	Times
        //	In progress.					Zero or more.
        console.log('In progress');


        // this.last_element_inserted
        /*
         if (evt.lengthComputable) {
         var percentComplete = evt.loaded / evt.total;
         } else {
         // console.log('Unable to compute progress information since the total size is unknown');
         }

         */

        /*	 Ejemplo:
         var progressBar = document.getElementById("p"),
         client = new XMLHttpRequest()
         client.open("GET", "magical-unicorns")
         client.onprogress = function(pe) {
         if(pe.lengthComputable) {
         progressBar.max = pe.total
         progressBar.value = pe.loaded
         }
         }
         client.onloadend = function(pe) {
         progressBar.value = pe.loaded
         }
         client.send()
         */

      },
      'error':function(evt){
        //	Description					|	Times
        // 	Progression failed.				Zero or more.
        console.log("Progression failed.");

      },
      'abort':function(evt){
        //	Description					|	Times
        //	Progression is terminated.		Zero or more.
        console.log("Progression is terminated.");
      },
      'load':function(evt){
        //	Description					|	Times
        //  Progression is successful.		Zero or more.
        console.log('Progression is successful.');
      },
      'loadend':function(evt){
        //	Description					|	Times
        // 	Progress has stopped.			Once.
        console.log('Progress has stopped.');
        //	console.log(this.last_element_inserted);


        var a = this.responseText;
        console.log(a);

        var obj = $.parseJSON(a);
        if(obj.expired_session){
          window.location = "/entrar";
        }


        /*
         {
         "original":{
         "name":"Capturadepantallade2013-01-0619203433.png",
         "id":"78"
         },
         "thumbnails":{
         "large":{
         "name":"Capturadepantallade2013-01-0619203430.png",
         "size":"1920x1080",
         "id":"79"
         },
         "median":{
         "name":"Capturadepantallade2013-01-0619203431.png",
         "size":"900x900",
         "id":"80"
         },
         "small":{
         "name":"Capturadepantallade2013-01-0619203432.png",
         "size":"400x400px",
         "id":"81"
         }
         }
         }
         */

        var myTemplante = 	'<div style="overflow: hidden; width: 200px; height: 200px; z-index: 0; position: relative;" ><center><img src="/img/products/'+obj.thumbnails.small.name+'" ></center></div>'+
          '<div class="delete-this-image" style="overflow: hidden; z-index: 1; margin-top:-200px; position: relative; float: right; padding-right: 2px; padding-top: 2px; width: 24px; height: 24px; cursor: pointer;">'+
          '<img style="width: 24px;" src="/img/x2.png">'+
          '</div>'+
          '<div style="display:none">'+a+'</div>';

        $(this.last_element_inserted).html(myTemplante);

        $('#save-this').attr({"disabled":false});

        $(this.last_element_inserted).find('div.delete-this-image').click(function(){
          $(this).parent().remove();
          exist_thumbnails();
        });

        // ¿siguen existiendo minaturas luego de borrar una? no, entonces se normaliza la vista.
        var exist_thumbnails = function(){
          if(!$('#drop-files .thumbnail').length){
            $('#optional-selection-container').css({
              "display": "block"
            });
            $('#second-files-button').css({
              "display": "none"
            });
            // no permitimos guardar
            $('#save-this').attr({"disabled":"disabled"});
          }
        }

      }
    }
  }
};

/*
 * Type: function.
 * Descrición: destinada a crear un objeto FormData el cual permitira tener acceso a los archivos que el usuario seleciona, para luego hacer una solicitud xhr.
 * Parametros:
 * 	callbacks: objeto json.
 * */
var file_upload =  function(callbacks){

  var file_input_element_ids  = ["first-files","second-files"];
  var drop_element_id			= "drop-files";

  $(file_input_element_ids).each(function(index, value){
    $('#'+value).change(function(){

      var files 	= {};

      for(i=0; i < this.files.length; i++){
        //console.log(this.files[i]);

        // start codigo casi identico: este codigo es en su mayoria el mismo para el evento soltar o drop
        var form = new FormData();
        form.append("product_id", $('#ProductId').val());
        form.append("image", this.files[i]);

        var xhr = new XMLHttpRequest();

        // Interface ProgressEvent																	Description							|	Times
        xhr.addEventListener("loadstart", 	callbacks.events.progressEvent.loadstart,	false);		//	Progress has begun. 				Once.
        xhr.addEventListener("progress", 	callbacks.events.progressEvent.progress, 	false); 	// 	In progress.						Zero or more.
        xhr.addEventListener("error", 		callbacks.events.progressEvent.error, 		false);   	// 	Progression failed.					Zero or more.
        xhr.addEventListener("abort", 		callbacks.events.progressEvent.abort, 		false); 	// 	Progression is terminated.			Zero or more.
        xhr.addEventListener("load", 		callbacks.events.progressEvent.load, 		false);  	// 	Progression is successful.			Zero or more.
        xhr.addEventListener("loadend", 	callbacks.events.progressEvent.loadend,		false);  	// 	Progress has stopped.				Once.

        xhr.open("post", "/image_add", true);
        xhr.send(form);
        // end codigo identico.


      }

    });
  });

  $("#"+drop_element_id).on('dragover',function(event){
    event.preventDefault();
    callbacks.events.dragover();
  });

  var dropzone = document.getElementById('drop-files');
  dropzone.ondrop = function(event) {
    event.preventDefault();
    callbacks.events.drop();

    var length = event.dataTransfer.files.length;
    for (var i = 0; i < length; i++) {
      var file = event.dataTransfer.files[i];
      // start codigo casi identico: este codigo es en su mayoria el mismo para el evento soltar o drop
      var form = new FormData();
      form.append("product_id", $('#ProductId').val());
      form.append("image", file);

      var xhr = new XMLHttpRequest();

      // Interface ProgressEvent																	Description							|	Times
      xhr.addEventListener("loadstart", 	callbacks.events.progressEvent.loadstart,	false);		//	Progress has begun. 				Once.
      xhr.addEventListener("progress", 	callbacks.events.progressEvent.progress, 	false); 	// 	In progress.						Zero or more.
      xhr.addEventListener("error", 		callbacks.events.progressEvent.error, 		false);   	// 	Progression failed.					Zero or more.
      xhr.addEventListener("abort", 		callbacks.events.progressEvent.abort, 		false); 	// 	Progression is terminated.			Zero or more.
      xhr.addEventListener("load", 		callbacks.events.progressEvent.load, 		false);  	// 	Progression is successful.			Zero or more.
      xhr.addEventListener("loadend", 	callbacks.events.progressEvent.loadend,		false);  	// 	Progress has stopped.				Once.

      xhr.open("post", "/image_add", true);
      xhr.send(form);
      // end codigo identico.

    }
  };



}

file_upload(file_upload_callbacks);


/*
 * Type: Evento.
 * Descrición: Destinado a procesar las imagenes cargadas que quedaron en el modal. Una ves cargadas la imagenes existe la opcion de eliminarla, las imagenes que queden en el modal seran procesadas, si son eliminadas
 * todas la imagenes el botton queda inavilitado, por lo tanto esta logica deja de se procesada.
 * */
$('#save-this').click(function(event){
  event.preventDefault();

  $('#uploading-pictures').modal('hide');

  if($('#drop-files .thumbnail').length){

    var images_ids = [];
    $('#drop-files .thumbnail').each(function(){

      var image_pure_json_obj 	= $(this).children().last().html();
      var image_obj				= $.parseJSON(image_pure_json_obj);

      images_ids.push(image_obj.original.id);

      /* Insertar la imagen del producto en la vista
       *************************************/
      var product_thumbnail_element = '<a class="thumbnail" id="thumbnail-id-'+image_obj.original.id+'" style="overflow: hidden; width: 200px; height: 200px; float: left; margin: 5px;">'+
        '<div style="overflow: hidden; width: 200px; height: 200px; z-index: 0; position: relative;">'+
        '<center>'+
        '<img src="/img/products/'+image_obj.thumbnails.small.name+'" title="santomercado.com" />'+
        '</center>'+
        '</div>'+
        '<div class="disable-this-product-thumbnail" style="overflow: hidden; z-index: 1; margin-top:-200px; position: relative; float: right; padding-right: 2px; padding-top: 2px; width: 24px; height: 24px; cursor: pointer;">'+
        '<img style="width: 24px;" src="/img/x2.png">'+
        '</div>'+
        '<div class="view-this-product-thumbnail" style="overflow: hidden; z-index: 1; margin-top:-120px; margin-left: 80px; position: relative;  padding-right: 2px; padding-top: 2px; width: 32px; height: 32px; cursor: pointer;">'+
        '<img src="/img/view.png">'+
        '</div>'+
        '<div style="display:none;">'+image_pure_json_obj+'</div>'+
        '</a>';



      if($('#product_thumbnails a').length){
        // console.log('cuando existen lis');

        var product_thumbnail = $('#product_thumbnails').append(product_thumbnail_element);

      }else{
        // console.log('cuando no existen lis')

        //ocultar start-upload
        $('#start-upload').css({
          "display": 'none',
        });

        //insertar los lis en el carrusel
        var product_thumbnail = $('#product_thumbnails').append(product_thumbnail_element);

        //mostrar el elemento con id product_thumbnails
        $('#product_thumbnails').css({
          display: 'inherit',
        });

        // mostrar link -continuar cargando-
        $('#continue-upload').css({
          "display": "inline",
        });
      }

    });

    /* Avilitar las miniaturas selecionadas.
     ***************************************/
    // console.log(images_ids) solisitud ajax
    var selected_thumbnails_obj = {
      "type":"post",
      "url":"/enables_this_images",
      "data":{
        "custon":{}
      },
      "console_log":true,
      "callbacks":{
        "complete":function(response){

          var a = response.responseText;
          var obj = $.parseJSON(a);
          if(obj.expired_session){
            window.location = "/entrar";
          }

        }
      }
    }

    selected_thumbnails_obj.data.custon.images_ids = images_ids;
    selected_thumbnails_obj.data.custon.product_id = $('#ProductId').val();
    new Request(selected_thumbnails_obj)

    /* remover la miniaturas del modal
     ***************************************/
    if($('#drop-files .thumbnail').length){
      $('#drop-files .thumbnail').each(function(index){
        $(this).remove();
      });

      $('#optional-selection-container').css({
        "display": "block"
      });

      $('#second-files-button').css({
        "display": "none"
      });

      // no permitimos guardar
      $('#save-this').attr({"disabled":"disabled"});
    }

    /* inhabilitar miniaturas del producto
     *****************************************/
    disable_thumbnails();


    /* Visualizar en mejor resolución una miniatura avilitada del producto.
     *****************************************/
    better_visualizing();


  }

});


/*
 * Type: function.
 * Descrición: para visualizar en mejor resolución una miniatura avilitada del producto.
 * Parametros: null
 * ************************************************************************************/
var better_visualizing = function(){
  $("#product_thumbnails .view-this-product-thumbnail").each(function(){
    $(this).off("click");
    $(this).click(function(){

      pure_json_obj = $(this).parent().children().last().html()
      obj 			= $.parseJSON(pure_json_obj);
      // proceso para visualizar la imagen
      //console.log('proceso para visualizar en mejor resolución una miniatura:',obj);

      var image_url = '/./img/products/'+obj.thumbnails.median.name;
      $("#image-product").attr({"src":image_url})
      $("#product-light-box").lightbox();

    });
  });
}



/*
 * Type: function.
 * Descrición: destinada inhabilitar miniaturas del producto.
 * Parametros: null
 * *********************************************************************************/
var disable_thumbnails = function(){
  $("#product_thumbnails .disable-this-product-thumbnail").each(function(){
    $(this).off("click");
    $(this).click(function(){
      pure_json_obj = $(this).parent().children().last().html()
      obj 			= $.parseJSON(pure_json_obj);
      // proceso para inhabilitar una imagen
      //console.log('proceso para inhabilitar una imagen: ',obj);

      var disable_imagen_obj = {
        "type":"post",
        "url":"/disable_this_imagen",
        "data":{
          "custon":{}
        },
        "console_log":true,
        "callbacks":{
          "complete":function(response){

            var a = response.responseText;
            //console.log(a);
            var obj = $.parseJSON(a);
            if(obj.expired_session){
              window.location = "/entrar";
            }

            if(obj.status){
              $("#thumbnail-id-"+obj.image_id).remove();
            }

            /*	proceso para determinar si ahun exiten imagenes en la vista del producto.
             ********************************************************************************/
            if(!$("#product_thumbnails a").length){
              //ocultar el elemento con id product_thumbnails
              $('#product_thumbnails').css({
                "display": "none",
              });
              //muestro start-upload
              $('#start-upload').css({
                "display": "inherit",
              });
            }

          }
        }
      }

      disable_imagen_obj.data.custon.image_id 		= obj.original.id
      disable_imagen_obj.data.custon.product_id		= $('#ProductId').val();
      new Request(disable_imagen_obj);

    });
  });
}










/*
 * Type: function.
 * Descrición: destinada a procesar el descarte de la publicacion que se pretende crear o del borrador.
 * Parametros: null
 * */
var discard = function(){

  var discard_obj = {
    "type":"post",
    "url":"/discard",
    "data":{
      "custon":{}
    },
    "console_log":true,
    "callbacks":{
      "complete":function(response){

        var a = response.responseText;

        var obj = $.parseJSON(a);
        if(obj.expired_session){
          window.location = "/entrar";
        }

        if(obj.result){
          window.location = "/cuenta"
        }else{
          window.location = "/cuenta"
        }

      }
    }
  }

  $('#discard').click(function(){

    var product_id = $('#ProductId').val();

    if(product_id){

      var request_this = {};
      request_this.row_exist 			= true;
      request_this.id 				= product_id;
      discard_obj.data.custon 		= request_this;

    }else{

      var request_this = {};
      request_this.row_exist 			= false;
      discard_obj.data.custon 		= request_this;

    }

    new Request(discard_obj);

  });

}




/* Configuración
 ****************************************/

discard();
save_draft(false);
var new_product = new validate_this_form("ProductAddForm",new_product_validate_obj);

if($('#default-options')){
  console.log('default-options');
  observer_category_container();
  transition();
}

if($('#product_thumbnails a').length){
  /* inhabilitar miniaturas del producto
   *****************************************/
  disable_thumbnails();

  /* Visualizar en mejor resolución una miniatura avilitada del producto.
   ************************************************************************/
  better_visualizing();
}


activate();
pause();
_delete();

$('#ProductBody').redactor();

/*
 prototype	 	equivalente		jquery
 childElements					.children()
 nextSiblings					.next(),.nextAll(),.nextUntil(),.siblings()
 parentElement					.parent(),:parent Selector,.parents(),.parentsUntil()
 hasClassName					.hasClass()
 removeClassName					.removeClass()
 addClassName					.addClass()
 remove							.remove()
 */
