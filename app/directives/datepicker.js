module.exports = function datepicker($timeout)
	{

	return {

		link:function(scope,elem,attr)
			{

			var el = $(elem);
			var elem_focus = $(attr['selectorForUnfocus']);

			scope.datepicker_ = el.pickadate({
				'selectMonths': true,
    			'selectYears': 15 ,
    			'container':'body',
    			'closeOnSelect':true,
    			'onClose':function()
    				{
					$timeout(function()
						{
						elem_focus[0].focus();
						},0)
					},
				'format':'d mmm yyyy'
				})

			scope.datepicker = scope.datepicker_.pickadate('picker');
			scope.datepicker.set('select',new Date(scope.params['date']));

			elem_focus.on('change',function()
				{
				scope.datepicker.close();
				var dt = scope.datepicker.get('select','yyyy-mm-dd');
				scope.params['date'] = dt;
				if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest')
					scope.$apply();
				})



			}

	}

	}

module.exports.$inject = ['$timeout'];