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

  controllers.controller('ReceiptsController', ['$scope', 'myReceipts', function($scope, myReceipts) {
    $scope.receipts = myReceipts;
  }]);
  controllers.controller('ReceiptDetailController', ['$scope', function($scope) {

  }]);

  controllers.controller('NotificationsController', ['$scope', '$cordovaPush', '$cordovaDialogs', '$cordovaMedia', '$cordovaToast', 'Profiles',
    function($scope, $cordovaPush, $cordovaDialogs, $cordovaMedia, $cordovaToast, Profiles){

      //Register
      $scope.register = function(){
          var config = null;

          if(ionic.Platform.isAndroid()) {
            config = {
              "senderID" : "billid-mobile-poc-app"
            };
          } else if(ionic.Platform.isIOS()) {
            config = {
              "badge": "true",
              "sound" : "true",
              "alert" : "true"
            };
          }
          $cordovaPush.register(config).then(function (result) {
              console.log("Registration successful " + result);
              $cordovaToast.showShortCenter('Registered for push notifications');
              $scope.registerDisabled=true;
              // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
              if (ionic.Platform.isIOS()) {
                $scope.regId = result;
                storeDeviceToken("ios");
              }
            }, function (err) {
                console.log("Register error " + err)
            });
      }

      // Notification Received
      $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {

        console.log(JSON.stringify([notification]));

        if (ionic.Platform.isAndroid()) {
            handleAndroid(notification);
        } else if (ionic.Platform.isIOS()) {
          handleIOS(notification);
          $scope.$apply(function () {
            $scope.notifications.push(JSON.stringify(notification.alert));
          })
        }
      });

      // Android Notification Received Handler
      function handleAndroid(notification) {
          // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
          //             via the console fields as shown.
          console.log("In foreground " + notification.foreground  + " Coldstart " + notification.coldstart);
          if (notification.event == "registered") {
              $scope.regId = notification.regid;
              storeDeviceToken("android");
          }
          else if (notification.event == "message") {
              $cordovaDialogs.alert(notification.message, "Push Notification Received");
              $scope.$apply(function () {
                  $scope.notifications.push(JSON.stringify(notification.message));
              })
          }
          else if (notification.event == "error")
              $cordovaDialogs.alert(notification.msg, "Push notification error event");
          else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
      }

      // IOS Notification Received Handler
      function handleIOS(notification) {
          // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
          // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
          // the notification when this code runs (weird).
          if (notification.foreground == "1") {
              // Play custom audio if a sound specified.
              if (notification.sound) {
                  var mediaSrc = $cordovaMedia.newMedia(notification.sound);
                  mediaSrc.promise.then($cordovaMedia.play(mediaSrc.media));
              }

              if (notification.body && notification.messageFrom) {
                  $cordovaDialogs.alert(notification.body, notification.messageFrom);
              }
              else $cordovaDialogs.alert(notification.alert, "Push Notification Received");

              if (notification.badge) {
                  $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                      console.log("Set badge success " + result)
                  }, function (err) {
                      console.log("Set badge error " + err)
                  });
              }
          }
          // Otherwise it was received in the background and reopened from the push notification. Badge is automatically cleared
          // in this case. You probably wouldn't be displaying anything at this point, this is here to show that you can process
          // the data in this situation.
          else {
              if (notification.body && notification.messageFrom) {
                  $cordovaDialogs.alert(notification.body, "(RECEIVED WHEN APP IN BACKGROUND) " + notification.messageFrom);
              }
              else $cordovaDialogs.alert(notification.alert, "(RECEIVED WHEN APP IN BACKGROUND) Push Notification Received");
          }
      }

      // Stores the device token in a db using node-pushserver (running locally in this case)
      //
      // type:  Platform type (ios, android etc)
      function storeDeviceToken(type) {
        // Create a random userid to store with it
        Profiles.updateDevice($scope.regId, type)
          .then(
              function(result){
                console.log("Token stored, device is successfully subscribed to receive push notifications.");
              },
              function(reason ){
                console.log("Error storing device token." + reson )
              }
          );
      }

      function removeDeviceToken() {
        Profiles.removeDevice($scope.regId)
          .then(
              function(result){
                console.log("Token removed, device is successfully unsubscribed.");
              },
              function(reason ){
                console.log("Error storing device token." + reson )
              }
          );
      }

     // Unregister - Unregister your device token from APNS or GCM
     // Not recommended:  See http://developer.android.com/google/gcm/adv.html#unreg-why
     //                   and https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html#//apple_ref/occ/instm/UIApplication/unregisterForRemoteNotifications
     //
     // ** Instead, just remove the device token from your db and stop sending notifications **
     $scope.unregister = function () {
         console.log("Unregister called");
         removeDeviceToken();
         $scope.registerDisabled=false;
     }
    }]);
}());
