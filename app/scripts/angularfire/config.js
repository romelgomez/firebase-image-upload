angular.module('firebase.config', [])
  .constant('FBURL', 'https://berlin.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password','facebook','google','twitter','github'])

  .constant('loginRedirectPath', '/login');
