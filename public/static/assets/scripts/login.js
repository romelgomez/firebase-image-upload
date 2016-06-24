'use strict';

angular.module('login',['ngMessages','validation.match','trTrustpass','ngPasswordStrength'])
  .controller('LoginController', ['$scope','FireAuth','$location','$q','FireRef','notificationService','$window','$log',function ($scope, FireAuth, $location, $q, FireRef, notificationService, $window, $log) {
    // Manages authentication to any active providers.

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

      console.log('error:', error);

      switch (error.code) {
        case 'auth/invalid-email':
          notificationService.error('The email is invalid.');
          break;
        case 'auth/user-disabled':
          notificationService.error('This account has been suspended');
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


    $scope.register = function(){
      $scope.forms.register.$setSubmitted(true);
      if($scope.forms.register.$valid){

        $scope.httpRequestPromise = FireAuth.$createUserWithEmailAndPassword($scope.model.register.email, $scope.model.register.password)
          .then(function(firebaseUser){
            return createProfile(firebaseUser)
          })
          .then(null, showError);

      }
    };

    $scope.oauthLogin = function(provider, signInWithRedirect) {

      if(typeof signInWithRedirect !== 'undefined' && signInWithRedirect === true){

        $scope.httpRequestPromise = FireAuth.$signInWithRedirect(provider)
          .then(null, function () {
                // The provider's account email, can be used in case of
                // auth/account-exists-with-different-credential to fetch the providers
                // linked to the email:
                var email = error.email;
                // The provider's credential:
                var credential = error.credential;
                // In case of auth/account-exists-with-different-credential error,
                // you can fetch the providers using this:
                if (error.code === 'auth/account-exists-with-different-credential') {
                  $window.firebase.auth().fetchProvidersForEmail(email).then(function(providers) {

                    console.log('Error in getRedirectResult.', error);
                    console.log('email.', email);
                    console.log('A list of the available providers linked to the email address.', providers);

                    // The returned 'providers' is a list of the available providers
                    // linked to the email address. Please refer to the guide for a more
                    // complete explanation on how to recover from this error.
                  });
                }
          });

      }else{

        $scope.httpRequestPromise = FireAuth.$signInWithPopup(provider)
          .then(function(result){
            return createProfile(result.user);
          })
          .then(null, showError);

      }

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
