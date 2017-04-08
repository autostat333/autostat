module.exports = function StatGeneralCntr($scope,$timeout)
	{
	
	$scope.init = init;
	$scope.init_tabs = init_tabs;
	$scope.switch_tab = switch_tab;


	$scope.init();

	function init()
		{
		$scope.init_tabs();
		$scope.sub_tab = 'orders';
		$scope.myspinner = {};
		$scope.myspinner['is'] = true;
		}




	function init_tabs()
		{
		$timeout(function()
			{
			$scope.tabs = $('.stat_general .tabs');
			$scope.tabs.tabs();

			//switch off global spinner
			$timeout(function()
				{
				$('#global_spinner').removeClass('on');
				$('#global_spinner').removeClass('on_half');
				$('#global_spinner').addClass('off');
				})
			})
		}


	function switch_tab(section,idx)
		{
		$timeout(function(){$scope.sub_tab = section},0);
		$scope.myspinner['is'] = true;
		//$scope.sub_tab = section
		var el = $scope.tabs.find('a')[idx];
		//$scope.tabs.tabs('select_tab',2);
		//debugger;
	
		$(el).trigger('click');
		//debugger;
		var content = $('.sub_window div')[idx];
		}

	}

module.exports.$inject = ['$scope','$timeout'];