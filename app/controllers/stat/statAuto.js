module.exports = function StatAutoCntr($scope,$timeout)
	{

	$scope.init = init;
	$scope.init_tabs = init_tabs;	
	$scope.switch_tab = switch_tab;

	$scope.init();


	function init()
		{
		$scope.init_tabs();

		$scope.myspinner = {};
		$scope.myspinner['is'] = true;


		$timeout(function(){$scope.myspinner['is'] = false},3000);
		$scope.sub_tab = 'avarage_table';
		}





	function init_tabs()
		{
		$timeout(function()
			{
			$scope.tabs = $('.stat_auto .tabs');
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
		var el = $scope.tabs.find('a')[idx];
		$(el).trigger('click');
		}



	}

module.exports.$inject = ['$scope','$timeout'];