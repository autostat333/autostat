module.exports = function TourService($timeout)
	{


	var maxAttempts = 5;
	var attemptInterval = 1000;

	var cache = {};
	var tour_proto = $$ = {};
	$$.destroy = destroy;
	$$.go_to = go_to;
	$$.sheduling = {'attempts':0,'timeout':''};

	//tours used in isToursFinished
	var tours = [
		'general_tabs',
		'map',
		'morda',
		'params',
		'auto_avg',
		'auto_dots',
		'auto_map'
	];


	var _this = this; //chacing, because in go_to I can not get current context

	//init tour (when it is not finished and not existed in cache)
	this.init = function(tour_name,steps)
		{
		var state = window.localStorage.getItem(tour_name+'_end')=='yes';
		var cur_step = window.localStorage.getItem(tour_name+'_current_step');


		//initialize object for tour
        //because event if tour ended or not init
        // destroy in controller and go_to etc methods must be existed
        if (!cache[tour_name])
            {
            cache[tour_name] = Object.create(tour_proto);
            cache[tour_name]['steps'] = steps;
            cache[tour_name]['name'] = tour_name;
            cache[tour_name]['tour'] = '';
            this.dropSchedulingCounter(tour_name);
            }


        //check whether all elements are visible
		if (!this.stepsIsVisible(steps,cur_step)&&!state)
			{
			this.scheduleInit(tour_name,steps);
            return cache[tour_name];
			}


        //init tour
        var tr = cache[tour_name]['tour'] = new Tour({'name':tour_name});
        //add steps
        for (var i=0;step=cache[tour_name]['steps'][i++];)
            {
            tr.addStep(step);
            }
        if (!state) //tour is not finished
            {
            tr.init();
            tr.start();
            }
		return cache[tour_name];
		};

	this.getTours = function()
		{
		return cache;
		};


	this.dropSchedulingCounter = function(tour_name)
        {
        cache[tour_name]['attempts'] = 0;
        cache[tour_name]['timeout'] = '';
        }

	this.stepsIsVisible = function(steps,currentStep)
		{
		//check only first step, because in some sections (auto=>dots)
		//some card are not visible till dots will have clicked

		//if currentStep has been taken from local storage - use this step for checks
		//if current step is false - use the first step

		currentStep = !currentStep?0:currentStep;
		var el = steps[currentStep];
		if ((el_ = $(el.element)).is(':hidden')||!el_.length)
			return false;

		return true;
        }


	this.scheduleInit = function(tour_name,steps)
		{
        //if no steps passed - try to get it from cacheQueue
        //because it maybe sheduleInit from go_to
        //and previously it may tried init but without success
        if (!steps)
            steps = cache[tour_name]['steps'];

		if (cache[tour_name]['attempts']>=maxAttempts)
			{
			this.dropSchedulingCounter(tour_name);
			return false;
			}


		cache[tour_name]['attempts'] +=1;
		cache[tour_name]['timeout'] = $timeout(function(_this)
			{
			this.init(tour_name,steps)
			}.bind(this),attemptInterval);

		};


	//used in main.js to determine what to show in modal
	this.isToursFinished = function()
		{

		var res = [];
		for (var i=0;tour=tours[i++];)
			{
			if (window.localStorage.getItem(tour+'_end')=='yes')
				{
				res.push(true);
				}
			}
		if (tours.length!=res.length)
			return false;
		else
			return true;

		}


	this.startTours = function()
		{

		for (var i=0;tour=tours[i++];)
			{
			window.localStorage.removeItem(tour+'_end');
			window.localStorage.removeItem(tour+'_current_step');
			}
		}

	this.stopTours = function()
		{
		for (var i=0;tour=tours[i++];)
            {
			window.localStorage.setItem(tour+'_end','yes');
            }
		}


	//below methods fot tour object, which returns in answer to controller
	function destroy()
		{
		//if tour existed in scheduling to timeout
		if (cache[this.name])
			$timeout.cancel(cache[this.name]['timeout']);

		_this.dropSchedulingCounter(this.name);

		var el = $('div.popover.tour-'+this.name);
		if (el.length)
			el.remove();
		}


	function go_to(num_step)
		{
		var state = window.localStorage.getItem(this.name+'_end')=='yes';

		//tour is ended
		if (state) return false;

		if (!this['tour'])
			{
			_this.sheduleInit(this.name);
			return false;
			}

		var tour = this['tour'];
		if (tour.getCurrentStep()<=num_step)
			{
			tour.goTo(num_step);
			}
		}

	}

module.exports.$inject = ['$timeout'];