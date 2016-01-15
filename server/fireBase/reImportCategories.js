var fireBaseUtilities = require('./fireBaseUtilities');

var data = {
  "-K82db4eHkZZi4siXR2n": {
    "left": 37,
    "name": "Transport",
    "parentId": "",
    "right": 38
  },
  "-K82doc3D0nHVTU5G6j2": {
    "left": 1,
    "name": "Marketplace",
    "parentId": "",
    "right": 2
  },
  "-K82dqGCyU5H0bdLg_da": {
    "left": 3,
    "name": "Jobs",
    "parentId": "",
    "right": 30
  },
  "-K82dt63aP9MoFLQHx4W": {
    "left": 31,
    "name": "Real Estate",
    "parentId": "",
    "right": 36
  },
  "-K82jdyH1_CU4C1uCyyc": {
    "left": 32,
    "name": "Houses",
    "parentId": "-K82dt63aP9MoFLQHx4W",
    "right": 33
  },
  "-K82jjLsNOX55s8hJZHU": {
    "left": 34,
    "name": "Apartments or Flat",
    "parentId": "-K82dt63aP9MoFLQHx4W",
    "right": 35
  },
  "-K84wJK0A5Nr8qI3U-N0": {
    "left": 17,
    "name": "Analyst",
    "parentId": "-K859s_DQQ62uiYJ-VDQ",
    "right": 26
  },
  "-K84wMc7wXzJ5X3DDt2I": {
    "left": 5,
    "name": "Consultancy",
    "parentId": "-K859s_DQQ62uiYJ-VDQ",
    "right": 6
  },
  "-K84wOX7QeI3FF-AxlH-": {
    "left": 7,
    "name": "Technical Support",
    "parentId": "-K859s_DQQ62uiYJ-VDQ",
    "right": 16
  },
  "-K84wRHg_Ao5utHxzS3b": {
    "left": 20,
    "name": "Business Analyst",
    "parentId": "-K84wJK0A5Nr8qI3U-N0",
    "right": 21
  },
  "-K84wUpt7sR7sQhH6jxB": {
    "left": 24,
    "name": "Support Analyst",
    "parentId": "-K84wJK0A5Nr8qI3U-N0",
    "right": 25
  },
  "-K84wjmdEMThENDdqBSZ": {
    "left": 10,
    "name": "Support Technician",
    "parentId": "-K84wOX7QeI3FF-AxlH-",
    "right": 11
  },
  "-K84wmkzjC63oKTOp0vV": {
    "left": 8,
    "name": "Support Engineer",
    "parentId": "-K84wOX7QeI3FF-AxlH-",
    "right": 9
  },
  "-K84woMEO0VQAe3oCY7O": {
    "left": 18,
    "name": "Corporate Business Analyst",
    "parentId": "-K84wJK0A5Nr8qI3U-N0",
    "right": 19
  },
  "-K84wr21RbTcgWhcN_in": {
    "left": 22,
    "name": "Business Process Analyst",
    "parentId": "-K84wJK0A5Nr8qI3U-N0",
    "right": 23
  },
  "-K84wtwk2nqeS_iFJEFw": {
    "left": 12,
    "name": "Support Officer",
    "parentId": "-K84wOX7QeI3FF-AxlH-",
    "right": 13
  },
  "-K84wv48ft4GV40lPyuD": {
    "left": 14,
    "name": "Helpdesk Support",
    "parentId": "-K84wOX7QeI3FF-AxlH-",
    "right": 15
  },
  "-K857IAgjQuHGyMJ15Th": {
    "left": 27,
    "name": "Android Developer",
    "parentId": "-K859s_DQQ62uiYJ-VDQ",
    "right": 28
  },
  "-K859s_DQQ62uiYJ-VDQ": {
    "left": 4,
    "name": "IT Related",
    "parentId": "-K82dqGCyU5H0bdLg_da",
    "right": 29
  }
};

function main (){
  fireBaseUtilities.reImport('reImport categories','berlin.firebaseio.com/categories', data)
    .then(function(){
      process.exit();
    },function(error){
      console.error(error);
      process.exit();
    });
}

main();