/**
 * Angular application file.
 * All the application bootstrapping, configuration, run goes here
 *
 * @author      ritesh
 * @version     1.0
 */
(function() {
  'use strict';
  angular.module('billid', ['ionic', 'ngCordova','billid.controllers', 'billid.services', 'billidpoc'])
  .constant('ENVIRONMENT', 'STAGING')
  .constant('BASE_URL', 'https://billid-poc-api.herokuapp.com')
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: "templates/login.html",
      controller: 'LoginController'
    })
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppController'
    })
    .state('app.receipts', {
      url: "/receipts",
      views: {
        'menuContent': {
          templateUrl: "templates/receipts.html",
          controller: 'ReceiptsController'
        }
      }
    })
    .state('app.receipts.detail', {
      url: "/:id",
      views: {
        'menuContent': {
          templateUrl: "templates/receiptDetail.html",
          controller: 'ReceiptDetailController'
        }
      }
    })
    .state('app.notifications', {
      url: "/notifications",
      views: {
        'menuContent': {
          templateUrl: "templates/notifications.html",
          controller: "NotificationsController"
        }
      }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
}());
