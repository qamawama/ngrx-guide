app.controller('LoginCtrl', function($scope) {
    $scope.username = '';
    $scope.password = '';
    $scope.status = '';
    $scope.role = '';
    $scope.lastLogin = '';
    $scope.attempts = '';

    $scope.login = function() {
        console.log("Logging in");
    };
});
