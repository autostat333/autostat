module.exports = function MainControllers($scope,$state,tour,$timeout,$rootScope,$q,backend)
	{


	$scope.init = init;
	$scope.menuItemClick = menuItemClick;
	$scope.tourClick = tourClick;
	$scope.openTourModal = openTourModal;
	$scope.closeTourModal = closeTourModal;
	$scope.selectLanguage = selectLanguage;
	$scope.getDict = getDict;



	//$scope.init();

	function init()
		{
		//init mobile menu
		$('.button-collapse').sideNav();

		//$scope.visibility = true;
		//set version to $rootScope

		$rootScope.version = window.version;

		$scope.getDict();
		}


		//get dictionary for translation messages from JS code
	function getDict()
		{

		if (!$rootScope.language)
			$rootScope.language = window.localStorage.getItem('language') || window.language || 'EN';


		if ($rootScope.dictionary&&$rootScope.version==$rootScope.dictionary.version
				&&$rootScope.dictionary.language==$rootScope.language)
			{
			$scope.visibility = true;
			return false;
			}

		var dictFromStorage = window.localStorage.getItem('dictionary');


		if (dictFromStorage)
			{
			dictFromStorage = JSON.parse(dictFromStorage);
			$rootScope.dictionary = dictFromStorage;
			}

		//check for version and dict in storage
		//when new dict is required
		if (!dictFromStorage||$rootScope.version!=$rootScope.dictionary.version
				||$rootScope.language!=$rootScope.dictionary.language)
			{

			backend.getDict($rootScope.language).then(function (response)
				{
				var dict = {};
				dict['version'] = $rootScope.version;
				dict['terms'] = response;
				dict['language'] = $rootScope.language;
				window.localStorage.setItem('dictionary',angular.toJson(dict));
				$rootScope.dictionary = dict;
				$scope.visibility = true;
                })

        	}
		//dictionary is existed and fresh
		else
			{
			$scope.visibility = true;
			}

		}



	function menuItemClick(where)
		{
		if ($state.current.name.indexOf(where)==0)
			{
			$(window).scrollTop(0);
			return false;
			}



		$('#global_spinner').removeClass('off').addClass('on');
		setTimeout(function()
			{
			$('.button-collapse').sideNav('hide');
			$(window).scrollTop(0);
			},200);
		}



	function tourClick()
		{
		$scope.isToursFinished = tour.isToursFinished();

		$timeout($scope.openTourModal,0);

		}

    function openTourModal()
        {
        $('#modalTour').openModal({
            dismissible: true, // Modal can be dismissed by clicking outside of the modal
            complete: $scope.closeTourModal
            });
        }

    function closeTourModal(e)
        {

		if (e.currentTarget.attributes['start-tour'])
			tour.startTours();

		if (e.currentTarget.attributes['stop-tour'])
			tour.stopTours();

		if (e.currentTarget.attributes['stop-tour']||e.currentTarget.attributes['start-tour'])
			window.location.reload();
        }


	function selectLanguage(lang)
		{
		$rootScope.language = lang;
		window.localStorage.setItem('language',lang);
		window.location.reload();
		}


	}


module.exports.$inject = ['$scope','$state','tour','$timeout','$rootScope','$q','backend'];
