var publication = { barcode: '049590ac-ad88-4715-baad-8df68fa3ee22',
  barcodeType: 'CODE128',
  categories: [ 'Services', 'Professionals', 'Consulting and Advisory' ],
  categoryId: '-KBf4fIileyIn9XgtadG',
  department: 'Services',
  description: 'Long experience in software development:  Distributed Applications: Web Service, Real Time, Sockets, RMI.  Web Applications: LAMP, RoR, DJANGO, Angular.  Database: Develoment, Management.     Others: see my LinkedIn Profile',
  featuredImageId: '',
  htmlDescription: '<p>Long experience in software development:</p><p>Distributed Applications: Web Service, Real Time, Sockets, RMI.</p><p>Web Applications: LAMP, RoR, DJANGO, Angular.</p><p>Database: Develoment, Management.</p><p><br></p><p>Others: see my LinkedIn Profile</p>',
  images:
  { '-KDf-R0vbTE8roj_auxi':
    { addedDate: 1458862935409,
      height: 533,
      inServer: true,
      name: '2016-01-18T163736Z_1_LYNXNPEC0H0U6_RTROPTP_3_PETROLEO-IRAN-VENEZUELA.jpg',
      size: 72041,
      type: 'image/jpeg',
      width: 800 } },
  locationId: '-KBZK3pZOqmwsgPulxAO',
    locations: [ 'England' ],
  releaseDate: 1458862932091,
  title: 'Software Engineer',
  userID: 'facebook:10208237903641959'
};

var metaTags = {
  title:        'MarketOfLondon.UK - Jobs, Real Estate, Transport, Services, Marketplace related Publications',
  url:          'https://londres.herokuapp.com',
  description:  'Jobs, Real Estate, Transport, Services, Marketplace related Publications',
  image:        'https://londres.herokuapp.com/static/assets/images/uk.jpg'
};

function slug(input) {
  return (!!input) ? String(input).toLowerCase().replace(/[^a-zá-źA-ZÁ-Ź0-9]/g, ' ').trim().replace(/\s{2,}/g, ' ').replace(/\s+/g, '-') : '';
}

function capitalize(input) {
  return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
}

function setMetaTitle (publication){
  metaTags.title = capitalize(publication.title).trim();
  metaTags.title += publication.department === 'Real Estate'? ' for ' + (publication.res.reHomeFor | uppercase) : '';
  metaTags.title += ' - MarketOfLondon.UK';
}

function setMetaURL (publicationID, publication){
  metaTags.url = 'https://londres.herokuapp.com/view-publication/';
  metaTags.url += publicationID + '/';
  metaTags.url += slug(publication.title) + '.html';
  console.log(' metaTags.url: ', metaTags.url);

}

function setMetaImage (publication){
  var images = [];

  for (var imageID in publication.images) {
    if( publication.images.hasOwnProperty( imageID ) ) {
      publication.images[imageID].$id = imageID;
      if(imageID !== publication.featuredImageId){
        images.push(publication.images[imageID]);
      }else{
        images.unshift(publication.images[imageID])
      }
    }
  }

  metaTags.image = images.length > 0? ('http://res.cloudinary.com/berlin/image/upload/c_fill,h_630,w_1200/'+ images[0].$id +'.jpg') : 'https://londres.herokuapp.com/static/assets/images/uk.svg';

  console.log('metaTags.image: ', metaTags.image);

}


setMetaTitle(publication);
setMetaURL(987987987987978987, publication);
metaTags.description = publication.description;
setMetaImage(publication);


console.log('metaTags', metaTags);
