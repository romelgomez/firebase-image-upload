var algolia = require('./algolia');

var settings = {
  publications:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    slaves: ['publications_by_price_asc', 'publications_by_price_desc','publications_by_releaseDate_asc', 'publications_by_releaseDate_desc']
  },
  publications_by_price_asc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    ranking: ['asc(price)']
  },
  publications_by_price_desc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    ranking: ['desc(price)']
  },
  publications_by_releaseDate_asc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    ranking: ['asc(releaseDate)']
  },
  publications_by_releaseDate_desc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    ranking: ['desc(releaseDate)']
  },
  publications_by_salary_asc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['salary','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    ranking: ['asc(salary)']
  },
  publications_by_salary_desc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['salary','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID'],
    ranking: ['desc(salary)']
  }
};

function main (){
  algolia.setSettings('publications index settings','publications',settings.publications);
  algolia.setSettings('publications_by_price_asc index settings','publications_by_price_asc',settings.publications_by_price_asc);
  algolia.setSettings('publications_by_price_desc index settings','publications_by_price_desc',settings.publications_by_price_desc);
  algolia.setSettings('publications_by_releaseDate_asc index settings','publications_by_releaseDate_asc',settings.publications_by_releaseDate_asc);
  algolia.setSettings('publications_by_releaseDate_desc index settings','publications_by_releaseDate_desc',settings.publications_by_releaseDate_desc);
  algolia.setSettings('publications_by_salary_asc index settings','publications_by_salary_asc',settings.publications_by_salary_asc);
  algolia.setSettings('publications_by_salary_desc index settings','publications_by_salary_desc',settings.publications_by_salary_desc);
}

main();