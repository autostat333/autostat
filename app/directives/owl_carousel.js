module.exports = function owlCarouse($filter)
	{
	return {
		scope:{
			'date':'=date',
			'first_load_finished':'='
			},
		link:function(scope,elem,attrs)
			{


			scope.init = init;
			scope.get_all_days = get_all_days;
			scope.compile_carousel = compile_carousel;
			scope.init_owl = init_owl;
			scope.select_day = select_day;
			scope.compile_date = compile_date;
			scope.set_callback = set_callback;

			scope.init();

			//watch for date changing
			//it can be from selecting another month or year
			scope.$watch('date',watcher_date_change,true);
			scope.$watch('first_load_finished',set_callback);


			function init()
				{

				scope.days = [];

				scope.week_days = ['Sun','Mon','Tue','Wed','Thy','Fri','Sat'];
				//translate week days
				scope.week_days = scope.week_days.map((x)=>{return $filter('translate')(x)});


				scope.carousel = $(elem[0]);
				scope.init_owl();
				//scope.get_all_days(2016,11);
				}



	        //INIT CAROUSEL CONFIG
	        function init_owl()
	        	{
		        scope.carousel.owlCarousel({
	                animateOut: 'slideOutDown',
	                animateIn: 'flipInX',
	                //items:7,
	                margin:0,
	                stagePadding:0,
	                navSpeed:450,
	                slideBy:7,
	                navSpeed:100,
	              //  onResize:function(){console.log('resize')},
	              //  onRefresh:function(){console.log('refresh')},
	            	//startPosition:8,
	                responsive:
	                	{
	                    0:{items:2},
	                    350:{items:3},
	                    500:{items:3},
	                    800:{items:4},
	                    950:{items:5},
	                    1300:{items:7},
	                	}
		            });
		        //set callback on change to retrive number of items per slide
		        //for calculation number of slide with current day
		        //then - listenner will be switched off
	        	}

		    function get_all_days()
		        {
	        	var year = scope.date['year'];
	        	var month = scope.date['month'];
		        scope.days = [];
		        var d = new Date(year,month,1);

		        while (d.getMonth()===month)
		            {
		            var tmp = {};
		            tmp['weekDay'] = d.getDay();
		            tmp['day'] = d.getDate();
		            tmp['year'] = year;
		            scope.days.push(tmp);
		            d.setDate(d.getDate()+1);
		            };
		        scope.compile_carousel();
		        };


		        //compile template for owl carousel
		        //param - undefined or some text
		        //some text - it is calling from wathcer and because of click on dropdown
		        //means - changing of month or year
		        //then - choose 1-st day
		    function compile_carousel(param)
		        {
		        var data = '';
		        var day = !param?scope.date['day']-1:0; //set current day if init pie
		        for (var each in scope.days)
		            {
		            var obj = scope.days[each];
		            var week_end = obj['weekDay']==0||obj['weekDay']==6?'weekend':'';
		            var active = each==day?'active':'';
		            data = data+'<div day_number="'+each+'" class="day '+week_end+' '+active+'"><div>'+scope.week_days[obj["weekDay"]]+'</div><div>'+obj["day"]+'</div><div>'+obj["year"]+'</div></div>';
		            }

		        scope.carousel.fadeOut(200,function(){scope.carousel.fadeIn(400)});
		        scope.carousel.trigger('replace.owl.carousel',data);
		        scope.carousel.trigger('refresh.owl.carousel');
		        //set on click event
		        scope.carousel.find('.day').on('click',scope.select_day);
		        }

		        //for dropdown
		        //$('select').material_select();


	        //on changing date - send request for new date
	        function watcher_date_change(new_val,old_val)
	        	{
        		if (new_val==undefined)
    				return false;

    			//this is only for initialization, because new and old are equal
    			if (angular.equals(new_val,old_val))
    				{
					scope.get_all_days();
					return false;
    				}

    			//month or year changned from dropdown
    			if (new_val['month']!=old_val['month']||new_val['year']!=old_val['year'])
    				{
					scope.date['day'] = 1;
					scope.compile_date('from_dropdown');
					scope.get_all_days();
    				}
	        	}

        	function compile_date()
        		{
    			var mm = (scope.date['month']+1).toString();
    			mm = mm.length==1?'0'+mm:mm;

    			var dd = scope.date['day'].toString();
    			dd = dd.length==1?'0'+dd:dd;

    			scope.date['date'] = scope.date['year']+'-'+mm+'-'+dd;

        		}

            function select_day()
        		{
				var num = $(this).attr('day_number');
		        scope.carousel.find('.day').each(function(idx,el){$(el).removeClass('active')});
		        scope.carousel.find('.day').eq(num).addClass('active');
		        scope.date['day'] = parseInt(num)+1;
		        scope.compile_date();
		        scope.$apply();
		        }



	        function set_callback(new_val)
	        	{
        		function get_items(e)
        			{
    				var items = e.page.size;
    				//calc number of page with current day
    				scope.carousel.trigger('to.owl.carousel',parseInt((scope.date['day']-1)/items));
					scope.carousel.off('changed.owl.carousel',get_items);
        			}

    			scope.carousel.on('changed.owl.carousel',get_items);
	        	}


			}

	}

	}

module.exports.$inject = ['$filter'];