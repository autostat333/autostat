module.exports = function StatCntr($scope,$timeout,backend,$filter,tour)
	{
	
	$scope.init = init;
	$scope.init_select = init_select;
	$scope.init_selected = init_selected;
	$scope.init_year_race = init_year_race;
	$scope.init_tour = init_tour;
	$scope.disable_btn = disable_btn;
	$scope.add_to_bar_wish = add_to_bar_wish;
	$scope.add_to_bar_have = add_to_bar_have;
	$scope.init_tabs = init_tabs;
	$scope.switch_tab_to = switch_tab_to;
	$scope.remove_tab = remove_tab;
	$scope.on_resize = on_resize; //recalculate size of tabs (with name of cars)


	$scope.init();



	//watchers for have tab
	$scope.$watch('selected_have["mark"]["value"]',watcher_mark_have)
	$scope.$watch('selected_have["model"]["value"]',watcher_model_have)
	
	//watchers for wish tab
	$scope.$watch('selected_wish["mark"]["value"]',watcher_mark_wish)
	$scope.$watch('selected_wish["model"]["value"]',watcher_model_wish)

	require('./transformData.js')($scope,$filter);


	$scope.$on('$destroy',function()
		{
		$(window).off('resize',$scope.on_resize);
		if ($scope.tour&&$scope.tour.destroy)
			$scope.tour.destroy();
		})

	function init()
		{


		$scope.init_selected();
		$scope.init_year_race();

		//a bit add transparency
		//switching oof spinner ocur from general or auto stat
		$('#global_spinner').addClass('on_half');
		$scope.show = true;


		//TODO !!! WRITE CANCEL
		$(window).on('resize',$scope.on_resize);

		//get ACTUAL DATE
		backend.getActualDate().then(function(resp)
			{
			$scope.ACTUAL_DATE = resp[0]['date'];
			//get MARKS
			backend.getMarks($scope.ACTUAL_DATE).then(function(res)
				{
				$scope.transform_marks(res);
				$scope.init_tabs();
				$scope.init_select();
                $scope.init_tour();
				//$('#global_spinner').addClass('on_half');
				$scope.show = true;
				})
			})

		}



		//initialize dropdown for year and select
	function init_select()
		{
		$('.morda ul').tabs();
		$scope.on_resize();
		}



	function init_year_race()
		{
		$scope.years = [];
		for (var i=2016;i>1959;i=i-1)
			{
			$scope.years.push(i);
			}
		$scope.race_buckets = ['0-10','10-30','30-50','50-70','70-100','100-120','120-150','150-200','200-250','250-300','300-400','400-500','500+'];

		//for default values
		$scope.years.unshift('Choose...');
		$scope.race_buckets.unshift('Choose...');

		//set default values to apply special styles for non selected input
		$scope.selected_have['year'] = 'Choose...';
		$scope.selected_have['race_bucket'] = 'Choose...';
		}


		//create empty selected objects (value and name Select one mo...)
		//selected_have and selected_wish for two tabs respectively
	function init_selected(param)
		{
		if (param===undefined)
			{
			$scope.selected_have = {};
			$scope.selected_wish = {};
			$scope.marks = [];

			$scope.selected_wish['mark'] = {};
			$scope.selected_wish['model'] = {};

			$scope.selected_have['mark'] = {};
			$scope.selected_have['model'] = {};

			}

		if (param===undefined||param==='wish')
			{
			$scope.selected_wish['mark']['name'] = 'Select one mark...'
			$scope.selected_wish['mark']['value'] = '0';

			$scope.selected_wish['model']['name'] = 'Select one mark...'
			$scope.selected_wish['model']['value'] = '0';
			//$('.i_wish select.mark.chosen-select.i_wish_tab').val('0');
			//$('.i_wish select.model.chosen-select.i_wish_tab').val('0');
			//models different for have and wish becaus it can be different marks selected
			$scope.models_wish = [];
			}

		if (param===undefined||param==='have')
			{
			$scope.selected_have['mark']['name'] = 'Select one mark...'
			$scope.selected_have['mark']['value'] = '0';

			$scope.selected_have['model']['name'] = 'Select one mark...'
			$scope.selected_have['model']['value'] = '0';
			$scope.models_have = [];  

			$scope.selected_have['year'] = '';
			$scope.selected_have['race_bucket'] = '';

			}
	

		}



	function init_tabs()
		{ 
		//get tabs from localstorage
		var t = window.localStorage.getItem('tabs');
		$scope.tabs = typeof(t)!='string'?[]:angular.fromJson(t);		

		var def_general = {'id':'general','type':'general','mark':{'name':$filter('translate')('General')},'model':{'name':''}};

		if ($scope.tabs.length==0)
			//push default and constant tab GENERAL
			$scope.tabs.push(def_general);

		//active_tab is another param for set active class for tabs
		//selected_tab is changing throught the timeout, but active_tab - is at once
		//tab active class aplies at once, and only then - updating view
		$scope.selected_tab = def_general;
		$scope.active_tab = def_general;

 
		} 


	function init_tour()
		{
		$scope.tour = tour.init('morda',[
			{
			'element':'#tour_morda','content':$filter('translate')('You can select some MAKE and MODEL, then press "Add to Bar". This will add new TAB to TAB BAR below with details about this car (prices, trends etc.)'),'placement':'top'},
            {'element':'#tour_tour_button','content':$filter('translate')('You can click on button and Switch OFF tour on every section!'),'placement':'bottom'},
            {'element':'#tour_tab_bar','content':$filter('translate')('Here is a collection of your TABS with cars which you have chosen.'),'placement':'top'},
			]);
		}


	function switch_tab_to(obj)
		{
		$scope.active_tab = obj;
		$timeout(function(){$scope.selected_tab = obj},0);
		}



	function watcher_mark_wish(new_val,old_val)
		{
		if (new_val==undefined||new_val==''||new_val=='0')
			return false;
		//find new mark object to place it into selected object
		var obj = $scope.marks.filter(function(el){return el['value'].toString()==new_val});
		if (obj.length==0)
			obj = $scope.marks_top.filter(function(el){return el['value'].toString()==new_val});
		$scope.selected_wish['mark'] = $.extend(true,{},obj[0]);
		$scope.models_wish = $scope.models.filter(function(el){return el['markId']===obj[0]['value']});

		$scope.selected_wish['model']['value'] = '0';
		$scope.selected_wish['model']['name'] = 'Select';
		}

	function watcher_model_wish(new_val,old_val)
		{
		if (new_val==undefined||new_val=='0'||$scope.models===undefined){return false}
		var obj = $scope.models_wish.filter(function(el){return el['value']==new_val});
		$scope.selected_wish['model'] = $.extend(true,{},obj[0]);
		}


	function watcher_mark_have(new_val,old_val)
		{
		if (new_val==undefined||new_val==''||new_val=='0')
			return false;
		//find new mark object to placae it into selected object
		var obj = $scope.marks.filter(function(el){return el['value'].toString()==new_val});
		if (obj.length==0)
			obj = $scope.marks_top.filter(function(el){return el['value'].toString()==new_val});
		$scope.selected_have['mark'] = $.extend(true,{},obj[0]);
		$scope.models_have = $scope.models.filter(function(el){return el['markId']===obj[0]['value']});

		$scope.selected_have['model']['value'] = '0';
		$scope.selected_have['model']['name'] = 'Select';
		}

	function watcher_model_have(new_val,old_val)
		{
		if (new_val==undefined||new_val=='0'||$scope.models===undefined){return false}
		var obj = $scope.models_have.filter(function(el){return el['value']==new_val});
		$scope.selected_have['model'] = $.extend(true,{},obj[0]);
		}


	function disable_btn(kind)
		{

		if (kind==='wish')
			{
			var mk = $scope.selected_wish['mark']['value'];
			var md = $scope.selected_wish['model']['value'];
			return (mk=='0'||md=='0')?true:false;;
			}
		if (kind==='have')
			{
			var mk = $scope.selected_have['mark']['value'];
			var md = $scope.selected_have['model']['value'];
			var yr = $scope.selected_have['year'];
			var race = $scope.selected_have['race_bucket'];
			return (mk=='0'||md=='0'||yr=='Choose...'||race=='Choose...')?true:false;;
			}


		}

	function add_to_bar_wish()
		{
			//check on completted fields
		if ($scope.disable_btn('wish'))
			{
			Materialize.toast($filter('translate')('Some parametrs not selected!'), 3000)
			return false;		
			}

			//check on max tabs
		if ($scope.tabs.length>9)
			{
			Materialize.toast('You can add only 9 tabs!', 3000)
			return false;		
			}

			//check on existed mark
		var tmp = $scope.tabs.filter(function(el){return el['model']['value']==$scope.selected_wish['model']['value']});
		if (tmp.length!=0)
			{
			Materialize.toast($filter('translate')('This mark and model added yet!'), 3000)
			return false;
			}

		//COMPLETE object
		$scope.selected_wish['id'] = Math.round(Math.random()*100)+'_'+(new Date()).getTime().toString();
		$scope.selected_wish['type'] = 'auto_wish';
		//put to localstorage and tabs
		$scope.tabs.push($.extend(true,{},$scope.selected_wish));
		window.localStorage.setItem('tabs',angular.toJson($scope.tabs));
		$scope.init_selected('wish'); //drop to init state selected object
		//$scope.selected_tab = $scope.tabs[$scope.tabs.length-1];
		$scope.switch_tab_to($scope.tabs[$scope.tabs.length-1]);
		//resize tab bar
		$scope.on_resize();

		$scope.tour.go_to(1);
		}


	function add_to_bar_have()
		{
		if ($scope.disable_btn('have'))
			{
			Materialize.toast('Some parametrs not selected!', 4000)
			return false;				
			}
		//COMPLETE object
		$scope.selected_have['id'] = Math.round(Math.random()*100)+'_'+(new Date()).getTime().toString();
		}

	function remove_tab(tab,e)
		{
		if (!e){e = window.event}
		e.stopPropagation();

		$("[li-tab="+tab['id']+"]").fadeOut('fast',function()
			{
			$scope.tabs = $scope.tabs.filter(function(el){return el['id']!=tab['id']});
			window.localStorage.setItem('tabs',angular.toJson($scope.tabs));

			//select last tab or closer tab
			for (var each in $scope.tabs)
				{
				if ($scope.tabs[each]['id']==$scope.selected_tab['id'])
					{
					var obj=$scope.tabs[each];
					}
				}
			if (obj===undefined)
				$scope.switch_tab_to($scope.tabs[$scope.tabs.length-1]);
				//$scope.selected_tab = $scope.tabs[$scope.tabs.length-1];
			//else
			//	$scope.selected_tab = $scope.selected_tab;			

			$scope.$apply();			
			})
		}



	function on_resize(e)
		{
		var width = window.innerWidth;

		if ($scope.tabs===undefined||$scope.tabs.length===0)
			var tab_width = 150;
		else
			var tab_width = parseInt(width*0.9/$scope.tabs.length)-40;

		$scope.tab_width = tab_width>150?150:tab_width;
		$scope.tab_width = $scope.tab_width<50?50:$scope.tab_width;
		$scope.tab_width = $scope.tab_width+'px';
		if (!$scope.$$phase)
			$scope.$apply();

		}


	}

module.exports.$inject = ['$scope','$timeout','backend','$filter','tour'];