'use strict';

angular.module('login',['ngMessages','validation.match','trTrustpass','ngPasswordStrength'])
  .controller('LoginController', [
    '$q',
    '$window',
    '$scope',
    '$location',
    '$uibModal',
    'FireAuth',
    'FireRef',
    'notificationService',
    function ($q, $window, $scope, $location, $uibModal, FireAuth, FireRef, notificationService) {

      // watch for login status changes and redirect if appropriate
      FireAuth.$onAuthStateChanged(function (authenticatedUser) {

        if( authenticatedUser !== null) {

          var deferred  = $q.defer();
          $scope.httpRequestPromise = deferred.promise;
          var promises  = [];
          var credential;

          //https://firebase.google.com/docs/auth/web/account-linking#link-auth-provider-credentials-to-a-user-account

          if(authenticatedUser.email !== null){

            var provider = $window.sessionStorage.getItem(authenticatedUser.email+'?provider');

            if(provider !== null){
              switch (provider) {
                case 'facebook.com':
                  credential = firebase.auth.FacebookAuthProvider.credential($window.sessionStorage.getItem(authenticatedUser.email+'?accessToken'));
                  break;
                case 'google.com':
                  console.log('TODO set credential for: google.com');
                  notificationService.error('TODO set credential for: google.com');
                  break;
                case 'twitter.com':
                  console.log('TODO set credential for: twitter.com');
                  notificationService.error('TODO set credential for: twitter.com');
                  break;
                case 'github.com':
                  console.log('TODO set credential for: github.com');
                  notificationService.error('TODO set credential for: github.com');
                  break;
              }
              if(typeof credential !== 'undefined' && credential !== null){
                promises.push(authenticatedUser.link(credential));
              }
            }

          }

          promises.push(createProfile(authenticatedUser));

          $q.all(promises)
            .then(function(){
              if(typeof credential !== 'undefined' && credential !== null){
                $window.sessionStorage.removeItem(authenticatedUser.email+'?provider');
                $window.sessionStorage.removeItem(authenticatedUser.email+'?accessToken');
              }

              deferred.resolve();
              $location.path('/new-publication');
            });

        }

      });

      var original = angular.copy($scope.model = {
        signIn:{
          email:'',
          password:'',
          rememberMe: false
        },
        register:{
          names:'',
          lastNames:'',
          email:'',
          password:'',
          samePassword:''
        },
        recoverAccount:{
          email:''
        }
      });

      $scope.forms = {
        signIn: {},
        register:{},
        recoverAccount:{}
      };

      $scope.resetRegisterForm = function(){
        angular.copy(original.register,$scope.model.register);
        $scope.forms.register.$setUntouched();
        $scope.forms.register.$setPristine();
      };

      $scope.resetSignInForm = function(){
        angular.copy(original.signIn,$scope.model.signIn);
        $scope.forms.signIn.$setUntouched();
        $scope.forms.signIn.$setPristine();
      };

      function resetRecoverAccountForm(){
        angular.copy(original.recoverAccount,$scope.model.recoverAccount);
        $scope.forms.recoverAccount.$setUntouched();
        $scope.forms.recoverAccount.$setPristine();
      }

      /**
       * show error
       * @param {Object} error
       **/
      function showError(error) {
        //console.log('error:', error);

        switch (error.code) {
          case 'auth/invalid-email':
            notificationService.error('The email is invalid.');
            break;
          case 'auth/user-disabled':
            notificationService.error('This account has been suspended.');
            break;
          case 'auth/user-not-found':
            notificationService.error('There is not user for this email.');
            break;
          case 'auth/wrong-password':
            notificationService.error('The password is invalid');
            break;
          case 'auth/popup-closed-by-user':
            notificationService.error('The popup has been closed before finalizing the operation.');
            break;
          case 'auth/network-request-failed':
            notificationService.error('A network error has occurred.');
            break;
          case 'auth/account-exists-with-different-credential':
            attemptLinkCredential(error.email, error.credential);
            break;
          case 'auth/email-already-in-use':
            notificationService.error('The email address is already in use by another account.');
            break;
          default:
            notificationService.error('Undefined Error');
        }

      }

      /**
       * Create the profile
       * @param {Object} firebaseUser
       **/
      function createProfile(firebaseUser) {
        var deferred  = $q.defer();

        var reference = FireRef.child('users').child(firebaseUser.uid);

        var profile = {};

        reference.once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);

          if(!exists){
            switch(firebaseUser.providerData[0].providerId) {
              case 'facebook.com':
                profile.names       = firebaseUser.providerData[0].displayName;
                profile.provider  = firebaseUser.providerData[0].providerId;
                profile.startedAt   = $window.firebase.database.ServerValue.TIMESTAMP;
                break;
              case 'twitter.com':
                profile.names           = firebaseUser.providerData[0].displayName;
                //profile.twitterAccount  = user['twitter'].username;
                profile.provider        = firebaseUser.providerData[0].providerId;
                profile.startedAt       = $window.firebase.database.ServerValue.TIMESTAMP;
                break;
              case 'google.com':
                profile.names           = firebaseUser.providerData[0].displayName;
                profile.provider        = firebaseUser.providerData[0].providerId;
                profile.startedAt       = $window.firebase.database.ServerValue.TIMESTAMP;
                break;
              case 'github.com':
                profile.names           = firebaseUser.providerData[0].displayName;
                profile.provider        = firebaseUser.providerData[0].providerId;
                profile.startedAt       = $window.firebase.database.ServerValue.TIMESTAMP;
                break;
              case 'password':
                profile.email     = $scope.model.register.email;
                profile.names     = $scope.model.register.names;
                profile.lastNames = $scope.model.register.lastNames;
                profile.provider  = firebaseUser.providerData[0].providerId;
                profile.startedAt = $window.firebase.database.ServerValue.TIMESTAMP;
                break;
            }

            reference.set(profile, function(error) {
              if (error) {
                deferred.reject(error);
              } else {
                deferred.resolve();
              }
            });

          }else{
            deferred.resolve();
          }

        });

        return deferred.promise;
      }


      $scope.signIn = function(){
        $scope.forms.signIn.$setSubmitted(true);
        if($scope.forms.signIn.$valid){

          $scope.httpRequestPromise  = FireAuth.$signInWithEmailAndPassword($scope.model.signIn.email, $scope.model.signIn.password)
            .then(null, showError);

        }
      };

      $scope.recover = function(){
        $scope.forms.recoverAccount.$setSubmitted(true);
        if($scope.forms.recoverAccount.$valid){

          $scope.httpRequestPromise = FireAuth.$sendPasswordResetEmail($scope.model.recoverAccount.email)
            .then(function(){
              resetRecoverAccountForm();
              notificationService.success('Password reset email sent successfully!');
            },function(error){
              showError(error);
            });

        }
      };

      function promptForLinkCredential (size, email, credential, providers){
        var modalInstance = $uibModal.open({
          templateUrl: 'promptForLinkCredentialModal.html',
          controller: 'PromptForLinkCredentialController',
          size: size,
          resolve: {
            credential: function () {
              return credential;
            },
            providers: function () {
              return providers;
            },
            email: function () {
              return email;
            }
          }
        });

        modalInstance.result.then(function (result) {

          $window.sessionStorage.setItem(email+'?provider', result.credential.provider);
          $window.sessionStorage.setItem(email+'?accessToken', result.credential.accessToken);

          if(result.credential.provider !== 'password'){
            $scope.oauthLogin(result.provider, result.redirect);
          }

        }, function (error) {
          //modalErrors(error);
        });
      }

      function attemptLinkCredential (email, credential){

        $window.firebase.auth().fetchProvidersForEmail(email).then(function(providers) {
          promptForLinkCredential('lg', email, credential, providers);
        });

      }

      $scope.register = function(){
        $scope.forms.register.$setSubmitted(true);
        if($scope.forms.register.$valid){

          $scope.httpRequestPromise = FireAuth.$createUserWithEmailAndPassword($scope.model.register.email, $scope.model.register.password)
            .then(null, showError);

        }
      };

      /**
       * Get Redirect Result
       */
      $window.firebase.auth().getRedirectResult()
        .then(null,function(error){
          console.log('error', error);
          attemptLinkCredential(error.email, error.credential);
        });


      $scope.oauthLogin = function(provider, signInWithRedirect) {
        var authProvider;

        switch(provider) {
          case 'facebook.com':
            authProvider = new $window.firebase.auth.FacebookAuthProvider();
            authProvider.addScope('email');
            break;
          case 'twitter.com':
            authProvider = new $window.firebase.auth.TwitterAuthProvider();
            break;
          case 'google.com':
            authProvider = new firebase.auth.GoogleAuthProvider();
            break;
          case 'github.com':
            // https://developer.github.com/v3/oauth/
            authProvider = new $window.firebase.auth.GithubAuthProvider();
            authProvider.addScope('user:email');
            break;
        }

        if(typeof signInWithRedirect !== 'undefined' && signInWithRedirect === true){

          // returns firebase.Promise containing void
          $scope.httpRequestPromise = FireAuth.$signInWithRedirect(authProvider)
            .then(null, showError);

        }else{

          // returns firebase.auth.UserCredential {user: nullable firebase.User, credential: nullable firebase.auth.AuthCredential}
          $scope.httpRequestPromise = FireAuth.$signInWithPopup(authProvider)
            .then(null, showError);

        }

      };


    }])
  .controller('PromptForLinkCredentialController',['$scope','$uibModalInstance', '$q', 'providers', 'credential',  function($scope, $uibModalInstance, $q, providers, credential){

    $scope.providers = providers;
    $scope.credential     = credential;

    $scope.loginWith = function(provider, redirect){
      $uibModalInstance.close({
        provider: provider,
        redirect: typeof redirect !== 'undefined'? redirect : false,
        credential: credential
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  }]);



//var deferred = $q.defer();
//$scope.httpRequestPromise = deferred.promise;
//FireAuth.$onAuthStateChanged(function() {
//  deferred.resolve();
//});


/*

 password

 displayName: null,
 email: bmxquiksilver7185@gmail.com,
 emailVerified: false,
 isAnonymous: false,
 photoURL: null,
 providerData: [object Object],
 displayName: null
 email: "bmxquiksilver7185@gmail.com"
 photoURL: null
 providerId: "password"
 uid: "bmxquiksilver7185@gmail.com"
 providerId: firebase,
 refreshToken: ANflqpGbesLfW-pW-3JbNWVMBJmPvc4xYMR7iXngbELkwKOle4QA0-ZcekBMkIUEcHNd45ViUaMU_mYO96ob_EpE2FchV-df14CthBOn-Dye9aWi94_4PmUNmD25VG5oHi4LBufkqh7s0FW4XCnFf4dFItmuVbxou1HYXerAcKbfcsOnArrTrrh8WLJoC1OVfzRtI1_K7zqT5yysofxgI_aqllHIexTiSAdjv2CiGMhEc5pVP52X6dYnHzmXWWLX2iSdqY-bKh6I,
 uid: b0d0d782-7fe2-4c55-8fcb-c73aab87538e

 twitter

 displayName: null,
 email: null,
 emailVerified: false,
 isAnonymous: false,
 photoURL: null,
 providerData: [object Object],
 displayName  "Prof. Romel Gomez"
 email null
 photoURL  "http://pbs.twimg.com/profile_images/738749616406028289/W6u_C9Nu_normal.jpg"
 providerId  "twitter.com"
 uid "192774776"
 providerId: firebase,
 refreshToken: ANflqpEr5AvN329oARVLtzj2yEv5r4noY5XJJF-HRmfplEKR_dIBIMIG68ezhWssAjOaUBA5aFYyGpYmgoBsPFFhMIcDVhHczlT2ctqQu68YQZYkhFAAXMrPWqQHQdjw0TFNJwkKGshdiHY7wH2HSgT3493UFbvkY8eHwxFPVJOzEjeL_NmPEF5fXjJ0JJoQ55nL2PUIa5J878RjtmsQ-fs6OM-ZDyfwK9tV8akL6i1mMrZKqk6MZcFaJkHYtDGqJ9aQG1sdhHf4LcwCOsilry9BmMML0nDnbU_saebHf3659ojv7zufV5mFc42pn7bEAVOWzrbqXPKz,
 uid: twitter:192774776

 facebook

 displayName: null,
 email: null,
 emailVerified: false,
 isAnonymous: false,
 photoURL: null,
 providerData: [object Object],
 displayName: "Romel Gomez"
 email: "solokarma@hotmail.com"
 photoURL : "https://scontent.xx.fbcdn.net/v/t1.0-1/p100x100/13087589_10206201012200016_3365804100092745919_n.jpg?oh=3128858e8a9b63717496ec4513c0ab7a&oe=57D679C1"
 providerId : "facebook.com"
 uid : "10204911533563856"
 providerId: firebase,
 refreshToken: ANflqpFcnJxQpDdpqDO-vLO2a1lE8gOA8KPiYD3KMwKLs83cvxXfaAUX7MhIMGIQOtbtAs5sMgA1J1-4bQ6i-3egziwY0M_MKNrJcCm7E5nAKGsKzygaSJefv3BjtiySOfkRAWS5BAIg94DpXzAvLSv15ST8rxLzpWUEqNnvQ0EUNXuvTXZbWHAPVJTek9c92GT52ihoK3duujYVwhXsKjMwbuy6ZB6ogatDiKlfNYRzMcEsWrsVuW3rbeo4PfJ_hbMuXWnMItVTWqulLOk-rpjIInmeC5fzOOfq4kGEIfBAy3fVA0d_IrZMhrJpc8Djek-Jm0gTTJS-hECjy9qcQa47QfUVE44H47rqUCKKEuxUvVTdmu2AMZN5iBP3vX5BCumI_qZZ8w_IjKupv3jYAUsFm-vPNLBRI7-LWXFx__KyArin-aVMvbKEEbBhb0anS5NF70QOSuFQWRO5nS-CGRTQIMEWJU6Y-g,
 uid: facebook:102049115335638560


 firebase.auth.AuthCredential.
 accessToken: "192774776-ejTIkDlfAD1Pq0dRkiS8Dj9rmrTgGpgd81LPsxqG",
 secret: "x3zbdLzR86RhwQy2GXmar1iZVOsWAxVeWsqRjkp2NH1TM",
 provider: "twitter.com"

 firebase.User
 signInAnonymously
 signInWithCredential
 signInWithCustomToken
 signInWithEmailAndPassword

 firebase.auth.UserCredential
 signInWithPopup
 getRedirectResult



 https://firebase.google.com/docs/reference/js/firebase.auth.Auth#getRedirectResult

 auth.getRedirectResult().then(function(result) {
 // The firebase.User instance:
 var user = result.user;
 // The Facebook firebase.auth.AuthCredential containing the Facebook
 // access token:
 var credential = result.credential;
 })

 firebase.Promise containing void
 signInWithRedirect

 */
