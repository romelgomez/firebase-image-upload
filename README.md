# marketplace

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 1.0.0.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.



/******* FireBase Data Base Structure  *******

 Publications Path:
 publications/fireBaseUniqueIdentifier/images/uuid/isDeleted
 publications/fireBaseUniqueIdentifier/images/uuid/name

 publications:{
              fireBaseUniqueIdentifier:{
                title:'publication title',
                description:'publication description',
                images:{
                  uuid:{
                    name:'file name',
                    isDeleted:false
                  },
                  uuid:{
                    name:'file name',
                    isDeleted:false
                  },
                  uuid:{
                    name:'file name',
                    isDeleted:true
                  }
                }
              }
            }

 Images Paths:
 images/uuid/thumbnails/w200xh200
 images/uuid/thumbnails/w600xh600

 images:{
              uuid:{
                thumbnails:{
                  w200xh200:{
                    reference: uuid,
                    base64: 'base64 string'
                  },
                  w600xh600:{
                    reference: uuid,
                    base64: 'base64 string'
                  }
                }
              }
            }

 **/



snapshots of publications
 releases

 cuando el usuario confirma la compra se crea un instantánea de todos los datos.


 [snapshots] luego de presionar <Publish>, y cada vez que el vendedor presione el botón <Update>, se crea una instantánea de la publicación.
 Cuando el cliente confirma el contrato, lo hará sobre la última instantánea guardada. El comprador tendrá derechos y deberes según
 lo especifique la instantánea. Si el vendedor luego modifica la publicación, estará creado otra instantánea o contrato.

 Las modificaciones realizadas a la publicación se reflejarán en todos los clientes que la estén visualizando, tan rápido como la
 latencia de la conexión de internet lo permita.

 <Update> <Pause or Enable> <Delete>
 <Publish> <Discard>

 Publish & Update  -> validate = true;  Valida que las fotos y los campos del formulario esten completos
 Save              -> validate = false; Toma lo que este al momento y guarda
 Pause             -> actualiza un campo
 Enable            -> actualiza un campo
 Delete            -> actualiza un campo
 Discard           -> actualiza un campo

 publications           snapshots

 category               category
 user
 title                  title
 description            description
 price                  price
 quantity               quantity
 barcode                barcode
 warranty               warranty

 paused                                     true or false
 releaseDate                                Firebase.ServerValue.TIMESTAMP
 deleted                                    true or false
 created  (draft) created (released)        Firebase.ServerValue.TIMESTAMP

 termsOfService

 Main Categories [Market, Jobs] // Real Estate, Vehicles, Boats, Planes, stock market

 <publications> Market

 userId                 string
 categoryId             string
 title                  string
 description            string
 price                  int
 quantity               int
 barcode                string
 warranty               string
 releaseDate            date
 paused                 boolean
 deleted                boolean

 <publications> Jobs

 userId                 string
 categoryId             string
 title                  string
 description            string
 salary
 barcode                string
 releaseDate            date
 paused                 boolean
 deleted                boolean 
