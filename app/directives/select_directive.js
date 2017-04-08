module.exports = function SelectDirective($parse,$timeout)
	{
	return {
		scope:true,
		link:function(scope,elem,attrs)
			{

			scope.init = init;
			scope.select_value = select_value;

			scope.init();

			function init()
				{
				scope.model_fn = $parse(attrs['selectModel']);
				$timeout(function()
					{
					$(elem).material_select();
					$(elem).on('change',scope.select_value);
					},0);
				}

			function select_value(e)
				{
				if (!e){e = window.event}
				var new_val = e['target']['value'];
				scope.model_fn.assign(scope,new_val);
				scope.$apply();
				}

			}

		}	


	}



module.exports.$inject = ['$parse','$timeout'];