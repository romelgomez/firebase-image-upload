/* jshint ignore:start */
$(document).ready(function(){
  (function( publications, $, undefined ) {

    /*
     @Name              -> lastResponseData
     @visibility        -> Private
     @Type              -> Method
     @Description       -> maintains the latest data received by the server
     @parameters        -> NULL
     @returns           -> Object
     */
    var lastResponseData = {};

    /*
     @Name              -> currentAction
     @visibility        -> Private
     @Type              -> Method
     @Description       -> return the current action, exp: www.domain.com/action
     @parameters        -> NULL
     @returns           -> String
     @implemented by    ->
     */
    var currentAction = function(){
      var href 	= $(location).attr('href');
      var url 	= $.url(href);
      return url.segment(1);
    };


    /*
     @Name              -> parseUrl
     @visibility        -> Private
     @Type              -> Method
     @Description       -> parse the URL
     @parameters        -> NULL
     @returns           -> Object
     @implemented by    ->
     */
    var parseUrl = function () {

      var pathname 	= $(location).attr('href');
      var url 		= $.url(pathname);
      var segments	= url.attr('fragment');
      var action   	= url.segment(1);
      var userId   	= url.segment(2);

      var url_obj         	= {};
      url_obj['action']     	= action;
      url_obj['user-id']     	= userId;
      url_obj['search']      	= '';
      url_obj['page']        	= '';
      url_obj['order-by']    	= '';


      if(segments != ''){
        var split_segments = url.attr('fragment').split('/');
        if(split_segments.length){
          $(split_segments).each(function(index,parameter){

            if(parameter.indexOf("search-") !== -1){
              var search_string = utility.stringReplace(parameter,'search-','');

              /* La cadena search_string se manipula en el siguiente orden.
               *
               * 1) se reemplaza los caracteres especiales
               * 2) se elimina los espacios en blancos ante y después de la cadena
               * 3) se reemplaza los espacios en blancos largos por uno solo.
               *
               ********************************************************************/
              url_obj.search = search_string.replace(/[^a-zA-Z0-9]/g,' ').trim().replace(/\s{2,}/g, ' ');

              //console.log(url_obj.search);

            }
            if(parameter.indexOf("page-") !== -1){
              url_obj.page = parseInt(utility.stringReplace(parameter,'page-',''));
            }


            if(parameter == 'highest-price'){
              url_obj['order-by'] = "highest-price";
            }
            if(parameter == 'lowest-price'){
              url_obj['order-by'] = "lowest-price";
            }
            if(parameter == 'latest'){
              url_obj['order-by'] = "latest";
            }
            if(parameter == 'oldest'){
              url_obj['order-by'] = 'oldest';
            }
            if(parameter == 'higher-availability'){
              url_obj['order-by'] = 'higher-availability';
            }
            if(parameter == 'lower-availability'){
              url_obj['order-by'] = 'lower-availability';
            }


          });
        }
      }

      return url_obj;
    };

    // WYSIWYG  ckeditor - http://ckeditor.com/
    var initRedactor = function(){

//			$('#ProductBody')['redactor']();

      CKEDITOR.replace( 'ProductBody');

      CKEDITOR.instances['ProductBody'].on('change', function() { CKEDITOR.instances['ProductBody'].updateElement() });

    };

    /*
     Private Method
     Descripción: destinada a procesar el descarte de la publicación que se pretende crear o del borrador.
     */
    var discard = function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/discard",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){
            $('#debug').text(JSON.stringify(response));

            if(response['expired_session']){
              window.location = "/entrar";
            }

            window.location = "/";

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){}
        }
      };

      $('#discard').click(function(){

        var product_id = $('#ProductId').val();

        if(product_id){
          request_parameters['data']['row_exist'] = true;
          request_parameters['data']['id'] = product_id;
          ajax.request(request_parameters);

        }else{
          window.location = "/";
        }

      });

    };

    /*
     Private Method
     Descripción: destinada a desplegar en el dom los minutos transcurridos luego de guardar un borrador.
     Parámetros:
     clear: booleano
     */
    var elapsedTime = function(clear){
      if(clear){ clearInterval(this.id) }
      $("#minutesElapsed").html(0);
      this.id = self.setInterval(function(){
        var minutesElapsed = $("#minutesElapsed");
        var tmp =  minutesElapsed.html();
        var elapsed_time = parseInt(tmp)+1;
        minutesElapsed.html(elapsed_time);
      }, 60000);
      return true
    };

    /*
     Private Method
     Descripción: destinada a crear un borrador. Básicamente para definir el id de la publicación.
     Parámetros:
     now: booleano
     1) si es true: se hará la solicitud inmediatamente
     2) si es false o indefinido: se esperara por un evento para realizar la solicitud
     */
    var saveDraft = function(now,ifSuccess){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/save-draft",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){
//                        $('#debug').text(JSON.stringify(response));

            if(response['expired_session']){
              window.location = "/entrar";
            }

            // {"id":"8","time":"22:04"}
            if(response['id']){

              $('#ProductId').attr({"value":response['id']});
              $('#debugTime').css({"display":"block"});
              $('#lastTimeSave').html(response['time']);

              var clear = !!this['flag'];
              this['flag'] = elapsedTime(clear);
              // se prende
              // se apaga y luego se prende
              // se apaga y luego se prende

              if ( ifSuccess !== undefined ) {
                ifSuccess();
                ajax.notification("complete",notification);  // cuando sea llamada desde fileUpload()
              }else{
                ajax.notification("success",notification);   // cuando sea solicitado por el usuario
              }

            }else{
              ajax.notification("error",notification);
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(response){}
        }
      };

      if(now){

        request_parameters['data']['id']            = $("#ProductId").val();
        request_parameters['data']['title']         = $("#ProductTitle").val().trim();
        request_parameters['data']['body']          = $("#ProductBody").val();
        request_parameters['data']['price']         = $("#ProductPrice").val();
        request_parameters['data']['quantity']      = $("#ProductQuantity").val();

        ajax.request(request_parameters);

      }else{
        $('#save-now').click(function(){

          request_parameters['data']['id']            = $("#ProductId").val();
          request_parameters['data']['title']         = $("#ProductTitle").val().trim();
          request_parameters['data']['body']          = $("#ProductBody").val();
          request_parameters['data']['price']         = $("#ProductPrice").val();
          request_parameters['data']['quantity']      = $("#ProductQuantity").val();

          ajax.request(request_parameters);

        });
      }
      return false;
    };

    /*
     Private Method
     Descripción: destinada a crear una nueva publicación, la clase requiere dos objetos para ser procesada.
     1) request_parameters: procesado luego de completar el proceso de validación
     2) newProductValidateObj: requerido para procesar la validación.
     Parámetros:
     a) id del formulario
     b) objeto con los parámetros para validar la data suministrada.
     */
    var newProduct = function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/add_new",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){
            $('#debug').text(JSON.stringify(response));

            if(response['expired_session']){
              window.location = "/";
            }

            /*
             Luego de guardar un producto con éxito
             {"result":true,"product_id":"15","product_title":"sa"}
             */

            if(response['result']){
              var slug = utility.stringReplace((response['product_title'].toLowerCase().trim()),' ','-');
              slug = utility.stringReplace(slug,'/','-');
              window.location = '/product/'+response['product_id']+'/'+slug+'.html';
            }else{
              window.location = "/";
            }


          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(response){}
        }
      };

      // validación:
      var newProductValidateObj = {
        "submitHandler": function(form){

          /*
           El id debe ser definido al abrir el modal, porque al cargar multiples imágenes, el código se ejecuta rápidamente, con lo que si son 10 imágenes las 3-4 primera informaran que el id no existe, por lo tanto
           se creara cuatro product.id., evitamos esto al abrir el modal automáticamente solicitamos crear un borrador para definir el product.id con el cual serán guardadas las multiples imágenes.
           */

          /*
           Descripción: función destinada a establecer un efecto visual de requerido sobre la sección dispuesta para cargar imágenes.
           */
          var start_upload = function(){
            var start_upload = $("#previews");

            start_upload.css({
              "background-color":"#FFD1D1",
              "border":"1px solid red"
            });

            $("#first-files").one("click",function(){
              $("#previews").css({
                "background-color":"#f5f5f5",
                "border":"1px solid #CCC"
              });
            });

            $("#upload-all").one("click",function(){
              $("#previews").css({
                "background-color":"#f5f5f5",
                "border":"1px solid #CCC"
              });
            });
          };

          if($('#ProductId').val()){
            if($("#previews").find(".dz-success").length > 0){
              /* luz verde para realizar solicitud ajax
               ********************************/

              // Antes primero se verifica que hay contenido. La validación corriente no funciona con el WYSIWYG.
              var productBody = $('#ProductBody');
              if(productBody.val() == ''){
                var productBodyHelpBlock = productBody.parents('div.form-group').find('span.help-block')[0];
                $(productBodyHelpBlock).show();
              }else{

                request_parameters['data']['id']        = $("#ProductId").val();
                request_parameters['data']['title']     = $("#ProductTitle").val().trim();
                request_parameters['data']['body']      = $("#ProductBody").val();
                request_parameters['data']['price']     = $("#ProductPrice").val();
                request_parameters['data']['quantity']  = $("#ProductQuantity").val();

                ajax.request(request_parameters);
              }

            }else{
              /* Se invita en cargar imágenes
               ******************************/
              start_upload();
            }
          }else{
            /* Se invita a cargar imágenes
             ******************************/
            start_upload();
          }

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
            "maxlength":10,
            "min":0
          },
          "ProductQuantity":{
            "required":true,
            "digits": true,
            "maxlength":10,
            "min":1
          }
        },
        "messages":{
          "ProductTitle":{
            "required":"Title is required.",
            "maxlength":"The title should not be longer than 200 characters."
          },
          "ProductBody":{
            "required":"Description is required."
          },
          "ProductPrice":{
            "required":"Price is required.",
            "number":"Only a number, integer or rational separated by a dot.",
            "maxlength":"The price should not have more than 10 digits",
            "min":"The price must be equal or greater than 0."
          },
          "ProductQuantity":{
            "required":"Quantity available is required.",
            "digits":"Only positive integers.",
            "min":"The quantity must be equal to or greater than 1.",
            "number":"Please enter a valid number.",
            "maxlength":"Available quantity expressed should not be longer than 10 digits"
          }
        }
      };

      validate.form("ProductAddForm",newProductValidateObj);
    };



    var  fileUpload = function(){

      var layout = '<div class="dz-preview dz-file-preview">'+
        '<div class="dz-details">'+
        '<img data-dz-thumbnail />'+
        '</div>'+
        '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>'+
        '<div class="dz-success-mark"><span>✔</span></div>'+
        '<div class="dz-error-mark"><span>✘</span></div>'+
        '</div>';

      var removeButton = function(instance,file){

        var notification;

        // proceso para inhabilitar una imagen
        var request_parameters = {
          "requestType":"custom",
          "type":"post",
          "url":"/disable_this_imagen",
          "data":{},
          "callbacks":{
            "beforeSend":function(){
              notification = ajax.notification("beforeSend");
            },
            "success":function(response){
//                        $('#debug').text(JSON.stringify(response));

              if(response['expired_session']){
                window['location'] = "/entrar";
              }

              if(response['status']){
                ajax.notification("success",notification);
              }else{
                ajax.notification("error",notification);
              }

            },
            "error":function(){
              ajax.notification("error",notification);
            },
            "complete":function(){}
          }
        };


        var removeButton = Dropzone.createElement('<a class="dz-delete" style="cursor:pointer" >Delete</a>');
        // Listen to the click event
        removeButton.addEventListener("click", function(e) {
          // Make sure the button click doesn't submit the form:
          e.preventDefault();
          e.stopPropagation();

          // Remove the file preview.
          instance.removeFile(file);

          // en el contendor #previews determinamos si existen elementos con la clases div.dz-preview, que corresponden a una imagen cargada, si existen, nada pasa, si no existen, se oculta #continue-upload y se muestra #first-files, ambos ID corresponde a botones que inicializan la carga de imágenes.
          var previews = $("#previews").find("div.dz-preview");
          if(previews.length == 0 ){
            $("#first-files").show();
            $("#continue-upload").hide();
            $("#upload-all").hide();
          }


          var productId = $('#ProductId');

          // If you want to the delete the file on the server as well,
          // you can do the AJAX request here.
          if(file['xhr'] !== undefined){
//                        console.log('Es una imagen recién cargada al servidor que se quiere eliminar');

            var obj = JSON.parse(file['xhr']['response']);

            request_parameters['data']['image_id']      = obj['small']['id'];
            request_parameters['data']['product_id']    = productId.val();

            ajax.request(request_parameters);

          }else{
            if(file['id']  !== undefined){
//                            console.log('Es una imagen que esta en servidor');

              request_parameters['data']['image_id']      = file['id'];
              request_parameters['data']['product_id']    = productId.val();

              ajax.request(request_parameters);

            }else{
//                            console.log('Es una imagen en cola que fue eliminada')
            }
          }

        });

        // Add the button to the file preview element.
        file.previewElement.appendChild(removeButton);
      };


      $(document.body).dropzone({
        url: "/image_add",
        previewsContainer: "#previews",  // Define the container to display the previews
        clickable: ".clickable",         // Define the element that should be used as click trigger to select files.
        paramName: "image",              // The name that will be used to transfer the file
        maxFilesize: 10,                 // MB
        acceptedFiles: 'image/*',
        autoQueue: false,
        previewTemplate: layout,
        init: function() {

          var myDropzone = this; // closure

          $("#upload-all").on("click", function() {
//                        console.log("clicked");

            var ifSuccess = function(){
//                            console.log($('#ProductId').val());
              myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED)); // Tell Dropzone to process all queued files.
              $("#upload-all").hide();
            };

            saveDraft(true,ifSuccess);

          });

          // Para incluir las imágenes que ya estén cargadas.
          var pathname = $(location).attr('href');
          var url = $.url(pathname);
          var split_segments = url.attr('directory').split('/');
          if(split_segments[1] == 'edit' || split_segments[1] == 'edit-draft' ){
            var images = JSON.parse(utility.removeCommentTag($("#images").html()));
            if(images.length > 0){
              $("#first-files").hide();
              $("#continue-upload").show();

              $(images).each(function(index,obj){
//                                console.log(obj);
                // Create the mock file:
                var mockFile = { id: obj['id'], name: obj['name']};

                // Call the default addedfile event handler
                myDropzone.emit("addedfile", mockFile);

                // And optionally show the thumbnail of the file:
                myDropzone.emit("thumbnail", mockFile, "/resources/app/img/products/"+obj['name']);

                removeButton(myDropzone,mockFile);

                $(mockFile.previewElement).addClass('dz-success'); // .setAttribute("class",".dz-success");

              });
            }
          }



          // Added file
          myDropzone.on("addedfile", function(file) {
//                        console.log("Added file.");

            $("#first-files").hide();
            $("#continue-upload").show();
            $("#upload-all").show();

            removeButton(myDropzone,file);

          });

          // Sending
          myDropzone.on("sending", function(file, xhr, formData) {
            formData.append("product_id", $('#ProductId').val());
          });

          // Success
          myDropzone.on("success", function(file, xhr){
//                        console.log(file);
//                        console.log(xhr);
//                        file.data = xhr;
          });

          // Error
          myDropzone.on("error",function(file,errorMessage,xhr){
            // ...
          });

        }
      });
    };





    // Private Method
    // give html format to the publication
    var prepareProduct = function(obj){

      var id          = obj['Product']['id'];
      var title       = obj['Product']['title'].trim();
      var price       = obj['Product']['price'];
      var publication = '';

      var str = obj['Product']['created'];
      str = str.replace(/-/g,"/");
      var date        = new Date(str);
      var created     = date.getDay()+'/'+date.getMonth()+'/'+date.getFullYear()+' - '+date.getHours()+':'+date.getMinutes();

      var slug = obj['Product']['title'].trim().toLowerCase();
      slug = utility.stringReplace(slug,'®','');
      slug = utility.stringReplace(slug,':','');
      slug = utility.stringReplace(slug,'/','');
      slug = utility.stringReplace(slug,'|','');
      slug =  slug.replace(/\s+/g, ' ');
      slug = utility.stringReplace(slug,' ','-');

      var publicationLink = '/product/'+id+'/'+slug+'.html';

      var image = '';

      if(obj['Image'] == undefined || obj['Image'].length == 0){
        image = '/resources/app/img/no-image-available.png';
      }else{
        image = '/resources/app/img/products/'+obj['Image'][0]['name'];
      }

      switch (currentAction()) {
        case '':

          if(title.length > 32){
            title = title.slice(0, 30)+' ...';
          }
          title = utility.capitaliseFirstLetter(title);

          publication = '<div class="col-md-4">'+
            '<div class="thumbnail" style="border: 1px solid black; color: #ffffff; background: url(/resources/app/img/escheresque_ste.png); " >'+
            '<a href="'+publicationLink+'"><img src="'+image+'" alt="..."></a>'+
            '<div class="caption" style="border-top: 1px solid gold;">'+
            '<h3><a href="'+publicationLink+'" style="color: white;" >'+title+'</a></h3>'+
            '<h4 style="color: gold;">Price: $'+price+'</h4>'+
            '</div>'+
            '</div>'+
            '</div>';

          break;
        case 'drafts':

          var  draftLink = '/edit-draft/'+obj['Product']['id'];

          if(title == '') {
            title = '<mark>Untitled</mark>';
          }

          // se arma una publicación
          publication = '<div id="product-'+id+'"  class="media bg-info product" style="padding: 10px;border-radius: 4px; color:white; background-color: #222; background: url(/resources/app/img/escheresque_ste.png); " >'+
            '<a class="pull-left" href="'+draftLink+'">'+
            '<img src="'+image+'" class="img-thumbnail" style="width: 200px; ">'+
            '</a>'+
            '<div class="media-body">'+
            '<h4 class="media-heading" style="margin-bottom: 10px; border-bottom: 1px solid gold; padding-bottom: 9px;" ><a href="'+draftLink+'">'+utility.capitaliseFirstLetter(title)+'</a></h4>'+

            '<div style="margin-bottom: 10px;">'+
            '<div class="btn-group">'+
            '<button class="btn btn-default edit"><i class="icon-edit"></i> Edit</button>'+
            '</div>'+
            '</div>'+
            '<div>'+
            '<span class="glyphicon glyphicon-calendar"></span> Created: '+created+
            '</div>'+
            '</div>'+
            '</div>';


          break;
        case 'published':

          var status = '';
          var status_button = '';

          if(obj['Product']['status']){
            status = '<span class="label label-success publication-status-label">published</span>';
            status_button = '<button class="btn btn-default publication-status-button"><span class="glyphicon glyphicon-stop"></span> Pause</button>';
          }else{
            status = '<span class="label label-warning publication-status-label">paused</span>';
            status_button = '<button class="btn btn-default publication-status-button"><span class="glyphicon glyphicon-play"></span> Enable</button>';
          }

          var quantity = obj['Product']['quantity'];
          var _quantity = '';

          if(quantity == 0){
            _quantity = '<span class="badge">0</span>';
          }
          else if(quantity>= 1 && quantity<=5){
            _quantity = '<span class="badge badge-important">'+quantity+'</span>';
          }
          else if(quantity>=6 && quantity<=10){
            _quantity = '<span class="badge badge-warning">'+quantity+'</span>';
          }
          else if(quantity>10){
            _quantity = '<span class="badge badge-success">'+quantity+'</span>';
          }
          // END

          // se arma una publicación
          publication  = '<div id="product-'+id+'"  class="media bg-info product" style="padding: 10px;border-radius: 4px; color:white; background-color: #222; background: url(/resources/app/img/escheresque_ste.png); " >'+
            '<a class="pull-left" href="'+publicationLink+'">'+
            '<img src="'+image+'" class="img-thumbnail" style="width: 200px; ">'+
            '</a>'+
            '<div class="media-body">'+
            '<h4 class="media-heading" style="margin-bottom: 10px; border-bottom: 1px solid gold; padding-bottom: 9px;" ><a href="'+publicationLink+'">'+utility.capitaliseFirstLetter(title)+'</a></h4>'+

            '<div style="margin-bottom: 10px;">'+
            '<div class="btn-group">'+
            '<button class="btn btn-default edit"><i class="icon-edit"></i> Edit</button>'+
            status_button+
            '<button class="btn btn-danger delete" ><i class="icon-remove-sign"></i> Remove</button>'+
            '</div>'+
            '</div>'+
            '<div>'+
            '<span class="glyphicon glyphicon-tag"></span> Price: $'+price+'<br>'+
            '<span class="glyphicon glyphicon-off"></span> Status: '+status+'<br>'+
            '<span class="glyphicon glyphicon-th"></span> Quantity in stock: '+_quantity+'<br>'+
            '<span class="glyphicon glyphicon-calendar"></span> Created: '+created+
            '</div>'+
            '</div>'+
            '</div>';

          break;
      }

      return publication;

    };

    var currentOrder = function(order){

      var orderBy = $('#order-by-text');

      switch (order) {
        case 'highest-price':
          orderBy.text('Highest price');
          break;
        case 'lowest-price':
          orderBy.text('Lowest price');
          break;
        case 'latest':
          orderBy.text('Latest');
          break;
        case 'oldest':
          orderBy.text('Oldest');
          break;
        case 'higher-availability':
          orderBy.text('Higher availability');
          break;
        case 'lower-availability':
          orderBy.text('Lower availability');
          break;
        default:
          orderBy.text('Latest');
      }

    };

    /* Private Method
     * Descripción: función destinada a ordenar la publicaciones, según la preferencia del usuario.
     **********************************************************************************************/
    var orderBy =  function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/products",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){
            console.log(response);

            if(response['expired_session']){
              window.location = "/login";
            }

            if(response['status'] === 'success'){
              lastResponseData = response['data'];
              process();
            }else{
              window.location = "/";
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){
            ajax.notification("complete",notification);
          }
        }
      };

      var orderBy = [
        {
          'id':'highest-price',
          'url':'highest-price',
          'text':'Highest price'
        },                {
          'id':'lowest-price',
          'url':'lowest-price',
          'text':'Lowest price'
        },                {
          'id':'latest',
          'url':'latest',
          'text':'Latest'
        },                {
          'id':'oldest',
          'url':'oldest',
          'text':'Oldest'
        },                {
          'id':'higher-availability',
          'url':'higher-availability',
          'text':'Higher availability'
        },
        {
          'id':'lower-availability',
          'url':'lower-availability',
          'text':'Lower availability'
        }
      ];

      if(lastResponseData['paging-info']['count'] > 1){

        $.each(orderBy,function(index,orderBy){

          var element = $("#"+orderBy['id']);

          element.off('click');
          element.on('click',function(event){
            event.preventDefault();

            var url_obj =  parseUrl();
            var request_this = {};

            $('#order-by-text').text(orderBy['text']);

            // Se organiza en función a una búsqueda
            if(url_obj.search != ''){
              // se solicita buscar algo.
              request_this.search	= url_obj.search;

              var url = utility.stringReplace(url_obj.search,' ','-');
              window.location = "#search-"+url+"/"+orderBy['url'];

            }else{
              window.location = "#"+orderBy['url'];
            }

            request_this['order-by']   = orderBy['url'];

            var pathname            = $(location).attr('href');
            var currentUrl          = $.url(pathname);
            request_this['action']  =  currentUrl.segment(1);
            request_this['user-id'] =  currentUrl.segment(2);

            request_parameters.data = request_this;
            ajax.request(request_parameters);


          });

        });

        $("#order-by").show();
      }else{
        $("#order-by").hide();
      }

    };

    /*
     * Private Method
     * Descripción: encargada de administrar la paginación de los resultados.
     *************************************************************************************************************************************************************/
    var pagination = function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/products",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){

            if(response['expired_session']){
              window.location = "/login";
            }

            if(response['status'] === 'success'){
              lastResponseData = response['data'];
              process();
            }else{
              window.location = "/";
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){
            ajax.notification("complete",notification);
          }
        }
      };

      if(lastResponseData['paging-info']['pageCount'] > 1){

        // si existe una pagina anterior y si la página anterior no es la 0
        if(lastResponseData['paging-info']['prevPage'] && (lastResponseData['paging-info']['page']-1) != 0){

          var prevPage = $('#prev-page');

          prevPage.attr({"disabled":false}).removeClass('disabled');
          prevPage.off('click');
          prevPage.on('click', function(){

            var url_obj         =  parseUrl();
            var prev_page       = lastResponseData['paging-info']['page']-1; // también puede tomar el valor de: url_obj.page
            var request_this    = {};

            // PAGE
            request_this.page = prev_page;

            var url     = '';
            var new_url = '';

            if(url_obj['order-by'] != ''){
              if(url_obj.search != ''){
                url = utility.stringReplace(url_obj.search,' ','-');
                new_url = '#search-'+url+'/'+url_obj['order-by']+'/page-'+prev_page;
                //SEARCH
                request_this.search = url_obj.search;
              }else{
                new_url = '#'+url_obj['order-by']+'/page-'+prev_page;
              }
              // ORDER
              request_this['order-by'] = url_obj['order-by'];
            }else{
              if(url_obj.search != ''){
                url = utility.stringReplace(url_obj.search,' ','-');
                new_url = "#search-"+url+"/page-"+prev_page;
                //SEARCH
                request_this.search = url_obj.search;
              }else{
                new_url = "#page-"+prev_page;
              }
            }

            window.location = new_url;

            var pathname            = $(location).attr('href');
            var currentUrl          = $.url(pathname);
            request_this['action']  =  currentUrl.segment(1);
            request_this['user-id'] =  currentUrl.segment(2);


            request_parameters.data =    request_this;
            ajax.request(request_parameters);

          });

        }else{
          $("#prev-page").attr({"disabled":true}).addClass('disabled');
        }

        // si existe una siguiente pagina
        if(lastResponseData['paging-info']['nextPage']){

          var nextPage = $("#next-page");

          nextPage.attr({"disabled":false}).removeClass('disabled');
          nextPage.off('click');
          nextPage.on('click', function(){

            var url_obj =  parseUrl();

            var next_page = lastResponseData['paging-info']['page']+1; // también puede tomar el valor de: url_obj.page
            var request_this = {};

            // PAGE
            request_this.page = next_page;

            var url     = '';
            var new_url = '';

            if(url_obj['order-by'] != ''){
              if(url_obj.search != ''){
                url = utility.stringReplace(url_obj.search,' ','-');
                new_url = "#search-"+url+"/"+url_obj['order-by']+"/page-"+next_page;
                //SEARCH
                request_this.search = url_obj.search;
              }else{
                new_url = "#"+url_obj['order-by']+"/page-"+next_page;
              }
              // ORDER
              request_this['order-by'] = url_obj['order-by'];
            }else{
              if(url_obj.search != ""){
                url = utility.stringReplace(url_obj.search,' ','-');
                new_url = "#search-"+url+"/page-"+next_page;
                //SEARCH
                request_this.search = url_obj.search;
              }else{
                new_url = "#page-"+next_page;
              }
            }

            window.location = new_url;

            var pathname            = $(location).attr('href');
            var currentUrl          = $.url(pathname);
            request_this['action']  =  currentUrl.segment(1);
            request_this['user-id'] =  currentUrl.segment(2);

            request_parameters.data =    request_this;
            ajax.request(request_parameters);

          });
        }else{
          $("#next-page").attr({"disabled":true}).addClass('disabled');
        }

        $("#pagination").css({"display":""});
      }else{
        $("#pagination").css({"display":"none"});
      }

    };

    /*
     * Private Method
     * Descripción: destinada a realizar una búsqueda sobre los registros o publicaciones.
     *************************************************************************************************************************************************************/
    var search = function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/products",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){
            console.log('search',response);


            if(response['expired_session']){
              window.location = "/login";
            }

            if(response['status'] === 'success'){
              lastResponseData = response['data'];

              if(lastResponseData['search'] != ''){
                // se establece la url
                var url = utility.stringReplace(lastResponseData['search'],' ','-');
                window.location = "#search-"+url;
              }

              process();
            }else{
              window.location = "/";
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){
            ajax.notification("complete",notification);
          }
        }
      };

      // validación:
      var new_search_validate_obj = {
        "submitHandler": function(){

          var request_this        = {};
          var search_string       = $("#search").val();
          request_this['search']  = search_string.replace(/[^a-zA-Z0-9]/g,' ').trim().replace(/\s{2,}/g, ' ');

          var href            	= $(location).attr('href');
          var currentUrl          = $.url(href);
          request_this['action']  = currentUrl.segment(1);
          request_this['user-id'] = currentUrl.segment(2);

          request_parameters.data =    request_this;
          ajax.request(request_parameters);

        },
        "rules":{
          "search":{
            "required":true,
            "maxlength":100,
            "noSpecialChars":true
          }
        },
        "messages":{
          "search":{
            "required":"It is necessary to define the field to proceed with the search.",
            "maxlength":"There is a limit of 100 characters.",
            "noSpecialChars":"Not allowed to use special characters."
          }
        }
      };

      validate.inlineForm("SearchPublicationsForm",new_search_validate_obj);
      $("#searching").css({"display":""});


    };


    /*
     @Name              -> info
     @visibility        -> Private
     @Type              -> Method
     @Description       -> establece la información de la cantidad de registros existentes
     @parameters        -> NULL
     @returns           -> NULL
     @implemented by    -> process();
     */
    var info = function(){

      /*

       Algoritmo para obtener el resultado esperado con la data disponible:
       Cálculo Imaginario

       count 	:	el total de registros
       current :	los que actualmente son observados.

       1  - 10 de 35	----------- current: 10		1	2	3	4	6	5	7	9	8	10
       11 - 20 de 35   ----------- current: 10		11	12	13	14	15	16	17	18	19	20
       21 - 30 de 35	----------- current: 10		21	22	23	24	25	26	27	28	29	30
       31 - 35 de 35	----------- current: 5		31	32	33	34	35


       1 - 10 de 35

       count: 35
       current: 10
       data: Array[10]
       nextPage: true
       page: 1
       pageCount: 4
       prevPage: false

       if page < pageCount

       De 		=	page*current-10+1 	= 1*10-10+1 = 1
       Hasta	=	page*current					= 10



       11 - 20 de 35

       count: 35
       current: 10
       data: Array[10]
       nextPage: true
       page: 2
       pageCount: 4
       prevPage: true


       if page < pageCount

       De 		=	page*current-10+1 =	2*10-10+1 	= 11
       Hasta	=	page*current					=	20


       21 - 30 de 35

       count: 35
       current: 10
       data: Array[10]
       nextPage: true
       page: 3
       pageCount: 4
       prevPage: true

       if page < pageCount

       De 		=	page*current-10+1 = 3*10-10+1	= 21
       Hasta	=	page*current					= 30


       31 - 35 de 35

       count: 35
       current: 5
       data: Array[5]
       nextPage: false
       page: 4
       pageCount: 4
       prevPage: true

       if page ==  pageCount

       De 		=	count-current+1	= 31
       Hasta	=	count			= 35

       ********************************************************************

       1 - 5 de 5

       count: 5
       current: 5
       data: Array[5]
       nextPage: false
       page: 1
       pageCount: 1
       prevPage: false

       if page ==  pageCount

       De 		=	count-current+1	= 1
       Hasta	=	count			= 5

       */

      if(lastResponseData['paging-info']['count'] > 0){
        if(lastResponseData['paging-info']['count'] == 1){
          info = '1 publication';
        }else{

          var de = '';
          var hasta = '';

          if(lastResponseData['paging-info']['page'] == lastResponseData['paging-info']['pageCount']){
            de 		= lastResponseData['paging-info']['count']-lastResponseData['paging-info']['current']+1;
            hasta	= lastResponseData['paging-info']['count'];
          }

          if(lastResponseData['paging-info']['page'] < lastResponseData['paging-info']['pageCount']){
            de 		= (lastResponseData['paging-info']['page']*lastResponseData['paging-info']['current'])-12+1;
            hasta	= lastResponseData['paging-info']['page']*lastResponseData['paging-info']['current'];
          }

          var info = '<b>'+de+'</b> - <b>'+hasta+'</b> de <b>'+lastResponseData['paging-info']['count']+'</b>';

        }
      }else{
        info = '0 publications';
      }

      // se establece la información de la cantidad de registros existentes
      $("#pagination-info").find("span").html(info);

    };


    var changeStatus = function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/change-status",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){

            if(response['expired_session']){
              window.location = "/entrar";
            }

            var url 	=  parseUrl();

            switch(url['action']) {
              case 'edit':

                if(response['status'] == 'success'){
                  ajax.notification("success",notification);

                  var publicationStatusButton = $('.publication-status-button');

                  switch(response['publication-status']){
                    case 'pause':
                      publicationStatusButton.html('<span class="glyphicon glyphicon-play"></span> Enable');
                      break;
                    case 'enable':
                      publicationStatusButton.html('<span class="glyphicon glyphicon-pause"></span> Pause');
                      break;
                  }

                }else{
                  ajax.notification("error",notification);
                }

                break;
              case 'published':

                if(response['status'] == 'success'){

                  var publication 		= $("#product-"+response['id']);
                  var publicationStatusLabel	= '';

                  switch(response['publication-status']) {
                    case 'pause':

                      publication.find('.publication-status-button').html('<span class="glyphicon glyphicon-play"></span> Enable');

                      publicationStatusLabel = '<span class="label label-warning publication-status-label">paused</span>';
                      publication.find('.publication-status-label').replaceWith(publicationStatusLabel);

                      break;
                    case 'enable':

                      publication.find('.publication-status-button').html('<span class="glyphicon glyphicon-pause"></span> Pause');

                      publicationStatusLabel = '<span class="label label-success publication-status-label">published</span>';
                      publication.find('.publication-status-label').replaceWith(publicationStatusLabel);

                      break;
                  }

                }else{
                  window.location = "/";
                }

                break;
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){
            ajax.notification("complete",notification);
          }
        }
      };

      var url 	=  parseUrl();

      switch(url['action']) {
        case 'edit':

          var publicationStatusButton = $(".publication-status-button");

          if(publicationStatusButton.length){
            publicationStatusButton.click(function(){
              request_parameters['data']['id'] = $("#ProductId").val();
              ajax.request(request_parameters);
            });
          }

          break;
        case 'published':

          var elements = $("#products").find(".publication-status-button");

          if(elements.length){
            $(elements).each(function(){
              $(this).off('click');
              $(this).on('click',function(){

                var id = $(this).parents("div.product").attr('id');
                id = utility.stringReplace(id,'product-','');

                var request_this = {};
                request_this.id  = id;

                request_parameters.data = request_this;
                ajax.request(request_parameters);

              });
            });
          }

          break;
      }

    };


    /*
     * Private Method
     * Descripción: función que procesa la solicitud de editar una publicación,  la razón de crear una función y no un simple link que es más simple, es por la maquetación o bootstrap, como es un grupo de botones pegados, al colocar un link <a></a> se descuadra. por lo tanto es requerido usar una función.
     *************************************************************************************************************************************************************/
    var edit = function(){

      var elements = $("#products").find(".edit");

      if(elements.length){
        $(elements).each(function(){
          $(this).off('click');
          $(this).on('click',function(){

            var id = $(this).parents("div.product").attr('id');
            id = utility.stringReplace(id,'product-','');

            switch(currentAction()) {
              case 'published':
                // edit link
                window.location = '/edit/'+id;
                break;
              case 'drafts':
                // edit link
                window.location = '/edit-draft/'+id;
                break;
            }


          });
        });
      }
    };

    /*
     * Private Method
     * Descripción: función que procesa la solicitud de borrar una publicación
     *************************************************************************************************************************************************************/
    var deleteProduct =  function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/delete",
        "data":{},
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){

            if(response['expired_session']){
              window.location = "/login";
            }

            if(response['status'] === 'success'){

              var url 	=  parseUrl();

              switch(url['action']) {
                case 'edit':
                  window.location = "/published";
                  break;
                case 'published':
                  lastResponseData = response['data'];
                  process();
                  break;
                default:
                  window.location = "/";
              }


            }else{
              window.location = "/";
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){
            ajax.notification("complete",notification);
          }
        }
      };

      var url 	=  parseUrl();

      switch(url['action']) {
        case 'edit':

          var deleteButton = $("#delete");

          if(deleteButton.length){
            deleteButton.on('click',function(event){
              event.preventDefault();
              // Activamos el modal
              $('#delete-product-modal').modal({"backdrop":true,"keyboard":true,"show":true,"remote":false}).on('hidden',function(){
              });
            });

            $("#delete-product-button").click(function(){

              request_parameters['data']['product-id']    = $("#ProductId").val();
              request_parameters['data']['action']    	= url['action'];
              ajax.request(request_parameters);

            });
          }

          break;
        case 'published':

          var elements = $("#products").find(".delete");

          if(elements.length){
            $(elements).each(function(){

              $(this).off('click');
              $(this).on('click',function(){

                var id = $(this).parents("div.product").attr('id');
                id = utility.stringReplace(id,'product-','');

                $("#delete-product-button").attr({"product-id":id});

                $('#delete-product-modal').modal({"backdrop":true,"keyboard":true,"show":true,"remote":false}).on('hidden',function(){
                });
              });

              var element = $("#delete-product-button");

              element.off('click');
              element.on('click',function(){
                $('#delete-product-modal').modal('hide');

                var parameters 	= {};
                var url 	=  parseUrl();

                parameters['product-id'] 		= $(this).attr("product-id");
                parameters['action'] 			= url['action'];
                parameters['page'] 				= url['page'];
                parameters['order-by'] 			= url['order-by'];

                request_parameters.data = parameters;
                ajax.request(request_parameters);

              });

            });
          }

          break;
      }

    };


    /*
     @Name              -> process
     @visibility        -> Private
     @Type              -> Method
     @Description       -> after success XHR this function, process the data.
     @parameters        -> NULL
     @returns           -> NULL
     */
    var process = function(){

      /*
       registros a mostrar = 12; según esta cantidad cierto comportamiento es observado.

       # Solo 1 registro
       - paginación                inhabilitada
       - ordenar por precio        inhabilitada
       - búsqueda                  inhabilitada

       # Entre 1 y 12 registros
       - paginación                inhabilitada - Según la cantidad de registros que se muestra en una primera vez.
       - ordenar por precio        habilitado
       - búsqueda                  inhabilitada

       # Más de 12 registros
       - paginación                habilitado - Según la cantidad de registros que se muestra en una primera vez.
       - ordenar por precio        habilitado
       - búsqueda                  habilitado

       */

      if(lastResponseData['products'].length > 0){

        if(lastResponseData['search'] != ''){
          $("#search").val(lastResponseData['search']);
        }

        $("#search-info").hide();
        $("#no-products").hide();
        $("#products").show();
        $("#info").show();
        $("#yes-products").show();

        // se establece la variable que almacenara las publicaciones
        var products    = '';

        $.each(lastResponseData['products'],function(index,value){

          // se prepara las publicaciones
          products += prepareProduct(value);

          /* START  ha finalizado el bucle - este código se ejecuta una sola vez
           *************************************************************************/
          if(lastResponseData['paging-info']['current']==(index+1)){

            currentOrder(lastResponseData['order-by']);
            orderBy();
            pagination();
            search();
            info();

            //se muestra el contenedor de los filtros
            $("#information-panel").css({"display":""});

            // se establece las publicaciones en el DOM
            $('#products').html(products);

            switch(currentAction()) {
              case 'drafts':
                edit();
                break;
              case 'published':
                changeStatus();
                edit();
                deleteProduct();
                break;
            }


          }
          // END

        });

      }else{
        if(lastResponseData['total-products'] > 0){

          if(lastResponseData['search'] != undefined){
            $("#search-info-text").text(lastResponseData['search']);
          }

          $("#no-products").hide();
          $("#products").hide();
          $("#info").hide();
          $("#yes-products").show();
          $("#search-info").show();
        }else{
          $("#yes-products").hide();
          $("#no-products").show();
        }
      }

    };

    /*
     @Name              -> get
     @visibility        -> Private
     @Type              -> Method
     @Description       -> get data for display the products
     @parameters        -> type => if it is for products (published, drafts or in stock)
     @returns           -> Object
     @implemented by    -> main;
     */
    var get = function(){

      var notification;

      var request_parameters = {
        "requestType":"custom",
        "type":"post",
        "url":"/products",
        "data":parseUrl(),
        "callbacks":{
          "beforeSend":function(){
            notification = ajax.notification("beforeSend");
          },
          "success":function(response){

            // Si la sesión ha expirado
            if(response['expired_session']){
              window.location = "/login";
            }

            if(response['status'] === 'success'){
              lastResponseData = response['data'];
              process();
            }else{
              window.location = "/";
            }

          },
          "error":function(){
            ajax.notification("error",notification);
          },
          "complete":function(){
            ajax.notification("complete",notification);
          }
        }
      };

      ajax.request(request_parameters);
    };



    /*
     @Name              -> main
     @visibility        -> Public
     @Type              -> Method
     @Description       -> Where everything begins
     @parameters        -> NULL
     @returns           -> NULL
     */
    publications.main = function() {

      // product to view

      switch (currentAction()) {
        case 'publish':
          // new publication

          // Se inicializa el formulario
          newProduct();
          // Para crear el borrador
          saveDraft(false);
          // En caso de que se quiera descartar la publicación
          discard();
          // Se inicializa el WYSIWYG
          initRedactor();

          changeStatus();


          deleteProduct();

          // Subir las imágenes
          fileUpload();


          break;
        case 'edit':
          // new publication

          // Se inicializa el formulario
          newProduct();
          // Para crear el borrador
          saveDraft(false);
          // En caso de que se quiera descartar la publicación
          discard();
          // Se inicializa el WYSIWYG
          initRedactor();

          changeStatus();

          deleteProduct();

          // Subir las imágenes
          fileUpload();


          break;
        case 'view':
          // view publication

//                    URL: product

          break;
        case 'published':
          // publications published

//                    URL: products
          get();

          break;
        case 'drafts':
          // developing publications

//                    URL: products
          get();

          break;
        case 'stock':
          // publications active
          get();
//                    URL: products

          break;
        default:

          get();
        //window.location = "/";
      }

    };

  }( window.publications = window.publications || {}, jQuery ));

  publications.main();

});
