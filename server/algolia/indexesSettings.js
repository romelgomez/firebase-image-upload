var Q = require('q');
var utilities = require('./../utilities');
var algoliaSettings = require('./algoliaSettings');

var settings = {
  publications:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    slaves: ['publications_by_price_asc', 'publications_by_price_desc','publications_by_releaseDate_asc', 'publications_by_releaseDate_desc']
  },
  publications_by_price_asc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    ranking: ['asc(price)']
  },
  publications_by_price_desc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    ranking: ['desc(price)']
  },
  publications_by_releaseDate_asc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    ranking: ['asc(releaseDate)']
  },
  publications_by_releaseDate_desc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['price','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    ranking: ['desc(releaseDate)']
  },
  publications_by_salary_asc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['salary','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    ranking: ['asc(salary)']
  },
  publications_by_salary_desc:{
    attributesToIndex: ['barcode','title','unordered(description)'],
    numericAttributesToIndex:['salary','releaseDate'],
    customRanking:['desc(views)'],
    attributesForFaceting: ['categories','userID','locations','jobType','jobSalaryType','jobRecruiterType','jobHasBonus','jobHasBenefits','reHomeStatus','reHomeFor'],
    ranking: ['desc(salary)']
  }
};

module.exports = {
  updateIndexSettings: updateIndexSettings,
  allSettings: settings
};

/**
 * Set settings for indexName index
 * @param {String} taskTitle
 * @param {String} indexName
 * @param {Object} settings
 * @return {Promise<Object>}
 * */
function setSettings( taskTitle, indexName, settings){
  var deferred = Q.defer();
  utilities.startProcess(taskTitle);
  var index = algoliaSettings.client.initIndex(indexName);
  index.setSettings(settings)
    .then(function(content){
      utilities.endProcess(taskTitle);
      deferred.resolve(content);
    }, function (error) {
      utilities.endProcess(taskTitle,error);
      deferred.reject(error);
    });
  return deferred.promise;
}

function updateIndexSettings(){
  var publicationsIndexSettingsPromise                   = setSettings('publications index settings','publications',settings.publications);
  var publicationsByPriceAscIndexSettingsPromise         = setSettings('publications_by_price_asc index settings','publications_by_price_asc',settings.publications_by_price_asc);
  var publicationsByPriceDescIndexSettingsPromise        = setSettings('publications_by_price_desc index settings','publications_by_price_desc',settings.publications_by_price_desc);
  var publicationsByReleaseDateAscIndexSettingsPromise   = setSettings('publications_by_releaseDate_asc index settings','publications_by_releaseDate_asc',settings.publications_by_releaseDate_asc);
  var publicationsByReleaseDateDescIndexSettingsPromise  = setSettings('publications_by_releaseDate_desc index settings','publications_by_releaseDate_desc',settings.publications_by_releaseDate_desc);
  var publicationsBySalaryAscIndexSettingsPromise        = setSettings('publications_by_salary_asc index settings','publications_by_salary_asc',settings.publications_by_salary_asc);
  var publicationsBySalaryDescIndexSettingsPromise       = setSettings('publications_by_salary_desc index settings','publications_by_salary_desc',settings.publications_by_salary_desc);
  return Q.all([
    publicationsIndexSettingsPromise,
    publicationsByPriceAscIndexSettingsPromise,
    publicationsByPriceDescIndexSettingsPromise,
    publicationsByReleaseDateAscIndexSettingsPromise,
    publicationsByReleaseDateDescIndexSettingsPromise,
    publicationsBySalaryAscIndexSettingsPromise,
    publicationsBySalaryDescIndexSettingsPromise]);
}