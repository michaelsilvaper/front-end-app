angular.module('starter.controllers.chat', [])


.controller('ChatCtrl', function($scope, $stateParams, $http, $window) {

    var data = [];
    var textareaDefaultText = "What’s  making me feel this way is ...";
    var textAreaCondition = null;
    
    $scope.botInitialMessageDate = null;
    $scope.initialMessages = [];
    $scope.initialOptions = [];
    $scope.showTextArea = false;
    $scope.textAreaText = textareaDefaultText;

    var req = {
        method: 'GET',
        url: 'http://localhost:3000/api/conversation/',
        headers: {
          'Content-Type': undefined,
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtaWNoYWVsQHNpbHZhcGVyLm1lNiIsImV4cCI6MTU3MjQ4ODQwOSwiaWF0IjoxNTY3MzA0NDA5fQ.5RqPnISTHQwzhX2gJvGy70iRPpZwNuKRvHBSnic30JM'
        }
    }

    function replaceAll(text, search, replacement) {
        return text.replace(new RegExp(search, 'g'), replacement);
    }

    $http(req).then(function successCallback(resp) {
        data = resp.data;
        $scope.botInitialMessageDate = (new Date()).toGMTString();
        $scope.initialMessages = data.units[0].responses;
        $scope.initialOptions = data.units[0].options;

    }, function errorCallback(response) {
        
    });

    $scope.clearTextArea = function(){
        $scope.textAreaText = "";
    }

    $scope.openTextArea = function(){
        $scope.textAreaText = textareaDefaultText;
        $scope.showTextArea = true;
    }

    $scope.closeTextArea = function(){
        $scope.textAreaText = textareaDefaultText;
        $scope.showTextArea = false;
        textAreaCondition = null;
    }

    $scope.sendTextArea = function(){
        if(eval(replaceAll(textAreaCondition.expression, "input", "\""+$scope.textAreaText+"\""))){
            var findTrue = textAreaCondition.next.filter(function filtrar(u) {
                return u.value === true;
            });

            if(findTrue && findTrue.length > 0 && findTrue[0].next) {
                $scope.closeTextArea();
                $scope.goToUnit(findTrue[0].next);
            }
    
        } else {
            var findFalse = textAreaCondition.next.filter(function filtrar(u) {
                return u.value === false;
            });

            if(findFalse && findFalse.length > 0 && findFalse[0].next) {
                $scope.closeTextArea();
                $scope.goToUnit(findFalse[0].next);
            }
        }
    }

    $scope.goToUnit = function(to){
        var nextUnit = data.units.filter(function filtrar(u) {
            return u.id == to;
        });

        if(nextUnit && nextUnit.length > 0){
            var messagesElement = angular.element(document.querySelector('.messages'));

            if(nextUnit[0].responses && nextUnit[0].responses.length > 0) {
                nextUnit[0].responses.forEach(item => {
                    messagesElement.append('<div class="message bot-message">'+item+'</div>');
                });
            }

            if(nextUnit[0].options && nextUnit[0].options.length > 0) {
                nextUnit[0].options.forEach(item => {
                    messagesElement.append($compile('<div class="button-box"><button class="button button-calm option-button" ng-click="goToUnit(item.next)">'+item.label+'</button></div>')($scope));
                });
            } else {
                if(nextUnit[0].next) {
                    $scope.goToUnit(nextUnit[0].next);
                }
            }

            if(nextUnit[0].component) {
                var type = nextUnit[0].component.type;

                switch(type){
                    case "textarea":
                        var condition = data.conditions.filter(function filtrar(u) {
                            return u.id == nextUnit[0].component.next;
                        });
                        
                        if(condition && condition.length > 0){
                            textAreaCondition = condition[0];
                        }

                        $scope.openTextArea();
                        break;
                }
            }
                        
        }
    };
});
