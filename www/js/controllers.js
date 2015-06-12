/**
 * This file defines all the controllers for the application
 *
 * @author      ritesh
 * @version     1.0
 */
(function() {
  'use strict';
  var controllers = angular.module('billid.controllers', []);
  controllers.controller('AppController', ['$scope', function($scope) {
    
  }]);
  controllers.controller('LoginController', ['$scope', '$state', 'Auth', function($scope, $state, Auth) {
    $scope.login = function(credentials) {
      $scope.error = false;
      $scope.errorMessage = '';
      if(credentials && credentials.username && credentials.password) {
        Auth.login(credentials).then(function(payload) {
          $state.go('app.receipts')
        }, function(reason) {
          if(reason.status === 401) {
            $scope.error = true;
            $scope.errorMessage = 'Invalid username or password';
          }
        });
      } else {
        $scope.error = true;
        $scope.errorMessage = 'Enter username and password';
      }
    }
  }]);
  controllers.controller('RegisterController', ['$scope', function($scope) {
    
  }]);
  controllers.controller('ReceiptsController', ['$scope', function($scope) {
    
  }]);
  controllers.controller('ReceiptDetailController', ['$scope', function($scope) {
    
  }]);
}());