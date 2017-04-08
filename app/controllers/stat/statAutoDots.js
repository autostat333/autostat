module.exports = function StatGeneralCntrParams($scope,$q,backend,$timeout,$filter,$rootScope)
	{

	$scope.init = init;
	$scope.get_adverts = get_adverts;
	$scope.transform_for_chart = transform_for_chart;
	$scope.reset = reset;
	$scope.select_advert = select_advert;
	$scope.init_adverts = init_adverts;
	$scope.hide_card = hide_card;
	$scope.show_card = show_card;


	$scope.init();

	$scope.$watch('params',get_adverts,true);
	
	function init()
		{	
		$scope.params = {};
		$scope.params['date'] = $scope.ACTUAL_DATE;
		$scope.params['modelId'] = $scope.selected_tab['model']['value'];

		$scope.DATA_adverts = [];

		
		$scope.myspinner.is = true;
		$scope.visibility = 'hidden';

		$scope.init_adverts();

		$scope.get_adverts();

		}



	function init_adverts()
		{
		$scope.ADVERT = false;
		$scope.advert_elem = $('.card.horizontal');//elem card for show clicked advert
		}

	function get_adverts()
		{

		$scope.LAST_WATCHED = [];
		$scope.ADVERT = false;
		$scope.$parent.myspinner.is = true;

		$scope.hide_card();

		backend.getAdverts($scope.params).then(function(res)
			{
			$scope.DATA_adverts = $scope.transform_for_chart(res);
			$scope.myspinner.is = false;
			$scope.visibility = 'visible';


			$scope.DATA_adverts.sort(function(a,b)
				{
				a = parseInt(a['year']);
				b = parseInt(b['year']);

				return a<b?-1:(a>b?1:0);
				})
			})

		}



	function transform_for_chart(d)
		{
		for (var i=0;el = d[i];i++)
			{
			el['raceDot'] = parseInt(el['raceOrg']);
			el['raceDot'] = el['raceDot']>1000?parseInt(el['raceDot']/1000):el['raceDot'];
			el['raceDot'] = el['raceDot']<0?0:el['raceDot'];

			}


		return d;

		}


	function reset()
		{
		$rootScope.$broadcast('reset.dots');
		$scope.LAST_WATCHED = [];
		$scope.ADVERT = false;
		$scope.hide_card();
		}


	function hide_card()
		{
		$scope.advert_elem.stop().animate({'opacity':'0'},200,function(){$(this).css({'visibility':'hidden'})})			
		}


	function show_card()
		{
		$scope.advert_elem.stop().css({'visibility':'visible'}).animate({'opacity':'1'},200);
		}

	function select_advert(it)
		{

		$scope.hide_card();
		$timeout(function()
			{
			$scope.ADVERT = it;
			$scope.show_card();
			},300);

		}

	}

module.exports.$inject = ['$scope','$q','backend','$timeout','$filter','$rootScope'];