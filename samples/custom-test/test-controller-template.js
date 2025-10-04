app.controller('LoginCtrl', function($scope) {
    $scope.username = '';
    $scope.password = '';
    $scope.login = function() {
        console.log("Logging in");
    };
});
