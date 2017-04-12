module.exports = function Controllers($scope)
	{


	$scope.init = init;

	//init mobile menu
	$('.button-collapse').sideNav();

	$scope.init();

	function init()
		{

		}


	}


module.exports.$inject = ['$scope'];
